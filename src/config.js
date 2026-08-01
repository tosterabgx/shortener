import path from "path";

export const port = process.env.PORT ?? 3000;

export const baseUrl = process.env.BASE_URL ?? `http://localhost:${port}`;

export const publicPath = path.join(import.meta.dirname, "public");
export const viewsPath = path.join(import.meta.dirname, "views");
