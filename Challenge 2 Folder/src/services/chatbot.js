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

    parseRecipes(recipesData) {
        const recipes = [];
        const recipeBlocks = recipesData.split('\n\n');
        
        let currentRecipe = null;
        for (let i = 0; i < recipeBlocks.length; i++) {
            const block = recipeBlocks[i].trim();
            if (!block) continue;
            
            if (!block.startsWith('Ingredients:') && !block.startsWith('Instructions:')) {
                if (currentRecipe) {
                    recipes.push(currentRecipe);
                }
                currentRecipe = { name: block, ingredients: [], instructions: '' };
            } else if (block.startsWith('Ingredients:')) {
                currentRecipe.ingredients = block
                    .replace('Ingredients:', '')
                    .split('\n')
                    .map(ing => ing.trim())
                    .filter(ing => ing && ing.startsWith('-'))
                    .map(ing => ing.substring(1).trim());
            }
        }
        if (currentRecipe) {
            recipes.push(currentRecipe);
        }
        return recipes;
    }

    findRelevantRecipes(recipes, searchTerms, availableIngredients) {
        // Convert available ingredients to lowercase for comparison
        const availableIngredientsLower = availableIngredients.map(ing => ing.toLowerCase());

        // Score each recipe based on matching ingredients and terms
        const scoredRecipes = recipes.map(recipe => {
            let score = 0;
            let matchedIngredients = 0;
            let totalIngredients = recipe.ingredients.length;
            
            // Score based on search terms
            const recipeText = recipe.name.toLowerCase();
            searchTerms.forEach(term => {
                if (recipeText.includes(term.toLowerCase())) {
                    score += 2; // Higher weight for name matches
                }
            });

            // Score based on available ingredients
            recipe.ingredients.forEach(ingredient => {
                const ingredientLower = ingredient.toLowerCase();
                if (availableIngredientsLower.some(avail => ingredientLower.includes(avail))) {
                    matchedIngredients++;
                    score += 1;
                }
            });

            const ingredientCoverage = matchedIngredients / totalIngredients;
            
            return {
                ...recipe,
                score,
                matchedIngredients,
                totalIngredients,
                ingredientCoverage
            };
        });

        // Sort by score and ingredient coverage
        return scoredRecipes
            .sort((a, b) => {
                if (Math.abs(b.score - a.score) > 2) {
                    return b.score - a.score;
                }
                return b.ingredientCoverage - a.ingredientCoverage;
            })
            .slice(0, 3);
    }

    async getRecipeRecommendation(userPreference) {
        try {
            // Get available ingredients
            const ingredientsData = await fs.readFile(INGREDIENTS_FILE, 'utf8');
            const ingredients = JSON.parse(ingredientsData);
            const availableIngredients = ingredients.map(ing => ing.name);
            
            // Extract search terms from user preference
            const searchTerms = userPreference.toLowerCase()
                .split(' ')
                .filter(word => word.length > 3)
                .map(word => word.replace(/[^a-z]/g, ''));
            
            // Get and parse recipes
            const recipesData = await fs.readFile(RECIPES_FILE, 'utf8');
            const recipes = this.parseRecipes(recipesData);
            
            // Find relevant recipes considering available ingredients
            const relevantRecipes = this.findRelevantRecipes(recipes, searchTerms, availableIngredients);
            
            // Format recipes for prompt
            const formattedRecipes = relevantRecipes
                .map(recipe => `${recipe.name}
Ingredients needed: ${recipe.ingredients.join(', ')}
Available ingredients match: ${recipe.matchedIngredients}/${recipe.totalIngredients}`)
                .join('\n\n');
            
            // Prepare prompt for GROQ
            const prompt = `As a cooking expert, analyze these recipes and available ingredients:

Available Ingredients: ${availableIngredients.join(', ')}
User's Request: ${userPreference}

Candidate Recipes:
${formattedRecipes}

Please recommend the most suitable recipe based on available ingredients and user's request.
If the user wants ingredients that are not available, mention this clearly.

Format your response as:
Recipe Name:
Feasibility Score (1-10):
Missing Key Ingredients:
Recommendation Details:
Alternative Suggestions (if needed):`;

            const completion = await this.groq.chat.completions.create({
                messages: [{ role: "user", content: prompt }],
                model: "mixtral-8x7b-32768",
                temperature: 0.7,
                max_tokens: 1024,
            });

            return completion.choices[0]?.message?.content || 'No recommendation available';
        } catch (error) {
            console.error('Error in getRecipeRecommendation:', error);
            throw new Error('Failed to get recipe recommendation: ' + error.message);
        }
    }
}

module.exports = new ChatbotService();
