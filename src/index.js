require("./database/mongoose")
const express = require("express")

const UserRouter = require("./routers/UserRouter")
const CourseRouter =  require("./routers/CourseRouter")
const TeacherRouter = require("./routers/TeacherRouter")
const app = express();

const bodyParser = require("body-parser")
app.use(bodyParser.urlencoded({ extended: true }))

const port = process.env.port || 3000;

app.use(express.json())


app.use(UserRouter) //user methods for admin
app.use(CourseRouter)
app.use(TeacherRouter)

app.listen(port,()=>{
    console.log("Server is running on port 3000");
})