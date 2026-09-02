/* eslint-disable @typescript-eslint/no-explicit-any */
import {
  IconButton,
  InputAdornment,
  TextField,
  type SxProps,
  type Theme,
} from "@mui/material";
import { ICONS } from "../../../assets/exports";
import { useCallback, useMemo, useState, type FC } from "react";
import { debounce } from "lodash";

interface ICustomSearchProps {
  placeholder?: string;
  sx?: SxProps<Theme>;
  onSearch?: (term: string) => void;
}

const CustomSearch: FC<ICustomSearchProps> = ({
  placeholder,
  sx,
  onSearch,
}) => {
  const [searchTerm, setSearchTerm] = useState("");

  // Debounced version of the search callback
  const debouncedSearch = useMemo(
    () =>
      debounce((term: string) => {
        if (onSearch) {
          onSearch(term);
        } else {
          console.log("Searching for:", term);
        }
      }, 500),
    [onSearch],
  );

  const handleSearchChange = useCallback(
    (event: any) => {
      const value = event.target.value;
      setSearchTerm(value);
      debouncedSearch(value);
    },
    [debouncedSearch],
  );

  const handleSearchSubmit = () => {
    if (onSearch) {
      onSearch(searchTerm);
    } else {
      console.log("Searching for:", searchTerm);
    }
  };
  return (
    <TextField
      variant="outlined"
      type="text"
      placeholder={placeholder || "Search"}
      className="w-89 bg-background border-none rounded-xl"
      sx={{
        "& fieldset": {
          border: "none",
        },
        ...sx,
      }}
      value={searchTerm}
      onChange={handleSearchChange}
      onKeyPress={(event) => {
        if (event.key === "Enter") {
          handleSearchSubmit();
        }
      }}
      slotProps={{
        input: {
          endAdornment: (
            <InputAdornment position="end">
              <IconButton onClick={handleSearchSubmit} edge="end">
                <img src={ICONS.Search} alt="search" className="w-6 h-6" />
              </IconButton>
            </InputAdornment>
          ),
        },
      }}
    />
  );
};

export default CustomSearch;
