const mongoose = require('../database/mongodb');
const Schema = mongoose.Schema;

const SatoshiSchema = new Schema ({
    
})

const Satoshi = mongoose.model('satoshi',SatoshiSchema);
module.exports = Satoshi;
