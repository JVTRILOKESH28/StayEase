
const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const Review = require("./review");

const listingSchema = new Schema({
  title: { type: String, required: true, maxlength: 1000 },
  description: { type: String, required: true, maxlength: 5000 },

  image: {
    filename: { type: String, default: "listingimage" },
    url: String
  },

  price: { type: Number, required: true },
  location: String,
  country: String,
  contact: String,

  
  reviews: [
    {
      type: Schema.Types.ObjectId,
      ref: "Review"
    }
  ]
});

listingSchema.post("findOneAndDelete", async function (doc) {
  if (doc) {
    await Review.deleteMany({ _id: { $in: doc.reviews } });
  }
});

module.exports = mongoose.model("Listing", listingSchema);