const express = require('express');
const path = require('path');
const Hfinder = require('./models/hfinder');
const mongoose = require('mongoose');
const ejsMate = require('ejs-mate')
const { hfinderSchema, reviewSchema } = require('./schemas.js')
const methodOverride = require('method-override');
const catchAsync = require('./helpers/catchAsync');
const ExpressError = require('./helpers/ExpressError');
const Review = require('./models/review');

var mongo = require('mongodb');
const router = express.Router()
module.exports = router;

mongoose.connect('mongodb://localhost:27017/House-Finder', {
});

const db = mongoose.connection;
db.on("error", console.error.bind(console, "connection error:"));
db.once("open", () => {
    console.log("DB connected");
});

const app = express();

app.engine('ejs', ejsMate)
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

app.use(express.urlencoded({ extended: true }));
app.use(methodOverride('_method'));

const validateHfinder = (req, res, next) => {
    const { error } = hfinderSchema.validate(req.body);
    if(error) {
        const msg = error.details.map(el => el.message).join(',')
        throw new ExpressError(msg, 400)
    } else {
        next();
    }
 }

 const vilidateReview = (req, res, next) => {
    const { error } = reviewSchema.valid(req.body);
    if(error) {
        const msg = error.details.map(el => el.message).join(',')
        throw new ExpressError(msg, 400)
    } else {
        next();
    }
 }

app.get('/', (req, res) => {
    res.render('home')
})

app.get('/home-finder', catchAsync(async(req, res, ) => {
        const hfinders = await Hfinder.find({});
        res.render('hfinder/index', { hfinders })

}))

app.get('/home-finder/new', (req, res) => {
    res.render('hfinder/new');
})

app.post('/home-finder', validateHfinder,catchAsync(async (req, res, next) => {
        const hfinder = new Hfinder(req.body.hfinder);
        await hfinder.save();
        res.redirect(`/home-finder/${hfinder._id}`)

}))


app.get('/home-finder/:id', catchAsync(async (req, res) => {
    const hfinder = await Hfinder.findById(req.params.id).populate('reviews');
    res.render('hfinder/show', { hfinder });

}))

app.get('/home-finder/:id/edit', catchAsync(async (req, res) => {
    const hfinder = await Hfinder.findById(req.params.id)
    res.render('hfinder/edit', { hfinder });
}))

app.put('/home-finder/:id', validateHfinder, catchAsync(async (req, res) => {
    const { id } = req.params;
    const hfinder = await Hfinder.findByIdAndUpdate(id, {...req.body.hfinder});
    res.redirect(`/home-finder/${hfinder._id}`)
}))

app.delete('/home-finder/:id', catchAsync(async (req, res) => {
    const { id } = req.params;
    await Hfinder.findByIdAndDelete(id);
    res.redirect('/home-finder/');
}))

app.post('/home-finder/:id/reviews', catchAsync(async (req, res) => {
    const hfinder = await Hfinder.findById(req.params.id);
    const review = new Review(req.body.review);
    hfinder.reviews.push(review);
    await review.save();
    await hfinder.save();
    res.redirect(`/home-finder/${hfinder._id}`)
}))

app.delete('/home-finder/:id/reviews/:reviewId', catchAsync(async (req, res) => {
    const { id, reviewId } = req.params;
    await Hfinder.findByIdAndUpdate(id, { $pull: { reviews: reviewId }});
    await Review.findByIdAndDelete(reviewId);
    res.redirect(`/home-finder/${id}`);
}))

app.all('*', (req, res, next) => {
    next(new ExpressError('Page Not Found', 404))
})

app.use((err, req, res, next) => {
    const { statusCode = 500 } = err;
    if(!err.message) err.message = 'Something went wrong!'
    res.status(statusCode).render('error', { err })
})

app.listen(3000, () => {
    console.log('port 3000');
})