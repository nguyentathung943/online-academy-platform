const mongoose = require("mongoose")
const Users = require("./user")
const extendSchema = require("mongoose-extend-schema")
const StudentSchema = extendSchema(Users,{
    phoneNumber:{
        type: String,
        required: true,
        strim: true,
    },
    //Student can have many many students registered
    CoursesRegistered:[{
        type: mongoose.Schema.Types.ObjectId,
        ref:"Courses"
    }],
    //Student can have many many students liked (watch list)
    CoursesLiked:[{
        type: mongoose.Schema.Types.ObjectId,
        ref:"Courses"
    }],
})
StudentSchema.virtual("CoursesRated",{
    ref:"Reviews",
    localField:"_id",
    foreignField:"owner",
})

const Students = mongoose.model("Students",StudentSchema)
module.exports = Students