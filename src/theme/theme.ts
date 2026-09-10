import { createTheme } from "@mui/material/styles";
import type {} from "@mui/x-date-pickers/themeAugmentation";

const theme = createTheme({
  palette: {
    primary: {
      main: "#e23744",
      light: "#ffdfe2",
      contrastText: "#ffffff",
    },
  },
  typography: {
    h1: {
      fontFamily: '"Plus Jakarta Sans", sans-serif;',
    },
    h2: {
      fontFamily: '"Plus Jakarta Sans", sans-serif;',
    },
    h3: {
      fontFamily: '"Plus Jakarta Sans", sans-serif;',
    },
    h4: {
      fontFamily: '"Plus Jakarta Sans", sans-serif;',
    },
    h5: {
      fontFamily: '"Plus Jakarta Sans", sans-serif;',
    },
    h6: {
      fontFamily: '"Plus Jakarta Sans", sans-serif;',
    },
    button: {
      fontFamily: '"Plus Jakarta Sans", sans-serif;',
      fontSize: 16,
      fontWeight: 700,
      lineHeight: "24px",
    },
  },
  breakpoints: {
    values: {
      xs: 0,
      sm: 300,
      md: 700,
      lg: 1000,
      xl: 1200,
    },
  },
  components: {
    MuiTextField: {
      styleOverrides: {
        root: {
          "& .MuiOutlinedInput-root": {
            boxShadow: "0 1px 2px 0 rgba(228, 229, 231, 0.24)",
            "& .MuiOutlinedInput-input": {
              padding: "16px",
            },
            "& .MuiOutlinedInput-notchedOutline": {
              borderRadius: "10px",
              borderColor: "#E5E7EB",
            },
            "&:hover .MuiOutlinedInput-notchedOutline": {
              borderRadius: "10px",
              borderColor: "#E5E7EB",
            },
            "& .MuiOutlinedInput-notchedOutline, & :hover .MuiOutlinedInput-notchedOutline, &.Mui-focused .MuiOutlinedInput-notchedOutline":
              {
                borderRadius: "10px",
                borderColor: "#E5E7EB",
              },
          },
        },
      },
    },
    MuiInputBase: {
      styleOverrides: {
        input: {
          "&:-webkit-autofill, :autofill": {
            boxShadow: "0 0 0 1000px #fff inset",
            WebkitTextFillColor: "#000", // text color
            transition: "all 5000s ease-in-out 0s",
          },
        },
      },
    },

    MuiFormHelperText: {
      styleOverrides: {
        root: {
          marginTop: 0,
        },
      },
    },
  },
});

export default theme;
