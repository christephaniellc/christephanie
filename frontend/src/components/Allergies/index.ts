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

export interface FoodAllergyIconProps {
  allergyName: string;
  icon: React.ElementType;
  selected: boolean;
}

export const seriousFoodAllergies: FoodAllergyIconProps[] = [
  {
    allergyName: 'Peanuts',
    icon: RestaurantIcon,
    selected: false,
  },
  {
    allergyName: 'Tree Nuts',
    icon: ParkIcon,
    selected: false,
  },
  {
    allergyName: 'Dairy',
    icon: IcecreamIcon,
    selected: false,
  },
  {
    allergyName: 'Eggs',
    icon: EggIcon,
    selected: false,
  },
  {
    allergyName: 'Soy',
    icon: SpaIcon,
    selected: false,
  },
  {
    allergyName: 'Wheat',
    icon: GrainIcon,
    selected: false,
  },
  {
    allergyName: 'Fish',
    icon: SetMealIcon,
    selected: false,
  },
  {
    allergyName: 'Shellfish',
    icon: LunchDiningIcon,
    selected: false,
  },
  {
    allergyName: 'Sesame',
    icon: BubbleChartIcon,
    selected: false,
  },
  {
    allergyName: 'Gluten',
    icon: GrainIcon,
    selected: false,
  },
].sort((a, b) => a.allergyName.localeCompare(b.allergyName));
