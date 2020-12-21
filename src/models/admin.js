const mongoose = require("mongoose")
const Users = require("./user")
const extendSchema = require("mongoose-extend-schema")
const bcrypt = require("bcrypt")
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
AdminSchema.pre("save",async function  (next){
    const admin = this
    admin.password = await bcrypt.hash(admin.password,8)
    next()
})
const Admin = mongoose.model("Admin",AdminSchema)

module.exports = Admin
