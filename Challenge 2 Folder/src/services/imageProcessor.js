const Tesseract = require('node-tesseract-ocr');
const fs = require('fs').promises;
const path = require('path');

const RECIPES_FILE = path.join(__dirname, '../../data/my_fav_recipes.txt');

// Configure Tesseract with full path
const config = {
    lang: "eng",
    oem: 1,
    psm: 3,
    binary: '"C:\\Program Files\\Tesseract-OCR\\tesseract.exe"' // Use the full path that we know works
};

class ImageProcessor {
    static async extractTextFromImage(imagePath) {
        try {
            console.log('Using Tesseract binary:', config.binary);
            const text = await Tesseract.recognize(imagePath, config);
            return text;
        } catch (error) {
            console.error('Error in OCR:', error);
            throw new Error('Failed to extract text from image: ' + error.message);
        }
    }

    static async saveRecipeFromImage(imagePath) {
        try {
            // Extract text from image
            const recipeText = await this.extractTextFromImage(imagePath);
            
            // Format the extracted text
            const formattedRecipe = `\n\nRecipe from Image:\n${recipeText.trim()}`;
            
            // Check if recipe already exists
            const existingContent = await fs.readFile(RECIPES_FILE, 'utf8');
            if (!existingContent.includes(formattedRecipe.trim())) {
                // Only append if recipe doesn't exist
                await fs.appendFile(RECIPES_FILE, formattedRecipe);
            }
            
            return formattedRecipe;
        } catch (error) {
            console.error('Error processing image:', error);
            throw error;
        }
    }
}

module.exports = ImageProcessor;
