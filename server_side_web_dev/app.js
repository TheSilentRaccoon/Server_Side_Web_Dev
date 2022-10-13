//Maksims Kazoha || R00188979
//Here we set everything that we will be using to create a login auth page.
const express = require("express");
var bodyParser = require("body-parser");
var cookieParser = require("cookie-parser");
var session = require("express-session");
var morgan = require("morgan");
const app = express();
const User = require('./models/User');
//we set the port as 3000 and put it into a variable
app.set("port", 3000);

app.use(morgan("dev"));
//body-parser coverts the data into json so it can be used in the database
app.use(bodyParser.urlencoded({extended:true}));
//we make a cookie
app.use(cookieParser());
//we make a seesion
app.use(session({
    name:'session_id',
    secret:"12345-67890-09876-54321",
    saveUninitialized: false,
    resave:false,
    cookie:{expires:600000},//we make the cookie to expire in 6 days 
}));

app.use((req, res, next) => {
    if (req.cookies.session_id && !req.session.user) {
      res.clearCookie("session_id");//we check if the user isnt logged in
    }
    next();
});



var checkingSession = (req, res, next)=>{//we check if the user is logged in.
    if(req.session.user && req.cookies.session_id){
        res.redirect('/home')
    }else{
        next();
    }
};

app.get('/', checkingSession, (req, res)=>{//if the user is logged in he can access the '/' route and is sent to home page.
    res.redirect('/home');
});

app.route('/login').get(checkingSession, (req, res)=>{
    res.sendFile(__dirname + '/public/login.html');//if user is not logged in he can access this page, if he is logged in he cant.
})
.post(async (req, res) => {
    var username = req.body.username //we get the username and store it in a variable
    var password = req.body.password //we get the password and store it in a variable
    try{
        var role = await User.find({username: username, userType : "admin" }).count();// we check if a user with a admin role exist
        var user = await User.findOne({ username: username }).exec();// we check if the user exists
        
        if(!user) {
            res.redirect("/login");//if user wasnt found he is sent back to the login page
        }
        user.comparePassword(password, (error, match) => {
            if(!match) {
              res.redirect("/login");//if password doesnt match then the user is sent to the login page again
            }
        });
        if(role === 1){// if the user was found with the role of admin he is set as req.session.admin giving him powers to use admin pages
            req.session.admin = user
        }
        req.session.user = user;// else the user is basic and has no admin powers
        console.log(user)
        console.log(role)
        if (req.session.user && req.session.admin){//we check if the user is logged in and has admin powers and has a session id
            res.redirect("/admin")
        }else{
            res.redirect("/home");//if hes a basic user he is sent to home page
        }
    } catch (error) {
        console.log(error)// in case any error happens
    }
});

app.route('/register').get(async(req, res)=>{
    if(req.session.user && req.cookies.session_id && req.session.admin){//we check if the user is admin
        res.sendFile(__dirname + '/admin/register.html')
    } else {// if not admin back to home you go
        res.redirect("/home");
    }
})
.post(async (req, res)=>{
    var user = new User({
        username: req.body.username,
        userType: req.body.userType,
        password: req.body.password
    })//here we use the user schema to create a new user
    user.save((err,docs) =>{//we save the informatio
        if(err){
            res.redirect('/register')//if the user exists sent back to register
        }else{
            console.log(docs)//the saved information is sent away
            req.session.user = docs
            res.redirect('/admin')//admin is then sent back to admin home page
        }
    });
});

app.route('/update').get((req, res)=>{
    if(req.session.user && req.cookies.session_id && req.session.admin){//we check if the user is admin
        res.sendFile(__dirname + '/admin/update.html')// this sends us to the update page so we can update a username
    } else {
        res.redirect("/admin");
    }
})


.post(function(req, res){
    var myquery = { username: req.body.username };//we find the name we want to change
    var newvalues = { $set: {username: req.body.newname } };//we find the new name that will be used
    User.updateOne(myquery, newvalues, function(err, res) {//we send it to the database
    if (err) throw err;
    console.log("1 Username updated");//tells us the admin that the server has update the name
    })
    res.redirect("/admin")//send us back to home page
});
/*
app.route('/updatePassword').get((req, res)=>{
    if(req.session.user && req.cookies.session_id){
        res.sendFile(__dirname + '/admin/updatePassword.html')
    } else {
        res.redirect("/admin");
    }
})                                              Due to errors and limited time this option is still in development
                                                user name was set to null so this create problems with the database
                                                                    setting the user as null
.post(function(req, res){
    var myquery = { username: req.body.username, password: req.body.password };
    var newvalues = { $set: {password: req.body.newpass } };
    User.updateOne(myquery, newvalues, function(err, res) {
    if (err) throw err;
    console.log("1 Password updated");
    })
    res.redirect("/admin")
});
*/

app.route('/delete').get((req, res)=>{
    if(req.session.user && req.cookies.session_id && req.session.admin){//we check if the user is admin
        res.sendFile(__dirname + '/admin/delete.html')//this send us to the delete page for removing users from the database
    } else {
        res.redirect("/home");//if not admin you are sent to the home page
    }
})
.post(function(req, res){
    var myquery = { username: req.body.username };//we find the username we cant to delete from the website
    User.deleteOne(myquery, function(err, obj) {//we send the request to the database
      if (err) throw err;
      console.log("1 document deleted");//the database/server tells us that it has removed a user from the database
    })
    res.redirect("/admin")
});

app.get("/delete", (req, res)=>{
    if(req.session.user && req.cookies.session_id && req.session.admin){//we check if the user is admin
        res.sendFile(__dirname + "/admin/detele.html");
    }else{
        res.redirect("/admin");
    }
});


app.get("/update", (req, res)=>{
    if(req.session.user && req.cookies.session_id && req.session.admin){//we check if the user is admin
        res.sendFile(__dirname + "/admin/update.html");
    }else{
        res.redirect("/admin");
    }
});
/*
app.get("/updatePassword", (req, res)=>{
    if(req.session.user && req.cookies.session_id){
        res.sendFile(__dirname + "/admin/updatePassword.html");
    }else{
        res.redirect("/admin"); Due to errors and limited time this option is still in development
    }
})
*/
app.get("/contact", (req, res)=>{
    res.sendFile(__dirname + "/public/contact.html");// here we allow guest users to see who can they contact to gain access to the system
});


app.get("/admin", (req, res) => {
    if (req.session.user && req.cookies.session_id && req.session.admin) {//we check if the user is admin
        res.sendFile(__dirname + "/admin/admin.html");
    }else{
        res.redirect("/home");
    }
});

app.get("/about", (req, res) => {
    if(req.session.user && req.cookies.session_id){//availbe to admins and basic users
        res.sendFile(__dirname + "/public/about.html");
    }else{
        res.redirect("/home");
    }
});

app.get("/logout", (req, res) => {
    if (req.session.user && req.cookies.session_id) {//availabe to admins and basic users
        res.clearCookie("session_id");
        res.redirect("/");
    } else {
        res.redirect("/home");
    }
});

app.get("/help", (req, res)=>{
    res.sendFile(__dirname + "/public/help.html");//available for all
});

app.get("/home", (req, res)=>{
    res.sendFile(__dirname + "/public/home.html");//available for all
});

app.use(function (req, res, next) {
    res.status(404).send("Sorry can't find that path!");//if a user tries to access a page that is down or doesnt exist
});

app.listen(app.get("port"), () =>
  console.log(`App started on port ${app.get("port")}`)//the sever is listening on a set port.
);