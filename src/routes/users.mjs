import { Router } from "express";
import { query, validationResult, body, matchedData, checkSchema } from "express-validator";
import { createUserValidationSchema } from "../utils/validationSchemas.mjs";
import { mockUsers } from "../utils/constants.mjs";
import { resolveIndexByUserId } from "../utils/middlewares.mjs";
import passport from "passport";
import { User } from "../mongoose/schemas/user.mjs";
import { hashPassword } from "../utils/helper.mjs";

const router = Router();

// handle request query param
router.get("/api/users",
  query("filter").
    isString().withMessage("filter must be string").
    notEmpty().withMessage("filter can't be empty").
    isLength({ min: 3, max: 10 }).withMessage("filter must have length between 3-10"),
  (req, res) => {
    const result = validationResult(req);
    if (!result.isEmpty()) {
      return res.status(400).send({ errors: result.array() });
    }

    const { filter, value } = req.query;

    if (filter && value) {
      return res.send(
        mockUsers.filter((user) => {
          return user[filter].includes(value);
        })
      );
    }
    return res.send(mockUsers);
  });

// create user
router.post("/api/users", checkSchema(createUserValidationSchema), (req, res) => {
  const result = validationResult(req);
  if (!result.isEmpty()) {
    return res.status(400).send({ errors: result.array() });
  }

  const user = matchedData(req);  // validated req.body
  const newUser = { id: mockUsers[mockUsers.length - 1].id + 1, ...user };
  mockUsers.push(newUser);
  return res.sendStatus(201);
});

router.post("/v2/api/users", checkSchema(createUserValidationSchema), async (req, res) => {
  const result = validationResult(req);
  if (!result.isEmpty()) {
    return res.status(400).send({ errors: result.array() });
  }

  const user = matchedData(req);  // validated req.body
  user.password = hashPassword(user.password);
  const newUser = new User(user);
  try {
    const savedUser = await newUser.save();
    return res.status(201).send(savedUser);
  } catch (err) {
    return res.sendStatus(400);
  }
});

// handle request path param
router.get("/api/users/:id", (req, res) => {
  const parseId = parseInt(req.params.id);
  if (isNaN(parseId)) {
    return res.status(400).send({ msg: "bad request. invalid id" });
  }

  const user = mockUsers.find((user) => user.id === parseId);
  if (!user) {
    return res.sendStatus(404);
  }
  return res.send(user);
});

// update all non-primary fields of the user
router.put("/api/users/:id", resolveIndexByUserId, (req, res) => {
  const { body, userIndex } = req;
  mockUsers[userIndex] = { id: mockUsers[userIndex].id, ...body };
  res.sendStatus(200);
});

// give patch to user
router.patch("/api/users/:id", resolveIndexByUserId, (req, res) => {
  const { body, userIndex } = req;
  mockUsers[userIndex] = { ...mockUsers[userIndex], ...body };
  res.sendStatus(200);
});

// remove the user
router.delete("/api/users/:id", (req, res) => {
  const { id } = req.params;
  const parseId = parseInt(id);
  if (isNaN(parseId)) {
    return res.status(400).send({ msg: "bad request. invalid id" });
  }

  const userIndex = mockUsers.findIndex((user) => user.id === parseId);
  if (userIndex === -1) {
    return res.sendStatus(404);
  }

  mockUsers.splice(userIndex, 1);
  res.sendStatus(200);
});

// login an user by modifying/initialising session 
router.post("/api/auth", (req, res) => {
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
router.get("/api/auth/status", (req, res) => {
  return req.session.user ?
    res.status(200).send(req.session.user) :
    res.status(401).send({ msg: "Not Authenticated" });

});

// check session status
router.get("/api/auth/discord/status", (req, res) => {
  return req.user ?
    res.status(200).send(req.user) :
    res.status(401).send({ msg: "Not Authenticated" });

});

// add to cart for authenticated users only
router.post("/api/cart", (req, res) => {
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

// authenticate using passport
router.post("/v2/api/auth", passport.authenticate("local"), (req, res) => {
  res.sendStatus(200);
});

router.get("/v2/api/auth/status", (req, res) => {
  return req.user ? res.send(req.user) : res.sendStatus(401);
});

router.post("/v2/api/auth/logout", (req, res) => {
  if (!req.user) {
    return res.sendStatus(401);
  }

  req.logout((err) => {
    if (err) {
      return res.sendStatus(400);
    }
    res.sendStatus(200);
  });
});

// discord authentication
router.get("/api/discord/auth", passport.authenticate("discord"));
router.get("/api/auth/discord/redirect", passport.authenticate("discord"), (req, res) => {
  res.sendStatus(200);
});

export default router;