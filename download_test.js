const http = require('http');
const fs = require('fs');
const filename = process.argv[2] || '1778139144272-SWS-AI-leave-policy.pdf';
const options = {
  hostname: 'localhost',
  port: 3000,
  path: '/download/' + encodeURIComponent(filename),
  method: 'GET'
};

const req = http.request(options, res => {
  console.log('STATUS:', res.statusCode);
  console.log('HEADERS:', res.headers);
  const file = fs.createWriteStream('downloaded.pdf');
  res.pipe(file);
  file.on('finish', () => {
    file.close();
    console.log('Saved to downloaded.pdf');
  });
});

req.on('error', (e) => {
  console.error('request error', e);
});
req.end();
