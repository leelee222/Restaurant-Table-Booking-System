"use client";

import React from "react";
import { Container, Grid } from "@mui/material";
import AvailabilityDisplay from "../components/AvailabilityDisplay";

const AvailabilityPage: React.FC = () => {
  return (
    <Container sx={{ mt: 4 }}>
      <Grid container spacing={4}>
        <Grid item xs={12}>
          <AvailabilityDisplay />
        </Grid>
      </Grid>
    </Container>
  );
};

export default AvailabilityPage;