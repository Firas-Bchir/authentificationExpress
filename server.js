if (process.env.NODE_ENV !== "production") {
  require("dotenv").config();
}
const express = require("express");
var bodyParser = require("body-parser");
const app = express();
var path = require("path");
var clientPath = path.join(__dirname, "../reactapp/build");

// parse application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: false }));

// parse application/json
app.use(bodyParser.json());
app.use(express.static(clientPath));
app.use((req, res, next) => {
  next();
});
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

/* app.get("/", checkAuthenticated, (req, res) => {
  res.render("index.ejs", { name: req.user.username });
});
app.get("/login", checkNotAuthenticated, (req, res) => {
  res.render("login.ejs");
}); */
app.get("/api/user", (req, res) => {
  console.log({ user: req.user });
  res.json({ user: req.user });
});
app.post("/api/login", passport.authenticate("local"), function(req, res) {
  // If this function gets called, authentication was successful.
  // `req.user` contains the authenticated user.
  res.json({ user: req.user });
});

/* app.get("/register", checkNotAuthenticated, (req, res) => {
  res.render("register.ejs");
}); */
app.post("/api/register", checkNotAuthenticated, async (req, res) => {
  let { username, email, password } = req.body;
  try {
    user = await User.save({ username, email, password });
    passport.authenticate("local")(req, res, function() {
      res.json({ user: req.user });
    });
  } catch (e) {
    console.log(e);
    res.redirect("/register");
  }
});
app.delete("/api/logout", (req, res) => {
  req.logOut();
  res.sendStatus(204);
  // res.redirect("/login");
});
// Google
app.get(
  "/api/auth/google",
  passport.authenticate("google", { scope: ["profile"] })
);
app.get(
  "/api/auth/google/callback",
  passport.authenticate("google", { failureRedirect: "/login" }),
  function(req, res) {
    res.redirect("/");
  }
);
app.get("*", function(req, res) {
  res.sendFile(clientPath + "/index.html");
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
