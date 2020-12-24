const express = require("express");
const Students = require("../models/student");
const Admin = require("../models/admin");
const Teachers = require("../models/teacher");
const Courses = require("../models/course");
const Method = require("./Methods");
const bcrypt = require("bcrypt");
const passport = require("passport");
const initializePassport = require("../middleware/passport");

initializePassport(
    passport,
    async (email, password) => {
        try {
            var user = await Teachers.findOne({email});
            if (user) {
                var Valid = await bcrypt.compare(password, user.password);
                if (Valid) {
                    return user;
                }
            }
            user = await Students.findOne({email});
            if (user) {
                var Valid = await bcrypt.compare(password, user.password);
                if (Valid) {
                    return user;
                }
            }
            user = await Admin.findOne({email});
            if (user) {
                var Valid = await bcrypt.compare(password, user.password);
                if (Valid) {
                    return user;
                }
            }
        } catch (e) {
            return null;
        }
    },
    async (id, role) => {
        if (role === "Teacher") {
            return Teachers.findById(id);
        }
        if (role === "Student") {
            return Students.findById(id);
        }
        if (role === "Administrator") {
            return Admin.findById(id);
        }
    }
);
const router = new express.Router();

router.get("/", async (req, res) => {
    console.log(req.user);
    const courses = await Courses.find();
    for (const e of courses) {
        let index = courses.indexOf(e);
        const teacher = await Method.getCourseLecturer(e.id);
        courses[index].owner = teacher;
        console.log(courses)
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
            console.log(1);
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
            console.log(2);
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

    const course = await Courses.findById(CourseID);

    const reviewList = await Method.ShowReviewList(CourseID)

    const isCommented = await Method.isReviewed("5fe317e5aaf7da24bcc32123", CourseID)
    for (let e of reviewList) {
        const index = reviewList.indexOf(e)
        const StudentComment = await Method.getStudentSpecs(e.id)
        console.log(StudentComment)
        reviewList[index] = StudentComment
    }
    console.log(reviewList)
    let score = course.score
    course.score = Math.round(score * 2) / 2;
    let starArr = []
    for (let i = 0; i < Math.floor(course.score); i++)
        starArr.push("fa-star");
    if (Math.floor(course.score) !== course.score)
        starArr.push("fa-star-half");
    res.render("product-detail", {course, reviewList, isCommented, starArr});
});

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

router.get("*", (req, res) => {
    res.render("error", {
        error:
            "The page you are trying to connect does not exist or you are not authorized to access!",
    });
});

module.exports = router;
