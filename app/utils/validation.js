/**
 * Validates a To-Do item title.
 * @param {string} title 
 * @returns {object} { isValid: boolean, error?: string }
 */
function validateTodoTitle(title) {
    if (!title) {
        return { isValid: false, error: 'Title is required' };
    }
    if (typeof title !== 'string') {
        return { isValid: false, error: 'Title must be a string' };
    }
    const trimmed = title.trim();
    if (trimmed.length < 3) {
        return { isValid: false, error: 'Title must be at least 3 characters long' };
    }
    if (trimmed.length > 100) {
        return { isValid: false, error: 'Title must be less than 100 characters long' };
    }
    return { isValid: true, trimmedTitle: trimmed };
}

module.exports = { validateTodoTitle };
