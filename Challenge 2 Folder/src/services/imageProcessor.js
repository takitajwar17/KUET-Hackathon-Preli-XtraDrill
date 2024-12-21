const Tesseract = require('node-tesseract-ocr');
const fs = require('fs').promises;
const path = require('path');
const multer = require('multer');

const RECIPES_FILE = path.join(__dirname, '../../data/my_fav_recipes.txt');

// Configure Tesseract
const config = {
    lang: "eng",
    oem: 1,
    psm: 3,
};

class ImageProcessor {
    static async extractTextFromImage(imagePath) {
        try {
            const text = await Tesseract.recognize(imagePath, config);
            return text;
        } catch (error) {
            console.error('Error in OCR:', error);
            throw new Error('Failed to extract text from image');
        }
    }

    static async saveRecipeFromImage(imagePath) {
        try {
            // Extract text from image
            const recipeText = await this.extractTextFromImage(imagePath);
            
            // Format the extracted text
            const formattedRecipe = `\n\nRecipe from Image:\n${recipeText.trim()}`;
            
            // Append to recipes file
            await fs.appendFile(RECIPES_FILE, formattedRecipe);
            
            // Delete temporary image file
            await fs.unlink(imagePath);
            
            return formattedRecipe;
        } catch (error) {
            console.error('Error processing image:', error);
            throw error;
        }
    }
}

module.exports = ImageProcessor;
