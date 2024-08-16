const mongoose = require('mongoose');

// Define the schema
const userSchema = new mongoose.Schema({
  uid: {
    type: String,
    required: true,
  },
  name: {
    type: String,
  },
});

module.exports = userSchema;