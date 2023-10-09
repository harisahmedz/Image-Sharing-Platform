const fs = require('fs');
const path = require('path')
const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
require('dotenv').config()

const placesRoutes = require('./routes/places-routers');
const usersRoutes = require('./routes/users-routes');
const HttpError = require('./models/http-error')

const app = express();

app.use(bodyParser.json());
app.use('/uploads/images', express.static((path.join('uploads', 'images'))));

app.use((req,res,next)=>{
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
    res.setHeader('Access-Control-Allow-Methods', 'Get, POST, PATCH, DELETE');
    
    next();
})

app.use('/api/places',placesRoutes)
app.use('/api/users',usersRoutes)

app.use((req, res, next)=>{
    const error  = new HttpError('Could not Find this Route', 404);
    throw error;
});

//as a middleware
app.use((error,req,res, next)=>{
    if(req.file){
        fs.unlink(req.file.path, (err)=>{
            console.log(err)
        })
    }
    if(res.headerSent){
        return next(error);
    }
    res.status(error.code || 500);
    res.json({message:error.message || 'An Unknown Error Occured'});
})


const url = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASSWORD}@nodetut.x13vgrj.mongodb.net/${process.env.DB_NAME}?retryWrites=true&w=majority`
mongoose.connect(url)
        .then(()=>{
            app.listen(5000, ()=>(console.log("Server Started")));
        })
        .catch(error => console.log(error))

// app.listen(5000, ()=>(console.log("Server Started")));
