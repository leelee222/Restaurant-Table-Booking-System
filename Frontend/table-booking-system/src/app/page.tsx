"use client";

import React, { useState, useEffect } from "react";
import { createTheme, ThemeProvider, CssBaseline, Container, Grid, Button } from "@mui/material";
import Link from "next/link";

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
    typography: {
      fontFamily: 'Lexend, Arial, sans-serif',
    },
  });

  return (
    <ThemeProvider theme={theme}>
      <style>
          {`
            @font-face {
              font-family: 'Lexend';
              src: url('/fonts/Lexend-Regular.ttf') format('truetype');
              font-weight: 400;
              font-style: normal;
            }
          `}
        </style>
      <CssBaseline />
      <Container sx={{ mt: 4, fontFamily: 'Lexend' }}>
        <Grid container spacing={2} justifyContent="center" alignItems="center" style={{ height: '100vh' }}>
          <Grid item xs={6} sm={6} md={4}>
            <Link href="/bookings" passHref>
              <Button variant="contained" color="primary" fullWidth sx={{ height: 100 }}>
                Book a Table
              </Button>
            </Link>
          </Grid>
          <Grid item xs={6} sm={6} md={4}>
            <Link href="/availability" passHref>
              <Button variant="contained" color="secondary" fullWidth sx={{ height: 100 }}>
                Check Availability
              </Button>
            </Link>
          </Grid>
        </Grid>
      </Container>
    </ThemeProvider>
  );
};

export default App;