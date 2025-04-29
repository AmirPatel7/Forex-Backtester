import React, { useContext } from "react";
import { Box, useTheme } from "@mui/material";
import { tokens } from "../../theme";
import Header from "../../components/Header";
import { Button } from '@mui/material';
import { FiSun, FiMoon, FiFile, FiSlack, FiBarChart2  } from "react-icons/fi";
import { ColorModeContext } from "../../theme";
import { useNavigate } from "react-router-dom"; // Import useNavigate

/**
 * Displays the dashboard.
 * The dashboard consists of a weclome text, a dark and light mode toggle, and 
 * 3 buttons navigate you to either the editor page, metrics page, or
 * anomaly detection page.
 * 
 * @returns the dashboard
 */
const Dashboard = () => {
  const theme = useTheme(); // Accesses current theme
  const colors = tokens(theme.palette.mode); // Retrieves colors based on light/dark mode
  const colorMode = useContext(ColorModeContext); // Access the color mode context
  const navigate = useNavigate(); // Initialize 
  
  // Handles navigation to respective page
  const handleNavigation = (path) => {
    navigate(path); // Navigate to the specified path
  };

  return (
    <Box m="20px">
      <Box display="flex" justifyContent="space-between" alignItems="center">
        <Header title="DASHBOARD" subtitle="Welcome to your dashboard" />
        <Button 
          onClick={colorMode.toggleColorMode} // Use toggle function from context
          style={{
            backgroundColor: 'transparent',
            border: 'none',
            padding: 0,
            minWidth: 0,
            minHeight: 0,
            width: '60px',
            height: '60px',
          }}
          className="hover:bg-transparent focus:outline-none"
        >
          {theme.palette.mode === 'light' ? (
            <FiSun size={25} color="black" /> // Sun icon for light mode
          ) : (
            <FiMoon size={25} color="white" /> // Moon icon for dark mode
          )}
        </Button>
      </Box>
      <Box m="80px" textAlign="center">
        <Header title="Choose where you want to go!" />
      </Box>

      {/* Buttons for Navigation */}
      <Box display="flex" justifyContent="center" gap="20px">
        <Button
          onClick={() => handleNavigation('/editor')} // Navigate to the editor page
          sx={{
            backgroundColor: '#ADD8E6',
            color: 'black',
            width: '250px',
            height: '300px',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
            alignItems: 'center',
            borderRadius: '10px',
            textAlign: 'center',
            padding: '50px',
            transition: 'transform 0.2s ease, background-color 0.2s ease',
            '&:hover': {
              transform: 'scale(1.05)', // Increase size on hover
              backgroundColor: '#ADD8E6',
            },
          }}
        >
          <FiFile size={65} color="#136794" />
          <span style={{ margin: '10px 0', fontWeight: 'bold' }}>Editor</span>
          <span style={{ fontSize: '12px', marginTop: 'auto' }}>Run your backtesting python files.</span>
        </Button>

        <Button
          onClick={() => handleNavigation('/metrics')} // Navigate to the metrics page
          sx={{
            backgroundColor: '#ADD8E6',
            color: 'black',
            width: '250px',
            height: '300px',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
            alignItems: 'center',
            borderRadius: '10px',
            textAlign: 'center',
            padding: '50px',
            transition: 'transform 0.2s ease, background-color 0.2s ease',
            '&:hover': {
              transform: 'scale(1.05)', // Increase size on hover
              backgroundColor: '#ADD8E6',
            },
          }}
        >
          <FiBarChart2  size={65} color="#136794" />
          <span style={{ margin: '10px 0', fontWeight: 'bold' }}>Metrics</span>
          <span style={{ fontSize: '12px', marginTop: 'auto' }}>Visually see results of previous backtests.</span>
        </Button>

        <Button
          onClick={() => handleNavigation('/anomalyPage')} // Navigate to the anomaly detection page
          sx={{
            backgroundColor: '#ADD8E6',
            color: 'black',
            width: '250px',
            height: '300px',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
            alignItems: 'center',
            borderRadius: '10px',
            textAlign: 'center',
            padding: '50px',
            transition: 'transform 0.2s ease, background-color 0.2s ease',
            '&:hover': {
              transform: 'scale(1.05)', // Increase size on hover
              backgroundColor: '#ADD8E6',
            },
          }}
        >
          <FiSlack size={65} color="#136794" />
          <span style={{ margin: '10px 0', fontWeight: 'bold' }}>Anomaly Detection</span>
          <span style={{ fontSize: '12px', marginTop: 'auto' }}>See strange market occurrences.</span>
        </Button>
      </Box>
    </Box>
  );
};

export default Dashboard;
