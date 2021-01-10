const express = require("express");
const Admin = require("../models/admin");
const Students = require("../models/student");
const Teachers = require("../models/teacher");
const Cate = require("../models/category")
const router = new express.Router();
const Courses = require("../models/course");
const Authen = require("../middleware/middleware")
const Methods = require("./Methods")
const Chapter = require("../models/chapter")
const SessionVideos = require("../models/sessionvideos");
const Category = require("../models/category");
////Create
router.post("/student/create", async (req, res) => {
  try {
    const Student = new Students(req.body);
    await Student.save();
    res.send(Student);
  } catch (e) {
    res.send(e);
  }
});

router.post("/teacher/create", async (req, res) => {
  try {
    const Teacher = new Teachers(req.body);
    await Teacher.save();
    res.send(Teacher);
  } catch (e) {
    res.send(e);
  }
});

router.post("/admin/create", async (req, res) => {
  try {
    const admin = new Admin(req.body);
    await admin.save();
    res.send(admin);
  } catch (e) {
    res.send(e);
  }
});

////Read
router.get("/students", async (req, res) => {
  try {
    const students = await Students.find({});
    res.send(students);
  } catch (e) {
    res.send(e);
  }
});

router.get("/teachers", async (req, res) => {
  try {
    const teachers = await Teachers.find({});
    res.send(teachers);
  } catch (e) {
    res.send(e);
  }
});

router.get("/admin", async (req, res) => {
  try {
    const admin = await Admin.find({});
    res.send(admin);
  } catch (e) {
    res.send(e);
  }
});

//ADD CATEGORY
router.post("/admin/add-category", async (req, res) => {
  const cate = new Cate({
    name: req.body.cateName
  })
  await cate.save()
  res.send(cate)
})


router.get("/admin/courses-management", async (req, res) => {
  const courses = await Courses.find();
  for (const e of courses) {
    let index = courses.indexOf(e);
    const teacher = await Methods.getCourseLecturer(e.id);
    courses[index].owner = teacher;
    const cate = await Methods.GetCateName(e.id)
    courses[index].category = cate
  }
  const categories = await Cate.find({})
  res.render("manage-courses", {
    courses,
    categories,
    role: ""
  });

});

router.get("/admin/categories-management", async (req, res) => {
  const categories = await Category.find();

  res.render("manage-categories", {
    categories
  });

});
router.get("/admin/users-management", async (req, res) => {
  const teachers = await Teachers.find();
  const students = await Students.find();

  res.render("manage-users", {
    teachers,
    students
  });

});
router.post("/admin/users-management", async (req, res) => {
  console.log(req.body);
  if (req.body.action == "edit_user_detail") {
    if (req.body.UserRoleInput == "Teacher"){
      const teacher = await Teachers.findById(req.body.UserIdInput);
      teacher.name = req.body.UserNameInput;
      teacher.phoneNumber = req.body.PhoneInput;
      teacher.email = req.body.EmailInput;
      if (req.body.ResetPasswordInput.length != 0){
        teacher.password = req.body.ResetPasswordInput;
      }
      await teacher.save();
    }
    else {
      const student = await Students.findById(req.body.UserIdInput);
      student.name = req.body.UserNameInput;
      student.phoneNumber = req.body.PhoneInput;
      student.email = req.body.EmailInput;
      if (req.body.ResetPasswordInput.length != 0){
        student.password = req.body.ResetPasswordInput;
      }
      await student.save();
    }
    console.log("Pass edit action");
  }
  else if (req.body.action == "add_teacher") {
    const teacher = new Teachers({
      name: req.body.TeacherNameInput,
      email: req.body.TeacherEmailInput,
      phoneNumber: req.body.TeacherPhoneInput,
      password: req.body.TeacherPasswordInput,
    });
    await teacher.save();
    console.log("Pass add action");
  }
  else if (req.body.action == "remove_user"){
    if (req.body.UserRoleInput == "Teacher"){
      const teacher = await Teachers.findById(req.body.UserIdInput);
      await teacher.delete();
    }
    else {
      const student = await Students.findById(req.body.UserIdInput);
      await student.delete();
    }
  }
  return res.redirect("/admin/users-management");
});

router.post("/admin/view-course", async (req, res) => {

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
  return res.redirect("/admin/view-course?id=" + CourseID.toString());
})

router.get("/admin/view-course", async (req, res) => {
  const categories = await Cate.find({})
  const CourseID = req.query.id;
  res.cookie("CourseID", CourseID)
  const course = await Courses.findById(CourseID);
  const chapters = await Methods.viewChapterList(CourseID);

  // Check
  const videolist = await SessionVideos.getbyCourseID(CourseID);
  res.render("viewCourse", { course, categories, chapters, videolist });

});

module.exports = router;