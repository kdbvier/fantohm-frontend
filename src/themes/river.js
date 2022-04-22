import { createTheme, responsiveFontSizes } from "@material-ui/core/styles";
import fonts from "./fonts";
import commonSettings from "./global.js";

// TODO: Break repeated use color values out into list of consts declared here
// then set the values in riverTheme using the global color variables

const riverTheme = {
  color: "#FCFCFC",
  gold: "#F7C775",
  gray: "#A3A3A3",
  textHighlightColor: "#F7C775",
  backgroundColor: "rgba(12,76,75,1)",
  background: `
    linear-gradient(90deg, rgba(57,151,148,1), rgba(12,76,75,1));
    `,
  paperBg: "rgba(50,46,32,0.4)",
  modalBg: "#24242699",
  popoverBg: "rgba(50,46,32, 0.99)",
  menuBg: "#322e2080",
  backdropBg: "rgba(50,46,32, 0.5)",
  largeTextColor: "#F7C775",
  activeLinkColor: "#F5DDB4",
  activeLinkSvgColor:
    "brightness(0) saturate(100%) invert(84%) sepia(49%) saturate(307%) hue-rotate(326deg) brightness(106%) contrast(92%)",
  primaryButtonColor: "#333333",
  primaryButtonBG: "#F7C775",
  primaryButtonHoverBG: "#EDD8B4",
  secondaryButtonHoverBG: "rgba(50,46,32, 1)",
  outlinedPrimaryButtonHoverBG: "#F7C775",
  outlinedPrimaryButtonHoverColor: "#333333",
  outlinedSecondaryButtonHoverBG: "transparent",
  outlinedSecondaryButtonHoverColor: "#F7C775", //gold
  containedSecondaryButtonHoverBG: "rgba(255, 255, 255, 0.15)",
  graphStrokeColor: "rgba(255, 255, 255, .1)",
};

export const river = responsiveFontSizes(
  createTheme(
    {
      primary: {
        main: riverTheme.color,
      },
      palette: {
        type: "light",
        background: {
          default: riverTheme.backgroundColor,
          paper: riverTheme.paperBg,
        },
        contrastText: riverTheme.color,
        primary: {
          main: riverTheme.color,
        },
        neutral: {
          main: riverTheme.color,
          secondary: riverTheme.gray,
        },
        text: {
          primary: riverTheme.color,
          secondary: riverTheme.gray,
        },
        graphStrokeColor: riverTheme.graphStrokeColor,
      },
      typography: {
        fontFamily: "Montserrat",
      },
      props: {
        MuiSvgIcon: {
          htmlColor: riverTheme.color,
        },
      },
      overrides: {
        MuiCssBaseline: {
          "@global": {
            "@font-face": fonts,
            body: {
              background: riverTheme.background,
            },
          },
        },
        MuiDrawer: {
          paper: {
            backgroundColor: riverTheme.paperBg,
            zIndex: 7,
          },
        },
        MuiPaper: {
          root: {
            backgroundColor: riverTheme.paperBg,
            "&.ohm-card": {
              backgroundColor: riverTheme.paperBg,
            },
            "&.ohm-card-secondary": {
              backgroundColor: riverTheme.paperBg,
            },
            "&.dapp-sidebar": {
              backgroundColor: riverTheme.paperBg,
            },
            "&.ohm-modal": {
              backgroundColor: riverTheme.modalBg,
            },
            "&.ohm-menu": {
              backgroundColor: riverTheme.menuBg,
              backdropFilter: "blur(33px)",
            },
            "&.ohm-popover": {
              backgroundColor: riverTheme.popoverBg,
              color: riverTheme.color,
              backdropFilter: "blur(15px)",
            },
          },
        },
        MuiBackdrop: {
          root: {
            backgroundColor: riverTheme.backdropBg,
          },
        },
        MuiLink: {
          root: {
            color: riverTheme.color,
            "&:hover": {
              color: riverTheme.textHighlightColor,
              textDecoration: "none",
              "&.active": {
                color: riverTheme.color,
              },
            },
            "&.active": {
              color: riverTheme.color,
              textDecoration: "underline",
            },
          },
        },
        MuiTableCell: {
          root: {
            color: riverTheme.color,
          },
        },
        MuiInputBase: {
          root: {
            // color: riverTheme.gold,
          },
        },
        MuiOutlinedInput: {
          notchedOutline: {
            // borderColor: `${riverTheme.gold} !important`,
            "&:hover": {
              // borderColor: `${riverTheme.gold} !important`,
            },
          },
        },
        MuiTab: {
          textColorPrimary: {
            color: riverTheme.gray,
            "&$selected": {
              color: riverTheme.gold,
            },
          },
        },
        PrivateTabIndicator: {
          colorPrimary: {
            backgroundColor: riverTheme.gold,
          },
        },
        MuiToggleButton: {
          root: {
            backgroundColor: riverTheme.paperBg,
            "&:hover": {
              color: riverTheme.color,
              backgroundColor: `${riverTheme.containedSecondaryButtonHoverBG} !important`,
            },
            selected: {
              backgroundColor: riverTheme.containedSecondaryButtonHoverBG,
            },
            "@media (hover:none)": {
              "&:hover": {
                color: riverTheme.color,
                backgroundColor: riverTheme.paperBg,
              },
              "&:focus": {
                color: riverTheme.color,
                backgroundColor: riverTheme.paperBg,
                borderColor: "transparent",
                outline: "#00000000",
              },
            },
          },
        },
        MuiButton: {
          containedPrimary: {
            color: riverTheme.primaryButtonColor,
            backgroundColor: riverTheme.gold,
            "&:hover": {
              backgroundColor: riverTheme.primaryButtonHoverBG,
              color: riverTheme.primaryButtonHoverColor,
            },
            "&:active": {
              backgroundColor: riverTheme.primaryButtonHoverBG,
              color: riverTheme.primaryButtonHoverColor,
            },
            "@media (hover:none)": {
              color: riverTheme.primaryButtonColor,
              backgroundColor: riverTheme.gold,
              "&:hover": {
                backgroundColor: riverTheme.primaryButtonHoverBG,
              },
            },
          },
          containedSecondary: {
            backgroundColor: riverTheme.paperBg,
            color: riverTheme.color,
            "&:hover": {
              backgroundColor: `${riverTheme.containedSecondaryButtonHoverBG} !important`,
            },
            "&:active": {
              backgroundColor: riverTheme.containedSecondaryButtonHoverBG,
            },
            "&:focus": {
              backgroundColor: riverTheme.paperBg,
            },
            "@media (hover:none)": {
              color: riverTheme.color,
              backgroundColor: riverTheme.paperBg,
              "&:hover": {
                backgroundColor: `${riverTheme.containedSecondaryButtonHoverBG} !important`,
              },
            },
          },
          outlinedPrimary: {
            color: riverTheme.gold,
            borderColor: riverTheme.gold,
            "&:hover": {
              color: riverTheme.outlinedPrimaryButtonHoverColor,
              backgroundColor: riverTheme.primaryButtonHoverBG,
            },
            "@media (hover:none)": {
              color: riverTheme.gold,
              borderColor: riverTheme.gold,
              "&:hover": {
                color: riverTheme.outlinedPrimaryButtonHoverColor,
                backgroundColor: `${riverTheme.primaryButtonHoverBG} !important`,
                textDecoration: "none !important",
              },
            },
          },
          outlinedSecondary: {
            color: riverTheme.color,
            borderColor: riverTheme.color,
            "&:hover": {
              color: riverTheme.outlinedSecondaryButtonHoverColor,
              backgroundColor: riverTheme.outlinedSecondaryButtonHoverBG,
              borderColor: riverTheme.gold,
            },
          },
          textPrimary: {
            color: "#A3A3A3",
            "&:hover": {
              color: riverTheme.gold,
              backgroundColor: "#00000000",
            },
            "&:active": {
              color: riverTheme.gold,
              borderBottom: "#F7C775",
            },
          },
          textSecondary: {
            color: riverTheme.color,
            "&:hover": {
              color: riverTheme.textHighlightColor,
            },
          },
        },
      },
    },
    commonSettings,
  ),
);