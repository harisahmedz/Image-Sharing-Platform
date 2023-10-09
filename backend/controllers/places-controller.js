const fs = require('fs');

const {validationResult} = require('express-validator');
const mongoose = require('mongoose');

const getCoordsforAddress = require('../util/location');
const HttpError = require('../models/http-error');
const Place = require('../models/place');
const User = require('../models/user');


const getPlaceById = async(req, res, next)=>{
    const placeId = req.params.pid //{pid:'p1'}
    let place;
    try{
        place = await Place.findById(placeId);
    }catch(err){
        const error = new HttpError('Something Went wrong, Could not find a place', 500);
        return next(error)
    }


    if(!place){
        const error = HttpError('Could not find a place for the provided id', 404);
        return next(error)
    }

    res.json({ place:place.toObject({getters:true}) });
}

const getPlacesByUserId = async(req, res, next)=>{
    const userId = req.params.uid;
    let userWithPlaces;
    try{
        userWithPlaces = await User.findById(userId).populate('places');
    }catch(err){
        const error = new HttpError('Something Went wrong, Fetching failed', 500);
        return next(error)
    }
    
    if(!userWithPlaces || userWithPlaces.places.length ===0){
        return next(new HttpError('Could not find a place for the provided User id', 404));
    }
    res.json({ places:userWithPlaces.places.map( place=>place.toObject({getters:true}) ) })

    // let places;
    // try{
    //     places = await Place.find({creator:userId});
    // }catch(err){
    //     const error = new HttpError('Something Went wrong, Fetching failed', 500);
    //     return next(error)
    // }

    // if(!places || places.length ===0){
    //     return next(new HttpError('Could not find a place for the provided User id', 404));
    // }
    // res.json({ places:places.map( place=>place.toObject({getters:true}) ) })
}

const createPlace = async(req,res,next)=>{
    const errors = validationResult(req);
    if(!errors.isEmpty()){
        return next(new HttpError('Invalid inputs passed, please check your data', 422));
    }

    const {title, description, address} = req.body;
    let coordinates = getCoordsforAddress(address)
    const createdPlace = new Place({
        title,
        description,
        address,
        location:coordinates,
        image:req.file.path,
        creator:req.userData.userId,
    })


    let user;
    try{
        user = await User.findById(req.userData.userId);
    }catch(err){
        const error = new HttpError('Creating place failed, please try Again')
        return next(error)
    }
    if(!user){
        const error = new HttpError('Could not find user for provided id', 404);
        return next(error)
    }

    try{
        const sess = await mongoose.startSession();
        sess.startTransaction();
        await createdPlace.save({session:sess});
        user.places.push(createdPlace);
        await user.save({session:sess});
        await sess.commitTransaction();
        
    }catch(err){
        const error = new HttpError(`Creating Place Failed, Please Try Again + ${err}`,500)
        return next(error);
    }
    
    res.status(201).json({place:createdPlace});
}

const UpdatePlace = async(req, res, next)=>{
    const errors = validationResult(req);
    if(!errors.isEmpty()){
        return next(new HttpError('Invalid inputs passed, please check your data', 422));
    }

    const {title, description,} = req.body;
    const placeId = req.params.pid //{pid:'p1'}

    let place;
    try{
        place = await Place.findById(placeId);
    }catch(err){
        const error = new HttpError(`Something went Wrong, Could not update place + ${err}`,500)
        return next(error);
    }
    if(place.creator.toString() !== req.userData.userId){
        const error = new HttpError('You are not allowed to edit this place',401);
        return next(error);
    }

    place.title = title;
    place.description = description;

    try{
         await place.save();
    }catch(err){
        const error = new HttpError(`Something went Wrong, Could not update place + ${err}`,500)
        return next(error);
    }

    res.status(200).json({ place:place.toObject({getters:true}) })
    
}
const DeletePlace = async(req, res, next)=>{
    const placeId = req.params.pid //{pid:'p1'}
    let place;
    try{
        place = await Place.findById(placeId).populate('creator');
 
    }catch(err){
        const error = new HttpError(`Something went Wrong, Could not update place + ${err}`,500)
        return next(error);
    }
    if(!place){
        const error = new HttpError(`Something went Wrong, Could not find id + ${err}`,500)
        return next(error);
    }

    if(place.creator.id !== req.userData.userId){
        const error = new HttpError('You are not allowed to edit this place',403);
        return next(error);
    }
    const imagePath = place.image;

    try{
        const sess = await mongoose.startSession();
        sess.startTransaction();
        await  place.deleteOne({session:sess});
        place.creator.places.pull(place);
        await place.creator.save({session:sess});
        await sess.commitTransaction();
    }catch(err){
        const error = new HttpError(`Something went Wrong, Could not update place + ${err}`,500)
        return next(error);
    }
    fs.unlink(imagePath, err=>{
        console.log(err);
    })
    res.status(200).json({message:'Deleted Place.'})

    
}



exports.getPlaceById = getPlaceById;
exports.getPlacesByUserId = getPlacesByUserId;
exports.createPlace = createPlace;
exports.UpdatePlace =UpdatePlace;
exports.DeletePlace =DeletePlace;
