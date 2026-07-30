import express from "express";
import { customAlphabet } from "nanoid";
import path from "path";
import { connectDB, insertLink, getLink } from "./db.js";
import { validateUrl } from "./utils.js";

const alphabet = "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz";
const nanoid = customAlphabet(alphabet, 7);

const app = express();
const port = process.env.PORT ?? 3000;

app.use(express.static(path.join(import.meta.dirname, "public")));
app.use(express.json());

app.post("/api/shorten", async (req, res) => {
  const { url } = req.body ?? {};
  if (!url) {
    return res.status(400).json({ message: "No URL provided" });
  }

  const valid = validateUrl(url)?.toString();
  if (!valid) {
    return res.status(400).json({ message: "Incorrect URL" });
  }

  let code, result;
  let attempts = 0;

  do {
    if (++attempts > 5) {
      return res.status(500).json({ message: "Could not generate code" });
    }

    code = nanoid(7);
    result = await insertLink({ code, url: valid });
  } while (!result);

  res.status(200).json({ short: "http://localhost:3000/" + code });
});

app.get("/:code", async (req, res) => {
  const link = await getLink(req.params.code);
  if (!link) {
    return res.redirect("/");
  }

  res.redirect(301, link.url);
});

await connectDB();
app.listen(port, () => {
  console.log(`Listening on port ${port}`);
});
