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
const upload = multer({
  limit:{
      size: 5000000,
  },
  fileFilter(req,file,callback){
      if (!file.originalname.match(/\.(jpg|png|jpeg)$/)){
          return callback( new Error('Please upload an photo'))
      }
      callback(undefined,true)
  }
})

router.get("/teacher/add-course",Authen.checkTeacher, async (req, res) => {
    const cate = await Cate.find({})
    res.render("addCourse",{cate,role:req.user.role});
  });
  
router.post("/teacher/add-course",upload.single("avatar"), async (req, res) =>{
    const categories = await Cate.find({})
    const cate = categories
    try{
      const buffer = await sharp(req.file.buffer).resize({width:240,height:135}).png().toBuffer()
      const ava = buffer.toString('base64')
      const course = new Courses({
        name: req.body.name,
        category: req.body.category,
        owner: req.user.id,
        avatar: ava,
        brief_description: req.body.brief_des,
        full_description: req.body.full_des,
        price: req.body.price,
      })
      await course.save()
      res.render("addCourse",{cate,categories,success_message:"Course added successfully",role:req.user.role});
    }
    catch(e){
      res.render("addCourse",{cate,categories,error_message:e,role:req.user.role});
    }
})

module.exports = router