import {useMemo, useState} from "react";
import {useChristephanieTheme} from "../context/ThemeContext";
import {SxProps} from "@mui/material";

export const useAppLayout = () => {
  const [navValue, setNavValue] = useState(0);

  return {navValue, setNavValue};
}