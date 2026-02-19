// js/config.js
const RAILWAY_ZONES = [
    "NR", "NER", "NFR", "ER", "SER", "SR", "CR", "WR", 
    "SCR", "NWR", "WCR", "NCR", "SWR", "ECR", "SECR", 
    "ECoR", "MR", "SCoR"
];

const NWR_DIVISIONS = [
    "JP (Jaipur)", "JU (Jodhpur)", "BKN (Bikaner)", "AII (Ajmer)", 
    "Workshop (Ajmer)", "Workshop (Jodhpur)", "Workshop (Bikaner)",
    "Diesel Shed (ABR)", "Diesel Shed (BGKT)", "Phulera"
];

const WATER_SOURCES = [
    "Borewell", "Open Well","Contractor", "RO Plant", "Tap Water", "PHED", "Tanker Supply", "Handpump"
];

const WATER_LOCATIONS = [
    "Platform No. 1", "Waiting Room", "Running Room", "Office Tank", "Station Master Room", "Colony Quarter"
];

// --- HARDCODED STANDARDS ---

// 1. WATER (IS 10500:2012)
window.STD_WATER = [
    { name: "pH Value", method: "IS 3025 Pt 11", type: "range", min: 6.5, max: 8.5, permissible_min: 6.5, permissible_max: 8.5 },
    { name: "Turbidity (NTU)", method: "IS 3025 Pt 10", type: "max", max: 1, permissible_max: 5 },
    { name: "TDS (mg/L)", method: "IS 3025 Pt 16", type: "max", max: 500, permissible_max: 2000 },
    { name: "Total Hardness (mg/L)", method: "IS 3025 Pt 21", type: "max", max: 200, permissible_max: 600 },
    { name: "Alkalinity (mg/L)", method: "IS 3025 Pt 23", type: "max", max: 200, permissible_max: 600 },
    { name: "Fluoride (mg/L)", method: "IS 3025 Pt 60", type: "max", max: 1.0, permissible_max: 1.5 },
    { name: "Chloride (mg/L)", method: "IS 3025 Pt 32", type: "max", max: 250, permissible_max: 1000 },
    { name: "Sulphate (mg/L)", method: "IS 3025 Pt 24", type: "max", max: 200, permissible_max: 400 },
    { name: "Nitrate (mg/L)", method: "IS 3025 Pt 34", type: "max", max: 45, permissible_max: 45 }, // No relaxation
    { name: "Arsenic (mg/L)", method: "IS 3025 Pt 37", type: "max", max: 0.01, permissible_max: 0.01 },// No relaxation
    { name: "Iron (mg/L)", method: "IS 3025 Pt 53", type: "max", max: 1.0, permissible_max: 1.0 },// No relaxation
    { name: "Manganese (as Mn), mg/l", method: "IS 3025 Pt 59", type: "max", max:0.1, permissible_max: 0.3 }// No relaxation
];

// 2. DIESEL (IS 1460)
window.STD_DIESEL = [
    { name: "Appearance", method: "Visual", type: "text", value: "Clear, bright, free from sediments, suspended matter and undissolved water" },
    { name: "Total Acid Number (TAN), mg of KOH/g", method: "P:2", type: "max", max: 0.20 },
    { name: "Ash Content, % by mass", method: "P:4/Sec1", type: "max", max: 0.01 },
    { name: "Carbon Residue (on 10% residue), % by mass", method: "P:8 / P:189", type: "max", max: 0.30 },
    { name: "Cetane Number", method: "P:9", type: "min", min: 51 },
    { name: "Cetane Index", method: "P:174", type: "min", min: 46 },
    { name: "Pour Point (Winter), °C", method: "P:10/Sec2", type: "max", max: 3 },
    { name: "Pour Point (Summer), °C", method: "P:10/Sec2", type: "max", max: 15 },
    { name: "Copper Strip Corrosion (3h at 50°C)", method: "P:15", type: "class", value: "Class 1" },
    { name: "Distillation (95% v/v recovery), °C", method: "P:18 / ISO 3405", type: "max", max: 360 },
    { name: "Flash Point (Abel), °C", method: "P:20", type: "min", min: 35 },
    { name: "Kinematic Viscosity @40°C, mm²/s or cst", method: "P:25", type: "range", min: 2.0, max: 4.5 },
    { name: "Total Contamination, mg/kg", method: "EN 12662", type: "max", max: 24 },
    { name: "Density @15°C, kg/m³ ", method: "P:16 / P:32 / P:167", type: "range", min: 810, max: 845 },
    { name: "Total Sulphur, mg/kg (ppm)", method: "P:160 / P:34 / P:161 / P:159", type: "max", max: 10 }, // mg/kg
    { name: "Water Content, mg/kg (ppm)", method: "P:182", type: "max", max: 200 }, // mg/kg
    { name: "Cold Filter Plugging Point (CFPP) (Winter), °C", method: "P:110", type: "max", max: 6 },
    { name: "Cold Filter Plugging Point (CFPP) (Summer), °C ", method: "P:110", type: "max", max: 18 },
    { name: "Oxidation Stability, g/m³", method: "P:154", type: "max", max: 25 },
    { name: "Oxidation Stability, minutes", method: "EN 16091", type: "min", min: 60 },
    { name: "Oxidation stability (FAME content > 2% v/v), hours", method: "EN 157551", type: "min", min: 20},
    { name: "Oxidation stability (FAME content < 2% v/v), minutes", method: "EN 16091", type: "min", min: 60},
    { name: "Polycyclic Aromatic Hydrocarbon (PAH), % by mass", method: "EN 12916", type: "max", max: 8 },
    { name: "Lubricity (WSD @60°C), µm", method: "P:149", type: "max", max: 460 },
    { name: "FAME Content, % v/v", method: "Annex B", type: "max", max: 7.0 }
      
      
];