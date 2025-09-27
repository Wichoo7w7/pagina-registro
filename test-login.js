const http = require('http');

function testLogin() {
  const data = JSON.stringify({
    email: 'admin@example.com',
    password: 'AdminPassword123!'
  });

  const options = {
    hostname: 'localhost',
    port: 3000,
    path: '/api/auth/login',
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Content-Length': data.length
    }
  };

  const req = http.request(options, (res) => {
    console.log(`STATUS: ${res.statusCode}`);
    console.log(`HEADERS: ${JSON.stringify(res.headers)}`);
    
    let responseData = '';
    res.on('data', (chunk) => {
      responseData += chunk;
    });
    
    res.on('end', () => {
      console.log('RESPONSE:', responseData);
      try {
        const parsed = JSON.parse(responseData);
        console.log('PARSED:', parsed);
      } catch (e) {
        console.log('Failed to parse response as JSON');
      }
    });
  });

  req.on('error', (e) => {
    console.error(`ERROR: ${e.message}`);
  });

  req.write(data);
  req.end();
}

testLogin();