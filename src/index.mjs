import express from "express";
import { loggingMiddleware } from "./utils/middlewares.mjs";
import routes from "./routes/index.mjs";
import cookieParser from "cookie-parser";
import session from "express-session";
import passport from "passport";
// import "./strategies/local-strategy.mjs";
import "./strategies/discord-strategy.mjs";
import mongoose from "mongoose";
import MongoStore from "connect-mongo";

const app = express();

mongoose.connect(process.env.MONGO_URI).
  then(() => { console.log("Connected to database"); }).
  catch((err) => { console.log(`Error: ${err}`); });

app.use(express.json());
app.use(cookieParser());
app.use(loggingMiddleware);
app.use(session({
  secret: process.env.COOKIE_SECRET,
  saveUninitialized: false, // check doc, for login this should be 'false' to reduce storage space. Unitiliased means new, not modified
  resave: false,
  cookie: { maxAge: Number(process.env.COOKIE_EXPIRE) },
  store: MongoStore.create({ client: mongoose.connection.getClient() }),
}));

// after above sesssion we register passport
app.use(passport.initialize());
app.use(passport.session());

// register routes
app.use(routes);

const PORT = Number(process.env.PORT);

app.listen(PORT, () => {
  console.log(`Listening on port ${PORT}`);
});