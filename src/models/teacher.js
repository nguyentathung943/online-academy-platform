const mongoose = require("mongoose")
const Users = require("./user")
const extendSchema = require("mongoose-extend-schema")
const bcrypt = require("bcrypt")
const TeacherSchema = extendSchema(Users,{
    role:{
        type:String,
        default: "Teacher",
        required: true
    },
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
TeacherSchema.pre("save",async function  (next){
    const teacher = this
    teacher.password = await bcrypt.hash(teacher.password,8)
    next()
})
const Students = mongoose.model("Teachers", TeacherSchema )
module.exports = Students