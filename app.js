const express = require('express');
const path = require('path');
const mongoose = require('mongoose');
const ejsMate = require('ejs-mate');
const {campgroundSchema} = require('./schemas');
const methodOverride = require('method-override');
const ExpressError = require('./utils/ExpressError');
const catchAsync = require('./utils/catchAsync')
const morgan = require('morgan');

const Campground = require('./models/campground');

mongoose.connect('mongodb://localhost:27017/yelp-camp', {
    useNewUrlParser: true,
    useUnifiedTopology: true
})

const db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', () => {
    console.log('Database connected');
})

const app = express();

app.engine('ejs', ejsMate);
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));
app.use(express.urlencoded({extended: true}));
app.use(methodOverride('_method'));
app.use(morgan('dev'));

const validateCampground = (req, res, next) => {
    const {error} = campgroundSchema.validate(req.body);
    // console.log(result);
    if (error) {
        message = error.details.map(d => d.message).join(',');
        throw new ExpressError(message, 400);
    } else {
        next();
    }
}

app.get('/', (req, res) => {
    res.render('home');
});

app.get('/campgrounds', catchAsync(async (req, res) => {
    const campgrounds = await Campground.find({});
    // console.log(campgrounds);
    res.render('./campgrounds/index', {campgrounds});
}));

app.get('/campgrounds/new', (req, res) => {
    res.render('./campgrounds/new');
});

app.post('/campgrounds', validateCampground, catchAsync(async (req, res, next) => {
        const {campground} = req.body;
        const newCampground = new Campground(campground);
        await newCampground.save();
        res.redirect(`/campgrounds/${newCampground._id}`);
}));

app.get('/campgrounds/:id', catchAsync(async (req, res) => {
    const {id} = req.params;
    const campground = await Campground.findById(id);
    // console.log(campground);
    res.render('./campgrounds/show', {campground});
}));

app.get('/campgrounds/:id/edit', catchAsync(async (req, res) => {
    const {id} = req.params;
    const campground = await Campground.findById(id);
    res.render('./campgrounds/edit', {campground});
}));

app.put('/campgrounds/:id', validateCampground, catchAsync(async (req, res) => {
    const {id} = req.params;
    const {campground} = req.body;
    const foundCampground = await Campground.findByIdAndUpdate(id, campground);
    res.redirect(`/campgrounds/${id}`);
}));

app.delete('/campgrounds/:id', catchAsync(async (req, res) => {
    const {id} = req.params;
    await Campground.findByIdAndDelete(id);
    res.redirect('/campgrounds');
}));

app.all('*', (req, res, next) => {
    next(new ExpressError('Page not found', 404));
})

app.use((err, req, res, next) => {
    console.dir(err);
    const {statusCode = 500} = err;
    if (!err.message) err.message = "Something Went Wrong"
    res.status(statusCode).render('error', {err});
})

app.listen(3000, () => {
    console.log('LISTENING ON PORT 3000');
});