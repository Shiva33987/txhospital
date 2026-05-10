import cors from "cors";
import express from "express";
import { hospitalContent } from "./data/content.js";

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

app.get("/api/health", (_req, res) => {
  res.json({
    ok: true,
    service: "tx-miyapur-backend",
    timestamp: new Date().toISOString()
  });
});

app.get("/api/content", (_req, res) => {
  res.json(hospitalContent);
});

const sectionRoutes = {
  header: hospitalContent.header,
  hero: hospitalContent.hero,
  symptoms: hospitalContent.symptoms,
  treatments: hospitalContent.treatments,
  whyChooseUs: hospitalContent.whyChooseUs,
  doctors: hospitalContent.doctors,
  technologies: hospitalContent.technologies,
  testimonials: hospitalContent.testimonials,
  stats: hospitalContent.stats,
  insurance: hospitalContent.insurance,
  faqs: hospitalContent.faqs,
  finalCta: hospitalContent.finalCta
};

Object.entries(sectionRoutes).forEach(([key, value]) => {
  app.get(`/api/${key}`, (_req, res) => {
    res.json(value);
  });
});

app.post("/api/appointments", (req, res) => {
  const { name, phone, concern, preferredDate } = req.body ?? {};

  if (!name || !phone || !concern) {
    return res.status(400).json({
      ok: false,
      message: "name, phone, and concern are required."
    });
  }

  return res.status(201).json({
    ok: true,
    message:
      "Appointment request received. Our care coordinator will contact you shortly.",
    request: {
      name,
      phone,
      concern,
      preferredDate: preferredDate || null,
      receivedAt: new Date().toISOString()
    }
  });
});

app.use((_req, res) => {
  res.status(404).json({
    ok: false,
    message: "Endpoint not found"
  });
});

app.listen(PORT, () => {
  console.log(`TX Miyapur backend running at http://localhost:${PORT}`);
});

