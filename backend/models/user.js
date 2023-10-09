const mongoose = require('mongoose');

const Schema = mongoose.Schema;
const uniqueValidaor = require('mongoose-unique-validator');


const userSchema = new Schema({
    name:{type: String, required:true},
    email:{type: String, required:true, unique:true},
    password:{type: String, required:true, minLength:6},
    image: {type: String, required:true},
    places:[ {type: mongoose.Types.ObjectId, required:true, ref:'Place'}],
});


userSchema.plugin(uniqueValidaor);

module.exports = mongoose.model('User', userSchema)