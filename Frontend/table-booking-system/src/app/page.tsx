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
  });

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Container sx={{ mt: 4 }}>
        <Grid container spacing={4}>
          <Grid item xs={12}>
            <Link href="/bookings" passHref>
              <Button variant="contained" color="primary" fullWidth>
                Book a Table
              </Button>
            </Link>
          </Grid>
          <Grid item xs={12}>
            <Link href="/availability" passHref>
              <Button variant="contained" color="secondary" fullWidth>
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