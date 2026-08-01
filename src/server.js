import express from "express";
import { rateLimit } from "express-rate-limit";
import { port, publicPath, viewsPath } from "./config.js";
import { errorHandler, manageLink, redirectLink, shortenLink } from "./controllers.js";
import { connectDB } from "./db.js";

const app = express();

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 100,
  message: { message: "Too many requests, retry later" },
});

app.set("view engine", "ejs");
app.set("views", viewsPath);

app.use(express.static(publicPath));
app.use(express.json());
app.use(errorHandler);

app.post("/api/shorten", limiter, shortenLink);
app.get("/:code", limiter, redirectLink);
app.get("/control/:control", limiter, manageLink);

await connectDB();
app.listen(port, () => {
  console.log(`Listening on port ${port}`);
});
