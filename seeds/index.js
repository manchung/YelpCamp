const mongoose = require('mongoose');
const Campground = require('../models/campground');
const cities = require('./cities');
const { places, descriptors } = require('./seedHelpers');

mongoose.connect('mongodb://localhost:27017/yelp-camp', {
    useNewUrlParser: true,
    useUnifiedTopology: true
})

const db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', () => {
    console.log('Database connected');
})

const sample = array => array[Math.floor(Math.random() * array.length)];

const seedDB = async () => {
    await Campground.deleteMany({});
    for (let i = 0; i < 50; i++) {
        const random1000 = Math.floor(Math.random() * 1000);
        const price = Math.floor(Math.random() * 20) + 10;
        const camp = new Campground({
            author: '656adf78029f1b9268f75918',
            location: `${cities[random1000].city}, ${cities[random1000].state}`,
            title: `${sample(descriptors)} ${sample(places)}`,
            description: 'Lorem ipsum dolor sit amet consectetur, adipisicing elit. Sequi fugit hic ipsum repudiandae similique quasi voluptatibus non minima accusantium, exercitationem corporis est veritatis labore, maiores voluptatem assumenda harum iste excepturi.',
            price: price,
            images: [
                {
                    url: 'https://res.cloudinary.com/dpbftsmwz/image/upload/v1701497478/YelpCamp/a4ena3utmmehjh6ll7iq.jpg',
                    filename: 'YelpCamp/a4ena3utmmehjh6ll7iq',
                },
                {
                    url: 'https://res.cloudinary.com/dpbftsmwz/image/upload/v1701497479/YelpCamp/twgryfnslvlv1ysbwebw.jpg',
                    filename: 'YelpCamp/twgryfnslvlv1ysbwebw',
                }
            ]
        })
        await camp.save();
    }
}

seedDB().then(() => {
    db.close()
})