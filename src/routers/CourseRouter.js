const Courses = require("../models/course")
const express = require("express")
const Method = require("./Methods")
const router = new express.Router()


router.post("/course/create",async(req,res)=>{  
    try{
        const course = new Courses(req.body)
        await course.save();
        res.send(course)
    }catch(e){
        res.send(e)
    }

})
router.post("/course/owner",async(req,res)=>{
    try{
        const courseID = req.query.id;
        const owner = await Method.getCourseOwner(courseID)
        res.send(owner)

    }catch(e){
        res.send(e)
    }

})
module.exports = router
