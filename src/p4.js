/* ===== p4: thu chi, sự cố, tài sản, báo cáo, cài đặt, điều hướng ===== */
function cash(){
  var h=cur(),all=ledger(h.id),ms=[];all.forEach(function(e){var k=mkey(e.d);if(ms.indexOf(k)<0)ms.push(k);});ms.sort().reverse();
  var f=S.f.cash,list=all.filter(function(e){return f==='all'||mkey(e.d)===f});
  var thu=list.filter(function(e){return e.t==='thu'}).reduce(function(a,e){return a+e.amt},0),chi=list.filter(function(e){return e.t==='chi'}).reduce(function(a,e){return a+e.amt},0);
  var o='<h1>Thu chi</h1><div class="chips">'+['all'].concat(ms).map(function(k){return '<button class="chip" type="button" data-act="cmonth" data-v="'+k+'" aria-pressed="'+(f===k)+'">'+(k==='all'?'Tất cả':'Tháng '+mlabel(k))+'</button>'}).join('')+'</div>';
  o+='<div class="cards">'+card('Tổng thu','+'+fmt(thu),'Tiền nhà, đặt phòng, thu khác')+card('Tổng chi','-'+fmt(chi),'Các khoản đã chi')+card('Còn lại',fmt(thu-chi),'Thu trừ chi')+'</div><div class="acts" style="margin-top:12px"><button class="btn primary sm" data-act="newcash" data-v="chi" type="button">Thêm khoản chi</button><button class="btn sm" data-act="newcash" data-v="thu" type="button">Thêm khoản thu khác</button></div>';
  if(!list.length)return o+'<div class="empty" style="margin-top:12px">Chưa có khoản nào trong mục này.</div>';
  return o+'<div class="list" style="margin-top:12px">'+list.map(function(e){return '<div class="row"><span class="rn" style="min-width:48px;font-size:14px">'+dm(e.d)+'</span><span class="mid"><b>'+esc(e.note)+'</b></span><span class="amt '+(e.t==='thu'?'pos':'neg')+'">'+(e.t==='thu'?'+':'-')+fmt(e.amt)+'</span>'+(e.k?'<button class="btn sm" data-act="editcash" data-k="'+e.k+'" data-id="'+e.id+'" type="button" aria-label="Sửa khoản này">Sửa</button><button class="btn sm danger" data-act="askdelcash" data-k="'+e.k+'" data-id="'+e.id+'" type="button" aria-label="Xóa khoản này">Xóa</button>':'')+'</div>';}).join('')+'</div>';
}
function cashRec(k,id){return (k==='exp'?EXP:INC).filter(function(x){return x.id===id})[0];}
function cashForm(t,id){
  var r=id?cashRec(t==='chi'?'exp':'inc',id):null;S.editC=id||null;
  openSheet(head((r?'Sửa ':'Thêm ')+(t==='chi'?'khoản chi':'khoản thu khác'))+'<div class="fgrid">'+(t==='chi'?sel('ccat','Loại chi',CATS_OUT.map(function(c){return [c,c]}),r?r.cat:'Sửa chữa'):'')+fld('cnote','Nội dung',r?r.note:'',{max:60,ph:t==='chi'?'Ví dụ: Thay bóng đèn hành lang':'Ví dụ: Tiền giặt ủi'})+fld('camt','Số tiền (đồng)',r?r.amt:'',{mode:'numeric'})+fld('cd','Ngày',r?r.d:TODAY,{type:'date'})+'</div><div class="acts"><button class="btn primary" data-act="savecash" data-v="'+t+'" type="button">Lưu</button></div>');
}
function saveCash(t){
  var note=val('cnote'),a=num('camt'),d=val('cd');
  if(!note){warn('Nhập nội dung');return;}if(isNaN(a)||a<=0){warn('Nhập số tiền lớn hơn 0');return;}if(!d){warn('Chọn ngày');return;}
  if(d>TODAY){warn('Ngày không được ở tương lai');return;}
  if(a>1e10){warn('Số tiền quá lớn');return;}
  var r=S.editC?cashRec(t==='chi'?'exp':'inc',S.editC):null;
  if(r){r.d=d;r.note=note;r.amt=a;if(t==='chi')r.cat=val('ccat');}
  else if(t==='chi')EXP.push({id:'x'+(++XID),hid:S.hid,d:d,cat:val('ccat'),note:note,amt:a});else INC.push({id:'n'+(++XID),hid:S.hid,d:d,note:note,amt:a});
  S.f.cash=mkey(d);closeSheet();toast('Đã lưu');render();
}
function issues(){
  var h=cur(),f=S.f.issues,all=TK.filter(function(x){return x.hid===h.id}),list=all.filter(function(x){return f==='all'||x.st===f}).sort(function(a,b){return b.d.localeCompare(a.d)});
  var o='<h1>Sự cố và bảo trì</h1><div class="acts" style="margin:0 0 10px"><button class="btn sm primary" data-act="newissue" type="button">Báo sự cố</button></div><div class="chips">'+['all','Mới','Đang xử lý','Xong'].map(function(k){return '<button class="chip" type="button" data-act="ifilter" data-v="'+k+'" aria-pressed="'+(f===k)+'">'+(k==='all'?'Tất cả ('+all.length+')':k+' ('+all.filter(function(x){return x.st===k}).length+')')+'</button>'}).join('')+'</div>';
  if(!list.length)return o+'<div class="empty">Không có sự cố nào ở mục này.</div>';
  return o+'<div class="list">'+list.map(function(x){return '<div class="row" data-act="issue" data-id="'+x.id+'" role="button" tabindex="0"><span class="rn">'+esc(x.unit)+'</span><span class="mid"><b>'+esc(x.title)+'</b><small>Ngày '+dmy(x.d)+(x.cost?' · chi '+fmt(x.cost):'')+'</small></span><span class="pill '+(x.st==='Mới'?'s-bad':x.st==='Xong'?'s-ok':'s-warn')+'">'+x.st+'</span></div>';}).join('')+'</div>';
}
function issueSheet(id){
  var x=TK.filter(function(t){return t.id===id})[0];
  var o=head(esc(x.title),'Phòng '+esc(x.unit)+' · báo ngày '+dmy(x.d)+' · <span class="pill '+(x.st==='Mới'?'s-bad':x.st==='Xong'?'s-ok':'s-warn')+'">'+x.st+'</span>')+'<p style="margin:10px 0">'+esc(x.desc)+'</p>';
  if(x.st==='Xong')return o+kv([['Chi phí',fmt(x.cost||0)]]);
  return o+(x.st==='Mới'?'<div class="acts"><button class="btn" data-act="issueop" data-v="take" data-id="'+id+'" type="button">Nhận xử lý</button></div>':'')+'<h2 style="font-size:15px">Hoàn thành</h2><div class="fgrid">'+fld('icost','Chi phí sửa chữa (đồng, để trống nếu không tốn)','',{mode:'numeric'})+'<label class="sw"><span>Ghi khoản chi vào Thu chi</span><input type="checkbox" id="irec" checked></label></div><div class="acts"><button class="btn primary" data-act="issueop" data-v="done" data-id="'+id+'" type="button">Đánh dấu đã xong</button></div>';
}
function issueForm(unit){
  var h=cur();if(!h.units.length){warn('Hãy thêm phòng trước');return;}
  openSheet(head('Báo sự cố')+'<div class="fgrid">'+sel('iu','Phòng',h.units.map(function(u){return [u.id,u.id]}),unit||h.units[0].id)+fld('it','Sự cố gì','',{max:60,ph:'Ví dụ: Vòi nước bị rò'})+fld('id2','Mô tả thêm','',{max:140})+'</div><div class="acts"><button class="btn primary" data-act="saveissue" type="button">Lưu</button></div>');
}
function assets(){
  var h=cur(),o='<h1>Tài sản trong phòng</h1>';
  if(!h.units.length)return o+'<div class="empty">Chưa có phòng. Vào mục Phòng để thêm.</div>';
  var u=S.aunit&&uOf(h.id,S.aunit)?S.aunit:h.units[0].id;S.aunit=u;
  var list=AS[h.id+'|'+u]||[];
  o+='<div class="fgrid" style="max-width:360px">'+sel('aunit','Chọn phòng',h.units.map(function(x){return [x.id,x.id]}),u)+'</div>';
  o+=list.length?'<div class="list" style="margin-top:12px">'+list.map(function(a,i){var k=a.c==='Tốt'?'s-ok':a.c==='Cũ'?'s-warn':'s-bad';return '<div class="row"><span class="mid"><b>'+esc(a.name)+'</b><small>Số lượng '+a.q+'</small></span><span class="pill '+k+'">'+a.c+'</span><button class="btn sm" data-act="delasset" data-i="'+i+'" type="button" aria-label="Xóa '+esc(a.name)+'">Xóa</button></div>';}).join('')+'</div>':'<div class="empty" style="margin-top:12px">Phòng này chưa ghi tài sản.</div><div class="acts"><button class="btn" data-act="defassets" type="button">Thêm bộ tài sản mặc định</button></div>';
  return o+'<h2>Thêm tài sản</h2><div class="card"><div class="fgrid">'+fld('an','Tên tài sản','',{max:30,ph:'Ví dụ: Máy lạnh'})+fld('aq','Số lượng','1',{mode:'numeric'})+sel('ac','Tình trạng',[['Tốt','Tốt'],['Cũ','Cũ'],['Hỏng','Hỏng']],'Tốt')+'</div><div class="acts"><button class="btn primary" data-act="addasset" type="button">Thêm</button></div></div>';
}
function occOf(h){
  if(h.type==='home'){var n=h.units.filter(function(u){return BK.some(function(b){return b.hid===h.id&&b.unit===u.id&&b.st!=='cancel'&&b.inD<=TODAY&&TODAY<b.outD})}).length;return h.units.length?n/h.units.length:0;}
  if(h.type==='ktx'){var tot=h.units.reduce(function(a,u){return a+u.nb},0);return tot?leasesOf(h.id,true).length/tot:0;}
  return h.units.length?h.units.filter(function(u){return activeIn(h.id,u.id).length}).length/h.units.length:0;
}
function periodRows(h,y){
  var L=ledger(h.id),rows=[];
  for(var m=1;m<=12;m++){
    var k=y+'-'+pad(m),got=0,chi=0,billed=0;
    L.forEach(function(e){if(mkey(e.d)!==k)return;if(e.t==='thu')got+=e.amt;else chi+=e.amt;});
    if(h.type==='home')billed=BK.filter(function(b){return b.hid===h.id&&b.st!=='cancel'&&mkey(b.inD)===k}).reduce(function(a,b){return a+bkTotal(b)},0);
    else billed=invsOf(h.id).filter(function(i){return i.month===k}).reduce(function(a,i){return a+i.total},0);
    var hi=(HIST[h.id]||[]);
    if(y==='2026'&&m>=5&&m<=9&&hi[m-5]){if(!billed)billed=hi[m-5][0]*1e6;if(!chi)chi=hi[m-5][1]*1e6;}
    rows.push({k:k,m:m,got:got,billed:billed,chi:chi,profit:billed-chi});
  }
  return rows;
}
function inPeriod(k){var Y=S.f.ryear,M=S.f.rmon;return k.slice(0,4)===Y&&(M==='all'||k.slice(5)===M);}
function periodLabel(){var M=S.f.rmon;return (M==='all'?'Cả năm ':'Tháng '+(+M)+'/')+S.f.ryear;}
function debtsOf(h){
  var d=h.type==='home'?BK.filter(function(b){return b.hid===h.id&&b.st!=='cancel'&&bkLeft(b)>0}).map(function(b){return [b.unit,b.guest,bkLeft(b)]}):leasesOf(h.id,true).filter(function(l){return debtOfLease(l.id)>0}).map(function(l){return [l.unit+(l.bed||''),l.t.name,debtOfLease(l.id)]});
  return d.sort(function(a,b){return b[2]-a[2]});
}
function report(){
  var h=cur(),Y=S.f.ryear,M=S.f.rmon,rows=periodRows(h,Y),sel_=rows.filter(function(r){return inPeriod(r.k)});
  var got=0,billed=0,chi=0;sel_.forEach(function(r){got+=r.got;billed+=r.billed;chi+=r.chi;});
  var mx=0;rows.forEach(function(d){mx=Math.max(mx,d.billed/1e6,d.chi/1e6);});var max=Math.max(10,Math.ceil(mx/10)*10);
  var W=600,Hh=230,Lm=36,B=26,Tm=14,pw=(W-Lm)/12,svg='<svg class="bar-chart" viewBox="0 0 '+W+' '+Hh+'" role="img" aria-label="Biểu đồ cột thu và chi 12 tháng năm '+Y+', đơn vị triệu đồng">';
  [0,1,2,3].forEach(function(i){var v=max/3*i,y=Tm+(Hh-Tm-B)*(1-v/max);svg+='<line x1="'+Lm+'" x2="'+W+'" y1="'+y+'" y2="'+y+'" stroke="#E2E8F0"/><text x="'+(Lm-6)+'" y="'+(y+4)+'" font-size="11" text-anchor="end" fill="#64748B">'+Math.round(v)+'</text>';});
  rows.forEach(function(d,i){var x=Lm+i*pw+pw*0.12,bw=pw*0.36,on=inPeriod(d.k);
    [[d.billed/1e6,on?'#2563EB':'#BFDBFE'],[d.chi/1e6,on?'#F59E0B':'#FDE68A']].forEach(function(p,k){var g=(Hh-Tm-B)*p[0]/max,y=Hh-B-g;svg+='<rect x="'+(x+k*(bw+2))+'" y="'+y+'" width="'+bw+'" height="'+Math.max(g,p[0]>0?1:0)+'" rx="2" fill="'+p[1]+'"/>';});
    svg+='<text x="'+(Lm+i*pw+pw/2)+'" y="'+(Hh-8)+'" font-size="11" text-anchor="middle" fill="'+(on?'#0F172A':'#64748B')+'" font-weight="'+(on?800:500)+'">T'+d.m+'</text>';});
  svg+='</svg>';
  var debts=debtsOf(h),ys=[TODAY.slice(0,4)];
  H.forEach(function(x){invsOf(x.id).forEach(function(i){var y=i.month.slice(0,4);if(ys.indexOf(y)<0)ys.push(y);});});ys.sort().reverse();
  var o='<h1>Báo cáo</h1><div class="fgrid" style="margin:0 0 12px">'+sel('ryear','Năm',ys.map(function(y){return [y,'Năm '+y]}),Y)+sel('rmon','Kỳ báo cáo',[['all','Cả năm']].concat([1,2,3,4,5,6,7,8,9,10,11,12].map(function(m){return [pad(m),'Tháng '+m]})),M)+'</div>';
  o+='<div class="cards">'+card('Tỷ lệ lấp đầy',Math.round(occOf(h)*100)+'%',h.type==='home'?'Hôm nay':'Hiện tại, theo '+(h.type==='ktx'?'giường':'phòng'))+card('Đã thu · '+periodLabel(),fmt(got),'Tiền thực tế đã vào sổ')+card('Đã lập · '+periodLabel(),fmt(billed),h.type==='home'?'Tổng tiền các đặt phòng':'Tổng hóa đơn')+card('Chi · '+periodLabel(),fmt(chi),'Các khoản đã chi')+card('Lợi nhuận tạm tính',billed||chi?fmt(billed-chi):'—','Đã lập trừ chi')+'</div>';
  o+='<h2>Thu và chi năm '+Y+' (triệu đồng)</h2><div class="card">'+svg+'<div class="legend"><span><i style="background:#2563EB"></i>Đã lập</span><span><i style="background:#F59E0B"></i>Chi</span><span>Tháng đang chọn đậm màu</span></div></div>';
  o+='<h2>Chi tiết theo tháng</h2><div class="calwrap"><table class="cmp"><thead><tr><th>Tháng</th><th>Đã lập</th><th>Đã thu</th><th>Chi</th><th>Lợi nhuận</th></tr></thead><tbody>'+rows.filter(function(r){return r.billed||r.chi||r.got}).map(function(r){return '<tr'+(inPeriod(r.k)?' style="background:#EFF6FF"':'')+'><td>T'+r.m+'</td><td>'+fmt(r.billed)+'</td><td>'+fmt(r.got)+'</td><td>'+fmt(r.chi)+'</td><td class="'+(r.profit<0?'neg':'pos')+'">'+fmt(r.profit)+'</td></tr>'}).join('')+'</tbody></table></div>';
  o+='<h2>Công nợ hiện tại</h2>'+(debts.length?'<div class="list">'+debts.slice(0,6).map(function(d){return rowHtml(d[0],d[1],'Còn thiếu','<span class="amt">'+fmt(d[2])+'</span>')}).join('')+'</div>':'<div class="empty">Không còn công nợ.</div>');
  o+='<h2>So sánh các nhà</h2><div class="calwrap"><table class="cmp"><thead><tr><th>Nhà</th><th>Loại</th><th>Lấp đầy</th><th>Còn nợ</th></tr></thead><tbody>'+H.map(function(x){return '<tr><td>'+esc(x.name)+'</td><td>'+TYPE[x.type].n+'</td><td>'+Math.round(occOf(x)*100)+'%</td><td>'+fmt(owedOf(x.id))+'</td></tr>'}).join('')+'</tbody></table></div>';
  return o+'<div class="acts"><button class="btn primary" data-act="xl" type="button">Xuất Excel · '+periodLabel()+'</button></div><p class="demo">File Excel gồm các trang: Tổng quan, Theo tháng, '+(h.type==='home'?'Đặt phòng':'Hóa đơn')+', Thu chi, Công nợ.</p>';
}
/* ===== xuất Excel đẹp (ExcelJS tải khi cần; app thật sẽ đóng gói sẵn để dùng offline) ===== */
function saveFile(fname,blob){
  var done=function(){toast('Đã lưu file '+fname);return true;};
  var cap=window.Capacitor&&Capacitor.Plugins&&Capacitor.Plugins.Filesystem&&Capacitor.Plugins.Share;
  if(cap){
    return new Promise(function(res){var r=new FileReader();r.onload=function(){
      Capacitor.Plugins.Filesystem.writeFile({path:fname,data:String(r.result).split(',')[1],directory:'CACHE'}).then(function(w){return Capacitor.Plugins.Share.share({title:fname,url:w.uri,dialogTitle:'Lưu hoặc gửi file'});}).then(function(){res(true);},function(e){if(!/cancel/i.test(String(e&&e.message||e)))warn('Không lưu được file');res(false);});
    };r.readAsDataURL(blob);});
  }
  var file;try{file=new File([blob],fname,{type:blob.type});}catch(e){}
  if(file&&isMobile()&&navigator.canShare&&navigator.canShare({files:[file]})){
    return navigator.share({files:[file],title:fname}).then(function(){return true;},function(e){if(e&&e.name==='AbortError')return false;return viaAnchor();});
  }
  function viaAnchor(){var a=document.createElement('a');a.href=URL.createObjectURL(blob);a.download=fname;document.body.appendChild(a);a.click();setTimeout(function(){URL.revokeObjectURL(a.href);a.remove();},1500);return done();}
  if(window.claude&&claude.use){return claude.use('downloads').then(function(d){if(!d)return viaAnchor();return d.save({filename:fname,data:blob}).then(done,function(e){if(e&&e.code==='declined')return false;warn('Không lưu được file');return false;});},viaAnchor);}
  return Promise.resolve(viaAnchor());
}
function exportXlsx(){try{buildXlsx();}catch(e){warn('Không tạo được file Excel: '+e.message);}}
/* Excel đẹp, cùng kiểu file doanh thu của MAO: thanh tiêu đề xanh, tiêu đề cột navy, dòng so le, dòng tổng xanh nhạt, cố định tiêu đề */
var XC={blue:"FF2563EB",navy:"FF0F172A",sky:"FF38BDF8",bg:"FFF8FAFC",head:"FF0369A1",line:"FF94A3B8",grid:"FFCBD5E1",light:"FFEFF6FF",total:"FFDBEAFE",white:"FFFFFFFF",mute:"FF64748B"};
var MONEY='#,##0" đ"';
function xfill(c){return {type:"pattern",pattern:"solid",fgColor:{argb:c}};}
function xborder(c,st){var b={style:st||"thin",color:{argb:c||XC.line}};return {top:b,left:b,bottom:b,right:b};}
function xTitle(ws,title,sub,ncol){
  ws.mergeCells(1,1,1,ncol);
  var t=ws.getCell(1,1);t.value=title;t.font={bold:true,size:16,color:{argb:XC.white}};t.fill=xfill(XC.blue);t.alignment={vertical:"middle",horizontal:"center"};t.border=xborder(XC.blue,"medium");
  ws.getRow(1).height=34;
  ws.mergeCells(2,1,2,ncol);
  var u=ws.getCell(2,1);u.value=sub;u.fill=xfill(XC.light);u.alignment={vertical:"middle",horizontal:"center",wrapText:true};u.border=xborder(XC.grid);u.font={size:11,italic:true,color:{argb:XC.navy}};
  ws.getRow(2).height=22;
}
function xHeader(ws,r,heads){
  var row=ws.getRow(r);
  heads.forEach(function(h,i){var c=row.getCell(i+1);c.value=h;c.font={bold:true,size:11,color:{argb:XC.white}};c.fill=xfill(XC.head);c.alignment={vertical:"middle",horizontal:"center",wrapText:true};c.border=xborder(XC.head,"medium");});
  row.height=28;
}
function xRows(ws,start,rows,fmts,aligns){
  rows.forEach(function(r,k){
    var row=ws.getRow(start+k);
    r.forEach(function(v,i){var c=row.getCell(i+1);c.value=v;if(fmts[i])c.numFmt=fmts[i];c.border=xborder();c.fill=xfill(k%2?XC.light:XC.white);c.font={size:11,bold:i===0,color:{argb:XC.navy}};c.alignment={vertical:"middle",horizontal:aligns[i]||"left",indent:(aligns[i]||"left")==="left"?1:0,wrapText:true};});
    row.height=22;
  });
}
function xTotal(ws,r,vals,fmts,aligns){
  var row=ws.getRow(r);
  vals.forEach(function(v,i){var c=row.getCell(i+1);c.value=v;if(fmts[i])c.numFmt=fmts[i];c.font={bold:true,color:{argb:XC.navy}};c.fill=xfill(XC.total);
    c.border={top:{style:"medium",color:{argb:XC.blue}},bottom:{style:"medium",color:{argb:XC.blue}},left:{style:"thin",color:{argb:XC.line}},right:{style:"thin",color:{argb:XC.line}}};
    c.alignment={vertical:"middle",horizontal:aligns[i]||"left"};});
  row.height=24;
}
function xSection(ws,r,text,ncol){ws.mergeCells(r,1,r,ncol);var c=ws.getCell(r,1);c.value=text;c.font={bold:true,size:12,color:{argb:XC.blue}};ws.getRow(r).height=22;}
function xPrint(ws,land){ws.pageSetup={paperSize:9,orientation:land?"landscape":"portrait",fitToPage:true,fitToWidth:1,fitToHeight:0,margins:{left:.4,right:.4,top:.5,bottom:.5,header:.2,footer:.2}};}
function xNote(ws,r,text,ncol){ws.mergeCells(r,1,r,ncol);var c=ws.getCell(r,1);c.value=text;c.font={italic:true,size:10,color:{argb:XC.mute}};}
function xStatusColor(ws,col,from,to){for(var r=from;r<=to;r++){var c=ws.getCell(r,col),v=c.value,ok=v==='Đã thu đủ',bad=v==='Chưa thu'||v==='Còn thiếu';c.font={bold:true,color:{argb:ok?'FF166534':bad?'FF991B1B':'FF92400E'}};c.fill=xfill(ok?'FFDCFCE7':bad?'FFFEE2E2':'FFFEF3C7');}}
function buildXlsx(){
  var h=cur(),Y=S.f.ryear,rows=periodRows(h,Y),sel_=rows.filter(function(r){return inPeriod(r.k)}),lab=periodLabel(),isH=h.type==='home',now=new Date();
  var wb=new MiniXlsx.Workbook();wb.creator='MAH · Missing App Home';wb.created=now;
  var sub=h.name+'  ·  '+TYPE[h.type].n+'  ·  '+lab+'  ·  Xuất ngày '+dmy(TODAY);
  var got=0,billed=0,chi=0;sel_.forEach(function(r){got+=r.got;billed+=r.billed;chi+=r.chi;});
  var debts=debtsOf(h),debtSum=debts.reduce(function(a,d){return a+d[2]},0);
  /* Trang 1: Tổng hợp */
  var w1=wb.addWorksheet('Tổng hợp',{views:[{showGridLines:false}]});
  w1.columns=[{width:40},{width:18},{width:18},{width:18},{width:18}];
  xTitle(w1,'BÁO CÁO '+(isH?'HOMESTAY':'THUÊ TRỌ'),sub,5);
  xSection(w1,4,'TỔNG QUAN',5);
  var kpi=[['Tỷ lệ lấp đầy hiện tại',occOf(h),'0%'],['Tổng đã lập',billed,MONEY],['Tổng đã thu',got,MONEY],['Tổng chi',chi,MONEY],['Lợi nhuận tạm tính (đã lập trừ chi)',billed-chi,MONEY],['Công nợ hiện tại',debtSum,MONEY]];
  kpi.forEach(function(k,i){
    var r=5+i;w1.mergeCells(r,2,r,5);
    var a=w1.getCell(r,1);a.value=k[0];a.font={bold:true,color:{argb:XC.navy}};a.fill=xfill(XC.light);a.border=xborder();a.alignment={vertical:'middle',indent:1};
    var b=w1.getCell(r,2);b.value=k[1];b.numFmt=k[2];b.border=xborder();b.alignment={vertical:'middle',horizontal:'center'};for(var cc=3;cc<=5;cc++)w1.getCell(r,cc).border=xborder();
    b.font=i===4?{bold:true,size:14,color:{argb:k[1]<0?'FFB91C1C':XC.blue}}:{bold:true,color:{argb:XC.navy}};
    w1.getRow(r).height=i===4?26:22;
  });
  xSection(w1,12,'CHI TIẾT THEO THÁNG NĂM '+Y,5);
  xHeader(w1,13,['Tháng','Đã lập','Đã thu','Chi','Lợi nhuận']);
  var al=['left','right','right','right','right'],fm=[null,MONEY,MONEY,MONEY,MONEY];
  xRows(w1,14,rows.map(function(r){return ['Tháng '+r.m,r.billed,r.got,r.chi,{formula:'B'+(13+r.m)+'-D'+(13+r.m),result:r.profit}];}),fm,al);
  xTotal(w1,26,['Cả năm',{formula:'SUM(B14:B25)',result:rows.reduce(function(a,r){return a+r.billed},0)},{formula:'SUM(C14:C25)',result:rows.reduce(function(a,r){return a+r.got},0)},{formula:'SUM(D14:D25)',result:rows.reduce(function(a,r){return a+r.chi},0)},{formula:'SUM(E14:E25)',result:rows.reduce(function(a,r){return a+r.profit},0)}],fm,al);
  rows.forEach(function(r){if(inPeriod(r.k)){var c=w1.getCell(13+r.m,1);c.font={bold:true,size:11,color:{argb:XC.blue}};}});
  xNote(w1,28,'Tháng đang chọn ('+lab+') được tô chữ xanh. Xuất từ MAH · © 2026 Nguyễn Tấn Tài (Missing).',5);
  xPrint(w1);
  /* Trang 2: Hóa đơn hoặc đặt phòng */
  var list,w2,n2;
  if(isH){
    list=BK.filter(function(b){return b.hid===h.id&&b.st!=='cancel'&&inPeriod(mkey(b.inD))}).sort(function(a,b){return a.inD.localeCompare(b.inD)});
    w2=wb.addWorksheet('Đặt phòng',{views:[{state:'frozen',ySplit:4,showGridLines:false}]});n2=9;
    w2.columns=[{width:12},{width:26},{width:14},{width:14},{width:9},{width:16},{width:16},{width:16},{width:16}];
    xTitle(w2,'DANH SÁCH ĐẶT PHÒNG',sub,n2);xHeader(w2,4,['Phòng','Khách','Đến ngày','Đi ngày','Số đêm','Tổng tiền','Đã thu','Còn lại','Trạng thái']);
    var f2=[null,null,null,null,'0',MONEY,MONEY,MONEY],a2=['center','left','center','center','center','right','right','right','center'];
    xRows(w2,5,list.map(function(b){var lf=bkLeft(b);return [b.unit,b.guest,dmy(b.inD),dmy(b.outD),diff(b.inD,b.outD),bkTotal(b),bkPaid(b),lf,lf>0?'Còn thiếu':'Đã thu đủ'];}),f2,a2);
    var e2=4+list.length;
    if(list.length){xStatusColor(w2,9,5,e2);w2.autoFilter={from:'A4',to:'I'+e2};xTotal(w2,e2+1,['Tổng cộng','','','',{formula:'SUM(E5:E'+e2+')',result:0},{formula:'SUM(F5:F'+e2+')',result:0},{formula:'SUM(G5:G'+e2+')',result:0},{formula:'SUM(H5:H'+e2+')',result:0},''],f2,a2);}
  }else{
    list=invsOf(h.id).filter(function(i){return inPeriod(i.month)}).sort(function(a,b){return a.month.localeCompare(b.month)||a.unit.localeCompare(b.unit)});
    w2=wb.addWorksheet('Hóa đơn',{views:[{state:'frozen',ySplit:4,showGridLines:false}]});n2=7;
    w2.columns=[{width:12},{width:26},{width:12},{width:18},{width:18},{width:18},{width:16}];
    xTitle(w2,'DANH SÁCH HÓA ĐƠN',sub,n2);xHeader(w2,4,['Phòng','Khách','Tháng','Tổng tiền','Đã thu','Còn lại','Trạng thái']);
    var f2b=[null,null,null,MONEY,MONEY,MONEY],a2b=['center','left','center','right','right','right','center'];
    xRows(w2,5,list.map(function(x){var l=LS.filter(function(y){return y.id===x.lease})[0],pd=invPaid(x),lf=invLeft(x);return [x.unit+(x.bed||''),l?l.t.name:'',mlabel(x.month),x.total,pd,lf,lf>0?(pd>0?'Thu một phần':'Chưa thu'):'Đã thu đủ'];}),f2b,a2b);
    var e2b=4+list.length;
    if(list.length){xStatusColor(w2,7,5,e2b);w2.autoFilter={from:'A4',to:'G'+e2b};xTotal(w2,e2b+1,['Tổng cộng','','',{formula:'SUM(D5:D'+e2b+')',result:0},{formula:'SUM(E5:E'+e2b+')',result:0},{formula:'SUM(F5:F'+e2b+')',result:0},''],f2b,a2b);}
  }
  if(!list.length)xNote(w2,5,'Không có dữ liệu trong kỳ này',n2);
  xPrint(w2,true);
  /* Trang 3: Thu chi */
  var w3=wb.addWorksheet('Thu chi',{views:[{state:'frozen',ySplit:4,showGridLines:false}]});
  w3.columns=[{width:14},{width:10},{width:52},{width:18},{width:18}];
  xTitle(w3,'SỔ THU CHI',sub,5);xHeader(w3,4,['Ngày','Loại','Nội dung','Thu','Chi']);
  var L=ledger(h.id).filter(function(e){return inPeriod(mkey(e.d))}).sort(function(a,b){return a.d.localeCompare(b.d)}),f3=[null,null,null,MONEY,MONEY],a3=['center','center','left','right','right'];
  xRows(w3,5,L.map(function(e){return [dmy(e.d),e.t==='thu'?'Thu':'Chi',e.note,e.t==='thu'?e.amt:null,e.t==='chi'?e.amt:null];}),f3,a3);
  var e3=4+L.length;
  if(L.length){
    L.forEach(function(e,i){var c=w3.getCell(5+i,2);c.font={bold:true,color:{argb:e.t==='thu'?'FF166534':'FF991B1B'}};});
    w3.autoFilter={from:'A4',to:'E'+e3};xTotal(w3,e3+1,['Tổng cộng','','',{formula:'SUM(D5:D'+e3+')',result:0},{formula:'SUM(E5:E'+e3+')',result:0}],f3,a3);
  }else xNote(w3,5,'Không có khoản nào trong kỳ này',5);
  xPrint(w3);
  /* Trang 4: Công nợ */
  var w4=wb.addWorksheet('Công nợ',{views:[{state:'frozen',ySplit:4,showGridLines:false}]});
  w4.columns=[{width:12},{width:32},{width:20}];
  xTitle(w4,'CÔNG NỢ TẠI NGÀY '+dmy(TODAY),sub,3);xHeader(w4,4,['Phòng','Khách','Còn thiếu']);
  var f4=[null,null,MONEY],a4=['center','left','right'];
  xRows(w4,5,debts,f4,a4);
  if(debts.length){var e4=4+debts.length;xTotal(w4,e4+1,['Tổng cộng','',{formula:'SUM(C5:C'+e4+')',result:debtSum}],f4,a4);}
  else xNote(w4,5,'Không còn công nợ',3);
  xPrint(w4);
  var fname='MAH_BaoCao_'+nrm(h.name).replace(/[^a-z0-9]+/g,'-').replace(/^-|-$/g,'')+'_'+(S.f.rmon==='all'?Y:Y+'-'+S.f.rmon)+'.xlsx';
  wb.xlsx.writeBuffer().then(function(buf){saveFile(fname,new Blob([buf],{type:'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'}));});
}
function settings(){
  var h=cur(),lb=STATE.lastBackup?fmtTs(STATE.lastBackup):'';
  var o=(STATE.demo?'<div class="banner"><span style="flex:1;min-width:200px">Đang xem dữ liệu mẫu.</span><button class="btn sm" data-act="cleardemo" type="button">Xóa dữ liệu mẫu</button></div>':'')+'<h1>Cài đặt</h1><div class="banner'+(lb?' ok':'')+'"><span style="flex:1;min-width:200px">'+(lb?'Đã sao lưu lúc '+lb+'. Cất file ở Drive, iCloud hoặc gửi qua Zalo cho chắc.':'Chưa sao lưu lần nào. Dữ liệu chỉ nằm trên máy này, mất máy là mất hết.')+'</span><button class="btn primary sm" data-act="backup" type="button">Sao lưu ngay</button></div>';
  o+='<h2>Các nhà đang quản lý</h2><div class="list">'+H.map(function(x){return '<div class="row"><span class="mid"><b>'+esc(x.name)+'</b><small>'+TYPE[x.type].n+' · '+x.units.length+' '+(x.type==='ktx'?'phòng':'phòng')+'</small></span>'+(x.id===S.hid?'<span class="pill s-ok"><i>✓</i>Đang xem</span>':'<button class="btn sm" data-act="pickhouse" data-id="'+x.id+'" type="button">Chọn</button>')+'<button class="btn sm" data-act="edithouse" data-id="'+x.id+'" type="button" aria-label="Sửa '+esc(x.name)+'">Sửa</button></div>'}).join('')+'</div><div class="acts"><button class="btn" data-act="newhouse" type="button">Thêm nhà mới</button></div>';
  o+='<h2>Giá dịch vụ của '+esc(h.name)+'</h2><div class="card"><div class="fgrid">'+fld('pe','Điện (đồng mỗi kWh)',h.rate.e,{mode:'numeric'})+fld('pw','Nước (đồng mỗi m³)',h.rate.w,{mode:'numeric'})+'</div><h2 style="font-size:15px;margin:16px 0 8px">Dịch vụ thu hàng tháng</h2>'+(h.fixed.length?h.fixed.map(function(f,i){return '<div class="svc"><label class="f">Tên dịch vụ<input class="in" id="pn'+i+'" value="'+esc(f[0])+'" maxlength="30"></label><label class="f">Giá (đồng/tháng)<input class="in" id="px'+i+'" value="'+f[1]+'" inputmode="numeric"></label><button class="btn sm danger" data-act="delsvc" data-i="'+i+'" type="button" aria-label="Xóa '+esc(f[0])+'">Xóa</button></div>'}).join(''):'<p class="subt">Chưa có dịch vụ nào. Thêm bên dưới.</p>')+'<div class="svc new"><label class="f">Dịch vụ mới<input class="in" id="nsn" maxlength="30" placeholder="Ví dụ: Giặt sấy, Gửi xe, Vệ sinh"></label><label class="f">Giá (đồng/tháng)<input class="in" id="nsp" inputmode="numeric" placeholder="0"></label><button class="btn sm primary" data-act="addsvc" type="button">Thêm</button></div><div class="acts"><button class="btn primary" data-act="savepx" type="button">Lưu giá</button></div><p class="demo">Dịch vụ thêm vào sẽ tự có trong hóa đơn lập từ tháng sau, hóa đơn cũ giữ nguyên.</p></div>';
  if(h.type!=='home'){var bd=h.bday||5;o+='<h2>Lịch chốt thu tiền hằng tháng</h2><div class="card"><p class="subt" style="margin-top:0">Chọn ngày chốt điện nước và thu tiền mỗi tháng. App nhắc ở Tổng quan và ghi vào hợp đồng mẫu.</p><div class="chips">'+[5,10,20].map(function(d){return '<button class="chip" type="button" data-act="setbday" data-v="'+d+'" aria-pressed="'+(bd===d)+'">Ngày '+d+'</button>'}).join('')+'</div><div class="svc"><label class="f">Hoặc chọn ngày khác (1 đến 28)<input class="in" id="bday" value="'+bd+'" inputmode="numeric" maxlength="2"></label><span></span><button class="btn sm primary" data-act="savebday" type="button">Đặt ngày này</button></div><p class="demo">Kỳ chốt tiếp theo: '+dmy(nextDue(h))+'.</p></div>';}
  o+='<h2>Tài khoản nhận tiền (ghi vào tin nhắc)</h2><div class="card"><div class="fgrid">'+fld('bn1','Ngân hàng',STATE.bank.name)+fld('bn2','Số tài khoản',STATE.bank.no)+fld('bn3','Tên chủ tài khoản',STATE.bank.own)+'</div><div class="acts"><button class="btn primary" data-act="savebank" type="button">Lưu tài khoản</button></div></div>';
  o+='<h2>Mẫu tin nhắc đóng tiền</h2><div class="card"><label class="f">Nội dung tin<textarea class="in ta" id="stpl" rows="5">'+esc(STATE.tpl)+'</textarea></label><p class="demo">Các mục tự điền: {tên} {phòng} {tháng} {số tiền} {hạn} {tk}</p><div class="acts"><button class="btn primary" data-act="savetpl" type="button">Lưu mẫu tin</button></div></div>';
  o+='<h2>Sao lưu và khôi phục</h2><div class="card"><div class="acts" style="margin:0"><button class="btn" data-act="backup" type="button">Sao lưu ra file</button><button class="btn" data-act="restore" type="button">Khôi phục từ file</button></div><p class="demo">Dữ liệu nằm trên máy này, dùng được khi không có mạng. App tự giữ 8 bản dự phòng trong máy, nhưng hãy sao lưu ra file và cất ở Drive, iCloud hoặc gửi qua Zalo cho chắc.</p><div id="snaps"></div><div class="acts"><button class="btn danger" data-act="askwipe" type="button">Xóa toàn bộ dữ liệu</button></div></div>';
  return o+'<h2>Giới thiệu</h2><div class="card">'+kv([['Phần mềm','MAH · Missing App Home'],['Bản quyền','© 2026 Nguyễn Tấn Tài (Missing)'],['Giấy phép','Dùng miễn phí, cấm bán lại']])+'<div class="acts"><button class="btn" data-act="license" type="button">Xem giấy phép</button></div></div>';
}
function houseSheet(){
  openSheet(head('Chọn nhà')+'<div class="list" style="margin-top:10px">'+H.map(function(x){return '<button class="row linkrow" data-act="pickhouse" data-id="'+x.id+'" type="button"><span class="mid"><b>'+esc(x.name)+'</b><small>'+TYPE[x.type].n+' · '+esc(x.addr)+'</small></span>'+(x.id===S.hid?'<span class="pill s-ok"><i>✓</i>Đang xem</span>':'')+'</button>'}).join('')+'</div><div class="acts"><button class="btn primary" data-act="newhouse" type="button">Thêm nhà mới</button></div>');
}
function houseForm(){
  S.editH=null;
  openSheet(head('Thêm nhà mới')+'<div class="fgrid">'+fld('hn','Tên nhà','',{max:40,ph:'Ví dụ: Nhà trọ Bình An'})+fld('ha','Địa chỉ','',{max:60})+sel('ht','Loại hình',Object.keys(TYPE).map(function(k){return [k,TYPE[k].n]}),'tro')+'</div><div class="acts"><button class="btn primary" data-act="savehouse" type="button">Tạo nhà</button></div>');
}
function houseEdit(id){
  var x=H.filter(function(y){return y.id===id})[0];S.editH=id;
  openSheet(head('Sửa nhà')+'<div class="fgrid">'+fld('hn','Tên nhà',x.name,{max:40})+fld('ha','Địa chỉ',x.addr,{max:60})+(x.units.length?'<label class="f">Loại hình<input class="in" value="'+esc(TYPE[x.type].n)+'" disabled><em>Nhà đã có phòng nên không đổi loại được</em></label>':sel('ht','Loại hình',Object.keys(TYPE).map(function(k){return [k,TYPE[k].n]}),x.type))+'</div><div class="acts"><button class="btn primary" data-act="savehouse" type="button">Lưu</button>'+(H.length>1?'<button class="btn danger" data-act="askdelhouse" data-id="'+id+'" type="button">Xóa nhà</button>':'')+'</div>');
}
function delHouse(id){
  var n=H.filter(function(y){return y.id===id})[0].name,k=function(x){return x.hid!==id};
  H=H.filter(function(y){return y.id!==id});LS=LS.filter(k);INV=INV.filter(k);BK=BK.filter(k);EXP=EXP.filter(k);INC=INC.filter(k);TK=TK.filter(k);
  Object.keys(AS).forEach(function(a){if(a.indexOf(id+'|')===0)delete AS[a];});
  if(S.hid===id){S.hid=H[0]?H[0].id:'';S.tab='home';}persist();closeSheet();toast('Đã xóa '+n);render();
}
function saveHouse(){
  var n=val('hn'),t=val('ht');if(!n){warn('Nhập tên nhà');return;}
  if(n.length<2){warn('Tên nhà cần ít nhất 2 ký tự');return;}
  if(H.some(function(y){return y.id!==S.editH&&y.name.toLowerCase()===n.toLowerCase()})){warn('Tên nhà này đã có rồi');return;}
  if(S.editH){var x=H.filter(function(y){return y.id===S.editH})[0];x.name=n;x.addr=val('ha');if(t&&!x.units.length)x.type=t;S.editH=null;closeSheet();toast('Đã lưu');render();return;}
  var fx={tro:[['Rác',30000],['Wifi',50000]],mini:[['Rác',40000],['Thang máy',60000],['Gửi xe',100000]],ktx:[['Rác',20000],['Wifi',30000]],home:[]}[t];
  H.push({id:'h'+(H.length+1)+'x'+(++XID),type:t,name:n,addr:val('ha'),bday:5,rate:{e:3500,w:20000},fixed:fx.map(function(f){return [f[0],f[1]]}),units:[]});
  S.hid=H[H.length-1].id;S.tab='units';closeSheet();toast('Đã tạo '+n+'. Hãy thêm phòng đầu tiên.');render();
}
var MORE=[['tenants','Khách thuê'],['leases','Hợp đồng'],['cash','Thu chi'],['issues','Sự cố'],['assets','Tài sản'],['set','Cài đặt']];
var ICON={
 home:'<svg viewBox="0 0 24 24"><path d="M3 11l9-8 9 8"/><path d="M5 10v10h14V10"/></svg>',
 rooms:'<svg viewBox="0 0 24 24"><rect x="3" y="3" width="7" height="7" rx="1.5"/><rect x="14" y="3" width="7" height="7" rx="1.5"/><rect x="3" y="14" width="7" height="7" rx="1.5"/><rect x="14" y="14" width="7" height="7" rx="1.5"/></svg>',
 bills:'<svg viewBox="0 0 24 24"><path d="M6 3h12v18l-3-2-3 2-3-2-3 2z"/><path d="M9 8h6M9 12h6"/></svg>',
 cal:'<svg viewBox="0 0 24 24"><rect x="3" y="5" width="18" height="16" rx="2"/><path d="M3 10h18M8 3v4M16 3v4"/></svg>',
 report:'<svg viewBox="0 0 24 24"><path d="M4 20V10M10 20V4M16 20v-8M22 20H2"/></svg>',
 users:'<svg viewBox="0 0 24 24"><circle cx="9" cy="8" r="3.5"/><path d="M2.5 20c.5-4 3-6 6.5-6s6 2 6.5 6"/><path d="M16 4.5a3.5 3.5 0 0 1 0 7M18 14c2 .7 3.2 2.5 3.5 6"/></svg>',
 doc:'<svg viewBox="0 0 24 24"><path d="M6 3h9l4 4v14H6z"/><path d="M14 3v5h5M9 13h7M9 17h7"/></svg>',
 wallet:'<svg viewBox="0 0 24 24"><path d="M3 7h16a2 2 0 0 1 2 2v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><path d="M3 7l3-3h11v3M16 14h2"/></svg>',
 wrench:'<svg viewBox="0 0 24 24"><path d="M14.5 6.5a4 4 0 0 0-5 5L3 18l3 3 6.5-6.5a4 4 0 0 0 5-5l-2.5 2.5-2.5-.5-.5-2.5z"/></svg>',
 box:'<svg viewBox="0 0 24 24"><path d="M3 7l9-4 9 4v10l-9 4-9-4z"/><path d="M3 7l9 4 9-4M12 11v10"/></svg>',
 set:'<svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="3"/><path d="M19 12a7 7 0 0 0-.1-1.2l2-1.5-2-3.4-2.3.9a7 7 0 0 0-2-1.2L14 3h-4l-.6 2.6a7 7 0 0 0-2 1.2l-2.3-.9-2 3.4 2 1.5A7 7 0 0 0 5 12c0 .4 0 .8.1 1.2l-2 1.5 2 3.4 2.3-.9a7 7 0 0 0 2 1.2L10 21h4l.6-2.6a7 7 0 0 0 2-1.2l2.3.9 2-3.4-2-1.5c.1-.4.1-.8.1-1.2z"/></svg>',
 more:'<svg viewBox="0 0 24 24"><circle cx="5" cy="12" r="1.6"/><circle cx="12" cy="12" r="1.6"/><circle cx="19" cy="12" r="1.6"/></svg>'
};
function navItems(h){var t=h.type;return [['home','Tổng quan','home'],['units',t==='mini'?'Căn hộ':'Phòng','rooms'],['bills',t==='home'?'Đặt phòng':'Hóa đơn',t==='home'?'cal':'bills'],['report','Báo cáo','report'],['tenants',t==='home'?'Khách':'Khách thuê','users'],t!=='home'?['leases','Hợp đồng','doc']:null,['cash','Thu chi','wallet'],['issues','Sự cố','wrench'],['assets','Tài sản','box'],['set','Cài đặt','set']].filter(Boolean);}
function moreView(){
  var h=cur(),items=navItems(h).slice(4);
  return '<h1>Thêm</h1><div class="cards">'+items.map(function(n){return '<button class="card moreitem" data-act="tab" data-v="'+n[0]+'" type="button"><span class="mi">'+ICON[n[2]]+'</span><b>'+n[1]+'</b></button>'}).join('')+'</div>';
}
/* ===== dựng giao diện ===== */
function welcome(){return '<div class="card" style="text-align:center;padding:28px 18px"><h1 style="margin-top:0">Chào mừng đến MAH</h1><p class="subt">Quản lý nhà trọ, chung cư mini, ký túc xá, homestay. Miễn phí, dữ liệu nằm ngay trên máy của bạn, dùng được cả khi không có mạng.</p><div class="acts" style="justify-content:center"><button class="btn primary" data-act="newhouse" type="button">Tạo nhà đầu tiên</button><button class="btn" data-act="demo" type="button">Xem thử dữ liệu mẫu</button><button class="btn" data-act="restore" type="button">Khôi phục từ file</button></div></div>';}
function render(){
  if(!H.length){$('tabs').innerHTML='';$('main').innerHTML=welcome();$('house').textContent='MAH';$('hsub').textContent='Missing App Home';persist();return;}
  var h=cur(),items=navItems(h),main=items.slice(0,4).map(function(n){return n[0]});
  if(!items.some(function(n){return n[0]===S.tab})&&S.tab!=='chot'&&S.tab!=='more')S.tab='home';
  var extra=items.slice(4).some(function(n){return n[0]===S.tab})||S.tab==='more';
  $('tabs').innerHTML=items.slice(0,4).map(function(n){return '<button type="button" data-act="tab" data-v="'+n[0]+'"'+((S.tab===n[0]||(S.tab==='chot'&&n[0]==='home'))?' aria-current="page"':'')+'>'+ICON[n[2]]+n[1]+'</button>'}).join('')+
   '<button type="button" class="morebtn" data-act="tab" data-v="more"'+(extra?' aria-current="page"':'')+'>'+ICON.more+'Thêm</button>'+
   items.slice(4).map(function(n){return '<button type="button" class="x" data-act="tab" data-v="'+n[0]+'"'+(S.tab===n[0]?' aria-current="page"':'')+'>'+ICON[n[2]]+n[1]+'</button>'}).join('');
  var V={home:home,units:units,bills:h.type==='home'?bookings:bills,report:report,tenants:tenants,leases:leases,cash:cash,issues:issues,assets:assets,set:settings,chot:chot,more:moreView};
  $('main').innerHTML=V[S.tab]();
  $('house').textContent=h.name;$('hsub').textContent=TYPE[h.type].n;
  persist();if(S.tab==='set')snapUi();
}
function snapUi(){snapList().then(function(l){var b=$('snaps');if(!b||!l.length)return;b.innerHTML='<h2 style="font-size:15px">Bản dự phòng trong máy</h2><div class="list">'+l.map(function(s){return '<div class="row"><span class="mid"><b>'+fmtTs(s.at)+'</b><small>'+esc(s.tag)+'</small></span><button class="btn sm" data-act="snaprestore" data-at="'+s.at+'" type="button">Khôi phục</button></div>'}).join('')+'</div>';});}
function go(t){S.tab=t;S.q='';render();window.scrollTo(0,0);}
var DEF={tro:[['Giường',1,'Tốt'],['Tủ quần áo',1,'Tốt'],['Quạt',1,'Tốt']],mini:[['Giường',1,'Tốt'],['Tủ lạnh',1,'Tốt'],['Máy lạnh',1,'Tốt']],ktx:[['Giường tầng',3,'Tốt'],['Tủ cá nhân',6,'Tốt']],home:[['Giường',2,'Tốt'],['Máy lạnh',1,'Tốt'],['TV',1,'Tốt']]};
function readpx(){var h=cur(),e=num('pe'),w=num('pw');if(isNaN(e)||e<0||isNaN(w)||w<0||e>1e6||w>1e7){warn('Kiểm tra giá điện nước','pe');return false;}var fx=[];for(var i=0;i<h.fixed.length;i++){var v=num('px'+i),n=val('pn'+i).trim();if(!n){warn('Tên dịch vụ không được để trống','pn'+i);return false;}if(isNaN(v)||v<0||v>1e8){warn('Kiểm tra giá '+n,'px'+i);return false;}fx.push([n,v]);}h.rate.e=e;h.rate.w=w;h.fixed=fx;return true;}
var LICENSE_TXT="MAH - Missing App Home\nBản quyền © 2026 Nguyễn Tấn Tài (Missing). Giữ toàn bộ quyền.\nCopyright (c) 2026 Nguyễn Tấn Tài (Missing). All rights reserved.\n\nGIẤY PHÉP SỬ DỤNG MAH (MISSING APP HOME)\n\n1. Được phép\n   Bạn được tải, cài đặt và sử dụng MIỄN PHÍ để quản lý nhà trọ, phòng trọ, căn hộ\n   cho thuê của chính bạn, trên bao nhiêu thiết bị của bạn cũng được.\n\n2. Không được phép (nếu chưa có văn bản đồng ý của tác giả)\n   a) Bán, cho thuê, cho mượn có thu phí, hoặc thu tiền dưới bất kỳ hình thức nào\n      từ việc cung cấp phần mềm hoặc bản sao, bản sửa của nó cho người khác.\n   b) Phân phối lại phần mềm hoặc mã nguồn, nguyên bản hay đã sửa, kể cả miễn phí\n      (người khác muốn dùng thì tải từ nơi phát hành chính thức).\n   c) Đóng gói, đổi tên, đổi thương hiệu, hoặc đưa vào sản phẩm hay dịch vụ khác\n      để bán hoặc cung cấp cho người khác.\n   d) Cung cấp như một dịch vụ cho nhiều chủ trọ (thuê ngoài, SaaS).\n   e) Gỡ hoặc sửa thông tin bản quyền, tên phần mềm, logo Missing.\n   f) Dịch ngược, tách mã để sao chép hoặc dựng sản phẩm cạnh tranh, trừ khi\n      pháp luật cho phép.\n\n3. Quyền sở hữu\n   Phần mềm, mã nguồn, logo Missing và tên phần mềm thuộc về tác giả. Giấy phép này\n   chỉ cho quyền sử dụng, không chuyển quyền sở hữu.\n\n4. Dữ liệu và không bảo hành\n   Dữ liệu (phòng, khách thuê, hóa đơn, thu chi) được lưu ngay trên thiết bị của bạn,\n   tác giả không giữ và không truy cập được. Bạn tự chịu trách nhiệm sao lưu: gỡ ứng\n   dụng, xóa dữ liệu trình duyệt, mất hoặc hỏng thiết bị có thể làm mất dữ liệu.\n   Phần mềm được cung cấp \"nguyên trạng\", không bảo hành. Tác giả không chịu trách\n   nhiệm cho thiệt hại phát sinh, gồm mất dữ liệu, sai số tiền, sai thuế. Bạn tự kiểm\n   tra hóa đơn, thu chi và nghĩa vụ thuế với kế toán của mình. Bạn tự chịu trách nhiệm\n   bảo vệ thông tin cá nhân của khách thuê mà bạn nhập vào phần mềm.\n\n5. Chấm dứt\n   Vi phạm thì quyền sử dụng chấm dứt ngay, tác giả có quyền yêu cầu ngừng vi phạm\n   và đòi bồi thường theo pháp luật Việt Nam.\n\n6. Luật áp dụng\n   Pháp luật Việt Nam. Bản tiếng Việt được ưu tiên.\n\nENGLISH SUMMARY\nFree to use for managing your own rental properties. You may not sell, rent,\nredistribute, rebrand, resell, offer as a hosted service, remove copyright or\nbranding, or reverse engineer the software without written permission from the\nauthor. Data is stored on your own device and you are responsible for backups.\nProvided \"as is\" with no warranty. Vietnamese law applies.\n";
var ACT={
 tab:function(el){go(el.dataset.v);},gohome:function(){go('home');},chot:function(){S.chot={};go('chot');},
 ufilter:function(el){S.f.units=el.dataset.v;render();},tfilter:function(el){S.f.tenants=el.dataset.v;render();},lfilter:function(el){S.f.leases=el.dataset.v;render();},
 bfilter:function(el){S.f.bills=el.dataset.v;render();},bclear:function(){S.f.byear='all';S.f.bmon='all';S.f.bills='all';S.q='';render();},bkview:function(el){S.f.bk=el.dataset.v;render();},
 ifilter:function(el){S.f.issues=el.dataset.v;render();},cmonth:function(el){S.f.cash=el.dataset.v;render();},
 close:closeSheet,
 unit:function(el){openSheet(unitSheet(el.dataset.id));},newunit:unitForm,saveunit:saveUnit,
 rent:function(el){leaseForm(el.dataset.id,el.dataset.bed||null);},savelease:function(el){saveLease(el.dataset.unit,el.dataset.bed||null);},
 newlease:newLeaseChooser,pickgo:function(){var p=val('pick').split('|');leaseForm(p[0],p[1]||null);},
 lease:function(el){openSheet(leaseSheet(el.dataset.id));},doc:function(el){openSheet(docSheet(el.dataset.id));},
 renew:function(el){renewSheet(el.dataset.id);},renewok:function(el){var l=LS.filter(function(x){return x.id===el.dataset.id})[0];l.end=addMonths(l.end,+val('rn'));closeSheet();toast('Đã gia hạn đến '+dmy(l.end));render();},
 out:function(el){outSheet(el.dataset.id);},
 outok:function(el){var l=LS.filter(function(x){return x.id===el.dataset.id})[0],rest=l.dep;INV.filter(function(i){return i.lease===l.id&&!invDone(i)}).sort(function(a,b){return a.month.localeCompare(b.month)}).forEach(function(i){var t=Math.min(rest,invLeft(i));if(t>0){i.pay.push({d:TODAY,a:t,m:'Trừ cọc'});rest-=t;}});l.on=false;l.out=TODAY;closeSheet();var left=debtOfLease(l.id);toast('Đã trả '+lbl(l)+(left>0?'. Khách còn nợ '+fmt(left)+' sau khi trừ cọc':', hoàn lại '+fmt(rest)));render();},
 tenant:function(el){openSheet(tenantSheet(el.dataset.id));},tt:function(el){LS.filter(function(x){return x.id===el.dataset.id})[0].t.tt='da';openSheet(tenantSheet(el.dataset.id));render();toast('Đã ghi nhận khai tạm trú');},
 payinv:function(el){paySheet('inv',el.dataset.id);},paylease:function(el){paySheet('lease',el.dataset.id);},paybk:function(el){paySheet('bk',el.dataset.id);},payok:function(el){payOk(el.dataset.kind,el.dataset.id);},
 inv:function(el){openSheet(invSheet(el.dataset.id));},share:function(){toast('Mẫu: ở app thật mở bảng chia sẻ để gửi ảnh qua Zalo, Messenger.');},
 adj:function(el){adjSheet(el.dataset.id);},adjok:function(el){var i=INV.filter(function(x){return x.id===el.dataset.id})[0],n=val('anote'),a=num('aamt');if(!n||isNaN(a)||a===0||Math.abs(a)>1e9){warn('Nhập lý do và số tiền khác 0 (không quá 1 tỷ)',n?'aamt':'anote');return;}if(i.total+a<invPaid(i)){warn('Giảm giá làm tổng nhỏ hơn số đã thu');return;}i.items.push([n,a]);i.total+=a;openSheet(invSheet(i.id));render();toast('Đã cập nhật hóa đơn');},
 mk:chotMake,
 fill:function(){chotUnits(cur()).forEach(function(u,i){if(!chotDone(cur(),u))S.chot[u.id]={e:String(u.e+60+i*9),w:String(u.w+3+(i%3))};});render();},
 remind:function(){remindStart(debtLeaseIds());},remind1:function(el){remindStart([el.dataset.id]);},
 send:function(el){sendRemind(el.dataset.ch);},
 skip:function(){var q=S.remind;q.sent=false;q.i++;if(q.i>=q.ids.length){closeSheet();toast('Đã xong danh sách nhắc');}else remindSheet();},
 bk:function(el){openSheet(bkSheet(el.dataset.id));},newbk:function(el){bkForm(el.dataset.id);},savebk:saveBk,
 checkin:function(el){BK.filter(function(b){return b.id===el.dataset.id})[0].st='in';closeSheet();toast('Đã nhận phòng');render();},
 checkout:function(el){var b=BK.filter(function(x){return x.id===el.dataset.id})[0];b.st='out';closeSheet();toast(bkLeft(b)>0?'Đã trả phòng, còn thiếu '+fmt(bkLeft(b)):'Đã trả phòng');render();},
 askcancelbk:function(el){var b=BK.filter(function(x){return x.id===el.dataset.id})[0];confirmSheet('Hủy đặt phòng của '+esc(b.guest)+'?','Đặt phòng '+esc(b.unit)+' từ '+dmy(b.inD)+' sẽ chuyển sang đã hủy. Tiền đã thu (nếu có) bạn cần tự hoàn lại cho khách.','cancelbk','data-id="'+b.id+'"','Hủy đặt phòng');},
 cancelbk:function(el){BK.filter(function(b){return b.id===el.dataset.id})[0].st='cancel';closeSheet();toast('Đã hủy đặt phòng');render();},
 setbday:function(el){cur().bday=+el.dataset.v;toast('Đã đặt chốt ngày '+el.dataset.v);render();},savebday:function(){var v=num('bday');if(isNaN(v)||v<1||v>28||v!==Math.floor(v)){warn('Nhập ngày từ 1 đến 28');return;}cur().bday=v;toast('Đã đặt chốt ngày '+v);render();},
 newcash:function(el){cashForm(el.dataset.v);},editcash:function(el){cashForm(el.dataset.k==='exp'?'chi':'thu',el.dataset.id);},askdelcash:function(el){var r=cashRec(el.dataset.k,el.dataset.id);confirmSheet('Xóa khoản này?',esc(r.note)+' · '+fmt(r.amt),'delcash','data-k="'+el.dataset.k+'" data-id="'+el.dataset.id+'"');},delcash:function(el){if(el.dataset.k==='exp')EXP=EXP.filter(function(x){return x.id!==el.dataset.id});else INC=INC.filter(function(x){return x.id!==el.dataset.id});closeSheet();toast('Đã xóa');render();},
 editunit:function(el){unitForm(el.dataset.id);},askdelunit:function(el){var id=el.dataset.id;confirmSheet('Xóa '+esc(id)+'?','Xóa luôn lịch sử hợp đồng, hóa đơn, sự cố và tài sản của mục này. Không hoàn lại được.','delunit','data-id="'+esc(id)+'"');},delunit:function(el){delUnit(el.dataset.id);},
 edithouse:function(el){houseEdit(el.dataset.id);},askdelhouse:function(el){var x=H.filter(function(y){return y.id===el.dataset.id})[0];confirmSheet('Xóa '+esc(x.name)+'?','Xóa toàn bộ phòng, khách, hợp đồng, hóa đơn và thu chi của nhà này. Không hoàn lại được. Nên sao lưu trước.','delhouse','data-id="'+x.id+'"');},delhouse:function(el){delHouse(el.dataset.id);},savecash:function(el){saveCash(el.dataset.v);},
 issue:function(el){openSheet(issueSheet(el.dataset.id));},newissue:function(el){issueForm(el.dataset.id);},
 saveissue:function(){var t=val('it');if(!t){warn('Nhập sự cố gì');return;}if(!val('iu')){warn('Chọn phòng bị sự cố');return;}TK.push({id:'t'+(++TID),hid:S.hid,unit:val('iu'),title:t,desc:val('id2')||'Chưa mô tả',st:'Mới',d:TODAY,cost:0});closeSheet();toast('Đã ghi sự cố');S.f.issues='all';if(S.tab!=='home')S.tab='issues';render();},
 issueop:function(el){var x=TK.filter(function(t){return t.id===el.dataset.id})[0];
  if(el.dataset.v==='take'){x.st='Đang xử lý';openSheet(issueSheet(x.id));render();toast('Đã nhận xử lý');return;}
  var c=num('icost');c=isNaN(c)?0:c;if(c<0){warn('Chi phí không âm');return;}x.st='Xong';x.cost=c;
  if(c>0&&$('irec').checked)EXP.push({id:'x'+(++XID),hid:x.hid,d:TODAY,cat:'Sửa chữa',note:'Sự cố '+x.unit+': '+x.title,amt:c});
  closeSheet();toast('Đã xong'+(c>0&&$('irec')?'':''));render();},
 goassets:function(el){S.aunit=el.dataset.id;closeSheet();go('assets');},
 addasset:function(){var n=val('an'),q=num('aq');if(!n||isNaN(q)||q<1||q>999||q!==Math.floor(q)){warn('Nhập tên và số lượng từ 1 đến 999',n?'aq':'an');return;}var k=S.hid+'|'+S.aunit;AS[k]=AS[k]||[];AS[k].push({name:n,q:q,c:val('ac')});toast('Đã thêm '+n);render();toast('Đã thêm '+n);},
 delasset:function(el){var k=S.hid+'|'+S.aunit;var nm=AS[k][+el.dataset.i].name;AS[k].splice(+el.dataset.i,1);toast('Đã xóa '+nm);render();},
 defassets:function(){AS[S.hid+'|'+S.aunit]=DEF[cur().type].map(function(a){return a.slice()});toast('Đã thêm bộ tài sản mặc định');render();},
 house:houseSheet,pickhouse:function(el){S.hid=el.dataset.id;S.f.cash='all';S.f.byear='all';S.f.bmon='all';S.q='';S.aunit='';closeSheet();render();toast('Đang xem '+cur().name);},newhouse:houseForm,savehouse:saveHouse,
 savepx:function(){if(readpx()){toast('Đã lưu giá');render();}},
 addsvc:function(){var h=cur();if(!readpx())return;var n=val('nsn').trim(),p=num('nsp');if(!n){warn('Nhập tên dịch vụ');return;}if(isNaN(p)||p<0){warn('Kiểm tra giá dịch vụ');return;}if(h.fixed.some(function(f){return f[0].toLowerCase()===n.toLowerCase()})){warn('Dịch vụ này đã có');return;}h.fixed.push([n,p]);toast('Đã thêm '+n);render();},
 delsvc:function(el){var h=cur(),i=+el.dataset.i;if(!readpx())return;var n=h.fixed[i][0];h.fixed.splice(i,1);toast('Đã xóa '+n);render();},
 savebank:function(){var a=val('bn1'),b=val('bn2'),c=val('bn3');if(!a||!b||!c){warn('Nhập đủ 3 mục: ngân hàng, số tài khoản, chủ tài khoản','bn'+(!a?1:!b?2:3));return;}if(!/^\d{6,19}$/.test(b.replace(/\s/g,''))){warn('Số tài khoản chỉ gồm 6 đến 19 chữ số','bn2');return;}STATE.bank={name:a,no:b,own:c};toast('Đã lưu tài khoản');},
 savetpl:function(){var t=val('stpl');if(!t){warn('Mẫu tin không được để trống');return;}STATE.tpl=$('stpl').value;toast(/\{số tiền\}/.test(STATE.tpl)?'Đã lưu mẫu tin':'Đã lưu. Lưu ý: tin chưa có {số tiền}, khách sẽ không biết phải đóng bao nhiêu');},
 xl:exportXlsx,
 license:function(){openSheet(head('Giấy phép sử dụng')+'<pre style="white-space:pre-wrap;font:13px/1.5 var(--font);margin:10px 0 0">'+esc(LICENSE_TXT)+'</pre>');},
 backup:function(){saveFile('MAH-saoluu-'+TODAY+'.json',new Blob([JSON.stringify(dump())],{type:'application/json'})).then(function(ok){if(ok){STATE.lastBackup=Date.now();render();}});},
 restore:function(){var f=document.createElement('input');f.type='file';f.accept='.json,application/json';f.onchange=function(){var fl=f.files[0];if(!fl)return;var r=new FileReader();r.onload=function(){var d;try{d=JSON.parse(r.result);}catch(e){}if(!validData(d)){warn('File này không phải file sao lưu của MAH');return;}S.pending=d;confirmSheet('Khôi phục từ file?','File sao lưu lúc '+(d.at?fmtTs(d.at):'không rõ')+' gồm '+d.H.length+' nhà. Dữ liệu hiện tại sẽ bị thay thế (app tự giữ một bản dự phòng trước).','restoreok','','Khôi phục');};r.readAsText(fl);};f.click();},
 restoreok:function(){var d=S.pending;if(!d)return;snap('trước khi khôi phục').then(function(){adopt(d);S.pending=null;S.tab='home';closeSheet();persist();render();toast('Đã khôi phục dữ liệu');});},
 snaprestore:function(el){snapList().then(function(l){var x=l.filter(function(s){return String(s.at)===el.dataset.at})[0];if(!x)return;var d;try{d=JSON.parse(x.data);}catch(e){}if(!validData(d)){warn('Bản dự phòng này bị hỏng');return;}S.pending=d;confirmSheet('Khôi phục bản dự phòng?','Bản lúc '+fmtTs(x.at)+' ('+esc(x.tag)+'). Dữ liệu hiện tại sẽ bị thay thế.','restoreok','','Khôi phục');});},
 askwipe:function(){confirmSheet('Xóa toàn bộ dữ liệu?','Xóa hết nhà, khách, hóa đơn, thu chi trên máy này. App giữ một bản dự phòng trong máy, nhưng nên sao lưu ra file trước.','wipe','','Xóa hết');},
 wipe:function(){snap('trước khi xóa hết').then(function(){H=[];LS=[];INV=[];BK=[];EXP=[];INC=[];TK=[];AS={};HIST={};IID=LID=BID=XID=TID=0;STATE.demo=false;S.hid='';S.tab='home';closeSheet();persist();render();toast('Đã xóa dữ liệu');});},
 demo:function(){loadDemo();S.hid=H[0].id;S.tab='home';persist();render();toast('Đang xem dữ liệu mẫu. Bấm Xóa dữ liệu mẫu khi muốn dùng thật.');},
 cleardemo:function(){confirmSheet('Xóa dữ liệu mẫu?','Dữ liệu mẫu sẽ bị xóa để bạn bắt đầu nhập nhà thật của mình.','wipe','','Xóa dữ liệu mẫu');},
 share:function(){var i=INV.filter(function(x){return x.id===S.shareId})[0];if(!i)return;var l=LS.filter(function(x){return x.id===i.lease})[0],t='Hóa đơn '+(i.bed?'giường '+i.unit+i.bed:'phòng '+i.unit)+' tháng '+mlabel(i.month)+(l?' · '+l.t.name:'')+'\n'+i.items.map(function(x){return x[0]+': '+fmt(x[1]);}).join('\n')+'\nTổng: '+fmt(i.total)+(invPaid(i)>0?'\nĐã thu: '+fmt(invPaid(i))+'\nCòn lại: '+fmt(invLeft(i)):'')+'\nChuyển khoản: '+bankLine();if(navigator.share&&isMobile()){navigator.share({text:t}).catch(function(){});}else copyText(t).then(function(ok){toast(ok?'Đã chép nội dung hóa đơn, dán vào Zalo hoặc tin nhắn':'Không chép được',!ok);});},
 pdf:function(){if(window.Capacitor){toast('Trên điện thoại: dùng Chia sẻ hoặc chụp màn hình. Bản máy tính có nút in.');return;}window.print();}
};
document.addEventListener('click',function(e){
  var el=e.target.closest('[data-act]');if(!el)return;
  var a=el.dataset.act;
  if(a==='ovx'){if(e.target===el)closeSheet();return;}
  if(a==='rd'||a==='search')return;
  if(ACT[a])ACT[a](el);
});
document.addEventListener('keydown',function(e){
  if(e.key==='Escape'&&S.sheet){closeSheet();return;}
  if((e.key==='Enter'||e.key===' ')&&e.target.getAttribute&&e.target.getAttribute('role')==='button'&&e.target.dataset.act){e.preventDefault();e.target.click();}
});
document.addEventListener('input',function(e){
  var el=e.target,a=el.dataset&&el.dataset.act;
  if(a!=='rd'&&el.classList&&el.classList.contains('err')){el.classList.remove('err');el.removeAttribute('aria-invalid');}
  if(a==='rd'){
    var h=cur(),id=el.dataset.id;S.chot[id]=S.chot[id]||{};S.chot[id][el.dataset.k]=el.value.replace(/[^0-9.]/g,'');
    var u=uOf(h.id,id),c=chotCalc(h,u),box=$('calc-'+esc(id).replace(/ /g,'_'));if(box)box.innerHTML=calcText(h,u);
    el.classList.toggle('err',(el.dataset.k==='e'&&c.eok&&c.eu<0)||(el.dataset.k==='w'&&c.wok&&c.wu<0));
    var r=chotUnits(h).filter(function(x){return !chotDone(h,x)&&chotCalc(h,x).ready}).length,b=$('mk');b.textContent='Tạo hóa đơn cho '+r+' phòng';b.disabled=!r;
  }else if(a==='search'){
    S.q=el.value;var pos=el.selectionStart;render();var q=$('q');q.focus();try{q.setSelectionRange(pos,pos);}catch(x){}
  }
});
document.addEventListener('change',function(e){
  var el=e.target;
  if(el.id==='byear'){S.f.byear=el.value;render();}
  else if(el.id==='bmon'){S.f.bmon=el.value;render();}
  else if(el.id==='ryear'){S.f.ryear=el.value;render();}
  else if(el.id==='rmon'){S.f.rmon=el.value;render();}
  else if(el.id==='aunit'){S.aunit=el.value;render();}
  else if(el.id==='bu'){var u=uOf(S.hid,el.value);if(u)$('bpr').value=u.price;}
});
$('house').addEventListener('click',function(){if(H.length)houseSheet();});
$('site-logo').innerHTML=MissingLogo.svg({size:34,theme:'dark'});
var LD=loadSaved();if(LD==='corrupt')setTimeout(function(){warn('Dữ liệu trên máy bị lỗi, đã giữ lại bản gốc. Vào Cài đặt > Bản dự phòng để khôi phục.');},500);
render();
try{if(navigator.storage&&navigator.storage.persist)navigator.storage.persist();}catch(e){}
setTimeout(function(){if(H.length&&!STATE.demo){var last=0;snapList().then(function(l){last=l[0]?l[0].at:0;if(Date.now()-last>20*3600e3)snap('tự động');});if(!STATE.lastBackup||Date.now()-STATE.lastBackup>7*864e5)toast('Đã lâu chưa sao lưu. Vào Cài đặt để sao lưu ra file.');}},6000);
if('serviceWorker' in navigator&&location.protocol.indexOf('http')===0)navigator.serviceWorker.register('sw.js').catch(function(){});
MissingLogo.intro({target:'#site-logo',word:'#site-word',theme:'dark',sound:false});
