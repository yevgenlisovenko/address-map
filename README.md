# Real-time Map - Real-time Mapping Application

A real-time web application that displays USA locations as pins on an interactive map. The application uses WebSocket technology to instantly broadcast new locations to all connected clients.

## Features

- **Dual Input Modes**: Toggle between Address mode (with geocoding) and Coordinates mode (direct lat/lon input)
- **Real-time Updates**: All connected clients see new pins instantly via WebSocket
- **Interactive Map**: Built with Leaflet, showing OpenStreetMap tiles
- **State Highlighting**: Highlight groups of US states with custom colors via API
- **Address Geocoding**: Automatic conversion of addresses to coordinates using Nominatim API
- **Direct Coordinate Input**: Place pins by entering latitude and longitude with optional labels
- **Multiple Input Methods**: Submit via web interface, WebSocket, or REST API
- **Responsive Design**: Works on desktop and mobile devices
- **AI-Powered Analysis**: Analyze visible map pins using OpenAI for pattern recognition, insights, and summaries
- **Time-Based Filtering**: Filter pins by time windows (5 minutes to 24 hours) or custom time selection
- **Pin Persistence**: Automatic save/load of pins to disk across server restarts
- **Property Filtering**: Add custom metadata to pins and filter by property values
- **Database Polling**: Optional MSSQL database integration for continuous data ingestion
- **Structured Logging**: Production-ready logging with Winston (file rotation, multiple levels)
- **Copy to Clipboard**: One-click copy of AI analysis results in markdown format

## Technology Stack

### Frontend
- React (with Vite)
- Leaflet & React-Leaflet for map rendering
- Socket.IO Client for real-time communication
- React-Markdown for AI response rendering

### Backend
- Node.js with Express
- Socket.IO Server for WebSocket handling
- Axios for HTTP requests
- Nominatim (OpenStreetMap) for geocoding
- Winston for structured logging
- MSSQL for optional database integration
- OpenAI API for AI-powered analysis

## Prerequisites

- Node.js 18+ and npm installed
- Modern web browser (Chrome, Firefox, Safari, Edge)
- Internet connection (for map tiles and geocoding)

## Installation & Deployment

### Option 1: Docker (Recommended) 🐳

**Fastest way to run the application:**

```bash
# Build and start all services
docker compose up -d

# Access the application
open http://localhost:3000
```

**For detailed Docker instructions**, see [DOCKER.md](DOCKER.md)

---

### Option 2: Local Development

#### 1. Clone or Download the Project

```bash
cd real-time-map
```

#### 2. Install Backend Dependencies

```bash
cd backend
npm install
```

#### 3. Install Frontend Dependencies

```bash
cd ../frontend
npm install
```

## Running the Application

### Docker Deployment (Production-Ready)

```bash
# Start with Docker Compose
docker compose up -d

# View logs
docker compose logs -f

# Stop services
docker compose down
```

**Frontend**: http://localhost:3000
**Backend API**: http://localhost:3001

See [DOCKER.md](DOCKER.md) for complete Docker documentation.

---

### Local Development

You need to run both the backend server and frontend development server.

#### Start the Backend Server

```bash
# From the backend directory
cd backend
npm start
```

The backend server will start on `http://localhost:3001`

**Alternative**: For development with auto-reload:
```bash
npm run dev
```

### Start the Frontend Development Server

Open a new terminal window:

```bash
# From the frontend directory
cd frontend
npm run dev
```

The frontend will start on `http://localhost:5173`

### Access the Application

Open your browser and navigate to:
```
http://localhost:5173
```

## Usage

### Method 1: Web Interface - Address Mode

1. Open the application in your browser
2. Wait for the "Connected" status in the sidebar
3. Click "▶ Add Address" to expand the input form
4. Ensure "Address" mode is selected (default)
5. Enter a USA address in the input field (e.g., "1600 Pennsylvania Avenue NW, Washington, DC")
6. Click "Add Pin"
7. The address will be geocoded and displayed on the map
8. All connected clients will see the new pin in real-time

### Method 2: Web Interface - Coordinates Mode

1. Open the application in your browser
2. Wait for the "Connected" status in the sidebar
3. Click "▶ Add Address" to expand the input form
4. Click the "Coordinates" button to switch input mode
5. Enter latitude (-90 to 90) and longitude (-180 to 180)
6. Optionally, enter a label for the pin
7. Click "Add Pin"
8. The pin will be displayed at the specified coordinates
9. All connected clients will see the new pin in real-time

### Method 3: REST API - Address Geocoding

Send a POST request to the backend API:

```bash
curl -X POST http://localhost:3001/api/address \
  -H "Content-Type: application/json" \
  -d '{"id": "pin-001", "address": "Empire State Building, New York, NY"}'
```

**Response Example:**
```json
{
  "success": true,
  "data": {
    "lat": 40.748817,
    "lon": -73.985428,
    "displayName": "Empire State Building, 350, 5th Avenue, Manhattan, New York County, New York, 10001, United States"
  }
}
```

### Method 4: REST API - Direct Coordinates

Send coordinates directly without geocoding:

```bash
curl -X POST http://localhost:3001/api/coordinates \
  -H "Content-Type: application/json" \
  -d '{"id": "pin-002", "lat": 40.748817, "lon": -73.985428, "label": "Empire State Building"}'
```

**Response Example:**
```json
{
  "success": true,
  "data": {
    "lat": 40.748817,
    "lon": -73.985428
  }
}
```

**Note:** The `label` parameter is optional. If omitted, the pin will be labeled with "Coordinates: lat, lon".

## Testing Examples

Try these examples to test the application:

### Address Geocoding Examples

```bash
# Famous landmarks
curl -X POST http://localhost:3001/api/address -H "Content-Type: application/json" -d '{"id": "landmark-1", "address": "Statue of Liberty, New York, NY"}'

curl -X POST http://localhost:3001/api/address -H "Content-Type: application/json" -d '{"id": "landmark-2", "address": "Hollywood Sign, Los Angeles, CA"}'

curl -X POST http://localhost:3001/api/address -H "Content-Type: application/json" -d '{"id": "landmark-3", "address": "Space Needle, Seattle, WA"}'

curl -X POST http://localhost:3001/api/address -H "Content-Type: application/json" -d '{"id": "landmark-4", "address": "Willis Tower, Chicago, IL"}'

curl -X POST http://localhost:3001/api/address -H "Content-Type: application/json" -d '{"id": "landmark-5", "address": "Alamo, San Antonio, TX"}'
```

### Direct Coordinates Examples

```bash
# Famous landmarks with coordinates
curl -X POST http://localhost:3001/api/coordinates -H "Content-Type: application/json" -d '{"id": "coord-1", "lat": 40.689247, "lon": -74.044502, "label": "Statue of Liberty"}'

curl -X POST http://localhost:3001/api/coordinates -H "Content-Type: application/json" -d '{"id": "coord-2", "lat": 34.134117, "lon": -118.321495, "label": "Hollywood Sign"}'

curl -X POST http://localhost:3001/api/coordinates -H "Content-Type: application/json" -d '{"id": "coord-3", "lat": 47.620506, "lon": -122.349277, "label": "Space Needle"}'

# Without label (will show "Coordinates: lat, lon")
curl -X POST http://localhost:3001/api/coordinates -H "Content-Type: application/json" -d '{"id": "coord-4", "lat": 41.878876, "lon": -87.635915}'
```

### Examples with Custom Properties

```bash
# Address with properties
curl -X POST http://localhost:3001/api/address -H "Content-Type: application/json" -d '{
  "id": "prop-1",
  "address": "Empire State Building, New York, NY",
  "properties": {
    "category": "landmark",
    "rating": 4.8,
    "verified": true,
    "year_built": 1931
  }
}'

# Coordinates with properties
curl -X POST http://localhost:3001/api/coordinates -H "Content-Type: application/json" -d '{
  "id": "prop-2",
  "lat": 40.748817,
  "lon": -73.985428,
  "label": "Empire State Building",
  "properties": {
    "category": "landmark",
    "height": "381m",
    "floors": 102,
    "notes": "Visited on vacation"
  }
}'
```

## Project Structure

```
real-time-map/
├── backend/
│   ├── src/
│   │   ├── server.js                    # Main Express + Socket.IO server
│   │   ├── config.js                    # Configuration settings
│   │   ├── database.js                  # MSSQL database connection
│   │   ├── pollingService.js            # Database polling service
│   │   ├── pinStorageManager.js         # Pin persistence manager
│   │   ├── stateColorManager.js         # State highlighting manager
│   │   │
│   │   ├── controllers/
│   │   │   ├── address.controller.js    # Address geocoding endpoints
│   │   │   ├── coordinates.controller.js# Direct coordinates endpoints
│   │   │   ├── highlight.controller.js  # State highlighting endpoints
│   │   │   ├── ai.controller.js         # AI analysis endpoints
│   │   │   ├── config.controller.js     # Config endpoints
│   │   │   └── polling.controller.js    # Polling status endpoints
│   │   │
│   │   ├── services/
│   │   │   ├── geocode.service.js       # Nominatim geocoding service
│   │   │   └── openai.service.js        # OpenAI API integration
│   │   │
│   │   ├── socket/
│   │   │   ├── index.js                 # Socket.IO initialization
│   │   │   └── handlers/
│   │   │       ├── connection.handler.js # Connection handling
│   │   │       ├── address.handler.js   # Address socket events
│   │   │       └── coordinates.handler.js# Coordinates socket events
│   │   │
│   │   ├── routes/
│   │   │   ├── index.js                 # Routes aggregator
│   │   │   ├── address.routes.js        # Address routes
│   │   │   ├── coordinates.routes.js    # Coordinates routes
│   │   │   ├── highlight.routes.js      # State highlight routes
│   │   │   ├── ai.routes.js             # AI routes
│   │   │   ├── config.routes.js         # Config routes
│   │   │   ├── polling.routes.js        # Polling routes
│   │   │   └── health.routes.js         # Health check route
│   │   │
│   │   ├── middleware/
│   │   │   └── errorHandler.js          # Centralized error handling
│   │   │
│   │   ├── utils/
│   │   │   ├── logger.js                # Winston logger configuration
│   │   │   └── validation.js            # Input validation utilities
│   │   │
│   │   └── constants/
│   │       └── states.js                # US state abbreviations & validation
│   │
│   ├── data/                            # Persistent storage directory
│   │   ├── pins.json                    # Persisted pins (auto-generated)
│   │   └── state-highlights.json        # Persisted state highlights (auto-generated)
│   │
│   ├── logs/                            # Application logs (auto-generated)
│   │   ├── combined.log                 # All logs
│   │   ├── error.log                    # Error logs only
│   │   ├── exceptions.log               # Uncaught exceptions
│   │   └── rejections.log               # Unhandled promise rejections
│   │
│   ├── .env.example                     # Environment variables template
│   └── package.json
│
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── Map.jsx                  # Leaflet map component
│   │   │   ├── TimeWindowSelector.jsx   # Time filtering component
│   │   │   ├── PropertyFilters.jsx      # Property filtering component
│   │   │   └── ai/
│   │   │       ├── AI.jsx               # AI analysis component
│   │   │       └── AI.css               # AI component styles
│   │   │
│   │   ├── hooks/
│   │   │   ├── useAIAnalysis.js         # AI analysis custom hook
│   │   │   ├── useSocket.js             # Socket.IO custom hook
│   │   │   └── useFilters.js            # Filtering custom hook
│   │   │
│   │   ├── contexts/
│   │   │   └── AppConfigContext.jsx     # Application config context
│   │   │
│   │   ├── App.jsx                      # Main React component
│   │   ├── App.css                      # Application styles
│   │   ├── main.jsx                     # React entry point
│   │   └── index.css                    # Global styles
│   │
│   ├── .env.example                     # Frontend environment variables
│   ├── package.json
│   └── vite.config.js
│
├── docker-compose.yml                   # Docker Compose configuration
├── DOCKER.md                            # Docker documentation
├── USAGE_LIMITS.md                      # API usage limits documentation
├── IMPROVEMENTS.md                      # Improvement notes
├── TODO.md                              # Project TODO list
└── README.md                            # This file
```

## Configuration

### Backend Configuration

Edit `backend/src/config.js` to customize:

- **Port**: Default is 3001
- **CORS Origin**: Default is http://localhost:5173
- **Geocoding Provider**: Currently using Nominatim (free, no API key required)

### Frontend Configuration

Create a `.env` file in the `frontend` directory to customize:

```env
VITE_BACKEND_URL=http://localhost:3001
```

See [frontend/.env.example](frontend/.env.example) for complete frontend configuration.

## Environment Variables Reference

### Server Configuration

```bash
# Server port (default: 3001)
PORT=3001

# CORS origin for frontend (default: http://localhost:5173)
CORS_ORIGIN=http://localhost:5173

# Node environment (development or production)
NODE_ENV=development
```

### AI Configuration

```bash
# Enable AI analysis features (default: false)
AI_ENABLED=false

# OpenAI API key (required if AI_ENABLED=true)
OPENAI_API_KEY=your-openai-api-key

# OpenAI API base URL - customize for Azure OpenAI, custom endpoints, or proxies
# Standard OpenAI: https://api.openai.com/v1
# Azure OpenAI: https://your-resource.openai.azure.com/openai/deployments/your-deployment
OPENAI_BASE_URL=https://api.openai.com/v1

# OpenAI model to use (default: gpt-4)
OPENAI_MODEL=gpt-4

# Maximum tokens for AI responses (default: 4000)
AI_MAX_TOKENS=4000

# Temperature for AI responses (0.0-1.0, default: 0.7)
AI_TEMPERATURE=0.7

# SSL/TLS verification for OpenAI API (default: true)
# Set to false if behind corporate proxy with self-signed certificates
AI_REJECT_UNAUTHORIZED=true

# Comma-separated list of allowed properties to send to AI (default: all)
# Example: "category,rating,verified"
AI_ALLOWED_PROPERTIES=

# Maximum number of markers allowed for AI analysis (default: 1000)
AI_MAX_MARKERS=1000

# API body size limit for JSON payloads (default: 10mb)
API_BODY_LIMIT=10mb
```

### Database Configuration

```bash
# Enable database connection (default: false)
DB_ENABLED=false

# SQL Server hostname or IP
DB_SERVER=localhost

# SQL Server port (default: 1433)
DB_PORT=1433

# Database name
DB_DATABASE=your_database

# Database username
DB_USER=your_username

# Database password
DB_PASSWORD=your_password

# Enable encryption (default: true)
DB_ENCRYPT=true

# Trust server certificate (default: false)
# Set to true for self-signed certificates
DB_TRUST_SERVER_CERTIFICATE=false
```

### Polling Configuration

```bash
# Enable database polling (default: false)
# Requires DB_ENABLED=true
POLLING_ENABLED=false

# Polling interval in milliseconds (default: 15000 = 15 seconds)
POLLING_INTERVAL=15000

# SQL query to initialize last poll ID
INIT_QUERY=SELECT max(id) max_id FROM coordinates

# SQL query to fetch new records
# Use @lastPoll as parameter for the last processed ID
POLLING_QUERY=SELECT id, * FROM coordinates WHERE id > @lastPoll ORDER BY id DESC

# Column mapping for database fields
POLLING_COL_LAT=latitude
POLLING_COL_LON=longitude
POLLING_COL_LABEL=label
POLLING_COL_PROPERTIES=  # Optional: JSON column name for custom properties
```

### Pin Storage Configuration

```bash
# Maximum age for pins in milliseconds (default: 86400000 = 24 hours)
PIN_MAX_AGE=86400000

# Cleanup interval in milliseconds (default: 300000 = 5 minutes)
PIN_CLEANUP_INTERVAL=300000

# Number of expired pins before compaction (default: 1000)
PIN_COMPACTION_THRESHOLD=1000

# Path for pin persistence file (default: backend/data/pins.json)
PIN_PERSIST_PATH=./data/pins.json

# Available time window options as JSON (default shown below)
# Format: { "label": milliseconds, ... }
PIN_TIME_WINDOWS={"5 min":300000,"15 min":900000,"30 min":1800000,"1 hour":3600000,"2 hours":7200000,"4 hours":14400000,"8 hours":28800000,"16 hours":57600000,"24 hours":86400000}

# Default time window (must match a label in PIN_TIME_WINDOWS)
PIN_DEFAULT_TIME_WINDOW=1 hour
```

### State Highlighting Configuration

```bash
# Default color for state highlights (default: #FF0000 red)
DEFAULT_STATE_COLOR=#FF0000
```

### Logging Configuration

```bash
# Log level: error, warn, info, http, debug (default: debug in dev, info in production)
LOG_LEVEL=debug
```

For complete configuration examples, see [backend/.env.example](backend/.env.example).

## API Reference

### REST Endpoints

#### POST /api/address
Submit a new address for geocoding and broadcasting

**Request Body:**
```json
{
  "id": "string | number (required) - unique pin identifier",
  "address": "string (required)",
  "properties": "object (optional) - custom key-value metadata"
}
```

**Example with properties:**
```json
{
  "id": "pin-123",
  "address": "Empire State Building, New York, NY",
  "properties": {
    "category": "landmark",
    "rating": 4.8,
    "verified": true,
    "notes": "Famous skyscraper"
  }
}
```

**Success Response (200):**
```json
{
  "success": true,
  "data": {
    "lat": number,
    "lon": number,
    "displayName": "string"
  }
}
```

**Error Response (400/500):**
```json
{
  "error": "Error message"
}
```

#### POST /api/coordinates
Submit coordinates directly for pin placement

**Request Body:**
```json
{
  "id": "string | number (required) - unique pin identifier",
  "lat": number (required, -90 to 90),
  "lon": number (required, -180 to 180),
  "label": "string (optional)",
  "properties": "object (optional) - custom key-value metadata"
}
```

**Example with properties:**
```json
{
  "id": "pin-456",
  "lat": 40.748817,
  "lon": -73.985428,
  "label": "Empire State Building",
  "properties": {
    "category": "landmark",
    "height": "381m",
    "floors": 102
  }
}
```

**Success Response (200):**
```json
{
  "success": true,
  "data": {
    "lat": number,
    "lon": number
  }
}
```

**Error Response (400/500):**
```json
{
  "error": "Error message"
}
```

#### POST /api/highlight
Highlight groups of US states with colors

**Request Body:**
```json
{
  "colorConfig": [
    {
      "states": ["CA", "OR", "WA"],
      "color": "#FF0000",
      "label": "West Coast"
    },
    {
      "states": ["TX", "LA", "OK"],
      "color": "#0000FF",
      "label": "South Central"
    },
    {
      "states": ["NY", "NJ", "PA"],
      "label": "Northeast"
      // No color specified - uses default color (#FF0000)
    }
  ]
}
```

**Behavior:**
- Each group contains an array of state abbreviations (2-letter postal codes)
- Optional `color` field for each group (hex format: #RGB, #RRGGBB, or #RRGGBBAA)
- Optional `label` field for each group (shown in map legend)
- If `color` is omitted, the default color is used (configured via `DEFAULT_STATE_COLOR` env variable, default: #FF0000)
- If `label` is omitted, the group won't appear in the legend (but states will still be colored)
- States not in any group will be unhighlighted
- If a state appears in multiple groups, the last group's color wins
- Only "winning" groups (with at least one visible state) appear in the legend
- Empty `colorConfig` array clears all highlights

**Success Response (200):**
```json
{
  "success": true,
  "data": {
    "colors": {
      "CA": "#FF0000",
      "OR": "#FF0000",
      "WA": "#FF0000",
      "TX": "#0000FF",
      "LA": "#0000FF",
      "OK": "#0000FF",
      "NY": "#FF0000",
      "NJ": "#FF0000",
      "PA": "#FF0000"
    },
    "groups": [
      {
        "color": "#FF0000",
        "label": "West Coast",
        "states": ["CA", "OR", "WA"]
      },
      {
        "color": "#0000FF",
        "label": "South Central",
        "states": ["TX", "LA", "OK"]
      },
      {
        "color": "#FF0000",
        "label": "Northeast",
        "states": ["NY", "NJ", "PA"]
      }
    ]
  },
  "groupCount": 3
}
```

**Error Response (400):**
```json
{
  "error": "Validation failed",
  "details": [
    "Group 0: Invalid state abbreviation 'XY'",
    "Group 1: Invalid color format 'not-a-color'"
  ]
}
```

**Example - Highlight West Coast states with label:**
```bash
curl -X POST http://localhost:3001/api/highlight \
  -H "Content-Type: application/json" \
  -d '{
    "colorConfig": [
      {
        "states": ["CA", "OR", "WA"],
        "color": "#FF0000",
        "label": "West Coast"
      }
    ]
  }'
```

**Example - Multiple groups with labels:**
```bash
curl -X POST http://localhost:3001/api/highlight \
  -H "Content-Type: application/json" \
  -d '{
    "colorConfig": [
      {
        "states": ["CA", "OR", "WA"],
        "color": "#FF0000",
        "label": "West Coast"
      },
      {
        "states": ["TX", "LA", "OK", "AR"],
        "color": "#0000FF",
        "label": "South Central"
      },
      {
        "states": ["NY", "NJ", "PA", "CT"],
        "label": "Northeast"
      }
    ]
  }'
```

**Example - Clear all highlights:**
```bash
curl -X POST http://localhost:3001/api/highlight \
  -H "Content-Type: application/json" \
  -d '{ "colorConfig": [] }'
```

#### GET /api/highlight
Get current state highlights

**Response:**
```json
{
  "success": true,
  "data": {
    "colors": {
      "CA": "#FF0000",
      "OR": "#FF0000",
      "WA": "#FF0000"
    },
    "groups": [
      {
        "color": "#FF0000",
        "label": "West Coast",
        "states": ["CA", "OR", "WA"]
      }
    ]
  }
}
```

#### GET /health
Health check endpoint

**Response:**
```json
{
  "status": "ok",
  "message": "Server is running"
}
```

#### POST /api/ai/analyze
Analyze visible map markers using AI

**Request Body:**
```json
{
  "promptId": "analyze",  // One of: "analyze", "find-patterns", "summarize"
  "markers": [
    {
      "lat": 40.748817,
      "lon": -73.985428,
      "displayName": "Empire State Building",
      "properties": {
        "category": "landmark",
        "rating": 4.8
      },
      "timestamp": "2025-11-04T10:30:00.000Z"
    }
  ]
}
```

**Success Response (200):**
```json
{
  "success": true,
  "response": "Analysis results in markdown format...",
  "usage": {
    "prompt_tokens": 150,
    "completion_tokens": 300,
    "total_tokens": 450
  }
}
```

**Error Responses:**
```json
// AI not enabled
{
  "error": "AI features are not enabled on this server"
}

// Too many markers
{
  "error": "TOO_MANY_MARKERS",
  "message": "Too many markers to analyze. Please filter the map to show fewer markers."
}

// OpenAI API error
{
  "error": "OPENAI_ERROR",
  "message": "Error message from OpenAI"
}
```

#### GET /api/ai/prompts
Get available AI analysis prompts

**Response:**
```json
{
  "success": true,
  "prompts": [
    {
      "id": "analyze",
      "label": "Analyze Patterns",
      "systemPrompt": "You are a data analyst...",
      "userPrompt": "Analyze the following markers..."
    },
    {
      "id": "find-patterns",
      "label": "Find Patterns",
      "systemPrompt": "You are a pattern recognition expert...",
      "userPrompt": "Find patterns in the following markers..."
    },
    {
      "id": "summarize",
      "label": "Summarize",
      "systemPrompt": "You are a concise data summarizer...",
      "userPrompt": "Provide a concise summary..."
    }
  ]
}
```

#### GET /api/config
Get application configuration for frontend

**Response:**
```json
{
  "success": true,
  "config": {
    "ai": {
      "enabled": false,
      "prompts": [...]
    },
    "pinStorage": {
      "timeWindowOptions": {
        "5 min": 300000,
        "15 min": 900000,
        "1 hour": 3600000,
        "24 hours": 86400000
      },
      "defaultTimeWindow": "1 hour"
    }
  }
}
```

#### GET /api/polling/status
Get database polling service status

**Response:**
```json
{
  "success": true,
  "enabled": true,
  "running": true,
  "interval": 15000,
  "lastPoll": "2025-11-04T10:30:00.000Z",
  "lastPollId": 12345,
  "totalRecords": 150
}
```

#### POST /api/polling/trigger
Manually trigger a polling cycle

**Response:**
```json
{
  "success": true,
  "message": "Polling triggered successfully",
  "newRecords": 5
}
```

**Error Response (polling not enabled):**
```json
{
  "error": "Polling service is not enabled"
}
```

### WebSocket Events

#### Server → Client

**Event: `add-pin`**
```javascript
socket.on('add-pin', (data) => {
  // data contains: { id, type, lat, lon, displayName, properties, timestamp }
  // id is the unique pin identifier (string or number)
  // type is either 'address' or 'coordinates'
  // if type is 'address', also includes: { address }
  // properties is an object with custom metadata (may be empty)
});
```

**Event: `error`**
```javascript
socket.on('error', (error) => {
  // error contains: { message, address? }
});
```

**Event: `state-highlights-update`**
```javascript
socket.on('state-highlights-update', (data) => {
  // data contains colors and groups with labels
  // Example:
  // {
  //   "colors": { "CA": "#FF0000", "TX": "#0000FF" },
  //   "groups": [
  //     { "color": "#FF0000", "label": "West Coast", "states": ["CA", "OR", "WA"] },
  //     { "color": "#0000FF", "label": "South", "states": ["TX", "LA"] }
  //   ]
  // }
  console.log('State highlights updated:', data);
});
```

## API Usage Limits & Compliance

⚠️ **IMPORTANT**: This application uses free, donation-funded services with usage restrictions.

### Current Services

#### Nominatim Geocoding API
- **Rate Limit**: 1 request per second (strictly enforced) ✅
- **Caching**: 24-hour in-memory cache implemented ✅
- **User-Agent**: Required and configured ✅
- **Suitable for**: Development, testing, small-scale projects
- **Policy**: https://operations.osmfoundation.org/policies/nominatim/

#### OpenStreetMap Tiles
- **No explicit rate limit** but "best-effort" service
- **Caching**: Browser default (7-day cache recommended)
- **Attribution**: Required and displayed ✅
- **Suitable for**: Development, testing, small-scale projects
- **Policy**: https://operations.osmfoundation.org/policies/tiles/

### Compliance Status

✅ **Development/Testing**: Fully compliant
⚠️ **Production**: Additional optimizations recommended

**For detailed information**, see [USAGE_LIMITS.md](USAGE_LIMITS.md)

### Production Recommendations

For production deployments, consider:

1. **Commercial Geocoding Services:**
   - Google Maps Geocoding API ($5/1K requests, free tier available)
   - Mapbox Geocoding API (100K free requests/month)
   - HERE Geocoding API (enterprise-grade)
   - Self-hosted Nominatim (no limits, requires infrastructure)

2. **Commercial Map Tiles:**
   - Mapbox GL (50K free loads/month)
   - Maptiler (free tier available)
   - Self-hosted tiles (full control, storage intensive)

3. **Optimizations:**
   - ✅ Geocoding cache (implemented - 24hr TTL)
   - Request queue for concurrent users
   - Redis for distributed caching
   - CDN for tile delivery

## Troubleshooting

### Frontend can't connect to backend

- Ensure backend server is running on port 3001
- Check CORS settings in `backend/src/config.js`
- Verify `VITE_BACKEND_URL` in frontend `.env` file

### Addresses not geocoding

- Check internet connection
- Nominatim may be rate-limited (wait 1 second between requests)
- Ensure addresses are USA-specific
- Check backend console for error messages

### Map not displaying

- Ensure Leaflet CSS is imported
- Check browser console for errors
- Verify internet connection for map tiles

## Development

### Backend Development

```bash
cd backend
npm run dev  # Runs with --watch flag for auto-reload
```

### Frontend Development

```bash
cd frontend
npm run dev  # Runs Vite dev server with HMR
```

### Build for Production

Frontend:
```bash
cd frontend
npm run build
```

This creates an optimized build in `frontend/dist/`

## License

MIT

## Future Enhancements

- Add user authentication and authorization for Socket.IO
- Export pins to CSV/JSON formats
- Search and highlight specific pins by text/properties
- Clustering for many pins (performance optimization)
- Custom pin icons and colors per category
- Address validation before geocoding
- Rate limiting per client IP
- PostgreSQL + PostGIS integration (alternative to MSSQL)
- Geofencing and zone-based alerts
- Historical replay of pin additions over time
