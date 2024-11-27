const express = require('express');

const router = express.Router();


router.get('/', (req, res)=>{
    res.status(201).send('This is the task route')
});

// USER REGISTRATION


// USER LOGIN




module.exports = router; 