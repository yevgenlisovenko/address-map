# API Usage Limits and Compliance

This document outlines the usage limits, requirements, and compliance status for external services used in the USA Real-time Map project.

---

## Overview

The application uses two free OpenStreetMap services:
1. **Nominatim Geocoding API** - Converts addresses to coordinates
2. **OpenStreetMap Tile Server** - Provides map visualization

Both services have usage policies that must be followed to avoid being blocked.

---

## Nominatim Geocoding API

### Service Information
- **URL**: `https://nominatim.openstreetmap.org`
- **Purpose**: Geocode USA addresses to latitude/longitude coordinates
- **Cost**: Free, donation-funded
- **Policy**: https://operations.osmfoundation.org/policies/nominatim/

### Usage Limits

#### Rate Limit: 1 Request Per Second ⚠️
- **Strictly enforced** per application/website
- Applies regardless of number of users
- Violations can result in temporary or permanent IP ban

#### Prohibited Uses
- ❌ Auto-complete search functionality
- ❌ Systematic bulk geocoding
- ❌ Grid-based searches
- ❌ Downloading complete address lists
- ❌ Scraping detail pages

### Requirements

#### 1. User-Agent Header (✅ Implemented)
```javascript
// backend/src/config.js
userAgent: 'USA-Real-time-Map-App/1.0'
```

#### 2. Rate Limiting (✅ Implemented)
```javascript
// backend/src/geocode.js
requestDelay: 1000ms (1 second)
```

#### 3. Attribution (✅ Implemented)
- Data is under ODbL (Open Database License)
- Attribution shown on map tiles

#### 4. Caching (⚠️ Recommended, Not Implemented)
- Should cache geocoded results locally
- Reduces API load and improves performance
- **Current Status**: No caching implemented

### Current Compliance Status

✅ **COMPLIANT** for basic usage:
- Rate limiting enforced (1 req/sec)
- Valid User-Agent header
- Attribution displayed
- No prohibited usage patterns

⚠️ **MISSING OPTIMIZATIONS**:
- No request caching
- No fallback for service outages

### Risks & Limitations

1. **Single Request Bottleneck**
   - Only 1 address can be geocoded per second
   - Multiple simultaneous users could queue requests
   - No guaranteed SLA or uptime

2. **Service Availability**
   - Free tier may be slow or unavailable
   - Could be blocked if usage patterns change

3. **Accuracy**
   - May have lower accuracy than commercial services
   - USA filtering may miss some addresses

---

## OpenStreetMap Tile Server

### Service Information
- **URL**: `https://tile.openstreetmap.org/{z}/{x}/{y}.png`
- **Purpose**: Render map tiles for visualization
- **Cost**: Free, donation-funded
- **Policy**: https://operations.osmfoundation.org/policies/tiles/

### Usage Limits

#### No Explicit Rate Limit
- Service is "best-effort" with no SLA
- May block access if usage degrades performance
- Funded by donations with limited capacity

### Requirements

#### 1. Correct Tile URL (✅ Implemented)
```javascript
// frontend/src/components/Map.jsx
url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
```

#### 2. Attribution (✅ Implemented)
```javascript
attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
```

#### 3. User-Agent (✅ Automatic)
- Automatically sent by browser
- Identifies application

#### 4. Tile Caching for 7+ Days (⚠️ Partial)
- **Required**: Cache tiles locally for at least 7 days
- **Current**: Relies on browser default caching
- **Issue**: May not meet 7-day requirement

### Prohibited Actions
- ❌ Bulk downloading tiles
- ❌ Creating offline archives
- ❌ Automated rendering/scanning
- ❌ Masquerading as another app
- ❌ Sending no-cache headers

### Current Compliance Status

✅ **COMPLIANT** for basic usage:
- Correct tile URL
- Attribution displayed
- User-Agent sent automatically
- No bulk downloading

⚠️ **POTENTIAL ISSUE**:
- Tile caching may not meet 7-day requirement
- Browser cache may expire earlier

### Risks & Limitations

1. **Service Blocking**
   - OSM may block access without notice
   - Can be temporary or network-level
   - No guaranteed uptime

2. **Performance**
   - Tiles may load slowly during peak times
   - Limited server capacity

---

## Compliance Summary

### Current Implementation

| Requirement | Status | Implementation |
|------------|--------|---------------|
| **Nominatim** |
| 1 req/sec rate limit | ✅ | `geocode.js:16-20` |
| User-Agent header | ✅ | `config.js:9` |
| Attribution | ✅ | Map component |
| No bulk geocoding | ✅ | Single requests only |
| Request caching | ❌ | Not implemented |
| **OSM Tiles** |
| Correct tile URL | ✅ | `Map.jsx:42` |
| Attribution | ✅ | `Map.jsx:41` |
| User-Agent | ✅ | Browser automatic |
| 7-day tile cache | ⚠️ | Browser default |
| No bulk download | ✅ | Single tile requests |

### Risk Assessment

**Current Risk Level**: 🟡 **MODERATE**

- ✅ Basic compliance requirements met
- ⚠️ Missing optimization (caching)
- ⚠️ Potential tile cache policy violation
- ⚠️ No fallback for service issues

---

## Recommendations

### For Development/Testing ✅

Current implementation is **acceptable** for:
- Local development
- Small-scale testing
- Proof of concept
- Learning projects

### For Production ⚠️

**Strongly Recommended Changes:**

#### 1. Implement Geocoding Cache
```javascript
// Example: In-memory cache
const geocodeCache = new Map();

async function geocodeAddress(address) {
  if (geocodeCache.has(address)) {
    return geocodeCache.get(address);
  }

  const result = await fetchFromNominatim(address);
  geocodeCache.set(address, result);
  return result;
}
```

**Benefits:**
- Reduces API load
- Faster responses
- Less chance of rate limit issues

#### 2. Add Request Queue
```javascript
// Handle concurrent requests properly
const requestQueue = [];
const processQueue = async () => {
  while (requestQueue.length > 0) {
    const request = requestQueue.shift();
    await geocodeWithRateLimit(request);
  }
};
```

#### 3. Configure Tile Caching
```javascript
// Add to TileLayer props
<TileLayer
  maxAge={604800000} // 7 days in ms
  crossOrigin={true}
/>
```

#### 4. Add Service Monitoring
- Log API response times
- Track error rates
- Alert on service degradation

---

## Production Alternatives

For production deployments, consider upgrading to commercial services:

### Geocoding Services

#### 1. Google Maps Geocoding API
- **Pros**: Highly accurate, global coverage, SLA
- **Cons**: Requires API key, paid (with free tier)
- **Pricing**: $5 per 1,000 requests (first $200/month free)
- **Rate Limit**: 50 req/sec

#### 2. Mapbox Geocoding API
- **Pros**: Good accuracy, generous free tier, modern API
- **Cons**: Requires API key
- **Pricing**: First 100,000 requests/month free
- **Rate Limit**: 600 req/min

#### 3. HERE Geocoding API
- **Pros**: Enterprise-grade, global, SLA
- **Cons**: Requires API key, paid
- **Pricing**: Variable based on volume
- **Rate Limit**: High

#### 4. Self-Hosted Nominatim
- **Pros**: No rate limits, full control, privacy
- **Cons**: Requires server, OSM data download, maintenance
- **Setup**: Docker container or manual installation
- **Cost**: Server hosting only

### Map Tile Services

#### 1. Mapbox GL
- **Pros**: Vector tiles, modern, customizable
- **Cons**: Requires API key
- **Pricing**: First 50,000 loads/month free

#### 2. Maptiler
- **Pros**: High-quality tiles, SDKs
- **Cons**: Requires API key
- **Pricing**: Free tier available

#### 3. Self-Hosted Tiles
- **Pros**: Full control, no limits
- **Cons**: Storage intensive, complex setup
- **Tools**: TileServer GL, OpenMapTiles

---

## Monitoring & Compliance

### How to Check Compliance

#### 1. Monitor Request Rate
```javascript
// Add logging
console.log(`Geocoding request: ${address} at ${new Date().toISOString()}`);
```

#### 2. Track API Errors
```javascript
// Log failures
if (error.response?.status === 429) {
  console.error('Rate limit exceeded!');
}
```

#### 3. Browser Network Tab
- Check tile caching headers
- Verify User-Agent is sent
- Monitor request timing

### Warning Signs of Non-Compliance

⚠️ **Immediate Action Required If:**
- Receiving HTTP 429 (Too Many Requests) errors
- Getting HTTP 403 (Forbidden) responses
- Tiles failing to load consistently
- Service blocks your IP address

### Recovery Steps

1. **If Blocked by Nominatim:**
   - Wait 24-48 hours
   - Review usage patterns
   - Implement caching
   - Consider switching to commercial service

2. **If Blocked by OSM Tiles:**
   - Switch to alternative tile provider immediately
   - Implement proper caching
   - Review tile request patterns

---

## Legal & Licensing

### Nominatim Data
- **License**: ODbL (Open Database License)
- **Requirement**: Attribute OpenStreetMap contributors
- **Commercial Use**: Allowed with attribution

### OpenStreetMap Tiles
- **License**: CC BY-SA (Creative Commons)
- **Requirement**: Attribute OpenStreetMap contributors
- **Commercial Use**: Allowed with attribution

### Attribution Text
```html
© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors
```

**Current Implementation**: ✅ Included in map attribution

---

## FAQ

### Q: Can I use this for a commercial application?
**A:** Yes, but:
- Must follow usage policies
- Consider upgrading to commercial services
- Implement caching and optimization
- Be prepared to switch services if requested

### Q: What happens if I exceed rate limits?
**A:**
- Nominatim: Temporary or permanent IP ban
- OSM Tiles: Service blocking without notice
- No warning system

### Q: How many users can this support?
**A:**
- **Development**: 5-10 concurrent users
- **Production**: Not recommended without changes
- **Limitation**: 1 geocoding request per second globally

### Q: Do I need an API key?
**A:** No, but:
- No guarantees or SLA
- Subject to policy changes
- Can be blocked at any time

### Q: Can I cache geocoding results?
**A:** Yes, **strongly recommended**:
- Reduces API load
- Improves performance
- Better user experience

### Q: Is offline mode supported?
**A:** No:
- Bulk tile downloading prohibited
- Geocoding requires internet
- Consider commercial services for offline use

---

## Additional Resources

### Official Documentation
- [Nominatim Usage Policy](https://operations.osmfoundation.org/policies/nominatim/)
- [OSM Tile Usage Policy](https://operations.osmfoundation.org/policies/tiles/)
- [OpenStreetMap Copyright](https://www.openstreetmap.org/copyright)

### Community Resources
- [OSM Foundation Operations](https://operations.osmfoundation.org/)
- [Nominatim GitHub](https://github.com/osm-search/Nominatim)
- [Switch2OSM Guide](https://switch2osm.org/)

### Support
- For service issues: https://github.com/openstreetmap/operations/issues
- For policy questions: operations@osmfoundation.org

---

**Last Updated**: 2025-10-06
**Review Frequency**: Quarterly or when policies change
