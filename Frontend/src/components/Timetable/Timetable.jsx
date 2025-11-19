// Frontend/src/components/Timetable/Timetable.jsx
import React from "react";
import { Box, Button } from "@mui/material";
import { useNavigate } from "react-router-dom";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import DownloadIcon from "@mui/icons-material/Download";

const Timetable = () => {
  const navigate = useNavigate();
  const pdfPath = "/master-timetable-2024-25-sem2.pdf"; // located in public/

  return (
    <Box
      sx={{
        height: "100vh",
        display: "flex",
        flexDirection: "column",
        backgroundColor: "#fff",
      }}
    >
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          p: 2,
          backgroundColor: "#f5f5f5",
          borderBottom: "1px solid #ddd",
        }}
      >
        <Button
          startIcon={<ArrowBackIcon />}
          onClick={() => navigate("/dashboard")}
          color="primary"
          variant="outlined"
        >
          Back
        </Button>

        <Button
          href={encodeURI(pdfPath)}
          download="master-timetable-2024-25-sem2.pdf"
          startIcon={<DownloadIcon />}
          variant="contained"
          color="primary"
        >
          Download Timetable
        </Button>
      </Box>

      <Box sx={{ flex: 1 }}>
        <iframe
          src={encodeURI(pdfPath)}
          title="Timetable"
          width="100%"
          height="100%"
          style={{ border: "none" }}
        />
      </Box>
    </Box>
  );
};

export default Timetable;
