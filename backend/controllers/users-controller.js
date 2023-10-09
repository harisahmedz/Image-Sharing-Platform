const bcrypt = require('bcryptjs')
const { validationResult } = require('express-validator');

const User = require('../models/user');
const HttpError = require('../models/http-error');
const jwt = require('jsonwebtoken')


const getUsers = async (req, res, next) => {
    let users;
    try {
        users = await User.find({}, '-password');
    } catch (err) {
        return next(new HttpError('Fteching user Failed,', 500))
    }
    if (!users) {
        return next(new HttpError('Fteching user Failed,', 500))
    }
    res.json({ users: users.map(user => user.toObject({ getters: true })) });
}

const signUp = async (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return next(new HttpError('Invalid inputs passed, please check your data', 422));
    }

    const { name, email, password } = req.body;


    let existingUser;
    try {
        existingUser = await User.findOne({ email: email })
    } catch (e) {
        const error = new HttpError('SignUp Failed, Please try Again Later '+e , 500)
        return next(error)
    }

    if (existingUser) {
        const error = new HttpError('User Already Exists, Login instead', 422)
        return next(error)
    }
    let hashedPassword;
    try{
        hashedPassword= await bcrypt.hash(password, 12);
    }catch(err){
        const error = new HttpError("Couldn't create user, please try again"+e, 500)
        return next(error)
    }
    
    

    const createdUser = new User({
        name,
        email,
        image: req.file.path,
        password:hashedPassword,
        places: []
    })
    try {
        await createdUser.save()
    } catch (err) {
        const error = new HttpError('Sign Up failed, Please try again ', 500)
        return next(error)
    }
    let token;
    try{
        token = jwt.sign({userId:createdUser.id, email:createdUser.email}, process.env.JWT_KEY,
        {expiresIn:'1h'}
        );
    }catch(err){
        const error = new HttpError('Sign Up failed, Please try again ', 500)
        return next(error)
    }



    res.status(201).json({ userId:createdUser.id, email:createdUser.email, token:token });

}
const login = async (req, res, next) => {
    const { email, password } = req.body;
    let existingUser;
    try {
        existingUser = await User.findOne({ email: email })
    } catch (e) {
        const error = new HttpError('Login Failed, Please try Again Later', 500)
        return next(error)
    }
    if (!existingUser) {
        const error = new HttpError('InValid Credentials, Could not login', 403)
        return next(error);
    }
    let isValidPassword = false;
    try{

        isValidPassword = await bcrypt.compare(password, existingUser.password)
    }
    catch(err){
        const error = new HttpError("Couldn't login, please check your credentials", 500)
        return next(error)
    }
    
    if(!isValidPassword){
        const error = new HttpError("Invalid Password, could not login", 401)
        return next(error)
    }

    let token;
    try{
        token = jwt.sign({userId:existingUser.id, email:existingUser.email},
                            process.env.JWT_KEY,
                            {expiresIn:'1h'}
                        );
    }catch(err){
        const error = new HttpError('login failed, Please try again ', 500)
        return next(error)
    }


    res.json({
        userId:existingUser.id,
        email:existingUser.email,
        token:token,
     })
}


exports.getUsers = getUsers
exports.signUp = signUp
exports.login = login