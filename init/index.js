const mongoose = require("mongoose");
const initdata = require("./data");
const Listing = require("../models/listing");

async function main() {
  await mongoose.connect("mongodb://localhost:27017/StayEase");
  console.log("MongoDB connected");
}

async function createListing() {
  await Listing.deleteMany({});
  await Listing.insertMany(initdata.data);
  console.log("Data inserted");
}

main()
  .then(createListing)
  .catch(err => console.log(err));
