const http = require('http');

const data = JSON.stringify({
  username: "TestUserV5",
  email: "testv5@test.com",
  password: "Password12!@"
});

const req = http.request('http://localhost:5000/api/auth/register', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Content-Length': Buffer.byteLength(data)
  }
}, (res) => {
  console.log(`STATUS: ${res.statusCode}`);
  res.setEncoding('utf8');
  res.on('data', (chunk) => {
    console.log(`BODY: ${chunk}`);
  });
});

req.on('error', (e) => {
  console.error(`problem with request: ${e.message}`);
});

req.write(data);
req.end();
