import { nanoid, validateUrl } from "./utils.js";
import { insertLink, getLink, addClick } from "./db.js";
import { baseUrl } from "./config.js";

export const shortenLink = async (req, res) => {
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

    code = nanoid(7);
    control = nanoid(21);
    result = await insertLink({ code, control, url: valid });
  } while (!result);

  res.json({
    short: `${baseUrl}/${code}`,
    control: `${baseUrl}/control/${control}`,
  });
};

export const redirectLink = async (req, res) => {
  const link = await getLink({ code: req.params.code });
  if (!link) {
    return res.redirect("/");
  }

  res.redirect(link.url);
  await addClick(link._id);
};

export const manageLink = async (req, res) => {
  const link = await getLink({ control: req.params.control });
  if (!link) {
    return res.redirect("/");
  }

  res.render("control.ejs", { orig_url: link.url });
};

export const errorHandler = (err, req, res, _) => {
  console.error(err);
  res.status(500).json({ message: "Internal server error" });
};
