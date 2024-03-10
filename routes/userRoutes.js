//routes relating to user 

const express = require('express');
const controller = require('./../controllers/userControllers');
const router = express.Router();


router.get('/userDetails/:username', controller.getUserDetails);
router.post('/register', controller.register);
router.delete('/deleteAccount/:id', controller.deleteAccount);

module.exports = router;