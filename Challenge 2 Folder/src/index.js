require('dotenv').config();
const express = require('express');
const bodyParser = require('body-parser');

const app = express();
const PORT = process.env.PORT || 3000;

// Import routes
const ingredientRoutes = require('./routes/ingredients');
const recipeRoutes = require('./routes/recipes');
const chatbotRoutes = require('./routes/chatbot');

// Middleware
app.use(bodyParser.json());

// Routes
app.use('/api/ingredients', ingredientRoutes);
app.use('/api/recipes', recipeRoutes);
app.use('/api/chatbot', chatbotRoutes);

// Basic route
app.get('/', (req, res) => {
    res.json({ message: "Welcome to Mofa's Kitchen Buddy API" });
});

// Start server only if not in test environment
if (process.env.NODE_ENV !== 'test') {
    app.listen(PORT, () => {
        console.log(`Server is running on port ${PORT}`);
    });
}

module.exports = app;
