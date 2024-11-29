import {Box, Typography} from "@mui/material";
import {useChristephanieTheme} from "../context/ThemeContext";
import {Image} from "@mui/icons-material";
import ElPulpoHead from "../assets/el_pulpo_cabeza.jpg";
import ElPulpoHeadOnly from "../assets/el_pulpo_only.png";

export const Home = () => {
  const {mixedBackgroundSx, mode} = useChristephanieTheme();
  return (
    <Box display='flex' flexDirection='column' height="100%" justifyContent="space-between">
      <Typography variant='h1' color='text.primary'
                  fontSize={"3rem"}
                  sx={{
                    width: '100%',
                    textAlign: 'center',
                    mt: 4,
                    mx: "auto",
                    padding: 3,
                    ...mixedBackgroundSx
                  }}
      >
        Save the Date
      </Typography>
      <Box sx={{width: '100%', alignItems: 'flex-end', display: 'flex'}}>
        <img src={mode === "dark" ? ElPulpoHead : ElPulpoHeadOnly} alt="El Pulpo"
             style={{width: '100%', height: 'auto'}}/>
      </Box>
    </Box>
  );
}

