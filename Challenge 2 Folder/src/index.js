require('dotenv').config();
const express = require('express');
const bodyParser = require('body-parser');
const { Groq } = require('groq-sdk');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(bodyParser.json());

// Initialize Groq client
const groq = new Groq({
    apiKey: process.env.GROQ_API_KEY
});

// Basic route
app.get('/', (req, res) => {
    res.json({ message: "Welcome to Mofa's Kitchen Buddy API" });
});

// Start server
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
