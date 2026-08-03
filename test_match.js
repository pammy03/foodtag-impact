const dbIngredients = [
  {"id": 1, "name_en":"Allergies 2026_MUSHROOM","name_th":"Allergies 2026_MUSHROOM"}
];
const ingDict = dbIngredients.map((ing) => ({
  id: ing.id,
  nameThClean: (ing.name_th || "").toLowerCase().replace(/\s+/g, ""),
  nameEnClean: (ing.name_en || "").toLowerCase().replace(/\s+/g, ""),
}));

let key = "Allergies 2026_MUSHROOM (Contain)";
let baseName = key
  .replace(/\(Main Contain\)/gi, "")
  .replace(/\(May Contain\)/gi, "")
  .replace(/\(Contain\)/gi, "")
  .replace(/\(Main\)/gi, "")
  .replace(/\(May\)/gi, "")
  .replace(/\_1$/g, "")
  .replace(/\_2$/g, "")
  .trim();
  
let cleanName = baseName.toLowerCase().replace(/\s+/g, "");
let strippedName = cleanName
  .replace("allergies2026_", "")
  .replace("allergica2026_", "");

const found = ingDict.find(
  (ing) => ing.nameThClean === cleanName || ing.nameEnClean === cleanName || ing.nameThClean === strippedName || ing.nameEnClean === strippedName
);

console.log("baseName:", baseName);
console.log("cleanName:", cleanName);
console.log("strippedName:", strippedName);
console.log("ingDict:", ingDict);
console.log("found:", found);
