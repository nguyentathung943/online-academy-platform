const express = require("express");
const Admin = require("../models/admin");
const Students = require("../models/student");
const Teachers = require("../models/teacher");
const Cate = require("../models/category")
const router = new express.Router();
const multer = require("multer")
const sharp = require("sharp");
const Courses = require("../models/course");
const Authen = require("../middleware/middleware")
const Methods = require("./Methods")

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
router.post("/admin/add-category",async (req,res)=>{
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

router.post("/admin/view-course",async (req,res)=>{
  const NewDesc = req.body.desc;
  const CourseID = req.cookies['CourseID'];
  console.log(req.body);  
  console.log(req.body.action);
  if (req.body.action == "course_detail") {
    await Methods.UpdateCourseDetail(CourseID.toString(),req.body.courseNameInput,req.body.briefDescriptionInput,req.body.priceInput);
    console.log("Pass");
  }
  if (req.body.action == "course_description")
    await Methods.UpdateDescription(CourseID.toString(), NewDesc);
  return res.redirect("/admin/view-course?id="+ CourseID.toString());
})

router.get("/admin/view-course", async (req, res) => {
  const categories = await Cate.find({})
  const CourseID = req.query.id;
  res.cookie("CourseID",CourseID)
  const course = await Courses.findById(CourseID);

  // Check
  res.render("viewCourse", {course, categories});
  
});

module.exports = router;