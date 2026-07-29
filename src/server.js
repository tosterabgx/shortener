import express from "express";
import path from "path";

const app = express();
const port = 3000;

app.use(express.static(path.join(import.meta.dirname, "public")));

app.get("/api/shorten", (req, res) => {
  res.status(200).json({});
});

app.listen(port, () => {
  console.log(`Listening on port ${port}`);
});
