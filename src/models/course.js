const mongoose = require("mongoose")
const { virtual } = require("./user")

const CourseSchema = new mongoose.Schema({
    name:{
        type:String,
        required: true
    },
    category:{
        type:String,
        required: true
    },
    owner:{ // Only have one owner 
        type: mongoose.Schema.Types.ObjectId,
        ref:"Teachers"
    },
    score:{
        type: Number,
    },
})
//courses can be registered by many students                                           
CourseSchema.virtual('StudentsRegistered',{
    ref: 'Students', /// Name of Tasks mongoose
    localField: '_id',  //The course ID as the primary key
    foreignField: 'CoursesRegistered'
})

//courses can be liked by many students (watch list)
CourseSchema.virtual('StudentsLiked',{
    ref: 'Students', /// Name of Tasks mongoose
    localField: '_id',  //The course ID as the primary key
    foreignField: 'CoursesLiked'
})

//courses can be liked by many students (watch list)
CourseSchema.virtual('StudentRated',{
    ref: 'Reviews', /// Name of Tasks mongoose
    localField: '_id',  //The course ID as the primary key
    foreignField: 'course'
})


const Courses = mongoose.model("Courses",CourseSchema)
module.exports = Courses