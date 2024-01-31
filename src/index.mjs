import express from "express";
import { loggingMiddleware } from "./utils/middlewares.mjs";
import routes from "./routes/index.mjs";
import cookieParser from "cookie-parser";
import session from "express-session";
import { mockUsers } from "./utils/constants.mjs";

const app = express();
app.use(express.json());
app.use(cookieParser());
app.use(loggingMiddleware);
app.use(session({
  secret: "SECRET_TO_SIGN_COOKIE",
  saveUninitialized: false, // check doc, for login this should be 'false' to reduce storage space. Unitiliased means new, not modified
  resave: false,
  cookie: { maxAge: 60 * 10 * 1000 },
}));

// register routes
app.use(routes);

const PORT = process.env.PORT || 3002;

app.get("/", (req, res) => {
  // add/modify session properties to make it initialised
  req.session.visited = true;
  res.status(200).send({ "msg": "Hello" });
});

// login an user by modifying/initialising session 
app.post("/api/auth", (req, res) => {
  const { body: { username, password } } = req;

  const user = mockUsers.find((user) => user.username === username && user.password === password);
  if (!user) {
    res.status(401).send({ msg: "BAD CREDENTIALS" });
  }

  // add/modify session properties to make it initialised
  req.session.user = user;
  res.status(200).send(user);
});

// check session status
app.get("/api/auth/status", (req, res) => {
  return req.session.user ?
    res.status(200).send(req.session.user) :
    res.status(401).send({ msg: "Not Authenticated" });

});

// add to cart for authenticated users only
app.post("/api/cart", (req, res) => {
  if (!req.session.user) {
    return res.status(401).send({ msg: "Not Authenticated" });
  }
  const { body: item } = req;  // body is renamed to item
  const { cart } = req.session;
  if (cart) {
    cart.push(item);
  } else {
    req.session.cart = [item];
  }
  res.status(200).send({ msg: "Added to cart", cart: req.session.cart });
});

app.listen(PORT, () => {
  console.log(`Listening on port ${PORT}`);
});