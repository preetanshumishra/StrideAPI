# Stride API

A comprehensive backend API for smart errand management and personal place saving. Built with Express.js, TypeScript, and MongoDB.

## Features

- **User Authentication**: JWT-based authentication with access and refresh tokens
- **User Profile Management**: Update profile, change password, delete account with cascade operations
- **User Preferences**: Save geofence alerts, visit detection, and errand notification preferences
- **Place Management**: Save and organize personal places with tags, notes, ratings, and collections
- **Errand Management**: Create and track errands with priorities, deadlines, and linking to saved places
- **Collection System**: Organize places into custom collections (e.g., "My Pharmacies", "Favorite Cafes")
- **Smart Data Model**: Places and errands are linked for intelligent routing and suggestions
- **Cascade Operations**: Deleting user cascades to delete all associated places, errands, and collections

## Tech Stack

- **Runtime**: Node.js
- **Framework**: Express.js
- **Language**: TypeScript
- **Database**: MongoDB with Mongoose ODM
- **Authentication**: JWT (jsonwebtoken)
- **Password Hashing**: bcryptjs
- **API Documentation**: Swagger/OpenAPI

## Installation

1. Clone the repository:
```bash
git clone https://github.com/preetanshumishra/StrideAPI.git
cd StrideAPI
```

2. Install dependencies:
```bash
npm install
```

3. Create a `.env` file in the root directory (see `.env.example`):
```env
MONGO_URI=your_mongodb_atlas_connection_string
JWT_SECRET=your_super_secret_jwt_key
PORT=5001
NODE_ENV=development
```

4. Make sure MongoDB Atlas IP Whitelist includes your IP or allows `0.0.0.0/0`

## Running the Server

Development mode with auto-reload:
```bash
npm run dev
```

Build TypeScript:
```bash
npm run build
```

Production mode:
```bash
npm start
```

## API Endpoints

### Authentication (5 endpoints)
- `POST /api/v1/auth/register` - Register a new user
- `POST /api/v1/auth/login` - Login user
- `POST /api/v1/auth/refresh` - Refresh access token
- `GET /api/v1/auth/profile` - Get user profile (protected)
- `DELETE /api/v1/auth/account` - Delete account and cascade delete all associated data (protected)

### User Preferences (2 endpoints)
- `GET /api/v1/auth/preferences` - Get user preferences (protected)
- `POST /api/v1/auth/preferences` - Save user preferences (protected)

### Places (5 endpoints)
- `GET /api/v1/places` - Get all places (with category and collection filters)
- `POST /api/v1/places` - Create a new place
- `GET /api/v1/places/:id` - Get place by ID
- `PUT /api/v1/places/:id` - Update place
- `DELETE /api/v1/places/:id` - Delete place

### Errands (6 endpoints)
- `GET /api/v1/errands` - Get all errands
- `POST /api/v1/errands` - Create a new errand
- `GET /api/v1/errands/:id` - Get errand by ID
- `PUT /api/v1/errands/:id` - Update errand
- `PATCH /api/v1/errands/:id/complete` - Mark errand as complete
- `DELETE /api/v1/errands/:id` - Delete errand

### Collections (4 endpoints)
- `GET /api/v1/collections` - Get all collections
- `POST /api/v1/collections` - Create a new collection
- `PUT /api/v1/collections/:id` - Update collection
- `DELETE /api/v1/collections/:id` - Delete collection (unlinks places)

## API Documentation

### Swagger/OpenAPI

The API includes comprehensive Swagger documentation:
- **Interactive UI**: `http://localhost:5001/api-docs` (development)
- **OpenAPI Spec**: `http://localhost:5001/swagger.json`

You can:
- View all endpoints with descriptions
- See request/response schemas
- Try out endpoints directly from the browser
- Export the spec to Postman or other API tools

## Database Models

### User
- Email (unique)
- Password (hashed)
- First name
- Last name
- Preferences (errandNotifications, visitDetection, geofenceAlerts)
- Created/Updated timestamps

### Place
- Name, address, latitude, longitude
- Category, tags, notes, personal rating
- Collection reference
- Visit count, last visited date
- Source (manual, auto-suggested, from-errand)
- User ID reference

### Errand
- Title, category
- Linked place ID (optional - specific store or any matching type)
- Priority, deadline
- Recurring configuration
- Status (pending, completed)
- Completed at timestamp and location
- User ID reference

### Collection
- Name, icon
- Place IDs (array)
- Shared flag
- User ID reference

## Error Handling

All API endpoints return consistent error responses:
```json
{
  "status": "error",
  "message": "Error description"
}
```

## Development Notes

- All routes except health check require JWT authentication
- Places, errands, and collections are user-specific (filtered by userId)
- Deleting a user cascades to delete all their places, errands, and collections
- Preferences are stored server-side with defaults (errandNotifications: true, visitDetection: true, geofenceAlerts: true)
- Passwords are hashed with bcryptjs (salt rounds: 10)
- Access tokens expire in 7 days
- Refresh tokens expire in 30 days
- TypeScript is compiled to JavaScript in the `dist/` folder
- All code is type-safe with proper interfaces and validation

## Project Structure

```
src/
├── config/
│   ├── database.ts          # MongoDB connection
│   └── swagger.ts           # Swagger/OpenAPI configuration
├── controllers/
│   ├── authController.ts    # Auth and profile management
│   ├── placeController.ts   # Places CRUD and filtering
│   ├── errandController.ts  # Errands CRUD and completion
│   └── collectionController.ts  # Collections CRUD
├── middleware/
│   └── auth.ts              # JWT authentication middleware
├── models/
│   ├── User.ts              # User schema with Stride preferences
│   ├── Place.ts             # Place schema
│   ├── Errand.ts            # Errand schema
│   └── Collection.ts        # Collection schema
├── routes/
│   ├── auth.ts              # Authentication routes
│   ├── places.ts            # Places routes
│   ├── errands.ts           # Errands routes
│   └── collections.ts       # Collections routes
├── utils/
│   ├── jwt.ts               # JWT token generation
│   ├── tokenStorage.ts      # Refresh token storage
│   ├── hash.ts              # Password hashing
│   ├── sanitize.ts          # MongoDB injection prevention
│   ├── errorResponse.ts     # Error message helper
│   └── validateObjectId.ts  # ObjectId validation
└── index.ts                 # Express app entry point
```

## Technologies Used

- **Runtime**: Node.js
- **Framework**: Express.js 5.x
- **Language**: TypeScript 5.x
- **Database**: MongoDB 9.x with Mongoose 9.x
- **Authentication**: JWT (jsonwebtoken 9.x)
- **Password Hashing**: bcryptjs 3.x
- **API Documentation**: Swagger/OpenAPI with swagger-ui-express
- **Development**: ts-node, nodemon, TypeScript compiler

## Testing the API

### Using Swagger UI
Visit `http://localhost:5001/api-docs` and click "Try it out" on any endpoint.

### Using cURL
```bash
# Register
curl -X POST http://localhost:5001/api/v1/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"user@example.com","password":"Password123","firstName":"John","lastName":"Doe"}'

# Get places (need JWT token from login)
curl -X GET http://localhost:5001/api/v1/places \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

### Using Postman
1. Import the OpenAPI spec: `http://localhost:5001/swagger.json`
2. Set the `Authorization` header with your JWT token from login
3. Start testing endpoints

## Deployment

StrideAPI is deployed on Google Cloud Run with continuous deployment via GitHub integration.

**Production URL**: https://strideapi-1048111785674.us-central1.run.app

### Deployment Pipeline
- **Platform**: Google Cloud Run (serverless)
- **Build System**: Cloud Build with Developer Connect
- **Container**: Node.js buildpack
- **Trigger**: Automatic on push to `main` branch
- **Environment**: Production configuration with MongoDB Atlas

## Stride Ecosystem

This project is part of the Stride smart errand and place management ecosystem:

- **[StrideiOS](https://github.com/preetanshumishra/StrideiOS)** - Native iOS app (Swift + SwiftUI)
- **[StrideAndroid](https://github.com/preetanshumishra/StrideAndroid)** - Native Android app (Kotlin + Jetpack Compose)

## License

MIT

## Author

Preetanshu Mishra

