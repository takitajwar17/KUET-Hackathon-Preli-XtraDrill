const request = require('supertest');
const app = require('../index');
const fs = require('fs').promises;
const path = require('path');

describe('Chatbot API', () => {
    test('POST /api/chatbot/recommend - should get recipe recommendations', async () => {
        const response = await request(app)
            .post('/api/chatbot/recommend')
            .send({
                preference: 'I want something sweet'
            });

        expect(response.status).toBe(200);
        expect(response.body.recommendation).toBeDefined();
        expect(typeof response.body.recommendation).toBe('string');
    });

    test('POST /api/chatbot/recommend - should handle missing preference', async () => {
        const response = await request(app)
            .post('/api/chatbot/recommend')
            .send({});

        expect(response.status).toBe(400);
        expect(response.body.error).toBe('Preference is required');
    });
});
