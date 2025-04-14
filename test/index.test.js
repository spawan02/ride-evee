
const axios = require("axios");
const baseURL = 'http://localhost:3000/api'; 


describe('API Endpoints Integration', () => {
  let adminToken, userToken, createdUserId, otpCode;

  test('POST api/auth/signup - create a normal user', async () => {
    const rn =  Math.floor(Math.random()*100)
    const res = await axios.post(`${baseURL}/auth/signup`, {
      name: 'Test User',
      email: `testuser212${rn}@example.com`,
      phone: '1234567890',
      password: 'password123'
    });

    expect(res.status).toBe(201);
    expect(res.data).toHaveProperty('token');
    userToken = res.data.token;
  });

  test('POST api/auth/signup - create an admin user', async () => {
    const rn =  Math.floor(Math.random()*100)
    const res = await axios.post(`${baseURL}/auth/signup`, {
      name: 'Admin User',
      email: `admin${rn}@example.com`,
      phone: '0987654321',
      password: 'password123',
      role: 'admin'
    });
    expect(res.status).toBe(201);
    expect(res.data).toHaveProperty('token');
    adminToken = res.data.token;
  });

  test('login as normal user', async () => {
    const rn =  Math.floor(Math.random()*50)

    await axios.post(`${baseURL}/auth/signup`, {
      name: 'Test User',
      email: `testuser212${rn}@example.com`,
      phone: '1234567890',
      password: 'password123'
    });


    const res = await axios.post(`${baseURL}/auth/login`, {
      email: `testuser${rn}@example.com`,
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
    const rn =  Math.floor(Math.random()*50)
    let randomEmail = `testuser212${rn}@example.com` 

    await axios.post(`${baseURL}/auth/signup`, {
      name: 'Test User',
      email: randomEmail,
      phone: '1234567890',
      password: 'password123'
    });


   const res = await axios.post(`${baseURL}/auth/login`, {
      email: randomEmail,
      password: 'password123'
    });
    userToken = res.data.token;

    try {
      await axios.get(`${baseURL}/users`, {
        headers: { Authorization: `Bearer ${userToken}` },
      });

    } catch (err) {
      expect(err.response.status).toBe(403);
    }
  });

  test('POST api/users - admin creates a new user', async () => {
    const rn =  Math.floor(Math.random()*110)
    let randomEmail = `testuser12${rn}@example.com` 

    await axios.post(`${baseURL}/auth/signup`, {
      name: 'Test User',
      email: randomEmail,
      phone: '1234567890',
      password: 'password123',
      role:"admin"
    });


   const adminToken = await axios.post(`${baseURL}/auth/login`, {
      email: randomEmail,
      password: 'password123'
    });
    const res = await axios.post(`${baseURL}/users`, {
      name: 'Created User',
      email: 'created@example.com',
      phone: '1112223333',
      password: 'password123',
      role: 'user'
    }, {
      headers: { Authorization: `Bearer ${adminToken.data.token}` },
    });
    expect(res.status).toBe(201);
    expect(res.data).toHaveProperty('_id');
    createdUserId = res.data._id;
  });

  test('PUT api/users/:id - self-update a user', async () => {
    const rn =  Math.floor(Math.random()*110)
    let randomEmail = `testuserrrr${rn}@example.com` 

    await axios.post(`${baseURL}/auth/signup`, {
      name: 'Test User',
      email: randomEmail,
      phone: '1234567890',
      password: 'password123',
      role:"admin"
    });


   const adminToken = await axios.post(`${baseURL}/auth/login`, {
      email: randomEmail,
      password: 'password123'
    });
    const createdUserId = await axios.post(`${baseURL}/users`, {
      name: 'Created User',
      email: 'created@example.com',
      phone: '1112223333',
      password: 'password123',
      role: 'user'
    }, {
      headers: { Authorization: `Bearer ${adminToken.data.token}` },
    });
    const res = await axios.put(`${baseURL}/users/${createdUserId.data._id}`, {
      name: 'Updated Created User'
    }, {
      headers: { Authorization: `Bearer ${adminToken.data.token}` },
    });
    expect(res.status).toBe(200);
  });

  test('DELETE api/users/:id - admin deletes a user', async () => {
    const rn =  Math.floor(Math.random()*110)
    let randomEmail = `testuseeer${rn}@example.com` 

    await axios.post(`${baseURL}/auth/signup`, {
      name: 'Test User',
      email: randomEmail,
      phone: '1234567890',
      password: 'password123',
      role:"admin"
    });


   const adminToken = await axios.post(`${baseURL}/auth/login`, {
      email: randomEmail,
      password: 'password123'
    });
    console.log(adminToken.data.token)
    const createdUserId = await axios.post(`${baseURL}/users`, {
      name: 'Created User',
      email: 'created@example.com',
      phone: '1112223333',
      password: 'password123',
      role: 'user'
    }, {
      headers: { Authorization: `Bearer ${adminToken.data.token}` },
    });
    console.log(createdUserId.data._id)
    const res = await axios.delete(`${baseURL}/users/${createdUserId.data._id}`, {
      headers: { Authorization: `Bearer ${adminToken.data.token}` },
    });
    expect(res.status).toBe(200);
  });
});
