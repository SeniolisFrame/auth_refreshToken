const express = require("express");
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const mongoose = require('mongoose');

const app = express();

app.use(express.json());
const PORT = 4000;

const dotenv = require("dotenv");
dotenv.config();

require('./user_db');
const User = require("./model/user_model");
const RefreshToken = require("./model/refresh_token_model");

generateAccessToken = (user) => {
    return jwt.sign(user, process.env.ACCESS_TOKEN, { expiresIn: '20s' });
}

generateRefreshToken = (user) => {
    return jwt.sign(user, process.env.REFRESH_TOKEN);
}

app.post('/getToken',(req,res)=>{
    const authHeader = req.headers['authorization'];
    const refresh_token = authHeader && authHeader.split(' ')[1];

    if(refresh_token==null) return res.status(401).json({
        message : "invalid token"
    });
    jwt.verify(refresh_token, process.env.REFRESH_TOKEN, (err, user) => {
        if (err) return res.sendStatus(403);
        RefreshToken.findOne({ refresh_token : refresh_token }).then((token) => {
            if(!user){
                throw new Error();
            }
            if(token.user_id==user._id){
                const access_token = generateAccessToken({ _id : user._id });
                return res.json({ access_token : access_token });
            }
        }).catch((err)=>{
            return res.json({message: "error"})
        });
    });
});

app.post('/register',async (req,res) => {
    User.find(
            { username : req.body.username }
        ).then((user) => {
            if (user.length)
                return res.json({ message:"Email or Username Exists"});
            bcrypt.hash(req.body.password,10,(err,encrpted)=>{
                if(err)
                    return res.json({ error : err })
                User({
                    _id : new mongoose.Types.ObjectId(),
                    username : req.body.username,
                    password : encrpted,
                }).save().then(()=>{
                    return res.json({
                        message : 'register success',
                    })
                })
        });
    });
});

app.post('/login',async (req,res) => {
    User.findOne(
        { username : req.body.username }
    ).then((user)=>{
        if(!user){
            throw new Error();
        }
        bcrypt.compare(req.body.password,user.password,(err,result)=>{
            if (err) {
                return res.json({
                    error : err
                })
            }
            if (result) {
                const refresh_token = generateRefreshToken({ _id : user._id });
                RefreshToken({
                    _id : new mongoose.Types.ObjectId(),
                    user_id : user._id,
                    refresh_token : refresh_token
                }).save().then(()=>{
                    return res.json({
                        name : user.name,
                        username : user.username,
                        refresh_token: refresh_token
                    })
                })
            } else {
                return res.json({
                    message : 'username or password incorrect'
                })
            }
        })
    }).catch(()=>{
        return res.json({
            message : 'username or password incorrect'
        })
    });
});

app.post('/logout', async (req,res) => {
    const authHeader = req.headers['authorization'];
    const refresh_token = authHeader && authHeader.split(' ')[1];
    if(refresh_token==null) return res.status(401).json({
        message : "invalid token"
    });

    RefreshToken.deleteOne({ refresh_token : refresh_token }).then(()=> { return res.json({ logout:true }) }).catch((err)=> {return res.json({ logout:false})});
})

app.listen(PORT, () => { console.log(`server running at port ${PORT}`) });