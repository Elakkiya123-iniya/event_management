import { promises as fs } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import crypto from "node:crypto";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const dataDir = path.join(__dirname, "..", "data");
const dbPath = path.join(dataDir, "db.json");

const seedData = {
  events: [
    {
      id: crypto.randomUUID(),
      title: "Tech Leadership Summit",
      category: "Conference",
      location: "Bengaluru Convention Centre",
      date: "2026-08-18",
      time: "10:00",
      capacity: 200,
      price: 1499,
      imageUrl: "https://images.unsplash.com/photo-1540575467063-178a50c2df87?auto=format&fit=crop&w=1200&q=80",
      description: "A focused day of product, engineering, and business talks for technology leaders.",
      registrations: []
    },
    {
      id: crypto.randomUUID(),
      title: "Wedding Expo",
      category: "Expo",
      location: "Hyderabad International Expo Centre",
      date: "2026-09-06",
      time: "11:30",
      capacity: 350,
      price: 499,
      imageUrl: "https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&w=1200&q=80",
      description: "Meet decorators, planners, caterers, designers, and venues in one premium event.",
      registrations: []
    }
  ]
};

async function ensureDb() {
  await fs.mkdir(dataDir, { recursive: true });
  try {
    await fs.access(dbPath);
  } catch {
    await fs.writeFile(dbPath, JSON.stringify(seedData, null, 2));
  }
}

export async function readDb() {
  await ensureDb();
  const file = await fs.readFile(dbPath, "utf8");
  return JSON.parse(file);
}

export async function writeDb(data) {
  await ensureDb();
  await fs.writeFile(dbPath, JSON.stringify(data, null, 2));
}

export function createId() {
  return crypto.randomUUID();
}
