// Make sure to install MUI icons if you haven't already:
//   npm install @mui/icons-material
// and import them as needed:
import RestaurantIcon from '@mui/icons-material/Restaurant';  // example for peanuts
import ParkIcon from '@mui/icons-material/Park';            // example for tree nuts
import IcecreamIcon from '@mui/icons-material/Icecream';    // dairy
import EggIcon from '@mui/icons-material/Egg';              // eggs
import SpaIcon from '@mui/icons-material/Spa';              // soy
import GrainIcon from '@mui/icons-material/Grain';          // wheat
import SetMealIcon from '@mui/icons-material/SetMeal';      // fish
import LunchDiningIcon from '@mui/icons-material/LunchDining'; // shellfish
import BubbleChartIcon from '@mui/icons-material/BubbleChart';
import {
  Agriculture,
  AgricultureTwoTone, BakeryDining, BugReport, Cookie, DinnerDining,
  Directions,
  DirectionsBoat, Egg, EmojiNature, Fastfood,
  GrassSharp, Icecream, KebabDining, LocalCafe, LocalFlorist, LunchDining, OutdoorGrill, Restaurant,
  Science, SetMeal, Spa,
  WineBar,
} from '@mui/icons-material';
import MenuIcon from '@mui/icons-material/Menu';

export interface FoodAllergyIconProps {
  allergyName: string;
  icon: React.ElementType;
  selected: boolean;
}

export const seriousFoodAllergies: FoodAllergyIconProps[] = [
  {
    "allergyName": "Alcohol",
    "icon": WineBar,
    "selected": false
  },
  {
    "allergyName": "Almond",
    "icon": Spa,
    "selected": false
  },
  {
    "allergyName": "Anchovy",
    "icon": SetMeal,
    "selected": false
  },
  {
    "allergyName": "Anise",
    "icon": LocalFlorist,
    "selected": false
  },
  {
    "allergyName": "Annatto",
    "icon": LocalFlorist,
    "selected": false
  },
  {
    "allergyName": "Apple",
    "icon": EmojiNature,
    "selected": false
  },
  {
    "allergyName": "Aspartame",
    "icon": Science,
    "selected": false
  },
  {
    "allergyName": "Avocado",
    "icon": EmojiNature,
    "selected": false
  },
  {
    "allergyName": "Banana",
    "icon": EmojiNature,
    "selected": false
  },
  {
    "allergyName": "Barley (Gluten)",
    "icon": BakeryDining,
    "selected": false
  },
  {
    "allergyName": "Beef",
    "icon": Fastfood,
    "selected": false
  },
  {
    "allergyName": "Benzoates",
    "icon": Science,
    "selected": false
  },
  {
    "allergyName": "Brazil Nut",
    "icon": Spa,
    "selected": false
  },
  {
    "allergyName": "Buckwheat",
    "icon": BakeryDining,
    "selected": false
  },
  {
    "allergyName": "Caffeine",
    "icon": LocalCafe,
    "selected": false
  },
  {
    "allergyName": "Cashew",
    "icon": Spa,
    "selected": false
  },
  {
    "allergyName": "Celery",
    "icon": LocalFlorist,
    "selected": false
  },
  {
    "allergyName": "Chamomile",
    "icon": LocalFlorist,
    "selected": false
  },
  {
    "allergyName": "Cherry",
    "icon": EmojiNature,
    "selected": false
  },
  {
    "allergyName": "Chestnut",
    "icon": Spa,
    "selected": false
  },
  {
    "allergyName": "Chicken",
    "icon": KebabDining,
    "selected": false
  },
  {
    "allergyName": "Chili Pepper",
    "icon": LocalFlorist,
    "selected": false
  },
  {
    "allergyName": "Chocolate",
    "icon": Cookie,
    "selected": false
  },
  {
    "allergyName": "Cinnamon",
    "icon": LocalFlorist,
    "selected": false
  },
  {
    "allergyName": "Clam (Mollusk)",
    "icon": DinnerDining,
    "selected": false
  },
  {
    "allergyName": "Coconut",
    "icon": Spa,
    "selected": false
  },
  {
    "allergyName": "Cod (Fish)",
    "icon": SetMeal,
    "selected": false
  },
  {
    "allergyName": "Coriander (Cilantro)",
    "icon": LocalFlorist,
    "selected": false
  },
  {
    "allergyName": "Corn (Maize)",
    "icon": BakeryDining,
    "selected": false
  },
  {
    "allergyName": "Crab (Crustacean)",
    "icon": SetMeal,
    "selected": false
  },
  {
    "allergyName": "Crayfish (Crustacean)",
    "icon": SetMeal,
    "selected": false
  },
  {
    "allergyName": "Crustacean Shellfish",
    "icon": SetMeal,
    "selected": false
  },
  {
    "allergyName": "Cumin",
    "icon": LocalFlorist,
    "selected": false
  },
  {
    "allergyName": "Egg",
    "icon": Egg,
    "selected": false
  },
  {
    "allergyName": "Eggplant",
    "icon": EmojiNature,
    "selected": false
  },
  {
    "allergyName": "Fenugreek",
    "icon": Spa,
    "selected": false
  },
  {
    "allergyName": "Fish",
    "icon": SetMeal,
    "selected": false
  },
  {
    "allergyName": "Flaxseed",
    "icon": Spa,
    "selected": false
  },
  {
    "allergyName": "Garlic",
    "icon": LocalFlorist,
    "selected": false
  },
  {
    "allergyName": "Gelatin",
    "icon": Restaurant,
    "selected": false
  },
  {
    "allergyName": "Ginger",
    "icon": LocalFlorist,
    "selected": false
  },
  {
    "allergyName": "Gluten (Wheat)",
    "icon": BakeryDining,
    "selected": false
  },
  {
    "allergyName": "Grapes",
    "icon": EmojiNature,
    "selected": false
  },
  {
    "allergyName": "Hazelnut",
    "icon": Spa,
    "selected": false
  },
  {
    "allergyName": "Honey",
    "icon": EmojiNature,
    "selected": false
  },
  {
    "allergyName": "Insect Protein (Cricket flour)",
    "icon": BugReport,
    "selected": false
  },
  {
    "allergyName": "Kiwi",
    "icon": EmojiNature,
    "selected": false
  },
  {
    "allergyName": "Lentils",
    "icon": Spa,
    "selected": false
  },
  {
    "allergyName": "Lobster (Crustacean)",
    "icon": SetMeal,
    "selected": false
  },
  {
    "allergyName": "Lupin",
    "icon": Spa,
    "selected": false
  },
  {
    "allergyName": "Macadamia Nut",
    "icon": Spa,
    "selected": false
  },
  {
    "allergyName": "Mango",
    "icon": EmojiNature,
    "selected": false
  },
  {
    "allergyName": "Milk (Dairy)",
    "icon": Icecream,
    "selected": false
  },
  {
    "allergyName": "Mint (Peppermint)",
    "icon": LocalFlorist,
    "selected": false
  },
  {
    "allergyName": "Molluscs (Shellfish)",
    "icon": DinnerDining,
    "selected": false
  },
  {
    "allergyName": "Monosodium Glutamate (MSG)",
    "icon": Science,
    "selected": false
  },
  {
    "allergyName": "Mushroom",
    "icon": EmojiNature,
    "selected": false
  },
  {
    "allergyName": "Mustard",
    "icon": Spa,
    "selected": false
  },
  {
    "allergyName": "Nightshades",
    "icon": EmojiNature,
    "selected": false
  },
  {
    "allergyName": "Nitrites / Nitrates",
    "icon": Science,
    "selected": false
  },
  {
    "allergyName": "Oats (Gluten)",
    "icon": BakeryDining,
    "selected": false
  },
  {
    "allergyName": "Octopus (Mollusk)",
    "icon": DinnerDining,
    "selected": false
  },
  {
    "allergyName": "Onion",
    "icon": LocalFlorist,
    "selected": false
  },
  {
    "allergyName": "Orange (Citrus)",
    "icon": EmojiNature,
    "selected": false
  },
  {
    "allergyName": "Oyster (Mollusk)",
    "icon": DinnerDining,
    "selected": false
  },
  {
    "allergyName": "Paprika",
    "icon": LocalFlorist,
    "selected": false
  },
  {
    "allergyName": "Pea Protein",
    "icon": Spa,
    "selected": false
  },
  {
    "allergyName": "Peach",
    "icon": EmojiNature,
    "selected": false
  },
  {
    "allergyName": "Peanut",
    "icon": Spa,
    "selected": false
  },
  {
    "allergyName": "Pecan",
    "icon": Spa,
    "selected": false
  },
  {
    "allergyName": "Pepper (Black pepper)",
    "icon": LocalFlorist,
    "selected": false
  },
  {
    "allergyName": "Pine Nut",
    "icon": Spa,
    "selected": false
  },
  {
    "allergyName": "Pistachio",
    "icon": Spa,
    "selected": false
  },
  {
    "allergyName": "Poppy Seed",
    "icon": Spa,
    "selected": false
  },
  {
    "allergyName": "Pork",
    "icon": OutdoorGrill,
    "selected": false
  },
  {
    "allergyName": "Potato",
    "icon": EmojiNature,
    "selected": false
  },
  {
    "allergyName": "Pumpkin",
    "icon": Spa,
    "selected": false
  },
  {
    "allergyName": "Quorn (Mycoprotein)",
    "icon": EmojiNature,
    "selected": false
  },
  {
    "allergyName": "Raspberry",
    "icon": EmojiNature,
    "selected": false
  },
  {
    "allergyName": "Red Dye #40",
    "icon": Science,
    "selected": false
  },
  {
    "allergyName": "Red Meat (Alpha-gal)",
    "icon": Fastfood,
    "selected": false
  },
  {
    "allergyName": "Rice",
    "icon": LunchDining,
    "selected": false
  },
  {
    "allergyName": "Royal Jelly",
    "icon": EmojiNature,
    "selected": false
  },
  {
    "allergyName": "Rye (Gluten)",
    "icon": BakeryDining,
    "selected": false
  },
  {
    "allergyName": "Salmon (Fish)",
    "icon": SetMeal,
    "selected": false
  },
  {
    "allergyName": "Scallop (Mollusk)",
    "icon": DinnerDining,
    "selected": false
  },
  {
    "allergyName": "Sesame",
    "icon": Spa,
    "selected": false
  },
  {
    "allergyName": "Shrimp (Crustacean)",
    "icon": SetMeal,
    "selected": false
  },
  {
    "allergyName": "Soy (Soybean)",
    "icon": Spa,
    "selected": false
  },
  {
    "allergyName": "Strawberry",
    "icon": EmojiNature,
    "selected": false
  },
  {
    "allergyName": "Sulfites",
    "icon": Science,
    "selected": false
  },
  {
    "allergyName": "Sunflower Seed",
    "icon": Spa,
    "selected": false
  },
  {
    "allergyName": "Tartrazine (Yellow #5)",
    "icon": Science,
    "selected": false
  },
  {
    "allergyName": "Tomato",
    "icon": EmojiNature,
    "selected": false
  },
  {
    "allergyName": "Tree Nuts",
    "icon": Spa,
    "selected": false
  },
  {
    "allergyName": "Tuna (Fish)",
    "icon": SetMeal,
    "selected": false
  },
  {
    "allergyName": "Turmeric",
    "icon": LocalFlorist,
    "selected": false
  },
  {
    "allergyName": "Walnut",
    "icon": Spa,
    "selected": false
  },
  {
    "allergyName": "Wheat (Gluten)",
    "icon": BakeryDining,
    "selected": false
  },
  {
    "allergyName": "Yeast",
    "icon": EmojiNature,
    "selected": false
  }
].sort((a, b) => a.allergyName.localeCompare(b.allergyName));
