/* ===== dữ liệu mẫu: chỉ nạp khi người dùng bấm Xem thử, ngày tự dời theo hôm nay ===== */
function loadDemo(){
  var SH=diff('2026-10-09',TODAY);function D(s){return addDays(s,SH);}
  LS=[];INV=[];BK=[];EXP=[];INC=[];TK=[];AS={};HIST={};IID=0;LID=0;BID=0;XID=0;TID=0;
H=[
 {id:'h1',bday:5,type:'tro',name:'Nhà trọ Hoa Mai',addr:'12 Lê Lợi, Quận 1',rate:{e:3500,w:20000},fixed:[['Rác',30000],['Wifi',50000]],units:[
  {id:'101',fl:1,price:3200000,e:1432,w:61},{id:'102',fl:1,price:3000000,e:2210,w:48},{id:'103',fl:1,price:3000000,e:980,w:33},{id:'104',fl:1,price:3200000,e:1760,w:72},
  {id:'201',fl:2,price:3500000,e:1304,w:55},{id:'202',fl:2,price:3300000,e:2045,w:40},{id:'203',fl:2,price:3300000,e:1890,w:90},{id:'204',fl:2,price:3300000,e:1120,w:36},
  {id:'301',fl:3,price:2800000,e:870,w:29},{id:'302',fl:3,price:2800000,e:640,w:21},{id:'303',fl:3,price:2900000,e:1530,w:58},{id:'304',fl:3,price:2900000,e:1215,w:44}]},
 {id:'h2',bday:10,type:'mini',name:'Chung cư mini Sunrise',addr:'45 Nguyễn Văn Linh, Quận 7',rate:{e:3800,w:25000},fixed:[['Rác',40000],['Thang máy',60000],['Gửi xe',100000]],units:[
  {id:'S101',fl:1,price:4500000,e:2100,w:80},{id:'S102',fl:1,price:4500000,e:1850,w:66},{id:'S201',fl:2,price:5200000,e:1990,w:71},{id:'S202',fl:2,price:5200000,e:1420,w:52},
  {id:'S301',fl:3,price:5500000,e:2330,w:88},{id:'S302',fl:3,price:5500000,e:760,w:25},{id:'S401',fl:4,price:6000000,e:1675,w:60},{id:'S402',fl:4,price:6000000,e:540,w:18}]},
 {id:'h3',bday:20,type:'ktx',name:'Ký túc xá Sinh viên Xanh',addr:'8 Võ Văn Ngân, Thủ Đức',rate:{e:3500,w:20000},fixed:[['Rác',20000],['Wifi',30000]],units:[
  {id:'K101',fl:1,price:700000,nb:6,e:3200,w:140},{id:'K102',fl:1,price:700000,nb:6,e:2800,w:120},{id:'K201',fl:2,price:750000,nb:6,e:2950,w:130},{id:'K202',fl:2,price:750000,nb:6,e:1500,w:60}]},
 {id:'h4',type:'home',name:'Homestay Gió Biển',addr:'30 Trần Phú, Vũng Tàu',rate:{e:3500,w:20000},fixed:[],units:[
  {id:'Villa 1',fl:1,price:2500000,cap:8},{id:'Villa 2',fl:1,price:2200000,cap:6},{id:'Đôi 1',fl:1,price:900000,cap:2},{id:'Đôi 2',fl:1,price:900000,cap:2}]}
];
function addL(hid,unit,bed,name,ph,n,end,rent,dep,tt,veh,cccd){
  LS.push({id:'l'+(++LID),hid:hid,unit:unit,bed:bed,t:{name:name,ph:ph,n:n,tt:tt,veh:veh,cccd:cccd},start:addMonths(end,-12),end:end,rent:rent,dep:dep,on:true});
}
/* nhà trọ */
[['101','Nguyễn Thị Lan','0901234567',2,D('2027-03-01'),'da','59A1-123.45','079204001234'],['102','Trần Văn Hùng','0902345678',1,D('2027-01-15'),'da','59B2-456.78','079198002345'],
 ['104','Lê Minh Tuấn','0903456789',2,D('2027-05-20'),'chua','','079201003456'],['201','Phạm Thu Hà','0904567890',2,D('2027-02-10'),'da','59C1-789.01','079199004567'],
 ['202','Võ Quốc Bảo','0905678901',1,D('2026-10-28'),'da','','079200005678'],['203','Đặng Thị Mai','0906789012',3,D('2027-06-30'),'da','59X3-234.56','079195006789'],
 ['301','Hoàng Gia Huy','0907890123',1,D('2027-04-12'),'chua','','079203007890'],['303','Bùi Ngọc Anh','0908901234',2,D('2027-01-31'),'da','','079202008901'],
 ['304','Đỗ Thanh Tùng','0909012345',1,D('2027-07-18'),'da','59D4-345.67','079205009012']].forEach(function(x){
  var u=uOf('h1',x[0]);addL('h1',x[0],null,x[1],x[2],x[3],x[4],u.price,u.price,x[5],x[6],x[7]);});
/* chung cư mini */
[['S101','Trương Hoài Nam','0911222333',2,D('2027-04-01'),'da','51F-111.11','079190010001'],['S102','Ngô Bích Phượng','0911222444',1,D('2027-02-14'),'da','','079193010002'],
 ['S201','Lý Quang Vinh','0911222555',3,D('2027-08-30'),'da','59G1-222.22','079188010003'],['S202','Mai Thị Kim','0911222666',2,D('2026-11-05'),'da','51H-333.33','079191010004'],
 ['S301','Cao Đức Thịnh','0911222777',2,D('2027-03-20'),'chua','59K2-444.44','079189010005'],['S401','Tạ Phương Linh','0911222888',1,D('2027-05-09'),'da','','079195010006']].forEach(function(x){
  var u=uOf('h2',x[0]);addL('h2',x[0],null,x[1],x[2],x[3],x[4],u.price,u.price,x[5],x[6],x[7]);});
/* ký túc xá */
[['K101','A','Nguyễn Văn Khoa','0922111001'],['K101','B','Trần Quốc Đạt','0922111002'],['K101','C','Lê Hữu Phúc','0922111003'],['K101','D','Phạm Gia Bảo','0922111004'],['K101','E','Võ Thành Long','0922111005'],
 ['K102','A','Đặng Minh Trí','0922111006'],['K102','B','Bùi Anh Khôi','0922111007'],['K102','C','Hồ Đức Huy','0922111008'],
 ['K201','A','Nguyễn Thu Trang','0922111009'],['K201','B','Lê Hà My','0922111010'],['K201','C','Trần Ngọc Diệp','0922111011'],['K201','D','Phan Khánh Vy','0922111012'],
 ['K202','A','Đỗ Bảo Châu','0922111013'],['K202','B','Vũ Thảo Nguyên','0922111014']].forEach(function(x,i){
  var u=uOf('h3',x[0]);addL('h3',x[0],x[1],x[2],x[3],1,i%4===0?D('2026-11-20'):D('2027-06-30'),u.price,u.price,i%3===0?'chua':'da','','0792000'+(20000+i));});
var UNPAID={'h1':['102','303','301'],'h2':['S202'],'h3':['K101B','K102A','K201C']};
LS.filter(function(l){return l.hid!=='h4'}).forEach(function(l,i){
  var k=hOf(l.hid).type==='ktx'?activeIn(l.hid,l.unit).length:1;
  var inv=monthInvoices(l,mkey(D('2026-09-15')),i+3,k);
  var key=l.unit+(l.bed||'');
  if(UNPAID[l.hid].indexOf(key)<0)inv.pay.push({d:D('2026-09-'+pad(5+i%12)),a:inv.total,m:i%2?'Chuyển khoản':'Tiền mặt'});
  else if(key==='102')inv.pay.push({d:D('2026-09-20'),a:1000000,m:'Tiền mặt'});
  INV.push(inv);
});
/* homestay: đặt phòng */
function addB(unit,guest,ph,inD,outD,price,payAmt,st,src){
  var b={id:'b'+(++BID),hid:'h4',unit:unit,guest:guest,ph:ph,inD:inD,outD:outD,price:price,st:st,src:src,pay:[]};
  if(payAmt>0)b.pay.push({d:addDays(inD,-5),a:payAmt,m:'Chuyển khoản'});BK.push(b);
}
addB('Villa 1','Nguyễn Hải Đăng','0933111222',D('2026-10-08'),D('2026-10-11'),2500000,7500000,'in','Trực tiếp');
addB('Villa 1','Trần Mỹ Linh','0933111333',D('2026-10-12'),D('2026-10-14'),2500000,2500000,'confirmed','Airbnb');
addB('Villa 2','Lê Quốc Việt','0933111444',D('2026-10-10'),D('2026-10-13'),2200000,2000000,'confirmed','Booking');
addB('Đôi 1','Phạm Khánh An','0933111555',D('2026-10-09'),D('2026-10-10'),900000,900000,'confirmed','Trực tiếp');
addB('Đôi 2','Vũ Thu Hiền','0933111666',D('2026-10-07'),D('2026-10-09'),900000,500000,'in','Airbnb');
addB('Đôi 2','Đặng Minh Quân','0933111777',D('2026-10-15'),D('2026-10-18'),900000,0,'confirmed','Trực tiếp');
addB('Villa 2','Hoàng Anh Tuấn','0933111888',D('2026-10-04'),D('2026-10-06'),2200000,4400000,'out','Trực tiếp');
function X(hid,d,cat,note,amt){EXP.push({id:'x'+(++XID),hid:hid,d:d,cat:cat,note:note,amt:amt});}
X('h1',D('2026-10-03'),'Sửa chữa','Sửa ống nước phòng 203',450000);X('h1',D('2026-10-05'),'Điện nước đầu vào','Tiền điện nước đầu vào tháng 9',4200000);X('h1',D('2026-09-12'),'Sửa chữa','Thay khóa cửa phòng 104',300000);
X('h2',D('2026-10-02'),'Điện nước đầu vào','Điện nước chung cư tháng 9',7800000);X('h2',D('2026-10-06'),'Lương nhân viên','Lương bảo vệ tháng 9',5500000);
X('h3',D('2026-10-04'),'Điện nước đầu vào','Điện nước ký túc xá tháng 9',9600000);X('h3',D('2026-10-07'),'Mua sắm','Mua 4 nệm mới',3200000);
X('h4',D('2026-10-01'),'Mua sắm','Đồ vệ sinh, khăn, ga giường',2100000);X('h4',D('2026-10-06'),'Điện nước đầu vào','Điện nước tháng 9',3800000);
INC.push({id:'n1',hid:'h3',d:D('2026-10-03'),note:'Tiền giặt ủi cộng đồng',amt:850000},{id:'n2',hid:'h1',d:D('2026-10-02'),note:'Tiền giữ xe khách vãng lai',amt:300000});
function T(hid,unit,title,desc,st,date,cost){TK.push({id:'t'+(++TID),hid:hid,unit:unit,title:title,desc:desc,st:st,d:date,cost:cost});}
T('h1','203','Rò nước vòi bếp','Khách báo vòi nước bếp rỉ liên tục','Đang xử lý',D('2026-10-07'),0);T('h1','104','Cháy bóng đèn','Bóng đèn phòng ngủ cháy','Mới',D('2026-10-08'),0);
T('h2','S301','Thang máy kêu to','Thang máy kêu khi lên tầng 3','Mới',D('2026-10-08'),0);T('h2','S102','Máy lạnh chảy nước','Khách báo máy lạnh nhỏ nước','Xong',D('2026-10-02'),350000);
T('h3','K102','Máy lạnh không mát','Phòng K102 báo máy lạnh yếu','Mới',D('2026-10-08'),0);T('h4','Villa 1','Mất nước nóng','Bình nóng lạnh phòng ngủ lớn không nóng','Đang xử lý',D('2026-10-09'),0);
function AST(hid,unit,list){AS[hid+'|'+unit]=list.map(function(x){return {name:x[0],q:x[1],c:x[2]};});}
AST('h1','101',[['Giường',1,'Tốt'],['Tủ quần áo',1,'Tốt'],['Quạt trần',1,'Cũ'],['Bình nóng lạnh',1,'Tốt']]);
AST('h1','203',[['Giường',2,'Tốt'],['Tủ quần áo',1,'Cũ'],['Máy lạnh',1,'Tốt'],['Bàn học',1,'Hỏng']]);
AST('h2','S101',[['Giường',1,'Tốt'],['Tủ lạnh',1,'Tốt'],['Máy lạnh',1,'Tốt'],['Máy giặt',1,'Tốt'],['Bếp từ',1,'Tốt']]);
AST('h3','K101',[['Giường tầng',3,'Tốt'],['Tủ cá nhân',6,'Tốt'],['Quạt',2,'Cũ'],['Máy lạnh',1,'Tốt']]);
AST('h4','Villa 1',[['Giường đôi',3,'Tốt'],['Máy lạnh',3,'Tốt'],['TV',2,'Tốt'],['Bộ bàn ăn',1,'Tốt'],['Lò nướng BBQ',1,'Cũ']]);
HIST={h1:[[24.1,5.1],[25.4,4.6],[25.8,5.4],[26.3,4.9],[27.0,4.7]],h2:[[41.0,12.2],[42.5,11.8],[43.0,12.6],[43.8,12.1],[44.2,13.3]],h3:[[15.2,10.4],[16.1,10.1],[16.8,10.8],[17.0,10.5],[17.6,10.9]],h4:[[48.0,12.0],[52.5,13.1],[61.0,15.2],[58.4,14.0],[44.0,11.6]]};
  STATE.demo=true;
}
