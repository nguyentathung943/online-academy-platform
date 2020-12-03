const express = require("express");
const Users = require("../models/user");
const router = new express.Router();

router.get("/", async (req,res)=>{
    res.send("hello")
})

module.exports = router