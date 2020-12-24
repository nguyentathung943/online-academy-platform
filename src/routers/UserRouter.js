const express = require("express");
const Students = require("../models/student");
const Admin = require("../models/admin");
const Teachers = require("../models/teacher");
const Courses = require("../models/course")
const Methods = require("./Methods")
const multer = require("multer")
const sharp = require("sharp")
const passport = require("passport");
const check = require("../middleware/middleware")
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

const router = new express.Router();

router.get("/", async (req, res) => {
    const courses = await Courses.find();
    for (const e of courses) {
        let index = courses.indexOf(e);
        const teacher = await Methods.getCourseLecturer(e.id);
        courses[index].owner = teacher;
    }
    res.render("index", {
        courses,
    });
});

router.post("/test", async (req, res) => {
    console.log("REQ " + req.body.mytextarea);
    return res.render("test", {data: req.body.mytextarea});
});


router.get("/test", async (req, res) => {
    res.render("test");
});

router.get("/login", async (req, res) => {
    if (req.isAuthenticated()) {
        return res.redirect("/");
    }
    res.render("login");
});

router.post(
    "/login",
    passport.authenticate("local", {
        successRedirect: "/",
        failureRedirect: "/login",
        failureFlash: true,
    })
);
router.get("/profile", async (req, res) => {
    if (!req.isAuthenticated()) {
        return res.redirect("/login");
    }
    res.render("profile", {
        name: req.user.name,
        mobile: req.user.phoneNumber,
        email: req.user.email,
    });
});

router.post("/profile", async (req, res) => {
    try {
        console.log(typeof req.body.password);
        if (req.body.o_password.length == 0) {
            const user = req.user;
            user.email = req.body.email;
            user.phoneNumber = req.body.phoneNumber;
            user.name = req.body.name;
            await user.save();
            res.render("profile", {
                name: req.user.name,
                mobile: req.user.phoneNumber,
                email: req.user.email,
                success_message: "Information saved",
            });
        } else {
            const user = req.user;
            if (req.body.o_password !== user.password) {
                res.render("profile", {
                    name: req.user.name,
                    mobile: req.user.phoneNumber,
                    email: req.user.email,
                    error_message: "Wrong password!",
                });
            } else if (req.body.new_password !== req.body.confirm_password) {
                res.render("profile", {
                    name: req.user.name,
                    mobile: req.user.phoneNumber,
                    email: req.user.email,
                    error_message: "Confirm password does not match!",
                });
            } else if (
                req.body.new_password === "" ||
                req.body.confirm_password === ""
            ) {
                res.render("profile", {
                    name: req.user.name,
                    mobile: req.user.phoneNumber,
                    email: req.user.email,
                    error_message: "New password can not be blank",
                });
            } else if (
                req.body.o_password === user.password &&
                req.body.new_password === req.body.confirm_password
            ) {
                user.password = req.body.new_password;
                await user.save();
                res.render("profile", {
                    name: req.user.name,
                    mobile: req.user.phoneNumber,
                    email: req.user.email,
                    success_message: "Information saved",
                });
            }
        }
    } catch (e) {
        res.send(e);
    }
});



router.get("/register", async (req, res) => {
    res.render("register");
});

router.post("/register", async (req, res) => {
    try {
        if (req.body.password === req.body.confirmPassword) {
            const student = new Students({
                name: req.body.name,
                email: req.body.email,
                phoneNumber: req.body.phone,
                password: req.body.password,
            });
            await student.save();
            res.render("register", {
                success_message: "Account created successfully",
            });
        } else {
            res.render("register", {
                fail_message: "Confirm password does not match",
            });
        }
    } catch (e) {
        res.send(e);
    }
});

router.get("/cart", async (req, res) => {
    console.log(req.user);
    res.render("cart");
});

router.get("/checkout", async (req, res) => {
    res.render("checkout");
});

router.get("/contact", async (req, res) => {
    res.render("contact");
});

router.get("/my-account", async (req, res) => {
    res.render("my-account");
});

router.get("/product-detail", async (req, res) => {
    const CourseID = req.query.id;
    res.cookie("CourseID",CourseID)
    const course = await Courses.findById(CourseID);
    const reviewList = await Methods.ShowReviewList(CourseID)
    for (let e of reviewList) {
        const index = reviewList.indexOf(e)
        const StudentComment = await Methods.getStudentSpecs(e.id)
        reviewList[index] = StudentComment
    }
    let score = course.score
    course.score = Math.round(score * 2) / 2;
    let starArr = []
    for (let i = 0; i < Math.floor(course.score); i++)
        starArr.push("fa-star");
    if (Math.floor(course.score) !== course.score)
        starArr.push("fa-star-half");
    
    if(req.isAuthenticated()){
        const isCommented = await Methods.isReviewed(req.user.id, CourseID)
        const isLiked = await Methods.isLiked(req.user.id,CourseID)
        const isRegistered = await Methods.isRegistered(req.user.id,CourseID)
        if(isCommented){
            await isCommented.populate("owner").execPopulate()
            const date = isCommented.createdAt.toString().split("T")[0]
            const userStar = []
            for(let i = 0; i < isCommented.Star; i++){
                userStar.push("fa-star");
            }
            res.render("product-detail", {course, reviewList, isCommented, starArr,userStar,date,isLiked,isRegistered});
        }
        else{
            res.render("product-detail", {course, reviewList, isCommented:null, starArr,isLiked,isRegistered});
        }
    }
    else{
        res.render("product-detail", {course, reviewList, isCommented:null, starArr});
    }
});


router.get("/register-course", check.CheckAuthenticated,async (req,res)=>{
    try{
        const student = req.user
        const CourseID = req.cookies['CourseID']
        console.log(CourseID)
        console.log(student.id)
        await Methods.registerCourse(student.id, CourseID)
        const check = Methods.isRegistered(student.id,CourseID)
        return res.redirect("/product-detail/?id="+ CourseID.toString())
    }
    catch(e){
        res.send(e)
    }
})

router.get("/add-watchlist", check.CheckAuthenticated, async (req,res)=>{
    try{
        const student = req.user
        const CourseID = req.cookies['CourseID']
        console.log(CourseID)
        console.log(student.id)
        await Methods.addtCourseToWatchList(student.id,CourseID)
        const check = Methods.isLiked(student.id,CourseID)
        return res.redirect("/product-detail/?id="+CourseID)
    }
    catch(e){
        res.send(e)
    }
})

router.post("/add-review", check.CheckAuthenticated, async (req,res)=>{
    try{
        const student = req.user
        const CourseID = req.cookies['CourseID']
        console.log(CourseID)
        console.log(student.id)
        await Methods.AddCourseReview(req.body.review_content,parseInt(req.body.num_star),student.id,CourseID)
        return res.redirect("/product-detail/?id="+CourseID)
    }
    catch(e){
        res.send(e)
    }
})

router.get("/product-list", async (req, res) => {
    res.render("product-list");
});

router.get("/wishlist", async (req, res) => {
    res.render("wishlist");
});

router.get("/logout", async (req, res) => {
    req.logOut();
    return res.redirect("/login");
});

router.get("/courses/add", async (req, res) => {
    console.log("hello")
    try {
        res.render("add_course")

    } catch (e) {
        res.send(e)
    }
})

router.get('*', (req, res) => {
    res.render('error', {
        error: 'The page you are trying to connect does not exist or you are not authorized to access!',
    })
})

module.exports = router
