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

    return parsed;
  } catch {
    return null;
  }
};
