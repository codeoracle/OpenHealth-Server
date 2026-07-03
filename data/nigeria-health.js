const EMERGENCY_CONTACTS = [
  { name: "National Emergency (Nigeria)", number: "112", description: "Universal emergency line" },
  { name: "Nigeria Police", number: "199", description: "Police emergency" },
  { name: "Federal Fire Service", number: "112", description: "Fire emergencies" },
  { name: "Lagos State Emergency", number: "767", description: "Lagos emergency services" },
  { name: "Abuja Emergency", number: "08035000000", description: "FCT emergency hotline" },
];

const COMMON_CONDITIONS = [
  {
    name: "Malaria",
    description: "Most common illness in Nigeria. Symptoms: fever, chills, headache, body aches.",
    prevention: "Use insecticide-treated nets, eliminate stagnant water, take prophylaxis if travelling.",
    action: "Seek testing at a primary health centre within 24 hours of fever onset.",
  },
  {
    name: "Typhoid Fever",
    description: "Bacterial infection from contaminated food/water. Symptoms: sustained fever, weakness, stomach pain.",
    prevention: "Drink clean water, wash hands, eat well-cooked food.",
    action: "Visit a clinic for Widal test and antibiotic treatment if confirmed.",
  },
  {
    name: "Sickle Cell Disease",
    description: "Nigeria has the highest burden globally. Crisis symptoms: severe pain, swelling, fever, fatigue.",
    prevention: "Know your genotype (AA, AS, SS). Stay hydrated, avoid extreme cold and stress.",
    action: "During crisis: go to hospital immediately. Do not rely on home remedies alone.",
  },
  {
    name: "Lassa Fever",
    description: "Viral haemorrhagic fever endemic in Nigeria. Symptoms: fever, sore throat, bleeding.",
    prevention: "Store food in rodent-proof containers, avoid contact with rats.",
    action: "Report immediately to nearest hospital — early treatment is critical.",
  },
  {
    name: "Tuberculosis (TB)",
    description: "Persistent cough for 2+ weeks, weight loss, night sweats, chest pain.",
    prevention: "Good ventilation, cover mouth when coughing, complete full TB treatment if diagnosed.",
    action: "Visit a DOTS clinic for sputum test. TB treatment is free at government facilities.",
  },
  {
    name: "Meningitis",
    description: "Common in Nigeria's meningitis belt (north). Symptoms: stiff neck, severe headache, fever, rash.",
    prevention: "Get meningitis vaccination, especially during dry season (Dec–April).",
    action: "Seek emergency care immediately — meningitis can be fatal within hours.",
  },
  {
    name: "Cholera",
    description: "Waterborne disease causing severe diarrhoea and dehydration.",
    prevention: "Boil or treat drinking water, practice good sanitation.",
    action: "Start oral rehydration immediately and go to a health facility.",
  },
  {
    name: "HIV/AIDS",
    description: "1.9 million Nigerians live with HIV. Early testing and ART save lives.",
    prevention: "Safe practices, PMTCT for pregnant women, avoid sharing needles.",
    action: "Get free confidential testing at any primary health centre. ART is free at government facilities.",
  },
];

const OUTBREAK_ALERTS = [
  {
    id: "meningitis",
    title: "Meningitis — Northern Belt",
    season: "December – April (dry season)",
    regions: ["Kano", "Katsina", "Sokoto", "Zamfara", "Borno", "Yobe", "Bauchi"],
    severity: "high",
    symptoms: "Stiff neck, severe headache, fever, sensitivity to light, rash",
    action: "Seek emergency care immediately. Vaccination available at health centres.",
  },
  {
    id: "yellow-fever",
    title: "Yellow Fever",
    season: "Year-round, peaks in rainy season",
    regions: ["All states — endemic in Nigeria"],
    severity: "medium",
    symptoms: "Fever, jaundice (yellow eyes/skin), body aches, nausea",
    action: "Get yellow fever vaccination. Required for international travel from Nigeria.",
  },
  {
    id: "cholera",
    title: "Cholera Outbreaks",
    season: "Rainy season (April – October)",
    regions: ["Lagos", "Rivers", "Bayelsa", "Delta", "Niger", "FCT"],
    severity: "high",
    symptoms: "Profuse watery diarrhoea, vomiting, rapid dehydration",
    action: "Use ORS immediately. Boil all drinking water. Go to hospital if severe.",
  },
  {
    id: "lassa",
    title: "Lassa Fever",
    season: "Dry season (November – May)",
    regions: ["Edo", "Ondo", "Ebonyi", "Bauchi", "Taraba", "Plateau"],
    severity: "high",
    symptoms: "Fever, sore throat, chest pain, bleeding from gums/nose",
    action: "Isolate and report to hospital immediately. Do not self-medicate.",
  },
  {
    id: "malaria",
    title: "Malaria Peak Season",
    season: "Rainy season (April – October)",
    regions: ["All states"],
    severity: "medium",
    symptoms: "Fever, chills, headache, body aches, fatigue",
    action: "Sleep under treated nets. Test within 24 hours of fever at any PHC.",
  },
];

const IMMUNIZATION_SCHEDULE = [
  { age: "At birth", vaccines: ["BCG", "OPV-0", "Hepatitis B-1"] },
  { age: "6 weeks", vaccines: ["Penta-1", "OPV-1", "PCV-1", "Rota-1"] },
  { age: "10 weeks", vaccines: ["Penta-2", "OPV-2", "PCV-2", "Rota-2"] },
  { age: "14 weeks", vaccines: ["Penta-3", "OPV-3", "PCV-3", "IPV", "Rota-3"] },
  { age: "6 months", vaccines: ["Vitamin A", "Measles (if high-risk)"] },
  { age: "9 months", vaccines: ["Measles-1", "Yellow Fever", "Meningitis A (belt states)"] },
  { age: "12 months", vaccines: ["PCV booster", "Measles-2"] },
  { age: "15 months", vaccines: ["MMR", "DPT booster"] },
  { age: "18 months", vaccines: ["OPV booster", "DPT booster"] },
  { age: "4–6 years", vaccines: ["DPT booster", "OPV booster", "Yellow Fever (if missed)"] },
];

const PHC_STATES = [
  "Abia", "Adamawa", "Akwa Ibom", "Anambra", "Bauchi", "Bayelsa", "Benue", "Borno",
  "Cross River", "Delta", "Ebonyi", "Edo", "Ekiti", "Enugu", "FCT", "Gombe",
  "Imo", "Jigawa", "Kaduna", "Kano", "Katsina", "Kebbi", "Kogi", "Kwara",
  "Lagos", "Nasarawa", "Niger", "Ogun", "Ondo", "Osun", "Oyo", "Plateau",
  "Rivers", "Sokoto", "Taraba", "Yobe", "Zamfara",
].map((state) => ({
  state,
  mapsUrl: `https://www.google.com/maps/search/primary+health+centre+${state}+Nigeria`,
  hivTestUrl: `https://www.google.com/maps/search/HIV+testing+centre+${state}+Nigeria`,
}));

const HEALTH_RESOURCES = [
  {
    title: "NCDC — Disease Control",
    description: "Nigeria Centre for Disease Control outbreak alerts and health advisories.",
    url: "https://ncdc.gov.ng",
    category: "government",
  },
  {
    title: "Find Hospitals in Nigeria",
    description: "Locate hospitals and clinics near you on Google Maps.",
    url: "https://www.google.com/maps/search/hospitals+in+Nigeria",
    category: "facilities",
  },
  {
    title: "Find Pharmacies (Chemists)",
    description: "Locate registered pharmacies near you for medications.",
    url: "https://www.google.com/maps/search/pharmacy+in+Nigeria",
    category: "facilities",
  },
  {
    title: "Maternal Health — MNCH",
    description: "Free antenatal care at primary health centres under the BHCPF programme.",
    url: "https://www.health.gov.ng",
    category: "maternal",
  },
  {
    title: "NAFDAC Drug Verification",
    description: "Verify if a drug is registered and safe before purchase.",
    url: "https://www.nafdac.gov.ng",
    category: "safety",
  },
  {
    title: "Mental Health Helpline",
    description: "Nigeria Suicide Prevention Initiative — free confidential support.",
    url: "tel:08062106493",
    category: "mental",
  },
  {
    title: "HIV Testing Centres",
    description: "Find free HIV counselling and testing services near you.",
    url: "https://www.google.com/maps/search/HIV+testing+centre+Nigeria",
    category: "hiv",
  },
  {
    title: "Primary Health Centres",
    description: "Locate your nearest PHC for free basic healthcare across Nigeria.",
    url: "https://www.google.com/maps/search/primary+health+centre+Nigeria",
    category: "facilities",
  },
];

const HEALTH_TIPS = [
  "Drink at least 8 glasses of clean water daily, especially in Nigeria's hot climate.",
  "Sleep under a treated mosquito net every night to prevent malaria.",
  "Wash hands with soap before eating and after using the toilet.",
  "Complete your full course of antibiotics — never stop early.",
  "Pregnant women should attend all antenatal clinic visits (minimum 4 visits).",
  "Vaccinate children against measles, polio, and yellow fever on schedule.",
  "Avoid self-medicating with antibiotics — consult a pharmacist or doctor.",
  "Know your genotype before marriage to prevent sickle cell disease in children.",
];

const HEALTH_TOOLS = [
  {
    id: "maternal",
    title: "Maternal Health Check",
    description: "Assess pregnancy or postpartum danger signs. Nigeria has one of the highest maternal mortality rates in the world.",
    icon: "pregnant_woman",
    problem: "Maternal mortality — 576 deaths per 100,000 live births",
    fields: [
      { name: "fullName", label: "Full Name", type: "text", required: true },
      { name: "weeksPregnant", label: "Weeks Pregnant (or postpartum)", type: "text", required: true },
      { name: "symptoms", label: "Symptoms (bleeding, swelling, headache, etc.)", type: "textarea", required: true },
    ],
    prompt: (data) =>
      `A pregnant/postpartum woman in Nigeria (${data.weeksPregnant} weeks) reports: ${data.symptoms}. ` +
      `Assess for danger signs (pre-eclampsia, haemorrhage, infection). ` +
      `Is this an emergency? What should she do immediately? Reference Nigerian primary health centres. Under 100 words.`,
  },
  {
    id: "child-fever",
    title: "Child Fever Guide",
    description: "Guidance for parents when a child under 5 has fever — a leading cause of child deaths in Nigeria.",
    icon: "child_care",
    problem: "Under-5 mortality — fever, malaria, dehydration",
    fields: [
      { name: "fullName", label: "Parent/Guardian Name", type: "text", required: true },
      { name: "childAge", label: "Child's Age", type: "text", required: true },
      { name: "symptoms", label: "Child's Symptoms", type: "textarea", required: true },
    ],
    prompt: (data) =>
      `A Nigerian parent reports their ${data.childAge} old child has: ${data.symptoms}. ` +
      `Provide guidance on whether this needs urgent care, malaria testing, or ORS for dehydration. ` +
      `Reference IMCI guidelines used in Nigeria. Under 100 words.`,
  },
  {
    id: "sickle-cell",
    title: "Sickle Cell Crisis",
    description: "40% of global sickle cell cases are in Nigeria. Get guidance during a pain crisis or complication.",
    icon: "bloodtype",
    problem: "Sickle cell — 150,000 births/year with SS genotype",
    fields: [
      { name: "fullName", label: "Full Name", type: "text", required: true },
      { name: "genotype", label: "Genotype (e.g. SS, SC)", type: "text", required: true },
      { name: "symptoms", label: "Current Symptoms", type: "textarea", required: true },
    ],
    prompt: (data) =>
      `A Nigerian patient with sickle cell genotype ${data.genotype} reports: ${data.symptoms}. ` +
      `Is this a vaso-occlusive crisis requiring hospital? What immediate steps should they take? ` +
      `Mention hydration, pain management at hospital, when to call 112. Under 100 words.`,
  },
  {
    id: "mental-health",
    title: "Mental Wellness Check",
    description: "Confidential emotional wellbeing support. Mental health services are scarce and stigmatized in Nigeria.",
    icon: "psychology",
    problem: "Mental health — less than 10% of Nigerians access care",
    fields: [
      { name: "fullName", label: "First Name (optional)", type: "text", required: false },
      { name: "ageRange", label: "Age", type: "text", required: true },
      { name: "symptoms", label: "How are you feeling? (stress, anxiety, sadness, sleep issues)", type: "textarea", required: true },
    ],
    prompt: (data) =>
      `A ${data.ageRange} year old in Nigeria shares: ${data.symptoms}. ` +
      `Respond with empathy and practical coping strategies. Mention Lagos/Abuja mental health helplines if severe. ` +
      `Normalize seeking help. If suicidal ideation, urge calling 08062106493 immediately. Under 100 words.`,
  },
  {
    id: "medication-safety",
    title: "Medication Safety",
    description: "Check if self-medication is safe. Counterfeit drugs and harmful drug combinations are common in Nigeria.",
    icon: "medication",
    problem: "Fake drugs & self-medication — 17% of drugs in Nigeria may be counterfeit",
    fields: [
      { name: "fullName", label: "Full Name", type: "text", required: true },
      { name: "medications", label: "Drugs you are taking or plan to take", type: "textarea", required: true },
      { name: "symptoms", label: "What are you treating?", type: "textarea", required: true },
    ],
    prompt: (data) =>
      `A Nigerian wants to take these medications: ${data.medications} for: ${data.symptoms}. ` +
      `Warn about dangerous self-medication, drug interactions, and counterfeit drugs. ` +
      `Advise buying only from licensed pharmacies and verifying with NAFDAC. Under 100 words.`,
  },
  {
    id: "hiv-awareness",
    title: "HIV Risk Assessment",
    description: "Confidential guidance on HIV risk and where to get free testing in Nigeria. 1.9 million Nigerians live with HIV.",
    icon: "health_and_safety",
    problem: "HIV — 1.9 million Nigerians living with HIV, many undiagnosed",
    fields: [
      { name: "ageRange", label: "Age", type: "text", required: true },
      { name: "symptoms", label: "Describe your situation (exposure, symptoms, or concerns)", type: "textarea", required: true },
    ],
    prompt: (data) =>
      `A ${data.ageRange} year old in Nigeria asks about HIV: ${data.symptoms}. ` +
      `Provide non-judgmental guidance on testing urgency, free testing at PHCs, and that ART is free. ` +
      `Do not diagnose. Encourage testing at nearest facility. Under 100 words.`,
  },
  {
    id: "child-nutrition",
    title: "Child Nutrition & ORS Guide",
    description: "Assess malnutrition and dehydration in children. Stunting affects 37% of Nigerian children under 5.",
    icon: "restaurant",
    problem: "Malnutrition — 37% of Nigerian children are stunted",
    fields: [
      { name: "fullName", label: "Parent/Guardian Name", type: "text", required: true },
      { name: "childAge", label: "Child's Age (months/years)", type: "text", required: true },
      { name: "symptoms", label: "Symptoms (diarrhoea, vomiting, not eating, weight loss)", type: "textarea", required: true },
    ],
    prompt: (data) =>
      `A Nigerian parent reports their ${data.childAge} old child: ${data.symptoms}. ` +
      `Assess dehydration/malnutrition risk. Explain ORS preparation (1 litre clean water + 6 level teaspoons sugar + half teaspoon salt). ` +
      `When to go to PHC urgently. Under 100 words.`,
  },
  {
    id: "snake-bite",
    title: "Snake Bite First Aid",
    description: "Immediate first aid for snake bites — common in rural Nigeria. Wrong actions can worsen outcomes.",
    icon: "emergency",
    problem: "Snake bites — 15,000+ cases/year, highest in rural Nigeria",
    fields: [
      { name: "fullName", label: "Full Name", type: "text", required: true },
      { name: "symptoms", label: "What happened? (bite location, snake type if known, symptoms)", type: "textarea", required: true },
    ],
    prompt: (data) =>
      `Snake bite reported in Nigeria: ${data.symptoms}. ` +
      `Give immediate first aid: keep calm, immobilise limb, remove tight clothing/jewellery, do NOT cut/suck wound or apply tourniquet. ` +
      `Go to hospital with antivenom immediately. Call 112. Under 100 words.`,
  },
  {
    id: "prescription-reader",
    title: "Prescription Explainer",
    description: "Understand your doctor's prescription in plain language. Health literacy is low — 4 in 10 Nigerians cannot read medical instructions.",
    icon: "menu_book",
    problem: "Health literacy — many cannot understand medical prescriptions",
    fields: [
      { name: "fullName", label: "Full Name", type: "text", required: true },
      { name: "medications", label: "Paste your prescription or drug names here", type: "textarea", required: true },
    ],
    prompt: (data) =>
      `Explain this Nigerian prescription in simple plain English: ${data.medications}. ` +
      `For each drug: what it does, how to take it, common side effects, foods to avoid. ` +
      `Warn not to share antibiotics. Under 120 words.`,
  },
  {
    id: "herbal-safety",
    title: "Herbal Medicine Safety",
    description: "Check if traditional/herbal remedies are safe alongside your medications. Herb-drug interactions cause harm in Nigeria.",
    icon: "spa",
    problem: "Traditional medicine — herb-drug interactions and delayed hospital care",
    fields: [
      { name: "fullName", label: "Full Name", type: "text", required: true },
      { name: "medications", label: "Herbal remedies or traditional treatments you use", type: "textarea", required: true },
      { name: "symptoms", label: "Condition being treated + any prescribed drugs", type: "textarea", required: true },
    ],
    prompt: (data) =>
      `A Nigerian uses herbal remedies: ${data.medications} for: ${data.symptoms}. ` +
      `Warn about dangerous herb-drug interactions, delayed hospital care, and unregulated products. ` +
      `Advise telling their doctor about all herbs used. Under 100 words.`,
  },
];

module.exports = {
  EMERGENCY_CONTACTS,
  COMMON_CONDITIONS,
  HEALTH_RESOURCES,
  HEALTH_TIPS,
  HEALTH_TOOLS,
  OUTBREAK_ALERTS,
  IMMUNIZATION_SCHEDULE,
  PHC_STATES,
};
