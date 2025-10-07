# Address Map - Real-time Address Mapping Application

A real-time web application that displays USA addresses as pins on an interactive map. The application uses WebSocket technology to instantly broadcast new addresses to all connected clients.

## Features

- **Real-time Updates**: All connected clients see new pins instantly via WebSocket
- **Interactive Map**: Built with Leaflet, showing OpenStreetMap tiles
- **Address Geocoding**: Automatic conversion of addresses to coordinates using Nominatim API
- **Multiple Input Methods**: Submit addresses via web interface, WebSocket, or REST API
- **Responsive Design**: Works on desktop and mobile devices

## Technology Stack

### Frontend
- React (with Vite)
- Leaflet & React-Leaflet for map rendering
- Socket.IO Client for real-time communication

### Backend
- Node.js with Express
- Socket.IO Server for WebSocket handling
- Axios for HTTP requests
- Nominatim (OpenStreetMap) for geocoding

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
cd address-map
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

### Method 1: Web Interface

1. Open the application in your browser
2. Wait for the "Connected" status in the sidebar
3. Enter a USA address in the input field (e.g., "1600 Pennsylvania Avenue NW, Washington, DC")
4. Click "Add Pin"
5. The address will be geocoded and displayed on the map
6. All connected clients will see the new pin in real-time

### Method 2: REST API

Send a POST request to the backend API:

```bash
curl -X POST http://localhost:3001/api/address \
  -H "Content-Type: application/json" \
  -d '{"address": "Empire State Building, New York, NY"}'
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

### Method 3: WebSocket (Socket.IO)

Connect to the WebSocket server and emit events:

```javascript
import { io } from 'socket.io-client';

const socket = io('http://localhost:3001');

socket.emit('new-address', {
  address: 'Golden Gate Bridge, San Francisco, CA'
});

socket.on('add-pin', (data) => {
  console.log('New pin:', data);
});
```

## Testing Examples

Try these addresses to test the application:

```bash
# Famous landmarks
curl -X POST http://localhost:3001/api/address -H "Content-Type: application/json" -d '{"address": "Statue of Liberty, New York, NY"}'

curl -X POST http://localhost:3001/api/address -H "Content-Type: application/json" -d '{"address": "Hollywood Sign, Los Angeles, CA"}'

curl -X POST http://localhost:3001/api/address -H "Content-Type: application/json" -d '{"address": "Space Needle, Seattle, WA"}'

curl -X POST http://localhost:3001/api/address -H "Content-Type: application/json" -d '{"address": "Willis Tower, Chicago, IL"}'

curl -X POST http://localhost:3001/api/address -H "Content-Type: application/json" -d '{"address": "Alamo, San Antonio, TX"}'
```

## Project Structure

```
address-map/
├── backend/
│   ├── src/
│   │   ├── server.js       # Main Express + Socket.IO server
│   │   ├── geocode.js      # Geocoding service (Nominatim)
│   │   └── config.js       # Configuration settings
│   └── package.json
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   └── Map.jsx     # Leaflet map component
│   │   ├── App.jsx         # Main React component
│   │   ├── App.css         # Application styles
│   │   ├── main.jsx        # React entry point
│   │   └── index.css       # Global styles
│   ├── package.json
│   └── vite.config.js
└── README.md
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

## API Reference

### REST Endpoints

#### POST /api/address
Submit a new address for geocoding and broadcasting

**Request Body:**
```json
{
  "address": "string (required)"
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

#### GET /health
Health check endpoint

**Response:**
```json
{
  "status": "ok",
  "message": "Server is running"
}
```

### WebSocket Events

#### Client → Server

**Event: `new-address`**
```javascript
socket.emit('new-address', {
  address: 'string (required)'
});
```

#### Server → Client

**Event: `add-pin`**
```javascript
socket.on('add-pin', (data) => {
  // data contains: { address, lat, lon, displayName, timestamp }
});
```

**Event: `error`**
```javascript
socket.on('error', (error) => {
  // error contains: { message, address }
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

- Persist pins to a database (PostgreSQL + PostGIS)
- Add user authentication
- Filter pins by date/time range
- Export pins to CSV/JSON
- Search and highlight specific pins
- Clustering for many pins
- Custom pin icons and colors
- Address validation before geocoding
