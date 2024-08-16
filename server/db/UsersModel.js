const mongoose = require('mongoose');

// Define the schema
const userSchema = new mongoose.Schema({
  uid: {
    type: String,
    required: true
  },
  user: {
    type: String,
  }
});

// Create and export the model
module.exports = userSchema;