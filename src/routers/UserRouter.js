const express = require("express");
const Students = require("../models/student");
const Admin = require("../models/admin")
const Teachers = require("../models/teacher")

const router = new express.Router();

router.get("/", async (req, res) => {
    res.render("index")
})

router.get("/cart", async (req, res) => {
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

router.get("/login", async (req, res) => {
    res.render("login")
})

module.exports = router