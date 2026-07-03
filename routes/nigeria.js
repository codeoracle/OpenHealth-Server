const express = require("express");
const {
  EMERGENCY_CONTACTS,
  COMMON_CONDITIONS,
  HEALTH_RESOURCES,
  HEALTH_TIPS,
  OUTBREAK_ALERTS,
  IMMUNIZATION_SCHEDULE,
  PHC_STATES,
} = require("../data/nigeria-health");

const router = express.Router();

router.get("/emergency", (_req, res) => {
  res.json({ contacts: EMERGENCY_CONTACTS });
});

router.get("/conditions", (_req, res) => {
  res.json({ conditions: COMMON_CONDITIONS });
});

router.get("/resources", (_req, res) => {
  res.json({ resources: HEALTH_RESOURCES });
});

router.get("/tips", (_req, res) => {
  const count = Math.min(parseInt(_req.query.count, 10) || 3, HEALTH_TIPS.length);
  const shuffled = [...HEALTH_TIPS].sort(() => Math.random() - 0.5);
  res.json({ tips: shuffled.slice(0, count) });
});

router.get("/outbreaks", (_req, res) => {
  res.json({ alerts: OUTBREAK_ALERTS });
});

router.get("/immunization", (_req, res) => {
  res.json({
    schedule: IMMUNIZATION_SCHEDULE,
    note: "Free at all government primary health centres and during national immunization days.",
  });
});

router.get("/phc", (req, res) => {
  const { state } = req.query;
  if (state) {
    const match = PHC_STATES.find(
      (s) => s.state.toLowerCase() === state.toLowerCase()
    );
    if (!match) {
      return res.status(404).json({ message: "State not found", states: PHC_STATES.map((s) => s.state) });
    }
    return res.json({ locator: match });
  }
  res.json({ states: PHC_STATES });
});

router.get("/overview", (_req, res) => {
  res.json({
    country: "Nigeria",
    tagline: "Bridging the healthcare gap with AI-powered symptom guidance",
    stats: {
      doctorToPatientRatio: "1:5,000 (national average)",
      primaryHealthCentres: "30,000+ across Nigeria",
      commonDiseases: ["Malaria", "Typhoid", "Lassa Fever", "Cholera", "HIV"],
    },
    emergency: EMERGENCY_CONTACTS.slice(0, 3),
    resources: HEALTH_RESOURCES.slice(0, 4),
    activeOutbreaks: OUTBREAK_ALERTS.filter((a) => a.severity === "high").length,
  });
});

module.exports = router;
