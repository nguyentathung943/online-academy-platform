const { MaxKey } = require("mongodb")
const mongoose = require("mongoose")

const ReviewSchema = new mongoose.Schema({
    comment:{
        type:String,
        required: true
    },
    Star:{
        type: Number,
        required:true,
        min:1,
        max:5,
    },
    course:{
        type: mongoose.Schema.Types.ObjectId,
        ref:"Courses"
    },
    owner:{
        type: mongoose.Schema.Types.ObjectId,
        ref:"Students"
    }
})
const Review = mongoose.model("Reviews",ReviewSchema)

module.exports = Review