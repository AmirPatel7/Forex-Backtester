import React, { useState, useEffect } from 'react';
import { Box, useTheme, Button } from "@mui/material";
import { DataGrid } from "@mui/x-data-grid";
import { tokens } from "../../theme";
import Header from "../../components/Header";
import { Link as RouterLink, useParams, useNavigate } from 'react-router-dom';

/**
 * Folders component for displaying the list of metrics from previously run backtests. 
 * Clicking on the name of one of the backtests routes you to the metrics page. 
 *
 * @returns {JSX.Element} The rendered folders component.
 */
const Folders = () => {
  const { '*' : nestedPath } = useParams();
  const folderPath = nestedPath || '';
  const theme = useTheme();
  const navigate = useNavigate();
  const colors = tokens(theme.palette.mode);
  const [selectedFiles, setSelectedFiles] = useState([]);
  const columns = [
    { field: "id", headerName: "ID" },
    {
      field: "name",
      headerName: "Name",
      flex: 1,
      renderCell: (params) => (
        (
          <span 
            onClick={() => navigate(`/metrics/${encodeURIComponent(params.row.folderName)}`)}  // Navigate to metrics page
            style={{ color: colors.greenAccent[300], cursor: 'pointer' }}
          >
            {params.value}
          </span>
        )
      )
    },
    { field: "assetName", headerName: "Asset Name" },          // New field for asset name
    { field: "startDate", headerName: "Start Date" },          // New field for start date
    { field: "endDate", headerName: "End Date" },              // New field for end date
    { field: "interval", headerName: "Interval" },             // New field for interval
    { field: "backtest_fileName", headerName: "Backtest File" }, // New field for backtest file
    { field: "dateCreated", headerName: "Date Created" },      // New field for date created
  ];

  const [data, setData] = useState([]);

  useEffect(() => {
    // Fetch folder data when the folderPath changes
    const fetchData = async () => {
      try {
        const url = `http://localhost:5000/api/folders/${folderPath}`;
        const response = await fetch(url);
        const result = await response.json();
        const formattedData = result.map((folder, index) => ({
          id: index,
          name: folder.name,
          folderName: folder.folderName,             
          assetName: folder.assetName,               
          startDate: folder.startDate,               
          endDate: folder.endDate,                   
          interval: folder.interval,                     
          backtest_fileName: folder.backtest_fileName,  
          dateCreated: folder.dateCreated
        }));
        setData(formattedData);
      } catch (error) {
        console.error('Error fetching folders:', error);
      }
    };
  
    fetchData();
  }, [folderPath]);

  const handleSelectionChange = (newSelection) => {
    setSelectedFiles(newSelection);
  };

  const chooseFilesForComparing = () => {
    if (selectedFiles.length !== 2) {
      alert('Please select exactly two files to compare.');
    } else {
      const [file1, file2] = selectedFiles;
      const file1FolderName = encodeURIComponent(data.find((item) => item.id === file1)?.folderName || '');
      const file2FolderName = encodeURIComponent(data.find((item) => item.id === file2)?.folderName || '');
      console.log(file1FolderName);
      console.log(file2FolderName);
      
      if (file1FolderName && file2FolderName) {
        navigate(`/compare/${file1FolderName}/${file2FolderName}`);
      } else {
        alert('Error: Unable to retrieve folder names for selected files.');
      }
    }
  };

  return (
    <Box m="20px">
      <div 
      style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
      }}
      >
        <Header title="FILES" subtitle="List of Folders" />
        <Button
          onClick={chooseFilesForComparing}
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
          Compare versions
        </Button>
      </div>
      <Box
        m="20px 0 0 0"
        height="80vh"
        sx={{
          "& .MuiDataGrid-root": {
            border: "none",
          },
          "& .MuiDataGrid-cell": {
            borderBottom: "none",
          },
          "& .name-column--cell": {
            color: colors.greenAccent[300],
          },
          "& .MuiDataGrid-columnHeaders": {
            backgroundColor: colors.blueAccent[700],
            borderBottom: "none",
          },
          "& .MuiDataGrid-virtualScroller": {
            backgroundColor: colors.primary[400],
          },
          "& .MuiDataGrid-footerContainer": {
            borderTop: "none",
            backgroundColor: colors.blueAccent[700],
          },
          "& .MuiCheckbox-root": {
            color: `${colors.greenAccent[200]} !important`,
          },
        }}
      >
        <DataGrid checkboxSelection rows={data} columns={columns} onSelectionModelChange={(newSelection) => handleSelectionChange(newSelection)}/>
      </Box>
    </Box>
  );
};

export default Folders;
