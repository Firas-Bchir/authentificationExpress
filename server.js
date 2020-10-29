if (process.env.NODE_ENV !== "production") {
  require("dotenv").config();
}
const express = require("express");
const app = express();
app.use((req, res,next) => {
  next()
})
const bcrypt = require("bcrypt");
const passport = require("passport");
const flash = require("express-flash");
const session = require("express-session");
const methodOverride = require("method-override");

const User = require("./db/users");

const passportLocal = require("./passportLocal");
const passportGoogle = require("./passportGoogle");
const users = [];

passportLocal(passport, User.getUserByEmail, User.getUserById);
passportGoogle(passport, User.findOrCreate);
app.set("view-engine", "ejs");
app.use(express.urlencoded({ extended: false }));
app.use(flash());
app.use(
  session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
  })
);
app.use(passport.initialize());
app.use(passport.session());
app.use(methodOverride("_method"));

app.get("/", checkAuthenticated, (req, res) => {
  res.render("index.ejs", { name: req.user.username });
});
app.get("/login", checkNotAuthenticated, (req, res) => {
  res.render("login.ejs");
});
app.post(
  "/login",
  checkNotAuthenticated,
  passport.authenticate("local", {
    successRedirect: "/",
    failureRedirect: "/login",
    failureFlash: true,
  })
);
app.get("/register", checkNotAuthenticated, (req, res) => {
  res.render("register.ejs");
});
app.post("/register", checkNotAuthenticated, async (req, res) => {
  let { username,email, password } = req.body;
  try {
    user = await User.save({ username,email, password });
    res.send(user);
  } catch (e) {
    console.log(e)
    res.redirect("/register");
  }
  console.log(users);
});
app.delete("/logout", (req, res) => {
  req.logOut();
  res.redirect("/login");
});
// Google
app.get('/auth/google',
  passport.authenticate('google', { scope: ['profile'] }));
app.get('/auth/google/callback', 
  passport.authenticate('google', { failureRedirect: '/login' }),
  function(req, res) {
    res.redirect('/');
  });
//
function checkAuthenticated(req, res, next) {
  if (req.isAuthenticated()) {
    return next();
  }

  return res.redirect("/login");
}
function checkNotAuthenticated(req, res, next) {
  if (req.isAuthenticated()) {
    return res.redirect("/");
  }
  next();
}
app.listen(3000);
