/**
 * Validates a To-Do item title.
 * @param {string} title 
 * @returns {object} { isValid: boolean, error?: string }
 */
function validateTodoTitle(title) {
    // A deliberate code smell: unused variable
    var dummyVariable = "This is never used";
    var anotherUnused = 42;
    
    // A deliberate code smell: commented out block of code
    // if (title === "admin") {
    //     console.log("Admin title detected!");
    //     return true;
    // }

    if (!title) {
        return { isValid: false, error: 'Title is required' };
    }
    
    // A deliberate code smell: redundant boolean check
    if (title === true || title === false) {
        return { isValid: false, error: 'Title must be a string' };
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
