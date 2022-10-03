const Hfinder = require('../models/hfinder');
const mongoose = require('mongoose');
const cities = require('./cities');
const { places, descriptors } = require('./seedHelpers');
var mongo = require('mongodb');



mongoose.connect('mongodb://localhost:27017/House-Finder', {
    useNewUrlParser: true,
    // useCreateIndex: true,
    useUnifiedTopology: true
});


const db = mongoose.connection;
db.on("error", console.error.bind(console, "connection error:"));
db.once("open", () => {
    console.log("DB connected");
});

const sample = array => array[Math.floor(Math.random() * array.length)];

const seedDB = async () => {
    await Hfinder.deleteMany({});
    for(let i = 0; i < 50; i++ ) {
        const random1000 = Math.floor(Math.random() * 1000);
        const hfinder = new Hfinder({
            location:  `${cities[random1000].city}, ${cities[random1000].state}`,
            title: `${sample(descriptors)} ${sample(places)}`
        })
        await hfinder.save();
    }
}
seedDB().then(() => {
    
    mongoose.connection.close()
});