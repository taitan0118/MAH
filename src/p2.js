/* ===== p2: giao diện chung, tổng quan, phòng, khách, hợp đồng ===== */
var S={hid:'',tab:'home',f:{units:'all',bills:'unpaid',leases:'on',tenants:'on',issues:'all',cash:MKEY,byear:'all',bmon:'all',ryear:TODAY.slice(0,4),rmon:TODAY.slice(5,7),bk:'cal'},q:'',aunit:'',sheet:null,remind:null,chot:{}};
function cur(){return hOf(S.hid);}
function pill(s){return '<span class="pill s-'+s.k+'"><i aria-hidden="true">'+s.i+'</i>'+esc(s.t)+'</span>';}
function toast(m,bad){document.querySelectorAll('.toast').forEach(function(o){o.remove();});var t=document.createElement('div');t.className='toast'+(bad?' err':'');t.setAttribute('role',bad?'alert':'status');t.textContent=m;document.body.appendChild(t);setTimeout(function(){t.remove();},bad?4000:2800);}
var MSGID=[[/họ tên/,['lname']],[/điện thoại/,['lph','bp']],[/CCCD/,['lcccd']],[/Số người/,['ln']],[/tên khách/,['bg']],[/ngày bắt đầu/i,['lst']],[/giá thuê|Kiểm tra giá thuê/,['lrent']],[/cọc/,['ldep','bd']],[/ngày đến/i,['bi']],[/số đêm/i,['bn']],[/giá mỗi đêm/i,['bpr']],[/ngày (thu|chi)|Chọn ngày|Ngày không/i,['pd','cd']],[/nội dung|Nội dung/,['cnote']],[/số tiền|Số tiền/,['pamt','camt','aamt']],[/Tên hoặc|Nhập tên hoặc|Tên này/,['uid']],[/Nhập giá lớn|giá một/i,['upr']],[/Tầng/,['ufl']],[/giường/i,['unb']],[/tên nhà|Tên nhà|nhà đã có/,['hn']],[/tài khoản|ngân hàng/i,['bn2','bn1']],[/Nhập sự cố/,['it']],[/Tên và số lượng/,['an','aq']],[/lý do/,['anote']],[/mẫu tin|Mẫu tin/,['stpl']],[/dịch vụ/,['nsn']]];
function warn(m,id){
  var ids=id?[id]:[];if(!id)MSGID.forEach(function(r){if(!ids.length&&r[0].test(m))ids=r[1];});
  var f=null;ids.forEach(function(i){if(!f&&$(i))f=$(i);});
  document.querySelectorAll('.in.err').forEach(function(x){x.classList.remove('err');});
  if(f){f.classList.add('err');f.setAttribute('aria-invalid','true');try{f.focus();f.scrollIntoView({block:'center'});}catch(e){}}
  toast(m,true);
}
function fld(id,label,v,o){o=o||{};return '<label class="f">'+label+'<input class="in" id="'+id+'" value="'+esc(v==null?'':v)+'"'+(o.type?' type="'+o.type+'"':'')+(o.mode?' inputmode="'+o.mode+'"':'')+(o.ph?' placeholder="'+esc(o.ph)+'"':'')+(o.max?' maxlength="'+o.max+'"':'')+'></label>';}
function sel(id,label,opts,v){return '<label class="f">'+label+'<select class="in" id="'+id+'">'+opts.map(function(o){return '<option value="'+esc(o[0])+'"'+(String(o[0])===String(v)?' selected':'')+'>'+esc(o[1])+'</option>'}).join('')+'</select></label>';}
function head(title,sub){return '<button class="x" data-act="close" type="button" aria-label="Đóng">✕</button><h3>'+title+'</h3>'+(sub?'<div class="subt">'+sub+'</div>':'');}
function openSheet(html){S.sheet=html;drawSheet();}
function closeSheet(){S.sheet=null;drawSheet();}
function drawSheet(){
  var L=$('layer');
  if(!S.sheet){L.innerHTML='';return;}
  L.innerHTML='<div class="ov" data-act="ovx"><div class="sheet" role="dialog" aria-modal="true">'+S.sheet+'</div></div>';
  var b=L.querySelector('.x');if(b)b.focus();
}
function mask(c){return c?'•••• '+String(c).slice(-4):'Chưa nhập';}
function lbl(l){var h=hOf(l.hid);return l.bed?'giường '+l.unit+l.bed:(h.type==='mini'?'căn hộ ':'phòng ')+l.unit;}
function ttPill(v){return v==='da'?'<span class="pill s-ok"><i>✓</i>Đã khai tạm trú</span>':'<span class="pill s-warn"><i>!</i>Chưa khai tạm trú</span>';}
function kv(rows){return '<dl class="kv">'+rows.map(function(r){return '<dt>'+r[0]+'</dt><dd>'+r[1]+'</dd>'}).join('')+'</dl>';}
function rowHtml(rn,name,note,right){return '<div class="row"><span class="rn">'+esc(rn)+'</span><span class="mid"><b>'+esc(name)+'</b><small>'+note+'</small></span>'+right+'</div>';}

/* ---- tổng quan ---- */
function home(){
  var h=cur(),oct=MKEY,thu=ledger(h.id).filter(function(e){return e.t==='thu'&&mkey(e.d)===oct}).reduce(function(a,e){return a+e.amt},0);
  var open=TK.filter(function(x){return x.hid===h.id&&x.st!=='Xong'});
  var out='<h1>Tổng quan</h1><div class="cards">';
  if(h.type==='home'){
    var bs=BK.filter(function(b){return b.hid===h.id});
    var inn=bs.filter(function(b){return b.st==='in'}),ci=bs.filter(function(b){return b.st==='confirmed'&&b.inD===TODAY}),co=bs.filter(function(b){return b.st==='in'&&b.outD===TODAY});
    out+=card('Đang ở',inn.length+' phòng',h.units.length+' phòng tổng')+card('Đến hôm nay',ci.length+' khách','Check-out hôm nay: '+co.length)+card('Còn phải thu',fmt(owedOf(h.id)),'Từ các đặt phòng')+card('Đã thu tháng '+MN,fmt(thu),open.length+' sự cố đang mở')+'</div>';
    out+='<button class="cta" data-act="newbk" type="button"><div><b>Thêm đặt phòng</b><span>Chọn phòng, ngày đến, số đêm, app tự tính tiền</span></div><span class="go">Thêm</span></button><h2>Việc hôm nay</h2>';
    var rows=[];
    ci.forEach(function(b){rows.push(rowHtml(b.unit,b.guest,'Đến hôm nay · '+(diff(b.inD,b.outD))+' đêm · còn thiếu '+fmt(bkLeft(b)),'<button class="btn sm" data-act="bk" data-id="'+b.id+'" type="button">Mở</button>'));});
    co.forEach(function(b){rows.push(rowHtml(b.unit,b.guest,'Trả phòng hôm nay · còn thiếu '+fmt(bkLeft(b)),'<button class="btn sm" data-act="bk" data-id="'+b.id+'" type="button">Mở</button>'));});
    bs.filter(function(b){return (b.st==='in'||b.st==='confirmed')&&bkLeft(b)>0&&b.inD!==TODAY&&b.outD!==TODAY}).forEach(function(b){rows.push(rowHtml(b.unit,b.guest,'Còn thiếu '+fmt(bkLeft(b)),'<button class="btn sm primary" data-act="paybk" data-id="'+b.id+'" type="button">Thu tiền</button>'));});
    return out+(rows.length?'<div class="list">'+rows.join('')+'</div>':'<div class="empty">Hôm nay không có việc cần làm.</div>')+issuesBox(open);
  }
  var ls=leasesOf(h.id,true),totalBeds=h.type==='ktx'?h.units.reduce(function(a,u){return a+u.nb},0):h.units.length;
  var occ=h.type==='ktx'?ls.length:h.units.filter(function(u){return activeIn(h.id,u.id).length}).length;
  out+=card('Còn phải thu',fmt(owedOf(h.id)),invsOf(h.id).filter(function(i){return !invDone(i)}).length+' hóa đơn chưa thu')+card('Đã thu tháng '+MN,fmt(thu),'Tính theo sổ thu chi')+card(h.type==='ktx'?'Giường có người':(h.type==='mini'?'Căn hộ đang thuê':'Phòng đang thuê'),occ+'/'+totalBeds,(totalBeds-occ)+' '+(h.type==='ktx'?'giường trống':'chỗ trống'))+'</div>';
  var nd=nextDue(h),dl=diff(TODAY,nd);
  out+='<div class="banner'+(dl>3?' ok':'')+'"><span style="flex:1;min-width:180px">'+(dl===0?'Hôm nay là ngày chốt thu tiền (ngày '+h.bday+' hằng tháng). Chốt điện nước và gửi hóa đơn cho khách.':'Lịch chốt thu tiền: ngày '+h.bday+' hằng tháng. Kỳ tới '+dmy(nd)+', còn '+dl+' ngày.')+'</span><button class="btn sm" data-act="tab" data-v="set" type="button">Đổi lịch</button></div>';
  out+='<button class="cta" data-act="chot" type="button"><div><b>Chốt điện nước tháng '+MN+'</b><span>Nhập số mới, app tự tính tiền và tạo hóa đơn cả nhà</span></div><span class="go">Bắt đầu</span></button><h2>Cần nhắc</h2>';
  var rows2=[],debtN=0;
  ls.forEach(function(l){var d=debtOfLease(l.id);
    if(d>0){debtN++;rows2.push(rowHtml(l.unit+(l.bed||''),l.t.name,'Nợ '+fmt(d),'<span class="pill s-bad"><i>!</i>Nợ tiền</span>'));}
    else if(days(l.end)<=30)rows2.push(rowHtml(l.unit+(l.bed||''),l.t.name,'Hợp đồng hết hạn '+dmy(l.end)+' (còn '+days(l.end)+' ngày)','<span class="pill s-warn"><i>◔</i>Sắp hết hạn</span>'));
  });
  out+=rows2.length?'<div class="list">'+rows2.join('')+'</div>'+(debtN?'<div class="acts"><button class="btn primary" data-act="remind" type="button">Nhắc thu tiền ('+debtN+' khách)</button></div>':''):'<div class="empty">Không có gì cần nhắc.</div>';
  return out+issuesBox(open);
}
function card(k,v,n){return '<div class="card"><div class="k">'+k+'</div><div class="v">'+v+'</div><div class="n">'+n+'</div></div>';}
function issuesBox(open){
  if(!open.length)return '';
  return '<h2>Sự cố đang mở ('+open.length+')</h2><div class="list">'+open.map(function(x){return rowHtml(x.unit,x.title,'Ngày '+dmy(x.d),'<span class="pill '+(x.st==='Mới'?'s-bad':'s-warn')+'">'+x.st+'</span>').replace('class="row"','class="row" data-act="issue" data-id="'+x.id+'" role="button" tabindex="0"');}).join('')+'</div>';
}

/* ---- phòng / căn / giường ---- */
function units(){
  var h=cur(),f=S.f.units,fls=[];
  h.units.forEach(function(u){if(fls.indexOf(u.fl)<0)fls.push(u.fl);});
  var chips=[['all','Tất cả']].concat(fls.map(function(x){return ['f'+x,'Tầng '+x]})).concat([['empty','Trống'],['debt','Nợ tiền'],['soon','Sắp hết hạn']]);
  var list=h.units.filter(function(u){
    if(f==='all')return true;if(f[0]==='f'&&f!=='empty')return 'f'+u.fl===f;
    var k=unitStatus(h,u).k;return (f==='empty'&&k==='idle')||(f==='debt'&&k==='bad')||(f==='soon'&&k==='warn');
  });
  var o='<h1>'+(h.type==='mini'?'Căn hộ':'Phòng')+'</h1><div class="acts" style="margin:0 0 10px"><button class="btn sm primary" data-act="newunit" type="button">Thêm '+(h.type==='mini'?'căn hộ':'phòng')+'</button></div>';
  o+='<div class="chips" role="group" aria-label="Lọc">'+chips.map(function(c){return '<button class="chip" type="button" data-act="ufilter" data-v="'+c[0]+'" aria-pressed="'+(f===c[0])+'">'+c[1]+'</button>'}).join('')+'</div>';
  if(!h.units.length)return o+'<div class="empty">Chưa có '+(h.type==='mini'?'căn hộ':'phòng')+' nào. Bấm “Thêm” để tạo.</div>';
  if(!list.length)return o+'<div class="empty">Không có mục nào ở bộ lọc này.</div>';
  return o+'<div class="grid">'+list.map(function(u){
    var s=unitStatus(h,u),sub,pr;
    if(h.type==='ktx'){sub=activeIn(h.id,u.id).length+'/'+u.nb+' giường';pr=fmt(u.price)+'/giường';}
    else if(h.type==='home'){var b=BK.filter(function(x){return x.hid===h.id&&x.unit===u.id&&x.st==='in'})[0];sub=b?esc(b.guest):'Chưa có khách';pr=fmt(u.price)+'/đêm';}
    else{var l=activeIn(h.id,u.id)[0];sub=l?esc(l.t.name):'Chưa có khách';pr=fmt(u.price);}
    return '<button class="room s-'+s.k+'" type="button" data-act="unit" data-id="'+esc(u.id)+'"><span class="no">'+esc(u.id)+'</span><span class="tn">'+sub+'</span><span class="pr">'+pr+'</span>'+pill(s)+'</button>';
  }).join('')+'</div>';
}
function unitForm(eid){
  var h=cur(),w=h.type==='mini'?'căn hộ':'phòng',u=eid?uOf(h.id,eid):null;S.editU=eid||null;
  openSheet(head((u?'Sửa ':'Thêm ')+w)+'<div class="fgrid">'+fld('uid','Tên hoặc số '+w,u?u.id:'',{ph:h.type==='mini'?'Ví dụ: S501':'Ví dụ: 305',max:12})+fld('ufl','Tầng',u?u.fl:'1',{mode:'numeric'})+fld('upr',h.type==='ktx'?'Giá một giường mỗi tháng (đồng)':(h.type==='home'?'Giá mỗi đêm (đồng)':'Giá thuê mỗi tháng (đồng)'),u?u.price:'',{mode:'numeric',ph:'3000000'})+
   (h.type==='ktx'?fld('unb','Số giường',u?u.nb:'6',{mode:'numeric'}):'')+(h.type==='home'?fld('ucap','Số khách tối đa',u?u.cap:'4',{mode:'numeric'}):'')+'</div><div class="acts"><button class="btn primary" data-act="saveunit" type="button">Lưu</button></div>');
}
function saveUnit(){
  var h=cur(),id=val('uid'),fl=num('ufl'),pr=num('upr'),old=S.editU,u0=old?uOf(h.id,old):null;
  if(!id){warn('Nhập tên hoặc số');return;}
  if(h.units.some(function(u){return u!==u0&&u.id.toLowerCase()===id.toLowerCase()})){warn('Tên này đã có rồi');return;}
  if(isNaN(pr)||pr<=0){warn('Nhập giá lớn hơn 0');return;}
  if(pr>1e9){warn('Giá quá lớn, kiểm tra lại số 0');return;}
  if(/[|"'<>]/.test(id)){warn('Tên không dùng các ký tự | " \' < >');return;}
  if(!isNaN(fl)&&(fl<0||fl>100)){warn('Tầng từ 0 đến 100');return;}
  var u={id:id,fl:isNaN(fl)?1:fl,price:pr,e:u0?u0.e:0,w:u0?u0.w:0};
  if(h.type==='ktx'){var nb=num('unb');if(isNaN(nb)||nb<1||nb>20){warn('Số giường từ 1 đến 20');return;}if(u0&&nb<u0.nb&&LS.some(function(l){return l.hid===h.id&&l.unit===old&&l.on&&l.bed&&+l.bed>nb})){warn('Còn người ở giường số lớn hơn '+nb);return;}u.nb=nb;}
  if(h.type==='home'){var c=num('ucap');u.cap=isNaN(c)?2:c;}
  if(u0){
    if(id!==old){var m=function(x){if(x.hid===h.id&&x.unit===old)x.unit=id;};LS.forEach(m);INV.forEach(m);BK.forEach(m);TK.forEach(m);if(AS[h.id+'|'+old]){AS[h.id+'|'+id]=AS[h.id+'|'+old];delete AS[h.id+'|'+old];}}
    for(var k in u)u0[k]=u[k];closeSheet();toast('Đã lưu '+id);render();return;
  }
  h.units.push(u);closeSheet();toast('Đã thêm '+id);render();
}
function confirmSheet(title,text,act,data,label){
  openSheet(head(title)+'<p style="margin:10px 0">'+text+'</p><div class="acts"><button class="btn" data-act="close" type="button">Không xóa</button><button class="btn primary danger-fill" data-act="'+act+'" '+(data||'')+' type="button">'+(label||'Xóa')+'</button></div>');
}
function delUnit(uid){
  var h=cur();
  if(LS.some(function(l){return l.hid===h.id&&l.unit===uid&&l.on})){warn('Còn người đang ở, hãy trả phòng trước');return;}
  if(BK.some(function(b){return b.hid===h.id&&b.unit===uid&&(b.st==='in'||b.st==='confirmed')})){warn('Còn đặt phòng chưa xong, hãy hủy hoặc trả phòng trước');return;}
  h.units=h.units.filter(function(u){return u.id!==uid});
  var keep=function(x){return !(x.hid===h.id&&x.unit===uid)};
  LS=LS.filter(keep);INV=INV.filter(keep);BK=BK.filter(keep);TK=TK.filter(keep);delete AS[h.id+'|'+uid];
  closeSheet();toast('Đã xóa '+uid);render();
}
function unitSheet(uid){
  var h=cur(),u=uOf(h.id,uid),s=unitStatus(h,u),o=head((h.type==='mini'?'Căn hộ ':'Phòng ')+esc(u.id),pill(s));
  var tools='<div class="acts"><button class="btn sm" data-act="newissue" data-id="'+esc(uid)+'" type="button">Báo sự cố</button><button class="btn sm" data-act="goassets" data-id="'+esc(uid)+'" type="button">Xem tài sản</button><button class="btn sm" data-act="editunit" data-id="'+esc(uid)+'" type="button">Sửa '+(h.type==='mini'?'căn hộ':'phòng')+'</button><button class="btn sm danger" data-act="askdelunit" data-id="'+esc(uid)+'" type="button">Xóa</button></div>';
  if(h.type==='ktx'){
    o+='<p class="subt">'+fmt(u.price)+'/giường · điện nước chia đều cho người ở</p><div class="list" style="margin-top:8px">'+bedsOf(h,u).map(function(b){
      var l=leaseOfBed(h.id,uid,b);
      return l?rowHtml('G'+b,l.t.name,esc(l.t.ph)+(debtOfLease(l.id)>0?' · nợ '+fmt(debtOfLease(l.id)):''),'<button class="btn sm" data-act="lease" data-id="'+l.id+'" type="button">Mở</button>'):
        rowHtml('G'+b,'Giường trống','Chưa có người','<button class="btn sm primary" data-act="rent" data-id="'+esc(uid)+'" data-bed="'+b+'" type="button">Thêm khách</button>');
    }).join('')+'</div>'+tools;return o;
  }
  if(h.type==='home'){
    var bs=BK.filter(function(b){return b.hid===h.id&&b.unit===uid&&b.st!=='cancel'&&b.outD>=TODAY}).sort(function(a,b){return a.inD.localeCompare(b.inD)});
    o+=kv([['Giá mỗi đêm',fmt(u.price)],['Khách tối đa',u.cap]])+'<h2 style="font-size:15px">Đặt phòng sắp tới</h2>'+(bs.length?'<div class="list">'+bs.map(function(b){return rowHtml(dm(b.inD),b.guest,diff(b.inD,b.outD)+' đêm · đến '+dm(b.outD),'<button class="btn sm" data-act="bk" data-id="'+b.id+'" type="button">Mở</button>')}).join('')+'</div>':'<div class="empty">Chưa có đặt phòng.</div>')+'<div class="acts"><button class="btn primary" data-act="newbk" data-id="'+esc(uid)+'" type="button">Thêm đặt phòng</button></div>'+tools;return o;
  }
  var l=activeIn(h.id,uid)[0];
  if(!l)return o+'<div class="empty">Phòng đang trống. Giá thuê '+fmt(u.price)+'/tháng.</div><div class="acts"><button class="btn primary" data-act="rent" data-id="'+esc(uid)+'" type="button">Cho thuê</button></div>'+tools;
  return o+kv([['Khách thuê',esc(l.t.name)],['Điện thoại',esc(l.t.ph)],['Số người ở',l.t.n],['Giá thuê',fmt(l.rent)],['Tiền cọc',fmt(l.dep)],['Hợp đồng đến',dmy(l.end)],['Đang nợ',fmt(debtOfLease(l.id))]])+
   '<div class="acts">'+(debtOfLease(l.id)>0?'<button class="btn primary" data-act="paylease" data-id="'+l.id+'" type="button">Thu tiền</button><button class="btn" data-act="remind1" data-id="'+l.id+'" type="button">Nhắc thu tiền</button>':'')+'<button class="btn" data-act="lease" data-id="'+l.id+'" type="button">Hợp đồng</button></div>'+tools;
}

/* ---- khách thuê ---- */
function tenants(){
  var h=cur(),f=S.f.tenants,q=S.q.toLowerCase();
  var o='<h1>'+(h.type==='home'?'Khách lưu trú':'Khách thuê')+'</h1>';
  if(h.type==='home'){
    var g={};BK.filter(function(b){return b.hid===h.id&&b.st!=='cancel'}).forEach(function(b){var k=b.ph;g[k]=g[k]||{name:b.guest,ph:b.ph,n:0,last:b.inD,spent:0};g[k].n++;g[k].spent+=bkTotal(b);if(b.inD>g[k].last)g[k].last=b.inD;});
    var gl=Object.keys(g).map(function(k){return g[k]}).filter(function(x){return !q||x.name.toLowerCase().indexOf(q)>=0||x.ph.indexOf(q)>=0});
    o+='<input class="in search" id="q" data-act="search" placeholder="Tìm theo tên hoặc số điện thoại" value="'+esc(S.q)+'" aria-label="Tìm khách">';
    return o+'<div class="list" id="tlist">'+(gl.length?gl.map(function(x){return rowHtml('👤',x.name,esc(x.ph)+' · '+x.n+' lần đặt · gần nhất '+dm(x.last),'<span class="amt">'+fmt(x.spent)+'</span>')}).join(''):'<div class="empty">Không tìm thấy khách.</div>')+'</div>';
  }
  o+='<div class="chips"><button class="chip" type="button" data-act="tfilter" data-v="on" aria-pressed="'+(f==='on')+'">Đang ở ('+leasesOf(h.id,true).length+')</button><button class="chip" type="button" data-act="tfilter" data-v="off" aria-pressed="'+(f==='off')+'">Đã trả phòng ('+leasesOf(h.id,false).length+')</button></div>';
  o+='<input class="in search" id="q" data-act="search" placeholder="Tìm theo tên, số điện thoại, phòng" value="'+esc(S.q)+'" aria-label="Tìm khách">';
  return o+'<div class="list" id="tlist">'+tlist()+'</div>';
}
function tlist(){
  var h=cur(),q=S.q.toLowerCase(),f=S.f.tenants;
  var ls=leasesOf(h.id,f==='on').filter(function(l){return !q||l.t.name.toLowerCase().indexOf(q)>=0||l.t.ph.indexOf(q)>=0||(l.unit+(l.bed||'')).toLowerCase().indexOf(q)>=0});
  if(!ls.length)return '<div class="empty">Không tìm thấy khách.</div>';
  return ls.map(function(l){return '<div class="row" data-act="tenant" data-id="'+l.id+'" role="button" tabindex="0"><span class="rn">'+esc(l.unit+(l.bed||''))+'</span><span class="mid"><b>'+esc(l.t.name)+'</b><small>'+esc(l.t.ph)+(debtOfLease(l.id)>0?' · nợ '+fmt(debtOfLease(l.id)):'')+'</small></span>'+ttPill(l.t.tt)+'</div>';}).join('');
}
function tenantSheet(id){
  var l=LS.filter(function(x){return x.id===id})[0],d=debtOfLease(id);
  return head(esc(l.t.name),esc(lbl(l))+(l.on?'':' · đã trả phòng '+dmy(l.out||l.end)))+kv([['Điện thoại',esc(l.t.ph)],['CCCD',mask(l.t.cccd)],['Số người ở',l.t.n],['Xe',esc(l.t.veh||'Không có')],['Tạm trú',ttPill(l.t.tt)],['Hợp đồng',dmy(l.start)+' đến '+dmy(l.end)],['Đang nợ',fmt(d)]])+
   '<div class="acts">'+(l.on&&d>0?'<button class="btn primary" data-act="paylease" data-id="'+id+'" type="button">Thu tiền</button><button class="btn" data-act="remind1" data-id="'+id+'" type="button">Nhắc thu tiền</button>':'')+
   (l.t.tt!=='da'?'<button class="btn" data-act="tt" data-id="'+id+'" type="button">Đánh dấu đã khai tạm trú</button>':'')+'<button class="btn" data-act="lease" data-id="'+id+'" type="button">Hợp đồng</button></div><p class="demo">Số CCCD chỉ hiện 4 số cuối, dữ liệu nằm trên máy này.</p>';
}

/* ---- hợp đồng ---- */
function leases(){
  var h=cur(),f=S.f.leases,all=leasesOf(h.id);
  var list=all.filter(function(l){return f==='on'?l.on:f==='soon'?(l.on&&days(l.end)<=30):!l.on}).sort(function(a,b){return a.end.localeCompare(b.end)});
  var o='<h1>Hợp đồng</h1><div class="acts" style="margin:0 0 10px"><button class="btn sm primary" data-act="newlease" type="button">Tạo hợp đồng mới</button></div><div class="chips">'+[['on','Đang hiệu lực'],['soon','Sắp hết hạn'],['off','Đã kết thúc']].map(function(c){return '<button class="chip" type="button" data-act="lfilter" data-v="'+c[0]+'" aria-pressed="'+(f===c[0])+'">'+c[1]+'</button>'}).join('')+'</div>';
  if(!list.length)return o+'<div class="empty">Không có hợp đồng nào ở mục này.</div>';
  return o+'<div class="list">'+list.map(function(l){var dd=days(l.end);
    return '<div class="row" data-act="lease" data-id="'+l.id+'" role="button" tabindex="0"><span class="rn">'+esc(l.unit+(l.bed||''))+'</span><span class="mid"><b>'+esc(l.t.name)+'</b><small>'+dmy(l.start)+' đến '+dmy(l.end)+(l.on?' · '+(dd<0?'quá hạn '+(-dd)+' ngày':'còn '+dd+' ngày'):'')+'</small></span><span class="amt">'+fmt(l.rent)+'</span></div>';}).join('')+'</div>';
}
function leaseSheet(id){
  var l=LS.filter(function(x){return x.id===id})[0],dd=days(l.end);
  return head('Hợp đồng '+esc(lbl(l)),l.on?(dd<=30?'<span class="pill s-warn"><i>◔</i>Sắp hết hạn</span>':'<span class="pill s-ok"><i>✓</i>Đang hiệu lực</span>'):'<span class="pill s-idle">Đã kết thúc</span>')+
   kv([['Khách thuê',esc(l.t.name)],['Điện thoại',esc(l.t.ph)],['Bắt đầu',dmy(l.start)],['Kết thúc',dmy(l.end)],['Giá thuê',fmt(l.rent)+'/tháng'],['Tiền cọc',fmt(l.dep)],['Đang nợ',fmt(debtOfLease(l.id))]])+
   '<div class="acts"><button class="btn" data-act="doc" data-id="'+id+'" type="button">Xem mẫu hợp đồng</button>'+(l.on?'<button class="btn" data-act="renew" data-id="'+id+'" type="button">Gia hạn</button><button class="btn danger" data-act="out" data-id="'+id+'" type="button">Trả '+(l.bed?'giường':'phòng')+'</button>':'')+'</div>';
}
function docSheet(id){
  var l=LS.filter(function(x){return x.id===id})[0],h=hOf(l.hid);
  return head('Mẫu hợp đồng thuê')+'<div class="docbox"><p style="text-align:center;font-weight:800;margin:0 0 6px">HỢP ĐỒNG THUÊ '+(h.type==='ktx'?'CHỖ Ở':'PHÒNG')+'</p><p>Bên cho thuê (Bên A): Chủ '+esc(h.name)+', địa chỉ '+esc(h.addr)+'.</p><p>Bên thuê (Bên B): '+esc(l.t.name)+', điện thoại '+esc(l.t.ph)+', CCCD '+mask(l.t.cccd)+'.</p><p><b>Điều 1.</b> Bên A cho Bên B thuê '+esc(lbl(l))+' từ ngày '+dmy(l.start)+' đến ngày '+dmy(l.end)+'.</p><p><b>Điều 2.</b> Giá thuê '+fmt(l.rent)+'/tháng, chưa gồm điện nước và dịch vụ. Thanh toán trước ngày '+(h.bday||5)+' hằng tháng.</p><p><b>Điều 3.</b> Tiền cọc '+fmt(l.dep)+', hoàn trả khi kết thúc hợp đồng sau khi trừ các khoản còn nợ và hư hỏng (nếu có).</p><p><b>Điều 4.</b> Hai bên cam kết thực hiện đúng nội quy, đăng ký tạm trú theo quy định.</p><p style="color:var(--soft);font-size:13px">Đây là mẫu tham khảo, nên nhờ luật sư xem lại trước khi dùng thật.</p></div><div class="acts"><button class="btn primary" data-act="pdf" type="button">In hoặc lưu PDF</button><button class="btn" data-act="close" type="button">Đóng</button></div>';
}
function leaseForm(unit,bed){
  var h=cur(),u=uOf(h.id,unit);
  openSheet(head('Cho thuê '+(bed?'giường '+unit+bed:'phòng '+unit))+'<div class="fgrid">'+fld('lname','Họ tên khách','',{max:40})+fld('lph','Số điện thoại','',{mode:'tel',ph:'09xx xxx xxx'})+fld('lcccd','CCCD (không bắt buộc)','',{mode:'numeric',max:12})+
   sel('ltt','Tạm trú',[['chua','Chưa khai'],['da','Đã khai']],'chua')+fld('ln','Số người ở','1',{mode:'numeric'})+fld('lveh','Biển số xe (nếu có)','',{max:14})+fld('lst','Ngày bắt đầu',TODAY,{type:'date'})+sel('lterm','Kỳ hạn',[['6','6 tháng'],['12','12 tháng'],['24','24 tháng']],'12')+fld('lrent','Giá thuê mỗi tháng (đồng)',u.price,{mode:'numeric'})+fld('ldep','Tiền cọc (đồng)',u.price,{mode:'numeric'})+
   '</div><div class="acts"><button class="btn primary" data-act="savelease" data-unit="'+esc(unit)+'" data-bed="'+(bed||'')+'" type="button">Lưu hợp đồng</button></div>');
}
function saveLease(unit,bed){
  var h=cur(),name=val('lname'),ph=val('lph').replace(/\s/g,''),st=val('lst'),term=+val('lterm'),rent=num('lrent'),dep=num('ldep'),n=num('ln');
  if(!name){warn('Nhập họ tên khách');return;}
  if(!/^0\d{8,10}$/.test(ph)){warn('Số điện thoại cần 9 đến 11 số, bắt đầu bằng 0');return;}
  var cc=val('lcccd').replace(/\s/g,'');if(cc&&!/^(\d{9}|\d{12})$/.test(cc)){warn('CCCD cần đúng 9 hoặc 12 số, hoặc để trống');return;}
  if(isNaN(n)||n<1||n>20||n!==Math.floor(n)){warn('Số người ở từ 1 đến 20');return;}
  if(st&&Math.abs(diff(TODAY,st))>366){warn('Ngày bắt đầu lệch quá 1 năm so với hôm nay, kiểm tra lại');return;}
  if(!st){warn('Chọn ngày bắt đầu');return;}
  if(isNaN(rent)||rent<=0||isNaN(dep)||dep<0){warn('Kiểm tra giá thuê và tiền cọc');return;}
  if(rent>1e9||dep>1e10){warn('Giá thuê hoặc tiền cọc quá lớn');return;}
  if(h.type!=='ktx'&&activeIn(h.id,unit).length){warn('Phòng này đã có người thuê');return;}
  if(bed&&leaseOfBed(h.id,unit,bed)){warn('Giường này đã có người');return;}
  LS.push({id:'l'+(++LID),hid:h.id,unit:unit,bed:bed||null,t:{name:name,ph:ph,n:isNaN(n)?1:n,tt:val('ltt'),veh:val('lveh'),cccd:cc},start:st,end:addMonths(st,term),rent:rent,dep:dep,on:true});
  closeSheet();toast('Đã lưu hợp đồng cho '+name);render();
}
function newLeaseChooser(){
  var h=cur(),opts=[];
  h.units.forEach(function(u){if(h.type==='ktx'){bedsOf(h,u).forEach(function(b){if(!leaseOfBed(h.id,u.id,b))opts.push([u.id+'|'+b,'Giường '+u.id+b]);});}else if(!activeIn(h.id,u.id).length)opts.push([u.id+'|','Phòng '+u.id]);});
  if(!opts.length){warn('Hiện không còn chỗ trống');return;}
  openSheet(head('Tạo hợp đồng mới')+'<div class="fgrid">'+sel('pick','Chọn chỗ trống',opts,opts[0][0])+'</div><div class="acts"><button class="btn primary" data-act="pickgo" type="button">Tiếp tục</button></div>');
}
function renewSheet(id){
  var l=LS.filter(function(x){return x.id===id})[0];
  openSheet(head('Gia hạn hợp đồng',esc(lbl(l))+' · hiện đến '+dmy(l.end))+'<div class="fgrid">'+sel('rn','Gia hạn thêm',[['3','3 tháng'],['6','6 tháng'],['12','12 tháng']],'6')+'</div><div class="acts"><button class="btn primary" data-act="renewok" data-id="'+id+'" type="button">Gia hạn</button></div>');
}
function outSheet(id){
  var l=LS.filter(function(x){return x.id===id})[0],d=debtOfLease(id),back=l.dep-d;
  openSheet(head('Trả '+(l.bed?'giường':'phòng')+' '+esc(l.unit+(l.bed||'')),esc(l.t.name))+kv([['Tiền cọc',fmt(l.dep)],['Trừ nợ',fmt(Math.min(d,l.dep))],['Khách còn nợ thêm',fmt(Math.max(d-l.dep,0))],['<b>Hoàn lại cho khách</b>',fmt(Math.max(back,0))]])+'<div class="acts"><button class="btn danger" data-act="outok" data-id="'+id+'" type="button">Xác nhận trả</button><button class="btn" data-act="close" type="button">Hủy</button></div>');
}
