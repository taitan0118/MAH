/* ===== p1: tiện ích, dữ liệu mẫu, hàm tính ===== */
function pad(n){return (n<10?'0':'')+n;}
var TODAY=(function(){var d=new Date();return d.getFullYear()+'-'+pad(d.getMonth()+1)+'-'+pad(d.getDate());})();
function parse(d){var p=d.split('-');return new Date(Date.UTC(+p[0],+p[1]-1,+p[2]));}
function iso(x){return x.getUTCFullYear()+'-'+pad(x.getUTCMonth()+1)+'-'+pad(x.getUTCDate());}
function addDays(d,n){var x=parse(d);x.setUTCDate(x.getUTCDate()+n);return iso(x);}
function addMonths(d,n){var x=parse(d),day=x.getUTCDate();x.setUTCDate(1);x.setUTCMonth(x.getUTCMonth()+n);var dim=new Date(Date.UTC(x.getUTCFullYear(),x.getUTCMonth()+1,0)).getUTCDate();x.setUTCDate(Math.min(day,dim));return iso(x);}
function diff(a,b){return Math.round((parse(b)-parse(a))/86400000);}
function days(d){return diff(TODAY,d);}
function nrm(s){return String(s).normalize('NFD').replace(/[\u0300-\u036f]/g,'').replace(/đ/g,'d').toLowerCase();}
function dmy(d){var p=d.split('-');return p[2]+'/'+p[1]+'/'+p[0];}
function dm(d){var p=d.split('-');return p[2]+'/'+p[1];}
function mkey(d){return d.slice(0,7);}
function mlabel(k){var p=k.split('-');return p[1]+'/'+p[0];}
function fmt(n){return Math.round(n).toLocaleString('vi-VN')+'đ';}
function esc(s){return String(s==null?'':s).replace(/[&<>"']/g,function(c){return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c];});}
function $(id){return document.getElementById(id);}
function val(id){var e=$(id);return e?e.value.trim():'';}
function num(id){var v=parseFloat(String(val(id)).replace(/[^0-9.]/g,''));return isNaN(v)?NaN:v;}

var TYPE={tro:{n:'Nhà trọ',u:'Phòng'},mini:{n:'Chung cư mini',u:'Căn hộ'},ktx:{n:'Ký túc xá',u:'Phòng'},home:{n:'Homestay / nhà nguyên căn',u:'Phòng'}};
var IID=0,LID=0,BID=0,XID=0,TID=0,MKEY=TODAY.slice(0,7),MN=+TODAY.slice(5,7),HIST={};
var H=[];
var LS=[],INV=[],BK=[],EXP=[],INC=[],TK=[],AS={};
function hOf(id){return H.filter(function(h){return h.id===id})[0];}
function uOf(hid,id){return hOf(hid).units.filter(function(u){return u.id===id})[0];}
function monthInvoices(l,mk,seed,k){
  var h=hOf(l.hid),r=h.rate,eu=70+(seed*13)%70,wu=3+seed%4;
  var items=[['Tiền '+(l.bed?'giường '+l.bed:(h.type==='mini'?'căn hộ':'phòng')),l.rent],['Điện '+eu+' kWh'+(k>1?' (chia '+k+')':''),Math.round(eu*r.e/k)],['Nước '+wu+' m³'+(k>1?' (chia '+k+')':''),Math.round(wu*r.w/k)]];
  h.fixed.forEach(function(f){items.push([f[0],f[1]]);});
  return {id:'i'+(++IID),hid:l.hid,lease:l.id,unit:l.unit,bed:l.bed,month:mk,items:items,total:items.reduce(function(a,b){return a+b[1]},0),pay:[]};
}
function activeIn(hid,unit){return LS.filter(function(l){return l.hid===hid&&l.unit===unit&&l.on});}
var CATS_OUT=['Điện nước đầu vào','Sửa chữa','Mua sắm','Lương nhân viên','Thuế và phí','Khác'];
var DEFTPL='Kính gửi anh/chị {tên},\nBan quản lý xin thông báo khoản thanh toán {phòng}, tháng {tháng}:\n- Số tiền: {số tiền}\n- Tài khoản nhận: {tk}\n- Nội dung chuyển khoản: {phòng} {tháng}\nNếu anh/chị đã thanh toán, xin vui lòng bỏ qua tin nhắn này. Cần hỗ trợ thêm, xin liên hệ trực tiếp với chúng tôi.\nTrân trọng cảm ơn!';
var STATE={bank:{name:'',no:'',own:''},tpl:DEFTPL,lastBackup:null,demo:false};

/* ----- hàm tính ----- */
function invPaid(i){return i.pay.reduce(function(a,p){return a+p.a},0);}
function invLeft(i){return Math.max(i.total-invPaid(i),0);}
function invDone(i){return invLeft(i)===0;}
function bkTotal(b){return diff(b.inD,b.outD)*b.price;}
function bkPaid(b){return b.pay.reduce(function(a,p){return a+p.a},0);}
function bkLeft(b){return Math.max(bkTotal(b)-bkPaid(b),0);}
function leasesOf(hid,on){return LS.filter(function(l){return l.hid===hid&&(on===undefined||l.on===on)});}
function invsOf(hid){return INV.filter(function(i){return i.hid===hid});}
function debtOfLease(id){return INV.filter(function(i){return i.lease===id}).reduce(function(a,i){return a+invLeft(i)},0);}
function owedOf(hid){
  if(hOf(hid).type==='home')return BK.filter(function(b){return b.hid===hid&&b.st!=='cancel'}).reduce(function(a,b){return a+bkLeft(b)},0);
  return invsOf(hid).reduce(function(a,i){return a+invLeft(i)},0);
}
function bedsOf(h,u){var a=[],i;for(i=0;i<u.nb;i++)a.push(String.fromCharCode(65+i));return a;}
function leaseOfBed(hid,unit,bed){return LS.filter(function(l){return l.hid===hid&&l.unit===unit&&l.bed===bed&&l.on})[0];}
function unitStatus(h,u){
  if(h.type==='home'){
    var cur=BK.filter(function(b){return b.hid===h.id&&b.unit===u.id&&b.st==='in'})[0];
    if(cur)return {k:'ok',t:'Đang ở',i:'✓'};
    var ci=BK.filter(function(b){return b.hid===h.id&&b.unit===u.id&&b.st==='confirmed'&&b.inD===TODAY})[0];
    if(ci)return {k:'warn',t:'Đến hôm nay',i:'◔'};
    return {k:'idle',t:'Trống',i:'○'};
  }
  var ls=activeIn(h.id,u.id);
  if(!ls.length)return {k:'idle',t:'Trống',i:'○'};
  var debt=ls.reduce(function(a,l){return a+debtOfLease(l.id)},0);
  if(h.type==='ktx'){return {k:debt>0?'bad':'ok',t:ls.length+'/'+u.nb+' giường'+(debt>0?' · nợ':''),i:debt>0?'!':'✓'};}
  if(debt>0)return {k:'bad',t:'Nợ tiền',i:'!'};
  if(days(ls[0].end)<=30)return {k:'warn',t:'Sắp hết hạn',i:'◔'};
  return {k:'ok',t:'Đang thuê',i:'✓'};
}
function ledger(hid){
  var out=[];
  invsOf(hid).forEach(function(i){i.pay.forEach(function(p){if(p.m==='Trừ cọc')return;out.push({d:p.d,t:'thu',note:'Thu '+(i.bed?'giường '+i.unit+i.bed:'phòng '+i.unit)+' tháng '+mlabel(i.month)+' ('+p.m+')',amt:p.a});});});
  BK.filter(function(b){return b.hid===hid}).forEach(function(b){b.pay.forEach(function(p){out.push({d:p.d,t:'thu',note:'Thu đặt phòng '+b.unit+' · '+b.guest,amt:p.a});});});
  INC.filter(function(n){return n.hid===hid}).forEach(function(n){out.push({d:n.d,t:'thu',note:n.note,amt:n.amt,k:'inc',id:n.id});});
  EXP.filter(function(x){return x.hid===hid}).forEach(function(x){out.push({d:x.d,t:'chi',note:x.note+' ('+x.cat+')',amt:x.amt,k:'exp',id:x.id});});
  return out.sort(function(a,b){return b.d.localeCompare(a.d)});
}
function nextDue(h){var y=+TODAY.slice(0,4),m=+TODAY.slice(5,7),d=+TODAY.slice(8),b=h.bday||5;if(d>b){m++;if(m>12){m=1;y++;}}return y+'-'+pad(m)+'-'+pad(b);}
function msg(hid,name,what,month,amount){
  var s=STATE.tpl;
  return s.replace(/\{tên\}/g,name).replace(/\{phòng\}/g,what).replace(/\{tháng\}/g,month).replace(/\{số tiền\}/g,fmt(amount)).replace(/\{hạn\}/g,dmy(nextDue(hOf(hid)))).replace(/\{tk\}/g,bankLine());
}

function bankLine(){return STATE.bank.no?STATE.bank.name+' '+STATE.bank.no+' · '+STATE.bank.own:'(chủ nhà chưa cài tài khoản)';}
function fmtTs(t){var d=new Date(t);return pad(d.getDate())+'/'+pad(d.getMonth()+1)+'/'+d.getFullYear()+' '+pad(d.getHours())+':'+pad(d.getMinutes());}
/* ===== lưu dữ liệu trên máy: localStorage + bản dự phòng IndexedDB ===== */
var KEY='mah-data-v1',PERR=false;
function dump(){return {v:1,at:Date.now(),hid:S.hid,H:H,LS:LS,INV:INV,BK:BK,EXP:EXP,INC:INC,TK:TK,AS:AS,HIST:HIST,STATE:STATE,ids:{IID:IID,LID:LID,BID:BID,XID:XID,TID:TID}};}
function validData(d){return !!d&&d.v===1&&['H','LS','INV','BK','EXP','INC','TK'].every(function(k){return Array.isArray(d[k]);})&&d.H.every(function(h){return h&&h.id&&Array.isArray(h.units)&&h.rate&&Array.isArray(h.fixed);});}
function adopt(d){
  H=d.H;LS=d.LS;INV=d.INV;BK=d.BK;EXP=d.EXP;INC=d.INC;TK=d.TK;AS=d.AS||{};HIST=d.HIST||{};
  var i=d.ids||{};IID=i.IID||0;LID=i.LID||0;BID=i.BID||0;XID=i.XID||0;TID=i.TID||0;
  var s=d.STATE||{};STATE={bank:s.bank||{name:'',no:'',own:''},tpl:s.tpl||DEFTPL,lastBackup:s.lastBackup||null,demo:!!s.demo};
  S.hid=(hOf(d.hid)||H[0]||{}).id||'';
}
function persist(){
  try{localStorage.setItem(KEY,JSON.stringify(dump()));PERR=false;}
  catch(e){if(!PERR){PERR=true;warn('Không lưu được dữ liệu vào máy (bộ nhớ đầy hoặc bị chặn). Hãy sao lưu ra file ngay.');}}
}
function loadSaved(){
  var raw;try{raw=localStorage.getItem(KEY);}catch(e){return false;}
  if(!raw)return false;
  try{var d=JSON.parse(raw);if(!validData(d))throw 0;adopt(d);return true;}
  catch(e){try{localStorage.setItem(KEY+'-hong',raw);}catch(x){}return 'corrupt';}
}
function idb(){return new Promise(function(res,rej){var r=indexedDB.open('mah-snaps',1);r.onupgradeneeded=function(){r.result.createObjectStore('s',{keyPath:'at'});};r.onsuccess=function(){res(r.result);};r.onerror=function(){rej(r.error);};});}
function snap(tag){
  return idb().then(function(db){return new Promise(function(res){
    var t=db.transaction('s','readwrite'),s=t.objectStore('s');s.put({at:Date.now(),tag:tag||'tự động',data:JSON.stringify(dump())});
    s.getAll().onsuccess=function(e){e.target.result.sort(function(x,y){return y.at-x.at;}).slice(8).forEach(function(x){s.delete(x.at);});};
    t.oncomplete=function(){res(true);};t.onerror=function(){res(false);};});}).catch(function(){return false;});
}
function snapList(){return idb().then(function(db){return new Promise(function(res){db.transaction('s').objectStore('s').getAll().onsuccess=function(e){res(e.target.result.sort(function(x,y){return y.at-x.at;}));};});}).catch(function(){return [];});}
