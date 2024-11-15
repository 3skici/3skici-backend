const express = require('express');
const router = express.Router();
const controller = require('../controllers/categoryController');

router.post('/add', controller.create);
router.put('/edit/:id', controller.update);
router.delete('/remove/:id', controller.remove);
router.get('/all', controller.getAll);
router.get('/:id', controller.getById);



module.exports = router;