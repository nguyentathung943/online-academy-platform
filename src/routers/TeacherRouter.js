const express = require("express");
const Admin = require("../models/admin");
const Students = require("../models/student");
const Teachers = require("../models/teacher");
const Cate = require("../models/category")
const router = new express.Router();
const Courses = require("../models/course");
const Authen = require("../middleware/middleware")

router.get("/teacher/add-course", Authen.checkTeacher, async (req, res) => {
    const cate = await Cate.find({})
    res.render("addCourse", {cate, role: req.user.role});
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
        res.render("addCourse", {cate, categories, success_message: "Course added successfully", role: req.user.role});
    } catch (e) {
        res.render("addCourse", {cate, categories, error_message: e, role: req.user.role});
    }
})

module.exports = router