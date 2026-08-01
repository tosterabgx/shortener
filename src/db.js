import { MongoClient } from "mongodb";

if (!process.env.MONGODB_URI) {
  console.error("No env variable MONGODB_URI found");
  process.exit(1);
}
const client = new MongoClient(process.env.MONGODB_URI);

export const connectDB = async () => {
  try {
    await client.connect();
    const collection = client.db().collection("links");
    await collection.createIndex({ code: 1 }, { unique: true });
    await collection.createIndex({ control: 1 }, { unique: true });

    console.log("MongoDB connected");
  } catch (err) {
    console.error("MongoDB connection error:", err.message);
    process.exit(1);
  }
};

export const insertLink = async (data) => {
  const collection = client.db().collection("links");
  const doc = { ...data, clicks: 0, createdAt: new Date() };
  try {
    await collection.insertOne(doc);
    return doc;
  } catch (err) {
    if (err.code === 11000) return null;
    throw err;
  }
};

export const queryLink = async (criteria) => {
  const collection = client.db().collection("links");
  const link = await collection.findOne(criteria);
  return link;
};

export const deleteLinkDB = async (criteria) => {
  const collection = client.db().collection("links");
  const res = await collection.deleteOne(criteria);
  return res;
};

export const addClick = async (id) => {
  const collection = client.db().collection("links");
  await collection.updateOne({ _id: id }, { $inc: { clicks: 1 } });
};
