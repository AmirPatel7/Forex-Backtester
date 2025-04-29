import { Box, useTheme, Typography } from "@mui/material";
import { useEffect, useState } from "react";
import { tokens } from "../../theme"; // Import theme tokens for consistent styling
import Header from "../../components/Header"; // Import Header component

/**
 * Anomaly component for displaying anomaly detection results.
 * It checks for the existence of a PNG and a JSON file, displays their contents,
 * and handles errors if the files are missing or contain invalid data.
 */
const Anomaly = () => {
  const theme = useTheme(); // Get the current theme
  const colors = tokens(theme.palette.mode); // Get the color tokens based on the theme mode
  const [anomalyData, setAnomalyData] = useState({ pngPath: '', jsonData: {} }); // State for storing anomaly data
  const [error, setError] = useState(""); // State for storing error messages

  // Effect to check for PNG and JSON files
  useEffect(() => {
    const pngPath = '/anomaly_results/anomaly.png'; // Path to the PNG file
    const jsonPath = '/anomaly_results/anomaly.json'; // Path to the JSON file

    // Function to check the existence of the files
    const checkFiles = async () => {
      try {
        // Check PNG file
        const pngResponse = await fetch(pngPath);
        if (!pngResponse.ok) {
          throw new Error("Anomaly PNG file is missing."); // Throw error if PNG is not found
        }

        // Check JSON file
        const jsonResponse = await fetch(jsonPath);
        if (!jsonResponse.ok) {
          throw new Error("Anomaly JSON file is missing."); // Throw error if JSON is not found
        }

        // Check the content type before parsing JSON
        const contentType = jsonResponse.headers.get("content-type");
        if (!contentType || !contentType.includes("application/json")) {
          throw new Error("No anomaly statistics available. Try running the anomaly_detection file on the editor's page and return to this page for your results.");
        }

        // Parse JSON response only if it's valid JSON
        const jsonData = await jsonResponse.json();
        setAnomalyData({ pngPath, jsonData }); // Update state with PNG path and JSON data
        setError(""); // Clear error if files load successfully
      } catch (err) {
        // Set a user-friendly error message
        setError(err.message || "An error occurred while loading the data.");
      }
    };

    checkFiles(); // Call the function to check files
  }, []);

  // Function to render the entire JSON object recursively
  const renderNestedObject = (obj) => {
    return (
      <ul>
        {Object.entries(obj).map(([key, value]) => (
          <li key={key}>
            <strong>{key}:</strong> {typeof value === 'object' && value !== null ? renderNestedObject(value) : value.toString()}
          </li>
        ))}
      </ul>
    );
  };

  return (
    <Box m="20px">
      <Header title="Anomaly Detection Page" /> {/* Render the header */}
      {error ? (
        <Box mt="20px" color={colors.redAccent[500]}>
          {error} {/* Display error message if exists */}
        </Box>
      ) : (
        <Box display="flex" justifyContent="space-between" gap="10px">
          {/* Metrics Section */}
          <Box flex="0 0 30%" border="1px solid black" padding="10px">
            <Typography variant="h6">Anomaly JSON Data</Typography>
            {anomalyData.jsonData && Object.keys(anomalyData.jsonData).length > 0 ? (
              renderNestedObject(anomalyData.jsonData) // Display the entire JSON object if it exists
            ) : (
              <Typography>No data available.</Typography> // Message if no data is present
            )}
          </Box>

          {/* Plot Section */}
          <Box flex="0 0 70%" border="1px solid black" padding="10px">
            <img
              src={anomalyData.pngPath} // Source of the PNG file
              alt="Anomaly"
              style={{ border: "2px solid black", width: "100%", height: "auto" }}
              onError={() => setError("Anomaly PNG file is missing.")}
              onLoad={() => setError("")} // Clear error if image loads successfully
            />
          </Box>
        </Box>
      )}
    </Box>
  );
};

export default Anomaly; // Export the Anomaly component
