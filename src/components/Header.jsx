import { Typography, Box, useTheme } from "@mui/material";
import { tokens } from "../theme";

/**
 * Header component that displays a title and a subtitle.
 *
 * @param {Object} props - The props for the component.
 * @param {string} props.title - The title to be displayed.
 * @param {string} props.subtitle - The subtitle to be displayed.
 * @returns {JSX.Element} The rendered header component.
 */
const Header = ({ title, subtitle }) => {
  const theme = useTheme();
  const colors = tokens(theme.palette.mode);
  return (
    <Box mb="30px">
      <Typography
        variant="h2"
        color={colors.grey[100]}
        fontWeight="bold"
        sx={{ m: "0 0 5px 0" }}
      >
        {title}
      </Typography>
      <Typography variant="h5" color={colors.greenAccent[400]}>
        {subtitle}
      </Typography>
    </Box>
  );
};

export default Header;
