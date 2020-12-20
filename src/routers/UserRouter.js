const express = require("express");
const Students = require("../models/student");
const Admin = require("../models/admin")
const Teachers = require("../models/teacher")

const passport = require("passport")
const initializePassport = require("../middleware/passport")

initializePassport(
    passport,
    async (email,password)=>{
        var user = await Teachers.findOne({email,password})
        if(user!=null) return user
        user = await Students.findOne({email,password})
        if(user!=null) return user
        user = await Admin.findOne({email,password})
        if(user!=null) return user
    },
    async (id,role)=>{
        if(role=="Teacher"){
            return Teachers.findById(id)
        }
        if(role =="Student"){
            return Students.findById(id)
        }
        if(role=="Administrator"){
            return Admin.findById(id)
        }
    }
)
const router = new express.Router();

router.get("/", async (req, res) => {

    console.log(req.user)
    res.render("index")
})

router.get("/login", async (req, res) => {
    if(req.isAuthenticated()){
        return res.redirect("/")
    }
    res.render("login2")
})

router.post("/login",passport.authenticate('local',{
    successRedirect:"/",
    failureRedirect:"/login",
    failureFlash: true
}))

router.get("/cart", async (req, res) => {
    console.log(req.user)
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

router.get('/logout',async(req,res)=>{
    req.logOut()
    return res.redirect("/login")
})

module.exports = router