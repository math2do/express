import express from "express";
import { loggingMiddleware } from "./utils/middlewares.mjs";
import routes from "./routes/index.mjs";

const app = express();
app.use(express.json());
app.use(loggingMiddleware);

// register routes
app.use(routes);

const PORT = process.env.PORT || 3002;

app.get("/ping", (_, res) => {
  res.status(200).send({ "msg": "Pong" });
});

app.get("/", (_, res) => {
  res.status(200).send({ "msg": "Hello" });
});

app.listen(PORT, () => {
  console.log(`Listening on port ${PORT}`);
});