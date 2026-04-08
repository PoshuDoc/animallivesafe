import { Egg, Rabbit, Dog, Cat, Bird } from "lucide-react";

// For cattle, using something close, like Rabbit/Dog for generic animals if no exact matches in lucide-react. 
// Lucide doesn't have cow/goat specifically. Let's use custom SVGs or closest matches.
// We'll use standard lucide icons as requested: 'do not use emojis anywhere in the UI — use lucide-react icons instead'
import { Activity } from "lucide-react";

export const DISTRICTS = [
  "ঢাকা", "ফরিদপুর", "গাজীপুর", "গোপালগঞ্জ", "জামালপুর", "কিশোরগঞ্জ", "মাদারীপুর", "মানিকগঞ্জ", "মুন্সীগঞ্জ", "নারায়ণগঞ্জ", "নরসিংদী", "রাজবাড়ী", "শরীয়তপুর", "টাঙ্গাইল",
  "বগুড়া", "জয়পুরহাট", "নওগাঁ", "নাটোর", "নবাবগঞ্জ", "পাবনা", "রাজশাহী", "সিরাজগঞ্জ",
  "দিনাজপুর", "গাইবান্ধা", "কুড়িগ্রাম", "লালমনিরহাট", "নীলফামারী", "পঞ্চগড়", "রংপুর", "ঠাকুরগাঁও",
  "বরগুনা", "বরিশাল", "ভোলা", "ঝালকাঠি", "পটুয়াখালী", "পিরোজপুর",
  "বান্দরবান", "ব্রাহ্মণবাড়িয়া", "চাঁদপুর", "চট্টগ্রাম", "কুমিল্লা", "কক্সবাজার", "ফেনী", "খাগড়াছড়ি", "লক্ষ্মীপুর", "নোয়াখালী", "রাঙ্গামাটি",
  "হবিগঞ্জ", "মৌলভীবাজার", "সুনামগঞ্জ", "সিলেট",
  "বাগেরহাট", "চুয়াডাঙ্গা", "যশোর", "ঝিনাইদহ", "খুলনা", "কুষ্টিয়া", "মাগুরা", "মেহেরপুর", "নড়াইল", "সাতক্ষীরা",
  "ময়মনসিংহ", "নেত্রকোনা", "শেরপুর"
].sort();

export const ANIMAL_TYPES = [
  { id: "গরু", label: "গরু" },
  { id: "ছাগল", label: "ছাগল" },
  { id: "মুরগি", label: "মুরগি/হাঁস" },
  { id: "কুকুর", label: "কুকুর" },
  { id: "বিড়াল", label: "বিড়াল" }
];

export function getAnimalIcon(type: string) {
  switch (type) {
    case "গরু": return Activity;
    case "ছাগল": return Rabbit;
    case "মুরগি": return Bird;
    case "কুকুর": return Dog;
    case "বিড়াল": return Cat;
    default: return Activity;
  }
}
