// Tiny static server for local preview:  node serve.js  →  http://localhost:8099
const http = require('http'), fs = require('fs'), path = require('path');
const root = __dirname, port = 8099;
const types = { '.html':'text/html', '.css':'text/css', '.js':'text/javascript',
  '.pdf':'application/pdf', '.stl':'model/stl', '.png':'image/png', '.jpg':'image/jpeg', '.svg':'image/svg+xml' };

http.createServer((req, res) => {
  let p = decodeURIComponent(req.url.split('?')[0]);
  if (p === '/') p = '/index.html';
  const file = path.join(root, p);
  if (!file.startsWith(root)) { res.writeHead(403).end('forbidden'); return; }
  fs.readFile(file, (err, buf) => {
    if (err) { res.writeHead(404).end('not found'); return; }
    res.writeHead(200, { 'Content-Type': types[path.extname(file).toLowerCase()] || 'application/octet-stream' });
    res.end(buf);
  });
}).listen(port, () => console.log('serving on http://localhost:' + port));
