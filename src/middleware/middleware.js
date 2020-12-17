

const CheckAuthenticated = (req,res,next) =>{
    if(req.isAuthenticated()){
        return next()
    }
    return res.redirect("/login")
}
