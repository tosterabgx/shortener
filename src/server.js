import express from "express";
import { rateLimit } from "express-rate-limit";
import { customAlphabet } from "nanoid";
import path from "path";
import { connectDB, getLink, insertLink, addClick } from "./db.js";
import { validateUrl } from "./utils.js";

const alphabet = "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz";
const nanoid = customAlphabet(alphabet, 7);

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 100,
  message: { message: "Too many requests, retry later" },
});

const app = express();
const port = process.env.PORT ?? 3000;

const baseUrl = process.env.BASE_URL ?? `http://localhost:${port}`;

app.set("view engine", "ejs");
app.set("views", path.join(import.meta.dirname, "views"));

app.use(express.static(path.join(import.meta.dirname, "public")));
app.use(express.json());
app.use((err, req, res, _) => {
  console.error(err);
  res.status(500).json({ message: "Internal server error" });
});

app.post("/api/shorten", limiter, async (req, res) => {
  const { url } = req.body ?? {};
  if (!url) {
    return res.status(400).json({ message: "No URL provided" });
  }

  const valid = validateUrl(url);
  if (!valid) {
    return res.status(400).json({ message: "Invalid URL" });
  }

  let code, control, result;
  let attempts = 0;

  do {
    if (++attempts > 5) {
      return res.status(500).json({ message: "Could not generate code" });
    }

    code = nanoid();
    control = nanoid(21);
    result = await insertLink({ code, control, url: valid });
  } while (!result);

  res.json({ short: `${baseUrl}/${code}`, control: `${baseUrl}/control/${control}` });
});

app.get("/control/:control", limiter, async (req, res) => {
  const link = await getLink({ control: req.params.control });
  if (!link) {
    return res.redirect("/");
  }

  res.render("control.ejs", { orig_url: link.url });
});

app.get("/:code", limiter, async (req, res) => {
  const link = await getLink({ code: req.params.code });
  if (!link) {
    return res.redirect("/");
  }

  res.redirect(link.url);
  await addClick(link._id);
});

await connectDB();
app.listen(port, () => {
  console.log(`Listening on port ${port}`);
});
