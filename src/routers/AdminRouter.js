const express = require("express");
const Admin = require("../models/admin");
const Students = require("../models/student");
const Teachers = require("../models/teacher");
const Cate = require("../models/category")
const router = new express.Router();
const Courses = require("../models/course");
const Authen = require("../middleware/middleware")
const Methods = require("./Methods")
const Chapter = require("../models/chapter")
const SessionVideos = require("../models/sessionvideos");
const Category = require("../models/category");

const Validate = require("../middleware/middleware")
//ADD CATEGORY
router.post("/admin/add-category", async (req, res) => {
  const cate = new Cate({
    name: req.body.cateName
  })
  await cate.save()
  res.send(cate)
})


router.get("/admin/courses-management",Validate.checkAdmin, async (req, res) => {
  const courses = await Courses.find();
  for (const e of courses) {
    let index = courses.indexOf(e);
    const teacher = await Methods.getCourseLecturer(e.id);
    courses[index].owner = teacher;
    const cate = await Methods.GetCateName(e.id)
    courses[index].category = cate
  }
  const categories = await Cate.find({})
  res.render("manage-courses", {
    courses,
    categories,
    role: req.user.role,
    user: req.user
  });

});

router.post("/admin/courses-management", async (req, res) => {
  console.log(req.body);
  if (req.body.action == "remove_course"){
    console.log("Pass");
    await Methods.DeleteCourse(req.body.courseIdInput);
  }
  else if (req.body.action == "block_course"){
    const course = await Courses.findById(req.body.courseIdInput);
    course.isBlocked = true;
    await course.save();
  }
  else if (req.body.action == "unblock_course"){
    const course = await Courses.findById(req.body.courseIdInput);
    course.isBlocked = false;
    await course.save();
  }
  return res.redirect("/admin/courses-management");

});

router.get("/admin/categories-management",Validate.checkAdmin, async (req, res) => {
  const categories = await Category.find();
  const hasCourses = [];
  for (const cate of categories) {
    const course = await Methods.FetchCourseByCateName(cate.name);
    if (course.length != 0)
      hasCourses.push(true);
    else hasCourses.push(false);
  }
  res.render("manage-categories", {
    categories, hasCourses,
    role: req.user.role,
    user: req.user
  });

});
router.post("/admin/categories-management", async (req, res) => {
  console.log(req.body);
  if (req.body.action == "add_category") {
    const cates = await Category.find();
    const existed = false;
    for (let index = 0; index < cates.length; index++) {
        const cate = cates[index];
        if (cate.name == req.body.CategoryNameInput){
            existed = true;
            break;
        }
    }
    if (!existed) {
      const cate = new Category({
        name: req.body.CategoryNameInput
      });
      await cate.save();
      
    }
  }
  else if (req.body.action == "remove_cate") {
    const cate = await Category.findById(req.body.CateIdInput);
    await cate.delete();
  }
  else if (req.body.action == "edit_category_name"){
    const cate = await Category.findById(req.body.CateIdInput);
    cate.name = req.body.newCategoryNameInput;
    await cate.save();
  }
  return res.redirect("/admin/categories-management");
});
router.get("/admin/users-management",Validate.checkAdmin, async (req, res) => {
  const teachers = await Teachers.find();
  const students = await Students.find();

  res.render("manage-users", {
    teachers,
    students,
    role: req.user.role,
    user: req.user
  });

});
router.post("/admin/users-management", async (req, res) => {
  console.log(req.body);
  if (req.body.action == "edit_user_detail") {
    if (req.body.UserRoleInput == "Teacher") {
      const teacher = await Teachers.findById(req.body.UserIdInput);
      teacher.name = req.body.UserNameInput;
      teacher.phoneNumber = req.body.PhoneInput;
      teacher.email = req.body.EmailInput;
      if (req.body.ResetPasswordInput.length != 0) {
        teacher.password = req.body.ResetPasswordInput;
      }
      await teacher.save();
    }
    else {
      const student = await Students.findById(req.body.UserIdInput);
      student.name = req.body.UserNameInput;
      student.phoneNumber = req.body.PhoneInput;
      student.email = req.body.EmailInput;
      if (req.body.ResetPasswordInput.length != 0) {
        student.password = req.body.ResetPasswordInput;
      }
      await student.save();
    }
    console.log("Pass edit action");
  }
  else if (req.body.action == "add_teacher") {
    const teacher = new Teachers({
      name: req.body.TeacherNameInput,
      email: req.body.TeacherEmailInput,
      phoneNumber: req.body.TeacherPhoneInput,
      password: req.body.TeacherPasswordInput,
    });
    await teacher.save();
    console.log("Pass add action");
  }
  else if (req.body.action == "remove_user") {
    if (req.body.UserRoleInput == "Teacher") {
      const teacher = await Teachers.findById(req.body.UserIdInput);
      await teacher.delete();
    }
    else {
      const student = await Students.findById(req.body.UserIdInput);
      await student.delete();
    }
  } else if (req.body.action == "block_user"){
    if (req.body.UserRoleInput == "Teacher") {
      const teacher = await Teachers.findById(req.body.UserIdInput);
      teacher.isBlocked = true;
      const courses = await Methods.getCoursesOwned(req.body.UserIdInput);
      for (let index = 0; index < courses.length; index++) {
        const course = courses[index];
        course.isBlocked = true;
        await course.save();
        
      }
      await teacher.save();

    }
    else {
      const student = await Students.findById(req.body.UserIdInput);
      student.isBlocked = true;
      await student.save();
    }
  }
  else if (req.body.action == "unblock_user"){
    if (req.body.UserRoleInput == "Teacher") {
      const teacher = await Teachers.findById(req.body.UserIdInput);
      teacher.isBlocked = false;
      const courses = await Methods.getCoursesOwned(req.body.UserIdInput);
      for (let index = 0; index < courses.length; index++) {
        const course = courses[index];
        course.isBlocked = false;
        await course.save();
        
      }
      await teacher.save();
    }
    else {
      const student = await Students.findById(req.body.UserIdInput);
      student.isBlocked = false;
      await student.save();
    }
  }
  return res.redirect("/admin/users-management");
});

router.post("/admin/view-course", async (req, res) => {

  const CourseID = req.cookies['CourseID'];
  console.log(req.body);
  console.log(req.body.action);
  if (req.body.action == "course_detail") {
    // Update course's detail
    let ava = null
    if (req.body.avatarInput !== '') {
      ava = req.body.avatarInput
    }
    await Methods.UpdateCourseDetail(CourseID.toString(), ava, req.body.courseNameInput, req.body.briefDescriptionInput, req.body.priceInput, req.body.statusInput);
    console.log("Pass course detail");
  }
  else if (req.body.action == "course_description") {
    // Update main description
    const NewDesc = req.body.desc;
    await Methods.UpdateDescription(CourseID.toString(), NewDesc);
    console.log("Pass course desc");
  }
  else if (req.body.action == "add_session") {
    // Add session
    await Methods.AddChapter(CourseID, req.body.sessionNameInput);
    console.log("Pass add session");
  }
  else if (req.body.action == "remove_session") {
    await Methods.DeleteChapter(req.body.sessionIdInput);
    console.log("Pass remove session");
  }
  else if (req.body.action == "change_session_name") {
    var chapter = await Methods.getChapterSpecs(req.body.ChapterIdInput2);
    chapter.name = req.body.changeSessionNameInput;
    await chapter.save();
  }
  else if (req.body.action == "add_video") {
    await Methods.AddVideo(req.body.ChapterIdInput, req.body.VideoNameInput, req.body.url);
  }
  else if(req.body.action=="remove_video"){
    await Methods.DeleteVideo(req.body.VideoIdInput)
  }else if(req.body.action=="change_video_name"){
    const video = await Videos.findById(req.body.VideoIdInput)
    video.name = req.body.changeVideoNameInput
    await video.save()
  }
  return res.redirect("/admin/view-course?id=" + CourseID.toString());
})

router.get("/admin/view-course",Validate.checkAdmin, async (req, res) => {
  const categories = await Cate.find({})
  const CourseID = req.query.id;
  res.cookie("CourseID", CourseID)
  const course = await Courses.findById(CourseID);
  if (!course.isBlocked){
    const chapters = await Methods.viewChapterList(CourseID);

    // Check
    const videolist = await SessionVideos.getbyCourseID(CourseID);
    res.render("viewCourse", { course, categories, chapters, videolist,
      role: req.user.role,
      user: req.user });
  }
  else {
    const error ="Cannot access to this course!";
    res.render("error",{error});
  }
  

});

router.get("/admin/course-list",Validate.checkAdmin, async (req, res) => {
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
      res.render("course-list", {
          categories,
          courses,
          option,
          host,
          role: req.user.role,
          user: req.user
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
      res.render("course-list", {
          categories,
          courses,
          option,
          host,
          role: req.user.role,
          user: req.user
      });
  } else if (req.query.searchValue) {
      host = host.split("&")[0] + "&";
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
      res.render("course-list", {
          categories,
          courses,
          option,
          host,
          role: req.user.role,
          user: req.user
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
      res.render("course-list", {
          categories,
          courses,
          option,
          host,
          role: req.user.role,
          user: req.user
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
      res.render("course-list", {
          categories,
          courses,
          option,
          host,
          role: req.user.role,
          user: req.user
      });
  }
});

router.post("/admin/course-list", async (req, res) => {
  if (req.body.searchValue) {
      return res.redirect("/admin/course-list?searchValue=" + req.body.searchValue + "&score=-1")
  }
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

module.exports = router;