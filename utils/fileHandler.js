const fs = require('fs').promises;
const path = require('path');

class FileHandler {
    /**
     * Reads content from a file
     * @param {string} filePath - Path to the file
     * @returns {Promise<string>} - File content
     */
    static async readFile(filePath) {
        try {
            return await fs.readFile(filePath, 'utf8');
        } catch (error) {
            throw new Error(`Error reading file: ${error.message}`);
        }
    }

    /**
     * Writes content to a file
     * @param {string} filePath - Path to the file
     * @param {string} content - Content to write
     * @returns {Promise<void>}
     */
    static async writeFile(filePath, content) {
        try {
            await fs.writeFile(filePath, content, 'utf8');
        } catch (error) {
            throw new Error(`Error writing file: ${error.message}`);
        }
    }

    /**
     * Checks if a file exists
     * @param {string} filePath - Path to the file
     * @returns {Promise<boolean>}
     */
    static async fileExists(filePath) {
        try {
            await fs.access(filePath);
            return true;
        } catch {
            return false;
        }
    }

    /**
     * Creates a directory if it doesn't exist
     * @param {string} dirPath - Path to the directory
     * @returns {Promise<void>}
     */
    static async ensureDirectory(dirPath) {
        try {
            await fs.mkdir(dirPath, { recursive: true });
        } catch (error) {
            throw new Error(`Error creating directory: ${error.message}`);
        }
    }

    /**
     * Deletes a file if it exists
     * @param {string} filePath - Path to the file
     * @returns {Promise<void>}
     */
    static async deleteFile(filePath) {
        try {
            if (await FileHandler.fileExists(filePath)) {
                await fs.unlink(filePath);
            }
        } catch (error) {
            throw new Error(`Error deleting file: ${error.message}`);
        }
    }
}

module.exports = FileHandler;