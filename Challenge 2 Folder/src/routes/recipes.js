const express = require('express');
const router = express.Router();
const fs = require('fs').promises;
const path = require('path');

const RECIPES_FILE = path.join(__dirname, '../../data/my_fav_recipes.txt');

// Get all recipes
router.get('/', async (req, res) => {
    try {
        const data = await fs.readFile(RECIPES_FILE, 'utf8');
        res.json({ recipes: data.split('\n\n').filter(recipe => recipe.trim()) });
    } catch (error) {
        res.status(500).json({ error: 'Error reading recipes' });
    }
});

// Add new recipe
router.post('/', async (req, res) => {
    try {
        const { recipe } = req.body;
        if (!recipe) {
            return res.status(400).json({ error: 'Recipe text is required' });
        }

        const formattedRecipe = `\n\n${recipe.trim()}`;
        await fs.appendFile(RECIPES_FILE, formattedRecipe);
        res.status(201).json({ message: 'Recipe added successfully' });
    } catch (error) {
        res.status(500).json({ error: 'Error adding recipe' });
    }
});

// Search recipes by query
router.get('/search', async (req, res) => {
    try {
        const { query } = req.query;
        if (!query) {
            return res.status(400).json({ error: 'Search query is required' });
        }

        const data = await fs.readFile(RECIPES_FILE, 'utf8');
        const recipes = data.split('\n\n').filter(recipe => recipe.trim());
        const matchedRecipes = recipes.filter(recipe => 
            recipe.toLowerCase().includes(query.toLowerCase())
        );

        res.json({ recipes: matchedRecipes });
    } catch (error) {
        res.status(500).json({ error: 'Error searching recipes' });
    }
});

module.exports = router;
