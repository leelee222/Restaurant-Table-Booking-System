"use client";

import React, { useState } from "react";
import { 
  Box, 
  TextField, 
  Button, 
  Typography, 
  List, 
  ListItem, 
  ListItemText,
  CircularProgress,
  Alert,
  Chip
} from "@mui/material";

interface TimeSlot {
  time: string;
  remainingCapacity: number;
}

interface AvailabilityResponse {
  date: string;
  availableSlots: string[];
  slotsInfo: TimeSlot[];
}

const AvailabilityDisplay: React.FC = () => {
  const [date, setDate] = useState<string>("");
  const [slots, setSlots] = useState<TimeSlot[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const handleFetch = async () => {
    if (!date) return;
    
    setLoading(true);
    setError(null);

    try {
      const response = await fetch(`https://restaurant-table-booking-system-production.up.railway.app/get-available-slots?date=${date}`);
      const data: AvailabilityResponse = await response.json();
            console.log('Received data:', data); // Debug log


      if (response.ok) {
        setSlots(data.slotsInfo);
      } else {
        setError('Failed to fetch slots');
        setSlots([]);
      }
    } catch (error) {
      setError('Server connection error');
      setSlots([]);
    } finally {
      setLoading(false);
    }
  };

  const renderSlots = () => {
    if (!Array.isArray(slots)) return null;
    
    return slots.map((slot) => (
      <ListItem 
        key={slot.time}
        sx={{ 
          border: 1, 
          borderColor: 'divider',
          borderRadius: 1,
          mb: 1 
        }}
      >
        <ListItemText 
          primary={slot.time}
          secondary={
            <Chip 
              label={`${slot.remainingCapacity} tables available`}
              color={slot.remainingCapacity > 2 ? "success" : "warning"}
              size="small"
            />
          }
        />
      </ListItem>
    ));
  };

  return (
    <Box sx={{ maxWidth: 600, mx: "auto", mt: 4, fontFamily: "Lexend" }}>
      <Typography variant="h4" gutterBottom sx={{fontFamily: "Lexend"}}>
        Check Availability
      </Typography>

      <TextField
        fullWidth
        label="Date"
        type="date"
        value={date}
        onChange={(e) => setDate(e.target.value)}
        margin="normal"
        InputLabelProps={{ shrink: true }}
        disabled={loading}
        sx={{fontFamily: "Lexend"}}
      />

      <Button 
        variant="contained" 
        color="primary" 
        onClick={handleFetch} 
        disabled={loading || !date}
        sx={{ mt: 2, fontFamily: "Lexend" }}
      >
        {loading ? <CircularProgress size={24} /> : 'Check Availability'}
      </Button>

      {error && (
        <Alert severity="error" sx={{ mt: 2, fontFamily: "Lexend" }}>
          {error}
        </Alert>
      )}

      {!loading && !error && (
        <>
          <Typography variant="h6" sx={{ mt: 3, mb: 2, fontFamily: "Lexend" }}>
            Available Slots for {date}
          </Typography>
          <List>
            {slots && slots.length > 0 ? (
              renderSlots()
            ) : (
              <Typography color="text.secondary" sx={{fontFamily: "Lexend"}}>
                No available slots found for selected date.
              </Typography>
            )}
          </List>
        </>
      )}
    </Box>
  );
};

export default AvailabilityDisplay;