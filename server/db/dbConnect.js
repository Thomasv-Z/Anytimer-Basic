const mongoose = require('mongoose');
const express = require('express');
require('dotenv').config()

const dbConnect = async () => {
    try {
      await mongoose.connect(process.env.MONGO_URL);
      console.log('Successfully connected to MongoDB Atlas!');
    } catch (error) {
      console.error('Unable to connect to MongoDB Atlas!', error);
    }
  };

module.exports = dbConnect;


const app = express();
