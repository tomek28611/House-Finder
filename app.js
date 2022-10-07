if (process.env.NODE_ENV !== 'production') {
    require('dotenv').config();
}
const express = require('express');
const path = require('path');
const Hfinder = require('./models/hfinder');
const mongoose = require('mongoose');
const ejsMate = require('ejs-mate');
const session = require('express-session');
const { hfinderSchema, reviewSchema } = require('./schemas.js')
const methodOverride = require('method-override');
const catchAsync = require('./helpers/catchAsync');
const ExpressError = require('./helpers/ExpressError');
const Review = require('./models/review');
const passport = require('passport');
const LocalStrategy = require('passport-local');
const User = require('./models/user');
const { remove } = require('./models/user');
const flash = require('connect-flash');
const userRoutes = require('./routes/users');
const {isLoggedIn} = require('./middleware');
const multer = require('multer');
const { storage } = require('./cloudinary/index');
const upload = multer({ storage });


const imageStorage = multer.diskStorage({
   
    destination: 'images', 
      filename: (req, file, cb) => {
          cb(null, file.fieldname + '_' + Date.now() 
             + path.extname(file.originalname))
 
    }
});


const imageUpload = multer({
    storage: storage,
    limits: {
      fileSize: 1000000 // 1000000 Bytes = 1 MB
    },
    fileFilter(req, file, cb) {
      if (!file.originalname.match(/\.(png|jpg)$/)) { 
         return cb(new Error('Please upload a Image'))
       }
     cb(undefined, true)
  }
});



var mongo = require('mongodb');
const router = express.Router();


mongoose.connect('mongodb://localhost:27017/House-Finder', {
});

const db = mongoose.connection;
db.on("error", console.error.bind(console, "connection error:"));
db.once("open", () => {
    console.log("DB connected");
});

const sessionConfig = {
    secret: 'secret!',
    resave: false,
    saveUninitialized: true,
    cookie: {
        httpOnly: true,
        expires: Date.now() + 1000 * 24 * 60 * 60 * 24 * 30,
        maxAge: 1000 * 60 * 60 * 24 * 30
    }
}

const app = express();
app.use(session(sessionConfig));
app.use(flash());

app.use(passport.initialize());
app.use(passport.session());
passport.use(new LocalStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser()); 

app.use((req, res, next) => {
    res.locals.loggedUser = req.user;
    res.locals.success = req.flash('success');
    res.locals.error = req.flash('error');
    next();
});


app.engine('ejs', ejsMate)
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

app.use('/', userRoutes);
app.use(express.urlencoded({ extended: true }));
app.use(methodOverride('_method'));
app.use(express.static('public'));

  

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
});

app.get('/register', (req, res) => {
    res.render('users/register');
})

app.post('/register', catchAsync(async(req, res) => {
    try{
        const { email, username, password } = req.body;
        const user = new User ({ email, username });
        const registeredUser = await User.register(user, password);
        req.flash('success', 'Welcome', username, ', now You can login');
        res.redirect('/home-finder');
    } catch(e) {
        req.flash('error', e.message);
        res.redirect('register');
    }
}));

app.get('/login', (req, res) => {
    res.render('users/login');
})

app.post('/login', passport.authenticate('local', {faliureFlash: true, faliureRedirect: '/login'}), (req, res) => {
    req.flash('success', 'Welcome back!');
    res.redirect('/home-finder');
})


app.get('/logout', function(req, res, next) {
    req.logout(function(err) {
      if (err) { 
        return next(err); 
        }
        req.flash('success', 'Log out!');
      res.redirect('/');
    });
  });


app.get('/home-finder', catchAsync(async(req, res, ) => {
    const hfinders = await Hfinder.find({});
    res.render('hfinder/index', { hfinders })

}));

app.get('/home-finder/new', isLoggedIn, (req, res) => {
    res.render('hfinder/new');
});
app.post('/home-finder', imageUpload.single('image'), (async (req, res, next) => {
    const hfinder = new Hfinder(req.body.hfinder);
    hfinder.image = req.file.path;
    hfinder.author = req.user._id;
    await hfinder.save();
    console.log(req.file);
    req.flash('success', 'Succesfully make a new HOUSE')
    res.redirect(`/home-finder/${hfinder._id}`)
}));


app.get('/home-finder/:id', catchAsync(async (req, res) => {
const hfinder = await Hfinder.findById(req.params.id).populate('reviews').populate('author');
res.render('hfinder/show', { hfinder });

}));

app.get('/home-finder/:id/edit', isLoggedIn, catchAsync(async (req, res) => {
const hfinder = await Hfinder.findById(req.params.id)
res.render('hfinder/edit', { hfinder });
}));

app.put('/home-finder/:id', isLoggedIn, validateHfinder, catchAsync(async (req, res) => {
const { id } = req.params;
const hfinder = await Hfinder.findById(id);
if (!hfinder.author.equals(req.user._id)) {
    req.flash('error','You dont have permission');
    return res.redirect('/home-finder');
} 
const hfind = await Hfinder.findByIdAndUpdate(id, {...req.body.hfinder});
req.flash('success', 'Succesfully Updated')
res.redirect(`/home-finder/${hfinder._id}`)
}));

app.delete('/home-finder/:id', isLoggedIn, catchAsync(async (req, res) => {
const { id } = req.params;
const hfinder = await Hfinder.findById(id);
if (!hfinder.author.equals(req.user._id)) {
    req.flash('error','You dont have permission');
    return res.redirect('/home-finder');
}
await Hfinder.findByIdAndDelete(id);
req.flash('success', 'Succesfully deleted ')
res.redirect('/home-finder/');
}));

app.post('/home-finder/:id/reviews', isLoggedIn, catchAsync(async (req, res) => {
    const hfinder = await Hfinder.findById(req.params.id);
    const review = new Review(req.body.review);
    // review.author = req.user._id;
    hfinder.reviews.push(review);
    await review.save();
    await hfinder.save();
    req.flash('success', 'Succesfully created a new review')
    res.redirect(`/home-finder/${hfinder._id}`)
}))

app.delete('/home-finder/:id/reviews/:reviewId', isLoggedIn, catchAsync(async (req, res) => {
    const { id, reviewId } = req.params;
    await Hfinder.findByIdAndUpdate(id, { $pull: { reviews: reviewId }});
    await Review.findByIdAndDelete(reviewId);
    req.flash('success', 'Succesfully deleted a new review')
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