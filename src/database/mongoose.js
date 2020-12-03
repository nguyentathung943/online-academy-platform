const mongoose = require('mongoose')
const {MongoClient} = require('mongodb');
const url = "mongodb+srv://admin-hung:123asd@cluster0.ufuaj.mongodb.net/web_course_online"
mongoose.connect(url, {
    useNewUrlParser: true,
    useCreateIndex:true, //work together
    useFindAndModify:false, // turn off warning
    useUnifiedTopology: true
})


