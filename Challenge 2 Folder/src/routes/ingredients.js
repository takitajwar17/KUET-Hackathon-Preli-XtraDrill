const express = require('express');
const router = express.Router();
const fs = require('fs').promises;
const path = require('path');

const INGREDIENTS_FILE = path.join(__dirname, '../../data/ingredients.json');

// Get all ingredients
router.get('/', async (req, res) => {
    try {
        const data = await fs.readFile(INGREDIENTS_FILE, 'utf8');
        const ingredients = JSON.parse(data);
        res.json(ingredients);
    } catch (error) {
        res.status(500).json({ error: 'Error reading ingredients' });
    }
});

// Add new ingredients
router.post('/', async (req, res) => {
    try {
        const { name, quantity, unit } = req.body;
        const data = await fs.readFile(INGREDIENTS_FILE, 'utf8');
        const ingredients = JSON.parse(data);
        
        ingredients.push({
            id: Date.now().toString(),
            name,
            quantity,
            unit,
            updatedAt: new Date().toISOString()
        });
        
        await fs.writeFile(INGREDIENTS_FILE, JSON.stringify(ingredients, null, 2));
        res.status(201).json({ message: 'Ingredient added successfully' });
    } catch (error) {
        res.status(500).json({ error: 'Error adding ingredient' });
    }
});

// Update ingredient quantity
router.put('/:id', async (req, res) => {
    try {
        const { quantity } = req.body;
        const data = await fs.readFile(INGREDIENTS_FILE, 'utf8');
        let ingredients = JSON.parse(data);
        
        const index = ingredients.findIndex(ing => ing.id === req.params.id);
        if (index === -1) {
            return res.status(404).json({ error: 'Ingredient not found' });
        }
        
        ingredients[index].quantity = quantity;
        ingredients[index].updatedAt = new Date().toISOString();
        
        await fs.writeFile(INGREDIENTS_FILE, JSON.stringify(ingredients, null, 2));
        res.json({ message: 'Ingredient updated successfully' });
    } catch (error) {
        res.status(500).json({ error: 'Error updating ingredient' });
    }
});

// Delete ingredient
router.delete('/:id', async (req, res) => {
    try {
        const data = await fs.readFile(INGREDIENTS_FILE, 'utf8');
        let ingredients = JSON.parse(data);
        
        ingredients = ingredients.filter(ing => ing.id !== req.params.id);
        
        await fs.writeFile(INGREDIENTS_FILE, JSON.stringify(ingredients, null, 2));
        res.json({ message: 'Ingredient deleted successfully' });
    } catch (error) {
        res.status(500).json({ error: 'Error deleting ingredient' });
    }
});

module.exports = router;
