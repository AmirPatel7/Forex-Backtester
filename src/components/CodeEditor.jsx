import React, { useEffect, useState } from 'react';
import Editor from '@monaco-editor/react';

/**
 * CodeEditor component for displaying and editing code files.
 *
 * @param {Object} props - The props for the component.
 * @param {string} props.filePath - The path to the code file to be fetched and displayed.
 * @returns {JSX.Element} The rendered code editor component.
 */
const CodeEditor = ({ filePath }) => {
  const theme = useTheme();
  const colors = tokens(theme.palette.mode);
  const [code, setCode] = useState('');

  useEffect(() => {
    const fetchCode = async () => {
      const response = await fetch(`http://localhost:5000/api/files/code/${encodeURIComponent(filePath)}`);
      const text = await response.text();
      setCode(text);
    };

    fetchCode();
  }, [filePath]);

  return (
    <Editor
      height="90vh"
      defaultLanguage="python"
      defaultValue="// Loading code..."
      value={code}
      theme="vs-dark"
    />
  );
};

export default CodeEditor;
