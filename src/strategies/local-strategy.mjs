import passport from "passport";
import { Strategy } from "passport-local";
import { User } from "../mongoose/schemas/user.mjs";
import { samePassword } from "../utils/helper.mjs";

passport.serializeUser((user, done) => {
  done(null, user.id);
});

passport.deserializeUser(async (id, done) => {
  try {
    const findUser = await User.findById(id);
    if (!findUser) {
      throw new Error("User not found");
    }
    done(null, findUser);
  } catch (err) {
    done(err, null);
  }
});

export default passport.use(
  new Strategy(async (username, password, done) => {
    try {
      const findUser = await User.findOne({ username });
      if (!findUser) {
        throw new Error("User not found");
      }
      if (!samePassword(password, findUser.password)) {
        throw new Error("Invalid credentials");
      }
      done(null, findUser);
    } catch (err) {
      done(err, null);
    }
  })
);