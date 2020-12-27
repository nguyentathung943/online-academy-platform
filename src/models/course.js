const mongoose = require("mongoose")
const {virtual} = require("./user")

const CourseSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    category: {
        type: String,
        required: true
    },
    brief_description: {
        type: String,
        require: true
    },
    full_description: {
        type: String,
        require: true
    },
    owner: { // Only have one owner
        type: mongoose.Schema.Types.ObjectId,
        ref: "Teachers"
    },
    score: {
        type: Number,
        default: 0
    },
    completed: {
        type: Boolean,
        default: false
    },
    number_of_reviewer: {
        type: Number,
        default: 0
    },
    number_of_student: {
        type: Number,
        default: 0
    },
    price: {
        type: Number,
        required: true
    }
},{
    timestamps: true
})
CourseSchema.index({
    name: 'text',
    full_description:'text',
    category:'text'
})
//courses can be registered by many students
CourseSchema.virtual('StudentsRegistered', {
    ref: 'Students',
    localField: '_id',  //The course ID as the primary key
    foreignField: 'CoursesRegistered'
})

//courses can be liked by many students (watch list)
CourseSchema.virtual('StudentsLiked', {
    ref: 'Students',
    localField: '_id',  //The course ID as the primary key
    foreignField: 'CoursesLiked'
})
CourseSchema.virtual('ReviewList', {
    ref: "Reviews",
    localField: '_id',  //The course ID as the primary key
    foreignField: 'course'
})

/// CHAPTER LIST
CourseSchema.virtual('ChapterList', {
    ref: "Chapters",
    localField: '_id',  //The course ID as the primary key
    foreignField: 'course'
})
const Courses = mongoose.model("Courses", CourseSchema)
module.exports = Courses