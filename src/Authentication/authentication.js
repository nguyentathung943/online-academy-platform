const Students = require("../models/student");
const Admin = require("../models/admin");
const Teachers = require("../models/teacher");
const passport = require("passport")
const bcrypt = require("bcrypt")
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

