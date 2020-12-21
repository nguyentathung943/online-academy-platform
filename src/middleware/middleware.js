const CheckAuthenticated = (req,res,next) =>{
    if(req.isAuthenticated()){
        return next()
    }
    return res.redirect("/login")
}

const checkAdmin = (req,res,next) =>{
    if((req.isAuthenticated()) && (req.user.role = "Administrator")){
        return next()
    }
    return res.redirect("*")
}

const checkTeacher = (req,res,next) =>{
    if((req.isAuthenticated()) && (req.user.role = "Teacher")){
        return next()
    }
    return res.redirect("*")
}

modules.exports = {
    CheckAuthenticated,
    checkAdmin,
    checkTeacher
}