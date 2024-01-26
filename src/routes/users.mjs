import { Router } from "express";
import { query, validationResult, body, matchedData, checkSchema } from "express-validator";
import { createUserValidationSchema } from "../utils/validationSchemas.mjs";
import { mockUsers } from '../utils/constants.mjs';
import { resolveIndexByUserId } from "../utils/middlewares.mjs";

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

export default router;