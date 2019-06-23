const mongoose = require('../src/database/mongodb');

before((done) => {
    mongoose.once('open', () => done());
});
