const Students = require("../models/student")
const Teachers = require("../models/teacher")
const Admin = require("../models/admin")
const Courses = require("../models/course")
const Reviews = require("../models/review")
//GET COURSE OWNER
const getCourseLecturer = async(CourseID)=> {
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
//REGISTER A CLASS (STUDENT)
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
const getStudentsRegistered = async(CourseID)=>{
    const course = await Courses.findById(CourseID)
    await course.populate('StudentsRegistered').execPopulate()
    return course.StudentsRegistered
}
//SHOW COURSES' REGISTERED (STUDENT)
const getCoursesRegistered = async(StudentID)=>{
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
            throw Error("Course is already existed in your watchlist")
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
const RemoveCourseFromWatchList = async(StudentID, CourseID)=>{
    const student = await Students.findById(StudentID);
    await student.populate("CoursesLiked").execPopulate();
    student.CoursesLiked = student.CoursesLiked.toObject().filter(course => {
        return course.id!=CourseID
    });
    await student.save()
}

//////////// REVIEW
const getStudentReview = async(ReviewID) =>{
    const review = await Reviews.findById(ReviewID)
    await review.populate("owner").execPopulate()
    return review.toObject()
}
const UpdateRated = async(CourseID)=>{
    const course = await Courses.findById(CourseID)
    var rate = 0
    await course.populate('ReviewList').execPopulate()
    course.ReviewList.forEach(element => {
        rate = (rate + element.Star)/course.ReviewList.length
    });
    course.score = rate.toFixed(1)
    await course.save()
}
const AddCourseReview = async (text, star,StudentID,CourseID)=> {
    try{
        const check = await Reviews.findOne({owner: StudentID, course: CourseID})
        if(check){
            throw new Error("Student already reviewed this course")
        }
        const review =  new Reviews({
            comment: text,
            Star: star,
            course: CourseID,
            owner: StudentID
        })
        const course = await Courses.findById(CourseID)
        await course.populate('ReviewList').execPopulate()
        course.ReviewList.concat(review.id)
        UpdateRated(course.id)
        await review.save()
        await course.save()
    }
    catch(e){
        console.log(e)
    }

}
const ShowReviewList = async (CourseID)=> {
    const course = await Courses.findById(CourseID)
    await course.populate("ReviewList").execPopulate()
    const list = course.ReviewList
    return list
}

module.exports = {
    getCourseLecturer,
    getCoursesOwned,
    getStudentsRegistered ,
    registerCourse,
    getCoursesRegistered,
    addtCourseToWatchList,
    ShowWatchList,
    RemoveCourseFromWatchList,
    AddCourseReview,
    ShowReviewList,
    getStudentReview,
}