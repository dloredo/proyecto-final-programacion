const express = require('express');
const path = require('path');
const mysql = require('mysql');
const dotenv = require('dotenv');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');

const router = express.Router();
dotenv.config({ path: "./.env" });

const app = express();
const controller = {};
const db = mysql.createConnection({
    host: "localhost",
    user: "root",
    password: "",
    database: process.env.DATABASE
});

controller.login = async(req,res) => {
    try {
        const {email,password} = req.body;
        if(!email || !password){
            return res.status(400).render('login' , {
                message: 'Los campos son requeridos'
            });
        }

        db.query('select * from users where email = ? ' , [email] , async (error,results) => {
            console.log(results);
            if( !results || !(await bcrypt.compare(password , results[0].password)) )
            {
                res.status(401).render('login' , {
                    message: "Las credenciales no coinciden con nuestros datos"
                });
            }else{
                const id = results[0].id;
                const token = jwt.sign({ id: id } , process.env.JWT_SECRET , {
                    expiresIn: process.env.JWT_EXPIRES_IN
                });
                console.log("El token es" , token);

                const cookieOptions = {
                    expires: new Date(
                        Date.now() + process.env.JWT_COOKIE_EXPIRES * 24 * 60 * 60 * 1000
                    ),
                    httpOnly: true
                }

                res.cookie('jwt' , token , cookieOptions);
                res.json({auth:true , token: token}).status(200).redirect("/");
            }
        })
    } catch (error) {
        console.log(error);
    }
}

controller.verify = async (req,res,next)=>{
    const token = req.headers['authorization'];
    console.log(token);
    if(!token)
    {
        return res.status(401).render('login' , {
            message: 'Debes de iniciar sesion para poder navegar'
        });
    }

    const decoded =  jwt.verify(token , process.env.JWT_SECRET);
}


controller.register = (req,res) => {
    console.log(req.body);

    // const name  = req.body.name;
    // const email = req.body.email;
    // const password = req.body.password;
    // const passwordConfirm = req.body.passwordConfirm;

    const {name,email,password,passwordConfirm} = req.body;
    db.query('select email from users where email = ?' , [email] , async (error,result)=>{
        if(error){
            console.log(error);
        }
        if(result.length > 0)
        {
            return res.render('register' , {
                message: "Correo electronico en uso"
            });
        }else if(password !== passwordConfirm){
            return res.render('register' , {
                message: "La contraseña no coincide"
            });
        }
        let hash = await bcrypt.hash(password, 8);
        console.log(hash);

        db.query('insert into users set ? ', { name: name, email: email, password: hash}, (error,results) => {
            if(error){
                console.log(error)
            }
            else{
                console.log(results);
                return res.render('login' , {
                    message: "Usuario registrado correctamente"
                });
            }
        });
    });
};

module.exports = controller;