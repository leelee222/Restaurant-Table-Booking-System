# Restaurant Table Booking System

A web-based application that allows users to book tables at a restaurant with a user-friendly interface and real-time slot management. This system ensures seamless reservation handling for both users and administrators.

---

## **Features**
- **Booking Form**:  
  - Users can select the date, time, and number of guests.  
  - Includes form validation to ensure proper data entry.
  
- **Slot Availability**:  
  - Displays available reservation slots based on real-time data.  
  - Prevents double booking by checking backend availability.

- **Responsive Design**:  
  - Fully optimized for desktop, tablet, and mobile devices.  

- **Business Logic**:  
  - Enforces booking rules such as reservations only between 12:00 PM and 8:00 PM.  
  - Limits the number of guests per slot to the restaurant's capacity.

---

## **Tech Stack**
### Frontend
- **React** (TypeScript)  
- **Material-UI (MUI)** for responsive and modern design  

### Backend
- **Node.js** with **Express** for API development  
- **MongoDB** (or SQLite) for database storage and dynamic updates  

### Deployment
- **Frontend**: Hosted on [Vercel](https://restaurant-table-booking-system-jet.vercel.app)  
- **Backend**: Hosted on [Railway](https://restaurant-table-booking-system-production.up.railway.app)  

---

## **Getting Started**

### Prerequisites
- Node.js (>=16.x)  
- MongoDB (or SQLite for local development)  

### Installation

#### Clone the Repository:
```bash
git clone https://github.com/your-username/restaurant-table-booking-system.git
cd restaurant-table-booking-system
```

#### Backend Setup:
1. Navigate to the backend folder:
   ```bash
   cd backend
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Add a `.env` file with the following:
   ```
   MONGO_URI=your-mongodb-connection-string
   PORT=5000
   ```
4. Start the backend server:
   ```bash
   node server.js
   ```

#### Frontend Setup:
1. Navigate to the frontend folder:
   ```bash
   cd frontend
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Start the development server:
   ```bash
   npm run dev
   ```

---

## **API Endpoints**
### **Base URL**: `https://restaurant-table-booking-system-production.up.railway.app`

1. **Create Booking**  
   - `POST /create-booking`  
   - Request body:
     ```json
     {
       "name": "John Doe",
       "contact": "john.doe@example.com",
       "guests": 4,
       "date": "2025-01-10",
       "time": "6:00 PM"
     }
     ```

2. **Get Bookings**  
   - `GET /get-bookings?date=2025-01-10`  

3. **Get Available Slots**  
   - `GET /get-available-slots?date=2025-01-10`  

---

## **Live Demo**
- **Frontend**: [Vercel Deployment](https://restaurant-table-booking-system-jet.vercel.app)  
- **Backend**: [Railway Deployment](https://restaurant-table-booking-system-production.up.railway.app)  

---

## **License**
This project is licensed under the MIT License. See the [LICENSE](./LICENSE) file for details.

---

## **Contact**
For any inquiries or feedback, please reach out via [ilhamadios222@gmail.com].

---

Let me know if you'd like to refine this further! 😊