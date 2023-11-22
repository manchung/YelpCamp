module.exports.isLoggedIn = (req, res, next) => {
    if (!req.isAuthenticated()) {
        req.session.returnTo = req.originalUrl;
        req.flash('error', 'You must be signed in first!');
        return res.redirect('/login');
    } else {
        return next();
    }
}

module.exports.storeReturnTo = (req, res, next) => {
    // console.log(`req.session.returnTo: ${req.session.returnTo}`)
    res.locals.returnTo = req.session.returnTo;
    next();
}
