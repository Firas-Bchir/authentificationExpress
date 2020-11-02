var GoogleStrategy = require('passport-google-oauth20').Strategy;
const bcrypt = require("bcrypt");
function initialize(passport, findOrCreate) {
  passport.use(new GoogleStrategy({
    clientID: process.env.GOOGLE_CONSUMER_KEY,
    clientSecret: process.env.GOOGLE_CONSUMER_SECRET,
    callbackURL: process.env.DOMAIN + "auth/google/callback"
  },
  async function(token, tokenSecret, profile, done) {
      let socialUser={
        providerId:profile.id,
        provider:"google",
        username:profile.displayName
      }
      try{
        let user=await findOrCreate(socialUser)
        return done(null, user);
      }catch(err){
        return done(err, false);
      }
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