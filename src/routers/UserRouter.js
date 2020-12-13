const express = require("express");
const Students = require("../models/student");
const Admin = require("../models/admin")
const Teachers = require("../models/teacher")

const router = new express.Router();

router.get("/", async (req, res) => {
    res.render("index")
})

router.get("/cart", async (req, res) => {
    res.render("cart")
})

router.get("/checkout", async (req, res) => {
    res.render("checkout")
})

router.get("/contact", async (req, res) => {
    res.render("contact")
})

router.get("/my-account", async (req, res) => {
    res.render("my-account")
})

router.get("/product-detail", async (req, res) => {
    res.render("product-detail")
})

router.get("/product-list", async (req, res) => {
    res.render("product-list")
})

router.get("/wishlist", async (req, res) => {
    res.render("wishlist")
})

router.get("/login", async (req, res) => {
    res.render("login")
})
////Create
router.post("/student/create", async (req, res) => {
    try {
        const Student = new Students(req.body);
        await Student.save();
        res.send(Student)
    } catch (e) {
        res.send(e)
    }
})
router.post("/teacher/create", async (req, res) => {
    try {
        const Teacher = new Teachers(req.body);
        await Teacher.save();
        res.send(Teacher)
    } catch (e) {
        res.send(e)
    }
})

router.post("/admin/create", async (req, res) => {
    try {
        const admin = new Admin(req.body);
        await admin.save();
        res.send(admin)
    } catch (e) {
        res.send(e)
    }
})

////Read
router.get("/students", async (req, res) => {
    try {
        const students = await Students.find({})
        res.send(students)
    } catch (e) {
        res.send(e)
    }
})
router.get("/teachers", async (req, res) => {
    try {
        const teachers = await Teachers.find({})
        res.send(teachers)
    } catch (e) {
        res.send(e)
    }

})

router.get("/admin", async (req, res) => {
    try {
        const admin = await Admin.find({})
        res.send(admin)
    } catch (e) {
        res.send(e)
    }
})
module.exports = router