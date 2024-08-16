const mongoose = require('mongoose');

// Define schema
const DataSchema = new mongoose.Schema({
  uid: {
    type: String,
    required: true
  },
  time: {
    type: String,
    required: true
  },
  date: {
    type: Date,
    default: Date.now
  },
  user: {
    type: String,
  }
});

module.exports = DataSchema;
