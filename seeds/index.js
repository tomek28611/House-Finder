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
    for(let i = 0; i < 5; i++ ) {
        const random1000 = Math.floor(Math.random() * 1000);
        const hfinder = new Hfinder({
            author: '633d5a31ddf1bf148dc606d0',
            location:  `${cities[random1000].city}, ${cities[random1000].state}`,
            title: `${sample(descriptors)} ${sample(places)}`,
            description: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum',
            price: '1000',
            image: 'https://cdn.galleries.smcloud.net/t/galleries/gf-VtBa-5eY1-EKTU_projekt-domu-malutki-dr-s-664x442-nocrop.jpg',
            geometry: {
                type: "Point",
                coordinates: [2.177432, 41.382894]
            }

        })
        await hfinder.save();
    }
}
seedDB().then(() => {
    
    mongoose.connection.close()
});