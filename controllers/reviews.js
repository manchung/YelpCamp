const Campground = require('../models/campground');
const Review = require('../models/review');


module.exports.createReview = async (req, res) => {
    const { id } = req.params;
    const campground = await Campground.findById(id);
    const review = new Review(req.body.review);
    review.author = req.user._id;
    campground.reviews.push(review);
    // console.log(review);
    await review.save();
    await campground.save();
    req.flash('success', 'Created new review!');
    res.redirect(`/campgrounds/${id}`);
};

module.exports.deleteReview = async (req, res) => {
    const { id, review_id } = req.params;
    await Campground.findByIdAndUpdate(id, { $pull: { reviews: review_id } });
    await Review.findByIdAndDelete(review_id);
    req.flash('success', 'Successfully deleted review');
    res.redirect(`/campgrounds/${id}`);
};

