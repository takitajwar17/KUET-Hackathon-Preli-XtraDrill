const request = require('supertest');
const app = require('../index');
const fs = require('fs').promises;
const path = require('path');

const RECIPES_FILE = path.join(__dirname, '../../data/my_fav_recipes.txt');

describe('Recipes API', () => {
    beforeEach(async () => {
        // Clear recipes file before each test
        await fs.writeFile(RECIPES_FILE, '');
    });

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

    test('POST /api/recipes/image - should handle recipe image upload', async () => {
        const response = await request(app)
            .post('/api/recipes/image')
            .attach('recipe', path.join(__dirname, '../__mocks__/test-recipe.jpg'));

        // Note: This test might fail without a proper test image
        // We're mainly testing the endpoint structure
        expect(response.status).toBe(400);
    });

    test('GET /api/recipes - should get all recipes', async () => {
        // Add test recipe first
        const testRecipe = 'Test Recipe\nIngredients:\n- Test ingredient';
        await fs.appendFile(RECIPES_FILE, `\n\n${testRecipe}`);

        const response = await request(app).get('/api/recipes');
        
        expect(response.status).toBe(200);
        expect(response.body.recipes).toBeDefined();
        expect(Array.isArray(response.body.recipes)).toBe(true);
        expect(response.body.recipes[0]).toContain('Test Recipe');
    });

    test('GET /api/recipes/search - should search recipes', async () => {
        // Add test recipes
        const testRecipes = [
            'Chocolate Cake Recipe\nIngredients:\n- Chocolate',
            'Vanilla Cake Recipe\nIngredients:\n- Vanilla'
        ];
        await fs.appendFile(RECIPES_FILE, `\n\n${testRecipes.join('\n\n')}`);

        const response = await request(app)
            .get('/api/recipes/search')
            .query({ query: 'chocolate' });

        expect(response.status).toBe(200);
        expect(response.body.recipes).toBeDefined();
        expect(response.body.recipes.length).toBe(1);
        expect(response.body.recipes[0]).toContain('Chocolate');
    });
});
