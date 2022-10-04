const mongoose = require('mongoose');
// const mongodb = require('mongodb');
const Schema = mongoose.Schema;

const HfinderSchema = new Schema({
    title: String, 
    price: Number, 
    image: String,
    description: String,
    location: String
});





module.exports = mongoose.model('Hfinder', HfinderSchema);
