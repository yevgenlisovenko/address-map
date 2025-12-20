# Field Injection Configuration

This directory contains field injection configurations for different deployments.

## How It Works

Field injection enriches database rows with derived fields using lookup maps:
- **Input**: Database row with `partnerId: "2"`
- **Lookup**: Map `"2"` → `"State Farm"`
- **Output**: Pin properties with both `partnerId: "2"` AND `partnerName: "State Farm"`

Performance: O(1) lookups, <0.1ms per row, all in-memory.

## Configuration Files

- **default.json**: Default/empty configuration (no field injection)
- **client-a.json**: Example configuration with partner/region/status lookups
- **[custom].json**: Create your own deployment-specific configs

## File Structure

```json
{
  "lookups": {
    "sourceField": {
      "targetField": "injectedFieldName",
      "defaultValue": "Fallback value if key not found",
      "map": {
        "sourceValue1": "injectedValue1",
        "sourceValue2": "injectedValue2"
      }
    }
  }
}
```

## Example

```json
{
  "lookups": {
    "partnerId": {
      "targetField": "partnerName",
      "defaultValue": "Unknown Partner",
      "map": {
        "1": "GEICO",
        "2": "State Farm",
        "3": "Allstate"
      }
    }
  }
}
```

**Database row**:
```javascript
{ id: 123, partnerId: "2", latitude: 40.7, longitude: -74.0 }
```

**Resulting pin properties**:
```javascript
{
  partnerId: "2",
  partnerName: "State Farm"  // ← Injected field
}
```

## Usage

Set the `DEPLOYMENT_CONFIG` environment variable to select a configuration:

```bash
# Use default.json
DEPLOYMENT_CONFIG=default

# Use client-a.json
DEPLOYMENT_CONFIG=client-a

# Use custom.json
DEPLOYMENT_CONFIG=custom
```

## Creating New Configurations

1. Copy `default.json` or `client-a.json` as a template
2. Name it `{deployment-name}.json`
3. Define your lookup maps
4. Set `DEPLOYMENT_CONFIG={deployment-name}` in `.env`
5. Restart the backend server

## Validation

- JSON must be valid (use a JSON validator)
- Must have top-level `"lookups"` object
- Each lookup must have `targetField` and `map` properties
- `defaultValue` is optional but recommended
- Source and target fields can be any valid JavaScript property name

## Notes

- **Multiple lookups**: You can define unlimited lookup maps per file
- **Default values**: Used when source value not found in map
- **Null safety**: Missing or null source fields are skipped (no error)
- **Version control**: These JSON files should be committed to Git
- **No size limits**: Unlike environment variables, JSON files can be any size
