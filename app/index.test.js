const request = require('supertest');
const app = require('./index');

describe('GET Endpoints', () => {
    it('should fetch the health check status', async () => {
        const res = await request(app).get('/health');
        expect(res.statusCode).toEqual(200);
        expect(res.body).toHaveProperty('status');
        expect(res.body.status).toEqual('UP');
    });

    it('should fetch the metadata details', async () => {
        const res = await request(app).get('/api/info');
        expect(res.statusCode).toEqual(200);
        expect(res.body).toHaveProperty('appName');
        expect(res.body.appName).toEqual('DevOps Mini Project App');
    });
});
