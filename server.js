/**
 * CampusAI - Lightweight Local HTTP & API Dev Server
 * Built with standard Node.js libraries (Zero external npm packages required)
 */

const http = require('http');
const fs = require('fs');
const path = require('path');
const url = require('url');

const PORT = process.env.PORT || 3000;
const PUBLIC_DIR = path.join(__dirname, 'src', 'main', 'resources', 'static');

const MIME_TYPES = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'application/javascript; charset=utf-8',
  '.json': 'application/json',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon'
};

const server = http.createServer((req, res) => {
  // CORS Headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    res.writeHead(204);
    res.end();
    return;
  }

  const parsedUrl = url.parse(req.url, true);
  let pathname = parsedUrl.pathname;

  if (pathname === '/') {
    pathname = '/index.html';
  }

  // Check if static file exists in static folder or root
  let filePath = path.join(PUBLIC_DIR, pathname);
  if (!fs.existsSync(filePath)) {
    filePath = path.join(__dirname, pathname);
  }

  if (fs.existsSync(filePath) && fs.statSync(filePath).isFile()) {
    const ext = path.extname(filePath).toLowerCase();
    const contentType = MIME_TYPES[ext] || 'application/octet-stream';
    res.writeHead(200, { 'Content-Type': contentType });
    fs.createReadStream(filePath).pipe(res);
    return;
  }

  // Not found
  res.writeHead(404, { 'Content-Type': 'text/html' });
  res.end('<h1>404 Not Found</h1><p>CampusAI web asset not found.</p>');
});

server.listen(PORT, () => {
  console.log('====================================================');
  console.log(` 🎓 CampusAI Web Server running at: http://localhost:${PORT}`);
  console.log(` 🚀 Student Portal:   http://localhost:${PORT}/student-dashboard.html`);
  console.log(` 👨‍🏫 Faculty Portal:   http://localhost:${PORT}/faculty-dashboard.html`);
  console.log(` 🛡️  Admin Console:    http://localhost:${PORT}/admin-dashboard.html`);
  console.log('====================================================');
});
