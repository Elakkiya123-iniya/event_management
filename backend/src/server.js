import express from "express";
import cors from "cors";
import morgan from "morgan";
import { 
  createId, 
  getEvents, 
  getEventById, 
  createEvent, 
  updateEvent, 
  deleteEvent, 
  createRegistration, 
  getRegistrationsByEventId 
} from "./store.js";

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors({ origin: ["http://localhost:5173", "http://localhost:5174"] }));
app.use(express.json());
app.use(morgan("dev"));

function validateEvent(payload) {
  const required = ["title", "category", "location", "date", "time", "capacity", "price", "description"];
  const missing = required.filter((field) => payload[field] === undefined || payload[field] === "");

  if (missing.length) {
    return `${missing.join(", ")} required`;
  }

  if (Number(payload.capacity) <= 0) {
    return "capacity must be greater than zero";
  }

  if (Number(payload.price) < 0) {
    return "price cannot be negative";
  }

  return null;
}

app.get("/", (_req, res) => {
  res.json({ message: "Event Management API is running. Access endpoints at /api/events" });
});

app.get("/api/health", (_req, res) => {
  res.json({ status: "ok", service: "event-management-api" });
});

app.get("/api/events", async (_req, res, next) => {
  try {
    const events = await getEvents();
    res.json(events);
  } catch (error) {
    next(error);
  }
});

app.get("/api/events/:id", async (req, res, next) => {
  try {
    const event = await getEventById(req.params.id);
    if (!event) {
      return res.status(404).json({ message: "Event not found" });
    }
    res.json(event);
  } catch (error) {
    next(error);
  }
});

app.post("/api/events", async (req, res, next) => {
  try {
    const error = validateEvent(req.body);
    if (error) {
      return res.status(400).json({ message: error });
    }

    const eventToCreate = {
      id: createId(),
      title: req.body.title.trim(),
      category: req.body.category.trim(),
      location: req.body.location.trim(),
      date: req.body.date,
      time: req.body.time,
      capacity: Number(req.body.capacity),
      price: Number(req.body.price),
      imageUrl: req.body.imageUrl?.trim() || "",
      description: req.body.description.trim()
    };

    await createEvent(eventToCreate);
    const createdEvent = await getEventById(eventToCreate.id);

    res.status(201).json(createdEvent);
  } catch (error) {
    next(error);
  }
});

app.put("/api/events/:id", async (req, res, next) => {
  try {
    const error = validateEvent(req.body);
    if (error) {
      return res.status(400).json({ message: error });
    }

    const event = await getEventById(req.params.id);
    if (!event) {
      return res.status(404).json({ message: "Event not found" });
    }

    const updatedEvent = await updateEvent(req.params.id, {
      title: req.body.title.trim(),
      category: req.body.category.trim(),
      location: req.body.location.trim(),
      date: req.body.date,
      time: req.body.time,
      capacity: Number(req.body.capacity),
      price: Number(req.body.price),
      imageUrl: req.body.imageUrl?.trim() || "",
      description: req.body.description.trim()
    });

    res.json(updatedEvent);
  } catch (error) {
    next(error);
  }
});

app.delete("/api/events/:id", async (req, res, next) => {
  try {
    const event = await getEventById(req.params.id);
    if (!event) {
      return res.status(404).json({ message: "Event not found" });
    }

    await deleteEvent(req.params.id);
    res.status(204).send();
  } catch (error) {
    next(error);
  }
});

app.post("/api/events/:id/register", async (req, res, next) => {
  try {
    const { name, email, phone } = req.body;

    if (!name || !email || !phone) {
      return res.status(400).json({ message: "name, email, and phone required" });
    }

    const event = await getEventById(req.params.id);
    if (!event) {
      return res.status(404).json({ message: "Event not found" });
    }

    if (event.seatsLeft <= 0) {
      return res.status(409).json({ message: "Event is full" });
    }

    const registrations = await getRegistrationsByEventId(req.params.id);
    const alreadyRegistered = registrations.some(
      (registration) => registration.email.toLowerCase() === email.toLowerCase()
    );

    if (alreadyRegistered) {
      return res.status(409).json({ message: "This email is already registered for the event" });
    }

    const registration = {
      id: createId(),
      name: name.trim(),
      email: email.trim(),
      phone: phone.trim(),
      createdAt: new Date().toISOString()
    };

    const createdRegistration = await createRegistration(event.id, registration);
    const updatedEvent = await getEventById(event.id);

    res.status(201).json({ registration: createdRegistration, event: updatedEvent });
  } catch (error) {
    next(error);
  }
});

app.get("/api/events/:id/registrations", async (req, res, next) => {
  try {
    const event = await getEventById(req.params.id);
    if (!event) {
      return res.status(404).json({ message: "Event not found" });
    }

    const registrations = await getRegistrationsByEventId(req.params.id);

    res.json({
      event,
      registrations
    });
  } catch (error) {
    next(error);
  }
});

app.use((error, _req, res, _next) => {
  console.error(error);
  res.status(500).json({ message: "Something went wrong" });
});

app.listen(PORT, () => {
  console.log(`Event Management API running on http://localhost:${PORT}`);
});
