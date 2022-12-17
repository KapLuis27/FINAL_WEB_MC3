require('dotenv').config();
const express = require ('express');
const bodyParser =  require('body-parser');
const app = express ();
const path = require('path');
const ejs = require('ejs');
const mongoose = require ('mongoose');
const session = require('express-session');
const passport = require('passport');
const passportLocalMongoose = require('passport-local-mongoose');

const homeStartingContent = "Good luck on your Final Exam. Merry Christmas and Happy New Year to Everyone!";
const aboutContent = "Good luck on your Final Exam. Merry Christmas and Happy New Year to Everyone!";
const contactContent = "Good luck on your Final Exam.Merry Christmas and Happy New Year to Everyone!";

app.use(bodyParser.urlencoded({extended: true}));
app.use(bodyParser.json()); 
app.use(express.static(path.join(__dirname,'public')));
app.set('view engine', 'ejs');
app.use(session({
    secret: process.env.SECRET,
    resave: false,
    saveUninitialized: false
}));
app.use(passport.initialize());
app.use(passport.session());


mongoose.set('strictQuery', true);
mongoose.connect("mongodb+srv://admin:admin123@cluster0.gjd72yn.mongodb.net/CRUD", {useNewUrlParser: true});

const userSchema = new mongoose.Schema({
    username: String,
    password: String,
});
userSchema.plugin(passportLocalMongoose);
const User = new mongoose.model('User', userSchema);
passport.use(User.createStrategy());
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

const postSchema = new mongoose.Schema({ title: String, content: String }, { timestamps: true });

const Post = mongoose.model("Post", postSchema);



app.get('/', function(req,res){
    res.render('login')
});
app.get('/register', function(req,res){
    res.render('register');
});
app.get('/home', function (req, res){
   
    const posts = Post.find().exec();
    posts.then(function(postsreal){
        res.render('home', {homeStartingContent, postsreal});
    }).catch(function(error){
        console.log(error);
    })
    
    
});

app.get ('/compose', function(req, res){
    res.render('compose');
});

app.post ('/add', function(req, res){
    Post.create({title: req.body.postTitle, content: req.body.postBody});
    res.render('compose');
});

app.get('/readmore/:postID', function(req,res){
    const onepost = Post.findById(req.params.postID).exec();
    
    onepost.then(function(result1){
        let result = result1;
        res.render('post', {result});
    }).catch(function (error){
        console.log(error);
    })
});

app.get ('/edit/:postID', function(req,res){
    let postID = req.params.postID;
    res.render('edit', {postID});
});

app.post("/register", function (req, res) {
    User.register(
      { username: req.body.username },
      req.body.password,
      function (err, user) {
        if (err) {
          console.log(err);
          res.redirect("/register");
        } else {
            console.log('register');
          passport.authenticate("local")(req, res, function () {
            res.redirect("/");
          });
        }
      }
    );
  });

app.post("/login", function (req, res) {
    const user = new User({
      username: req.body.username,
      password: req.body.password,
    });
  
    req.login(user, function (err) {
      if (err) {
        console.log(err);
        res.render('login', {
          username: req.body.username,
          password: req.body.password,
          error : 'Incorrect username/password'
      });
      } else {
        passport.authenticate("local")(req, res, function () {
          res.redirect("/home");
        });
      }
    });
  });
  

app.post ('/updatepost', function (req, res){
    console.log(req.body.postID, req.body.postTitle, req.body.postBody);
    let uncutPostID = req.body.postID;
    let updatedDate = new Date ();
    const post = Post.findByIdAndUpdate(uncutPostID.slice(0,-1),{title: req.body.postTitle, content:req.body.postBody, updatedAt: updatedDate}).exec();

    post.then(function (result){
        console.log(result);
        res.redirect('/');
    }).catch(function(error){
        console.log(error);
    })
});

app.get ('/delete/:postID', function (req,res){
    let postID = req.params.postID;
    const post = Post.findByIdAndDelete(postID).exec();
    post.then(function (result){
        res.redirect('/');
    }).catch(function(error){
        console.log(error);
    });
    res.redirect('/');
});

app.get("/logout", function (req, res) {
    req.logout(function(err){
      if (err){ }
      res.redirect("/");
    });
  });
  

app.get ('/about', function(req, res){
    res.render('about', {aboutContent});
});

app.get ('/contact', function(req, res){
    res.render ('contact', {contactContent});
});
app.listen(process.env.PORT || 3000, err => {
    console.log(`Server running on port 3000`);
  });