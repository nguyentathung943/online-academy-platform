const express = require("express");
const Admin = require("../models/admin");
const Students = require("../models/student");
const Teachers = require("../models/teacher");
const Cate = require("../models/category")
const router = new express.Router();

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
  res.render("manage-courses");
});

router.get("/admin/view-course", async (req, res) => {
  res.render("viewCourse");
});

router.get("/admin/add-course", async (req, res) => {
  res.render("addCourse");
});

module.exports = router;