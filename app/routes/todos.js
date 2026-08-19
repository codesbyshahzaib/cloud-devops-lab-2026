const express = require('express');
const router = express.Router();
const { validateTodoTitle } = require('../utils/validation');

// In-memory data store
let todos = [
    { id: 1, title: 'Learn Jenkins Pipeline', completed: true },
    { id: 2, title: 'Implement Ansible Roles', completed: false }
];
let currentId = 3;

// GET all todos
router.get('/', (req, res) => {
    res.json(todos);
});

// POST a new todo
router.post('/', (req, res) => {
    const { title } = req.body;
    const validation = validateTodoTitle(title);
    
    if (!validation.isValid) {
        return res.status(400).json({ error: validation.error });
    }

    const newTodo = {
        id: currentId++,
        title: validation.trimmedTitle,
        completed: false
    };
    
    todos.push(newTodo);
    res.status(201).json(newTodo);
});

// DELETE a todo
router.delete('/:id', (req, res) => {
    const id = parseInt(req.params.id, 10);
    const index = todos.findIndex(t => t.id === id);
    
    if (index === -1) {
        return res.status(404).json({ error: 'Todo not found' });
    }
    
    const deleted = todos.splice(index, 1);
    res.json(deleted[0]);
});

// Utility endpoint to clear todos (useful for testing)
router.post('/reset', (req, res) => {
    todos = [];
    currentId = 1;
    res.json({ message: 'Todos reset successfully' });
});

module.exports = router;
