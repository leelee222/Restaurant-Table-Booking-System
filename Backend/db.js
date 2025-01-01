const mongoose = require('mongoose');

const MONGODB_URI = 'mongodb+srv://beendeckstore:W76aLa1xs5FreCAw@cluster0.jj6gf.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0';

mongoose.connect(MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(() => console.log('Connected to MongoDB'))
.catch(err => console.error('MongoDB connection error:', err));

const bookingSchema = new mongoose.Schema({
  name: { 
    type: String, 
    required: true 
  },
  contact: { 
    type: String, 
    required: true 
  },
  guests: { 
    type: Number, 
    required: true 
  },
  date: { 
    type: String, 
    required: true 
  },
  time: { 
    type: String, 
    required: true 
  },
  createdAt: { 
    type: Date, 
    default: Date.now 
  }
});

const Booking = mongoose.model('Booking', bookingSchema);

module.exports = { Booking };
