import Meta from '@/components/Meta';
import Box from '@mui/material/Box';
import { useRecoilState } from 'recoil';
import { seriousFoodAllergies } from '@/components/Allergies';
import Button from '@mui/material/Button';
import { OverridableComponent } from '@mui/material/OverridableComponent';
import { Icon, SvgIconTypeMap } from '@mui/material';

function FoodPreferences() {
  const [allergies, setAllergies] = useRecoilState(seriousFoodAllergies);
  return (
    <>
      <Meta title="Food Preferences" />
      <Box display="flex" flexWrap="wrap" height="100%" maxWidth={600}>
        {allergies.map((allergy) => {
          const matchingAllergy = allergies.find((a) => a === allergy);
          if (!matchingAllergy) return;
          const newAllergies = allergies.filter((a) => a !== allergy);
          if (!newAllergies) return;
          return <Button key={allergy.allergyName} onClick={() => setAllergies([...newAllergies, {...matchingAllergy, selected: !matchingAllergy?.selected}].sort(
            (a, b) => a.allergyName.localeCompare(b.allergyName)
          ) as {
            icon: OverridableComponent<SvgIconTypeMap> & { muiName: string },
            allergyName: string,
            selected: boolean
          }[])}>
            <Box mr={1} width={"33%"} position='relative'>
              <allergy.icon />
              <Box position='absolute' top={0} bottom={0} left={0} right={0}
                   sx={{
                     '&::before': {
                       content: '""',
                       position: 'absolute',
                       top: 0,
                       left: 0,
                       width: '100%',
                       height: '4px',
                       backgroundColor: 'red',
                       transform: 'rotate(45deg)',
                       transformOrigin: 'bottom left',
                       display: matchingAllergy.selected ? 'block' : 'none',
                     },
                   }}
              />
            </Box>{allergy.allergyName}
          </Button>;
        })}
      </Box>
    </>
  );
}

export default FoodPreferences;
