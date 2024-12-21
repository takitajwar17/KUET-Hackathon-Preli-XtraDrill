const { Groq } = require('groq-sdk');
const fs = require('fs').promises;
const path = require('path');

const RECIPES_FILE = path.join(__dirname, '../../data/my_fav_recipes.txt');
const INGREDIENTS_FILE = path.join(__dirname, '../../data/ingredients.json');

class ChatbotService {
    constructor() {
        this.groq = new Groq({
            apiKey: process.env.GROQ_API_KEY
        });
    }

    async getRecipeRecommendation(userPreference) {
        try {
            // Get available ingredients
            const ingredientsData = await fs.readFile(INGREDIENTS_FILE, 'utf8');
            const ingredients = JSON.parse(ingredientsData);
            const availableIngredients = ingredients.map(ing => ing.name).join(', ');

            // Get saved recipes
            const recipesData = await fs.readFile(RECIPES_FILE, 'utf8');
            
            // Prepare prompt for GROQ
            const prompt = `As a cooking expert, help recommend a recipe based on the following:
            User Preference: ${userPreference}
            Available Ingredients: ${availableIngredients}
            
            Here are my saved recipes:
            ${recipesData}
            
            Please analyze the saved recipes and available ingredients, then recommend the best matching recipe.
            If no saved recipe matches well, suggest a simple recipe that can be made with the available ingredients.
            
            Format your response as:
            Recipe Name:
            Matching Score (1-10):
            Reason for Recommendation:
            Recipe Details:`;

            const completion = await this.groq.chat.completions.create({
                messages: [
                    {
                        role: "user",
                        content: prompt
                    }
                ],
                model: "mixtral-8x7b-32768",
                temperature: 0.7,
                max_tokens: 1024,
            });

            return completion.choices[0]?.message?.content || 'No recommendation available';
        } catch (error) {
            console.error('Chatbot error:', error);
            throw new Error('Failed to get recipe recommendation');
        }
    }
}

module.exports = new ChatbotService();
