mongoose = require("./index");
const bcrypt = require("bcrypt");
const UserSchema = new mongoose.Schema({
  password: String,
  email: String
});
UserSchema.methods.validPassword = async function(password) {
  try {
    if (await bcrypt.compare(password, this.password)) {
      return true;
    } else {
      return false;
    }
  } catch (e) {
    return false;
  }
};
const User = mongoose.model("User", UserSchema);
const save = async ({ email, password }) => {
  try {
    user = await User.findOne({ email: email }).exec();
    if (!!user) {
      return { err: "User with this email already exist" };
    } else {
      const hashedPassword = await bcrypt.hash(password, 10);
      const user = new User({ email, password: hashedPassword });
      const newUser = await user.save();
      return { _id: newUser._id, email: newUser.email };
    }
  } catch (err) {
    return { errNew: err };
  }
};
const login = async ({ email, password }) => {
  try {
    user = await User.findOne({ email: email }).exec();
    if (!user) {
      return { err: "Incorrect email." };
    } else {
      let validPassword = await user.validPassword(password);
      if (!validPassword) {
        return { err: "Incorrect password." };
      }
      return { _id: user._id, email: user.email };
    }
  } catch (err) {
    return { errNew: err };
  }
};
const getUserById = (_id) => User.findById(_id);
const getUserByEmail = (email) => User.findOne(email)
module.exports = { save, login, getUserById, getUserByEmail };
// let testSave = async (user) => {
//   result = await save(user);
//   console.log({ result });
// };
// testSave({ email: "allania7med11@gmail.com", password: "123456" });

// let testLogin = async (user) => {
//   result = await login(user);
//   console.log({ result });
// };
// testLogin({ email: "allania7med12", password: "123456" });
