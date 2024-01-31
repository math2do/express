import express from "express";
import { loggingMiddleware } from "./utils/middlewares.mjs";
import routes from "./routes/index.mjs";
import cookieParser from "cookie-parser";

const app = express();
app.use(express.json());
app.use(cookieParser());
app.use(loggingMiddleware);

// register routes
app.use(routes);

const PORT = process.env.PORT || 3002;

app.get("/", (_, res) => {
  res.cookie("hello", "world", { maxAge: 10 * 1000 }); // To expires after a day use : 24 * 60 * 60 * 1000 
  res.status(200).send({ "msg": "Hello" });
});

app.listen(PORT, () => {
  console.log(`Listening on port ${PORT}`);
});