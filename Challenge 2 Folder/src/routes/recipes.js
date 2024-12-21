const express = require('express');
const router = express.Router();
const fs = require('fs').promises;
const path = require('path');
const multer = require('multer');
const ImageProcessor = require('../services/imageProcessor');

const RECIPES_FILE = path.join(__dirname, '../../data/my_fav_recipes.txt');

// Configure multer for image upload
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, path.join(__dirname, '../../uploads/'));
    },
    filename: function (req, file, cb) {
        cb(null, Date.now() + '-' + file.originalname);
    }
});

const upload = multer({ 
    storage: storage,
    fileFilter: (req, file, cb) => {
        if (!file) {
            cb(new Error('No file uploaded'), false);
            return;
        }
        if (file.mimetype.startsWith('image/')) {
            cb(null, true);
        } else {
            cb(new Error('Not an image! Please upload an image.'), false);
        }
    }
}).single('recipe');

// Create uploads directory if it doesn't exist
const uploadsDir = path.join(__dirname, '../../uploads');
fs.mkdir(uploadsDir, { recursive: true }).catch(console.error);

// Get all recipes
router.get('/', async (req, res) => {
    try {
        const data = await fs.readFile(RECIPES_FILE, 'utf8');
        res.json({ recipes: data.split('\n\n').filter(recipe => recipe.trim()) });
    } catch (error) {
        res.status(500).json({ error: 'Error reading recipes' });
    }
});

// Add new recipe from text
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

// Add new recipe from image
router.post('/image', (req, res) => {
    upload(req, res, async (err) => {
        try {
            if (err) {
                return res.status(400).json({ error: err.message });
            }
            
            if (!req.file) {
                return res.status(400).json({ error: 'No image file uploaded' });
            }

            const extractedRecipe = await ImageProcessor.saveRecipeFromImage(req.file.path);
            res.status(201).json({ 
                message: 'Recipe extracted and added successfully',
                extractedText: extractedRecipe
            });
        } catch (error) {
            console.error('Error processing image:', error);
            res.status(500).json({ error: 'Error processing recipe image: ' + error.message });
        }
    });
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
