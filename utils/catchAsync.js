const catchAsync = function(async_func) {
    return (req, res, next) => {
        async_func(req, res, next).catch(next)
    }
}

module.exports = catchAsync;