const http = require('http');
const id = process.argv[2] || '1';
const options = {
  hostname: 'localhost',
  port: 3000,
  path: '/files/' + id,
  method: 'DELETE'
};

const req = http.request(options, res => {
  console.log('STATUS:', res.statusCode);
  let data = '';
  res.on('data', chunk => data += chunk);
  res.on('end', () => console.log('BODY:', data));
});

req.on('error', e => console.error('request error', e));
req.end();
