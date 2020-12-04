const Students = require("../models/student")
const Teachers = require("../models/teacher")
const Admin = require("../models/admin")
const Courses = require("../models/course")

//GET COURSE OWNER
const getCourseOwner = async(CourseID)=> {
    const course = await Courses.findById(CourseID)
    await course.populate('owner').execPopulate()
    return course.owner
}

//GET TEACHER'S COURSES (TEACHER)
const getCoursesOwned =  async(TeacherID)=>{
    const teacher = await Teachers.findById(TeacherID)
    await teacher.populate('CoursesOwned').execPopulate()
    return teacher.CoursesOwned
}
///////////////////////REGISTER
//REGISTER A CLASS FOR STUDENT (STUDENT)
const registerCourse = async(StudentID, CourseID) =>{
    try{
        const student = await Students.findById(StudentID)
        const course = await Courses.findById(CourseID)
        await course.populate('StudentsRegistered').execPopulate()
        if(course.StudentsRegistered.includes(student.id) || student.CoursesRegistered.includes(course.id)){
            throw Error("Course already existed in your inventory")
        }
        else{
            student.CoursesRegistered = student.CoursesRegistered.concat(course.id)
            course.StudentsRegistered = course.StudentsRegistered.concat(student.id)
            await student.save()
            await course.save()
        }
    }
    catch(e){
        console.log(e)
    }
}
//GET STUDENTS' REGISTERED (ADMIN)
const getStudentsRegis = async(CourseID)=>{
    const course = await Courses.findById(CourseID)
    await course.populate('StudentsRegistered').execPopulate()
    return course.StudentsRegistered
}
//SHOW COURSES' REGISTERED (STUDENT)
const getCoursesRegis = async(StudentID)=>{
    const student = await Students.findById(StudentID)
    await student.populate('CoursesRegistered').execPopulate()
    return student.CoursesRegistered.toObject()
}

////////////////////WATCH LIST
//ADD COURSE TO WATCHLIST (STUDENT)
const addtCourseToWatchList =async(StudentID, CourseID)=>{
    try{
        const student = await Students.findById(StudentID)
        const course = await Courses.findById(CourseID)
        await course.populate('StudentsLiked').execPopulate()
        if(course.StudentsLiked.includes(student.id) || student.CoursesLiked.includes(course.id)){
            throw Error("Course is already added to your watchlist")
        }
        else{
            student.CoursesLiked = student.CoursesLiked.concat(course.id)
            course.StudentsLiked = course.StudentsLiked.concat(student.id)
            await student.save()
            await course.save()
        }
    }
    catch(e){
        console.log(e)
    }
}
///SHOW COURSES IN WATCH LIST
const ShowWatchList =async(StudentID)=>{
    const student = await Students.findById(StudentID)
    await student.populate("CoursesLiked").execPopulate()
    return student.CoursesLiked.toObject()
}

module.exports = {
    getCourseOwner,
    getCoursesOwned,
    getStudentsRegis,
    registerCourse,
    getCoursesRegis,
    addtCourseToWatchList,
    ShowWatchList
}