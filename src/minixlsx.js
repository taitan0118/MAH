/* ===== Trình ghi .xlsx nhỏ, không cần thư viện ngoài (chạy offline). API giống phần ExcelJS đang dùng. ===== */
var MiniXlsx=(function(){
  function xe(s){return String(s).replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F]/g,'').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');}
  function colL(n){var s='';while(n>0){var m=(n-1)%26;s=String.fromCharCode(65+m)+s;n=(n-m-1)/26;}return s;}
  function addr(r,c){return colL(c)+r;}
  function colN(a){var s=a.replace(/[0-9]/g,''),n=0;for(var i=0;i<s.length;i++)n=n*26+s.charCodeAt(i)-64;return n;}
  var CRC=(function(){var t=[],n,k,c;for(n=0;n<256;n++){c=n;for(k=0;k<8;k++)c=c&1?0xEDB88320^(c>>>1):c>>>1;t[n]=c>>>0;}return t;})();
  function crc32(b){var c=0xFFFFFFFF;for(var i=0;i<b.length;i++)c=CRC[(c^b[i])&255]^(c>>>8);return (c^0xFFFFFFFF)>>>0;}
  function zip(files){ /* kiểu lưu thẳng, không nén */
    var enc=new TextEncoder(),parts=[],cd=[],off=0;
    function u16(v){return [v&255,(v>>8)&255];}function u32(v){return [v&255,(v>>8)&255,(v>>16)&255,(v>>>24)&255];}
    files.forEach(function(f){
      var nm=enc.encode(f[0]),d=enc.encode(f[1]),crc=crc32(d);
      var lh=[].concat(u32(0x04034b50),u16(20),u16(0x0800),u16(0),u16(0),u16(0x21),u32(crc),u32(d.length),u32(d.length),u16(nm.length),u16(0));
      parts.push(new Uint8Array(lh),nm,d);
      cd.push([].concat(u32(0x02014b50),u16(20),u16(20),u16(0x0800),u16(0),u16(0),u16(0x21),u32(crc),u32(d.length),u32(d.length),u16(nm.length),u16(0),u16(0),u16(0),u16(0),u32(0),u32(off)),nm);
      off+=lh.length+nm.length+d.length;
    });
    var cdLen=0;cd.forEach(function(x){var a=x.length!==undefined&&!(x instanceof Uint8Array)?new Uint8Array(x):x;parts.push(a);cdLen+=a.length;});
    parts.push(new Uint8Array([].concat(u32(0x06054b50),u16(0),u16(0),u16(files.length),u16(files.length),u32(cdLen),u32(off),u16(0))));
    var tot=0;parts.forEach(function(p){tot+=p.length;});var out=new Uint8Array(tot),o=0;parts.forEach(function(p){out.set(p,o);o+=p.length;});return out;
  }
  function Sheet(name,opt){
    this.name=name;this.cells={};this.rows={};this.merges=[];this.widths=[];this.autoFilter=null;this.pageSetup=null;this.views=(opt&&opt.views)||[{}];
    var me=this;
    Object.defineProperty(this,'columns',{set:function(v){me.widths=v.map(function(x){return x.width;});}});
  }
  Sheet.prototype.getCell=function(r,c){if(typeof r==='string'){var m=/^([A-Z]+)(\d+)$/.exec(r);c=colN(m[1]);r=+m[2];}var k=r+','+c;return this.cells[k]||(this.cells[k]={r:r,c:c});};
  Sheet.prototype.getRow=function(r){var me=this;return this.rows[r]||(this.rows[r]={getCell:function(c){return me.getCell(r,c);}});};
  Sheet.prototype.mergeCells=function(a,b,c,d){this.merges.push(addr(a,b)+':'+addr(c,d));};
  function Workbook(){var me=this;this.sheets=[];this.xlsx={writeBuffer:function(){return Promise.resolve(me.build());}};}
  Workbook.prototype.addWorksheet=function(n,o){var s=new Sheet(String(n).replace(/[\[\]:*?\/\\]/g,'').slice(0,31),o);this.sheets.push(s);return s;};
  Workbook.prototype.build=function(){
    var fonts=['<font><sz val="11"/><name val="Calibri"/></font>'],fills=['<fill><patternFill patternType="none"/></fill>','<fill><patternFill patternType="gray125"/></fill>'],borders=['<border><left/><right/><top/><bottom/><diagonal/></border>'],nf=[],xfs=['<xf numFmtId="0" fontId="0" fillId="0" borderId="0" xfId="0"/>'],xfIdx={'':0};
    function idx(list,x){var i=list.indexOf(x);if(i<0){list.push(x);i=list.length-1;}return i;}
    function side(n,s){return s?'<'+n+' style="'+s.style+'"><color rgb="'+s.color.argb+'"/></'+n+'>':'<'+n+'/>';}
    function style(c){
      var f=c.font,fl=c.fill,b=c.border,a=c.alignment,k=JSON.stringify([f,fl,b,a,c.numFmt]);if(xfIdx[k]!==undefined)return xfIdx[k];
      var fi=f?idx(fonts,'<font>'+(f.bold?'<b/>':'')+(f.italic?'<i/>':'')+'<sz val="'+(f.size||11)+'"/>'+(f.color?'<color rgb="'+f.color.argb+'"/>':'')+'<name val="Calibri"/></font>'):0;
      var li=fl?idx(fills,'<fill><patternFill patternType="solid"><fgColor rgb="'+fl.fgColor.argb+'"/><bgColor indexed="64"/></patternFill></fill>'):0;
      var bi=b?idx(borders,'<border>'+side('left',b.left)+side('right',b.right)+side('top',b.top)+side('bottom',b.bottom)+'<diagonal/></border>'):0;
      var ni=0;if(c.numFmt){ni={'0':1,'0%':9}[c.numFmt]||(164+idx(nf,c.numFmt));}
      var al=a?'<alignment'+(a.horizontal?' horizontal="'+a.horizontal+'"':'')+(a.vertical?' vertical="'+(a.vertical==='middle'?'center':a.vertical)+'"':'')+(a.wrapText?' wrapText="1"':'')+(a.indent?' indent="'+a.indent+'"':'')+'/>':'';
      xfs.push('<xf numFmtId="'+ni+'" fontId="'+fi+'" fillId="'+li+'" borderId="'+bi+'" xfId="0" applyNumberFormat="1" applyFont="1" applyFill="1" applyBorder="1"'+(al?' applyAlignment="1">'+al+'</xf>':'/>'));
      return xfIdx[k]=xfs.length-1;
    }
    var sheetXml=this.sheets.map(function(s){
      var byRow={},maxR=1,maxC=1;
      Object.keys(s.cells).forEach(function(k){var c=s.cells[k];(byRow[c.r]=byRow[c.r]||[]).push(c);maxR=Math.max(maxR,c.r);maxC=Math.max(maxC,c.c);});
      Object.keys(s.rows).forEach(function(r){maxR=Math.max(maxR,+r);});
      var v=s.views[0]||{},x='<?xml version="1.0" encoding="UTF-8" standalone="yes"?><worksheet xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main">';
      if(s.pageSetup&&s.pageSetup.fitToPage)x+='<sheetPr><pageSetUpPr fitToPage="1"/></sheetPr>';
      x+='<dimension ref="A1:'+addr(maxR,maxC)+'"/><sheetViews><sheetView workbookViewId="0"'+(v.showGridLines===false?' showGridLines="0"':'')+'>';
      if(v.state==='frozen'&&v.ySplit)x+='<pane ySplit="'+v.ySplit+'" topLeftCell="A'+(v.ySplit+1)+'" activePane="bottomLeft" state="frozen"/><selection pane="bottomLeft"/>';
      x+='</sheetView></sheetViews><sheetFormatPr defaultRowHeight="15"/>';
      if(s.widths.length)x+='<cols>'+s.widths.map(function(w,i){return '<col min="'+(i+1)+'" max="'+(i+1)+'" width="'+w+'" customWidth="1"/>';}).join('')+'</cols>';
      x+='<sheetData>';
      for(var r=1;r<=maxR;r++){
        var cs=(byRow[r]||[]).sort(function(a,b){return a.c-b.c;}),ro=s.rows[r];
        if(!cs.length&&!(ro&&ro.height))continue;
        x+='<row r="'+r+'"'+(ro&&ro.height?' ht="'+ro.height+'" customHeight="1"':'')+'>';
        cs.forEach(function(c){
          var st=style(c),ref=addr(c.r,c.c),val=c.value,sa=st?' s="'+st+'"':'';
          if(val===null||val===undefined||val==='')x+='<c r="'+ref+'"'+sa+'/>';
          else if(typeof val==='number')x+='<c r="'+ref+'"'+sa+'><v>'+val+'</v></c>';
          else if(typeof val==='object'&&val.formula)x+='<c r="'+ref+'"'+sa+'><f>'+xe(val.formula)+'</f><v>'+(val.result||0)+'</v></c>';
          else x+='<c r="'+ref+'"'+sa+' t="inlineStr"><is><t xml:space="preserve">'+xe(val)+'</t></is></c>';
        });
        x+='</row>';
      }
      x+='</sheetData>';
      if(s.autoFilter)x+='<autoFilter ref="'+s.autoFilter.from+':'+s.autoFilter.to+'"/>';
      if(s.merges.length)x+='<mergeCells count="'+s.merges.length+'">'+s.merges.map(function(m){return '<mergeCell ref="'+m+'"/>';}).join('')+'</mergeCells>';
      x+='<pageMargins left="0.4" right="0.4" top="0.5" bottom="0.5" header="0.2" footer="0.2"/>';
      if(s.pageSetup)x+='<pageSetup paperSize="9" orientation="'+(s.pageSetup.orientation||'portrait')+'"'+(s.pageSetup.fitToPage?' fitToWidth="1" fitToHeight="0"':'')+'/>';
      return x+'</worksheet>';
    });
    var styles='<?xml version="1.0" encoding="UTF-8" standalone="yes"?><styleSheet xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main">'+(nf.length?'<numFmts count="'+nf.length+'">'+nf.map(function(f,i){return '<numFmt numFmtId="'+(164+i)+'" formatCode="'+xe(f)+'"/>';}).join('')+'</numFmts>':'')+
      '<fonts count="'+fonts.length+'">'+fonts.join('')+'</fonts><fills count="'+fills.length+'">'+fills.join('')+'</fills><borders count="'+borders.length+'">'+borders.join('')+'</borders><cellStyleXfs count="1"><xf numFmtId="0" fontId="0" fillId="0" borderId="0"/></cellStyleXfs><cellXfs count="'+xfs.length+'">'+xfs.join('')+'</cellXfs><cellStyles count="1"><cellStyle name="Normal" xfId="0" builtinId="0"/></cellStyles></styleSheet>';
    var n=this.sheets.length,H='<?xml version="1.0" encoding="UTF-8" standalone="yes"?>',files=[
      ['[Content_Types].xml',H+'<Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types"><Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/><Default Extension="xml" ContentType="application/xml"/><Override PartName="/xl/workbook.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet.main+xml"/><Override PartName="/xl/styles.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.styles+xml"/>'+this.sheets.map(function(s,i){return '<Override PartName="/xl/worksheets/sheet'+(i+1)+'.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.worksheet+xml"/>';}).join('')+'</Types>'],
      ['_rels/.rels',H+'<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships"><Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="xl/workbook.xml"/></Relationships>'],
      ['xl/workbook.xml',H+'<workbook xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main" xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships"><sheets>'+this.sheets.map(function(s,i){return '<sheet name="'+xe(s.name)+'" sheetId="'+(i+1)+'" r:id="rId'+(i+1)+'"/>';}).join('')+'</sheets></workbook>'],
      ['xl/_rels/workbook.xml.rels',H+'<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">'+this.sheets.map(function(s,i){return '<Relationship Id="rId'+(i+1)+'" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/worksheet" Target="worksheets/sheet'+(i+1)+'.xml"/>';}).join('')+'<Relationship Id="rId'+(n+1)+'" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/styles" Target="styles.xml"/></Relationships>'],
      ['xl/styles.xml',styles]
    ];
    sheetXml.forEach(function(x,i){files.push(['xl/worksheets/sheet'+(i+1)+'.xml',x]);});
    return zip(files);
  };
  return {Workbook:Workbook};
})();
