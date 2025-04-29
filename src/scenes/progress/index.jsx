
import React, { useEffect, useState, useRef } from 'react';
import { useParams, useLocation } from 'react-router-dom';
import { Box } from '@mui/material';
import { tokens } from '../../theme';
import { useTheme } from '@mui/material/styles';
import { Editor } from '@monaco-editor/react';
import Header from "../../components/Header";

const ProgressPage = () => {
  const { taskId } = useParams();
  const { state } = useLocation();
  const theme = useTheme();
  const [log, setLog] = useState('');
  const eventSourceRef = useRef(null); // Reference to store EventSource instance
  const isFirstUpdate = useRef(true); // Track initial render

  useEffect(() => {
    eventSourceRef.current = new EventSource(`http://localhost:5000/api/updates/${taskId}`);

    eventSourceRef.current.onmessage = (event) => {
      setLog((prevLog) => prevLog + `${event.data}\n`);
    };

    eventSourceRef.current.onerror = (err) => {
      console.error('EventSource failed:', err);
      eventSourceRef.current.close();
    };

    return () => {
      eventSourceRef.current.close();
    };
  }, [taskId]);
  
  return (
    <Box m="20px">
      <Box display="flex" justifyContent="space-between" alignItems="center">
        <Header title={`${state.strategyName}`} />
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
            defaultLanguage="plaintext"
            theme={theme.palette.mode === 'dark' ? 'vs-dark' : 'light'}
            value={log}
            options={{ readOnly: true }}
        />
      </Box>
    </Box>
  );
}

export default ProgressPage;