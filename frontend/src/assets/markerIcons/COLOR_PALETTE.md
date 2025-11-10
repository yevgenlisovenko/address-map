# Leaflet Marker Icon Color Palette

This document contains the color palette for leaflet marker icons, including both existing colors from the [leaflet-color-markers](https://github.com/pointhi/leaflet-color-markers) library and additional suggested colors following the same pattern.

## Pattern Analysis

The marker icons follow a consistent pattern:
- **Color Inside**: The main vibrant color (for visibility)
- **Color Outside**: A darker border (~20-25% darker, for definition and contrast)

This creates depth and makes icons stand out on any map background.

---

## Existing Colors (Available in leaflet-color-markers)

These colors are already available in the repository and currently exist in our `markerIcons` folder:

| Color | Color Inside | Color Outside | File Name |
|-------|--------------|---------------|-----------|
| Blue | #2A81CB | #3274A3 | marker-icon-2x-blue.png |
| Gold | #FFD326 | #C1A32D | marker-icon-2x-gold.png |
| Red | #CB2B3E | #982E40 | marker-icon-2x-red.png |
| Green | #2AAD27 | #31882A | marker-icon-2x-green.png |
| Orange | #CB8427 | #98652E | marker-icon-2x-orange.png |
| Yellow | #CAC428 | #988F2E | marker-icon-2x-yellow.png |
| Violet | #9C2BCB | #742E98 | marker-icon-2x-violet.png |
| Grey | #7B7B7B | #6B6B6B | marker-icon-2x-grey.png |
| Black | #3D3D3D | #313131 | marker-icon-2x-black.png |

---

## Additional Suggested Colors

These colors follow the same pattern and can be used to create custom marker icons:

| Color | Color Inside | Color Outside | Description |
|-------|--------------|---------------|-------------|
| **Pink** | #FF69B4 | #C14A85 | Hot pink/vibrant pink |
| **Magenta** | #FF00FF | #BF00BF | Pure magenta/fuchsia |
| **Purple** | #9B30FF | #7424BF | Purple (brighter than violet) |
| **Cyan** | #00CED1 | #009B9D | Bright cyan |
| **Teal** | #20B2AA | #18857F | Teal/turquoise |
| **Brown** | #8B4513 | #68340E | Saddle brown |
| **White** | #FFFFFF | #BFBFBF | White with grey border |
| **Lime** | #32CD32 | #259A25 | Lime green |
| **Indigo** | #4B0082 | #380062 | Deep indigo |
| **Navy** | #1E4D8B | #173968 | Navy blue |
| **Maroon** | #B03060 | #842448 | Maroon/burgundy |
| **Olive** | #808000 | #606000 | Olive/khaki |
| **Sky** | #87CEEB | #659BB0 | Sky blue |
| **Coral** | #FF7F50 | #BF5F3C | Coral/salmon |
| **Lavender** | #9B7FBF | #745F8F | Light purple |

---

## Creating Custom Marker Icons

To create custom marker icons following this pattern:

### Method 1: Download from leaflet-color-markers
Check if additional colors are available at: https://github.com/pointhi/leaflet-color-markers

### Method 2: Use Image Editing Tools
1. Take an existing marker icon (e.g., `marker-icon-2x-blue.png`)
2. Use tools like:
   - **Photopea** (https://www.photopea.com/) - Free online Photoshop alternative
   - **GIMP** - Free desktop image editor
   - **ImageMagick** - Command-line for batch recoloring

3. Apply color replacement:
   - Replace the "Color Inside" areas with your new inside color
   - Replace the "Color Outside" areas with your new outside color (darker version)

### Method 3: SVG-based Generation
Create an SVG template with the marker shape and programmatically generate PNGs with different colors.

---

## Pattern Formula

For creating custom colors:

1. **Choose your base "Color Inside"** (vibrant, saturated color)
2. **Calculate "Color Outside":**
   - For RGB: Reduce each channel by ~20-25%
   - For HSL: Reduce Lightness by ~20-25%, slightly adjust Saturation
3. **Ensure contrast:** The outside color should be noticeably darker for definition

### Example Calculation (Blue):
- Inside: `#2A81CB` → RGB(42, 129, 203)
- Outside: `#3274A3` → RGB(50, 116, 163)
- Reduction: R: 42→50 (+19%), G: 129→116 (-10%), B: 203→163 (-20%)

*(Note: The pattern may adjust individual RGB channels to maintain visual harmony)*

---

## Usage in Code

After creating new marker icons, add them to `markerColorMapping.js`:

```javascript
import newColorMarkerIcon from '../assets/markerIcons/marker-icon-2x-newcolor.png';

export const NEW_COLOR_MARKER = L.icon({
  iconUrl: newColorMarkerIcon,
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowUrl: markerShadow,
  shadowSize: [41, 41]
});
```

Then add to `ICON_REGISTRY`:

```javascript
const ICON_REGISTRY = {
  // ... existing colors
  newcolor: { icon: NEW_COLOR_MARKER, url: newColorMarkerIcon },
};
```

---

**Last Updated:** 2025-01-09
