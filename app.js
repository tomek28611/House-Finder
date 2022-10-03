const express = require('express');
const path = require('path');
const Hfinder = require('./models/hfinder');
const mongoose = require('mongoose');
const methodOverride = require('method-override');
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

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

app.use(express.urlencoded({ extended: true }));
app.use(methodOverride('_method'));

app.get('/', (req, res) => {
    res.render('home')
})

app.get('/home-finder', async(req, res,) => {
   const hfinders = await Hfinder.find({});
   res.render('hfinder/index', { hfinders })
})

app.get('/home-finder/new', (req, res) => {
    res.render('hfinder/new');
})

app.post('/home-finder', async (req, res) => {
    const hfinder = new Hfinder(req.body.hfinder);
    await hfinder.save();
    res.redirect(`/home-finder/${hfinder._id}`)
  
})


app.get('/home-finder/:id', async (req, res) => {
    const hfinder = await Hfinder.findById(req.params.id)
    res.render('hfinder/show', { hfinder });

})

app.get('/home-finder/:id/edit', async (req, res) => {
    const hfinder = await Hfinder.findById(req.params.id)
    res.render('hfinder/edit', { hfinder });
})

app.put('/home-finder/:id', async (req, res) => {
    const { id } = req.params;
    const hfinder = await Hfinder.findByIdAndUpdate(id, {...req.body.hfinder});
    res.redirect(`/home-finder/${hfinder._id}`)
})

app.delete('/home-finder/:id', async (req, res) => {
    const { id } = req.params;
    await Hfinder.findByIdAndDelete(id);
    res.redirect('/home-finder/');
})


app.listen(3000, () => {
    console.log('port 3000');
})