const mongoose = require("mongoose")

const CateSchema = new mongoose.Schema({
    name:{
        type:String,
        required: true
    }
})
const MainCategory = mongoose.model("MCategories",CateSchema)

module.exports = MainCategory