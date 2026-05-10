import { useEffect, useMemo, useRef, useState } from "react";
import { motion } from "framer-motion";
import { Canvas, useFrame } from "@react-three/fiber";
import { Float, MeshDistortMaterial, Sparkles as ParticleSparkles, Stars } from "@react-three/drei";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import Lenis from "lenis";
import {
  Activity,
  Ambulance,
  ArrowUpRight,
  ChevronRight,
  ChevronLeft,
  Baby,
  Bone,
  Brain,
  Building2,
  CheckCircle2,
  Clock3,
  HeartPulse,
  PhoneCall,
  Radiation,
  ShieldCheck,
  Sparkles,
  Stethoscope,
  Syringe,
  Waves
} from "lucide-react";
import { fetchHospitalContent, submitAppointment } from "./api/fetchContent";
import { fallbackContent } from "./content/fallbackContent";

gsap.registerPlugin(ScrollTrigger);

const sectionMap = {
  Home: "hero",
  Symptoms: "symptoms",
  Treatments: "treatments",
  "Why Choose Us": "why",
  Doctors: "doctors",
  Technology: "technology",
  Testimonials: "testimonials",
  Insurance: "insurance",
  FAQ: "faq"
};

const treatmentIcons = {
  "Cardiac Sciences": HeartPulse,
  "Vascular Care": Waves,
  Oncology: Radiation,
  Orthopedics: Bone,
  "Gastro Sciences": Stethoscope,
  "Neuro Sciences": Brain,
  "Mother & Child Care": Baby,
  "Vascular & Endovenous Program": Syringe,
  Urology: Activity,
  "Breast Oncology": ShieldCheck
};

const symptomIcons = {
  "Cardiac Warning Signs": HeartPulse,
  "Bone & Joint Distress": Bone,
  "Digestive & Liver Concerns": Stethoscope,
  "Neuro & Spine Symptoms": Brain
};

const DISEASES = [
  { 
    name: "Abdominal Aortic Aneurysm", 
    specialist: "Vascular Surgeon",
    about: "A bulge in the wall of the aorta, the main blood vessel that carries blood from the heart through the chest and abdomen.",
    symptoms: ["Pulsating feeling near navel", "Deep constant pain in abdomen", "Back pain", "Sudden severe pain if rupture occurs"],
    treatment: ["Regular monitoring with ultrasound", "Blood pressure management", "Surgical repair for large aneurysms", "Endovascular aneurysm repair (EVAR)"]
  },
  { 
    name: "Acne", 
    specialist: "Dermatologist",
    about: "A common skin condition where hair follicles become clogged with oil and dead skin cells, causing pimples, blackheads, and whiteheads.",
    symptoms: ["Whiteheads and blackheads", "Pimples and pustules", "Nodules or cysts", "Oily skin", "Scarring in severe cases"],
    treatment: ["Topical retinoids and benzoyl peroxide", "Oral antibiotics for moderate-severe acne", "Hormonal therapy for women", "Isotretinoin for severe cystic acne", "Chemical peels and laser therapy"]
  },
  { 
    name: "Acoustic Neuroma", 
    specialist: "Specialist Physician",
    about: "A benign tumor that develops on the nerve connecting the ear to the brain, affecting hearing and balance.",
    symptoms: ["Gradual hearing loss", "Ringing in the ear (tinnitus)", "Loss of balance", "Dizziness", "Facial numbness"],
    treatment: ["Observation with regular MRI scans", "Stereotactic radiosurgery", "Surgical removal", "Hearing aids for hearing loss"]
  },
  { 
    name: "Acute Kidney Injury", 
    specialist: "Nephrologist",
    about: "Sudden loss of kidney function that develops within hours or days, causing waste products to build up in the blood.",
    symptoms: ["Decreased urine output", "Fluid retention causing swelling", "Shortness of breath", "Fatigue", "Confusion", "Nausea"],
    treatment: ["Treating underlying cause", "Dialysis if severe", "Fluid and electrolyte management", "Medications to control potassium"]
  },
  { 
    name: "Acute Pancreatitis", 
    specialist: "Gastroenterologist",
    about: "Sudden inflammation of the pancreas causing severe abdominal pain and digestive problems.",
    symptoms: ["Severe upper abdominal pain", "Pain radiating to back", "Nausea and vomiting", "Fever", "Rapid pulse"],
    treatment: ["Hospitalization with IV fluids", "Pain management", "Fasting to rest pancreas", "Treating underlying cause (gallstones, alcohol)", "Surgery if complications develop"]
  },
  { name: "Addison's Disease", specialist: "Endocrinologist", about: "A disorder where adrenal glands don't produce enough hormones.", symptoms: ["Extreme fatigue", "Weight loss", "Low blood pressure", "Darkening of skin", "Salt craving"], treatment: ["Hormone replacement therapy", "Corticosteroid medications", "Regular monitoring", "Emergency injection kit"] },
  { name: "ADHD (Attention Deficit Hyperactivity Disorder)", specialist: "Psychiatrist", about: "A neurodevelopmental disorder affecting attention, hyperactivity, and impulsivity.", symptoms: ["Difficulty focusing", "Hyperactivity", "Impulsiveness", "Disorganization", "Forgetfulness"], treatment: ["Stimulant medications", "Behavioral therapy", "Counseling", "Educational support", "Lifestyle modifications"] },
  { name: "Age-related Macular Degeneration", specialist: "Ophthalmologist", about: "Progressive eye condition affecting central vision in older adults.", symptoms: ["Blurred central vision", "Difficulty reading", "Straight lines appear wavy", "Dark or empty areas in vision"], treatment: ["Anti-VEGF injections", "Laser therapy", "Vitamins and supplements", "Low vision aids"] },
  { name: "Agoraphobia", specialist: "Psychiatrist", about: "Anxiety disorder involving fear of places or situations that might cause panic.", symptoms: ["Fear of open spaces", "Panic attacks", "Avoidance behavior", "Anxiety in crowds", "Fear of leaving home"], treatment: ["Cognitive behavioral therapy", "Exposure therapy", "Anti-anxiety medications", "Antidepressants", "Support groups"] },
  { name: "Alcoholic Liver Disease", specialist: "Gastroenterologist", about: "Liver damage caused by excessive alcohol consumption over time.", symptoms: ["Fatigue", "Jaundice", "Abdominal pain", "Swelling in legs", "Confusion"], treatment: ["Complete alcohol cessation", "Nutritional support", "Medications for complications", "Liver transplant in severe cases"] },
  { name: "Allergic Rhinitis", specialist: "ENT Specialist", about: "Inflammation of nasal passages due to allergens causing hay fever symptoms.", symptoms: ["Sneezing", "Runny or stuffy nose", "Itchy eyes and nose", "Postnasal drip", "Fatigue"], treatment: ["Antihistamines", "Nasal corticosteroids", "Decongestants", "Allergen avoidance", "Immunotherapy"] },
  { name: "Alzheimer's Disease", specialist: "Neurologist", about: "Progressive brain disorder causing memory loss and cognitive decline.", symptoms: ["Memory loss", "Confusion", "Difficulty with familiar tasks", "Language problems", "Personality changes"], treatment: ["Cholinesterase inhibitors", "Memantine", "Cognitive therapy", "Supportive care", "Clinical trials"] },
  { name: "Amyloidosis", specialist: "Hematologist", about: "Rare disease where abnormal protein builds up in organs.", symptoms: ["Fatigue", "Swelling in ankles", "Shortness of breath", "Numbness in hands/feet", "Enlarged tongue"], treatment: ["Chemotherapy", "Stem cell transplant", "Targeted therapy", "Organ support", "Clinical trials"] },
  { name: "Anemia", specialist: "Hematologist", about: "Condition where blood lacks enough healthy red blood cells to carry oxygen.", symptoms: ["Fatigue", "Weakness", "Pale skin", "Shortness of breath", "Dizziness", "Cold hands and feet"], treatment: ["Iron supplements", "Vitamin B12 injections", "Blood transfusions", "Treating underlying cause", "Dietary changes"] },
  { name: "Angina", specialist: "Cardiologist", about: "Chest pain caused by reduced blood flow to the heart muscle.", symptoms: ["Chest pressure or pain", "Pain in arms, neck, jaw", "Shortness of breath", "Fatigue", "Nausea"], treatment: ["Nitrates", "Beta-blockers", "Calcium channel blockers", "Lifestyle changes", "Angioplasty or bypass surgery"] },
  { name: "Anxiety Disorder", specialist: "Psychiatrist", about: "Mental health condition causing excessive worry and fear.", symptoms: ["Excessive worry", "Restlessness", "Difficulty concentrating", "Sleep problems", "Physical tension"], treatment: ["Cognitive behavioral therapy", "Anti-anxiety medications", "SSRIs", "Relaxation techniques", "Lifestyle modifications"] },
  { name: "Appendicitis", specialist: "General Surgeon", about: "Inflammation of the appendix requiring emergency surgery.", symptoms: ["Sudden pain near navel", "Pain moving to lower right abdomen", "Nausea and vomiting", "Fever", "Loss of appetite"], treatment: ["Emergency appendectomy", "Antibiotics", "Pain management", "Laparoscopic surgery"] },
  { name: "Arrhythmia", specialist: "Cardiologist", about: "Irregular heartbeat that can be too fast, too slow, or erratic.", symptoms: ["Palpitations", "Dizziness", "Shortness of breath", "Chest discomfort", "Fatigue"], treatment: ["Antiarrhythmic medications", "Blood thinners", "Cardioversion", "Catheter ablation", "Pacemaker or ICD"] },
  { name: "Diabetes Mellitus", specialist: "Endocrinologist", about: "A chronic condition affecting how the body processes blood sugar (glucose).", symptoms: ["Increased thirst", "Frequent urination", "Extreme hunger", "Unexplained weight loss", "Fatigue", "Blurred vision"], treatment: ["Insulin therapy", "Oral medications", "Blood sugar monitoring", "Healthy diet and exercise", "Regular check-ups"] },
  { name: "Asthma", specialist: "Pulmonologist", about: "A chronic respiratory condition causing inflammation and narrowing of airways.", symptoms: ["Shortness of breath", "Chest tightness", "Wheezing", "Coughing, especially at night"], treatment: ["Inhaled corticosteroids", "Bronchodilators", "Avoiding triggers", "Action plan for attacks"] },
  { name: "Atrial Fibrillation", specialist: "Cardiologist", about: "Irregular and often rapid heart rhythm that can lead to blood clots.", symptoms: ["Palpitations", "Weakness", "Reduced exercise capacity", "Fatigue", "Dizziness", "Chest pain"], treatment: ["Blood thinners", "Rate control medications", "Rhythm control medications", "Cardioversion", "Catheter ablation"] },
  { name: "Back Pain", specialist: "Orthopedic Surgeon", about: "Pain in the back that can range from mild to severe and acute to chronic.", symptoms: ["Muscle ache", "Shooting or stabbing pain", "Pain radiating down leg", "Limited flexibility", "Difficulty standing straight"], treatment: ["Physical therapy", "Pain medications", "Hot/cold therapy", "Exercise", "Surgery in severe cases"] },
  { name: "Bell's Palsy", specialist: "Neurologist", about: "Sudden weakness or paralysis of facial muscles on one side.", symptoms: ["Sudden facial weakness", "Drooping on one side", "Difficulty closing eye", "Drooling", "Loss of taste"], treatment: ["Corticosteroids", "Antiviral medications", "Eye protection", "Physical therapy", "Most recover within weeks"] },
  { name: "Benign Prostatic Hyperplasia", specialist: "Urologist", about: "Non-cancerous enlargement of the prostate gland in men.", symptoms: ["Frequent urination", "Weak urine stream", "Difficulty starting urination", "Incomplete bladder emptying", "Nighttime urination"], treatment: ["Alpha blockers", "5-alpha reductase inhibitors", "Minimally invasive procedures", "Surgery (TURP)"] },
  { name: "Bladder Cancer", specialist: "Urologist", about: "Cancer that begins in the cells of the bladder.", symptoms: ["Blood in urine", "Painful urination", "Frequent urination", "Back pain", "Pelvic pain"], treatment: ["Surgery to remove tumor", "Chemotherapy", "Immunotherapy", "Radiation therapy", "BCG therapy"] },
  { name: "Brain Tumor", specialist: "Neurosurgeon", about: "Abnormal growth of cells in the brain, can be benign or malignant.", symptoms: ["Headaches", "Seizures", "Vision problems", "Balance issues", "Personality changes", "Nausea"], treatment: ["Surgery", "Radiation therapy", "Chemotherapy", "Targeted drug therapy", "Steroids to reduce swelling"] },
  { name: "Breast Cancer", specialist: "Oncologist", about: "Cancer that forms in the cells of the breasts.", symptoms: ["Breast lump", "Change in breast shape", "Skin dimpling", "Nipple discharge", "Redness or scaling"], treatment: ["Surgery (lumpectomy/mastectomy)", "Chemotherapy", "Radiation therapy", "Hormone therapy", "Targeted therapy"] },
  { name: "Bronchitis", specialist: "Pulmonologist", about: "Inflammation of the bronchial tubes causing cough and mucus production.", symptoms: ["Persistent cough", "Mucus production", "Fatigue", "Shortness of breath", "Chest discomfort", "Low fever"], treatment: ["Rest and fluids", "Cough medicine", "Bronchodilators", "Antibiotics if bacterial", "Avoiding irritants"] },
  { name: "Carpal Tunnel Syndrome", specialist: "Orthopedic Surgeon", about: "Compression of the median nerve in the wrist causing hand numbness.", symptoms: ["Numbness in thumb and fingers", "Tingling sensation", "Weakness in hand", "Pain radiating to arm", "Difficulty gripping"], treatment: ["Wrist splinting", "NSAIDs", "Corticosteroid injections", "Physical therapy", "Carpal tunnel release surgery"] },
  { name: "Cataracts", specialist: "Ophthalmologist", about: "Clouding of the eye's natural lens affecting vision.", symptoms: ["Cloudy or blurry vision", "Faded colors", "Glare sensitivity", "Poor night vision", "Double vision"], treatment: ["Stronger eyeglasses initially", "Cataract surgery", "Intraocular lens implant", "Usually outpatient procedure"] },
  { name: "Celiac Disease", specialist: "Gastroenterologist", about: "Immune reaction to eating gluten that damages the small intestine.", symptoms: ["Diarrhea", "Bloating", "Gas", "Fatigue", "Weight loss", "Anemia"], treatment: ["Strict gluten-free diet", "Nutritional supplements", "Monitoring for complications", "Dietitian consultation"] },
  { name: "Cervical Cancer", specialist: "Gynecologist", about: "Cancer occurring in the cells of the cervix.", symptoms: ["Abnormal vaginal bleeding", "Pelvic pain", "Pain during intercourse", "Watery discharge"], treatment: ["Surgery", "Radiation therapy", "Chemotherapy", "Targeted therapy", "HPV vaccination for prevention"] },
  { name: "Chronic Kidney Disease", specialist: "Nephrologist", about: "Gradual loss of kidney function over time.", symptoms: ["Fatigue", "Swelling in feet and ankles", "Decreased urine output", "Nausea", "Confusion"], treatment: ["Blood pressure medications", "Diabetes control", "Dietary changes", "Dialysis", "Kidney transplant"] },
  { name: "Chronic Obstructive Pulmonary Disease", specialist: "Pulmonologist", about: "Progressive lung disease causing breathing difficulty.", symptoms: ["Shortness of breath", "Chronic cough", "Mucus production", "Wheezing", "Chest tightness"], treatment: ["Bronchodilators", "Inhaled steroids", "Oxygen therapy", "Pulmonary rehabilitation", "Smoking cessation"] },
  { name: "Cirrhosis", specialist: "Gastroenterologist", about: "Late-stage scarring of the liver caused by various diseases.", symptoms: ["Fatigue", "Easy bruising", "Jaundice", "Fluid accumulation", "Confusion"], treatment: ["Treating underlying cause", "Medications for complications", "Dietary changes", "Liver transplant in advanced cases"] },
  { name: "Colorectal Cancer", specialist: "Gastroenterologist", about: "Cancer of the colon or rectum.", symptoms: ["Change in bowel habits", "Blood in stool", "Abdominal pain", "Unexplained weight loss", "Fatigue"], treatment: ["Surgery", "Chemotherapy", "Radiation therapy", "Targeted drug therapy", "Immunotherapy"] },
  { name: "Coronary Artery Disease", specialist: "Cardiologist", about: "Narrowing of coronary arteries reducing blood flow to the heart.", symptoms: ["Chest pain (angina)", "Shortness of breath", "Heart attack", "Fatigue"], treatment: ["Lifestyle changes", "Medications", "Angioplasty and stenting", "Coronary artery bypass surgery"] },
  { name: "Deep Vein Thrombosis", specialist: "Vascular Surgeon", about: "Blood clot in a deep vein, usually in the legs.", symptoms: ["Leg swelling", "Pain in leg", "Red or discolored skin", "Warm feeling in leg"], treatment: ["Blood thinners", "Clot busters", "Compression stockings", "Filters", "Thrombectomy"] },
  { name: "Depression", specialist: "Psychiatrist", about: "Mental health disorder causing persistent sadness and loss of interest.", symptoms: ["Persistent sadness", "Loss of interest", "Sleep changes", "Fatigue", "Difficulty concentrating"], treatment: ["Antidepressants", "Psychotherapy", "Cognitive behavioral therapy", "Lifestyle changes", "ECT in severe cases"] },
  { name: "Hypertension", specialist: "Cardiologist", about: "High blood pressure that can lead to serious health complications if untreated.", symptoms: ["Often no symptoms", "Headaches", "Shortness of breath", "Nosebleeds in severe cases"], treatment: ["Lifestyle modifications", "Blood pressure medications", "Regular monitoring", "Stress management"] },
  { name: "Migraine", specialist: "Neurologist", about: "A neurological condition causing intense, debilitating headaches.", symptoms: ["Severe throbbing pain", "Nausea and vomiting", "Sensitivity to light and sound", "Visual disturbances (aura)"], treatment: ["Pain relief medications", "Preventive medications", "Lifestyle changes", "Avoiding triggers"] },
  { name: "Arthritis", specialist: "Rheumatologist", about: "Inflammation of one or more joints causing pain and stiffness.", symptoms: ["Joint pain", "Stiffness", "Swelling", "Reduced range of motion"], treatment: ["Anti-inflammatory medications", "Physical therapy", "Joint injections", "Surgery in severe cases"] },
  { name: "Disc Herniation", specialist: "Orthopedic Surgeon", about: "Spinal disc pushes out causing nerve compression and pain.", symptoms: ["Back or neck pain", "Numbness or tingling", "Muscle weakness", "Pain radiating to limbs"], treatment: ["Physical therapy", "Pain medications", "Epidural injections", "Surgery (discectomy) if severe"] },
  { name: "Eczema", specialist: "Dermatologist", about: "Chronic skin condition causing itchy, inflamed patches.", symptoms: ["Itchy skin", "Red or brownish patches", "Dry, cracked skin", "Small raised bumps", "Thickened skin"], treatment: ["Moisturizers", "Topical corticosteroids", "Antihistamines", "Avoiding triggers", "Phototherapy"] },
  { name: "Endometriosis", specialist: "Gynecologist", about: "Tissue similar to uterine lining grows outside the uterus.", symptoms: ["Painful periods", "Chronic pelvic pain", "Pain during intercourse", "Infertility", "Heavy bleeding"], treatment: ["Pain medications", "Hormone therapy", "Birth control pills", "Surgery", "Fertility treatment"] },
  { name: "Epilepsy", specialist: "Neurologist", about: "Neurological disorder causing recurrent seizures.", symptoms: ["Seizures", "Temporary confusion", "Staring spells", "Uncontrollable jerking", "Loss of consciousness"], treatment: ["Anti-seizure medications", "Vagus nerve stimulation", "Ketogenic diet", "Brain surgery in some cases"] },
  { name: "Fatty Liver Disease", specialist: "Gastroenterologist", about: "Excess fat buildup in liver cells.", symptoms: ["Often no symptoms", "Fatigue", "Upper right abdominal discomfort", "Enlarged liver"], treatment: ["Weight loss", "Healthy diet", "Exercise", "Avoiding alcohol", "Managing diabetes and cholesterol"] },
  { name: "Fibromyalgia", specialist: "Rheumatologist", about: "Chronic condition causing widespread musculoskeletal pain.", symptoms: ["Widespread pain", "Fatigue", "Sleep problems", "Cognitive difficulties", "Headaches"], treatment: ["Pain relievers", "Antidepressants", "Anti-seizure drugs", "Physical therapy", "Stress management"] },
  { name: "Gallstones", specialist: "Gastroenterologist", about: "Hardened deposits in the gallbladder.", symptoms: ["Sudden intense pain in upper right abdomen", "Back pain between shoulder blades", "Nausea", "Vomiting"], treatment: ["Observation if no symptoms", "Cholecystectomy (gallbladder removal)", "Medications to dissolve stones", "ERCP for bile duct stones"] },
  { name: "Gastroesophageal Reflux Disease", specialist: "Gastroenterologist", about: "Chronic acid reflux from stomach into esophagus.", symptoms: ["Heartburn", "Regurgitation", "Difficulty swallowing", "Chest pain", "Chronic cough"], treatment: ["Antacids", "H2 blockers", "Proton pump inhibitors", "Lifestyle changes", "Surgery (fundoplication)"] },
  { name: "Glaucoma", specialist: "Ophthalmologist", about: "Eye condition damaging the optic nerve, often from high pressure.", symptoms: ["Gradual vision loss", "Eye pain", "Halos around lights", "Redness", "Nausea"], treatment: ["Eye drops", "Oral medications", "Laser therapy", "Surgery", "Regular monitoring"] },
  { name: "Gout", specialist: "Rheumatologist", about: "Form of arthritis causing sudden, severe joint pain from uric acid crystals.", symptoms: ["Intense joint pain", "Inflammation", "Redness", "Limited range of motion", "Often affects big toe"], treatment: ["NSAIDs", "Colchicine", "Corticosteroids", "Uric acid-lowering drugs", "Dietary changes"] },
  { name: "Heart Failure", specialist: "Cardiologist", about: "Condition where heart can't pump blood effectively.", symptoms: ["Shortness of breath", "Fatigue", "Swelling in legs", "Rapid heartbeat", "Persistent cough"], treatment: ["ACE inhibitors", "Beta blockers", "Diuretics", "Lifestyle changes", "Implantable devices", "Heart transplant"] },
  { name: "Hepatitis B", specialist: "Gastroenterologist", about: "Viral infection attacking the liver.", symptoms: ["Jaundice", "Abdominal pain", "Dark urine", "Fatigue", "Nausea"], treatment: ["Antiviral medications", "Interferon injections", "Liver transplant in severe cases", "Vaccination for prevention"] },
  { name: "Hepatitis C", specialist: "Gastroenterologist", about: "Viral infection causing liver inflammation.", symptoms: ["Fatigue", "Jaundice", "Abdominal pain", "Joint pain", "Dark urine"], treatment: ["Direct-acting antivirals", "Combination therapy", "Liver transplant if cirrhosis develops", "Regular monitoring"] },
  { name: "Hernia", specialist: "General Surgeon", about: "Organ or tissue pushes through weak spot in surrounding muscle.", symptoms: ["Visible bulge", "Pain or discomfort", "Heaviness feeling", "Burning sensation"], treatment: ["Watchful waiting if small", "Hernia repair surgery", "Laparoscopic repair", "Open surgery"] },
  { name: "High Blood Pressure", specialist: "Cardiologist", about: "Elevated force of blood against artery walls.", symptoms: ["Often no symptoms", "Headaches", "Shortness of breath", "Nosebleeds"], treatment: ["Lifestyle modifications", "Diuretics", "ACE inhibitors", "Calcium channel blockers", "Beta blockers"] },
  { name: "High Cholesterol", specialist: "Cardiologist", about: "Excess cholesterol in blood increasing heart disease risk.", symptoms: ["Usually no symptoms", "Detected through blood test"], treatment: ["Statins", "Bile acid sequestrants", "PCSK9 inhibitors", "Diet and exercise", "Weight management"] },
  { name: "HIV/AIDS", specialist: "Infectious Disease Specialist", about: "Virus attacking immune system.", symptoms: ["Flu-like symptoms initially", "Fever", "Fatigue", "Swollen lymph nodes", "Weight loss"], treatment: ["Antiretroviral therapy (ART)", "Combination drug therapy", "Preventive medications", "Regular monitoring"] },
  { name: "Hypothyroidism", specialist: "Endocrinologist", about: "Underactive thyroid gland not producing enough hormones.", symptoms: ["Fatigue", "Weight gain", "Cold sensitivity", "Dry skin", "Hair loss", "Depression"], treatment: ["Thyroid hormone replacement", "Levothyroxine", "Regular blood tests", "Lifelong treatment"] },
  { name: "Inflammatory Bowel Disease", specialist: "Gastroenterologist", about: "Chronic inflammation of digestive tract (Crohn's or Ulcerative Colitis).", symptoms: ["Diarrhea", "Abdominal pain", "Blood in stool", "Weight loss", "Fatigue"], treatment: ["Anti-inflammatory drugs", "Immune system suppressors", "Biologics", "Antibiotics", "Surgery"] },
  { name: "Irritable Bowel Syndrome", specialist: "Gastroenterologist", about: "Chronic disorder affecting the large intestine.", symptoms: ["Abdominal pain", "Bloating", "Gas", "Diarrhea or constipation", "Mucus in stool"], treatment: ["Dietary changes", "Fiber supplements", "Anti-diarrheal medications", "Antispasmodics", "Stress management"] },
  { name: "Kidney Stones", specialist: "Urologist", about: "Hard deposits of minerals and salts in kidneys.", symptoms: ["Severe pain in side and back", "Pain radiating to lower abdomen", "Painful urination", "Pink or red urine", "Nausea"], treatment: ["Pain relievers", "Drinking lots of water", "Medical therapy", "Lithotripsy", "Surgical removal"] },
  { name: "Lung Cancer", specialist: "Oncologist", about: "Cancer beginning in the lungs.", symptoms: ["Persistent cough", "Coughing up blood", "Chest pain", "Shortness of breath", "Weight loss"], treatment: ["Surgery", "Chemotherapy", "Radiation therapy", "Targeted drug therapy", "Immunotherapy"] },
  { name: "Lupus", specialist: "Rheumatologist", about: "Autoimmune disease where immune system attacks own tissues.", symptoms: ["Fatigue", "Joint pain", "Butterfly rash on face", "Fever", "Photosensitivity"], treatment: ["NSAIDs", "Antimalarial drugs", "Corticosteroids", "Immunosuppressants", "Biologics"] },
  { name: "Multiple Sclerosis", specialist: "Neurologist", about: "Autoimmune disease affecting brain and spinal cord.", symptoms: ["Numbness or weakness", "Vision problems", "Fatigue", "Dizziness", "Difficulty walking"], treatment: ["Disease-modifying therapies", "Corticosteroids", "Physical therapy", "Muscle relaxants", "Symptom management"] },
  { name: "Osteoporosis", specialist: "Orthopedic Surgeon", about: "Bones become weak and brittle.", symptoms: ["Often no symptoms until fracture", "Back pain", "Loss of height", "Stooped posture"], treatment: ["Bisphosphonates", "Calcium and vitamin D", "Weight-bearing exercise", "Hormone therapy", "Fall prevention"] },
  { name: "Parkinson's Disease", specialist: "Neurologist", about: "Progressive nervous system disorder affecting movement.", symptoms: ["Tremor", "Slowed movement", "Rigid muscles", "Impaired balance", "Speech changes"], treatment: ["Levodopa", "Dopamine agonists", "MAO-B inhibitors", "Deep brain stimulation", "Physical therapy"] },
  { name: "Pneumonia", specialist: "Pulmonologist", about: "Infection inflaming air sacs in lungs.", symptoms: ["Cough with phlegm", "Fever", "Chest pain", "Shortness of breath", "Fatigue"], treatment: ["Antibiotics", "Antiviral medications", "Fever reducers", "Cough medicine", "Hospitalization if severe"] },
  { name: "Psoriasis", specialist: "Dermatologist", about: "Autoimmune condition causing rapid skin cell buildup.", symptoms: ["Red patches with silvery scales", "Dry, cracked skin", "Itching", "Thickened nails"], treatment: ["Topical corticosteroids", "Vitamin D analogues", "Phototherapy", "Systemic medications", "Biologics"] },
  { name: "Rheumatoid Arthritis", specialist: "Rheumatologist", about: "Autoimmune disorder causing joint inflammation.", symptoms: ["Tender, swollen joints", "Morning stiffness", "Fatigue", "Fever", "Weight loss"], treatment: ["DMARDs", "Biologics", "NSAIDs", "Corticosteroids", "Physical therapy"] },
  { name: "Stroke", specialist: "Neurologist", about: "Interruption of blood supply to brain.", symptoms: ["Sudden numbness", "Confusion", "Trouble speaking", "Vision problems", "Severe headache"], treatment: ["Emergency clot-busting drugs", "Mechanical thrombectomy", "Rehabilitation", "Preventive medications"] },
  { name: "Tuberculosis", specialist: "Pulmonologist", about: "Bacterial infection primarily affecting lungs.", symptoms: ["Persistent cough", "Coughing up blood", "Chest pain", "Fever", "Night sweats", "Weight loss"], treatment: ["Combination antibiotics for 6-9 months", "Directly observed therapy", "Isolation initially", "Preventive treatment for contacts"] },
  { name: "Urinary Tract Infection", specialist: "Urologist", about: "Infection in any part of the urinary system.", symptoms: ["Burning during urination", "Frequent urination", "Cloudy urine", "Pelvic pain", "Strong-smelling urine"], treatment: ["Antibiotics", "Increased fluid intake", "Pain relievers", "Preventive measures"] }
];

const ALPHABET = "ABCDEFGHIJKLMNOPQRSTUVWXYZ".split("");

function DiseasesConditions() {
  const [search, setSearch] = useState("");
  const [activeLetter, setActiveLetter] = useState("A");
  const [selectedDisease, setSelectedDisease] = useState(null);

  const filtered = useMemo(() => {
    if (search.trim()) {
      return DISEASES.filter((d) =>
        d.name.toLowerCase().includes(search.toLowerCase())
      );
    }
    if (!activeLetter) return [];
    return DISEASES.filter((d) =>
      d.name.toUpperCase().startsWith(activeLetter)
    );
  }, [search, activeLetter]);

  const handleLetterClick = (letter) => {
    if (activeLetter === letter && !search) {
      setActiveLetter(null);
    } else {
      setActiveLetter(letter);
      setSearch("");
    }
  };

  const handleDiseaseClick = (disease) => {
    setSelectedDisease(disease);
  };

  const closeModal = () => {
    setSelectedDisease(null);
  };

  return (
    <>
      <div className="diseases-section">
        <div className="diseases-header">
          <div className="diseases-header-left">
            <h2 className="diseases-title">Diseases &amp; Conditions</h2>
            <p className="diseases-subtitle">Easy-to-understand answers about diseases and conditions</p>
            <p className="diseases-search-label">Search diseases &amp; conditions</p>
            <div className="diseases-search-wrap">
              <Activity size={16} className="diseases-search-icon" />
              <input
                className="diseases-search-input"
                type="text"
                placeholder="Search..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
          </div>
          <div className="diseases-header-right">
            <p className="diseases-alpha-label">Find diseases &amp; conditions by first letter</p>
            <div className="diseases-alpha-grid">
              {ALPHABET.map((letter) => (
                <button
                  key={letter}
                  className={`diseases-alpha-btn ${activeLetter === letter && !search ? "active" : ""}`}
                  onClick={() => handleLetterClick(letter)}
                >
                  {letter}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="diseases-results">
          <p className="diseases-count">
            {(!activeLetter && !search.trim()) ? "Select a letter or search to find conditions" : `${filtered.length} condition${filtered.length !== 1 ? "s" : ""} found`}
            {search && (
              <button className="diseases-clear" onClick={() => setSearch("")}>
                ✕ Clear Results
              </button>
            )}
          </p>
          
          {!selectedDisease && (activeLetter || search.trim()) && (
            <div className="diseases-grid">
              {filtered.length > 0 ? (
                filtered.map((d) => (
                  <div key={d.name} className="disease-card" onClick={() => handleDiseaseClick(d)}>
                    <p className="disease-name">{d.name}</p>
                    <p className="disease-specialist">{d.specialist}</p>
                  </div>
                ))
              ) : (
                <p className="diseases-empty">No conditions found. Try a different search.</p>
              )}
            </div>
          )}

          {selectedDisease && (
            <div className="disease-detail-panel">
              <button className="disease-detail-back" onClick={closeModal}>
                <ChevronLeft size={20} /> Back to results
              </button>
              
              <div className="disease-modal-content">
                <div className="disease-modal-top">
                  <p className="disease-modal-badge">
                    <Stethoscope size={14} /> {selectedDisease.specialist.toUpperCase()}
                  </p>
                  <h2 className="disease-modal-title">{selectedDisease.name}</h2>
                </div>

                <div className="disease-modal-overview">
                  <h3>Patient Overview</h3>
                  <p>{selectedDisease.about}</p>
                </div>

                <div className="disease-modal-grid">
                  <div className="disease-info-card">
                    <div className="disease-info-icon">
                      <Activity size={18} />
                    </div>
                    <h4>Typical Symptoms</h4>
                    <ul>
                      {selectedDisease.symptoms.slice(0, 1).map((symptom, i) => (
                        <li key={i}>Consult our specialists for a detailed symptom assessment.</li>
                      ))}
                    </ul>
                  </div>

                  <div className="disease-info-card">
                    <div className="disease-info-icon treatment">
                      <ShieldCheck size={18} />
                    </div>
                    <h4>Standard Treatment</h4>
                    <ul>
                      {selectedDisease.treatment.slice(0, 1).map((treat, i) => (
                        <li key={i}>Our multidisciplinary team will create a personalised treatment plan.</li>
                      ))}
                    </ul>
                  </div>
                </div>

                <div className="disease-detail-footer">
                  <div className="disease-specialists">
                    <div className="specialist-avatars">
                      <div className="specialist-avatar">D</div>
                      <div className="specialist-avatar">K</div>
                      <div className="specialist-avatar">A</div>
                    </div>
                    <div className="specialist-text">
                      <p className="specialist-title">Consult our Specialists</p>
                      <p className="specialist-subtitle">Expert team of 50+ clinical specialists</p>
                    </div>
                  </div>
                  <button className="btn btn-primary btn-specialist">
                    Book a Specialist Call <ArrowUpRight size={16} />
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
}

const TOTAL_FRAMES = 240;
const FRAME_RATE = 24; // fps

function HeroFramePlayer() {
  const canvasRef = useRef(null);
  const frameRef = useRef(0);
  const imagesRef = useRef([]);
  const loadedRef = useRef(0);
  const rafRef = useRef(null);
  const lastTimeRef = useRef(0);

  useEffect(() => {
    const images = [];
    for (let i = 1; i <= TOTAL_FRAMES; i++) {
      const img = new Image();
      const num = String(i).padStart(3, "0");
      img.src = `/hero/ezgif-frame-${num}.jpg`;
      img.onload = () => { loadedRef.current += 1; };
      images.push(img);
    }
    imagesRef.current = images;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    const interval = 1000 / FRAME_RATE;

    const draw = (timestamp) => {
      if (timestamp - lastTimeRef.current >= interval) {
        lastTimeRef.current = timestamp;
        const img = imagesRef.current[frameRef.current];
        if (img && img.complete) {
          canvas.width = canvas.offsetWidth;
          canvas.height = canvas.offsetHeight;
          ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
        }
        frameRef.current = (frameRef.current + 1) % TOTAL_FRAMES;
      }
      rafRef.current = requestAnimationFrame(draw);
    };

    rafRef.current = requestAnimationFrame(draw);
    return () => cancelAnimationFrame(rafRef.current);
  }, []);

  return (
    <div className="hero-frame-wrap">
      <canvas ref={canvasRef} className="hero-frame-canvas" />
    </div>
  );
}

function HeroOrb() {
  const groupRef = useRef(null);
  const meshRef = useRef(null);

  useFrame(({ clock }) => {
    const t = clock.getElapsedTime();
    if (groupRef.current) {
      groupRef.current.rotation.z = Math.sin(t * 0.22) * 0.2;
      groupRef.current.rotation.y = t * 0.12;
    }
    if (meshRef.current) {
      meshRef.current.rotation.x = t * 0.2;
      meshRef.current.rotation.y = t * 0.35;
      const scale = 1 + Math.sin(t * 1.5) * 0.06;
      meshRef.current.scale.set(scale, scale, scale);
    }
  });

  return (
    <group ref={groupRef}>
      <Float speed={1.3} rotationIntensity={0.7} floatIntensity={1.1}>
        <mesh ref={meshRef}>
          <icosahedronGeometry args={[1.4, 28]} />
          <MeshDistortMaterial
            color="#cf2d6f"
            emissive="#7b1642"
            emissiveIntensity={0.35}
            roughness={0.14}
            metalness={0.72}
            distort={0.5}
            speed={1.8}
          />
        </mesh>
      </Float>
      <mesh>
        <sphereGeometry args={[1.84, 36, 36]} />
        <meshStandardMaterial color="#fbcfe8" wireframe transparent opacity={0.13} />
      </mesh>
      <mesh rotation={[Math.PI / 2, 0.35, 0]}>
        <torusGeometry args={[2.2, 0.035, 20, 220]} />
        <meshStandardMaterial
          color="#f7b5d1"
          emissive="#be185d"
          emissiveIntensity={0.22}
          metalness={0.9}
          roughness={0.24}
        />
      </mesh>
    </group>
  );
}

function HeroScene() {
  return (
    <Canvas camera={{ position: [0, 0, 5], fov: 50 }} dpr={[1, 1.8]}>
      <ambientLight intensity={0.7} />
      <directionalLight position={[2.2, 2.1, 3.5]} intensity={1.3} color="#ffd9ea" />
      <pointLight position={[-2.2, -0.8, 2]} intensity={1.05} color="#8d254f" />
      <pointLight position={[1.4, -1.5, -0.2]} intensity={0.7} color="#3b2d56" />
      <HeroOrb />
      <ParticleSparkles
        count={80}
        size={2.2}
        speed={0.4}
        opacity={0.4}
        scale={[8, 5, 4]}
        color="#be185d"
      />
    </Canvas>
  );
}

function SectionTitle({ label, title, description }) {
  return (
    <motion.div
      className="section-title"
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-100px" }}
      transition={{ duration: 0.6, ease: "easeOut" }}
    >
      <p className="section-kicker">{label}</p>
      <h2>{title}</h2>
      <p>{description}</p>
    </motion.div>
  );
}

export default function App() {
  const [content, setContent] = useState(fallbackContent);
  const [activeFaq, setActiveFaq] = useState(0);
  const [scrolled, setScrolled] = useState(false);
  const [enquireOpen, setEnquireOpen] = useState(false);
  const [form, setForm] = useState({
    name: "",
    phone: "",
    concern: "",
    preferredDate: ""
  });
  const [formState, setFormState] = useState({
    loading: false,
    message: "",
    error: false
  });

  useEffect(() => {
    fetchHospitalContent().then(setContent);
  }, []);

  useEffect(() => {
    const lenis = new Lenis({
      duration: 1.15,
      smoothWheel: true,
      lerp: 0.08
    });

    let rafId;
    const raf = (time) => {
      lenis.raf(time);
      rafId = requestAnimationFrame(raf);
    };
    rafId = requestAnimationFrame(raf);

    return () => {
      cancelAnimationFrame(rafId);
      lenis.destroy();
    };
  }, []);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 40);
      const winScroll = document.body.scrollTop || document.documentElement.scrollTop;
      const height = document.documentElement.scrollHeight - document.documentElement.clientHeight;
      const scrolledPercent = (winScroll / height) * 100;
      const progressEl = document.querySelector(".scroll-progress");
      if (progressEl) {
        progressEl.style.width = scrolledPercent + "%";
      }
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.utils.toArray(".reveal").forEach((item) => {
        gsap.fromTo(
          item,
          { autoAlpha: 0, y: 56 },
          {
            autoAlpha: 1,
            y: 0,
            duration: 0.95,
            ease: "power3.out",
            scrollTrigger: {
              trigger: item,
              start: "top 86%",
              once: true
            }
          }
        );
      });
    });

    return () => ctx.revert();
  }, [content]);

  const quickHighlights = useMemo(
    () => [
      {
        icon: Clock3,
        title: "24/7 Emergency",
        text: "Critical care response team ready every hour."
      },
      {
        icon: Building2,
        title: "Premium Infrastructure",
        text: "Modern OT, ICU, diagnostics and patient suites."
      },
      {
        icon: Ambulance,
        title: "Rapid Response",
        text: "Fast triage and treatment workflows for urgent cases."
      }
    ],
    []
  );

  const handleNavClick = (item) => {
    const target = sectionMap[item];
    if (!target) {
      return;
    }
    document.getElementById(target)?.scrollIntoView({ behavior: "smooth" });
  };

  const handleInput = (event) => {
    const { name, value } = event.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const onSubmitAppointment = async (event) => {
    event.preventDefault();
    setFormState({ loading: true, message: "", error: false });

    try {
      const response = await submitAppointment(form);
      setFormState({ loading: false, message: response.message, error: false });
      setForm({ name: "", phone: "", concern: "", preferredDate: "" });
    } catch (error) {
      setFormState({
        loading: false,
        message: error.message || "Something went wrong",
        error: true
      });
    }
  };

  return (
    <div className="app-shell">
      <header className={`tx-header ${scrolled ? "is-scrolled" : ""}`}>
        <div className="scroll-progress" />
        <div className="tx-nav-wrap">

          {/* Logo */}
          <button className="tx-logo" onClick={() => handleNavClick("Home")}>
            <div className="tx-logo-mark">
              <span className="tx-logo-tx">TX</span>
              <span className="tx-logo-hospitals">HOSPITALS</span>
              <span className="tx-logo-tagline">THERAPY FOR EVERY ILLNESS</span>
            </div>
          </button>

          {/* Nav links */}
          <nav className="tx-nav">
            {["About Us","Services","Specialties","Doctors","Patients & Visitors","Contact"].map((item) => (
              <button key={item} className="tx-nav-link" onClick={() => {
                const map = {
                  "About Us": "why",
                  "Services": "treatments",
                  "Specialties": "treatments",
                  "Doctors": "doctors",
                  "Patients & Visitors": "insurance",
                  "Contact": "final-cta"
                };
                document.getElementById(map[item])?.scrollIntoView({ behavior: "smooth" });
              }}>
                {item}
              </button>
            ))}
          </nav>

          {/* Right actions */}
          <div className="tx-nav-actions">
            <a className="tx-book-btn" href="#final-cta">
              Book Appointment
            </a>
            <button className="tx-menu-btn">
              <span /><span /><span />
            </button>
          </div>

        </div>
      </header>

      <main>
        <section id="hero" className="hero-video-section">
          <HeroFramePlayer />

          {/* Left text overlay */}
          <div className="hero-text-overlay">
            <div className="hero-logo-block">
              <div className="hero-logo-mark">
                <span className="hero-logo-tx">TX</span>
                <div className="hero-logo-right">
                  <span className="hero-logo-hospitals">HOSPITALS</span>
                  <span className="hero-logo-branch">Miyapur Branch</span>
                </div>
              </div>
            </div>
            <h1 className="hero-overlay-title">
              Advanced Care.<br />Compassionate Hearts.
            </h1>
            <p className="hero-overlay-sub">
              Comprehensive healthcare services with advanced technology and a patient-first approach.
            </p>
            <a className="hero-overlay-btn" href="#treatments">
              Discover Our Services <ArrowUpRight size={16} />
            </a>
          </div>


          {/* Right enquire form */}
          <div className="hero-enquire-wrap">
            <button
              className="hero-enquire-toggle"
              onClick={() => setEnquireOpen(o => !o)}
            >
              <PhoneCall size={16} />
            </button>

            {enquireOpen && (
              <div className="hero-enquire-panel">
                <div className="hero-enquire-panel-header">
                  <h3 className="hero-enquire-title">Book an Appointment</h3>
                  <button className="hero-enquire-close" onClick={() => setEnquireOpen(false)}>✕</button>
                </div>
                <p className="hero-enquire-sub">Get expert care at TX Hospitals Miyapur</p>
                <form className="hero-enquire-form" onSubmit={(e) => { e.preventDefault(); document.getElementById('final-cta')?.scrollIntoView({ behavior: 'smooth' }); setEnquireOpen(false); }}>
                  <input type="text" placeholder="Your Full Name" required />
                  <input type="tel" placeholder="Phone Number" required />
                  <select defaultValue="">
                    <option value="" disabled>Select Department</option>
                    <option>Cardiac Sciences</option>
                    <option>Orthopaedics</option>
                    <option>Neurology</option>
                    <option>Gastro Sciences</option>
                    <option>Oncology</option>
                    <option>Nephrology</option>
                    <option>Urology</option>
                    <option>Mother & Child Care</option>
                    <option>Pulmonology</option>
                    <option>General Surgery</option>
                  </select>
                  <button type="submit" className="hero-enquire-btn">
                    Enquire Now <ArrowUpRight size={16} />
                  </button>
                </form>
              </div>
            )}
          </div>

          <div className="hero-metrics-overlay">
            <div className="hero-metric-item">
              <div className="hero-metric-icon"><HeartPulse size={22} /></div>
              <div className="hero-metric-text">
                <strong>13+</strong>
                <span>Core Specialties</span>
                <p>Expert care across all major specialties</p>
              </div>
            </div>
            <div className="hero-metric-divider" />
            <div className="hero-metric-item">
              <div className="hero-metric-icon"><Stethoscope size={22} /></div>
              <div className="hero-metric-text">
                <strong>50+</strong>
                <span>Expert Doctors</span>
                <p>Highly qualified and experienced team</p>
              </div>
            </div>
            <div className="hero-metric-divider" />
            <div className="hero-metric-item">
              <div className="hero-metric-icon"><Building2 size={22} /></div>
              <div className="hero-metric-text">
                <strong>100+</strong>
                <span>Patient Beds</span>
                <p>State-of-the-art facilities for your comfort</p>
              </div>
            </div>
            <div className="hero-metric-divider" />
            <div className="hero-metric-item">
              <div className="hero-metric-icon"><Sparkles size={22} /></div>
              <div className="hero-metric-text">
                <strong>98%</strong>
                <span>Patient Satisfaction</span>
                <p>Our commitment to excellence</p>
              </div>
            </div>
          </div>
        </section>

        <div className="dept-ticker-wrap">
          <div className="dept-ticker">
            <div className="dept-ticker-track">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="dept-ticker-group">
                  {(content.departments || []).map((dept) => (
                    <span key={dept} className="dept-ticker-item">
                      <span className="dept-ticker-dot" />
                      {dept}
                    </span>
                  ))}
                </div>
              ))}
            </div>
          </div>
        </div>

        <section id="symptoms" className="section">
          <div className="container">
            <SectionTitle
              label="Diseases & Conditions"
              title="Find the Right Specialist for Your Condition"
              description="Browse our comprehensive directory of diseases and conditions. Each entry is matched to the right specialist for faster, more accurate care."
            />
            <DiseasesConditions />
          </div>
        </section>

        <section id="treatments" className="section section-dark">
          <div className="container">
            <SectionTitle
              label="Treatments / Services"
              title="Multi-Specialty Treatment Programs"
              description="Each care pathway is designed with specialist oversight, diagnostic precision and premium patient support."
            />
            <div className="treatment-carousel-container">
              <button
                className="carousel-arrow left"
                onClick={() => {
                  const el = document.getElementById("treatment-track");
                  el.scrollBy({ left: -400, behavior: "smooth" });
                }}
              >
                <ChevronLeft size={24} />
              </button>

              <div id="treatment-track" className="treatment-track">
                {content.treatments.map((treatment, index) => (
                  <motion.div
                    key={treatment.title}
                    className="facility-card reveal"
                    initial={{ opacity: 0, scale: 0.95 }}
                    whileInView={{ opacity: 1, scale: 1 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.5, delay: index * 0.1 }}
                  >
                    <div className="facility-image-wrap">
                      <img src={treatment.image} alt={treatment.title} />
                      <div className="facility-overlay">
                        <h3>{treatment.title}</h3>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>

              <button
                className="carousel-arrow right"
                onClick={() => {
                  const el = document.getElementById("treatment-track");
                  el.scrollBy({ left: 400, behavior: "smooth" });
                }}
              >
                <ChevronRight size={24} />
              </button>
            </div>


          </div>
        </section>

        <section id="why" className="why-section">
          <div className="why-inner">

            {/* LEFT — image panel */}
            <div className="why-left reveal">
              <div className="why-img-wrap">
                <img
                  src="https://images.unsplash.com/photo-1551601651-2a8555f1a136?auto=format&fit=crop&q=80&w=900"
                  alt="TX Hospitals specialist care"
                />
                <div className="why-img-badge">
                  <HeartPulse size={22} />
                  <div>
                    <strong>1,00,000+</strong>
                    <span>Happy Patients</span>
                  </div>
                </div>
              </div>
              {/* TX cross logo mark */}
              <div className="why-cross-mark">
                <svg viewBox="0 0 60 60" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <rect x="22" y="0" width="16" height="60" rx="4" fill="white"/>
                  <rect x="0" y="22" width="60" height="16" rx="4" fill="white"/>
                </svg>
              </div>
            </div>

            {/* RIGHT — content panel */}
            <div className="why-right reveal">
              <p className="why-kicker">
                <span className="why-kicker-dot" /> Why Choose Us?
              </p>
              <h2 className="why-title">
                When You Need It Most,<br />
                <span className="why-title-highlight">TX Hospitals</span> Delivers
              </h2>
              <p className="why-desc">
                TX Hospitals Miyapur combines clinical excellence, advanced technology and patient-first values under one roof — trusted by families across Hyderabad for world-class, compassionate care.
              </p>

              <div className="why-features">
                {[
                  { icon: ShieldCheck, title: "Clinical Excellence", body: "Multi-specialty expertise with advanced diagnostics and minimally invasive procedures." },
                  { icon: Clock3,      title: "24/7 Emergency Care", body: "Round-the-clock critical response with trained teams and full ICU readiness." },
                  { icon: HeartPulse,  title: "Patient-First Values", body: "Transparent pricing, compassionate staff and personalised care at every step." },
                  { icon: Sparkles,    title: "Cashless Insurance", body: "Major insurers and TPA desks for fast approvals and smooth admissions." },
                ].map(({ icon: Icon, title, body }) => (
                  <div className="why-feature" key={title}>
                    <div className="why-feature-icon">
                      <Icon size={20} />
                    </div>
                    <div>
                      <h4>{title}</h4>
                      <p>{body}</p>
                    </div>
                  </div>
                ))}
              </div>

              <a className="why-cta btn btn-primary" href="#final-cta">
                Book a Consultation <ArrowUpRight size={16} />
              </a>
            </div>

          </div>
        </section>

        <section id="doctors" className="section section-dark">
          <div className="container">
            <div className="doctors-header">
              <div className="doctors-header-left">
                <p className="doctors-kicker">
                  <span className="doctors-kicker-line" />
                  Meet Our Specialists
                  <span className="doctors-kicker-line" />
                </p>
                <h2 className="doctors-title">
                  Trusted by <span className="doctors-title-em">Thousands</span>,<br />
                  Backed by <span className="doctors-title-em">Excellence</span>
                </h2>
              </div>
              <div className="doctors-header-right">
                <p className="doctors-desc">
                  Our Miyapur branch brings together a hand-picked team of senior consultants and specialists — each committed to precision care, patient empathy and clinical outcomes that matter.
                </p>
                <div className="doctors-stats-row">
                  <div className="doctors-stat">
                    <strong>13+</strong>
                    <span>Specialists</span>
                  </div>
                  <div className="doctors-stat-divider" />
                  <div className="doctors-stat">
                    <strong>10+</strong>
                    <span>Departments</span>
                  </div>
                  <div className="doctors-stat-divider" />
                  <div className="doctors-stat">
                    <strong>50K+</strong>
                    <span>Patients Treated</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div className="doc-marquee-outer">
            <div className="doc-marquee-track">
              {[...content.doctors, ...content.doctors].map((doctor, index) => {
                const bgColors = ["#1e2a78","#7c1d4a","#1a4a3a","#2d1a5c","#4a2d1a","#1a3a5c","#3a1a2d","#1a4a2d","#2d3a1a","#4a1a3a","#1a2d4a","#3a2d1a","#1a3a4a"];
                return (
                  <article key={index} className="doc-profile-card">
                    <div className="doc-photo-wrap" style={{ background: bgColors[index % bgColors.length] }}>
                      <div className="doc-avatar-placeholder">
                        <span>{doctor.name.split(" ").filter(w => w.startsWith("Dr.") ? false : true).slice(0,2).map(w => w[0]).join("")}</span>
                      </div>
                      <div className="doc-photo-fade" />
                    </div>
                    <div className="doc-content">
                      <p className="doc-specialty">{doctor.specialty}</p>
                      <h3 className="doc-name">{doctor.name}</h3>
                      <p className="doc-focus">{doctor.focus}</p>
                      <div className="doc-stats">
                        <div className="doc-stat">
                          <span>Experience</span>
                          <strong>{doctor.experience}</strong>
                        </div>
                        <div className="doc-stat">
                          <span>Role</span>
                          <strong>{doctor.specialty}</strong>
                        </div>
                        <button className="doc-consult-btn">Consult</button>
                      </div>
                    </div>
                  </article>
                );
              })}
            </div>
          </div>
        </section>

        <section id="technology" className="section">
          <div className="container">
            <SectionTitle
              label="Technology / Facilities"
              title="Advanced Diagnostics and Interventional Capability"
              description="Technology-enabled pathways for faster diagnosis, minimally invasive care and better clinical confidence."
            />
            <div className="tech-grid">
              {content.technologies.map((tech) => (
                <article key={tech} className="tech-card reveal">
                  <ShieldCheck size={18} />
                  <p>{tech}</p>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section id="testimonials" className="section section-dark">
          <div className="container">
            <SectionTitle
              label="Patient Testimonials"
              title="What Families Say About Their Experience"
              description="Human-centered care, clear communication and quality outcomes are reflected in patient feedback."
            />
            <div className="card-grid three">
              {content.testimonials.map((item) => (
                <article key={item.patient} className="testimonial-card reveal">
                  <p>"{item.quote}"</p>
                  <h4>{item.patient}</h4>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section className="section" id="stats">
          <div className="container">
            <SectionTitle
              label="Success Stats"
              title="Performance Indicators That Build Trust"
              description="Care quality at scale, supported by expert teams, modern infrastructure and process-led execution."
            />
            <div className="stats-row reveal">
              {content.stats.map((stat) => (
                <div key={stat.label} className="stat-card">
                  <h3>{stat.value}</h3>
                  <p>{stat.label}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section id="insurance" className="section section-dark">
          <div className="container">
            <SectionTitle
              label="Insurance / Cashless"
              title="Cashless Admission Support"
              description={content.insurance.summary}
            />
            <div className="insurance-layout">
              <div className="insurance-providers reveal">
                {content.insurance.providers.map((provider) => (
                  <span key={provider}>{provider}</span>
                ))}
              </div>
              <div className="insurance-steps reveal">
                {content.insurance.steps.map((step, index) => (
                  <article key={step}>
                    <strong>{index + 1}</strong>
                    <p>{step}</p>
                  </article>
                ))}
              </div>
            </div>
          </div>
        </section>

        <section id="faq" className="section">
          <div className="container">
            <SectionTitle
              label="FAQ"
              title="Answers to Common Questions"
              description="Quick clarity on emergency access, insurance, specialist consultation and care pathways."
            />
            <div className="faq-list">
              {content.faqs.map((faq, index) => (
                <article
                  key={faq.question}
                  className={`faq-item reveal ${activeFaq === index ? "open" : ""}`}
                >
                  <button onClick={() => setActiveFaq(activeFaq === index ? -1 : index)}>
                    <span>{faq.question}</span>
                    <Activity size={18} />
                  </button>
                  <div className="faq-answer">
                    <p>{faq.answer}</p>
                  </div>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section id="final-cta" className="section final-cta">
          <div className="container final-wrap">
            <div className="final-copy reveal">
              <p className="section-kicker">Final CTA</p>
              <h2>{content.finalCta.title}</h2>
              <p>{content.finalCta.subtitle}</p>
              <a className="btn btn-primary" href={`tel:${content.finalCta.contact.replace(/\s/g, "")}`}>
                <PhoneCall size={16} />
                {content.finalCta.contact}
              </a>
            </div>
            <form className="appointment-form reveal" onSubmit={onSubmitAppointment}>
              <label>
                Full Name
                <input
                  name="name"
                  value={form.name}
                  onChange={handleInput}
                  placeholder="Enter your name"
                  required
                />
              </label>
              <label>
                Phone Number
                <input
                  name="phone"
                  value={form.phone}
                  onChange={handleInput}
                  placeholder="Enter your phone"
                  required
                />
              </label>
              <label>
                Concern / Department
                <input
                  name="concern"
                  value={form.concern}
                  onChange={handleInput}
                  placeholder="Cardiac, Orthopedic, Oncology..."
                  required
                />
              </label>
              <label>
                Preferred Date
                <input
                  type="date"
                  name="preferredDate"
                  value={form.preferredDate}
                  onChange={handleInput}
                />
              </label>
              <button className="btn btn-primary" type="submit" disabled={formState.loading}>
                {formState.loading ? "Submitting..." : content.finalCta.primary}
              </button>
              {formState.message ? (
                <p className={formState.error ? "form-error" : "form-success"}>
                  {formState.message}
                </p>
              ) : null}
            </form>
          </div>
        </section>
      </main>

      {/* Floating action buttons */}
      <div className="floating-actions">
        <a
          className="floating-btn floating-whatsapp"
          href="https://wa.me/919144514459"
          target="_blank"
          rel="noopener noreferrer"
          title="Chat on WhatsApp"
        >
          <svg viewBox="0 0 24 24" fill="currentColor" width="28" height="28">
            <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
          </svg>
        </a>
        <button
          className="floating-btn floating-chatbot"
          title="Chat with us"
          onClick={() => window.open(`tel:+919144514459`)}
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" width="26" height="26">
            <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
            <circle cx="9" cy="10" r="1" fill="currentColor" stroke="none"/>
            <circle cx="12" cy="10" r="1" fill="currentColor" stroke="none"/>
            <circle cx="15" cy="10" r="1" fill="currentColor" stroke="none"/>
          </svg>
        </button>
      </div>
    </div>
  );
}
