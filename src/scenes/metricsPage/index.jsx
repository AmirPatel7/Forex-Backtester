import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";

/**
 * Metrics component for displaying standard metrics and a plot for a specific backtest file.
 *
 * @returns {JSX.Element} The rendered metrics component.
 */
const Metrics = () => {
  
  const { fileName } = useParams();  // Retrieve the file name from the URL
  const [metrics, setMetrics] = useState({});
  const [fileInfo, setFileInfo] = useState({});  // Store file information
  const navigate = useNavigate();  // Initialize the navigate function
 
  
  useEffect(() => {
    if (!fileName) return;

    // Construct the JSON file path dynamically based on the clicked file
    const fileInfoPath = `../Archive/${fileName}/metadata.json`;
    const jsonPath = `../Archive/${fileName}/results/backtest_results.json`;
    // Fetch the file information from the metadata.json
    fetch(fileInfoPath)
      .then(response => response.json())
      .then(data => {
        setFileInfo(data);  // Set the file information (assetName, startDate, etc.)
      })
      .catch(error => console.error('Error fetching file information:', error));

    fetch(jsonPath)
      .then(response => response.json())
      .then(data => {
        // Filter out '_strategy'
        const filteredMetrics = Object.fromEntries(
          Object.entries(data).filter(([key]) => key !== "_strategy")
        );
        setMetrics(filteredMetrics);
      })
      .catch(error => console.error('Error fetching JSON:', error));
  }, [fileName]);

  return (
    <div style={{ padding: "20px" }}>
      {/* File Info Section */}
      <div style={{ display: "flex", border: "1px solid black", justifyContent: "space-between", marginBottom: "10px" }}>
        <div style={{ flex: 1, marginLeft: "20px" }}>
          <h2>File Information</h2>
          <ul>

            <li>Name: {fileInfo.name}</li>
            <li>Asset Name: {fileInfo.assetName}</li>
            <li>Start Date: {fileInfo.startDate}</li>
            <li>End Date: {fileInfo.endDate}</li>
            <li>Interval: {fileInfo.interval}</li>
            <li>Backtest File: {fileInfo.backtest_fileName}</li>
          </ul>
        </div>
        
        {/* Button for navigation */}
        <div style={{marginRight: "20px"}}>
        <button 
          onClick={() => navigate(`../basicEditor/public/Archive/${encodeURIComponent(fileName)}/${encodeURIComponent(fileInfo.backtest_fileName)}`)}
          style={{ height: "fit-content", padding: "10px 5px", marginTop: "20px" }}>
          View {fileInfo.backtest_fileName}
        </button>
        </div>
      </div>

      {/* Metrics and Plot Section */}
      <div style={{ display: "flex", justifyContent: "space-between", gap: "10px" }}>
        {/* Metrics Section */}
        <div style={{ flex: "0 0 30%", border: "1px solid black", padding: "10px" }}>
          <h2>Standard Metrics</h2>
          <ul>
            {Object.entries(metrics).map(([key, value]) => (
              <li key={key}>
                {key}: {value !== null ? value.toString() : "N/A"}
              </li>
            ))}
          </ul>
        </div>
        
        {/* Plot Section */}
        <div style={{ flex: "0 0 70%", border: "1px solid black", padding: "10px" }}>
          <iframe
            src={`http://localhost:3000/Archive/${fileName}/results/plot.html`}  // Dynamic plot file
            style={{ border: "2px solid black", width: "100%", height: "90%" }}
            title="Bokeh Plot"
          />
        </div>
      </div>
    </div>
  );
};

export default Metrics;
