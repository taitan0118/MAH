/* ===== p3: hóa đơn, chốt số, thu tiền, nhắc ===== */
function invStatus(i){var p=invPaid(i);if(invDone(i))return '<span class="pill s-ok"><i>✓</i>Đã thu</span>';if(p>0)return '<span class="pill s-warn"><i>◔</i>Thu một phần</span>';return '<span class="pill s-bad"><i>!</i>Chưa thu</span>';}
function bills(){
  var h=cur(),f=S.f.bills,all=invsOf(h.id),ys=[TODAY.slice(0,4)];
  all.forEach(function(i){var y=i.month.slice(0,4);if(ys.indexOf(y)<0)ys.push(y);});ys.sort().reverse();
  var q=nrm(S.q.trim()),Y=S.f.byear,M=S.f.bmon;
  var base=all.filter(function(i){
    if(Y!=='all'&&i.month.slice(0,4)!==Y)return false;if(M!=='all'&&i.month.slice(5)!==M)return false;
    if(q){var l=LS.filter(function(x){return x.id===i.lease})[0];if((nrm(l?l.t.name:'')+' '+nrm(i.unit+(i.bed||''))).indexOf(q)<0)return false;}
    return true;});
  var nu=base.filter(function(i){return !invDone(i)}).length,np=base.length-nu;
  var list=base.filter(function(i){return f==='all'||(f==='unpaid'?!invDone(i):invDone(i))}).sort(function(a,b){return b.month.localeCompare(a.month)||a.unit.localeCompare(b.unit)});
  var chip=function(v,t){return '<button class="chip" type="button" data-act="bfilter" data-v="'+v+'" aria-pressed="'+(f===v)+'">'+t+'</button>';};
  var o='<h1>Hóa đơn</h1><input class="in search" id="q" data-act="search" placeholder="Tìm theo tên khách hoặc phòng" value="'+esc(S.q)+'" aria-label="Tìm hóa đơn">';
  o+='<div class="fgrid" style="margin:0 0 10px">'+sel('byear','Năm',[['all','Mọi năm']].concat(ys.map(function(y){return [y,'Năm '+y]})),Y)+sel('bmon','Tháng',[['all','Mọi tháng']].concat([1,2,3,4,5,6,7,8,9,10,11,12].map(function(m){return [pad(m),'Tháng '+m]})),M)+'</div>';
  o+='<div class="chips">'+chip('unpaid','Chưa thu ('+nu+')')+chip('paid','Đã thu ('+np+')')+chip('all','Tất cả ('+base.length+')')+'</div>';
  if(!all.length)return o+'<div class="empty">Chưa có hóa đơn. Bấm “Chốt điện nước” ở Tổng quan để tạo.</div>';
  if(!list.length)return o+'<div class="empty">Không tìm thấy hóa đơn phù hợp bộ lọc.<div class="acts" style="justify-content:center"><button class="btn sm" data-act="bclear" type="button">Xóa bộ lọc</button></div></div>';
  var left=list.reduce(function(a,i){return a+invLeft(i)},0);
  return o+'<p class="demo" style="margin:0 0 10px">'+list.length+' hóa đơn · còn phải thu '+fmt(left)+'</p><div class="list">'+list.map(function(i){var l=LS.filter(function(x){return x.id===i.lease})[0];
    return '<div class="row"><span class="rn">'+esc(i.unit+(i.bed||''))+'</span><button class="mid linkbtn" data-act="inv" data-id="'+i.id+'" type="button"><b>'+esc(l?l.t.name:'')+'</b><small>Tháng '+mlabel(i.month)+(invPaid(i)>0&&!invDone(i)?' · đã thu '+fmt(invPaid(i)):'')+'</small></button><span class="amt">'+fmt(invDone(i)?i.total:invLeft(i))+'</span>'+(invDone(i)?invStatus(i):'<button class="btn sm primary" data-act="payinv" data-id="'+i.id+'" type="button">Thu tiền</button>')+'</div>';}).join('')+'</div>';
}
function invSheet(id){
  var i=INV.filter(function(x){return x.id===id})[0],l=LS.filter(function(x){return x.id===i.lease})[0];
  return head('Hóa đơn '+esc(i.bed?'giường '+i.unit+i.bed:'phòng '+i.unit),'Tháng '+mlabel(i.month)+' · '+esc(l?l.t.name:'')+' '+invStatus(i))+
   '<div class="inv">'+i.items.map(function(x){return '<div class="ln"><span>'+esc(x[0])+'</span><span>'+(x[1]<0?'-':'')+fmt(Math.abs(x[1]))+'</span></div>'}).join('')+'<div class="ln tot"><span>Tổng</span><span>'+fmt(i.total)+'</span></div>'+(invPaid(i)>0?'<div class="ln"><span>Đã thu</span><span>'+fmt(invPaid(i))+'</span></div><div class="ln"><b>Còn lại</b><b>'+fmt(invLeft(i))+'</b></div>':'')+
   '<div style="text-align:center;font-size:12.5px;color:var(--soft);margin-top:6px">Chuyển khoản: '+esc(bankLine())+'<br>Nội dung CK: '+esc(i.unit+(i.bed||''))+' T'+i.month.slice(5)+'</div></div>'+
   '<div class="acts">'+(invDone(i)?'':'<button class="btn primary" data-act="payinv" data-id="'+id+'" type="button">Thu tiền</button>')+'<button class="btn" data-act="share" type="button">Chia sẻ</button><button class="btn" data-act="adj" data-id="'+id+'" type="button">Giảm giá hoặc phụ thu</button></div>';
}
function adjSheet(id){openSheet(head('Giảm giá hoặc phụ thu')+'<p class="subt">Nhập số âm để giảm giá, số dương để phụ thu.</p><div class="fgrid">'+fld('anote','Lý do','',{max:40,ph:'Ví dụ: Giảm do mất nước 2 ngày'})+fld('aamt','Số tiền (đồng)','',{mode:'numeric',ph:'-100000'})+'</div><div class="acts"><button class="btn primary" data-act="adjok" data-id="'+id+'" type="button">Áp dụng</button></div>');}
function paySheet(kind,id){
  var left,title,sub;
  if(kind==='inv'){var i=INV.filter(function(x){return x.id===id})[0];left=invLeft(i);title='Thu tiền hóa đơn '+esc(i.unit+(i.bed||''));sub='Tháng '+mlabel(i.month);}
  else if(kind==='lease'){var l=LS.filter(function(x){return x.id===id})[0];left=debtOfLease(id);title='Thu tiền '+esc(lbl(l));sub=esc(l.t.name)+' · thu từ hóa đơn cũ nhất trước';}
  else{var b=BK.filter(function(x){return x.id===id})[0];left=bkLeft(b);title='Thu tiền đặt phòng '+esc(b.unit);sub=esc(b.guest);}
  openSheet(head(title,sub)+'<p class="subt">Còn phải thu: <b>'+fmt(left)+'</b></p><div class="fgrid">'+fld('pamt','Số tiền thu (đồng)',left,{mode:'numeric'})+sel('pm','Hình thức',[['Tiền mặt','Tiền mặt'],['Chuyển khoản','Chuyển khoản']],'Tiền mặt')+fld('pd','Ngày thu',TODAY,{type:'date'})+'</div><div class="acts"><button class="btn primary" data-act="payok" data-kind="'+kind+'" data-id="'+id+'" type="button">Ghi nhận</button></div>');
}
function payOk(kind,id){
  var a=num('pamt'),m=val('pm'),d=val('pd');
  if(isNaN(a)||a<=0){warn('Nhập số tiền lớn hơn 0');return;}
  if(!d){warn('Chọn ngày thu');return;}
  if(d>TODAY){warn('Ngày thu không được ở tương lai');return;}
  if(a>1e10){warn('Số tiền quá lớn');return;}
  if(kind==='inv'){var i=INV.filter(function(x){return x.id===id})[0];if(a>invLeft(i)){warn('Số tiền lớn hơn phần còn lại');return;}i.pay.push({d:d,a:a,m:m});}
  else if(kind==='lease'){if(a>debtOfLease(id)){warn('Số tiền lớn hơn tổng nợ');return;}var rest=a;INV.filter(function(x){return x.lease===id&&!invDone(x)}).sort(function(p,q){return p.month.localeCompare(q.month)}).forEach(function(x){if(rest<=0)return;var t=Math.min(rest,invLeft(x));x.pay.push({d:d,a:t,m:m});rest-=t;});}
  else{var b=BK.filter(function(x){return x.id===id})[0];if(a>bkLeft(b)){warn('Số tiền lớn hơn phần còn lại');return;}b.pay.push({d:d,a:a,m:m});}
  closeSheet();toast('Đã ghi nhận thu '+fmt(a));render();
}
/* chốt điện nước */
function chotUnits(h){return h.units.filter(function(u){return activeIn(h.id,u.id).length});}
function chotCalc(h,u){
  var c=S.chot[u.id]||{},e=parseFloat(c.e),w=parseFloat(c.w),eok=!isNaN(e),wok=!isNaN(w),eu=eok?e-u.e:0,wu=wok?w-u.w:0,bad=(eok&&eu<0)||(wok&&wu<0);
  var ls=activeIn(h.id,u.id),k=h.type==='ktx'?ls.length:1,fixed=h.fixed.reduce(function(a,f){return a+f[1]},0);
  var tot=ls.reduce(function(a,l){return a+l.rent+fixed+(eok&&eu>=0?Math.round(eu*h.rate.e/k):0)+(wok&&wu>=0?Math.round(wu*h.rate.w/k):0)},0);
  return {eok:eok,wok:wok,eu:eu,wu:wu,bad:bad,tot:tot,k:ls.length,ready:eok&&wok&&!bad};
}
function chotDone(h,u){return activeIn(h.id,u.id).every(function(l){return INV.some(function(i){return i.lease===l.id&&i.month===MKEY})});}
function calcText(h,u){
  var c=chotCalc(h,u);
  if(c.bad)return '<span class="warnmsg">Số mới nhỏ hơn số cũ, kiểm tra lại</span>';
  if(!c.eok&&!c.wok)return '<span>Chưa nhập</span>';
  return '<span>Dùng '+(c.eok?c.eu:'?')+' kWh · '+(c.wok?c.wu:'?')+' m³'+(h.type==='ktx'?' · chia '+c.k+' người':'')+'</span><b>'+fmt(c.tot)+'</b>';
}
function chot(){
  var h=cur(),us=chotUnits(h),ready=us.filter(function(u){return !chotDone(h,u)&&chotCalc(h,u).ready}).length;
  var o='<h1>Chốt điện nước tháng '+MN+'</h1><p class="demo" style="margin:0 0 12px">Số cũ lấy từ lần chốt trước. Điện '+fmt(h.rate.e)+'/kWh, nước '+fmt(h.rate.w)+'/m³'+(h.fixed.length?', '+h.fixed.map(function(f){return f[0].toLowerCase()+' '+fmt(f[1])}).join(', '):'')+'.'+(h.type==='ktx'?' Điện nước mỗi phòng chia đều cho người ở.':'')+'</p><div class="acts" style="margin:0 0 12px"><button class="btn sm" data-act="gohome" type="button">Quay lại</button></div>';
  if(!us.length)return o+'<div class="empty">Chưa có khách thuê để chốt.</div>';
  o+='<div class="tbl">'+us.map(function(u){
    var d=chotDone(h,u),v=S.chot[u.id]||{},c=chotCalc(h,u);
    if(d)return '<div class="mrow"><div class="hd"><b>'+esc(u.id)+'</b><span>'+activeIn(h.id,u.id).map(function(l){return esc(l.t.name)}).join(', ')+'</span><span class="pill s-ok"><i>✓</i>Đã chốt</span></div></div>';
    return '<div class="mrow"><div class="hd"><b>'+esc(u.id)+'</b><span>'+activeIn(h.id,u.id).map(function(l){return esc(l.t.name)}).join(', ')+'</span></div><div class="ins"><label class="f">Điện mới <em>(cũ '+u.e+')</em><input class="in'+(c.eok&&c.eu<0?' err':'')+'" inputmode="numeric" data-act="rd" data-k="e" data-id="'+esc(u.id)+'" value="'+esc(v.e!=null?v.e:'')+'" placeholder="'+u.e+'" aria-label="Điện mới '+esc(u.id)+'"></label><label class="f">Nước mới <em>(cũ '+u.w+')</em><input class="in'+(c.wok&&c.wu<0?' err':'')+'" inputmode="numeric" data-act="rd" data-k="w" data-id="'+esc(u.id)+'" value="'+esc(v.w!=null?v.w:'')+'" placeholder="'+u.w+'" aria-label="Nước mới '+esc(u.id)+'"></label></div><div class="calc" id="calc-'+esc(u.id).replace(/ /g,'_')+'">'+calcText(h,u)+'</div></div>';
  }).join('')+'</div><div style="margin-top:16px"><button class="btn primary big" id="mk" data-act="mk" type="button"'+(ready?'':' disabled')+'>Tạo hóa đơn cho '+ready+' '+(h.type==='ktx'?'phòng':'phòng')+'</button></div>';
  return o;
}
function chotMake(){
  var h=cur(),n=0,rooms=0;
  chotUnits(h).forEach(function(u){
    if(chotDone(h,u))return;var c=chotCalc(h,u);if(!c.ready)return;
    var k=h.type==='ktx'?c.k:1;rooms++;
    activeIn(h.id,u.id).forEach(function(l){
      var inv=monthInvoices(l,MKEY,0,k);
      inv.items=[[inv.items[0][0],l.rent],['Điện '+c.eu+' kWh'+(k>1?' (chia '+k+')':''),Math.round(c.eu*h.rate.e/k)],['Nước '+c.wu+' m³'+(k>1?' (chia '+k+')':''),Math.round(c.wu*h.rate.w/k)]].concat(h.fixed.map(function(f){return [f[0],f[1]]}));
      inv.total=inv.items.reduce(function(a,b){return a+b[1]},0);INV.push(inv);n++;
    });
    u.e=parseFloat(S.chot[u.id].e);u.w=parseFloat(S.chot[u.id].w);
  });
  S.chot={};S.f.bills='unpaid';S.f.byear=TODAY.slice(0,4);S.f.bmon=TODAY.slice(5,7);S.q='';toast('Đã tạo '+n+' hóa đơn cho '+rooms+' phòng');go('bills');
}
/* nhắc thu tiền */
function remindStart(ids){
  S.remind={ids:ids,i:0};remindSheet();
}
function phoneIntl(ph){return '84'+ph.replace(/\D/g,'').replace(/^0/,'');}
function isMobile(){return /Android|iPhone|iPad|iPod/i.test(navigator.userAgent);}
function copyText(t){
  if(navigator.clipboard&&navigator.clipboard.writeText)return navigator.clipboard.writeText(t).then(function(){return true;},function(){return false;});
  var a=document.createElement('textarea');a.value=t;a.style.position='fixed';a.style.opacity='0';document.body.appendChild(a);a.select();var ok=false;try{ok=document.execCommand('copy');}catch(e){}a.remove();return Promise.resolve(ok);
}
function remindMsg(l){var unp=INV.filter(function(i){return i.lease===l.id&&!invDone(i)});return msg(l.hid,l.t.name,lbl(l),unp.map(function(i){return mlabel(i.month)}).join(', '),debtOfLease(l.id));}
function remindSheet(){
  var q=S.remind;if(!q||!q.ids.length)return;
  var l=LS.filter(function(x){return x.id===q.ids[q.i]})[0],m=remindMsg(l),last=q.i>=q.ids.length-1;
  openSheet(head('Nhắc thu tiền','Khách '+(q.i+1)+'/'+q.ids.length+' · '+esc(lbl(l))+' · '+esc(l.t.ph))+'<div class="msgbox">'+esc(m)+'</div>'+
   (l.lastRemind?'<p class="subt">Lần nhắc gần nhất: '+dmy(l.lastRemind.d)+' qua '+esc(l.lastRemind.ch)+'</p>':'')+
   '<div class="acts"><button class="btn primary" data-act="send" data-ch="SMS" type="button">Gửi bằng SMS</button><button class="btn primary" data-act="send" data-ch="Zalo" type="button">Gửi bằng Zalo</button></div>'+
   '<div class="acts"><button class="btn'+(q.sent?' primary':'')+'" data-act="skip" type="button">'+(q.sent?(last?'Xong':'Đã gửi, khách tiếp theo'):(last?'Đóng':'Bỏ qua khách này'))+'</button></div>'+
   '<p class="demo">SMS mở sẵn tin nhắn, dùng được cả khi không có mạng (cần SIM). Zalo cần mạng: app chép sẵn tin nhắn, mở cuộc trò chuyện với số này, anh chị chỉ cần dán rồi gửi. Mẫu tin sửa trong Cài đặt.</p>');
}
function sendRemind(ch){
  var q=S.remind,l=LS.filter(function(x){return x.id===q.ids[q.i]})[0],m=remindMsg(l);
  var mark=function(){l.lastRemind={d:TODAY,ch:ch};q.sent=true;persist();remindSheet();};
  if(ch==='SMS'){
    if(!isMobile()){copyText(m).then(function(ok){toast(ok?'Máy tính không gửi SMS trực tiếp. Đã chép tin, dán vào điện thoại hoặc Zalo.':'Không chép được tin nhắn',!ok);if(ok)mark();});return;}
    mark();location.href='sms:'+l.t.ph.replace(/\s/g,'')+'?&body='+encodeURIComponent(m);
  }else{
    if(!navigator.onLine){warn('Zalo cần có mạng. Không có mạng thì dùng nút SMS.');return;}
    copyText(m).then(function(ok){
      toast(ok?'Đã chép tin nhắn. Dán vào Zalo rồi bấm gửi.':'Không chép được tin, hãy chép tay từ khung bên trên',!ok);
      mark();window.open('https://zalo.me/'+phoneIntl(l.t.ph),'_blank');
    });
  }
}
function debtLeaseIds(){return leasesOf(cur().id,true).filter(function(l){return debtOfLease(l.id)>0}).map(function(l){return l.id});}

/* ===== đặt phòng (homestay) ===== */
var WD=['CN','T2','T3','T4','T5','T6','T7'];
var BST={confirmed:['warn','Sắp đến','◔'],in:['ok','Đang ở','✓'],out:['idle','Đã trả phòng','○'],cancel:['idle','Đã hủy','✕']};
function bkPill(b){var s=BST[b.st];return '<span class="pill s-'+s[0]+'"><i>'+s[2]+'</i>'+s[1]+'</span>';}
function bookings(){
  var h=cur(),f=S.f.bk;
  var o='<h1>Đặt phòng</h1><div class="acts" style="margin:0 0 10px"><button class="btn sm primary" data-act="newbk" type="button">Thêm đặt phòng</button></div><div class="chips"><button class="chip" type="button" data-act="bkview" data-v="cal" aria-pressed="'+(f==='cal')+'">Lịch 14 ngày</button><button class="chip" type="button" data-act="bkview" data-v="list" aria-pressed="'+(f==='list')+'">Danh sách</button></div>';
  if(!h.units.length)return o+'<div class="empty">Chưa có phòng. Vào mục Phòng để thêm.</div>';
  if(f==='list'){
    var bs=BK.filter(function(b){return b.hid===h.id}).sort(function(a,b){return b.inD.localeCompare(a.inD)});
    return o+(bs.length?'<div class="list">'+bs.map(function(b){return '<div class="row" data-act="bk" data-id="'+b.id+'" role="button" tabindex="0"><span class="rn">'+esc(b.unit)+'</span><span class="mid"><b>'+esc(b.guest)+'</b><small>'+dm(b.inD)+' đến '+dm(b.outD)+' · '+diff(b.inD,b.outD)+' đêm'+(bkLeft(b)>0&&b.st!=='cancel'?' · thiếu '+fmt(bkLeft(b)):'')+'</small></span>'+bkPill(b)+'</div>';}).join('')+'</div>':'<div class="empty">Chưa có đặt phòng.</div>');
  }
  var N=14,start=addDays(TODAY,-1),hd='';
  for(var i=0;i<N;i++){var d=addDays(start,i);hd+='<div class="cd'+(d===TODAY?' today':'')+'"><b>'+d.slice(8)+'</b><span>'+WD[parse(d).getUTCDay()]+'</span></div>';}
  var rows=h.units.map(function(u){
    var bars=BK.filter(function(b){return b.hid===h.id&&b.unit===u.id&&b.st!=='cancel'}).map(function(b){
      var a=diff(start,b.inD),z=diff(start,b.outD);if(z<=0||a>=N)return '';
      var a2=Math.max(a,0),z2=Math.min(z,N);
      return '<button class="bar b-'+b.st+'" style="left:'+(a2/N*100)+'%;width:'+((z2-a2)/N*100)+'%" data-act="bk" data-id="'+b.id+'" type="button" aria-label="'+esc(b.guest)+' '+dm(b.inD)+' đến '+dm(b.outD)+'">'+esc(b.guest)+'</button>';
    }).join('');
    return '<div class="crow"><div class="cl">'+esc(u.id)+'</div><div class="ctrack">'+bars+'</div></div>';
  }).join('');
  return o+'<div class="calwrap"><div class="cal"><div class="crow"><div class="cl"></div><div class="chead">'+hd+'</div></div>'+rows+'</div></div><p class="demo">Bấm vào thanh màu để xem hoặc sửa đặt phòng. Vàng: sắp đến, xanh: đang ở, xám: đã trả.</p>';
}
function bkSheet(id){
  var b=BK.filter(function(x){return x.id===id})[0];
  return head('Đặt phòng '+esc(b.unit),bkPill(b))+kv([['Khách',esc(b.guest)],['Điện thoại',esc(b.ph)],['Ngày đến',dmy(b.inD)],['Ngày đi',dmy(b.outD)],['Số đêm',diff(b.inD,b.outD)],['Giá mỗi đêm',fmt(b.price)],['Tổng tiền',fmt(bkTotal(b))],['Đã thu',fmt(bkPaid(b))],['Còn thiếu',fmt(bkLeft(b))],['Nguồn',esc(b.src)]])+
   '<div class="acts">'+(b.st==='confirmed'?'<button class="btn primary" data-act="checkin" data-id="'+id+'" type="button">Nhận phòng (check-in)</button>':'')+(b.st==='in'?'<button class="btn primary" data-act="checkout" data-id="'+id+'" type="button">Trả phòng (check-out)</button>':'')+
   (bkLeft(b)>0&&b.st!=='cancel'?'<button class="btn" data-act="paybk" data-id="'+id+'" type="button">Thu tiền</button>':'')+(b.st==='confirmed'?'<button class="btn danger" data-act="askcancelbk" data-id="'+id+'" type="button">Hủy đặt phòng</button>':'')+'</div>';
}
function bkForm(unit){
  var h=cur();if(!h.units.length){warn('Hãy thêm phòng trước');return;}
  var u0=unit||h.units[0].id;
  openSheet(head('Thêm đặt phòng')+'<div class="fgrid">'+sel('bu','Phòng',h.units.map(function(u){return [u.id,u.id+' · '+fmt(u.price)+'/đêm']}),u0)+fld('bg','Tên khách','',{max:40})+fld('bp','Số điện thoại','',{mode:'tel'})+fld('bi','Ngày đến',TODAY,{type:'date'})+fld('bn','Số đêm','1',{mode:'numeric'})+fld('bpr','Giá mỗi đêm (đồng)',uOf(h.id,u0).price,{mode:'numeric'})+fld('bd','Tiền cọc đã nhận (đồng)','0',{mode:'numeric'})+sel('bs','Nguồn khách',[['Trực tiếp','Trực tiếp'],['Airbnb','Airbnb'],['Booking','Booking'],['Khác','Khác']],'Trực tiếp')+'</div><div class="acts"><button class="btn primary" data-act="savebk" type="button">Lưu đặt phòng</button></div>');
}
function saveBk(){
  var h=cur(),unit=val('bu'),g=val('bg'),ph=val('bp').replace(/\s/g,''),inD=val('bi'),n=num('bn'),pr=num('bpr'),dp=num('bd');
  if(!g){warn('Nhập tên khách');return;}if(!/^0\d{8,10}$/.test(ph)){warn('Số điện thoại cần 9 đến 11 số, bắt đầu bằng 0');return;}
  if(!inD){warn('Chọn ngày đến');return;}if(isNaN(n)||n<1||n>60){warn('Số đêm từ 1 đến 60');return;}if(isNaN(pr)||pr<=0||pr>1e9){warn('Nhập giá mỗi đêm hợp lệ (lớn hơn 0)');return;}if(isNaN(dp)||dp<0){warn('Kiểm tra tiền cọc');return;}
  var outD=addDays(inD,n),clash=BK.filter(function(b){return b.hid===h.id&&b.unit===unit&&b.st!=='cancel'&&inD<b.outD&&b.inD<outD})[0];
  if(clash){warn('Phòng đã có khách từ '+dm(clash.inD)+' đến '+dm(clash.outD));return;}
  if(dp>pr*n){warn('Tiền cọc lớn hơn tổng tiền phòng');return;}
  var b={id:'b'+(++BID),hid:h.id,unit:unit,guest:g,ph:ph,inD:inD,outD:outD,price:pr,st:'confirmed',src:val('bs'),pay:[]};
  if(dp>0)b.pay.push({d:TODAY,a:dp,m:'Chuyển khoản'});BK.push(b);closeSheet();toast('Đã thêm đặt phòng '+unit);render();
}
