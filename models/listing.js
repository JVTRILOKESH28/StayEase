const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const listingSchema = new Schema({
  title: {
    type: String,
    required: true,
    maxlength: 1000
  },
  description: {
    type: String,
    required: true,
    maxlength: 5000
  },
  image: {
    filename: {
      type: String,
      default: "listingimage"
    },
    url: {
      type: String,
      // required: true
    }
  },
  price: {
    type: Number,
    required: true
  },
  location: {
    type: String
  },
  country: {
    type: String
  },
  contact: {
    type: String
  },
  review:[
    {
    type:Schema.Types.ObjectId,
    ref:"Review"
    }
  ],
  
});

module.exports = mongoose.model("Listing", listingSchema);
