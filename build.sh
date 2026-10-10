#!/bin/sh
# Ghép src/ thành app/index.html (một file, chạy offline)
cd "$(dirname "$0")"
node -e "
const fs=require('fs'),r=f=>fs.readFileSync('src/'+f,'utf8');
const head='<!doctype html><html lang=\"vi\"><head><meta charset=\"utf-8\"><meta name=\"viewport\" content=\"width=device-width,initial-scale=1,viewport-fit=cover\"><meta name=\"apple-mobile-web-app-capable\" content=\"yes\"><meta name=\"mobile-web-app-capable\" content=\"yes\">'+r('head.html').replace('<title>','<title>').replace('</style>','</style></head><body>');
const js=['minixlsx.js','p1.js','demo.js','p2.js','p3.js','p4.js'].map(r).join('\n');
fs.writeFileSync('app/index.html',head+'\n'+r('missing-intro.js')+'\n</script><script>(function(){\'use strict\';\n'+js+'\n})();</script></body></html>\n');"
