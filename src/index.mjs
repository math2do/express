import express from "express";
import { loggingMiddleware } from "./utils/middlewares.mjs";
import routes from "./routes/index.mjs";
import cookieParser from "cookie-parser";
import session from "express-session";
import passport from "passport";
import "./strategies/local-strategy.mjs";
import mongoose from "mongoose";
import MongoStore from "connect-mongo";

const app = express();

mongoose.connect("mongodb://localhost:27017/express_tutorial").
  then(() => { console.log("connected to database"); }).
  catch((err) => { console.log(`Error: ${err}`); });

app.use(express.json());
app.use(cookieParser());
app.use(loggingMiddleware);
app.use(session({
  secret: "SECRET_TO_SIGN_COOKIE",
  saveUninitialized: false, // check doc, for login this should be 'false' to reduce storage space. Unitiliased means new, not modified
  resave: false,
  cookie: { maxAge: 10 * 60 * 1000 },  // 10 mins
  store: MongoStore.create({ client: mongoose.connection.getClient() }),
}));

// after above sesssion we register passport
app.use(passport.initialize());
app.use(passport.session());

// register routes
app.use(routes);

const PORT = process.env.PORT || 3002;

app.listen(PORT, () => {
  console.log(`Listening on port ${PORT}`);
});