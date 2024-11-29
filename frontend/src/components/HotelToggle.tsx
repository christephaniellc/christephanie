import {ToggleButton, ToggleButtonGroup, useColorScheme} from "@mui/material";
import {useChristephanieTheme} from "../context/ThemeContext";

export const HotelToggle = () => {
  // const {mode, setMode} = useColorScheme();
  const { mode, toggleTheme } = useChristephanieTheme();
  return (<ToggleButtonGroup
      color={mode === 'dark' ? 'primary' : 'secondary'}
      exclusive
      // onChange={(_event, value) => setMode(value as 'system' | 'light' | 'dark')}
      onChange={toggleTheme}
      aria-label="Platform"
      value={mode}
    >
      <ToggleButton value="dark">Camping</ToggleButton>
      <ToggleButton value="light">Hotel</ToggleButton>
    </ToggleButtonGroup>
  );
};