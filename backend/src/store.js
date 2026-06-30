import crypto from "node:crypto";
import path from "node:path";
import { fileURLToPath } from "node:url";
import dotenv from "dotenv";
import { MongoClient } from "mongodb";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.join(__dirname, "..", ".env") });

const mongoUrl = process.env.MONGODB_URL;
const dbName = process.env.MONGODB_DB_NAME || "event_management";

if (!mongoUrl) {
  throw new Error("MONGODB_URL is required. Add it to backend/.env");
}

const client = new MongoClient(mongoUrl);
let eventsCollection;
let registrationsCollection;

async function connect() {
  if (!eventsCollection) {
    await client.connect();
    const db = client.db(dbName);
    eventsCollection = db.collection("events");
    registrationsCollection = db.collection("registrations");
    
    await eventsCollection.createIndex({ id: 1 }, { unique: true });
    await registrationsCollection.createIndex({ id: 1 }, { unique: true });
    await registrationsCollection.createIndex({ eventId: 1 });
  }
}

function normalize(doc) {
  if (!doc) return null;
  const { _id, ...rest } = doc;
  return rest;
}

export function createId() {
  return crypto.randomUUID();
}

export async function getEvents() {
  await connect();
  const pipeline = [
    {
      $lookup: {
        from: "registrations",
        localField: "id",
        foreignField: "eventId",
        as: "regs"
      }
    },
    {
      $addFields: {
        registeredCount: { $size: "$regs" },
        seatsLeft: { $max: [ { $subtract: [ { $toInt: "$capacity" }, { $size: "$regs" } ] }, 0 ] }
      }
    },
    {
      $project: { regs: 0 }
    },
    {
      $sort: { date: 1, time: 1 }
    }
  ];
  
  const events = await eventsCollection.aggregate(pipeline).toArray();
  return events.map(normalize);
}

export async function getEventById(id) {
  await connect();
  const pipeline = [
    { $match: { id } },
    {
      $lookup: {
        from: "registrations",
        localField: "id",
        foreignField: "eventId",
        as: "regs"
      }
    },
    {
      $addFields: {
        registeredCount: { $size: "$regs" },
        seatsLeft: { $max: [ { $subtract: [ { $toInt: "$capacity" }, { $size: "$regs" } ] }, 0 ] }
      }
    },
    {
      $project: { regs: 0 }
    }
  ];
  
  const results = await eventsCollection.aggregate(pipeline).toArray();
  return normalize(results[0]);
}

export async function createEvent(event) {
  await connect();
  await eventsCollection.insertOne(event);
  return event;
}

export async function updateEvent(id, updateData) {
  await connect();
  await eventsCollection.updateOne({ id }, { $set: updateData });
  return getEventById(id);
}

export async function deleteEvent(id) {
  await connect();
  await eventsCollection.deleteOne({ id });
  await registrationsCollection.deleteMany({ eventId: id });
}

export async function createRegistration(eventId, registration) {
  await connect();
  const regDoc = { ...registration, eventId };
  await registrationsCollection.insertOne(regDoc);
  return regDoc;
}

export async function getRegistrationsByEventId(eventId) {
  await connect();
  const regs = await registrationsCollection.find({ eventId }).toArray();
  return regs.map(normalize);
}
