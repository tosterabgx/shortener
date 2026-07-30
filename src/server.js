import express from "express";
import path from "path";
import { validateUrl } from "./utils.js";
import { customAlphabet } from "nanoid";

const alphabet = "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz";
const nanoid = customAlphabet(alphabet, 7);

const app = express();
const port = 3000;

app.use(express.static(path.join(import.meta.dirname, "public")));
app.use(express.json());

app.post("/api/shorten", (req, res) => {
  const { url } = req.body ?? {};
  if (!url) {
    return res.status(400).json({ message: "No URL provided" });
  }

  const valid = validateUrl(url);
  if (!valid) {
    return res.status(400).json({ message: "Incorrect URL" });
  }

  const code = nanoid(7);

  res.status(200).json({ short: "http://localhost:3000/" + code });
});

app.listen(port, () => {
  console.log(`Listening on port ${port}`);
});
