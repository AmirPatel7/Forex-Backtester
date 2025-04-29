import React, { useEffect, useState, useRef } from 'react';
import Editor, { useMonaco } from '@monaco-editor/react';
import { Box, useTheme, Button } from "@mui/material";
import { tokens } from "../../theme";
import Header from "../../components/Header";
import { useParams } from 'react-router-dom';

const BasicEditorPage = () => {
  const { '*' : nestedPath } = useParams();
  const fileName = nestedPath || '';
  const theme = useTheme();
  const colors = tokens(theme.palette.mode);
  const editorTheme = theme.palette.mode === 'dark' ? 'vs-dark' : 'light';
  const [code, setCode] = useState('');
  const editorRef = useRef(null);

  useEffect(() => {
    const fetchCode = async () => {
      const response = await fetch(`http://localhost:5000/api/code/${encodeURIComponent(fileName)}`);
      const text = await response.text();
      setCode(text);
    };

    fetchCode();
  }, [fileName]);

  // Function to handle editor changes
  const handleEditorChange = (value, event) => {
    setCode(value);
  };

  // Function to save the current code to the server
  const saveCode = () => {
    try {
      // Prompt the user for the file name, with the default set to fileInfo.fileName
      const defaultFileName = fileName.split('/').pop(); // Use the default file name from the path
      const enteredFileName = window.prompt('Enter file name:', defaultFileName);
  
      // If the user cancels the prompt, do nothing
      if (!enteredFileName) {
        return;
      }
  
      // Create a blob from the code content
      const blob = new Blob([code], { type: 'text/plain' });
      const url = window.URL.createObjectURL(blob);
  
      // Create an invisible download link
      const link = document.createElement('a');
      link.href = url;
      link.download = enteredFileName; // Use the file name from the prompt
  
      // Programmatically click the download link
      document.body.appendChild(link);
      link.click();
  
      // Clean up and remove the link
      link.parentNode.removeChild(link);
  
      alert('File downloaded successfully!');
    } catch (error) {
      console.error('Failed to download the file:', error);
      alert('Download failed!');
    }
  };

  // Extracting the folder name
  const folderName = fileName.split('/')[3]; 

  return (
    <Box m="20px">
      <Box display="flex" justifyContent="space-between" alignItems="center">
        <Header title={`${folderName}`} />
        <Box>
        <Button
            onClick={saveCode}
            sx={{
              backgroundColor: colors.greenAccent[700],
              color: colors.grey[100],
              fontSize: "14px",
              fontWeight: "bold",
              padding: "10px 20px",
            }}
          >
            Save
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
        <Editor
          height="100%"
          defaultLanguage="python"
          defaultValue="// Loading code..."
          value={code}
          theme={editorTheme}
          onChange={handleEditorChange}
          onMount={(editor) => { editorRef.current = editor; }}
        />
      </Box>
    </Box>
  );
};

export default BasicEditorPage;
