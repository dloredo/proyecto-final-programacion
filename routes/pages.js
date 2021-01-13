const express = require('express');
const jwt = require('jsonwebtoken');
const router = express.Router();
const authController = require('../controllers/auth');
router.get('/' , authController.verify);

router.get('/register' , (req,res) => {
    res.render('register');
});
router.get('/login' , (req,res) => {
    res.render('login');
});

// router.get('/' , (req,res,next)=>{
//     const token = req.headers['x-access-token'];
//     if(!token)
//     {
//         return res.status(401).render('login' , {
//             message: 'Debes de iniciar sesion para poder navegar'
//         });
//     }

//     const decoded =  jwt.verify(token , process.env.JWT_SECRET);

// });

module.exports = router;