var GoogleStrategy = require('passport-google-oauth').OAuth2Strategy;
const bcrypt = require("bcrypt");
function initialize(passport, findOrCreate) {
  console.log(process.env.DOMAIN + "auth/google/callback")
  passport.use(new GoogleStrategy({
    clientID: process.env.GOOGLE_CONSUMER_KEY,
    clientSecret: process.env.GOOGLE_CONSUMER_SECRET,
    callbackURL: process.env.DOMAIN + "auth/google/callback"
  },
  function(token, tokenSecret, profile, done) {
      findOrCreate({ googleId: profile.id }, function (err, user) {
        return done(err, user);
      });
  }
));
  passport.serializeUser((user, done) => done(null, user._id));
  passport.deserializeUser(async (id, done) => {
    try {
      user = await getUserById(id);
      return done(null, user);
    } catch (err) {
      console.log({ err });
    }
  });
}

module.exports = initialize;