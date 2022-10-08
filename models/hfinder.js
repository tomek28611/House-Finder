const mongoose = require('mongoose');
const Review = require('./review')
const Schema = mongoose.Schema;

const opts = { toJSON: { virtuals: true } };

const HfinderSchema = new Schema({
    title: String, 
    geometry: {
        type: {
            type: String,
            enum: ['Point'],
            required: true
        },
        coordinates: {
            type: [Number],
            required: true
        }
    },
    price: Number, 
    image: String,
    description: String,
    location: String,
    author: {
        type: Schema.Types.ObjectId,
        ref: 'User'
    },
    reviews: [
        {
            type: Schema.Types.ObjectId,
            ref: 'Review'
        }
    ]
  
}, opts); 


HfinderSchema.virtual('properties.popUpMarkup').get(function () {
    return `<a href="/home-finder/${this._id}">${this.title}</a>
    <strong><p>${this.price}</p></strong>
    <p>${this.description.substring(0, 20)}...</p>`;
    
})


HfinderSchema.post('findOneAndDelete', async function (doc) {
    if(doc) {
        await Review.remove({
            _id: {
                $in: doc.reviews
            }
        })
    }
})


module.exports = mongoose.model('Hfinder', HfinderSchema);
