const express = require("express");
const Admin = require("../models/admin");
const Students = require("../models/student");
const Teachers = require("../models/teacher");
const Cate = require("../models/category")
const router = new express.Router();
const Courses = require("../models/course");
const Authen = require("../middleware/middleware")
const Methods = require("./Methods")
const SessionVideos = require("../models/sessionvideos");

router.get("/teacher/add-course", Authen.checkTeacher, async (req, res) => {
  const cate = await Cate.find({})
  res.render("addCourse", { cate, role: req.user.role, user: req.user });
});

router.post("/teacher/add-course", async (req, res) => {
  const categories = await Cate.find({})
  const cate = categories
  try {
    const imageID = req.body.avatar.split('/')[5]
    const baseURl = "https://drive.google.com/thumbnail?id=" + imageID
    const course = new Courses({
      name: req.body.name,
      category: req.body.category,
      owner: req.user.id,
      avatar: baseURl,
      brief_description: req.body.brief_des,
      full_description: req.body.full_des,
      price: req.body.price,
    })
    await course.save()
    res.render("addCourse", { cate, categories, success_message: "Course added successfully", role: req.user.role, user: req.user });
  } catch (e) {
    res.render("addCourse", { cate, categories, error_message: e, role: req.user.role, user: req.user });
  }
})

router.get("/teacher/courses-management", Authen.checkTeacher, async (req, res) => {
  const courses = await Methods.getCoursesOwned(req.user._id);
  for (const e of courses) {
    let index = courses.indexOf(e);
    const cate = await Methods.GetCateName(e.id)
    courses[index].category = cate
  }
  const categories = await Cate.find({})
  res.render("manage-courses", {
    courses,
    categories,
    role: req.user.role, user: req.user
  });
});

router.post("/teacher/courses-management", async (req, res) => {
  console.log(req.body);
  if (req.body.action == "remove_course") {
    console.log("Pass");
    await Methods.DeleteCourse(req.body.courseIdInput);
  }
  return res.redirect("/teacher/courses-management");

});

router.post("/teacher/view-course", async (req, res) => {

  const CourseID = req.cookies['CourseID'];
  console.log(req.body);
  console.log(req.body.action);
  if (req.body.action == "course_detail") {
    // Update course's detail
    let ava = null
    if (req.body.avatarInput !== '') {
      ava = req.body.avatarInput
    }
    await Methods.UpdateCourseDetail(CourseID.toString(), ava, req.body.courseNameInput, req.body.briefDescriptionInput, req.body.priceInput, req.body.statusInput);
    console.log("Pass course detail");
  }
  else if (req.body.action == "course_description") {
    // Update main description
    const NewDesc = req.body.desc;
    await Methods.UpdateDescription(CourseID.toString(), NewDesc);
    console.log("Pass course desc");
  }
  else if (req.body.action == "add_session") {
    // Add session
    await Methods.AddChapter(CourseID, req.body.sessionNameInput);
    console.log("Pass add session");
  }
  else if (req.body.action == "remove_session") {
    await Methods.DeleteChapter(req.body.sessionIdInput);
    console.log("Pass remove session");
  }
  else if (req.body.action == "change_session_name") {
    var chapter = await Methods.getChapterSpecs(req.body.ChapterIdInput2);
    chapter.name = req.body.changeSessionNameInput;
    await chapter.save();
  }
  else if (req.body.action == "add_video") {
    await Methods.AddVideo(req.body.ChapterIdInput, req.body.VideoNameInput, req.body.url);
  }
  return res.redirect("/teacher/view-course?id=" + CourseID.toString());
});

router.get("/teacher/view-course", async (req, res) => {
  const categories = await Cate.find({})
  const CourseID = req.query.id;
  res.cookie("CourseID", CourseID)
  const courses = await Methods.getCoursesOwned(req.user._id);
  for (let index = 0; index < courses.length; index++) {
    const course = courses[index];
    if (course._id == CourseID) {

      const chapters = await Methods.viewChapterList(CourseID);

      // Check
      const videolist = await SessionVideos.getbyCourseID(CourseID);
      res.render("viewCourse", { course, categories, chapters, videolist, role: req.user.role, user: req.user });
    }
  }
});

module.exports = router;