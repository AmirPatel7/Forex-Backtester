import { useState, useEffect } from "react";
import { ProSidebar, Menu, MenuItem } from "react-pro-sidebar";
import { Box, IconButton, Typography, useTheme } from "@mui/material";
import { Link } from "react-router-dom";
import "react-pro-sidebar/dist/css/styles.css";
import { tokens } from "../../theme";
import HomeOutlinedIcon from "@mui/icons-material/HomeOutlined";
import MenuOutlinedIcon from "@mui/icons-material/MenuOutlined";
import InsertDriveFileIcon from '@mui/icons-material/InsertDriveFile';
import BarChartOutlinedIcon from "@mui/icons-material/BarChartOutlined";
import SsidChartIcon from '@mui/icons-material/SsidChart';

/**
 * Item component for rendering a single navigation item in the sidebar.
 *
 * @param {Object} props - The properties passed to the component.
 * @param {string} props.title - The title of the menu item.
 * @param {string} props.to - The route path the item links to.
 * @param {React.ReactNode} props.icon - The icon to display alongside the title.
 * @param {string} props.selected - The currently selected menu item.
 * @param {function} props.setSelected - Function to set the selected menu item.
 *
 * @returns {JSX.Element} The rendered menu item component.
 */
const Item = ({ title, to, icon, selected, setSelected }) => {
  const theme = useTheme();
  const colors = tokens(theme.palette.mode);
  return (
    <MenuItem
      active={selected === title}
      style={{
        color: colors.grey[100],
      }}
      onClick={() => setSelected(title)}
      icon={icon}
    >
      <Typography>{title}</Typography>
      <Link to={to} />
    </MenuItem>
  );
};


/**
 * Sidebar component for navigation within the application.
 *
 * @returns {JSX.Element} The rendered sidebar component.
 */
const Sidebar = () => {
  const theme = useTheme();
  const colors = tokens(theme.palette.mode);
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [selected, setSelected] = useState("Dashboard");
  const [metadata, setMetadata] = useState([]);
  const [folders, setFolders] = useState([]);

  useEffect(() => {
    const fetchFolders = async () => {
      try {
        const response = await fetch(`http://localhost:5000/api/folders/`);
        const result = await response.json();

        // Separate the metadata and folder names
        const formattedMetadata = result.map(folder => ({
          name: folder.name,
          folderName: folder.folderName,
          assetName: folder.assetName,
          startDate: folder.startDate,
          endDate: folder.endDate,
          interval: folder.interval,
          backtest_fileName: folder.backtest_fileName,
          dateCreated: folder.dateCreated,
        }));

        // Create a list of just folder names
        const folderNames = result.map(folder => folder.folderName);

        // Set both metadata and folder names
        setMetadata(formattedMetadata);
        setFolders(folderNames);

      } catch (error) {
        console.error('Error fetching folders:', error);
      }
    };
    
    fetchFolders();
  }, []);

  return (
    <Box
      sx={{
        "& .pro-sidebar-inner": {
          background: `${colors.primary[400]} !important`,
        },
        "& .pro-icon-wrapper": {
          backgroundColor: "transparent !important",
        },
        "& .pro-inner-item": {
          padding: "5px 35px 5px 20px !important",
        },
        "& .pro-inner-item:hover": {
          color: "#868dfb !important",
        },
        "& .pro-menu-item.active": {
          color: "#6870fa !important",
        },
      }}
    >
      <ProSidebar collapsed={isCollapsed}>
        <Menu iconShape="square">
          {/* LOGO AND MENU ICON */}
          <MenuItem
            onClick={() => setIsCollapsed(!isCollapsed)}
            icon={isCollapsed ? <MenuOutlinedIcon /> : undefined}
            style={{
              margin: "10px 0 20px 0",
              color: colors.grey[100],
            }}
          >
            {!isCollapsed && (
              <Box
                display="flex"
                justifyContent="space-between"
                alignItems="center"
                ml="15px"
              >
                <IconButton onClick={() => setIsCollapsed(!isCollapsed)}>
                  <MenuOutlinedIcon />
                </IconButton>
              </Box>
            )}
          </MenuItem>

          {!isCollapsed && (
            <Box mb="25px">
              <Box display="flex" justifyContent="center" alignItems="center">
                <img
                  alt="profile-user"
                  width="100px"
                  height="100px"
                  src={`../../assets/spacial edge icon.jpg`}
                  style={{ cursor: "pointer", borderRadius: "50%" }}
                />
              </Box>
            </Box>
          )}

          <Box paddingLeft={isCollapsed ? undefined : "10%"}>
            <Item
              title="Dashboard"
              to="/dashboard"
              icon={<HomeOutlinedIcon />}
              selected={selected}
              setSelected={setSelected}
            />

            <Typography
              variant="h6"
              color={colors.grey[300]}
              sx={{ m: "15px 0 5px 20px" }}
            >
              Data
            </Typography>
            <Item
              title="Editor"
              to="/editor"
              icon={<InsertDriveFileIcon />}
              selected={selected}
              setSelected={setSelected}
            />

            <Item
              title="Metrics"
              to="/metrics"
              icon={<BarChartOutlinedIcon />}
              selected={selected}
              setSelected={setSelected}
            />

            <Item
              title="Anomalies"
              to="/anomalyPage"
              icon={<SsidChartIcon />}
              selected={selected}
              setSelected={setSelected}
            />  
            
            {/* Render folder links dynamically */}
            <Typography
              variant="h6"
              color={colors.grey[300]}
              sx={{ m: "15px 0 5px 20px" }}
            >
              Metrics
            </Typography>
            {metadata.map((metadata) => (
              <Item
                key={metadata.name}
                title={metadata.name}
                to={`/metrics/${metadata.folderName}`}
                icon={<InsertDriveFileIcon />}
                selected={selected}
                setSelected={setSelected}
              />
            ))}
          </Box>
        </Menu>
      </ProSidebar>
    </Box>
  );
};

export default Sidebar;
