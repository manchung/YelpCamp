const Campground = require('../models/campground');
const { cloudinary } = require('../cloudinary');
const MapboxGeocoding = require('@mapbox/mapbox-sdk/services/geocoding');
const mapboxToken = process.env.MAPBOX_TOKEN;
const geocoder = MapboxGeocoding({ accessToken: mapboxToken });

module.exports.index = async (req, res) => {
    const campgrounds = await Campground.find({});
    res.render('./campgrounds/index', { campgrounds });
};

module.exports.renderNewForm = (req, res) => {
    res.render('./campgrounds/new');
};

module.exports.createCampground = async (req, res, next) => {
    const { campground } = req.body;
    const geoData = await geocoder.forwardGeocode({
        query: campground.location,
        limit: 1
    }).send();

    campground.images = req.files.map(f => ({ url: f.path, filename: f.filename }));
    campground.geometry = geoData.body.features[0].geometry;
    const newCampground = new Campground(campground);
    newCampground.author = req.user._id;
    await newCampground.save();
    req.flash('success', 'Successfully made a new campground!');
    res.redirect(`/campgrounds/${newCampground._id}`);
};

module.exports.showCampground = async (req, res) => {
    const { id } = req.params;
    // console.log(id)
    let campground = undefined;
    try {
        campground = await Campground.findById(id).populate({
            path: 'reviews',
            populate: {
                path: 'author'
            }
        }).populate('author');
        // console.log(campground);
    } catch (e) {
        req.flash('error', 'Cannot find that campground!');
        return res.redirect('/campgrounds');
    }
    res.render('./campgrounds/show', { campground });
};

module.exports.renderEditForm = async (req, res) => {
    const { id } = req.params;
    let campground = undefined;
    try {
        campground = await Campground.findById(id);
    } catch (e) {
        req.flash('error', 'Cannot find that campground!');
        return res.redirect('/campgrounds');
    }
    // console.log(campground)
    res.render('./campgrounds/edit', { campground });
};

module.exports.updateCampground = async (req, res) => {
    const { id } = req.params;
    const { campground } = req.body;
    // console.log(req.body);
    // campground.author = req.user._id;
    const foundCampground = await Campground.findByIdAndUpdate(id, campground);
    images = req.files.map(f => ({ url: f.path, filename: f.filename }));
    foundCampground.images.push(...images);
    await foundCampground.save()
    if (req.body.deleteImages) {
        for (let filename of req.body.deleteImages) {
            cloudinary.uploader.destroy(filename);
        }
        await foundCampground.updateOne({ $pull: { images: { filename: { $in: req.body.deleteImages } } } })
    }

    req.flash('success', 'Successfully updated campground!');
    res.redirect(`/campgrounds/${id}`);
};

module.exports.deleteCampground = async (req, res) => {
    const { id } = req.params;
    await Campground.findByIdAndDelete(id);
    req.flash('success', 'Successfully deleted campground');
    res.redirect('/campgrounds');
};



