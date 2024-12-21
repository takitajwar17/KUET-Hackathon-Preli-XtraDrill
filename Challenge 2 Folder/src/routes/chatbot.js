const express = require('express');
const router = express.Router();
const chatbotService = require('../services/chatbot');

// Get recipe recommendation
router.post('/recommend', async (req, res) => {
    try {
        const { preference } = req.body;
        if (!preference) {
            return res.status(400).json({ error: 'Preference is required' });
        }

        const recommendation = await chatbotService.getRecipeRecommendation(preference);
        res.json({ recommendation });
    } catch (error) {
        res.status(500).json({ error: 'Error getting recommendation' });
    }
});

module.exports = router;
