const { string, date } = require("joi");
const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const reviewSchema = new Schema({
    comment:string,
    rating:{
        typeof:Number,
        min:1,
        max:5
    },
    CreatedAt:{
        type:Date,
        default:Date.now
    }
});

module.exports = mongoose.model("Review", reviewSchema);
