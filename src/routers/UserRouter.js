const express = require("express");
const Students = require("../models/student");
const Admin = require("../models/admin")
const Teachers = require("../models/teacher")

const router = new express.Router();

router.get("/", async (req, res) => {
    res.render("index")
})

router.get("/login", async (req, res) => {
    res.render("login")
})
module.exports = router