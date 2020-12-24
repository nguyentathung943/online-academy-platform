const express = require("express");
const Students = require("../models/student");
const Admin = require("../models/admin");
const Teachers = require("../models/teacher");
const bcrypt = require("bcrypt")
const multer = require("multer")
const sharp = require("sharp")
const passport = require("passport");
const initializePassport = require("../middleware/passport");
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
initializePassport(
    passport,
    async (email, password) => {
        try{
            var user = await Teachers.findOne({emFail});
            if (user){
                var Valid = await bcrypt.compare(password,user.password)
                if(Valid){
                    return user
                }
            }
            user = await Students.findOne({email});
            if (user){
                var Valid = await bcrypt.compare(password,user.password)
                if(Valid){
                    return user
                }
            }
            user = await Admin.findOne({email});
            if (user){
                var Valid = await bcrypt.compare(password,user.password)
                if(Valid){
                    return user
                }
            }
        }catch (e){
            return null
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
    console.log(req.user)
    res.render("index")
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
    if(!req.isAuthenticated()){
        return res.redirect("/login")
    }
    res.render("profile",{
        name: req.user.name,
        mobile: req.user.phoneNumber,
        email: req.user.email
    });
});

router.post("/profile", async(req,res)=>{
    try{
    console.log(typeof (req.body.password))
        if(req.body.o_password.length == 0){
            console.log(1)
            const user = req.user
            user.email = req.body.email
            user.phoneNumber = req.body.phoneNumber
            user.name = req.body.name
            await user.save()
            res.render("profile",{
                name: req.user.name,
                mobile: req.user.phoneNumber,
                email: req.user.email,
                success_message:"Information saved"
            })
        }
        else{
            console.log(2)
            const user = req.user
            if(req.body.o_password!==user.password){
                res.render("profile",{
                    name: req.user.name,
                    mobile: req.user.phoneNumber,
                    email: req.user.email,
                    error_message:"Wrong password!"
                })
            }
            else if(req.body.new_password!==req.body.confirm_password){
                res.render("profile",{
                    name: req.user.name,
                    mobile: req.user.phoneNumber,
                    email: req.user.email,
                    error_message:"Confirm password does not match!"
                })
            }
            else if(req.body.new_password==="" || req.body.confirm_password===""){
                res.render("profile",{
                    name: req.user.name,
                    mobile: req.user.phoneNumber,
                    email: req.user.email,
                    error_message:"New password can not be blank"
                })
            }
            else if((req.body.o_password===user.password) && (req.body.new_password===req.body.confirm_password)){
                user.password = req.body.new_password;
                await user.save()
                res.render("profile",{
                    name: req.user.name,
                    mobile: req.user.phoneNumber,
                    email: req.user.email,
                    success_message:"Information saved"
                })
            }
        }
    }catch(e){
        res.send(e)
    }

})

router.get("/register", async (req, res) => {
    res.render("register");
});

router.post("/register", async (req, res) => {
    try{
        if(req.body.password===req.body.confirmPassword){
            const student = new Students({
                name: req.body.name,
                email: req.body.email,
                phoneNumber: req.body.phone,
                password: req.body.password,
            })
            await student.save();
            res.render("register",{
                success_message: "Account created successfully"
            })
        }
        else{
            res.render("register",{
                fail_message: "Confirm password does not match"
            })
        }
    }catch(e){
        res.send(e)
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
    res.render("product-detail");
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
