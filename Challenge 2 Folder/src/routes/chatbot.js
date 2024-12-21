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

        console.log('Received preference:', preference);
        const recommendation = await chatbotService.getRecipeRecommendation(preference);
        console.log('Got recommendation:', recommendation);
        res.json({ recommendation });
    } catch (error) {
        console.error('Chatbot route error:', error);
        res.status(500).json({ 
            error: 'Error getting recommendation',
            details: error.message 
        });
    }
});

module.exports = router;
