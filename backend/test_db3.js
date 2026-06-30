import { MongoClient } from "mongodb";

const url = "mongodb://event_management:iniya%4012@ac-updrxco-shard-00-00.ppqopnp.mongodb.net:27017,ac-updrxco-shard-00-01.ppqopnp.mongodb.net:27017,ac-updrxco-shard-00-02.ppqopnp.mongodb.net:27017/event_management?ssl=true&replicaSet=atlas-updrxco-shard-0&authSource=admin&retryWrites=true&w=majority&appName=Database-01";
const client = new MongoClient(url, { family: 6 }); // Force IPv6 since PowerShell succeeded over IPv6

async function run() {
  console.log("Testing standard mongodb:// connection over IPv6...");
  try {
    await client.connect();
    console.log("Connected successfully over IPv6!");
    await client.close();
  } catch (err) {
    console.error("IPv6 connection failed:", err);
  }
}
run();
