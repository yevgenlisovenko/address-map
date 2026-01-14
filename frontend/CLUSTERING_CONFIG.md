# Marker Clustering Configuration Guide

## Table of Contents

- [Overview](#overview)
- [Quick Start](#quick-start)
- [Configuration Reference](#configuration-reference)
- [Core Settings](#core-settings)
- [Type-Aware Clustering](#type-aware-clustering)
- [Performance Recommendations](#performance-recommendations)
- [Use Case Examples](#use-case-examples)
- [Visual Customization](#visual-customization)
- [Client-Specific Configuration](#client-specific-configuration)
- [Troubleshooting](#troubleshooting)

---

## Overview

### What is Marker Clustering?

Marker clustering is a performance optimization technique that groups nearby markers into single cluster icons. As users zoom in, clusters split into smaller clusters or individual markers.

**Benefits:**
- **Performance**: Dramatically improves rendering performance with large datasets
- **Visual Clarity**: Reduces map clutter by showing marker density instead of overlapping pins
- **User Experience**: Provides intuitive navigation with zoom-based detail levels
- **Type Awareness**: Shows dominant marker type colors for quick visual analysis

**When to Use:**
- ✅ Datasets with 200+ markers
- ✅ Geographically clustered data (cities, regions)
- ✅ Performance-critical applications
- ✅ Mobile/low-power devices
- ❌ Small datasets (<100 markers)
- ❌ When every marker must be individually visible

---

## Quick Start

### Enable Clustering

Edit `frontend/src/config/deployments/default.config.js`:

```javascript
export default {
  map: {
    clustering: {
      enabled: true,  // Toggle clustering on/off
    }
  }
}
```

### Disable Clustering

```javascript
export default {
  map: {
    clustering: {
      enabled: false,  // Show all markers individually
    }
  }
}
```

### Full Configuration Example

```javascript
export default {
  map: {
    clustering: {
      // Core settings
      enabled: true,
      maxClusterRadius: 80,
      disableClusteringAtZoom: 15,
      showCoverageOnHover: false,
      spiderfyOnMaxZoom: true,
      animate: true,
      chunkedLoading: true,

      // Type-aware clustering
      typeAware: {
        enabled: true,
        showMixedBadge: true,
        showTooltipBreakdown: true,
      }
    }
  }
}
```

---

## Configuration Reference

### Configuration Location

**Path**: `frontend/src/config/deployments/[deployment-name].config.js`

**Section**: `map.clustering`

**Default Config**: `frontend/src/config/deployments/default.config.js` (lines 267-283)

### Complete Structure

```javascript
clustering: {
  // Master toggle
  enabled: boolean,

  // Clustering behavior
  maxClusterRadius: number,             // pixels
  disableClusteringAtZoom: number,      // zoom level
  showCoverageOnHover: boolean,
  spiderfyOnMaxZoom: boolean,
  animate: boolean,
  chunkedLoading: boolean,

  // Type-aware visualization
  typeAware: {
    enabled: boolean,
    showMixedBadge: boolean,
    showTooltipBreakdown: boolean,
  }
}
```

---

## Core Settings

### `enabled`

**Type**: `boolean`
**Default**: `true`
**Purpose**: Master toggle for clustering feature

**Behavior:**
- `true`: Markers cluster together based on proximity
- `false`: All markers render individually (no clustering)

**Example:**
```javascript
clustering: {
  enabled: true   // Clustering active
}
```

**Use When:**
- You have 200+ markers
- Performance is a concern
- Visual clarity is important

**Disable When:**
- Dataset is small (<100 markers)
- Every marker must be visible individually
- Spatial relationships are critical

---

### `maxClusterRadius`

**Type**: `number` (pixels)
**Default**: `80`
**Range**: `40-120` recommended
**Purpose**: Maximum pixel distance between markers for clustering

**How It Works:**
- Measures screen pixel distance between markers
- Markers within this radius cluster together
- Larger values = more aggressive clustering

**Value Guide:**

| Value | Clustering Density | Best For |
|-------|-------------------|----------|
| `40-60` | Tight (many small clusters) | Urban areas, dense data |
| `70-90` | Balanced | General use, mixed density |
| `100-120` | Loose (few large clusters) | Rural areas, sparse data |

**Examples:**
```javascript
// Tight clustering - urban areas with many close markers
clustering: {
  maxClusterRadius: 50
}

// Balanced - default for most use cases
clustering: {
  maxClusterRadius: 80
}

// Aggressive - rural areas with sparse markers
clustering: {
  maxClusterRadius: 120
}
```

**Visual Impact:**
- **Low value (50px)**: More clusters, each with fewer markers
- **High value (120px)**: Fewer clusters, each with more markers

---

### `disableClusteringAtZoom`

**Type**: `number` (zoom level)
**Default**: `15`
**Range**: `12-18` typical
**Purpose**: Zoom level at which clustering stops and all individual markers appear

**Zoom Level Reference:**

| Zoom | View Level | Description |
|------|-----------|-------------|
| `4-6` | Country | Entire country visible |
| `7-10` | State/Region | State or large region |
| `11-13` | City | City-level view |
| `14-16` | Neighborhood | Street/neighborhood level |
| `17-18` | Building | Individual building level |

**Examples:**
```javascript
// Show individual markers at city level
clustering: {
  disableClusteringAtZoom: 13
}

// Default - neighborhood level
clustering: {
  disableClusteringAtZoom: 15
}

// Keep clustering at street level
clustering: {
  disableClusteringAtZoom: 17
}
```

**Choosing the Right Value:**
- **Lower (12-14)**: Users see individual markers sooner, better for detailed analysis
- **Higher (16-18)**: Keeps clustering longer, better for very large datasets

---

### `showCoverageOnHover`

**Type**: `boolean`
**Default**: `false`
**Purpose**: Show polygon outline of cluster coverage area on hover

**Visual:**
```
┌─────────────────┐
│    ╭──────╮     │  ← Polygon outline showing
│   │   25   │    │     geographic bounds of
│    ╰──────╯     │     all markers in cluster
└─────────────────┘
```

**Examples:**
```javascript
// Show coverage polygon
clustering: {
  showCoverageOnHover: true
}

// No coverage polygon (default)
clustering: {
  showCoverageOnHover: false
}
```

**Use When:**
- Analyzing geographic spread of clusters
- Understanding cluster boundaries
- Educational/presentation purposes

**Disable When:**
- Performance is critical
- Polygon adds visual clutter
- Not needed for your use case

---

### `spiderfyOnMaxZoom`

**Type**: `boolean`
**Default**: `true`
**Purpose**: Spread overlapping markers in a circular pattern when at max zoom

**Visual:**
```
Before Click:          After Click:
    [25]          📍────📍────📍
                        │
                      📍─┼─📍
                        │
                  📍────📍────📍
                  (Spider pattern)
```

**Examples:**
```javascript
// Enable spiderfy (recommended)
clustering: {
  spiderfyOnMaxZoom: true
}

// Disable spiderfy
clustering: {
  spiderfyOnMaxZoom: false
}
```

**Why Enable:**
- Essential for viewing markers at the same location
- Prevents permanent overlapping markers
- Improves accessibility to all markers

**Only Disable When:**
- You're certain no markers overlap at max zoom
- Custom logic handles overlapping markers

---

### `animate`

**Type**: `boolean`
**Default**: `true`
**Purpose**: Animate cluster split/merge when zooming

**Visual:**
```
Zoom In (Animated):
[100] → [50][50] → [25][25][25][25] → 📍📍📍...
      ↓         ↓                  ↓
   Smooth    Smooth             Smooth
   split     split              split
```

**Examples:**
```javascript
// Smooth animations (default)
clustering: {
  animate: true
}

// Instant changes (better performance)
clustering: {
  animate: false
}
```

**Trade-offs:**
- **Enabled**: Better UX, visual continuity, slight performance cost
- **Disabled**: Better performance, instant updates, less polished feel

**Disable When:**
- Dataset exceeds 5000 markers
- Targeting low-power devices
- Animation causes lag

---

### `chunkedLoading`

**Type**: `boolean`
**Default**: `true`
**Purpose**: Split marker rendering into multiple animation frames

**Technical:**
- Uses `requestAnimationFrame` to batch rendering
- Prevents UI blocking with large datasets
- Improves perceived performance

**Examples:**
```javascript
// Chunked rendering (recommended)
clustering: {
  chunkedLoading: true
}

// Render all at once
clustering: {
  chunkedLoading: false
}
```

**Performance Impact:**

| Markers | chunkedLoading: true | chunkedLoading: false |
|---------|---------------------|---------------------|
| 500 | Smooth loading | Minor lag |
| 1000 | Smooth loading | Noticeable lag |
| 5000+ | Smooth loading | UI freeze |

**Always Enable When:**
- Dataset exceeds 500 markers
- Supporting mobile devices
- Performance is important

---

## Type-Aware Clustering

Type-aware clustering uses marker types (HO3, HO4, HO6, partner icons, etc.) to intelligently color and label clusters.

### How It Works

1. **Type Detection**: Each marker is classified by type (e.g., HO3, HO4)
2. **Type Counting**: For each cluster, count markers per type
3. **Dominant Type**: Find the most common type
4. **Visual Application**: Apply dominant type's color to cluster icon
5. **Mixed Badge**: Show "+N" if cluster has multiple types
6. **Tooltip**: Display breakdown on hover

**Example:**
```
Cluster with:
- 8 HO3 markers (blue)
- 3 HO4 markers (orange)
- 2 HO6 markers (green)

Result:
┌──────────┐
│  [13]  │  ← Blue background (HO3 dominant)
│    +2    │  ← Orange badge (2 additional types)
└──────────┘

Hover shows:
  Cluster Breakdown
  🔵 HO3: 8
  🟠 HO4: 3
  🟢 HO6: 2
```

### Available Marker Types

**Form Types:**

| Icon ID | Label | Color | Hex Code |
|---------|-------|-------|----------|
| `ho3` | HO3 | Blue | #3388ff |
| `ho4` | HO4 | Orange | #ff8800 |
| `ho6` | HO6 | Green | #88cc00 |
| `hf9` | HF9 | Purple | #cc3388 |

**Partner Types:**

| Icon ID | Label | Color | Hex Code |
|---------|-------|-------|----------|
| `blueH` | Partner H | Blue | #3388ff |
| `greenP` | Partner P | Green | #00cc44 |
| `redA` | Partner A | Red | #ff4444 |
| `violetO` | Partner O | Violet | #cc44cc |
| `yellowG` | Partner G | Yellow | #ffcc00 |

**Generic Colors:**

| Icon ID | Color | Hex Code |
|---------|-------|----------|
| `blue` | Blue | #3388ff |
| `gold` | Gold | #ffd700 |
| `red` | Red | #ff4444 |
| `green` | Green | #44ff44 |
| `orange` | Orange | #ff8800 |
| `yellow` | Yellow | #ffff00 |
| `violet` | Violet | #cc44cc |
| `grey` | Grey | #888888 |
| `black` | Black | #333333 |

### Type Detection Logic

Located in: `frontend/src/config/markerColorMapping.js:311-332`

```javascript
export function getMarkerType(marker) {
  // 1. Check if marker has properties
  if (!marker.properties) return 'default';

  // 2. Loop through PROPERTY_ICON_CONFIG (e.g., formCode, partnerName)
  for (const [propertyName, valueToIconMap] of Object.entries(PROPERTY_ICON_CONFIG)) {
    if (marker.properties[propertyName] !== undefined) {
      const propertyValue = marker.properties[propertyName];
      const iconData = valueToIconMap[propertyValue];

      // 3. Return icon ID as type identifier
      if (iconData?.iconId) {
        return iconData.iconId;  // e.g., 'ho3', 'ho4'
      }
    }
  }

  // 4. Fallback
  return 'default';
}
```

**Example Marker:**
```javascript
{
  id: 123,
  lat: 38.5,
  lon: -90.5,
  properties: {
    formCode: 'HO3'  // ← Detected as type 'ho3' (blue)
  }
}
```

---

### `typeAware.enabled`

**Type**: `boolean`
**Default**: `true`
**Purpose**: Enable type-aware cluster icons with dominant type colors

**Examples:**
```javascript
// Type-aware clusters (recommended)
clustering: {
  typeAware: {
    enabled: true
  }
}

// Default blue clusters
clustering: {
  typeAware: {
    enabled: false
  }
}
```

**Visual Comparison:**

**Enabled:**
```
Cluster with mostly HO3 (blue):
┌──────────┐
│  [13]  │  ← Blue background
└──────────┘

Cluster with mostly HO4 (orange):
┌──────────┐
│  [13]  │  ← Orange background
└──────────┘
```

**Disabled:**
```
All clusters same color:
┌──────────┐
│  [13]  │  ← Default blue
└──────────┘
```

**Use When:**
- You have multiple marker types
- Visual type analysis is important
- Quick pattern recognition is valuable

---

### `typeAware.showMixedBadge`

**Type**: `boolean`
**Default**: `true`
**Purpose**: Show "+N" badge on clusters containing multiple marker types

**Visual:**
```
Single Type Cluster:        Mixed Type Cluster:
┌──────────┐                ┌──────────┐
│    8     │                │   13   +2│ ← Badge shows 2 additional types
└──────────┘                └──────────┘
```

**Badge Calculation:**
```
Cluster with 3 different types:
- HO3: 8 markers (dominant)
- HO4: 3 markers
- HO6: 2 markers

Badge: +2 (because 3 total types - 1 dominant = 2 additional)
```

**Examples:**
```javascript
// Show mixed badge (recommended)
clustering: {
  typeAware: {
    enabled: true,
    showMixedBadge: true
  }
}

// No badge
clustering: {
  typeAware: {
    enabled: true,
    showMixedBadge: false
  }
}
```

**Use When:**
- Marker diversity is important
- Users need to identify mixed clusters quickly
- Type distribution analysis is needed

---

### `typeAware.showTooltipBreakdown`

**Type**: `boolean`
**Default**: `true`
**Purpose**: Show detailed type breakdown on cluster hover

**Visual:**
```
Hover over cluster:

┌─────────────────────┐
│ Cluster Breakdown   │
├─────────────────────┤
│ 🔵 HO3:          8  │
│ 🟠 HO4:          3  │
│ 🟢 HO6:          2  │
└─────────────────────┘
```

**Examples:**
```javascript
// Show tooltip breakdown (recommended)
clustering: {
  typeAware: {
    enabled: true,
    showTooltipBreakdown: true
  }
}

// No tooltip
clustering: {
  typeAware: {
    enabled: true,
    showTooltipBreakdown: false
  }
}
```

**Tooltip Features:**
- Sorted by count (most common first)
- Color dot for each type
- Type label and count
- Clean, readable layout

**Disable When:**
- Performance is critical (tooltip generation has small overhead)
- Screen space is limited
- Users don't need detailed breakdowns

---

## Performance Recommendations

### Small Datasets (<200 markers)

**Recommendation**: Disable clustering

```javascript
clustering: {
  enabled: false
}
```

**Reasoning:**
- Clustering overhead outweighs benefits
- Individual markers are performant
- Better user experience without clustering

---

### Medium Datasets (200-1,000 markers)

**Recommendation**: Balanced configuration

```javascript
clustering: {
  enabled: true,
  maxClusterRadius: 80,
  disableClusteringAtZoom: 15,
  showCoverageOnHover: false,
  spiderfyOnMaxZoom: true,
  animate: true,
  chunkedLoading: true,

  typeAware: {
    enabled: true,
    showMixedBadge: true,
    showTooltipBreakdown: true,
  }
}
```

**Performance:**
- Smooth on all devices
- Animations enabled
- Full feature set

---

### Large Datasets (1,000-5,000 markers)

**Recommendation**: Performance-optimized

```javascript
clustering: {
  enabled: true,
  maxClusterRadius: 100,              // More aggressive clustering
  disableClusteringAtZoom: 16,        // Keep clustering longer
  showCoverageOnHover: false,         // Reduce hover overhead
  spiderfyOnMaxZoom: true,
  animate: true,
  chunkedLoading: true,               // Essential

  typeAware: {
    enabled: true,
    showMixedBadge: true,
    showTooltipBreakdown: true,       // Small overhead, keep if valuable
  }
}
```

**Optimizations:**
- Larger cluster radius reduces cluster count
- Higher zoom threshold keeps clustering active
- Coverage hover disabled for performance

---

### Very Large Datasets (5,000+ markers)

**Recommendation**: Maximum performance

```javascript
clustering: {
  enabled: true,
  maxClusterRadius: 120,              // Maximum clustering
  disableClusteringAtZoom: 17,        // Almost never unclustered
  showCoverageOnHover: false,         // Disabled for performance
  spiderfyOnMaxZoom: true,
  animate: false,                     // Disable animations
  chunkedLoading: true,               // Critical

  typeAware: {
    enabled: true,
    showMixedBadge: false,            // Reduce rendering complexity
    showTooltipBreakdown: false,      // Disable tooltip generation
  }
}
```

**Critical Optimizations:**
- Animations disabled (prevents lag during zoom)
- Maximum cluster radius (fewest clusters)
- Tooltips disabled (avoid hover overhead)
- Clustering almost always active

**Expected Performance:**
- Smooth on desktop
- Acceptable on mobile
- No UI freezing

---

## Use Case Examples

### Urban Area (Dense Markers)

**Scenario**: City with hundreds of closely-spaced markers

```javascript
clustering: {
  enabled: true,
  maxClusterRadius: 50,               // Tight clustering
  disableClusteringAtZoom: 14,        // Show individuals at city level
  spiderfyOnMaxZoom: true,            // Essential for overlapping markers
  animate: true,

  typeAware: {
    enabled: true,
    showMixedBadge: true,
    showTooltipBreakdown: true,
  }
}
```

**Why:**
- Low radius prevents over-clustering dense areas
- Earlier zoom threshold for detail
- Spiderfy handles overlaps

---

### Rural Area (Sparse Markers)

**Scenario**: Large geographic area with widely-spread markers

```javascript
clustering: {
  enabled: true,
  maxClusterRadius: 120,              // Aggressive clustering
  disableClusteringAtZoom: 16,        // Keep clustering longer
  spiderfyOnMaxZoom: true,
  animate: true,

  typeAware: {
    enabled: true,
    showMixedBadge: true,
    showTooltipBreakdown: true,
  }
}
```

**Why:**
- High radius groups distant markers
- Higher zoom threshold maintains clustering
- Better visual representation of sparse data

---

### Type Analysis

**Scenario**: Analyzing distribution of different marker types

```javascript
clustering: {
  enabled: true,
  maxClusterRadius: 80,
  disableClusteringAtZoom: 15,
  spiderfyOnMaxZoom: true,
  animate: true,

  typeAware: {
    enabled: true,                    // Critical for analysis
    showMixedBadge: true,             // Highlight diversity
    showTooltipBreakdown: true,       // Detailed breakdown needed
  }
}
```

**Why:**
- Type-aware features essential
- Mixed badge shows type diversity
- Tooltip provides exact counts

---

### Performance-Critical (Slow Devices)

**Scenario**: Mobile devices or old computers

```javascript
clustering: {
  enabled: true,
  maxClusterRadius: 120,              // Fewer clusters
  disableClusteringAtZoom: 17,        // Keep clustering active
  showCoverageOnHover: false,         // No extra rendering
  spiderfyOnMaxZoom: true,
  animate: false,                     // No animation overhead
  chunkedLoading: true,               // Essential

  typeAware: {
    enabled: false,                   // Reduce complexity
    showMixedBadge: false,
    showTooltipBreakdown: false,
  }
}
```

**Why:**
- Maximum clustering reduces marker count
- Animations disabled
- Type-aware features disabled for simplicity
- Chunked loading prevents freezing

---

### Real-Time Updates

**Scenario**: Markers frequently added/removed in real-time

```javascript
clustering: {
  enabled: true,
  maxClusterRadius: 80,
  disableClusteringAtZoom: 15,
  spiderfyOnMaxZoom: true,
  animate: true,                      // Smooth updates
  chunkedLoading: true,

  typeAware: {
    enabled: true,
    showMixedBadge: true,
    showTooltipBreakdown: true,
  }
}
```

**Why:**
- Animations make updates smooth
- Chunked loading handles batch updates
- Type-aware shows changing distributions

---

## Visual Customization

### Cluster Icon Sizes

Clusters automatically size based on marker count:

| Size | Marker Count | Diameter | CSS Class |
|------|-------------|----------|-----------|
| Small | 1-10 | 40px | `.marker-cluster-small` |
| Medium | 11-100 | 47px | `.marker-cluster-medium` |
| Large | 100+ | 55px | `.marker-cluster-large` |

### Cluster Appearance

**File**: `frontend/src/styles/ClusterStyles.css`

**Base Structure:**
```css
.marker-cluster-smart {
  /* Container for cluster */
}

.cluster-inner {
  /* Circular cluster background */
  background-color: <dominant-type-color>;  /* Dynamic */
  border-radius: 50%;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.2);
}

.cluster-count {
  /* Number display */
  color: white;
  font-weight: 700;
}

.cluster-mixed-badge {
  /* +N badge for mixed types */
  background: #ff6b00;
  border-radius: 10px;
}
```

### Customizing Cluster Colors

Cluster colors are defined in `frontend/src/config/markerColorMapping.js:339-440`:

```javascript
export const MARKER_TYPE_CONFIG = {
  ho3: {
    color: '#3388ff',      // Cluster background color
    rgb: { r: 51, g: 136, b: 255 },
    label: 'HO3',
  },
  // ... other types
};
```

**To change colors:**
1. Edit `MARKER_TYPE_CONFIG` in `markerColorMapping.js`
2. Update both `color` (hex) and `rgb` values
3. Changes apply to both markers and clusters

### Customizing Hover Effects

**File**: `frontend/src/styles/ClusterStyles.css`

```css
/* Default hover effect */
.marker-cluster-smart:hover .cluster-inner {
  transform: scale(1.1);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
}

/* Custom hover - pulse effect */
.marker-cluster-smart:hover .cluster-inner {
  animation: pulse 0.5s ease-in-out;
}

@keyframes pulse {
  0%, 100% { transform: scale(1); }
  50% { transform: scale(1.15); }
}
```

### Customizing Tooltip Style

```css
/* Cluster tooltip */
.cluster-tooltip {
  background: rgba(255, 255, 255, 0.98) !important;
  border: 1px solid #ccc !important;
  border-radius: 8px !important;
  min-width: 180px;
}

/* Custom style - dark theme */
.cluster-tooltip {
  background: rgba(30, 30, 30, 0.95) !important;
  border: 1px solid #555 !important;
  color: white !important;
}

.cluster-tooltip-label {
  color: #ccc !important;
}
```

### Customizing Mixed Badge

```css
/* Default badge - orange */
.cluster-mixed-badge {
  background: #ff6b00;
  color: white;
}

/* Custom badge - green */
.cluster-mixed-badge {
  background: #00cc44;
  color: white;
  font-weight: 800;
}
```

---

## Client-Specific Configuration

### Creating Custom Deployment Configs

**Step 1: Create Config File**

Create `frontend/src/config/deployments/client-name.config.js`:

```javascript
import defaultConfig from './default.config.js';

export default {
  // Inherit all default settings
  ...defaultConfig,

  // Override only clustering settings
  map: {
    ...defaultConfig.map,
    clustering: {
      enabled: true,
      maxClusterRadius: 100,        // Custom value
      disableClusteringAtZoom: 14,  // Custom value
      showCoverageOnHover: false,
      spiderfyOnMaxZoom: true,
      animate: true,
      chunkedLoading: true,

      typeAware: {
        enabled: true,
        showMixedBadge: false,      // Disabled for this client
        showTooltipBreakdown: true,
      }
    }
  }
};
```

**Step 2: Register Config**

Edit `frontend/src/config/markerColorMapping.js:111-114`:

```javascript
const DEPLOYMENT_CONFIGS = {
  default: defaultConfig,
  'client-a': clientAConfig,
  'client-name': clientNameConfig,  // Add new config
};
```

**Step 3: Environment Variable**

Create `frontend/.env.client-name`:

```bash
VITE_DEPLOYMENT_CONFIG=client-name
VITE_BACKEND_URL=http://localhost:3001
# ... other env vars
```

**Step 4: Build Command**

Add to `frontend/package.json`:

```json
{
  "scripts": {
    "dev:client-name": "vite --mode client-name",
    "dev:client-name:3000": "vite --mode client-name --port 3000",
    "build:client-name": "vite build --mode client-name"
  }
}
```

**Step 5: Run**

```bash
# Development
npm run dev:client-name

# Production build
npm run build:client-name
```

### Multiple Client Examples

**Client A - Urban Focus**
```javascript
// client-a.config.js
clustering: {
  maxClusterRadius: 50,
  disableClusteringAtZoom: 13,
}
```

**Client B - Rural Focus**
```javascript
// client-b.config.js
clustering: {
  maxClusterRadius: 120,
  disableClusteringAtZoom: 16,
}
```

**Client C - Performance First**
```javascript
// client-c.config.js
clustering: {
  maxClusterRadius: 150,
  animate: false,
  typeAware: { enabled: false }
}
```

---

## Troubleshooting

### Clusters Not Appearing

**Symptom**: All markers show individually, no clusters

**Possible Causes:**
1. Clustering disabled: `enabled: false`
2. Zoom level too high: Current zoom ≥ `disableClusteringAtZoom`
3. Markers too far apart: Increase `maxClusterRadius`
4. Not enough markers: Need at least 2 markers close together

**Solutions:**
```javascript
// Check config
clustering: {
  enabled: true,  // ✓ Must be true
  maxClusterRadius: 120,  // ✓ Try higher value
  disableClusteringAtZoom: 18,  // ✓ Try higher zoom level
}
```

### Clusters Wrong Color

**Symptom**: Clusters show wrong color or always blue

**Possible Causes:**
1. Type-aware disabled: `typeAware.enabled: false`
2. Markers missing `properties`: Type detection fails
3. Property not in `markerIconMapping`: No type match

**Solutions:**
```javascript
// Enable type-aware
clustering: {
  typeAware: {
    enabled: true  // ✓ Must be true
  }
}

// Check marker structure
{
  id: 123,
  lat: 38.5,
  lon: -90.5,
  properties: {
    formCode: 'HO3'  // ✓ Property must exist
  }
}

// Check mapping exists
markerIconMapping: {
  formCode: {
    HO3: { icon: 'ho3', label: 'HO3' }  // ✓ Must be defined
  }
}
```

### Mixed Badge Not Showing

**Symptom**: No "+N" badge on mixed clusters

**Possible Causes:**
1. Badge disabled: `showMixedBadge: false`
2. Type-aware disabled: `typeAware.enabled: false`
3. Cluster has only one type: Badge only shows for 2+ types

**Solutions:**
```javascript
clustering: {
  typeAware: {
    enabled: true,        // ✓ Required
    showMixedBadge: true  // ✓ Must be true
  }
}
```

### Tooltip Not Showing

**Symptom**: No hover tooltip on clusters

**Possible Causes:**
1. Tooltip disabled: `showTooltipBreakdown: false`
2. Type-aware disabled: `typeAware.enabled: false`
3. CSS class conflict: `.cluster-tooltip` overridden

**Solutions:**
```javascript
clustering: {
  typeAware: {
    enabled: true,              // ✓ Required
    showTooltipBreakdown: true  // ✓ Must be true
  }
}
```

### Performance Issues

**Symptom**: Map is laggy, slow zoom/pan

**Possible Causes:**
1. Too many clusters: Reduce `maxClusterRadius`
2. Animations enabled: Disable `animate`
3. Large dataset: Increase clustering aggressiveness
4. Chunked loading disabled: Enable `chunkedLoading`

**Solutions:**
```javascript
clustering: {
  maxClusterRadius: 120,    // ✓ Higher = fewer clusters
  animate: false,           // ✓ Disable for performance
  chunkedLoading: true,     // ✓ Always enable for large datasets
  disableClusteringAtZoom: 18,  // ✓ Higher = clustering stays active

  typeAware: {
    enabled: false,         // ✓ Consider disabling for max performance
    showTooltipBreakdown: false
  }
}
```

### Spiderfy Not Working

**Symptom**: Overlapping markers don't spread out

**Possible Causes:**
1. Spiderfy disabled: `spiderfyOnMaxZoom: false`
2. Not at max zoom: Feature only works at `disableClusteringAtZoom`
3. Markers not in cluster: Need 2+ markers in same cluster

**Solutions:**
```javascript
clustering: {
  spiderfyOnMaxZoom: true,        // ✓ Must be true
  disableClusteringAtZoom: 15,    // ✓ Spiderfy activates at this zoom
}

// Then zoom to level 15+ and click cluster
```

### Clusters Disappear on Zoom

**Symptom**: Clusters vanish when zooming

**Possible Causes:**
1. Reached `disableClusteringAtZoom`: Expected behavior
2. Animation glitch: Try disabling `animate`

**Solutions:**
```javascript
// To keep clustering at higher zooms
clustering: {
  disableClusteringAtZoom: 18  // ✓ Increase to keep clusters longer
}

// If visual glitch
clustering: {
  animate: false  // ✓ Try disabling animation
}
```

---

## Additional Resources

### Related Files

- **Configuration**: `frontend/src/config/deployments/*.config.js`
- **Type Detection**: `frontend/src/config/markerColorMapping.js`
- **Cluster Utilities**: `frontend/src/utils/clusterUtils.js`
- **Map Integration**: `frontend/src/components/map/Map.jsx`
- **Styles**: `frontend/src/styles/ClusterStyles.css`

### Performance Monitoring

```javascript
// Monitor cluster count in browser console
map.on('zoomend', () => {
  const clusters = document.querySelectorAll('.marker-cluster-smart');
  console.log(`Zoom ${map.getZoom()}: ${clusters.length} clusters`);
});
```

### Further Customization

For advanced customization beyond this guide:
1. Review `react-leaflet-cluster` documentation
2. Examine `frontend/src/utils/clusterUtils.js` for icon creation logic
3. Modify `ClusterStyles.css` for visual changes
4. Update `MARKER_TYPE_CONFIG` for new marker types

---

## Quick Reference

### Performance Cheat Sheet

| Dataset Size | maxClusterRadius | disableClusteringAtZoom | animate | chunkedLoading |
|--------------|------------------|-------------------------|---------|----------------|
| <200 | Disable clustering | - | - | - |
| 200-1K | 80 | 15 | true | true |
| 1K-5K | 100 | 16 | true | true |
| 5K+ | 120 | 17 | false | true |

### Common Configurations

```javascript
// Disable clustering completely
{ enabled: false }

// Default balanced
{ enabled: true, maxClusterRadius: 80, disableClusteringAtZoom: 15 }

// Urban dense
{ enabled: true, maxClusterRadius: 50, disableClusteringAtZoom: 14 }

// Rural sparse
{ enabled: true, maxClusterRadius: 120, disableClusteringAtZoom: 16 }

// Maximum performance
{ enabled: true, maxClusterRadius: 150, animate: false, typeAware: { enabled: false } }
```

---

**Document Version**: 1.0
**Last Updated**: 2025-12-03
**Related Features**: Marker Clustering, Type-Aware Visualization, Performance Optimization
