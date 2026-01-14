# Deployment Icon Configurations

This directory contains deployment-specific icon configuration files for the Real-Time Map application.

## Overview

Different deployments (clients, environments) can have different marker icon mappings without changing the application code. This is achieved through build-time configuration using environment variables.

## How It Works

1. **Environment Variable:** Set `VITE_DEPLOYMENT_CONFIG` to specify which config to use
2. **Build Time:** During build, Vite loads the corresponding config file
3. **Icon Mapping:** Config maps property values to icon IDs, which are then resolved to actual icons

## Available Icon IDs

The following icon IDs can be used in your config files:

### Form-Specific Icons:
- `ho3` - Homeowners (HO3)
- `ho4` - Renters (HO4)
- `ho6` - Condo (HO6)
- `hf9` - Second Home (HF9)

### Generic Color Icons:
- `blue` - Blue marker
- `gold` - Gold marker
- `red` - Red marker
- `green` - Green marker
- `orange` - Orange marker
- `yellow` - Yellow marker
- `violet` - Violet marker
- `grey` - Grey marker (default)
- `black` - Black marker

## Creating a New Deployment Config

### Step 1: Create Config File

Create a new file: `[deployment-name].config.js`

```javascript
/**
 * My Deployment Configuration
 *
 * Description of what makes this deployment unique.
 *
 * Last updated: YYYY-MM-DD
 */

export default {
  // Property name from marker.properties
  formCode: {
    // Property value → icon configuration
    HO3: {
      icon: 'ho3',              // Icon ID from ICON_REGISTRY
      label: 'Homeowners (HO3)', // Display label
    },
    HO4: {
      icon: 'ho4',
      label: 'Renters (HO4)',
    },
  },

  // You can map multiple properties
  state: {
    CA: {
      icon: 'gold',
      label: 'California',
    },
    TX: {
      icon: 'blue',
      label: 'Texas',
    },
  },
};
```

### Step 2: Create Environment File

Create `.env.[deployment-name]`:

```bash
VITE_DEPLOYMENT_CONFIG=[deployment-name]
```

### Step 3: Add Build Script (Optional)

In `package.json`:

```json
{
  "scripts": {
    "build:[deployment-name]": "vite build --mode [deployment-name]"
  }
}
```

### Step 4: Build

```bash
npm run build:[deployment-name]
```

Or manually:

```bash
VITE_DEPLOYMENT_CONFIG=[deployment-name] npm run build
```

## Configuration Structure

### Full Example

```javascript
export default {
  // Property name from marker.properties
  propertyName: {
    // Property value → configuration
    value1: {
      icon: 'icon-id',  // Required: Icon ID from ICON_REGISTRY
      label: 'Display Label', // Required: Human-readable label
      // Future: Add more metadata here
      // color: '#FF5733',
      // priority: 'high',
    },
    value2: {
      icon: 'another-icon-id',
      label: 'Another Label',
    },
  },
};
```

## Examples

### Example 1: Client with Limited Form Codes

```javascript
// client-simple.config.js
export default {
  formCode: {
    HO3: { icon: 'ho3', label: 'Homeowners' },
    HO4: { icon: 'ho4', label: 'Renters' },
    // Only these two form codes are used
  },
};
```

### Example 2: Client with Different Property Names

```javascript
// client-custom.config.js
export default {
  policyType: {  // Different property name!
    STANDARD: { icon: 'blue', label: 'Standard Policy' },
    PREMIUM: { icon: 'gold', label: 'Premium Policy' },
    BASIC: { icon: 'grey', label: 'Basic Coverage' },
  },
};
```

### Example 3: Multiple Properties

```javascript
// client-multi.config.js
export default {
  formCode: {
    HO3: { icon: 'ho3', label: 'Homeowners' },
  },
  priority: {
    HIGH: { icon: 'red', label: 'High Priority' },
    MEDIUM: { icon: 'orange', label: 'Medium Priority' },
    LOW: { icon: 'green', label: 'Low Priority' },
  },
};
```

## Fallback Behavior

If `VITE_DEPLOYMENT_CONFIG` is not set or the specified config file doesn't exist, the system falls back to `default.config.js`.

## Best Practices

1. **Document your config:** Add comments explaining why this deployment is unique
2. **Use semantic labels:** Make labels meaningful to end users
3. **Keep it simple:** Only configure what's actually needed
4. **Test before deploying:** Run `npm run build:[deployment]` to verify
5. **Version control:** Commit config files to track changes over time

## Troubleshooting

### Error: "Unknown icon: [icon-id]"

**Cause:** The icon ID in your config doesn't exist in ICON_REGISTRY.

**Solution:** Check the "Available Icon IDs" list above and use a valid icon ID.

### Error: "Config [deployment-name] not found"

**Cause:** No config file named `[deployment-name].config.js` exists.

**Solution:** Create the config file or check for typos in the filename.

### Icons not changing

**Cause:** Environment variable not being loaded.

**Solution:**
- Ensure `.env.[deployment-name]` exists
- Restart dev server after creating .env file
- For production, rebuild with correct --mode flag

## Migration from Old System

The old system used `PROPERTY_MARKERS_MAP` and `PROPERTY_ICON_URLS` directly in code. These are now deprecated but still work for backward compatibility.

**Old way:**
```javascript
// Hard-coded in markerColorMapping.js
export const PROPERTY_MARKERS_MAP = {
  formCode: {
    HO3: { icon: ho3MarkerIcon, label: 'Homeowners (HO3)' },
  },
};
```

**New way:**
```javascript
// Configurable via deployments/[name].config.js
export default {
  formCode: {
    HO3: { icon: 'ho3', label: 'Homeowners (HO3)' },
  },
};
```

## Questions?

If you need help creating a new deployment configuration, refer to the examples above or ask a team member.
