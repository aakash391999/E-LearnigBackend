const request = require('supertest');
const app = require('../server'); // Update this to match your server entry point

describe('GET /api/users', () => {
  it('should fetch all users', async () => {
    const res = await request(app).get('/api/users');
    expect(res.statusCode).toEqual(200);
    expect(res.body).toBeInstanceOf(Array);
  });
});

describe('POST /api/users', () => {
  it('should create a new user', async () => {
    const newUser = { name: 'John Doe', email: 'john@example.com' };
    const res = await request(app).post('/api/users').send(newUser);
    expect(res.statusCode).toEqual(201);
    expect(res.body).toHaveProperty('name', 'John Doe');
  });
});
