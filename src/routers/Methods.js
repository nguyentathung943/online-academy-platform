const Students = require("../models/student")
const Teachers = require("../models/teacher")
const Admin = require("../models/admin")
const Courses = require("../models/course")
const Reviews = require("../models/review")
const {Chapters, Videos} = require("../models/chapter")
//GET COURSE OWNER
const getCourseLecturer = async (CourseID) => {
    const course = await Courses.findById(CourseID)
    await course.populate("owner").execPopulate()
    return course.owner
}

//GET TEACHER'S COURSES (TEACHER)
const getCoursesOwned = async (TeacherID) => {
    const teacher = await Teachers.findById(TeacherID)
    await teacher.populate('CoursesOwned').execPopulate()
    return teacher.CoursesOwned
}
///////////////////////REGISTER
//REGISTER A CLASS (STUDENT)
const registerCourse = async (StudentID, CourseID) => {
    try {
        const student = await Students.findById(StudentID)
        const course = await Courses.findById(CourseID)
        await course.populate('StudentsRegistered').execPopulate()
        if (course.StudentsRegistered.includes(student.id) || student.CoursesRegistered.includes(course.id)) {
            throw Error("Course already existed in your inventory")
        } else {
            student.CoursesRegistered = student.CoursesRegistered.concat(course.id)
            course.StudentsRegistered = course.StudentsRegistered.concat(student.id)
            course.number_of_student = course.number_of_student + 1
            await student.save()
            await course.save()
        }
    } catch (e) {
        console.log(e)
    }
}

//GET STUDENTS' REGISTERED (ADMIN)
const getStudentsRegistered = async (CourseID) => {
    const course = await Courses.findById(CourseID)
    await course.populate('StudentsRegistered').execPopulate()
    return course.StudentsRegistered
}
//SHOW COURSES' REGISTERED (STUDENT)
const getCoursesRegistered = async (StudentID) => {
    const student = await Students.findById(StudentID)
    await student.populate('CoursesRegistered').execPopulate()
    return student.CoursesRegistered.toObject()
}
//SHOW COURSES' REGISTERED (STUDENT)
const UnregisteredCourse = async (StudentID, CourseID) => {
    const course = await Courses.findById(CourseID)
    await course.populate('StudentsRegistered').execPopulate()
    const index = course.StudentsRegistered.indexOf(StudentID)
    course.StudentsRegistered.splice(index, 1)
    course.number_of_student = number_of_student - 1
    const Student = await Students.findById(StudentID)
    const index1 = Student.CoursesRegistered.indexOf(CourseID)
    Student.CoursesRegistered.splice(index1, 1)

    await course.save()
    await Student.save()
}
////////////////////WATCH LIST
//ADD COURSE TO WATCHLIST (STUDENT)
const addtCourseToWatchList = async (StudentID, CourseID) => {
    try {
        const student = await Students.findById(StudentID)
        const course = await Courses.findById(CourseID)
        await course.populate('StudentsLiked').execPopulate()
        if (course.StudentsLiked.includes(student.id) || student.CoursesLiked.includes(course.id)) {
            throw Error("Course is already existed in your watchlist")
        } else {
            student.CoursesLiked = student.CoursesLiked.concat(course.id)
            course.StudentsLiked = course.StudentsLiked.concat(student.id)
            await student.save()
            await course.save()
        }
    } catch (e) {
        console.log(e)
    }
}
///SHOW COURSES IN WATCH LIST
const ShowWatchList = async (StudentID) => {
    const student = await Students.findById(StudentID)
    await student.populate("CoursesLiked").execPopulate()
    return student.CoursesLiked.toObject()
}
const RemoveCourseFromWatchList = async (StudentID, CourseID) => {
    const student = await Students.findById(StudentID);
    await student.populate("CoursesLiked").execPopulate();
    student.CoursesLiked = student.CoursesLiked.toObject().filter(course => {
        return course.id != CourseID
    });
    await student.save()
    const course = await Courses.findById(CourseID)
    await course.populate('StudentsLiked').execPopulate()
    const index = course.StudentsLiked.indexOf(StudentID)
    course.StudentsRegistered.splice(index, 1)
    await course.save()
}

//////////// REVIEW
const getStudentSpecs = async (ReviewID) => {
    const review = await Reviews.findById(ReviewID)
    await review.populate("owner").execPopulate()
    return review
}
const UpdateRated = async (CourseID) => {
    const course = await Courses.findById(CourseID)
    var rate = 0
    await course.populate('ReviewList').execPopulate()
    course.ReviewList.forEach(element => {
        rate = (rate + element.Star) / course.ReviewList.length
    });
    course.score = rate.toFixed(1)
    await course.save()
}
const isLiked = async (StudentID, CoursesID) => {
    const student = await Students.findById(StudentID)
    await student.populate("CoursesLiked").execPopulate();
    if (student.CoursesLiked.includes(CoursesID)) {
        return true
    }
    return false
}
const isRegistered = async (StudentID, CoursesID) => {
    const student = await Students.findById(StudentID)
    await student.populate("CoursesRegistered").execPopulate();
    if (student.CoursesRegistered.includes(CoursesID)) {
        return true
    }
    return false
}
const isReviewed = async (StudentID, CourseID) => {
    const review = await Reviews.findOne({owner: StudentID, course: CourseID})
    if (review) return true
    else return false
}
const AddCourseReview = async (text, star, StudentID, CourseID) => {
    try {
        const check = await isReviewed(StudentID, CourseID)
        if (!check) {
            const review = new Reviews({
                comment: text,
                Star: star,
                course: CourseID,
                owner: StudentID
            })
            const course = await Courses.findById(CourseID)
            await course.populate('ReviewList').execPopulate()
            course.ReviewList.concat(review.id)
            UpdateRated(course.id)
            course.number_of_reviewer = course.number_of_reviewer + 1
            await review.save()
            await course.save()
        }
    } catch (e) {
        console.log(e)
    }

}
const ShowReviewList = async (CourseID) => {
    const course = await Courses.findById(CourseID)
    await course.populate("ReviewList").execPopulate()
    const list = course.ReviewList
    return list
}
/////// Chapters and Videos (TEACHERS)
const getChapterSpecs = async (ChapterID) => {
    const chapter = await Chapters.findById(ChapterID)
    return chapter
}
const getVideoSpecs = async (VideoID) => {
    const video = await Videos.findById(VideoID)
    return video
}
const AddChapter = async (CourseID, ChapterName) => {
    const course = await Courses.findById(CourseID)
    const chapter = new Chapters({
        name: ChapterName,
        course: course.id
    });
    await course.populate("ChapterList").execPopulate()
    course.ChapterList.concat(chapter.id)
    await chapter.save()
    await course.save()
}
const AddVideo = async (ChapterID, VideoName, url) => {
    const chapter = await Chapters.findById(ChapterID)
    await chapter.populate("VideoList").execPopulate()
    const video = new Videos({
        name: VideoName,
        chapter: chapter.id,
        url: url
    })
    chapter.VideoList.concat(video.id)
    await video.save()
    await chapter.save()
}
const MarkChapterAsDone = async (ChapterID) => {
    const chapter = await Chapters.findById(ChapterID)
    chapter.completed = true
    await chapter.save()
}
const viewChapterList = async (CourseID) => {
    const course = await Courses.findById(CourseID)
    await course.populate("ChapterList").execPopulate()
    return course.ChapterList
}
const viewVideoList = async (ChapterID) => {
    const chapter = await Chapters.findById(ChapterID)
    await chapter.populate("VideoList").execPopulate()
    return chapter.VideoList
}
const DeleteVideo = async (VideoID) => {
    const video = await Videos.findById(VideoID)
    const chapter = await Chapters.findById(video.chapter)
    await chapter.populate("VideoList").execPopulate()
    const index = chapter.VideoList.indexOf(video.id)
    chapter.VideoList.splice(index, 1)
    await chapter.save()
    await Videos.findByIdAndDelete(VideoID)
}
const DeleteChapter = async (ChapterID) => {
    const chapter = await Chapters.findById(ChapterID)
    await Videos.deleteMany({chapter: chapter.id})
    const course = await Courses.findById(chapter.course)
    await course.populate("ChapterList").execPopulate()
    const index = course.ChapterList.indexOf(chapter.id)
    course.ChapterList.splice(index, 1)
    await course.save()
    await Chapters.findByIdAndDelete(chapter.id)
}
const rmRegisList = async (StudentID, CourseID) => {
    const student = await Students.findById(StudentID)
    await student.populate("CoursesRegistered").execPopulate()
    const index = student.CoursesRegistered.indexOf(CourseID)
    student.CoursesRegistered.splice(index, 1)
    await student.save()
}
const rmWatchList = async (StudentID, CourseID) => {
    const student = await Students.findById(StudentID)
    await student.populate("CoursesLiked").execPopulate()
    const index = student.CoursesLiked.indexOf(CourseID)
    student.CoursesLiked.splice(index, 1)
    await student.save()
}
const DeleteCourse = async (CourseID) => {
    const course = await Courses.findById(CourseID)
    await course.populate("ChapterList").execPopulate()
    course.ChapterList.forEach(async (element) => {
        await DeleteChapter(element.id)
    })

    Reviews.deleteMany({course: CourseID})

    await course.populate("StudentsRegistered").execPopulate()
    await course.populate("StudentsLiked").execPopulate()
    course.StudentsRegistered.forEach(async (element) => {
        await rmRegisList(element)
    })
    course.StudentsLiked.forEach(async (element) => {
        await rmWatchList(element)
    })
    const teacher = await Teachers.findById(course.owner)
    await teacher.populate("CoursesOwned").execPopulate()
    const index = teacher.CoursesOwned.indexOf(CourseID)
    teacher.CoursesOwned.splice(index, 1)
    await teacher.save()

    await Courses.findByIdAndDelete(CourseID)
}
module.exports = {
    getCourseLecturer,
    getCoursesOwned,
    getStudentsRegistered,
    registerCourse,
    UnregisteredCourse,
    getCoursesRegistered,
    addtCourseToWatchList,
    ShowWatchList,
    RemoveCourseFromWatchList,
    AddCourseReview,
    ShowReviewList,
    getStudentSpecs,
    /// CHAPTER,VIDEO,COURSE
    AddChapter,
    AddVideo,
    viewChapterList,
    viewVideoList,
    MarkChapterAsDone,
    DeleteVideo,
    DeleteChapter,
    DeleteCourse,
    /// Check
    isLiked,
    isReviewed,
    isRegistered
}