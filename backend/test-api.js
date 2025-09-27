const axios = require('axios');

async function testLogin() {
  try {
    console.log('Testing login...');
    const response = await axios.post('http://localhost:3000/api/auth/login', {
      email: 'admin@example.com',
      password: 'AdminPassword123!'
    });
    console.log('LOGIN SUCCESS!');
    console.log('Response:', response.data);
  } catch (error) {
    console.error('LOGIN ERROR:');
    console.error('Status:', error.response?.status);
    console.error('Data:', error.response?.data);
    console.error('Full error:', error.message);
    if (error.code === 'ECONNREFUSED') {
      console.error('Backend is not running on port 3000');
    }
  }
}

testLogin();