"use client";

import React, { useState, useEffect } from "react";
import { createTheme, ThemeProvider, CssBaseline } from "@mui/material";
import BookingForm from "./components/BookingForm";
import AvailabilityDisplay from "./components/AvailabilityDisplay";
import { Container, Grid } from "@mui/material";

const App: React.FC = () => {
  const [mode, setMode] = useState<"light" | "dark">("light");

  useEffect(() => {
    const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");
    setMode(mediaQuery.matches ? "dark" : "light");
    const handleChange = (event: MediaQueryListEvent) => {
      setMode(event.matches ? "dark" : "light");
    };
    mediaQuery.addEventListener("change", handleChange);
    return () => mediaQuery.removeEventListener("change", handleChange);
  }, []);

  const theme = createTheme({
    palette: {
      mode,
    },
  });
  
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Container sx={{ mt: 4 }}>
        <Grid container spacing={4}>
          <Grid item xs={12} md={6}>
            <BookingForm />
          </Grid>
          {/* Uncomment when needed */}
          <Grid item xs={12} md={6}>
            <AvailabilityDisplay />
          </Grid>
        </Grid>
      </Container>
    </ThemeProvider>
  );
};

export default App;
