import { MongoClient } from "mongodb";
import dotenv from "dotenv";

dotenv.config();

// Try standard mongodb protocol bypassing SRV
const url = "mongodb://event_management:iniya%4012@ac-updrxco-shard-00-00.ppqopnp.mongodb.net:27017,ac-updrxco-shard-00-01.ppqopnp.mongodb.net:27017,ac-updrxco-shard-00-02.ppqopnp.mongodb.net:27017/event_management?ssl=true&replicaSet=atlas-updrxco-shard-0&authSource=admin&retryWrites=true&w=majority&appName=Database-01";
console.log("Connecting to", url);
const client = new MongoClient(url);

async function run() {
  try {
    await client.connect();
    console.log("Connected successfully");
    const db = client.db(process.env.MONGODB_DB_NAME);
    const collections = await db.listCollections().toArray();
    console.log("Collections:", collections.map(c => c.name));
  } catch (err) {
    console.error("Connection error:", err);
  } finally {
    await client.close();
  }
}
run();
