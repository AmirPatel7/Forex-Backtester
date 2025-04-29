import React, { useEffect, useState, useRef } from 'react';
import { Box, useTheme, Button } from "@mui/material";
import { tokens } from "../../theme";
import Header from "../../components/Header";
import { useParams, useNavigate } from 'react-router-dom';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';

/**
 * Converts a currency pair in the format "XXX/YYY" to "XXXYYY=X".
 *
 * @param {string} pair - The currency pair to convert, formatted as "XXX/YYY"
 * @return {string} The converted currency pair in the format "XXXYYY=X"
 * @throws {Error} If the currency pair format is invalid
 */
function convertCurrency(pair) {
  // Split the pair by '/'
  const currencies = pair.split('/');

  // Join the currencies and append "=X"
  if (currencies.length === 2) {
    return currencies[0] + currencies[1] + '=X';
  } else {
    throw new Error('Invalid currency pair format');
  }
}

/**
 * EditorPage component for rendering the editor page interface.
 * This component manages state for profile modals, hover effects, asset and time frame selection, date range, and file paths.
 *
 * @component
 * @returns {JSX.Element} The EditorPage component
 */
const EditorPage = () => {
  const navigate = useNavigate();
  const { '*' : nestedPath } = useParams();
  const fileName = nestedPath || '';

  // Themes
  const theme = useTheme();
  const colors = tokens(theme.palette.mode);

  // Profiles
  const [openProfile, setOpenProfile] = useState(false); // State to manage the profile modal visibility
    const [openProfile2, setOpenProfile2] = useState(false); // State for a second profile modal
    const [openProfile3, setOpenProfile3] = useState(false); // State for a third profile modal
 
  // Hover options
  const [isAssetDivHovered, setAssetDivIsHovered] = useState(false); // State to track hover over the asset div
  const [isTimeFrameDivHovered, setTimeFrameDivIsHovered] = useState(false); // State to track hover over the time frame div
  const [isFileDivHovered, setFileDivIsHovered] = useState(false); // State to track hover over the file div
  const [hoveredIndex, setHoveredIndex] = useState(null); // State to track the hovered item index

  // Dropdown items
  const items = ['EUR/USD', 'USD/JPY', 'GBP/USD', 'USD/CHF', 'AUD/USD']; // List of currency pairs for asset selection
  const timeFrameItems = ['5 minute', '15 minute', '30 minute', '1 hour', '1 day']; // List of available time frames

  // Default chosen items
  const [assetName, setAssetName] = useState('EUR/USD'); //assetName stores the name of the asset
  const [timeFrame, setTimeFrame] = useState('5 minute'); //timeFrame stores the time frame

  // Seletced date 
  const [selectedFromDate, setSelectedFromDate] = useState(null); //selectedFromDate stores the value of the 'from date'
  const [selectedToDate, setSelectedToDate] = useState(null); //selectedToDate stores the value of the 'to date'

  const [path, setPath] = useState('');
  const iframeRef = useRef(null); // Ref for the iframe

  const [pythonFiles, setPythonFiles] = useState([]); // Stores python files
  const [selectedFile, setSelectedFile] = useState(''); // Stores selected python file

  let duration = "0 days 00:00"; //duration between from date and to date

  /**
   * Fetches the folder path from the server and updates the path state.
   * Logs the path to the console for debugging.
   */
  useEffect(() => {
    const fetchPath = async () => {
      const response = await fetch(`http://localhost:5000/api/folderPath`);
      const text = await response.text();
      setPath(text);
      console.log(path);
    };

    fetchPath();
  });
  // Construct URL for the iframe based on the selected folder path
  const url = "http://localhost:8080/?folder=" + encodeURIComponent(path);

  /**
   * useEffect to fetch Python files when the component is mounted.
   * The function attempts to fetch the available Python files from the server, 
   * sets the fetched files into the `pythonFiles` state, and selects the first file by default.
   * "No Files found" is set as the selected file is there are not files.
   */
  useEffect(() => {
    const fetchPythonFiles = async () => {
      try {
        const response = await fetch('http://localhost:5000/api/pythonFiles');
        const data = await response.json();
        setPythonFiles(data);
        // If there are files, set the first file as the selected file
        if (data.length > 0) {
          setSelectedFile(data[0]); // Set the first file's name as selected
        } else {
          setSelectedFile("No Files found");
        }
      } catch (error) {
        console.error('Error fetching python files:', error);
        alert('Failed to fetch Python files');
      }
    };
    fetchPythonFiles();
  }, []); // Empty dependency array ensures this runs only once
  
  /**
   * Returns the time interval in minutes based on the selected time frame.
   *
   * @param {string} timeFrame - The selected time frame
   * @returns {number} The time interval in minutes for the given time frame
   */
    const getTimeInterval = (timeFrame) => {

    let timeInterval = 5;
    switch(timeFrame) {

      case '5 minute': 
      timeInterval = 5;
      break;
      case '15 minute': 
      timeInterval = 15;
      break;
      case '30 minute': 
      timeInterval = 30;
      break;
      case '1 hour': 
      timeInterval = 60;
      break;
      case '4 hour': 
      timeInterval = 240;
      break;
      case '1 day': 
      timeInterval = 1440; // Included as a precautionary case
      break;
    }
    return timeInterval;
  };

  /**
   * Returns the time interval as a string, formatted for use with certain APIs or charts.
   *
   * @param {string} timeFrame - The selected time frame
   * @returns {string} The formatted time interval
   */
  const getTimeIntervalString = (timeFrame) => {

    let timeInterval = 5;
    switch(timeFrame) {

      case '5 minute': 
      timeInterval = '5m';
      break;
      case '15 minute': 
      timeInterval = '15m';
      break;
      case '30 minute': 
      timeInterval = '30m';
      break;
      case '1 hour': 
      timeInterval = '1h';
      break;
      case '4 hour': 
      timeInterval = '4h';
      break;
      case '1 day': 
      timeInterval = '1d'; // Precautionary case
      break;
    }
    return timeInterval;
  };

  /**
   * Handles date selection changes and ensures the selected date's time is set to midnight if the time frame is '1 day'.
   *
   * @param {Date|null} date - The new selected date
   * @param {Function} setDate - The setter function for updating the selected date state
   */
  const handleDateChange = (date, setDate) => {
    if (timeFrame === '1 day' && date !== null) {
      date.setHours(0, 0, 0, 0);
    }
    setDate(date);
  };

  /**
   * Calculates the duration between two dates in the format "X days HH:MM".
   *
   * @param {Date} fromDate - The start date
   * @param {Date} toDate - The end date
   * @returns {string|null} The formatted duration string ("2 days 04:30"), or null if dates invalid
   */
  const calculateDuration = (fromDate, toDate) => {
    
    if (!fromDate || !toDate) return null;
    
    const diff = toDate.getTime() - fromDate.getTime(); // Calculate the difference in milliseconds
    const days = Math.floor(diff / (1000 * 60 * 60 * 24)); // Calculate the number of days
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)); // Calculate the remaining hours
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60)); // Calculate the remaining minutes

    // Return formatted duration string
    return `${days} days ${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
  };

  /**
   * Determines if the time should be shown based on the selected time frame.
   *
   * @returns {boolean} True if the time should be shown, false otherwise.
   */
  const shouldShowTime = () => {
    // If time frame '1 day', time should not be shown
    if (timeFrame === '1 day') {
      return false;
    } else {
      return true;
    }
  }

  /**
   * Returns the appropriate date format string based on whether the time should be shown.
   *
   * @returns {string} The date format string
   */
  const getDateFormat = () => shouldShowTime() ? "dd/MM/yyyy HH:mm" : "dd/MM/yyyy";

  /**
   * Executes the backtest by sending the selected parameters to the backend API.
   * Validates inputs such as the start date, end date, and selected Python file before making the API call.
   */
  const runCode = async () => {
      if (!selectedFromDate) {
        alert('Please select a starting date');
        return;
      }
      if (!selectedToDate) {
        alert('Please select an ending date');
        return;
      }
      if (selectedFromDate >= selectedToDate) {
        alert('Invalid input: Starting date must be before Ending date');
        return;
      }

      if (!selectedFile) {
        alert('Please select a Python file');
        return;
      }


      // Prompt for strategy name
      const strategyName = window.prompt('Enter a run name:');
      if (!strategyName) {
        alert('Run name is required!');
        return;
      }

      // Calculate duration
      duration = calculateDuration(selectedFromDate, selectedToDate);
      console.log('Duration:', duration);

      // Get the time interval string based on the selected time frame
      const timeInterval = getTimeIntervalString(timeFrame);

      // Log key parameters to the console for debugging
      console.log(convertCurrency(assetName)); // Log the converted currency pair
      console.log(selectedFromDate.toISOString().slice(0, 10)); // Log the start date (YYYY-MM-DD)
      console.log(selectedToDate.toISOString().slice(0, 10)); // Log the end date (YYYY-MM-DD)
      console.log(timeInterval); // Log the time interval
      
      // Make a POST request to the /api/run endpoint with the necessary parameters
      const response = await fetch('http://localhost:5000/api/run', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: strategyName, // The strategy name entered by the user
          assetName: convertCurrency(assetName), // The selected asset name, converted to the proper format
          startDate: selectedFromDate.toISOString().slice(0, 10), // The start date in YYYY-MM-DD format
          endDate: selectedToDate.toISOString().slice(0, 10), // The end date in YYYY-MM-DD format
          interval: timeInterval, // The time interval string
          backtest_fileName: selectedFile, // The selected Python file for the backtest
      }),
      });

      if (!response.ok) {
        throw new Error('Failed to run the backtest');
      }
      // Parse response to get the taskId
      const { taskId } = await response.json();
      navigate(`/progress/${taskId}`, { state: { strategyName } });
  };
  
  /**
   * Selects the asset name and updates the state accordingly.
   *
   * @param {string} selectedAssetName - The name of the asset to be selected
   * @returns {Promise<void>} A promise that resolves when the asset name is set
   */
  const selectAsset = async (selectedAssetName) => {
    try {
      setAssetName(selectedAssetName)
    } catch (error) {
      console.error('Oops, we received the following error:', error);
      alert('Oops! That did not work, try again'); // Display an alert if an error occurs
    }
  };

  /**
   * Selects the file name and updates the state accordingly.
   *
   * @param {string} selectedFileName - The name of the file to be selected
   * @returns {Promise<void>} A promise that resolves when the file name is set
   */
  const selectFile = async (selectedFileName) => {
    try {
      setSelectedFile(selectedFileName)
    } catch (error) {
      console.error('Oops, we received the following error:', error);
      alert('Oops! That did not work, try again'); // Display an alert if an error occurs
    }
  };

  /**
   * Selects the time frame and updates the state accordingly. 
   * If dates are already selected, it clears the date and time to prevent conflicts with the new time frame.
   *
   * @param {string} selectedTimeFrame - The time frame selected by the user
   * @returns {Promise<void>} A promise that resolves when the time frame is set
   */
  const selectTimeFrame = async (selectedTimeFrame) => {
    try {
      setTimeFrame(selectedTimeFrame)

      // Check if the user had previously selected a date and alert them that it has been cleared
      if ((selectedFromDate !== null && selectedFromDate !== 'From Date') || (selectedToDate !== null && selectedToDate !== 'To Date')) {
        alert('You\'ve changed time frames after already selecting a date and time. The date and time has therefore been cleared. Please re-enter them with your new time frame.')
      }

      // Clear the selected dates
      setSelectedFromDate(null);
      setSelectedToDate(null);
      setTimeFrame(selectedTimeFrame)
    } catch (error) {
      console.error('Oops, we received the following error:', error);
      alert('Oops! That did not work, try again'); // Display an alert if an error occurs
    }
  };

  return (
    <Box m="20px">
      <Box>
        <Box display="flex" justifyContent="space-between" alignItems="center" mb="5px">
            <Box width="48%">
              <div onMouseLeave={() => setOpenProfile(false)}>
                <div className="assetDropDownMenu-tooltip-container" onClick={() => setOpenProfile((prev) => !prev)}
                  onMouseEnter={() => setAssetDivIsHovered(true)}
                  onMouseLeave={() => setAssetDivIsHovered(false)}
                  style={{
                    backgroundColor: isAssetDivHovered ? '#6870fa' : colors.primary[400], 
                    color: colors.grey[100],
                    fontSize: "14px",
                    width: "100%",
                    fontWeight: "bold",
                    padding: "12px 16px",
                    textAlign: 'center',
                    cursor: 'pointer',
                    transition: '0.5s',
                    transform: isAssetDivHovered ? 'scale(1.01)' : 'scale(1)',
                  }}>
                  <span className="assetDropDownMenu-text">{isAssetDivHovered ? "Choose an asset" : assetName}</span>
                </div>
                
                {
                  openProfile && (
                    <div className="dropDownMenuDiv" 
                    
                    style={{
                      fontSize: "14px",
                      fontWeight: "bold",
                      position: 'relative',
                      borderRadius: "5px",
                      width: '100%',
                      display: 'flex',
                      justifyContent: 'center',
                    }}>
                        <ul className="dropDownMenuList" 
                      style={{
                        listStyle: 'none',
                        padding: 0,
                        margin: 0,
                        position: 'absolute',
                        top: '100%',
                        left: '36%',
                        transform: 'translateX(-50%)',
                        zIndex: 3000, 
                      }}
                    >
                      {items.map((item, index) => {
                        let itemStyle = {
                          backgroundColor: `${colors.primary[400]}`,
                          border: `1px solid ${colors.primary[800]}`,
                          padding: "8px 65px",
                          width: "152%",
                          textAlign: "center",
                          borderRadius: "2px",
                          cursor: 'pointer',
                          transform: hoveredIndex === index ? 'scale(1.02)' : 'scale(1)',
                        };

                        if (item === assetName) {
                          itemStyle.backgroundColor = '#595fba';
                        } else {
                          itemStyle.backgroundColor = '#1a273b';
                        }

                            return (
                              <li
                                key={index}
                                style={itemStyle}
                                onMouseEnter={() => setHoveredIndex(index)} 
                                onMouseLeave={() => setHoveredIndex(null)}
                                onClick={() => selectAsset(item)} //update assetName on click
                              >
                                {item}
                              </li>
                            );
                          })}
                        </ul>
                    </div>
                  )
                }
              </div>
            </Box>

            <Box width="50%">
              <div onMouseLeave={() => setOpenProfile2(false)}>
                <div className="timeFrameDropDownMenu-tooltip-container" onClick={() => setOpenProfile2((prev) => !prev)}
                  onMouseEnter={() => setTimeFrameDivIsHovered(true)}
                  onMouseLeave={() => setTimeFrameDivIsHovered(false)}
                  style={{
                    backgroundColor: isTimeFrameDivHovered ? '#6870fa' : colors.primary[400], 
                    color: colors.grey[100],
                    fontSize: "14px",
                    width: "100%",
                    fontWeight: "bold",
                    padding: "12px 16px",
                    textAlign: 'center',
                    cursor: 'pointer',
                    transition: '0.5s',
                    transform: isTimeFrameDivHovered ? 'scale(1.01)' : 'scale(1)',
                  }}>
                  <span className="timeFrameDropDownMenu-text">{isTimeFrameDivHovered ? "Choose a time frame" : timeFrame}</span>
                </div>

                {
                  openProfile2 && (
                    <div className="dropDownMenuDiv" 
                    
                    style={{
                      fontSize: "14px",
                      fontWeight: "bold",
                      position: 'relative',
                      borderRadius: "5px",
                      width: '100%',
                      display: 'flex',
                      justifyContent: 'center',
                    }}>
                        <ul className="dropDownMenuList" 
                      style={{
                        listStyle: 'none',
                        padding: 0,
                        margin: 0,
                        position: 'absolute',
                        top: '100%',
                        left: '36%',
                        transform: 'translateX(-50%)',
                        zIndex: 3000, 
                      }}
                    >
                      {timeFrameItems.map((item, index) => {
                        let itemStyle = {
                          backgroundColor: `${colors.primary[400]}`,
                          border: `1px solid ${colors.primary[800]}`,
                          padding: "8px 65px",
                          width: "152%",
                          textAlign: "center",
                          borderRadius: "2px",
                          cursor: 'pointer',
                          transform: hoveredIndex === index ? 'scale(1.02)' : 'scale(1)',
                        };

                        if (item === timeFrame) {
                          itemStyle.backgroundColor = '#595fba';
                        } else {
                          itemStyle.backgroundColor = '#1a273b';
                        }

                            return (
                              <li
                                key={index}
                                style={itemStyle}
                                onMouseEnter={() => setHoveredIndex(index)} 
                                onMouseLeave={() => setHoveredIndex(null)}
                                onClick={() => selectTimeFrame(item)} //update time frame 
                              >
                                {item}
                              </li>
                            );
                          })}
                        </ul>
                    </div>
                  )
                }
              </div>
            </Box>
          
          <Box width="48%">
              <div onMouseLeave={() => setOpenProfile3(false)}>
                <div className="assetDropDownMenu-tooltip-container" onClick={() => setOpenProfile3((prev) => !prev)}
                  onMouseEnter={() => setFileDivIsHovered(true)}
                  onMouseLeave={() => setFileDivIsHovered(false)}
                  style={{
                    backgroundColor: isFileDivHovered ? '#6870fa' : colors.primary[400], 
                    color: colors.grey[100],
                    fontSize: "14px",
                    width: "100%",
                    fontWeight: "bold",
                    padding: "12px 16px",
                    textAlign: 'center',
                    cursor: 'pointer',
                    transition: '0.5s',
                    transform: isFileDivHovered ? 'scale(1.01)' : 'scale(1)',
                  }}>
                  <span className="assetDropDownMenu-text">{isFileDivHovered ? "Choose a backtest" : selectedFile}</span>
                </div>
                
                {
                  openProfile3 && (
                    <div className="dropDownMenuDiv" 
                    
                      style={{
                        fontSize: "14px",
                        fontWeight: "bold",
                        position: 'relative',
                        borderRadius: "5px",
                        width: '100%',
                        display: 'flex',
                        justifyContent: 'center',
                      }}>
                          <ul className="dropDownMenuList" 
                        style={{
                          listStyle: 'none',
                          padding: 0,
                          margin: 0,
                          position: 'absolute',
                          top: '100%',
                          left: '33%',
                          transform: 'translateX(-50%)',
                          zIndex: 3000, 
                        }}
                      >
                        {pythonFiles.map((item, index) => {
                          let itemStyle = {
                          backgroundColor: `${colors.primary[400]}`,
                          border: `1px solid ${colors.primary[800]}`,
                          padding: "8px 65px",
                          width: "152%",
                          textAlign: "center",
                          borderRadius: "2px",
                          cursor: 'pointer',
                          transform: hoveredIndex === index ? 'scale(1.02)' : 'scale(1)',
                        };

                        if (item === selectedFile) {
                          itemStyle.backgroundColor = '#595fba';
                        } else {
                          itemStyle.backgroundColor = '#1a273b';
                        }

                            return (
                              <li
                                key={index}
                                style={itemStyle}
                                onMouseEnter={() => setHoveredIndex(index)} 
                                onMouseLeave={() => setHoveredIndex(null)}
                                onClick={() => selectFile(item)} //update assetName on click
                              >
                                {item}
                              </li>
                            );
                          })}
                        </ul>
                    </div>
                  )
                }
              </div>
            </Box>
           
            <Box ml="5px">
            <Box width="95%">
              <DatePicker
                selected={selectedFromDate}
                onChange={(date) => handleDateChange(date, setSelectedFromDate)}
                dateFormat={getDateFormat()}
                showTimeSelect={shouldShowTime()}
                timeFormat="HH:mm"
                timeIntervals={getTimeInterval(timeFrame)}
                timeCaption="Time"
                showYearDropdown
                showMonthDropdown
                scrollableMonthYearDropdown
                minDate={new Date(2016, 0, 1)}
                maxDate={new Date()}
                placeholderText="From Date"
                isClearable
                popperPlacement="left-start"
                customInput={
                  <input
                    style={{
                      width: "100%",
                      fontSize: "16px", // Text size
                      padding: "4px 12px", // Adjust height padding
                      borderRadius: "5px", // Adjust the border radius
                      border: "2px solid #5f6569", // Customize the border
                      backgroundColor: "#f0f0f0", // Background color
                    }}
                  />
                }
              />
            </Box>

            <Box width="95%" mr="50px"> {/* Set to 100% width */}
              <DatePicker
                selected={selectedToDate}
                onChange={(date) => handleDateChange(date, setSelectedToDate)}
                dateFormat={getDateFormat()}
                showTimeSelect={shouldShowTime()}
                timeFormat="HH:mm"
                timeIntervals={getTimeInterval(timeFrame)}
                timeCaption="Time"
                showYearDropdown
                showMonthDropdown
                scrollableMonthYearDropdown
                minDate={new Date(2016, 0, 1)}
                maxDate={new Date()}
                placeholderText="To Date"
                isClearable
                popperPlacement="left-start"
                customInput={
                  <input
                    style={{
                      width: "100%", // Ensure the input takes the full width
                      fontSize: "16px", // Keep the text size larger
                      padding: "4px 12px", // Adjust padding for better height
                      borderRadius: "5px", // Adjust the border radius if needed
                      border: "2px solid #5f6569", // Customize the border if needed
                      backgroundColor: "#f0f0f0", // Optional background color
                    }}
                  />
                }
              />
            </Box>
            </Box>
            <Button
                onClick={runCode}
                sx={{
                  backgroundColor: '#868dfb',
                  border: "2px solid",
                  borderColor: '#5f6569',
                  color: colors.primary[500],
                  fontSize: "14px",
                  width: "20%",
                  fontWeight: "bold",
                  padding: "10.5px 16px",
                  textAlign: 'center',
                  cursor: 'pointer',
                  transition: '0.3s',
                  '&:hover': {
                    backgroundColor: '#595fba',  // Change background on hover
                    color: colors.primary[100],  // Change text color on hover
                    borderColor: colors.primary[500],  // Change border color on hover
                  },
                }}
              >
                Run
            </Button>
        </Box>
      </Box>
      <Box
        sx={{
          height: '90vh',
          border: theme.palette.mode !== 'dark' ? '1px solid #ccc' : 'none', // Conditional border
          borderRadius: '4px', // Optional rounded corners
        }}
      >
        <iframe
          src={url}
          ref={iframeRef} // Reference to iframe
          style={{ width: '100%', height: '100%', border: 'none' }}
          title="VS Code Server"
        />
      </Box>
    </Box>
  );
};


export default EditorPage;

