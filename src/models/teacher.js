const mongoose = require("mongoose")
const Users = require("./user")
const extendSchema = require("mongoose-extend-schema")

const TeacherSchema = extendSchema(Users,{
    CouresOwned:[{
        type: mongoose.Schema.Types.ObjectId,
    }],
    Coures:[{
        type: mongoose.Schema.Types.ObjectId,
    }]
})

TeacherSchema.virtual('CoursesOwned',{
    ref: 'Students', /// Name of Tasks mongoose
    localField: '_id', //The teacher ID as the primary key
    foreignField: 'owner'
})

const Students = mongoose.model("Teachers", TeacherSchema )
module.exports = Students