import React from "react";
import { Box, Typography, useTheme } from "@mui/material";

/**
 * Footer component that displays a copyright notice and a message.
 *
 * @returns {JSX.Element} The rendered footer component.
 */
const Footer = () => {
  const theme = useTheme();

  return (
    <Box
      component="footer"
      sx={{
        padding: "10px",
        backgroundColor: theme.palette.background.default,
        textAlign: "center",
        marginTop: "auto", // Pushes the footer to the bottom
      }}
    >
      <Typography variant="body2" color="textSecondary">
      Harness the power of expert insights and advanced tools for your Forex trading success. © 2024 Spatialedge. All rights reserved.
      </Typography>
    </Box>
  );
};

export default Footer;
