import { useEffect, useMemo, useRef, useState } from "react";
import { motion } from "framer-motion";
import { Canvas, useFrame } from "@react-three/fiber";
import { Float, MeshDistortMaterial, Sparkles as ParticleSparkles, Stars } from "@react-three/drei";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import Lenis from "lenis";
import {
  Facebook,
  Instagram,
  Linkedin,
  Twitter,
  Mail,
  MapPin,
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
  const [activeLetter, setActiveLetter] = useState(null);
  const [selectedDisease, setSelectedDisease] = useState(null);
  const detailRef = useRef(null);
  const resultsRef = useRef(null);

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
      setSelectedDisease(null);
      setTimeout(() => {
        resultsRef.current?.scrollIntoView({ behavior: "smooth", block: "nearest" });
      }, 50);
    }
  };

  const handleDiseaseClick = (disease) => {
    setSelectedDisease(disease);
    setTimeout(() => {
      detailRef.current?.scrollIntoView({ behavior: "smooth", block: "nearest" });
    }, 50);
  };

  const closeModal = () => {
    setSelectedDisease(null);
  };

  return (
    <>
      <div className="diseases-section">
        <div className="diseases-header">
          {/* Left dark panel */}
          <div className="diseases-header-left">
            <div className="diseases-header-icon">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" width="28" height="28">
                <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/>
                <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/>
              </svg>
            </div>
            <h2 className="diseases-title">Diseases &amp; Conditions</h2>
            <p className="diseases-subtitle">Easy-to-understand answers about diseases and conditions</p>
            <p className="diseases-search-label">Search diseases &amp; conditions</p>
            <div className="diseases-search-wrap">
              <Activity size={16} className="diseases-search-icon" />
              <input
                className="diseases-search-input"
                type="text"
                placeholder="Search diseases or conditions..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
              <button className="diseases-search-btn" onClick={() => {}}>
                <ChevronRight size={18} />
              </button>
            </div>
          </div>

          {/* Right panel */}
          <div className="diseases-header-right">
            <p className="diseases-alpha-label">
              Find diseases &amp; conditions by <span className="diseases-alpha-highlight">first letter</span>
            </p>
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

            {/* Popular searches */}
            <div className="diseases-popular">
              <div className="diseases-popular-label">
                <span className="diseases-popular-dot" />
                Popular Searches
                <span className="diseases-popular-dot" />
              </div>
              <div className="diseases-popular-grid">
                {[
                  { name: "Diabetes",         icon: "🩸" },
                  { name: "Hypertension",     icon: "❤️" },
                  { name: "Arthritis",        icon: "🦴" },
                  { name: "Thyroid Disorders",icon: "🦋" },
                  { name: "Asthma",           icon: "🫁" },
                ].map((item) => (
                  <button
                    key={item.name}
                    className="diseases-popular-chip"
                    onClick={() => { setSearch(item.name); setActiveLetter(null); }}
                  >
                    <span className="diseases-popular-emoji">{item.icon}</span>
                    {item.name}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        <div className="diseases-results" ref={resultsRef}>
          <p className="diseases-count">
            {(!activeLetter && !search.trim()) ? "Select a letter or search to find conditions" : `${filtered.length} condition${filtered.length !== 1 ? "s" : ""} found`}
            {(search || activeLetter) && (
              <button className="diseases-clear" onClick={() => { setSearch(""); setActiveLetter(null); setSelectedDisease(null); }}>
                ✕ Clear
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
            <div className="disease-detail-panel" ref={detailRef}>
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

const TECH_SLIDES = [
  {
    label: "Cardiac Imaging",
    title: "Advanced Cardiac\nDiagnostics",
    description: "State-of-the-art echocardiography, cardiac CT and MRI for precise heart disease diagnosis and treatment planning.",
    detail: "64-slice CT Angiography · 3D Echo · Stress Testing · Holter Monitoring",
    gradient: "linear-gradient(135deg, #be185d 0%, #7c3aed 60%, #1e40af 100%)",
    image: "https://images.unsplash.com/photo-1628348068343-c6a848d2b6dd?auto=format&fit=crop&q=80&w=900",
    icon: HeartPulse
  },
  {
    label: "Neuro Sciences",
    title: "Neuro Diagnostics\n& Intervention",
    description: "High-field MRI, EEG and EMG systems enabling accurate diagnosis of brain, spine and nervous system conditions.",
    detail: "3T MRI · EEG · EMG · Nerve Conduction Studies · Neuro Navigation",
    gradient: "linear-gradient(135deg, #0f172a 0%, #1e3a5f 50%, #be185d 100%)",
    image: "https://images.unsplash.com/photo-1559757148-5c350d0d3c56?auto=format&fit=crop&q=80&w=900",
    icon: Brain
  },
  {
    label: "Robotic Surgery",
    title: "Robotic-Assisted\nSurgical Systems",
    description: "Minimally invasive robotic surgery for greater precision, smaller incisions and faster patient recovery across specialties.",
    detail: "Robotic Laparoscopy · Endoscopic Surgery · Minimal Blood Loss · Faster Recovery",
    gradient: "linear-gradient(135deg, #064e3b 0%, #065f46 50%, #be185d 100%)",
    image: "https://images.unsplash.com/photo-1551601651-2a8555f1a136?auto=format&fit=crop&q=80&w=900",
    icon: Activity
  },
  {
    label: "Oncology",
    title: "Cancer Care\nTechnology",
    description: "Advanced radiation therapy, PET-CT scanning and targeted treatment systems for comprehensive cancer management.",
    detail: "PET-CT · Linear Accelerator · Brachytherapy · Tumour Board Reviews",
    gradient: "linear-gradient(135deg, #7c2d12 0%, #9a3412 50%, #1e40af 100%)",
    image: "https://images.unsplash.com/photo-1576091160550-2173dba999ef?auto=format&fit=crop&q=80&w=900",
    icon: Radiation
  },
  {
    label: "Diagnostics Lab",
    title: "Full-Spectrum\nDiagnostic Lab",
    description: "Integrated diagnostic centre with digital X-ray, ultrasound, mammography and advanced pathology for rapid results.",
    detail: "Digital X-Ray · Ultrasound & Doppler · Mammography · Endoscopy · Colonoscopy",
    gradient: "linear-gradient(135deg, #1e1b4b 0%, #312e81 50%, #be185d 100%)",
    image: "https://images.unsplash.com/photo-1579684385127-1ef15d508118?auto=format&fit=crop&q=80&w=900",
    icon: Stethoscope
  },
  {
    label: "Critical Care",
    title: "ICU & Emergency\nInfrastructure",
    description: "Round-the-clock critical care with advanced life support, ventilators and real-time patient monitoring systems.",
    detail: "Multi-parameter Monitors · Ventilators · Defibrillators · 24/7 Intensivist",
    gradient: "linear-gradient(135deg, #450a0a 0%, #7f1d1d 50%, #1e3a5f 100%)",
    image: "https://images.unsplash.com/photo-1584820927498-cfe5211fd8bf?auto=format&fit=crop&q=80&w=900",
    icon: Ambulance
  }
];

function TechSlider() {
  const [current, setCurrent] = useState(0);
  const [direction, setDirection] = useState(null);
  const [animating, setAnimating] = useState(false);

  const goTo = (index, dir) => {
    if (animating) return;
    setDirection(dir);
    setAnimating(true);
    setTimeout(() => {
      setCurrent(index);
      setAnimating(false);
    }, 400);
  };

  const prev = () => goTo((current - 1 + TECH_SLIDES.length) % TECH_SLIDES.length, "left");
  const next = () => goTo((current + 1) % TECH_SLIDES.length, "right");

  const slide = TECH_SLIDES[current];
  const Icon = slide.icon;

  return (
    <div className="tech-slider" style={{ background: slide.gradient }}>
      {/* Background image */}
      <div className="tech-slider-bg">
        <img src={slide.image} alt={slide.label} />
      </div>

      {/* Glass overlay */}
      <div className="tech-slider-overlay" />

      {/* Content */}
      <div className={`tech-slider-content ${animating ? `slide-out-${direction}` : "slide-in"}`}>
        <div className="tech-slider-left">
          <p className="tech-slide-label">
            <Icon size={14} /> {slide.label}
          </p>
          <h2 className="tech-slide-title">
            {slide.title.split("\n").map((line, i) => (
              <span key={i}>{line}<br /></span>
            ))}
          </h2>
          <p className="tech-slide-desc">{slide.description}</p>
          <div className="tech-slide-detail">{slide.detail}</div>
          <button className="tech-slide-btn" onClick={() => document.getElementById("final-cta")?.scrollIntoView({ behavior: "smooth" })}>
            Book Consultation <ArrowUpRight size={16} />
          </button>
        </div>
        <div className="tech-slider-right">
          <img src={slide.image} alt={slide.label} />
        </div>
      </div>

      {/* Left arrow */}
      <button className="tech-arrow tech-arrow-left" onClick={prev}>
        <ChevronLeft size={22} />
      </button>

      {/* Right arrow */}
      <button className="tech-arrow tech-arrow-right" onClick={next}>
        <ChevronRight size={22} />
      </button>

      {/* Dots */}
      <div className="tech-dots">
        {TECH_SLIDES.map((_, i) => (
          <button
            key={i}
            className={`tech-dot ${i === current ? "active" : ""}`}
            onClick={() => goTo(i, i > current ? "right" : "left")}
          />
        ))}
      </div>
    </div>
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

function Footer() {
  const currentYear = new Date().getFullYear();
  
  return (
    <footer className="site-footer">
      <div className="footer-top">
        <div className="container">
          <div className="footer-grid">
            {/* Column 1: Brand */}
            <div className="footer-col brand-col">
              <div className="footer-logo">
                <div className="footer-logo-mark">
                  <span className="logo-tx">TX</span>
                  <div className="logo-text">
                    <span className="logo-h">HOSPITALS</span>
                    <span className="logo-tag">THERAPY FOR EVERY ILLNESS</span>
                  </div>
                </div>
              </div>
              <p className="footer-about">
                TX Hospitals Miyapur brings together clinical excellence and compassionate care, delivering world-class healthcare solutions to the heart of Hyderabad.
              </p>
              <div className="footer-social">
                <a href="#" className="social-link" title="Facebook"><Facebook size={18} /></a>
                <a href="#" className="social-link" title="Instagram"><Instagram size={18} /></a>
                <a href="#" className="social-link" title="Twitter"><Twitter size={18} /></a>
                <a href="#" className="social-link" title="LinkedIn"><Linkedin size={18} /></a>
              </div>
            </div>

            {/* Column 2: Specialties */}
            <div className="footer-col">
              <h4 className="footer-title">Specialties</h4>
              <ul className="footer-links">
                <li><a href="#treatments">Cardiac Sciences</a></li>
                <li><a href="#treatments">Neuro Sciences</a></li>
                <li><a href="#treatments">Orthopaedics</a></li>
                <li><a href="#treatments">Gastroenterology</a></li>
                <li><a href="#treatments">Oncology</a></li>
                <li><a href="#treatments">Mother & Child Care</a></li>
              </ul>
            </div>

            {/* Column 3: Patient Care */}
            <div className="footer-col">
              <h4 className="footer-title">Patient Care</h4>
              <ul className="footer-links">
                <li><a href="#why">Why Choose Us</a></li>
                <li><a href="#insurance">Insurance & Cashless</a></li>
                <li><a href="#faq">Frequently Asked Questions</a></li>
                <li><a href="#final-cta">Book Appointment</a></li>
                <li><a href="#hero">Health Checkups</a></li>
                <li><a href="#testimonials">Patient Stories</a></li>
              </ul>
            </div>

            {/* Column 4: Contact */}
            <div className="footer-col contact-col">
              <h4 className="footer-title">Get in Touch</h4>
              <div className="footer-contact-items">
                <div className="contact-item">
                  <MapPin size={18} className="contact-icon" />
                  <p>Miyapur Main Road, Near Metro Station, Hyderabad, Telangana 500049</p>
                </div>
                <div className="contact-item">
                  <PhoneCall size={18} className="contact-icon" />
                  <p>+91 91445 14459</p>
                </div>
                <div className="contact-item">
                  <Mail size={18} className="contact-icon" />
                  <p>info@txhospitals.in</p>
                </div>
              </div>
              <div className="emergency-badge">
                <Ambulance size={16} />
                <span>24/7 Emergency: 040 43 43 43 43</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="footer-bottom">
        <div className="container">
          <div className="footer-bottom-inner">
            <p className="copyright">
              © {currentYear} TX Hospitals. All rights reserved. 
              <span className="footer-sep">|</span> 
              NABH Accredited Multi-Specialty Hospital
            </p>
            <div className="footer-legal">
              <a href="#">Privacy Policy</a>
              <a href="#">Terms of Service</a>
              <a href="#">Sitemap</a>
            </div>
          </div>
        </div>
      </div>
    </footer>
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
  const [navVisible, setNavVisible] = useState(true);
  const [enquireOpen, setEnquireOpen] = useState(false);
  const lastScrollY = useRef(0);
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
      const currentY = window.scrollY;
      setScrolled(currentY > 40);
      
      // Always keep nav visible when scrolling down, but we can hide it 
      // if we want a "hide on scroll" effect. However, the user said "don't drop".
      // We'll keep it visible but allow the CSS transition to handle the "slow slide".
      setNavVisible(true); 

      lastScrollY.current = currentY;
      const height = document.documentElement.scrollHeight - document.documentElement.clientHeight;
      const scrolledPercent = (currentY / height) * 100;
      const progressEl = document.querySelector(".scroll-progress");
      if (progressEl) progressEl.style.width = scrolledPercent + "%";
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
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
      <header className={`tx-header ${scrolled ? "is-scrolled" : ""} ${navVisible ? "nav-visible" : "nav-hidden"}`}>
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
            <div className="hero-overlay-actions">
              <a className="hero-overlay-btn" href="#treatments">
                Discover Our Services <ArrowUpRight size={16} />
              </a>
              <button
                className="hero-enquire-toggle"
                onClick={() => setEnquireOpen(o => !o)}
              >
                <PhoneCall size={16} />
              </button>
            </div>
          </div>


          {/* Right enquire form */}
          <div className="hero-enquire-wrap">

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
          <div className="diseases-section-header">
            <p className="section-kicker">Diseases &amp; Conditions</p>
            <h2 className="diseases-section-title">
              Know Your Condition.<br />
              <span className="diseases-title-accent">Find Your Specialist.</span>
            </h2>
            <p className="diseases-section-desc">
              Explore our A–Z directory of diseases and conditions — each matched to the right specialist for faster, more accurate care.
            </p>
          </div>
            <DiseasesConditions />
          </div>
        </section>

        <section id="treatments" className="trt-section">
          {/* Header */}
          <div className="trt-header">
            <p className="trt-kicker">
              <span className="trt-kicker-line" />
              Treatments / Services
              <span className="trt-kicker-line" />
            </p>
            <h2 className="trt-title">
              Multi-Specialty <span className="trt-title-accent">Treatment Programs</span>
            </h2>
            <p className="trt-desc">
              Each care pathway is designed with specialist oversight,<br />
              diagnostic precision and premium patient support.
            </p>
            <div className="trt-divider">
              <span className="trt-divider-line" />
              <HeartPulse size={18} className="trt-divider-icon" />
              <span className="trt-divider-line" />
            </div>
          </div>

          {/* Cards carousel */}
          <div className="trt-carousel-wrap">
            <button className="trt-arrow trt-arrow-left" onClick={() => {
              document.getElementById("trt-track").scrollBy({ left: -320, behavior: "smooth" });
            }}>
              <ChevronLeft size={20} />
            </button>

            <div className="trt-track" id="trt-track">
              {[
                {
                  title: "Cardiac Sciences",
                  desc: "Advanced diagnosis and comprehensive care for heart conditions by expert cardiologists.",
                  cta: "Explore Cardiac Care",
                  icon: HeartPulse,
                  image: "https://images.unsplash.com/photo-1628348068343-c6a848d2b6dd?auto=format&fit=crop&q=80&w=600&h=400"
                },
                {
                  title: "Gastro Sciences",
                  desc: "Expert care for digestive health, liver disorders and advanced endoscopic treatments.",
                  cta: "Explore Gastro Care",
                  icon: Activity,
                  image: "https://images.unsplash.com/photo-1551601651-2a8555f1a136?auto=format&fit=crop&q=80&w=600&h=400"
                },
                {
                  title: "Ortho Sciences",
                  desc: "Restoring movement and mobility with advanced orthopaedic solutions and surgeries.",
                  cta: "Explore Ortho Care",
                  icon: Bone,
                  image: "https://images.unsplash.com/photo-1530026405186-ed1f139313f8?auto=format&fit=crop&q=80&w=600&h=400"
                },
                {
                  title: "Nephrology",
                  desc: "Specialized care for kidney health, dialysis and transplantation by experienced nephrologists.",
                  cta: "Explore Kidney Care",
                  icon: Activity,
                  image: "https://images.unsplash.com/photo-1631815588090-d4bfec5b1ccb?auto=format&fit=crop&q=80&w=600&h=400"
                },
                {
                  title: "Neurology",
                  desc: "Advanced care for brain, spine and nervous system disorders with precision diagnostics.",
                  cta: "Explore Neuro Care",
                  icon: Brain,
                  image: "https://images.unsplash.com/photo-1559757148-5c350d0d3c56?auto=format&fit=crop&q=80&w=600&h=400"
                },
                {
                  title: "Oncology",
                  desc: "Complete cancer care with surgery, chemotherapy, radiation and targeted therapy.",
                  cta: "Explore Cancer Care",
                  icon: Radiation,
                  image: "https://images.unsplash.com/photo-1576091160550-2173dba999ef?auto=format&fit=crop&q=80&w=600&h=400"
                },
                {
                  title: "Mother & Child Care",
                  desc: "Safe maternity, fertility and paediatric care for every stage of life.",
                  cta: "Explore Mother Care",
                  icon: Baby,
                  image: "https://images.unsplash.com/photo-1555252333-9f8e92e65df9?auto=format&fit=crop&q=80&w=600&h=400"
                },
                {
                  title: "Urology",
                  desc: "Advanced care for urinary tract, prostate and bladder disorders.",
                  cta: "Explore Urology Care",
                  icon: Stethoscope,
                  image: "https://images.unsplash.com/photo-1559757175-0eb30cd8c063?auto=format&fit=crop&q=80&w=600&h=400"
                },
              ].map((item, i) => {
                const Icon = item.icon;
                return (
                  <div key={i} className="trt-card">
                    <div className="trt-card-img">
                      <img src={item.image} alt={item.title} />
                      <div className="trt-card-grid-icon">⠿</div>
                    </div>
                    <div className="trt-card-icon-wrap">
                      <Icon size={22} />
                    </div>
                    <div className="trt-card-body">
                      <h3>{item.title}</h3>
                      <div className="trt-card-bar" />
                      <p>{item.desc}</p>
                      <button className="trt-card-cta">
                        {item.cta} <ArrowUpRight size={14} />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>

            <button className="trt-arrow trt-arrow-right" onClick={() => {
              document.getElementById("trt-track").scrollBy({ left: 320, behavior: "smooth" });
            }}>
              <ChevronRight size={20} />
            </button>
          </div>

          {/* Bottom trust bar */}
          <div className="trt-trust-bar">
            <div className="trt-trust-item"><Stethoscope size={16} /> Specialist Led Care</div>
            <div className="trt-trust-div" />
            <div className="trt-trust-item"><Activity size={16} /> Advanced Diagnostics</div>
            <div className="trt-trust-div" />
            <div className="trt-trust-item"><HeartPulse size={16} /> Patient First Approach</div>
            <div className="trt-trust-div" />
            <div className="trt-trust-item"><ShieldCheck size={16} /> Seamless Support</div>
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

        <section id="technology" className="tech-slider-section">
          <div className="tech-section-layout">
            <div className="container tech-section-header">
              <p className="section-kicker">Technology / Facilities</p>
              <h2 className="tech-section-title">
                Advanced Diagnostics &<br />
                <span className="tech-title-accent">Interventional Capability</span>
              </h2>
              <p className="tech-section-desc">
                Technology-enabled pathways for faster diagnosis, minimally invasive care and better clinical confidence.
              </p>
            </div>
            <div className="tech-slider-col">
              <TechSlider />
            </div>
          </div>
        </section>

        <section id="testimonials" className="testimonials-section">
          {/* Header */}
          <div className="testimonials-header">
            <p className="testimonials-kicker">
              <span className="t-kicker-line" />
              <HeartPulse size={14} />
              Patient Stories
              <span className="t-kicker-line" />
            </p>
            <h2 className="testimonials-big-title">TESTIMONIAL</h2>
            <p className="testimonials-tagline">
              <span className="t-kicker-line short" /> Real People. Real Experiences. Real Care. <span className="t-kicker-line short" />
            </p>
            <div className="testimonials-branch-tag">TX Hospital Miyapur</div>
          </div>

          {/* Cards */}
          <div className="container">
            <div className="testimonials-grid">
              {[
                {
                  quote: "The doctors and staff at TX Hospital Miyapur were incredibly supportive and made my treatment journey smooth and comfortable.",
                  name: "Priya S.",
                  role: "Happy Patient",
                  avatar: "https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?auto=format&fit=crop&q=80&w=120&h=120"
                },
                {
                  quote: "Advanced technology and compassionate care — that's what makes TX Hospital Miyapur different from any other hospital.",
                  name: "Ravi K.",
                  role: "Happy Patient",
                  avatar: "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&q=80&w=120&h=120"
                },
                {
                  quote: "From the moment I walked in, I felt safe and cared for. Thank you, TX Hospital Miyapur!",
                  name: "Anitha M.",
                  role: "Happy Patient",
                  avatar: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&q=80&w=120&h=120"
                },
                {
                  quote: "The cardiac team at TX Hospitals diagnosed my condition quickly and the treatment was world-class. I am fully recovered now.",
                  name: "Suresh R.",
                  role: "Cardiac Patient",
                  avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&q=80&w=120&h=120"
                },
                {
                  quote: "Excellent orthopaedic care. Dr. Keerthikar and his team handled my knee surgery with great precision. Highly recommended!",
                  name: "Lakshmi D.",
                  role: "Ortho Patient",
                  avatar: "https://images.unsplash.com/photo-1554151228-14d9def656e4?auto=format&fit=crop&q=80&w=120&h=120"
                },
                {
                  quote: "The cashless insurance process was seamless and the staff guided us at every step. TX Hospitals truly puts patients first.",
                  name: "Venkat P.",
                  role: "Happy Patient",
                  avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=120&h=120"
                }
              ].map((t, i) => (
                <div key={i} className="t-card">
                  <div className="t-card-quote-icon">"</div>
                  <div className="t-card-stars">★★★★★</div>
                  <p className="t-card-text">"{t.quote}"</p>
                  <div className="t-card-divider" />
                  <div className="t-card-author">
                    <img src={t.avatar} alt={t.name} className="t-card-avatar" />
                    <div>
                      <strong>{t.name}</strong>
                      <span>{t.role}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Footer trust bar */}
          <div className="testimonials-trust-bar">
            <div className="t-trust-item">
              <ShieldCheck size={18} /> Expert Doctors
            </div>
            <div className="t-trust-divider" />
            <div className="t-trust-item">
              <Activity size={18} /> Advanced Technology
            </div>
            <div className="t-trust-divider" />
            <div className="t-trust-item">
              <HeartPulse size={18} /> Compassionate Care
            </div>
            <div className="t-trust-divider" />
            <div className="t-trust-item">
              <Sparkles size={18} /> Patient First
            </div>
          </div>
        </section>

        <section className="stats-section" id="stats">
          <div className="stats-section-inner">

            {/* Left content */}
            <div className="stats-left">
              <p className="stats-kicker">
                <span className="stats-kicker-line" />
                <HeartPulse size={14} />
                Success Stats
              </p>
              <h2 className="stats-title">
                Performance Indicators<br />
                <span className="stats-title-accent">That Build Trust <ShieldCheck size={28} /></span>
              </h2>
              <div className="stats-title-bar" />
              <p className="stats-desc">
                Care quality at scale, supported by expert teams, modern infrastructure and process-led execution.
              </p>
              <div className="stats-branch-tag">
                <Activity size={13} /> TX Hospital Miyapur
              </div>

              {/* Stat cards row */}
              <div className="stats-cards-row">
                {[
                  { icon: Stethoscope, value: "50+",        label: "Expert Doctors",      grad: "linear-gradient(135deg,#7c3aed,#be185d)" },
                  { icon: Sparkles,    value: "13+",        label: "Specialties",         grad: "linear-gradient(135deg,#be185d,#7c3aed)" },
                  { icon: Building2,   value: "100+",       label: "Hospital Beds",       grad: "linear-gradient(135deg,#be185d,#db2777)" },
                  { icon: HeartPulse,  value: "1,00,000+",  label: "Happy Patients",      grad: "linear-gradient(135deg,#db2777,#f97316)" },
                  { icon: Activity,    value: "10K+",       label: "Surgeries Performed", grad: "linear-gradient(135deg,#f97316,#db2777)" },
                ].map(({ icon: Icon, value, label, grad }, i) => (
                  <div key={i} className="stats-card">
                    <div className="stats-card-icon" style={{ background: grad }}>
                      <Icon size={22} />
                    </div>
                    <p className="stats-card-value" style={{ background: grad, WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text" }}>
                      {value}
                    </p>
                    <p className="stats-card-label">{label}</p>
                    <div className="stats-card-bar" style={{ background: grad }} />
                  </div>
                ))}
              </div>
            </div>

          </div>

          {/* Bottom trust bar */}
          <div className="stats-trust-bar">
            <div className="t-trust-item"><ShieldCheck size={16} /> Expert Doctors</div>
            <div className="t-trust-divider" />
            <div className="t-trust-item"><Activity size={16} /> Advanced Technology</div>
            <div className="t-trust-divider" />
            <div className="t-trust-item"><HeartPulse size={16} /> Compassionate Care</div>
            <div className="t-trust-divider" />
            <div className="t-trust-item"><Sparkles size={16} /> Patient First</div>
          </div>
        </section>

        <section id="insurance" className="ins-section">
          <div className="ins-top">
            <div className="ins-left">
              {/* Kicker */}
              <div className="ins-kicker">
                <ShieldCheck size={14} /> Insurance / Cashless
              </div>
              {/* Title */}
              <h2 className="ins-title">
                Cashless Admission<br />
                <span className="ins-title-accent">Support</span>
              </h2>
              <div className="ins-title-bar" />
              <p className="ins-desc">
                All major insurance providers, TPAs and government schemes are supported with cashless assistance.
              </p>

              {/* Providers grid */}
              <div className="ins-providers-box">
                <p className="ins-providers-label"><ShieldCheck size={13} /> We Support</p>
                <div className="ins-providers-grid">
                  {[
                    { name: "Star Health",        color: "#e11d48", bg: "#fff1f2", abbr: "SH" },
                    { name: "New India",          color: "#1d4ed8", bg: "#eff6ff", abbr: "NI" },
                    { name: "HDFC Ergo",          color: "#dc2626", bg: "#fef2f2", abbr: "HE" },
                    { name: "United India",       color: "#1e40af", bg: "#eff6ff", abbr: "UI" },
                    { name: "Medi Assist",        color: "#be185d", bg: "#fdf2f8", abbr: "MA" },
                    { name: "Oriental",           color: "#0369a1", bg: "#f0f9ff", abbr: "OR" },
                    { name: "National Insurance", color: "#15803d", bg: "#f0fdf4", abbr: "NI" },
                    { name: "ICICI Lombard",      color: "#f97316", bg: "#fff7ed", abbr: "IL" },
                    { name: "CGHS",               color: "#7c3aed", bg: "#f5f3ff", abbr: "CG" },
                    { name: "ESI",                color: "#0891b2", bg: "#ecfeff", abbr: "ES" },
                    { name: "Aarogyasri",         color: "#16a34a", bg: "#f0fdf4", abbr: "AA" },
                    { name: "Many More",          color: "#94a3b8", bg: "#f8fafc", abbr: "+" },
                  ].map((p) => (
                    <div key={p.name} className="ins-provider-chip" style={{ "--chip-color": p.color, "--chip-bg": p.bg, borderColor: p.color + "22" }}>
                      <div className="ins-provider-logo" style={{ background: p.bg, color: p.color }}>
                        {p.abbr}
                      </div>
                      <span className="ins-provider-name" style={{ color: p.color }}>{p.name}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Right — cashless card visual */}
            <div className="ins-right">
              <div className="ins-card-wrap">
                <div className="ins-shield-bg">
                  <ShieldCheck size={80} />
                </div>
                <div className="ins-card">
                  <div className="ins-card-top">
                    <div>
                      <p className="ins-card-label">CASHLESS</p>
                      <p className="ins-card-label">ADMISSION</p>
                      <p className="ins-card-sub">WE'VE GOT YOU COVERED</p>
                    </div>
                    <div className="ins-card-logo">
                      <span className="ins-card-tx">TX</span>
                      <div>
                        <span className="ins-card-h">HOSPITALS</span>
                        <span className="ins-card-tag">THERAPY FOR EVERY ILLNESS</span>
                      </div>
                    </div>
                  </div>
                  <div className="ins-card-chip">
                    <div className="ins-chip-rect" />
                  </div>
                  <div className="ins-card-features">
                    {[
                      { icon: Activity,    label: "Quick\nApproval" },
                      { icon: ShieldCheck, label: "Hassle-free\nProcess" },
                      { icon: Building2,   label: "Wide Network\nCoverage" },
                      { icon: CheckCircle2,label: "Paperless\nSupport" },
                    ].map(({ icon: Icon, label }) => (
                      <div key={label} className="ins-card-feature">
                        <Icon size={18} />
                        <span>{label}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* How it works */}
          <div className="ins-how">
            <div className="container">
              <p className="ins-how-label">How It Works</p>
              <div className="ins-how-bar" />
              <div className="ins-steps-row">
                {[
                  { num: "01", icon: ShieldCheck, text: "Share your insurance card or policy details at admission." },
                  { num: "02", icon: Activity,    text: "Our insurance desk manages pre-authorisation with your TPA." },
                  { num: "03", icon: CheckCircle2,text: "Approved treatments proceed as cashless up to your policy limits." },
                  { num: "04", icon: Building2,   text: "Discharge documentation and claim paperwork is fully supported." },
                ].map((step, i) => (
                  <div key={i} className="ins-step">
                    <div className="ins-step-icon">
                      <step.icon size={22} />
                    </div>
                    <p className="ins-step-num">{step.num}</p>
                    <p className="ins-step-text">{step.text}</p>
                    {i < 3 && <div className="ins-step-arrow"><ChevronRight size={18} /></div>}
                  </div>
                ))}
                <div className="ins-team-box">
                  <div className="ins-team-icon"><PhoneCall size={22} /></div>
                  <p className="ins-team-label">Our Insurance Team</p>
                  <p className="ins-team-text">is here to make your treatment journey smooth and stress-free.</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        <div className="faq-cta-row">
        <section id="faq" className="faq-section">
          <div className="faq-inner">

            {/* Left panel */}
            <div className="faq-left">
              <div className="faq-kicker-wrap">
                <span className="faq-kicker-badge">
                  <Activity size={12} /> FAQs
                </span>
                <span className="faq-kicker-line" />
              </div>
              <h2 className="faq-title">
                Got <span className="faq-title-accent">Questions?</span><br />
                We've Got Answers.
              </h2>

              <div className="faq-cta-card">
                <div className="faq-cta-avatar">
                  <img
                    src="https://txhospitals.in/_next/image/?url=%2Fassets%2FManagement%2FDr.%20Ghantasala%20Navaneeth.webp&w=640&q=75"
                    alt="Specialist"
                    onError={(e) => { e.target.src = "https://images.unsplash.com/photo-1537368910025-700350fe46c7?auto=format&fit=crop&q=80&w=120&h=120"; }}
                  />
                </div>
                <h3>Book a Consultation</h3>
                <p>Have questions? Book a quick call with our specialists before your visit.</p>
                <a className="faq-cta-btn" href={`tel:${content.header.phone.replace(/\s/g, "")}`}>
                  <PhoneCall size={16} /> Call Now
                </a>
              </div>
            </div>

            {/* Right panel — accordion */}
            <div className="faq-right">
              {content.faqs.map((faq, index) => (
                <article
                  key={faq.question}
                  className={`faq2-item ${activeFaq === index ? "open" : ""}`}
                  onClick={() => setActiveFaq(activeFaq === index ? -1 : index)}
                >
                  <div className="faq2-header">
                    <span className="faq2-question">{faq.question}</span>
                    <span className="faq2-icon">{activeFaq === index ? "×" : "+"}</span>
                  </div>
                  {activeFaq === index && (
                    <div className="faq2-answer">
                      <p>{faq.answer}</p>
                    </div>
                  )}
                </article>
              ))}
            </div>

          </div>
        </section>

        <section id="final-cta" className="fcta-section">
          {/* Background building image */}
          <div className="fcta-bg">
            <img src="https://images.unsplash.com/photo-1586773860418-d37222d8fce3?auto=format&fit=crop&q=80&w=1200" alt="TX Hospitals" />
          </div>

          <div className="fcta-inner">
            {/* Left */}
            <div className="fcta-left">
              {/* TX Logo */}
              <div className="fcta-logo">
                <span className="fcta-logo-tx">TX</span>
                <div>
                  <span className="fcta-logo-h">HOSPITALS</span>
                  <span className="fcta-logo-tag">THERAPY FOR EVERY ILLNESS</span>
                </div>
              </div>

              {/* Kicker + Title */}
              <div className="fcta-kicker-row">
                <span className="fcta-kicker-line" />
                <span className="fcta-kicker-text">Final CTA</span>
              </div>
              <h2 className="fcta-title">
                Take the Next Step<br />
                <span className="fcta-title-accent">Toward Better Health</span>
              </h2>
              <div className="fcta-heartline">
                <span className="fcta-hl-line" />
                <HeartPulse size={20} className="fcta-hl-icon" />
                <span className="fcta-hl-line" />
              </div>
              <p className="fcta-desc">{content.finalCta.subtitle}</p>

              {/* Feature icons */}
              <div className="fcta-features">
                {[
                  { icon: Stethoscope, label: "Expert\nSpecialists" },
                  { icon: ShieldCheck,  label: "Advanced\nCare" },
                  { icon: HeartPulse,  label: "Compassionate\nSupport" },
                ].map(({ icon: Icon, label }) => (
                  <div key={label} className="fcta-feature">
                    <div className="fcta-feature-icon"><Icon size={22} /></div>
                    <span>{label}</span>
                  </div>
                ))}
              </div>

              {/* Phone */}
              <a className="fcta-phone" href={`tel:${content.finalCta.contact.replace(/\s/g, "")}`}>
                <div className="fcta-phone-icon"><PhoneCall size={20} /></div>
                <div>
                  <span className="fcta-phone-label">Need Help?</span>
                  <span className="fcta-phone-num">{content.finalCta.contact}</span>
                </div>
              </a>
            </div>

            {/* Right — form card */}
            <div className="fcta-right">
              <div className="fcta-form-card">
                {/* Calendar icon top */}
                <div className="fcta-form-icon">
                  <Activity size={26} />
                </div>

                <div className="fcta-form-header">
                  <div className="fcta-form-kicker">
                    <span className="fcta-fk-line" /> BOOK YOUR APPOINTMENT <span className="fcta-fk-line" />
                  </div>
                  <p className="fcta-form-sub">We're here to care for you</p>
                </div>

                <form className="fcta-form" onSubmit={onSubmitAppointment}>
                  <div className="fcta-field">
                    <div className="fcta-field-icon"><Stethoscope size={16} /></div>
                    <div className="fcta-field-inner">
                      <label>Full Name</label>
                      <input name="name" value={form.name} onChange={handleInput} placeholder="Enter your name" required />
                    </div>
                  </div>
                  <div className="fcta-field">
                    <div className="fcta-field-icon"><PhoneCall size={16} /></div>
                    <div className="fcta-field-inner">
                      <label>Phone Number</label>
                      <input name="phone" value={form.phone} onChange={handleInput} placeholder="Enter your phone" required />
                    </div>
                  </div>
                  <div className="fcta-field">
                    <div className="fcta-field-icon"><Activity size={16} /></div>
                    <div className="fcta-field-inner">
                      <label>Concern / Department</label>
                      <input name="concern" value={form.concern} onChange={handleInput} placeholder="Cardiac, Orthopedic, Oncology..." required />
                    </div>
                  </div>
                  <div className="fcta-field">
                    <div className="fcta-field-icon"><Building2 size={16} /></div>
                    <div className="fcta-field-inner">
                      <label>Preferred Date</label>
                      <input type="date" name="preferredDate" value={form.preferredDate} onChange={handleInput} />
                    </div>
                  </div>
                  <button className="fcta-submit" type="submit" disabled={formState.loading}>
                    {formState.loading ? "Submitting..." : "Book Appointment"}
                    <ArrowUpRight size={18} />
                  </button>
                  {formState.message && (
                    <p className={formState.error ? "form-error" : "form-success"}>{formState.message}</p>
                  )}
                </form>

                {/* Bottom trust */}
                <div className="fcta-trust">
                  <div className="fcta-trust-item"><ShieldCheck size={14} /> Patient Safety First</div>
                  <div className="fcta-trust-item"><Activity size={14} /> NABH Accredited</div>
                  <div className="fcta-trust-item"><Clock3 size={14} /> 24/7 Support</div>
                </div>
              </div>
            </div>
          </div>
        </section>
      </div>
      </main>
      
      <Footer />

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
