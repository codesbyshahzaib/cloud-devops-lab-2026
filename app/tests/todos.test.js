const request = require('supertest');
const app = require('../index');

describe('Todos API', () => {
    beforeEach(async () => {
        // Reset todos before each test to ensure clean state
        await request(app).post('/api/todos/reset');
    });

    it('should fetch all todos', async () => {
        const res = await request(app).get('/api/todos');
        expect(res.statusCode).toEqual(200);
        expect(Array.isArray(res.body)).toBeTruthy();
        expect(res.body.length).toBe(0); // Should be empty after reset
    });

    it('should create a new valid todo', async () => {
        const res = await request(app)
            .post('/api/todos')
            .send({ title: 'Test Todo Item' });
            
        expect(res.statusCode).toEqual(201);
        expect(res.body).toHaveProperty('id');
        expect(res.body.title).toEqual('Test Todo Item');
        expect(res.body.completed).toBe(false);
    });

    it('should reject an invalid todo', async () => {
        const res = await request(app)
            .post('/api/todos')
            .send({ title: 'Hi' }); // Too short
            
        expect(res.statusCode).toEqual(400);
        expect(res.body).toHaveProperty('error');
    });

    it('should delete a todo', async () => {
        // Create first
        const createRes = await request(app).post('/api/todos').send({ title: 'To Delete' });
        const id = createRes.body.id;

        // Delete it
        const delRes = await request(app).delete(`/api/todos/${id}`);
        expect(delRes.statusCode).toEqual(200);
        expect(delRes.body.title).toEqual('To Delete');

        // Verify it's gone
        const fetchRes = await request(app).get('/api/todos');
        expect(fetchRes.body.length).toBe(0);
    });

    it('should return 404 when deleting a non-existent todo', async () => {
        const delRes = await request(app).delete('/api/todos/999');
        expect(delRes.statusCode).toEqual(404);
    });
});
