const express = require("express");
const Students = require("../models/student");
const Admin = require("../models/admin");
const Teachers = require("../models/teacher");
const Courses = require("../models/course")
const Methods = require("./Methods")

const passport = require("passport");
const check = require("../middleware/middleware");
const Category = require("../models/category");

const router = new express.Router();

router.get("/", async (req, res) => {
    const courses = await Courses.find();
    for (const e of courses) {
        let index = courses.indexOf(e);
        const teacher = await Methods.getCourseLecturer(e.id);
        courses[index].owner = teacher;
        const cate = await Methods.GetCateName(e.id)
        courses[index].category = cate
        courses[index].starArr = GetStarArr(courses[index].score)
    }

    let featuredCourses = JSON.parse(JSON.stringify(courses));
    featuredCourses = featuredCourses.filter((e) => new Date(e.createdAt).getTime() + 604800000 >= Date.now())
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
    if (featuredCourses.length > 4) {
        featuredCourses = featuredCourses.slice(0, 4)
    }
    if (mostViewCourses.length > 10) {
        mostViewCourses = mostViewCourses.slice(0, 10)
    }
    if (newestCourses.length > 10) {
        newestCourses = newestCourses.slice(0, 10)
    }
    for (const e of featuredCourses) {
        let index = featuredCourses.indexOf(e);
        featuredCourses[index].starArr = GetStarArr(featuredCourses[index].score)
    }
    for (const e of mostViewCourses) {
        let index = mostViewCourses.indexOf(e);
        mostViewCourses[index].starArr = GetStarArr(mostViewCourses[index].score)
    }
    for (const e of newestCourses) {
        let index = newestCourses.indexOf(e);
        newestCourses[index].starArr = GetStarArr(newestCourses[index].score)
    }
    const categories = await Category.find({})
    if (req.isAuthenticated()) {
        res.render("index", {
            categories,
            featuredCourses,
            mostViewCourses,
            newestCourses,
            role: req.user.role,
            user: req.user
        });
    } else {
        res.render("index", {
            categories,
            featuredCourses,
            mostViewCourses,
            newestCourses
        });
    }
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
    } else {
        res.render("profile", {
            name: req.user.name,
            mobile: req.user.phoneNumber,
            email: req.user.email,
            role: req.user.role,
            user: req.user
        });
    }
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
    const categories = await Category.find({})
    const CourseID = req.query.id;
    res.cookie("CourseID", CourseID)
    const course = await Courses.findById(CourseID);
    let reviewList = await Methods.ShowReviewList(CourseID)
    for (let e of reviewList) {
        const index = reviewList.indexOf(e)
        const StudentComment = await Methods.getStudentSpecs(e.id)
        reviewList[index] = StudentComment
    }
    for (let i = 0; i < reviewList.length; i++) {
        let temp = JSON.parse(JSON.stringify(reviewList[i]))
        temp.Star = GetStarArr(temp.Star)
        temp.date = new Date(temp.updatedAt).toLocaleDateString()
        reviewList[i] = temp
    }
    console.log("reviewlist", reviewList)
    var time = new Date(course.updatedAt);
    course.date = course.updatedAt.toLocaleDateString()
    course.number_of_student = course.number_of_student.toLocaleString()
    course.starArr = GetStarArr(course.score)
    await course.populate("owner").execPopulate()
    await course.populate("category").execPopulate()
    course.relatedCourses = await Methods.GetRelatedCourses(course.category)
    let index = course.relatedCourses.findIndex((e) => e._id.toString() === course._id.toString())
    course.relatedCourses.splice(index, 1);
    if (course.relatedCourses.length > 5) {
        course.relatedCourses = course.relatedCourses.slice(0, 5)
    }
    for (let index = 0; index < course.relatedCourses.length; index++) {
        course.relatedCourses[index].starArr = GetStarArr(course.relatedCourses[index].score)
        await course.relatedCourses[index].populate("owner").execPopulate()
        await course.relatedCourses[index].populate("category").execPopulate()
    }
    if (req.isAuthenticated()) {

        const isCommented = await Methods.isReviewed(req.user.id, CourseID)
        const isLiked = await Methods.isLiked(req.user.id, CourseID)
        const isRegistered = await Methods.isRegistered(req.user.id, CourseID)
        if (isCommented) {
            await isCommented.populate("owner").execPopulate()
            const date = isCommented.createdAt.toString().split("T")[0]
            const userStar = []
            for (let i = 0; i < isCommented.Star; i++) {
                userStar.push("fa-star");
            }
            res.render("product-detail", {
                course,
                reviewList,
                isCommented,
                userStar,
                date,
                isLiked,
                isRegistered,
                categories,
                role: req.user.role,
                user: req.user
            });
        } else {
            res.render("product-detail", {
                course,
                reviewList,
                isCommented: null,
                isLiked,
                isRegistered,
                categories
            });
        }
    } else {
        res.render("product-detail", {course, reviewList, isCommented: null, categories});
    }
});


router.get("/register-course", check.CheckAuthenticated, async (req, res) => {
    try {
        const student = req.user
        const CourseID = req.cookies['CourseID']
        await Methods.registerCourse(student.id, CourseID)
        const check = Methods.isRegistered(student.id, CourseID)
        return res.redirect("/product-detail/?id=" + CourseID.toString())
    } catch (e) {
        res.send(e)
    }
})

router.get("/watchlist", check.CheckAuthenticated, async (req, res) => {
    try {
        const student = req.user
        const courses = await Methods.ShowWatchList(student)
        for (let index = 0; index < courses.length; index++)
            await courses[index].populate("owner").execPopulate()
        res.render("watchlist", {
            courses, role: req.user.role,
            user: req.user
        })
    } catch (e) {
        res.send(e)
    }
})

router.get("/add-watchlist", check.CheckAuthenticated, async (req, res) => {
    try {
        const student = req.user
        const CourseID = req.cookies['CourseID']
        await Methods.addtCourseToWatchList(student.id, CourseID)
        const check = Methods.isLiked(student.id, CourseID)
        return res.redirect("/product-detail/?id=" + CourseID)
    } catch (e) {
        res.send(e)
    }
})

router.get("/courses-registered", check.CheckAuthenticated, async (req, res) => {
    try {
        const student = req.user
        const courses = await Methods.getCoursesRegistered(student)
        for (let index = 0; index < courses.length; index++)
            await courses[index].populate("owner").execPopulate()
        res.render("registeredCourses", {
            courses, role: req.user.role,
            user: req.user
        })
    } catch (e) {
        res.send(e)
    }
})

router.get("/remove-watchlist", check.CheckAuthenticated, async (req, res) => {
    try {
        const student = req.user
        const CourseID = req.cookies['CourseID']
        await Methods.RemoveCourseFromWatchList(student.id, CourseID)
        const check = Methods.isLiked(student.id, CourseID)
        return res.redirect("/product-detail/?id=" + CourseID)
    } catch (e) {
        res.send(e)
    }
})

router.get("/remove-watchlist/:id", check.CheckAuthenticated, async (req, res) => {
    try {
        const student = req.user
        const CourseID = req.params.id;
        await Methods.RemoveCourseFromWatchList(student.id, CourseID)
        const check = Methods.isLiked(student.id, CourseID)
        return res.redirect("/watchlist")
    } catch (e) {
        res.send(e)
    }
})

router.post("/add-review", check.CheckAuthenticated, async (req, res) => {
    try {
        const student = req.user
        const CourseID = req.cookies['CourseID']
        await Methods.AddCourseReview(req.body.review_content, parseInt(req.body.num_star), student.id, CourseID)
        return res.redirect("/product-detail/?id=" + CourseID)
    } catch (e) {
        res.send(e)
    }
})
router.get("/course-list", async (req, res) => {
    const categories = await Category.find({})
    let option = ""
    let host = req.originalUrl;
    if (req.query.sortPrice) {
        host = host.split("?")[0] + "?";
        let status = null;
        req.query.sortPrice == "1" ? (status = 1, option = "Ascending Price") : (status = -1, option = "Descending Price");
        let courses = await Methods.FetchCourseSortAs("price", status)
        for (const e of courses) {
            let index = courses.indexOf(e);
            const teacher = await Methods.getCourseLecturer(e.id);
            courses[index].owner = teacher;
            const cate = await Methods.GetCateName(e.id)
            courses[index].category = cate
            courses[index].starArr = GetStarArr(courses[index].score)
        }
        courses = GetPagination(courses)
        res.render("product-list", {
            categories,
            courses,
            option,
            host
        });
    } else if (req.query.sortRate) {
        host = host.split("?")[0] + "?";
        let status = null;
        req.query.sortRate == "1" ? (status = 1, option = "Ascending Rate Score") : (status = -1, option = "Descending Rate Score");
        let courses = await Methods.FetchCourseSortAs("score", status)
        for (const e of courses) {
            let index = courses.indexOf(e);
            const teacher = await Methods.getCourseLecturer(e.id);
            courses[index].owner = teacher;
            const cate = await Methods.GetCateName(e.id)
            courses[index].category = cate
            courses[index].starArr = GetStarArr(courses[index].score)
        }
        courses = GetPagination(courses)
        res.render("product-list", {
            categories,
            courses,
            option,
            host
        });
    } else if (req.query.searchValue) {
        host = host.split("&")[0] + "&";
        console.log("Host", host)
        var courses = await Methods.searchCourseFullText(req.query.searchValue)
        var attri = null
        req.query.price ? (attri = "price") : (attri = "score")
        if (attri === "price") {
            if (req.query[attri] == "-1")
                option = "Descending Price";
            else
                option = "Ascending Price";
        } else {
            if (req.query[attri] == "-1")
                option = "Descending Rate Score";
            else
                option = "Ascending Rate Score";
        }
        courses = await Methods.CourseSortAs(courses, "price", parseInt(req.query[attri]))
        if (courses.length === 0) {
            courses = null;
        } else {
            for (const e of courses) {
                let index = courses.indexOf(e);
                const teacher = await Methods.getCourseLecturer(e.id);
                courses[index].owner = teacher;
                const cate = await Methods.GetCateName(e.id)
                courses[index].category = cate
                courses[index].starArr = GetStarArr(courses[index].score)
            }

            courses = GetPagination(courses)
        }
        res.render("product-list", {
            categories,
            courses,
            option,
            host
        });
    } else if (req.query.categoryName) {
        let courses = await Methods.FetchCourseByCateName(req.query.categoryName)
        host = host.split("&")[0] + "&";
        console.log("Host", host)
        var attri = null
        req.query.price ? (attri = "price") : (attri = "score")
        if (attri === "price") {
            if (req.query[attri] == "-1")
                option = "Descending Price";
            else
                option = "Ascending Price";
        } else {
            if (req.query[attri] == "-1")
                option = "Descending Rate Score";
            else
                option = "Ascending Rate Score";
        }
        courses = await Methods.CourseSortAs(courses, "price", parseInt(req.query[attri]))
        for (const e of courses) {
            let index = courses.indexOf(e);
            const teacher = await Methods.getCourseLecturer(e.id);
            courses[index].owner = teacher;
            const cate = await Methods.GetCateName(e.id)
            courses[index].category = cate
            courses[index].starArr = GetStarArr(courses[index].score)
        }
        courses = GetPagination(courses)
        res.render("product-list", {
            categories,
            courses,
            option,
            host
        });
    } else {
        host = host.split("?")[0] + "?";
        console.log("Host", host)
        let courses = await Courses.find();
        var attri = null
        req.query.price ? (attri = "price") : (attri = "score")
        if (attri === "price") {
            if (req.query[attri] == "-1")
                option = "Descending Price";
            else
                option = "Ascending Price";
        } else {
            if (req.query[attri] == "-1")
                option = "Descending Rate Score";
            else
                option = "Ascending Rate Score";
        }
        courses = await Methods.CourseSortAs(courses, "price", parseInt(req.query[attri]))
        for (const e of courses) {
            let index = courses.indexOf(e);
            const teacher = await Methods.getCourseLecturer(e.id);
            courses[index].owner = teacher
            const cate = await Methods.GetCateName(e.id)
            courses[index].category = cate
            courses[index].starArr = GetStarArr(courses[index].score)
        }
        courses = GetPagination(courses)
        res.render("product-list", {
            categories,
            courses,
            option,
            host
        });
    }
});

router.post("course-list", async (req, res) => {
    if (req.body.searchValue) {
        return res.redirect("/course-list?searchValue=" + req.body.searchValue + "&score=-1")
    }
})

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


const GetStarArr = (score) => {
    if (score - Math.floor(score) >= 0.25)
        score = Math.floor(score) + 0.5
    else score = Math.floor(score)
    let starList = []
    for (let i = 0; i < Math.floor(score); i++)
        starList.push("fa-star");
    if (Math.floor(score) !== score)
        starList.push("fa-star-half-full");
    for (let i = 0; i < 5 - Math.ceil(score); i++)
        starList.push("fa-star-o");
    return starList;
}

const GetPagination = (courses) => {
    let listPageCourses = [];
    let len = courses.length;
    let count = Math.floor(len / 4);
    for (let i = 0; i < count; i++)
        listPageCourses.push({id: i + 1, data: courses.slice(i * 4, i * 4 + 4)})
    if (len % 4 !== 0) {
        listPageCourses.push({id: count + 1, data: courses.slice(count * 4)})
        count++
    }
    return listPageCourses
}
module.exports = router
