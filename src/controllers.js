import { baseUrl } from "./config.js";
import { addClick, deleteLinkDB, insertLink, queryLink } from "./db.js";
import { nanoid, validateUrl } from "./utils.js";

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
    control: `${baseUrl}/manage/${control}`,
  });
};

export const getLink = async (req, res) => {
  const link = await queryLink({ code: req.params.code });
  if (!link) {
    return res.status(404).render("notfound");
  }

  res.redirect(link.url);
  await addClick(link._id);
};

export const manageLink = async (req, res) => {
  const link = await queryLink({ control: req.params.code });
  if (!link) {
    return res.status(404).render("notfound");
  }

  res.render("control.ejs", {
    short: `${baseUrl}/${link.code}`,
    url: link.url,
    clicks: link.clicks,
  });
};

export const deleteLink = async (req, res) => {
  const r = await deleteLinkDB({ control: req.params.code });
  if (r.deletedCount < 1) {
    return res.sendStatus(404);
  }

  res.sendStatus(200);
};

export const errorHandler = (err, req, res, _) => {
  console.error(err);
  res.status(500).json({ message: "Internal server error" });
};
