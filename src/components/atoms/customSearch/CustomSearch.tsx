import {
  InputAdornment,
  TextField,
  type SxProps,
  type Theme,
} from "@mui/material";
import { ICONS } from "../../../assets/exports";
import type { FC } from "react";

interface ICustomSearchProps {
  placeholder?: string;
  sx?: SxProps<Theme>;
}

const CustomSearch: FC<ICustomSearchProps> = ({ placeholder, sx }) => {
  return (
    <TextField
      variant="outlined"
      type="search"
      placeholder={placeholder || "Search"}
      className="w-89 bg-background border-none rounded-xl"
      sx={{
        "& fieldset": {
          border: "none",
        },
        ...sx,
      }}
      slotProps={{
        input: {
          endAdornment: (
            <InputAdornment position="end">
              <img src={ICONS.Search} alt="search" className="w-6 h-6" />
            </InputAdornment>
          ),
        },
      }}
    />
  );
};

export default CustomSearch;
