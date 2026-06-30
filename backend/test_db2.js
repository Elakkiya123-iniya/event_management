import { MongoClient } from "mongodb";
import dotenv from "dotenv";
dotenv.config();

console.log("Testing connection with URL:", process.env.MONGODB_URL);
const client = new MongoClient(process.env.MONGODB_URL);

async function run() {
  try {
    await client.connect();
    console.log("Connected successfully to MongoDB!");
    await client.close();
  } catch (err) {
    console.error("Connection failed:", err);
  }
}
run();
