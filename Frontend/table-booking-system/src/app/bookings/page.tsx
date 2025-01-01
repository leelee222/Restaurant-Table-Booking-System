"use client";

import React from "react";
import { Container, Grid } from "@mui/material";
import BookingForm from "../components/BookingForm";

const BookingPage: React.FC = () => {
  return (
    <Container sx={{ mt: 4 }}>
      <Grid container spacing={4}>
        <Grid item xs={12}>
          <BookingForm />
        </Grid>
      </Grid>
    </Container>
  );
};

export default BookingPage;