import { customAlphabet } from "nanoid";

const alphabet = "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz";
export const nanoid = customAlphabet(alphabet);

export const validateUrl = (str) => {
  try {
    let url = str.trim();

    if (!/^https?:\/\//i.test(url)) {
      if (/:\/\//.test(url)) {
        return null;
      }
      url = "https://" + url;
    }

    const parsed = new URL(url);
    if (!parsed.hostname.includes(".")) return null;

    const out = parsed.toString();
    if (out.length > 2048) return null;

    return out;
  } catch {
    return null;
  }
};
