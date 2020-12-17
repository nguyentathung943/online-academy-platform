require("./database/mongoose")
const express = require("express")
const passport = require("passport")
const UserRouter = require("./routers/UserRouter")
const CourseRouter = require("./routers/CourseRouter")
const TeacherRouter = require("./routers/TeacherRouter")
const AdminRouter = require("./routers/AdminRouter")
const app = express();
const path = require('path')
const bodyParser = require("body-parser")
const hbs = require("hbs");
const port = process.env.port || 3000;


const flash = require("express-flash")
const session  = require("express-session")

app.use(bodyParser.urlencoded({extended: true}))
const publicPath = path.join(__dirname, 'public') // link to css/img
const viewsPath = path.join(__dirname, 'templates/views') //link to views (HTML/HBS/ejs)
const PartialPath = path.join(__dirname, 'templates/partials')

app.set('views', viewsPath)
app.set('view engine', 'hbs')
app.use(express.json())

hbs.registerPartials(PartialPath)///Header and Footer register
app.use(express.static(publicPath))
app.use(express.json()) // every object automatically turn into JSON formatted

app.use(flash())
app.use(session({
    secret:"None",
    resave:false,
    saveUninitialized:false
}))
app.use(passport.initialize())
app.use(passport.session())

app.use(UserRouter) //user methods for admin
app.use(CourseRouter)
app.use(TeacherRouter)
app.use(AdminRouter)

app.listen(port, () => {
    console.log("Server is running on port 3000");
})