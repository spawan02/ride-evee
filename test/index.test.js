
const axios = require("axios");
const baseURL = 'http://localhost:3000'; 


describe('API Endpoints Integration Tests using Axios', () => {
  let adminToken, userToken, createdUserId, otpCode;

  test('POST api/auth/signup - create a normal user', async () => {
    const res = await axios.post(`${baseURL}/auth/signup`, {
      name: 'Test User',
      email: 'testuser@example.com',
      phone: '1234567890',
      password: 'password123'
    });
    expect(res.status).toBe(201);
    expect(res.data).toHaveProperty('token');
    userToken = res.data.token;
  });

  test('POST api/auth/signup - create an admin user', async () => {
    const res = await axios.post(`${baseURL}/auth/signup`, {
      name: 'Admin User',
      email: 'admin@example.com',
      phone: '0987654321',
      password: 'password123',
      role: 'admin'
    });
    expect(res.status).toBe(201);
    expect(res.data).toHaveProperty('token');
    adminToken = res.data.token;
  });

  test('POST api/auth/login - login as normal user', async () => {
    const res = await axios.post(`${baseURL}/auth/login`, {
      email: 'testuser@example.com',
      password: 'password123'
    });
    expect(res.status).toBe(200);
    expect(res.data).toHaveProperty('token');
    userToken = res.data.token;
  });

  test('POST api/auth/otp/send - send an OTP', async () => {
    const res = await axios.post(`${baseURL}/auth/otp/send`, { email: 'testuser@example.com' });
    expect(res.status).toBe(200);
    expect(res.data).toHaveProperty('message', 'OTP sent successfully');
    otpCode = '123456';
  });

  test('POST api/auth/otp/verify - verify the OTP', async () => {
    const res = await axios.post(`${baseURL}/auth/otp/verify`, {
      email: 'testuser@example.com',
      otp: otpCode
    });
    expect(res.status).toBe(200);
    expect(res.data).toHaveProperty('message', 'OTP verified successfully');
  });

  test('GET api/users - non-admin should get 403', async () => {
    try {
      await axios.get(`${baseURL}/users`, {
        headers: { Authorization: `Bearer ${userToken}` },
      });
    } catch (err) {
      expect(err.response.status).toBe(403);
    }
  });

  test('GET api/users - admin should get list of users', async () => {
    const res = await axios.get(`${baseURL}/users`, {
      headers: { Authorization: `Bearer ${adminToken}` },
    });
    expect(res.status).toBe(200);
    expect(Array.isArray(res.data)).toBe(true);
  });

  test('POST api/users - admin creates a new user', async () => {
    const res = await axios.post(`${baseURL}/users`, {
      name: 'Created User',
      email: 'created@example.com',
      phone: '1112223333',
      password: 'password123',
      role: 'user'
    }, {
      headers: { Authorization: `Bearer ${adminToken}` },
    });
    expect(res.status).toBe(201);
    expect(res.data).toHaveProperty('_id');
    createdUserId = res.data._id;
  });

  test('GET api/users/:id - admin retrieves a specific user', async () => {
    const res = await axios.get(`${baseURL}/users/${createdUserId}`, {
      headers: { Authorization: `Bearer ${adminToken}` },
    });
    expect(res.status).toBe(200);
    expect(res.data).toHaveProperty('email', 'created@example.com');
  });

  test('PUT api/users/:id - self-update a user', async () => {
    const res = await axios.put(`${baseURL}/users/${createdUserId}`, {
      name: 'Updated Created User'
    }, {
      headers: { Authorization: `Bearer ${adminToken}` },
    });
    expect(res.status).toBe(200);
    expect(res.data).toHaveProperty('name', 'Updated Created User');
  });

  test('DELETE api/users/:id - admin deletes a user', async () => {
    const res = await axios.delete(`${baseURL}/users/${createdUserId}`, {
      headers: { Authorization: `Bearer ${adminToken}` },
    });
    expect(res.status).toBe(200);
    expect(res.data).toHaveProperty('message', 'User deleted successfully');
  });
});
