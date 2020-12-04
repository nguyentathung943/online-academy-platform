const mongoose = require("mongoose")
const Users = require("./user")
const extendSchema = require("mongoose-extend-schema")

const TeacherSchema = extendSchema(Users,{
    phoneNumber:{
        type: String,
        required: true,
        strim: true,
    },
})

TeacherSchema.virtual('CoursesOwned',{
    ref: 'Courses',
    localField: '_id', //The teacher ID as the primary key
    foreignField: 'owner'
})

const Students = mongoose.model("Teachers", TeacherSchema )
module.exports = Students