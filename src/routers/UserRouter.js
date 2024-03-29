const express = require("express");
const Students = require("../models/student");
const Admin = require("../models/admin");
const Teachers = require("../models/teacher");
const Courses = require("../models/course");
const Methods = require("./Methods");
const Send_Mail = require("../otp_confirm/otp");
const passport = require("passport");
const check = require("../middleware/middleware");
const Category = require("../models/category");
const Register = require("../models/register");
const OS = require("os");
const SessionVideos = require("../models/sessionvideos");
const Review = require("../models/review");
const router = new express.Router();
router.get("/", async (req, res) => {
    if(req.isAuthenticated() && req.user.isBlocked){
        req.logOut();
        res.render("error",{error : "Your account has been blocked!"})
    }
    else {
        if (req.isAuthenticated() && req.user.role === "Teacher") {
            const courses = await Methods.getCoursesOwned(req.user.id);
            courses.sort(function (a, b) {
                return b.createdAt - a.createdAt;
            });
            for (const e of courses) {
                let index = courses.indexOf(e);
                const teacher = await Methods.getCourseLecturer(e.id);
                courses[index].owner = teacher;
                const cate = await Methods.GetCateName(e.id);
                courses[index].category = cate;
                courses[index].starArr = GetStarArr(courses[index].score);
            }
            const number_course = courses.length;
            res.render("index", {
                user: req.user,
                role: req.user.role,
                course_owned: number_course,
                courses,
            });
        } else if (req.isAuthenticated() && req.user.role === "Administrator") {
            const numCourse = await Courses.countDocuments();
            const numTeacher = await Teachers.countDocuments();
            const numStudent = await Students.countDocuments();
            const numReview = await Review.countDocuments();
            const numRegister = await Register.countDocuments();
            res.render("index", {
                user: req.user,
                role: req.user.role,
                numCourse,
                numTeacher,
                numStudent,
                numReview,
                numRegister,
            });
        } else {
            const courses = await Courses.find();
            for (const e of courses) {
                let index = courses.indexOf(e);
                const teacher = await Methods.getCourseLecturer(e.id);
                courses[index].owner = teacher;
                const cate = await Methods.GetCateName(e.id);
                courses[index].category = cate;
                courses[index].starArr = GetStarArr(courses[index].score);
            }
            let featuredCourses = [];
            const now = new Date();
            let registers = await Register.find({
                createdAt: {$gte: now - 604800000},
            });
            for (let i = 0; i < registers.length; i++) {
                await registers[i].populate("course").execPopulate();
                await registers[i].course.populate("category").execPopulate();
                await registers[i].course.populate("owner").execPopulate();
            }
            let categories = await Category.find({});
            for (let i = 0; i < categories.length; i++) {
                let count = 0;
                for (let j = 0; j < registers.length; j++) {
                    if (categories[i].id == registers[j].course.category.id) {
                        count++;
                    }
                    categories[i].number_of_student = count;
                }
            }
            categories.sort((a, b) => {
                return b.number_of_student - a.number_of_student
            })
            if (categories.length > 5)
                categories.slice(0, 5);
            registers.forEach((e) => featuredCourses.push(e.course));
    
            const seen = new Set();
            featuredCourses = featuredCourses.filter((el) => {
                const duplicate = seen.has(el.id);
                seen.add(el.id);
                return !duplicate;
            });
            featuredCourses.sort(function (a, b) {
                return b.number_of_student - a.number_of_student;
            });
    
            let mostViewCourses = JSON.parse(JSON.stringify(courses));
            mostViewCourses.sort(function (a, b) {
                return b.number_of_student - a.number_of_student;
            });
    
            let newestCourses = JSON.parse(JSON.stringify(courses));
            newestCourses.sort(function (a, b) {
                return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
            });
    
            if (featuredCourses.length > 3) {
                featuredCourses = featuredCourses.slice(0, 3);
            }
            if (mostViewCourses.length > 10) {
                mostViewCourses = mostViewCourses.slice(0, 10);
            }
            if (newestCourses.length > 10) {
                newestCourses = newestCourses.slice(0, 10);
            }
            for (const e of featuredCourses) {
                let index = featuredCourses.indexOf(e);
                featuredCourses[index].starArr = GetStarArr(featuredCourses[index].score);
            }
            for (const e of mostViewCourses) {
                let index = mostViewCourses.indexOf(e);
                mostViewCourses[index].starArr = GetStarArr(mostViewCourses[index].score);
            }
            for (const e of newestCourses) {
                let index = newestCourses.indexOf(e);
                newestCourses[index].starArr = GetStarArr(newestCourses[index].score);
            }
    
            if (req.isAuthenticated()) {
                if (!req.user.confirmed && req.user.role === "Student") {
                    req.logOut();
                    res.render("error", {
                        title: "EMAIL NOT CONFIRMED!",
                        error: "Please confirm your email before using our services!",
                    });
                } else {
                    res.render("index", {
                        categories,
                        featuredCourses,
                        mostViewCourses,
                        newestCourses,
                        user: req.user,
                        role: req.user.role
                    });
                }
            }
            else {
                res.render("index", {
                    categories,
                    featuredCourses,
                    mostViewCourses,
                    newestCourses,
                });
            }
        }
    }
    
    
});

router.post("/test", async (req, res) => {
    console.log("REQ " + req.body.mytextarea);
    return res.render("test", {data: req.body.mytextarea});
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
    } else if (req.user.role === "Student" && !req.user.confirmed) {
        req.logOut();
        res.render("error", {
            title: "EMAIL NOT CONFIRMED!",
            error: "Please confirm your email before using our services!",
        });
    } else {
        res.render("profile", {
            role: req.user.role,
            user: req.user,
        });
    }
});

router.post("/profile", async (req, res) => {
    try {
        if (req.body.o_password.length == 0) {
            const user = req.user;
            user.email = req.body.email;
            user.phoneNumber = req.body.phoneNumber;
            user.name = req.body.name;
            await user.save();
            res.render("profile", {
                user: req.user,
                role: req.user.role,
                success_message: "Information saved",
            });
        } else {
            const user = req.user;
            if (req.body.o_password !== user.password) {
                res.render("profile", {
                    user: req.user,
                    role: req.user.role,
                    error_message: "Wrong password!",
                });
            } else if (req.body.new_password !== req.body.confirm_password) {
                res.render("profile", {
                    user: req.user,
                    role: req.user.role,
                    error_message: "Confirm password does not match!",
                });
            } else if (
                req.body.new_password === "" ||
                req.body.confirm_password === ""
            ) {
                res.render("profile", {
                    user: req.user,
                    role: req.user.role,
                    error_message: "New password can not be blank",
                });
            } else if (
                req.body.o_password === user.password &&
                req.body.new_password === req.body.confirm_password
            ) {
                user.password = req.body.new_password;
                await user.save();
                res.render("profile", {
                    user: req.user,
                    role: req.user.role,
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
router.get("/confirm-email", async (req, res) => {
    const student = await Students.findById(req.query.id);
    if (student.confirmed === false) {
        await student.save();
        res.render("confirm", {
            message: "INPUT YOUR OTP CODE TO CONFIRM YOUR ACCOUNT",
            StuID: req.query.id,
        });
    } else {
        res.render("confirm", {
            message: "YOUR EMAIL HAS ALREADY BEEN CONFIRMED",
        });
    }
});
router.post("/confirm-email", async (req, res) => {
    const id = req.body.ID;
    const OTP = req.body.OTP;
    const stu = await Students.findById(id);
    if (stu.otp == OTP) {
        stu.confirmed = true;
        await stu.save();
    }
    return res.redirect("/confirm-email?id=" + id);
});
router.post("/register", async (req, res) => {
    try {
        if (req.body.password === req.body.confirmPassword) {
            const stu = await Students.findOne({email: req.body.email});
            if (stu) {
                res.render("register", {
                    fail_message: "Email already existed, please choose another one!",
                });
            } else {
                const OTP = getRandomInt(1111, 9999);
                const student = new Students({
                    name: req.body.name,
                    email: req.body.email,
                    phoneNumber: req.body.phone,
                    password: req.body.password,
                    otp: OTP,
                });
                await student.save();
                const host = req.headers.host;
                const url =
                    "http://" + host + "/confirm-email?id=" + student._id.toString();
                await Send_Mail(url, student.email, OTP);
                res.render("register", {
                    success_message:
                        "Account created successfully, check your mailbox to confirm your email",
                });
            }
        } else {
            res.render("register", {
                fail_message: "Confirm password does not match",
            });
        }
    } catch (e) {
        res.send(e);
    }
});

router.get("/product-detail", async (req, res) => {
    const options = {year: 'numeric', month: 'short', day: 'numeric'};
    const categories = await Category.find({});
    const CourseID = req.query.id;
    res.cookie("CourseID", CourseID);
    let course = await Courses.findById(CourseID);
    let reviewList = await Methods.ShowReviewList(CourseID);
    if (!course.isBlocked){
        for (let e of reviewList) {
            const index = reviewList.indexOf(e);
            const StudentComment = await Methods.getStudentSpecs(e.id);
            reviewList[index] = StudentComment;
        }
        for (let i = 0; i < reviewList.length; i++) {
            let temp = JSON.parse(JSON.stringify(reviewList[i]));
            temp.Star = GetStarArr(temp.Star);
            temp.createdAt.tostring
            temp.date = new Date(temp.createdAt).toLocaleDateString(undefined, options);
            reviewList[i] = temp;
        }
        var time = new Date(course.updatedAt);
        course.date = new Date(course.updatedAt).toLocaleDateString(undefined, options);
        course.number_of_student = course.number_of_student.toLocaleString();
        course.starArr = GetStarArr(course.score);
        await course.populate("owner").execPopulate();
        await course.populate("category").execPopulate();
        course.relatedCourses = await Methods.GetRelatedCourses(course.category);
        let index = course.relatedCourses.findIndex(
            (e) => e._id.toString() === course._id.toString()
        );
        course.relatedCourses.splice(index, 1);
        if (course.relatedCourses.length > 5) {
            course.relatedCourses = course.relatedCourses.slice(0, 5);
        }
    
        for (let index = 0; index < course.relatedCourses.length; index++) {
            course.relatedCourses[index].starArr = GetStarArr(
                course.relatedCourses[index].score
            );
            await course.relatedCourses[index].populate("owner").execPopulate();
            await course.relatedCourses[index].populate("category").execPopulate();
        }
        // Query chapters of course
        const chapters = await Methods.viewChapterList(CourseID);
    
        const videolist = await SessionVideos.getbyCourseID(CourseID);
        let previewVideos = [];
        if (videolist.length > 0)
            previewVideos = videolist[0].videos;
        const allCourses = await Courses.find();
        let mostViewCourses = JSON.parse(JSON.stringify(allCourses));
        mostViewCourses = await Methods.CourseSortAs(
            mostViewCourses,
            "number_of_student",
            -1
        );
        let newViewCourses = JSON.parse(JSON.stringify(allCourses));
        newViewCourses = await Methods.CourseSortAs(
            newViewCourses,
            "createdAt",
            -1
        );
        mostViewCourses = mostViewCourses.slice(0, 3);
        newViewCourses = newViewCourses.slice(0, 3);
        if (mostViewCourses.some((e) => e._id == course._id))
            course.isBestseller = true;
    
        if (newViewCourses.some((e) => e._id == course._id))
            course.isNewest = true;
        if (req.isAuthenticated()) {
            if (!req.user.confirmed && req.user.role === "Student") {
                req.logOut();
                res.render("error", {
                    title: "EMAIL NOT CONFIRMED!",
                    error: "Please confirm your email before using our services!",
                });
            } else {
                const isCommented = await Methods.isReviewed(req.user.id, CourseID);
                const isLiked = await Methods.isLiked(req.user.id, CourseID);
                const isRegistered = await Methods.isRegistered(req.user.id, CourseID);
                if (isCommented) {
                    await isCommented.populate("owner").execPopulate();
                    isCommented.starArr = GetStarArr(isCommented.Star)
                    console.log("isCommtented", isCommented)
                    const date = new Date(isCommented.createdAt).toLocaleDateString(undefined, options);
                    let userStar = await Review.find({owner: req.user.id});
                    userStar = GetStarArr(userStar)
                    res.render("product-detail", {
                        course,
                        userStar,
                        reviewList,
                        isCommented,
                        date,
                        isLiked,
                        isRegistered,
                        categories,
                        chapters,
                        previewVideos,
                        videolist,
                        role: req.user.role,
                        user: req.user,
                    });
                } else {
                    res.render("product-detail", {
                        course,
                        reviewList,
                        isCommented: null,
                        isLiked,
                        isRegistered,
                        categories,
                        chapters,
                        previewVideos,
                        videolist,
                        role: req.user.role,
                        user: req.user,
                    });
                }
            }
        } else {
            res.render("product-detail", {
                course,
                reviewList,
                isCommented: null,
                categories,
                chapters,
                previewVideos,
                videolist,
            });
        }
    }
   
});

router.get("/register-course", check.CheckAuthenticated, async (req, res) => {
    try {
        const student = req.user;
        const CourseID = req.cookies["CourseID"];
        await Methods.registerCourse(student.id, CourseID);
        const check = Methods.isRegistered(student.id, CourseID);
        return res.redirect("/product-detail/?id=" + CourseID.toString());
    } catch (e) {
        res.send(e);
    }
});

router.get("/watchlist", check.CheckAuthenticated, async (req, res) => {
    try {
        const student = req.user;
        const courses = await Methods.ShowWatchList(student);
        for (let index = 0; index < courses.length; index++)
            await courses[index].populate("owner").execPopulate();
        res.render("watchlist", {
            courses,
            role: req.user.role,
            user: req.user,
        });
    } catch (e) {
        res.send(e);
    }
});

router.get("/add-watchlist", check.CheckAuthenticated, async (req, res) => {
    try {
        const student = req.user;
        const CourseID = req.cookies["CourseID"];
        await Methods.addtCourseToWatchList(student.id, CourseID);
        const check = Methods.isLiked(student.id, CourseID);
        return res.redirect("/product-detail/?id=" + CourseID);
    } catch (e) {
        res.send(e);
    }
});

router.get(
    "/courses-registered",
    check.CheckAuthenticated,
    async (req, res) => {
        try {
            const student = req.user;
            const courses = await Methods.getCoursesRegistered(student);
            for (let index = 0; index < courses.length; index++)
                await courses[index].populate("owner").execPopulate();
            res.render("registeredCourses", {
                courses,
                role: req.user.role,
                user: req.user,
            });
        } catch (e) {
            res.send(e);
        }
    }
);

router.get("/remove-watchlist", check.CheckAuthenticated, async (req, res) => {
    try {
        const student = req.user;
        const CourseID = req.cookies["CourseID"];
        await Methods.RemoveCourseFromWatchList(student.id, CourseID);
        const check = Methods.isLiked(student.id, CourseID);
        return res.redirect("/product-detail/?id=" + CourseID);
    } catch (e) {
        res.send(e);
    }
});

router.get(
    "/remove-watchlist/:id",
    check.CheckAuthenticated,
    async (req, res) => {
        try {
            const student = req.user;
            const CourseID = req.params.id;
            await Methods.RemoveCourseFromWatchList(student.id, CourseID);
            const check = Methods.isLiked(student.id, CourseID);
            return res.redirect("/watchlist");
        } catch (e) {
            res.send(e);
        }
    }
);

router.post("/add-review", check.CheckAuthenticated, async (req, res) => {
    try {
        const student = req.user;
        const CourseID = req.cookies["CourseID"];
        await Methods.AddCourseReview(
            req.body.review_content,
            parseInt(req.body.num_star),
            student.id,
            CourseID
        );
        return res.redirect("/product-detail/?id=" + CourseID);
    } catch (e) {
        res.send(e);
    }
});
router.get("/course-list", async (req, res) => {
    const categories = await Category.find({});
    let option = "";
    let host = req.originalUrl;
    if (req.query.sortPrice) {
        host = host.split("?")[0] + "?";
        let status = null;
        req.query.sortPrice == "1"
            ? ((status = 1), (option = "Ascending Price"))
            : ((status = -1), (option = "Descending Price"));
        let courses = await Methods.FetchCourseSortAs("price", status);
        for (const e of courses) {
            let index = courses.indexOf(e);
            const teacher = await Methods.getCourseLecturer(e.id);
            courses[index].owner = teacher;
            const cate = await Methods.GetCateName(e.id);
            courses[index].category = cate;
            courses[index].starArr = GetStarArr(courses[index].score);
        }
        courses = GetPagination(courses);

        res.render("product-list", {
            categories,
            courses,
            option,
            host,
            role: req.isAuthenticated() ? req.user.role : null,
            user: req.isAuthenticated() ? req.user : null,
        });
    } else if (req.query.sortRate) {
        host = host.split("?")[0] + "?";
        let status = null;
        req.query.sortRate == "1"
            ? ((status = 1), (option = "Ascending Rate Score"))
            : ((status = -1), (option = "Descending Rate Score"));
        let courses = await Methods.FetchCourseSortAs("score", status);
        for (const e of courses) {
            let index = courses.indexOf(e);
            const teacher = await Methods.getCourseLecturer(e.id);
            courses[index].owner = teacher;
            const cate = await Methods.GetCateName(e.id);
            courses[index].category = cate;
            courses[index].starArr = GetStarArr(courses[index].score);
        }
        courses = GetPagination(courses);
        res.render("product-list", {
            categories,
            courses,
            option,
            host,
            role: req.isAuthenticated() ? req.user.role : null,
            user: req.isAuthenticated() ? req.user : null,
        });
    } else if (req.query.searchValue) {
        host = host.split("&")[0] + "&";
        var courses = await Methods.searchCourseFullText(req.query.searchValue);
        var attri = null;
        req.query.price ? (attri = "price") : (attri = "score");
        if (attri === "price") {
            if (req.query[attri] == "-1") option = "Descending Price";
            else option = "Ascending Price";
        } else {
            if (req.query[attri] == "-1") option = "Descending Rate Score";
            else option = "Ascending Rate Score";
        }
        courses = await Methods.CourseSortAs(
            courses,
            attri,
            parseInt(req.query[attri])
        );
        const allCourses = await Courses.find();
        let mostViewCourses = JSON.parse(JSON.stringify(allCourses));
        mostViewCourses = await Methods.CourseSortAs(
            mostViewCourses,
            "number_of_student",
            -1
        );
        let newViewCourses = JSON.parse(JSON.stringify(allCourses));
        newViewCourses = await Methods.CourseSortAs(
            newViewCourses,
            "createdAt",
            -1
        );
        mostViewCourses = mostViewCourses.slice(0, 3);
        newViewCourses = newViewCourses.slice(0, 3);
        for (let i = 0; i < courses.length; i++) {
            if (mostViewCourses.some((e) => e._id == courses[i]._id)) {
                courses[i].isBestseller = true;
            }

            if (newViewCourses.some((e) => e._id == courses[i]._id)) {
                courses[i].isNewest = true;
            }
        }
        if (courses.length === 0) {
            courses = null;
        } else {
            for (const e of courses) {
                let index = courses.indexOf(e);
                const teacher = await Methods.getCourseLecturer(e.id);
                courses[index].owner = teacher;
                const cate = await Methods.GetCateName(e.id);
                courses[index].category = cate;
                courses[index].starArr = GetStarArr(courses[index].score);
            }

            courses = GetPagination(courses);
        }
        res.render("product-list", {
            categories,
            courses,
            option,
            host,
            role: req.isAuthenticated() ? req.user.role : null,
            user: req.isAuthenticated() ? req.user : null,
        });
    } else if (req.query.categoryName) {
        let courses = await Methods.FetchCourseByCateName(req.query.categoryName);
        host = host.split("&")[0] + "&";

        var attri = null;
        req.query.price ? (attri = "price") : (attri = "score");
        if (attri === "price") {
            if (req.query[attri] == "-1") option = "Descending Price";
            else option = "Ascending Price";
        } else {
            if (req.query[attri] == "-1") option = "Descending Rate Score";
            else option = "Ascending Rate Score";
        }
        courses = await Methods.CourseSortAs(
            courses,
            attri,
            parseInt(req.query[attri])
        );
        for (const e of courses) {
            let index = courses.indexOf(e);
            const teacher = await Methods.getCourseLecturer(e.id);
            courses[index].owner = teacher;
            const cate = await Methods.GetCateName(e.id);
            courses[index].category = cate;
            courses[index].starArr = GetStarArr(courses[index].score);
        }
        courses = GetPagination(courses);
        res.render("product-list", {
            categories,
            courses,
            option,
            host,
            role: req.isAuthenticated() ? req.user.role : null,
            user: req.isAuthenticated() ? req.user : null,
        });
    } else {
        host = host.split("?")[0] + "?";
        let courses = await Courses.find();
        var attri = null;
        req.query.price ? (attri = "price") : (attri = "score");
        if (attri === "price") {
            if (req.query[attri] == "-1") option = "Descending Price";
            else option = "Ascending Price";
        } else {
            if (req.query[attri] == "-1") option = "Descending Rate Score";
            else option = "Ascending Rate Score";
        }
        courses = await Methods.CourseSortAs(
            courses,
            attri,
            parseInt(req.query[attri])
        );
        for (const e of courses) {
            let index = courses.indexOf(e);
            const teacher = await Methods.getCourseLecturer(e.id);
            courses[index].owner = teacher;
            const cate = await Methods.GetCateName(e.id);
            courses[index].category = cate;
            courses[index].starArr = GetStarArr(courses[index].score);
        }
        courses = GetPagination(courses);
        res.render("product-list", {
            categories,
            courses,
            option,
            host,
            role: req.isAuthenticated() ? req.user.role : null,
            user: req.isAuthenticated() ? req.user : null,
        });
    }
});

router.post("/course-list", async (req, res) => {
    if (req.body.searchValue) {
        return res.redirect(
            "/course-list?searchValue=" + req.body.searchValue + "&score=-1"
        );
    }
});

router.get("/logout", async (req, res) => {
    req.logOut();
    return res.redirect("/login");
});

router.get("*", (req, res) => {
    res.render("error", {
        title: "404 NOT FOUND!",
        error:
            "The page you are trying to connect does not exist or you are not authorized to access!",
    });
});

const GetStarArr = (score) => {
    if (score - Math.floor(score) >= 0.25) score = Math.floor(score) + 0.5;
    else score = Math.floor(score);
    let starList = [];
    for (let i = 0; i < Math.floor(score); i++) starList.push("fa-star");
    if (Math.floor(score) !== score) starList.push("fa-star-half-full");
    for (let i = 0; i < 5 - Math.ceil(score); i++) starList.push("fa-star-o");
    return starList;
};

function getRandomInt(min, max) {
    min = Math.ceil(min);
    max = Math.floor(max);
    return Math.floor(Math.random() * (max - min) + min); //The maximum is exclusive and the minimum is inclusive
}

const GetPagination = (courses) => {
    let listPageCourses = [];
    let len = courses.length;
    let count = Math.floor(len / 4);
    for (let i = 0; i < count; i++)
        listPageCourses.push({id: i + 1, data: courses.slice(i * 4, i * 4 + 4)});
    if (len % 4 !== 0) {
        listPageCourses.push({id: count + 1, data: courses.slice(count * 4)});
        count++;
    }
    return listPageCourses;
};
module.exports = router;
