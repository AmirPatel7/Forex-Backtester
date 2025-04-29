import { useState } from "react";
import { Routes, Route } from "react-router-dom";
import Sidebar from "./scenes/global/Sidebar";
import Dashboard from "./scenes/dashboard";
import Files from "./scenes/files";
import Metrics from "./scenes/metricsPage";
import Folders from "./scenes/metrics";
import EditorPage from "./scenes/editor";
import ProgressPage from "./scenes/progress"
import Footer from "./components/Footer"; // Import the Footer component
import Anomaly from "./scenes/anomalyPage";
import { CssBaseline, ThemeProvider } from "@mui/material";
import { ColorModeContext, useMode } from "./theme";
import BasicEditorPage from "./scenes/basicEditor";
import Compare from './scenes/Compare';

/**
 * Main application component that sets up the theme, layout, and routing.
 *
 * @returns {JSX.Element} The rendered app component.
 */
function App() {
  const [theme, colorMode] = useMode();
  const [isSidebar, setIsSidebar] = useState(true);

  return (
    <ColorModeContext.Provider value={colorMode}>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <div className="app">
          <Sidebar isSidebar={isSidebar} />
          <main className="content">
            <Routes>
              <Route path="/" element={<Dashboard />} />
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/files/*" element={<Files />} />
              <Route path="/metrics" element={<Folders />} />
              <Route path="/editor" element={<EditorPage />} />
              <Route path="/progress/:taskId" element={<ProgressPage />} />
              <Route path="/metrics/:fileName" element={<Metrics />} />
              <Route path="/basicEditor/*" element={<BasicEditorPage />} />
              <Route path="/compare/:folder1/:folder2" element={<Compare />} />
              <Route path="/anomalyPage" element={<Anomaly/>} />
            </Routes>
            <Footer />
          </main>
        </div>
      </ThemeProvider>
    </ColorModeContext.Provider>
  );
}

export default App;
