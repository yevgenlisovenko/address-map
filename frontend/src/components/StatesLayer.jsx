import { useEffect, useState } from 'react';
import { GeoJSON } from 'react-leaflet';
import usStatesGeoJson from '../assets/geoJSON/us-states.json';

// Mapping from GeoJSON property names to state abbreviations
const STATE_NAME_TO_ABBR = {
  'Alabama': 'AL',
  'Alaska': 'AK',
  'Arizona': 'AZ',
  'Arkansas': 'AR',
  'California': 'CA',
  'Colorado': 'CO',
  'Connecticut': 'CT',
  'Delaware': 'DE',
  'Florida': 'FL',
  'Georgia': 'GA',
  'Hawaii': 'HI',
  'Idaho': 'ID',
  'Illinois': 'IL',
  'Indiana': 'IN',
  'Iowa': 'IA',
  'Kansas': 'KS',
  'Kentucky': 'KY',
  'Louisiana': 'LA',
  'Maine': 'ME',
  'Maryland': 'MD',
  'Massachusetts': 'MA',
  'Michigan': 'MI',
  'Minnesota': 'MN',
  'Mississippi': 'MS',
  'Missouri': 'MO',
  'Montana': 'MT',
  'Nebraska': 'NE',
  'Nevada': 'NV',
  'New Hampshire': 'NH',
  'New Jersey': 'NJ',
  'New Mexico': 'NM',
  'New York': 'NY',
  'North Carolina': 'NC',
  'North Dakota': 'ND',
  'Ohio': 'OH',
  'Oklahoma': 'OK',
  'Oregon': 'OR',
  'Pennsylvania': 'PA',
  'Rhode Island': 'RI',
  'South Carolina': 'SC',
  'South Dakota': 'SD',
  'Tennessee': 'TN',
  'Texas': 'TX',
  'Utah': 'UT',
  'Vermont': 'VT',
  'Virginia': 'VA',
  'Washington': 'WA',
  'West Virginia': 'WV',
  'Wisconsin': 'WI',
  'Wyoming': 'WY',
  'District of Columbia': 'DC'
};

/**
 * StatesLayer component
 * Renders US states as GeoJSON layer with dynamic coloring
 * @param {Object} stateColors - Object mapping state abbreviations to colors
 */
export default function StatesLayer({ stateColors }) {
  const [key, setKey] = useState(0);

  // Force re-render when colors change
  // This ensures the layer updates when state colors are modified
  useEffect(() => {
    setKey(prev => prev + 1);
  }, [stateColors]);

  /**
   * Style function for each state feature
   * @param {Object} feature - GeoJSON feature
   * @returns {Object} - Leaflet style object
   */
  const styleFeature = (feature) => {
    const stateName = feature.properties.name;
    const stateAbbr = STATE_NAME_TO_ABBR[stateName];
    const color = stateAbbr ? stateColors[stateAbbr] : null;

    return {
      fillColor: color || 'transparent',
      fillOpacity: color ? 0.5 : 0,
      color: color ? '#333' : 'transparent',
      weight: color ? 2 : 0,
      interactive: false // Don't interfere with marker clicks
    };
  };

  /**
   * Add tooltips to highlighted states
   * @param {Object} feature - GeoJSON feature
   * @param {Object} layer - Leaflet layer
   */
  const onEachFeature = (feature, layer) => {
    const stateName = feature.properties.name;
    const stateAbbr = STATE_NAME_TO_ABBR[stateName];
    const color = stateAbbr ? stateColors[stateAbbr] : null;

    // Add tooltip only for highlighted states
    if (color) {
      layer.bindTooltip(`${stateName} (${stateAbbr})`, {
        permanent: false,
        direction: 'center',
        className: 'state-tooltip'
      });
    }
  };

  return (
    <GeoJSON
      key={key}
      data={usStatesGeoJson}
      style={styleFeature}
      onEachFeature={onEachFeature}
    />
  );
}
