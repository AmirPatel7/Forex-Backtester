/**
 * Express.js Server for Running Python Scripts and Managing Files
 * 
 * This server provides a RESTful API to execute Python backtests, manage script files,
 * and retrieve folder contents. It supports creating a directory structure for archiving 
 * results and handles file operations such as reading and writing Python scripts.
 *
 * @module Server
 * @requires express
 * @requires fs
 * @requires path
 * @requires cors
 * @requires child_process
 */

const express = require('express');
const fs = require('fs');
const path = require('path');
const cors = require('cors');
const app = express();
const { spawn } = require('child_process');
const PORT = process.env.PORT || 5000;
const { v4: uuidv4 } = require('uuid');

app.use(cors());
app.use(express.json());

const tasks = {}; // Store task updates per identifier
// Function to delete a folder if it exists
function deleteFolderIfExists(folderPath) {
  if (fs.existsSync(folderPath)) {
    fs.rmdirSync(folderPath, { recursive: true });
    console.log(`Deleted folder: ${folderPath}`);
  }
}

app.get('/api/updates/:id', (req, res) => {
  const taskId = req.params.id;

  // Set headers for SSE
  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');

  // Function to send progress
  const sendProgress = (data) => {
    console.log(`Sending progress for task ${taskId}: ${data}`);
    res.write(`data: ${data}\n\n`);
  };

  // Send stored messages if any exist (useful if the client reconnects)
  if (tasks[taskId]) {
    tasks[taskId].forEach((message) => sendProgress(message));
  } else {
    tasks[taskId] = [];
  }

  req.on('close', () => {
    res.end();
  });
});

app.post('/api/run', async (req, res) => {
  const { name, assetName, startDate, endDate, interval, backtest_fileName } = req.body;
  const taskId = uuidv4(); // Generate a unique task ID
  tasks[taskId] = []; // Initialize the task log

  res.json({ taskId }); // Send the unique identifier to the client

  const currentDate = new Date().toISOString().replace(/T/, '_').replace(/\..+/, '').replace(/:/g, '-');
  const folderName = `${backtest_fileName.replace('.py', '')}_${assetName}_${startDate}_to_${endDate}_${interval}_${currentDate}`;
  const folderPath = path.join(__dirname, `../public/Archive/${folderName}`);

  // Define the paths to the Python interpreter and the Python script
  const pythonPath = path.join(__dirname, '../python-scripts/venv/bin/python');
  const import_data_path = path.join(__dirname, `../python-scripts/Import_data.py`);
  const scriptPath = path.join(__dirname, `../python-scripts/${backtest_fileName}`);

  // Construct the command to run the Python script with the arguments
  const importDataCommand = [import_data_path, assetName, startDate, endDate, interval, backtest_fileName, folderPath];

  const backtestCommand = [scriptPath, folderPath];

  // Run the Import_data.py script using spawn
  const importDataProcess = spawn(pythonPath, importDataCommand);

  const sendTaskUpdate = (message) => {
    console.log(`Task ${taskId} update: ${message}`); 
    if (tasks[taskId]) {
      tasks[taskId].push(message);
    }
  };
  sendTaskUpdate("Importing Data...");

  importDataProcess.stdout.on('data', (data) => {
    const message = `${data.toString()}`;
    console.log(`${message}`);  // Debug: log stdout from Import_data.py
    sendTaskUpdate(message);
  });

  importDataProcess.stderr.on('data', (data) => {
    const message = `${data.toString()}`;
    console.error(`${message}`);  // Debug: log stderr from Import_data.py
    sendTaskUpdate(message);
  });

  importDataProcess.on('close', (code) => {
    sendTaskUpdate("Imported Data Successfully, now running Backtester...");
    console.log(`Import_data.py process closed with code: ${code}`);  // Debug: log when Import_data.py closes
    if (code !== 0) {
      deleteFolderIfExists(folderPath)
      const message = `error: Error running Import_data.py with exit code ${code}`;
      console.error(message);  // Debug: log error exit code
      sendTaskUpdate(message);
      return;
    }

    // Now run the backtest script
    const backtestProcess = spawn(pythonPath, backtestCommand);

    backtestProcess.stdout.on('data', (data) => {
      const message = `${data.toString()}`;
      sendTaskUpdate(message);
    });

    backtestProcess.stderr.on('data', (data) => {
      const message = `${data.toString()}`;
      sendTaskUpdate(message);
    });

    backtestProcess.on('close', (code) => {
      if (code !== 0) {
        deleteFolderIfExists(folderPath)
        const message = `error: Error running ${backtest_fileName} with exit code ${code}`;
        sendTaskUpdate(message);
        return;
      }

      // Create a JSON file in the folder with the input data
      const jsonFilePath = path.join(folderPath.replaceAll('\\', ''), 'metadata.json');
      const metadata = { name, assetName, startDate, endDate, interval, backtest_fileName };

      fs.writeFileSync(jsonFilePath, JSON.stringify(metadata, null, 2), 'utf8');
      console.log(`Successfully created metadata.json in ${folderPath}`);

      // Copy the backtest_fileName to folderName on success
      const destination = path.join(folderPath.replaceAll('\\', ''), backtest_fileName); // Get full destination path
      fs.copyFile(scriptPath.replaceAll('\\', ''), destination, (err) => {
        if (err) {
          const message = `Error Occurred`;
          sendTaskUpdate(message);
          return;
        }
        sendTaskUpdate('Run successful!');
      });
    });
  });
});

app.get('/api/folderPath', (req, res) => {
  const basePath = path.join(__dirname, '../python-scripts');
  const folderPath = req.query.path ? path.join(basePath, req.query.path) : basePath;

  if (!fs.existsSync(folderPath)) {
    console.log(`Folder not found: ${folderPath}`);
    return res.status(404).json({ error: "Folder not found" });
  }

  res.send(folderPath);
});

app.get('/api/files/', (req, res) => {
  const basePath = path.join(__dirname, '../python-scripts');
  const folderPath = req.query.path ? path.join(basePath, req.query.path) : basePath;

  if (!fs.existsSync(folderPath)) {
    console.log(`Folder not found: ${folderPath}`);
    return res.status(404).json({ error: "Folder not found" });
  }

  const allEntries = fs.readdirSync(folderPath, { withFileTypes: true });

  const entriesList = allEntries.map((entry, index) => {
    const entryPath = path.join(folderPath, entry.name);
    const stats = fs.statSync(entryPath);

    return {
      id: index + 1,
      name: entry.name,
      type: entry.isDirectory() ? 'folder' : 'file',
      size: entry.isDirectory() ? countItemsInDirectory(entryPath) : `${stats.size} bytes`,
      modified: new Date(stats.mtime).toLocaleTimeString()
    };
  });

  res.json(entriesList);
});

app.get('/api/pythonFiles', (req, res) => {
  const basePath = path.join(__dirname, '../python-scripts');
  const folderPath = req.query.path ? path.join(basePath, req.query.path) : basePath;

  if (!fs.existsSync(folderPath)) {
    console.log(`Folder not found: ${folderPath}`);
    return res.status(404).json({ error: "Folder not found" });
  }

  // Recursive function to find all .py files and return their relative paths
  const findPythonFiles = (dir, currentPath = '') => {
    let pyFiles = [];
    const allEntries = fs.readdirSync(dir, { withFileTypes: true });

    allEntries.forEach((entry) => {
      const entryPath = path.join(dir, entry.name);
      const relativePath = path.join(currentPath, entry.name); // Relative path including folder structure

      if (entry.isDirectory()) {
        // Recursively search for .py files in subdirectories
        if (entry.name !== 'venv' && entry.name !== 'forex_analysis') {
          // Recursively search for .py files in subdirectories
          pyFiles = pyFiles.concat(findPythonFiles(entryPath, relativePath));
        }
      } else if (entry.isFile() && path.extname(entry.name) === '.py') {
        // Add the .py file to the list with its relative path
        if (relativePath != 'Import_data.py' && relativePath != 'save_backtest.py') {
          pyFiles.push(relativePath);
        }
      }
    });

    return pyFiles;
  };
  // Start searching for .py files in the folderPath
  const pythonFiles = findPythonFiles(folderPath);

  // Send the list of .py files in the response
  res.json(pythonFiles);
});

app.get('/api/files/:path*', (req, res) => {  // Use wildcard to capture everything after /api/files/

  // Construct the directory path based on the optional parameter
  const basePath = path.join(__dirname, '../python-scripts');
  // Combine and decode the path parameters
  const requestPath = [req.params.path || '', req.params[0] || ''].join('/');
  const decodedPath = decodeURIComponent(requestPath);
  const folderPath = path.join(basePath, decodedPath);

  if (!fs.existsSync(folderPath)) {
    console.log(`Folder not found: ${folderPath}`);  // Debug: Log if folder not found
    return res.status(404).json({ error: "Folder not found" });
  }

  const allEntries = fs.readdirSync(folderPath, { withFileTypes: true });

  const entriesList = allEntries.map((entry, index) => {
    const entryPath = path.join(folderPath, entry.name);
    const stats = fs.statSync(entryPath);

    return {
      id: index + 1,
      name: entry.name,
      type: entry.isDirectory() ? 'folder' : 'file',
      size: entry.isDirectory() ? countItemsInDirectory(entryPath) : `${stats.size} bytes`,
      modified: new Date(stats.mtime).toLocaleTimeString()
    };
  });

  res.json(entriesList);
});

app.get('/api/code/:filePath', (req, res) => {

  // Construct the full path to the file
  const fileContentPath = path.join(__dirname, '../', req.params.filePath);

  if (fs.existsSync(fileContentPath) && !fs.statSync(fileContentPath).isDirectory()) {
    const content = fs.readFileSync(fileContentPath, 'utf8');

    res.send(content);
  } else {
    // Debug: Log the failure to find the file or if it's a directory
    console.log(`File not found or is a directory: ${fileContentPath}`);

    res.status(404).send('File not found');
  }
});

app.post('/api/code/:filePath', (req, res) => {
  const filePath = path.join(__dirname, '../', decodeURIComponent(req.params.filePath));

  if (fs.existsSync(filePath) && !fs.statSync(filePath).isDirectory()) {
    fs.writeFile(filePath, req.body.code, 'utf8', (err) => {
      if (err) {
        console.error('Error writing file:', err);
        return res.status(500).json({ error: 'Failed to write to file' });
      }
      res.json({ message: 'File updated successfully' });
    });
  } else {
    res.status(404).json({ error: 'File not found or is a directory' });
  }
});

function countItemsInDirectory(directory) {
  const length = fs.readdirSync(directory).length;
  if (length == 1) {
    return `${length} item`
  } else {
    return `${length} items`
  }
}

// Helper function to get folders
const getTopLevelFoldersInArchive = (archivePath) => {
  try {
    if (!fs.existsSync(archivePath)) {
      console.error(`Archive path does not exist: ${archivePath}`);
      throw new Error('Archive path not found');
    }

    return fs.readdirSync(archivePath).filter(file =>
      fs.statSync(path.join(archivePath, file)).isDirectory()
    );
  } catch (error) {
    console.error('Error reading archive folder:', error.message);
    throw error;
  }
};

// API to get folders
// Helper function to get top-level folders and their metadata
function getFoldersWithMetadata(folderPath) {
  let results = [];
  const allEntries = fs.readdirSync(folderPath, { withFileTypes: true });

  allEntries.forEach(entry => {
    if (entry.isDirectory()) {
      const folderName = entry.name;
      const entryPath = path.join(folderPath, folderName);

      // Look for metadata.json in the folder
      const metadataPath = path.join(entryPath, 'metadata.json');
      if (fs.existsSync(metadataPath)) {
        try {
          const metadata = JSON.parse(fs.readFileSync(metadataPath, 'utf-8'));
          const stats = fs.statSync(metadataPath);

          results.push({
            name: metadata.name,
            folderName: folderName,
            assetName: metadata.assetName,
            startDate: metadata.startDate,
            endDate: metadata.endDate,
            interval: metadata.interval,
            backtest_fileName: metadata.backtest_fileName,
            dateCreated: new Date(stats.birthtime).toISOString(),
          });
        } catch (error) {
          console.error(`Error reading or parsing metadata.json in ${metadataPath}:`, error);
        }
      } else {
        // If no metadata.json, just return folder name
        results.push({
          folderName: folderName,
          metadata: null, // Indicate that there's no metadata file
        });
      }
    }
  });

  return results;
}

// API to get folders and metadata
app.get('/api/folders/:folderPath?', (req, res) => {
  const folderPath = req.params.folderPath ? decodeURIComponent(req.params.folderPath) : '';
  const archivePath = path.join(__dirname, '../public/Archive', folderPath);

  try {
    if (!fs.existsSync(archivePath)) {
      return res.status(404).json({ error: "Archive path not found" });
    }

    if (fs.statSync(archivePath).isFile()) {
      const fileContent = fs.readFileSync(archivePath, 'utf-8');
      return res.json(JSON.parse(fileContent));
    }

    const foldersWithMetadata = getFoldersWithMetadata(archivePath);

    if (foldersWithMetadata && Array.isArray(foldersWithMetadata)) {
      res.json(foldersWithMetadata);
    } else {
      console.error('No folders found or invalid response:', foldersWithMetadata);
      res.status(500).json({ error: "No folders found or invalid response" });
    }
  } catch (error) {
    console.error('Error fetching folders and metadata:', error.message);
    res.status(500).json({ error: "Could not retrieve folders and metadata" });
  }
});

app.get('/api/folders/:folderPath?/metadata.json', (req, res) => {
  const folderPath = req.params.folderPath;
  console.log(folderPath);
  const metadataPath = path.join(__dirname, '../public/Archive', folderPath, 'metadata.json');

  try {
    if (fs.existsSync(metadataPath)) {
      const metadata = JSON.parse(fs.readFileSync(metadataPath, 'utf-8'));
      res.json(metadata);
    } else {
      console.log("this is the error message")
      res.status(404).json({ error: "Metadata file not found" });
    }
  } catch (error) {
    console.error('Error reading metadata:', error);
    res.status(500).json({ error: "Could not retrieve metadata" });
  }
});

app.get('/api/code/public/Archive/:folderPath/:fileName', (req, res) => {
  const folderPath = decodeURIComponent(req.params.folderPath);
  const fileName = decodeURIComponent(req.params.fileName);
  const filePath = path.join(__dirname, '../public/Archive', folderPath, fileName);

  try {
    if (fs.existsSync(filePath)) {
      const fileContent = fs.readFileSync(filePath, 'utf-8');
      res.send(fileContent);
    } else {
      res.status(404).json({ error: "File not found" });
    }
  } catch (error) {
    console.error('Error reading file:', error);
    res.status(500).json({ error: "Could not retrieve file" });
  }
});


app.listen(PORT, () => console.log(`Server running on port ${PORT}`));




