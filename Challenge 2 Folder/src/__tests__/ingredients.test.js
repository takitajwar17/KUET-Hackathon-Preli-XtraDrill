const request = require('supertest');
const app = require('../index');
const fs = require('fs').promises;
const path = require('path');

const INGREDIENTS_FILE = path.join(__dirname, '../../data/ingredients.json');

describe('Ingredients API', () => {
    let testIngredientId;

    beforeEach(async () => {
        // Reset ingredients.json to empty array before each test
        await fs.writeFile(INGREDIENTS_FILE, '[]');
    });

    test('POST /api/ingredients - should add new ingredient', async () => {
        const response = await request(app)
            .post('/api/ingredients')
            .send({
                name: 'carrot',
                quantity: 3,
                unit: 'pieces'
            });

        expect(response.status).toBe(201);
        expect(response.body.message).toBe('Ingredient added successfully');

        // Verify ingredient was added
        const data = await fs.readFile(INGREDIENTS_FILE, 'utf8');
        const ingredients = JSON.parse(data);
        expect(ingredients.length).toBe(1);
        expect(ingredients[0].name).toBe('carrot');
        testIngredientId = ingredients[0].id;
    });

    test('GET /api/ingredients - should get all ingredients', async () => {
        // Add test ingredient first
        await request(app)
            .post('/api/ingredients')
            .send({
                name: 'potato',
                quantity: 5,
                unit: 'pieces'
            });

        const response = await request(app).get('/api/ingredients');
        
        expect(response.status).toBe(200);
        expect(Array.isArray(response.body)).toBe(true);
        expect(response.body.length).toBe(1);
        expect(response.body[0].name).toBe('potato');
    });

    test('PUT /api/ingredients/:id - should update ingredient', async () => {
        // Add test ingredient first
        const postResponse = await request(app)
            .post('/api/ingredients')
            .send({
                name: 'onion',
                quantity: 2,
                unit: 'pieces'
            });

        const data = await fs.readFile(INGREDIENTS_FILE, 'utf8');
        const ingredients = JSON.parse(data);
        const ingredientId = ingredients[0].id;

        const response = await request(app)
            .put(`/api/ingredients/${ingredientId}`)
            .send({
                quantity: 4
            });

        expect(response.status).toBe(200);
        expect(response.body.message).toBe('Ingredient updated successfully');

        // Verify update
        const updatedData = await fs.readFile(INGREDIENTS_FILE, 'utf8');
        const updatedIngredients = JSON.parse(updatedData);
        expect(updatedIngredients[0].quantity).toBe(4);
    });

    test('DELETE /api/ingredients/:id - should delete ingredient', async () => {
        // Add test ingredient first
        const postResponse = await request(app)
            .post('/api/ingredients')
            .send({
                name: 'garlic',
                quantity: 5,
                unit: 'pieces'
            });

        const data = await fs.readFile(INGREDIENTS_FILE, 'utf8');
        const ingredients = JSON.parse(data);
        const ingredientId = ingredients[0].id;

        const response = await request(app)
            .delete(`/api/ingredients/${ingredientId}`);

        expect(response.status).toBe(200);
        expect(response.body.message).toBe('Ingredient deleted successfully');

        // Verify deletion
        const updatedData = await fs.readFile(INGREDIENTS_FILE, 'utf8');
        const updatedIngredients = JSON.parse(updatedData);
        expect(updatedIngredients.length).toBe(0);
    });
});
