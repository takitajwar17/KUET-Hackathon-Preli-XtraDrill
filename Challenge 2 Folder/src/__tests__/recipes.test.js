const request = require('supertest');
const app = require('../index');
const fs = require('fs').promises;
const path = require('path');

const RECIPES_FILE = path.join(__dirname, '../../data/my_fav_recipes.txt');

describe('Recipes API', () => {
    test('POST /api/recipes - should add new recipe text', async () => {
        const testRecipe = `Pasta Recipe
Ingredients:
- Pasta
- Tomato sauce
Instructions:
1. Cook pasta
2. Add sauce`;

        const response = await request(app)
            .post('/api/recipes')
            .send({
                recipe: testRecipe
            });

        expect(response.status).toBe(201);
        expect(response.body.message).toBe('Recipe added successfully');

        // Verify recipe was added
        const data = await fs.readFile(RECIPES_FILE, 'utf8');
        expect(data).toContain('Pasta Recipe');
    });

    test('POST /api/recipes/image - should handle valid recipe image upload', async () => {
        const response = await request(app)
            .post('/api/recipes/image')
            .attach('recipe', path.join(__dirname, '../__mocks__/test-recipe.jpg'));

        expect(response.status).toBe(201);
        expect(response.body).toHaveProperty('message');
        expect(response.body).toHaveProperty('extractedText');
    }, 10000); // Increase timeout for image processing

    test('POST /api/recipes/image - should handle invalid file type', async () => {
        const response = await request(app)
            .post('/api/recipes/image')
            .set('Content-Type', 'multipart/form-data')
            .attach('recipe', Buffer.from('fake text file'), 'test.txt');

        expect(response.status).toBe(400);
        expect(response.body.error).toBe('Not an image! Please upload an image.');
    });

    test('POST /api/recipes/image - should handle missing file', async () => {
        const response = await request(app)
            .post('/api/recipes/image');

        expect(response.status).toBe(400);
        expect(response.body.error).toBe('No image file uploaded');
    });

    test('GET /api/recipes - should get all recipes', async () => {
        const response = await request(app)
            .get('/api/recipes');

        expect(response.status).toBe(200);
        expect(Array.isArray(response.body.recipes)).toBe(true);
    });

    test('GET /api/recipes/search - should search recipes', async () => {
        const response = await request(app)
            .get('/api/recipes/search')
            .query({ query: 'pasta' });

        expect(response.status).toBe(200);
        expect(Array.isArray(response.body.recipes)).toBe(true);
    });

    test('GET /api/recipes/search - should handle empty query', async () => {
        const response = await request(app)
            .get('/api/recipes/search')
            .query({ query: '' });

        expect(response.status).toBe(400);
        expect(response.body.error).toBe('Search query is required');
    });
});
