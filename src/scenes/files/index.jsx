import React, { useState, useEffect } from 'react';
import { Box, useTheme } from "@mui/material";
import { DataGrid } from "@mui/x-data-grid";
import { tokens } from "../../theme";
import Header from "../../components/Header";
import { Link as RouterLink, useParams, useNavigate } from 'react-router-dom';

/**
 * Files component for displaying a list of files and folders in a directory.
 *
 * @returns {JSX.Element} The rendered files component.
 */
const Files = () => {
  const { '*' : nestedPath } = useParams();
  const folderPath = nestedPath || '';
  const theme = useTheme();
  const navigate = useNavigate();
  const colors = tokens(theme.palette.mode);
  const columns = [
    { field: "id", headerName: "ID" },
    {
      field: "name",
      headerName: "Name",
      flex: 1,
      renderCell: (params) => (
        params.row.type === 'folder' ? (
          <RouterLink
            to={`/files/${folderPath ? `${folderPath}/` : ''}${encodeURIComponent(params.value)}`}
            style={{ color: colors.greenAccent[300] }}
          >
            {params.value}
          </RouterLink>
        ) : (
          <span onClick={() => navigate(`/editor/${folderPath ? `${folderPath}/` : ''}${encodeURIComponent(params.value)}`)} style={{ color: colors.greenAccent[300], cursor: 'pointer' }}>
            {params.value}
          </span>
        )
      ),
    },
    { field: "type", headerName: "Type", flex: 1 },
    { field: "size", headerName: "Size", flex: 1 },
    { field: "modified", headerName: "Last Modified", flex: 1 },
  ];
  const [data, setData] = useState([]);

  useEffect(() => {
    console.log("Folder Path: ", folderPath); // Debug: Log current folder path
    const fetchData = async () => {
      try {
        const url = `http://localhost:5000/api/files/${folderPath}`;
        console.log("Fetching data from: ", url); // Debug: Log the URL being fetched
        const response = await fetch(url);
        const result = await response.json();
        setData(result);
      } catch (error) {
        console.error('Error fetching files:', error);
      }
    };
  
    fetchData();
  }, [folderPath]);

  return (
    <Box m="20px">
      <Header title="FILES" subtitle="List of Python Files" />
      <Box
        m="40px 0 0 0"
        height="75vh"
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
        <DataGrid checkboxSelection rows={data} columns={columns} />
      </Box>
    </Box>
  );
};

export default Files;
