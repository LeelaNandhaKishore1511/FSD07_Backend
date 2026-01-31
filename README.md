# Event Registration Management System

A full-stack web application for managing event registrations with role-based access control.

## Features

### Authentication & Authorization
- ✅ User registration and login with JWT authentication
- ✅ Role-based access control (USER and ORGANIZER)
- ✅ Protected API endpoints with JWT verification
- ✅ Secure password hashing with bcrypt

### User Features (USER Role)
- ✅ View all available events
- ✅ Register for events with real-time capacity checking
- ✅ View personal registration history
- ✅ Cancel registrations
- ✅ Visual capacity indicators for events

### Organizer Features (ORGANIZER Role)
- ✅ Create new events with capacity limits
- ✅ View and manage created events
- ✅ View all registrations for each event
- ✅ Delete events (cascades to registrations)
- ✅ Real-time registration tracking

### Business Rules
- ✅ **Automatic capacity enforcement**: Events close when maximum capacity is reached
- ✅ **Transaction support**: Prevents race conditions during concurrent registrations
- ✅ **Unique registrations**: Users cannot register twice for the same event
- ✅ **Data persistence**: All data stored in MongoDB database

## Technology Stack

### Backend
- **Node.js** with Express.js
- **MongoDB** with Mongoose ODM
- **JWT** for authentication
- **Bcrypt** for password hashing
- **CORS** enabled for cross-origin requests

### Frontend
- **HTML5** with semantic markup
- **CSS3** with modern features (glassmorphism, gradients, animations)
- **Vanilla JavaScript** (ES6+)
- **Responsive design** for all screen sizes

## Project Structure

```
Event Registration Management System/
├── Controller/
│   ├── authController.js          # Authentication logic
│   ├── eventController.js         # Event management
│   └── registrationController.js  # Registration handling
├── Models/
│   ├── userModel.js              # User schema
│   ├── eventModel.js             # Event schema
│   └── registrationModel.js      # Registration schema
├── Middleware/
│   └── authMiddleware.js         # JWT verification & role authorization
├── Routers/
│   ├── authRoutes.js             # Auth endpoints
│   ├── eventRoutes.js            # Event endpoints
│   └── registrationRoutes.js     # Registration endpoints
├── database/
│   └── connection.js             # MongoDB connection
├── public/
│   ├── index.html                # Login page
│   ├── register.html             # Registration page
│   ├── user-dashboard.html       # User dashboard
│   ├── organizer-dashboard.html  # Organizer dashboard
│   └── styles.css                # Global styles
├── .env                          # Environment variables
├── index.js                      # Main server file
└── package.json                  # Dependencies

```

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user
- `GET /api/auth/profile` - Get user profile (protected)

### Events
- `GET /api/events` - Get all events (public)
- `GET /api/events/:id` - Get event by ID
- `POST /api/events` - Create event (ORGANIZER only)
- `PUT /api/events/:id` - Update event (ORGANIZER only)
- `DELETE /api/events/:id` - Delete event (ORGANIZER only)
- `GET /api/events/organizer/my-events` - Get organizer's events (ORGANIZER only)

### Registrations
- `POST /api/registrations` - Register for event (USER only)
- `GET /api/registrations/my` - Get user's registrations (USER only)
- `DELETE /api/registrations/:id` - Cancel registration (USER only)
- `GET /api/registrations/event/:eventId` - Get event registrations (ORGANIZER only)
- `GET /api/registrations/all` - Get all registrations (ORGANIZER only)

## Installation & Setup

### Prerequisites
- Node.js (v14 or higher)
- MongoDB Atlas account (or local MongoDB)
- npm or yarn

### Steps

1. **Install Dependencies**
   ```bash
   npm install
   ```

2. **Configure Environment Variables**
   
   The `.env` file is already configured with MongoDB connection. Update if needed:
   ```
   PORT=8000
   MONGO_URL=your_mongodb_connection_string
   JWT_SECRET=your_secret_key
   ```

3. **Start the Server**
   ```bash
   npm start
   ```
   
   For development with auto-reload:
   ```bash
   npm run dev
   ```

4. **Access the Application**
   
   Open your browser and navigate to:
   ```
   http://localhost:8000
   ```

## Usage Guide

### For Users
1. Register an account with role "USER"
2. Login to access the user dashboard
3. Browse available events
4. Click "Register Now" to register for an event
5. View your registrations in the "My Registrations" tab
6. Cancel registrations if needed

### For Organizers
1. Register an account with role "ORGANIZER"
2. Login to access the organizer dashboard
3. Create events in the "Create Event" tab
4. View your events in the "My Events" tab
5. Click "View Registrations" to see who registered
6. Monitor capacity in real-time
7. Delete events if needed

## Key Features Implementation

### Capacity Enforcement
- Uses MongoDB transactions to prevent race conditions
- Atomic increment/decrement of registration count
- Real-time capacity checking before registration
- Visual indicators (progress bars, badges)

### Security
- JWT tokens with 24-hour expiration
- Password hashing with bcrypt (10 salt rounds)
- Role-based middleware protection
- Input validation on both client and server

### User Experience
- Modern, premium dark theme design
- Smooth animations and transitions
- Responsive layout for all devices
- Real-time feedback and alerts
- Loading states for async operations

## Database Schema

### Users Collection
```javascript
{
  username: String (unique),
  email: String (unique),
  password: String (hashed),
  role: String (USER | ORGANIZER),
  createdAt: Date
}
```

### Events Collection
```javascript
{
  title: String,
  description: String,
  eventDate: Date,
  location: String,
  maxCapacity: Number,
  currentRegistrations: Number,
  organizerId: ObjectId (ref: User),
  createdAt: Date
}
```

### Registrations Collection
```javascript
{
  userId: ObjectId (ref: User),
  eventId: ObjectId (ref: Event),
  registrationDate: Date,
  status: String (CONFIRMED | CANCELLED),
  // Unique compound index on (userId, eventId)
}
```

## Testing

### Test Scenarios

1. **User Registration & Login**
   - Create USER and ORGANIZER accounts
   - Verify JWT token generation
   - Test role-based redirects

2. **Event Creation (Organizer)**
   - Create events with various capacities
   - Verify data persistence
   - Test validation rules

3. **Event Registration (User)**
   - Register for events
   - Test capacity limits
   - Verify duplicate prevention

4. **Capacity Enforcement**
   - Fill an event to capacity
   - Verify registration closes
   - Test concurrent registrations

5. **Registration Management**
   - View registrations (both roles)
   - Cancel registrations
   - Verify capacity updates

## Assignment Requirements Checklist

✅ **User Roles**: USER and ORGANIZER implemented  
✅ **Authentication**: JWT-based with registration and login  
✅ **Authorization**: Role-based access control on all endpoints  
✅ **Event Management**: Full CRUD for organizers  
✅ **Event Registration**: Users can register with capacity checking  
✅ **Registration Status**: Users can view their registrations  
✅ **Capacity Enforcement**: Automatic closure when full  
✅ **Database Persistence**: MongoDB with proper schemas  
✅ **Environment Variables**: Sensitive data in .env  
✅ **Frontend**: Role-based dashboards with all features  
✅ **Business Logic**: Correct and enforced  

## License

ISC

## Author

Created for Full Stack Development Assignment FSD-07
