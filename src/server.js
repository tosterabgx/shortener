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

app.use(express.static(path.join(import.meta.dirname, "public")));
app.use(limiter);
app.use(express.json());
app.use((err, req, res, _) => {
  console.error(err);
  res.status(500).json({ message: "Internal server error" });
});

app.post("/api/shorten", async (req, res) => {
  const { url } = req.body ?? {};
  if (!url) {
    return res.status(400).json({ message: "No URL provided" });
  }

  const valid = validateUrl(url);
  if (!valid) {
    return res.status(400).json({ message: "Invalid URL" });
  }

  let code, result;
  let attempts = 0;

  do {
    if (++attempts > 5) {
      return res.status(500).json({ message: "Could not generate code" });
    }

    code = nanoid();
    result = await insertLink({ code, url: valid });
  } while (!result);

  res.status(200).json({ short: `${baseUrl}/${code}` });
});

app.get("/:code", async (req, res) => {
  const link = await getLink(req.params.code);
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
