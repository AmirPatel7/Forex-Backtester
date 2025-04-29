import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';
import MonacoEditor, { useMonaco } from '@monaco-editor/react';
import { Box, Typography, Grid } from '@mui/material';
import ReactDiffViewer from 'react-diff-viewer';

const Compare = () => {
  const { folder1, folder2 } = useParams();
  const [pythonFiles, setPythonFiles] = useState({ file1: '', file2: '' });

  useEffect(() => {
    const fetchPythonFiles = async () => {
      try {
        const metadata1 = await axios.get(`http://localhost:5000/api/folders/${folder1}/metadata.json`);
        const metadata2 = await axios.get(`http://localhost:5000/api/folders/${folder2}/metadata.json`);

        const backtestFileName1 = metadata1.data.backtest_fileName;
        const backtestFileName2 = metadata2.data.backtest_fileName;

        const pythonFile1 = await axios.get(`http://localhost:5000/api/code/public/Archive/${encodeURIComponent(folder1)}/${encodeURIComponent(backtestFileName1)}`);
        const pythonFile2 = await axios.get(`http://localhost:5000/api/code/public/Archive/${encodeURIComponent(folder2)}/${encodeURIComponent(backtestFileName2)}`);

        setPythonFiles({ file1: pythonFile1.data, file2: pythonFile2.data });

      } catch (error) {
        console.error('Error fetching Python files:', error);
      }
    };
    if (folder1 && folder2) {
      fetchPythonFiles();
    }
  }, [folder1, folder2]);

  return (
    <Box>
      <Grid container spacing={4}>
        <Grid item xs={6}>
          <Typography variant="h4" style={{paddingBottom:'20px', paddingTop:'20px', textAlign: 'center'}}>File 1 (Folder: {decodeURIComponent(folder1)})</Typography>
          <MonacoEditor
            width="100%"
            height="85vh"
            language="python"
            theme="vs-dark"
            value={pythonFiles.file1}
            options={{ readOnly: true }}
          />
        </Grid>
        <Grid item xs={6}>
          <Typography variant="h4" style={{paddingBottom:'20px', paddingTop:'20px', textAlign: 'center'}}>File 2 (Folder: {decodeURIComponent(folder2)})</Typography>
          <MonacoEditor
            width="100%"
            height="85vh"
            language="python"
            theme="vs-dark"
            value={pythonFiles.file2}
            options={{ readOnly: true }}
          />
        </Grid>
        <Grid item xs={12}>
          <Typography variant="h2" style={{ paddingBottom: '20px', textAlign: 'center' }}>Differences</Typography>
          {pythonFiles.file1 && pythonFiles.file2 && (
            <ReactDiffViewer
              oldValue={pythonFiles.file1}
              newValue={pythonFiles.file2}
              splitView={true}
            />
          )}
        </Grid>
      </Grid>
    </Box>
  );
};

export default Compare;