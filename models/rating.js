const mongoose = require("mongoose");

const ratingSchema = mongoose.Schema({
  userId: {
    required: true,
    type: String,
  },
  rating: {
    required: true,
    type: Number,
  },
});

module.exports = ratingSchema;
