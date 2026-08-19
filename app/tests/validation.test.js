const { validateTodoTitle } = require('../utils/validation');

describe('Validation Utils: validateTodoTitle', () => {
    it('should return invalid if title is empty', () => {
        const result = validateTodoTitle('');
        expect(result.isValid).toBe(false);
        expect(result.error).toBe('Title is required');
    });

    it('should return invalid if title is not a string', () => {
        const result = validateTodoTitle(123);
        expect(result.isValid).toBe(false);
        expect(result.error).toBe('Title must be a string');
    });

    it('should return invalid if title is too short', () => {
        const result = validateTodoTitle('ab');
        expect(result.isValid).toBe(false);
        expect(result.error).toBe('Title must be at least 3 characters long');
    });

    it('should return invalid if title is too long', () => {
        const longTitle = 'a'.repeat(101);
        const result = validateTodoTitle(longTitle);
        expect(result.isValid).toBe(false);
        expect(result.error).toBe('Title must be less than 100 characters long');
    });

    it('should trim whitespace from a valid title', () => {
        const result = validateTodoTitle('   Buy milk   ');
        expect(result.isValid).toBe(true);
        expect(result.trimmedTitle).toBe('Buy milk');
    });
});
