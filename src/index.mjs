import express from "express";
import { query, validationResult, body, matchedData, checkSchema } from "express-validator";
import { createUserValidationSchema } from "./utils/validationSchemas";

const app = express();
app.use(express.json());

// example of middleware
const loggingMiddleware = (req, res, next) => {
  console.log(`${req.method} - ${req.url}`);
  next();
};
app.use(loggingMiddleware);

const PORT = process.env.PORT || 3002;

const mockUsers = [
  { id: 1, username: "math2do", displayName: "Mathura Tudu" },
  { id: 2, username: "sagar", displayName: "Sagar" },
  { id: 3, username: "bhidua", displayName: "Balakram" },
  { id: 4, username: "tom", displayName: "Mansingh" },
  { id: 5, username: "jaga", displayName: "Jagabandhu" },
  { id: 6, username: "bisu", displayName: "Biswajeet" },
  { id: 7, username: "chhotu", displayName: "Chhotray" }
];

app.get("/ping", (_, res) => {
  res.status(200).send({ "msg": "Hello" });
});

app.get("/api/products", (req, res) => {
  res.send([{ id: 123, name: "Chicken Breast", price: 1.23 }]);
});

// handle request query param
app.get("/api/users",
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
app.post("/api/users", [

  // validation on username
  body("username").
    isString().withMessage("username must be string").
    notEmpty().withMessage("username can't be empty").
    isLength({ min: 5, max: 32 }).withMessage("username have length between 3-32"),
  // validation on displayName
  body("displayName").notEmpty().withMessage("displayName can't be empty")],

  (req, res) => {
    const result = validationResult(req);
    if (!result.isEmpty()) {
      return res.status(400).send({ errors: result.array() });
    }

    const user = matchedData(req);  // validated req.body
    const newUser = { id: mockUsers[mockUsers.length - 1].id + 1, ...user };
    mockUsers.push(newUser);
    return res.sendStatus(201);
  });

// resolveIndexByUserId middleware attaches 'userIndex' and 'parseId' into req properties
const resolveIndexByUserId = (req, res, next) => {
  const { id } = req.params;
  const parseId = parseInt(id);
  if (isNaN(parseId)) {
    return res.status(400).send({ msg: "bad request. invalid id" });
  }

  const userIndex = mockUsers.findIndex((user) => user.id === parseId);
  if (userIndex === -1) {
    return res.sendStatus(404);
  }
  // add derived userIndex to req properties
  req.userIndex = userIndex;
  next();
};

// handle request path param
app.get("/api/users/:id", (req, res) => {
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
app.put("/api/users/:id", resolveIndexByUserId, (req, res) => {
  const { body, userIndex } = req;
  mockUsers[userIndex] = { id: mockUsers[userIndex].id, ...body };
  res.sendStatus(200);
});

// give patch to user
app.patch("/api/users/:id", resolveIndexByUserId, (req, res) => {
  const { body, userIndex } = req;
  mockUsers[userIndex] = { ...mockUsers[userIndex], ...body };
  res.sendStatus(200);
});

// remove the user
app.delete("/api/users/:id", (req, res) => {
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

app.listen(PORT, () => {
  console.log(`Listening on port ${PORT}`);
});