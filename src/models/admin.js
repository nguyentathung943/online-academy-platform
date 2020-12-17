const mongoose = require("mongoose")
const Users = require("./user")
const extendSchema = require("mongoose-extend-schema")
const AdminSchema = extendSchema(Users,{
    role:{
        type:String,
        default: "Administrator",
        required: true
    },
    phoneNumber:{
        type:String,
        required: true,
    }
})
const Admin = mongoose.model("Admin",AdminSchema)

module.exports = Admin
