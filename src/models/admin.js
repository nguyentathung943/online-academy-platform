const mongoose = require("mongoose")
const Users = require("./user")
const extendSchema = require("mongoose-extend-schema")
const AdminSchema = extendSchema(Users,{
    phoneNumber:{
        type:String,
        required: true,
    }
})
const Students = mongoose.model("Admin",AdminSchema)

module.exports = Students
