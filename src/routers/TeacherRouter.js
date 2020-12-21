const express = require("express")
const Teacher = require("../models/teacher")
const Method = require("./Methods")
const router = new express.Router()

router.get("/teacher/courses", async (req, res) => {
    try {
        const id = req.query.id
        const Courses = await Method.getCoursesOwned(id);
        res.send(Courses)
    } catch (e) {
        res.send(e)
    }
})

module.exports = router