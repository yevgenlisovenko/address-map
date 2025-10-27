import PropTypes from 'prop-types';
import './MarkersList.css';

export default function MarkersList({ markers, showAllPins, pinsToShow, onToggleShowAll }) {
  const sortedMarkers = [...markers].sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp));
  return (
    <div className="markers-list">
      <div className="markers-header">
        <h3>Pins ({markers.length})</h3>
      </div>
      <ul>
        {(showAllPins
          ? [...sortedMarkers].reverse()
          : [...sortedMarkers].reverse().slice(0, pinsToShow)
        ).map((marker, index) => (
          <li key={index}>
            {marker.type === 'address' ? marker.address : marker.displayName}
            <br />
            <small>{new Date(marker.timestamp).toLocaleTimeString()}</small>
          </li>
        ))}
      </ul>
      {markers.length > pinsToShow && (
        <button
          className="show-more-button"
          onClick={onToggleShowAll}
        >
          {showAllPins ? 'Show Less' : `Show All (${markers.length})`}
        </button>
      )}
    </div>
  );
}

MarkersList.propTypes = {
  markers: PropTypes.arrayOf(
    PropTypes.shape({
      timestamp: PropTypes.string.isRequired,
      type: PropTypes.string,
      address: PropTypes.string,
      displayName: PropTypes.string,
    })
  ).isRequired,
  showAllPins: PropTypes.bool.isRequired,
  pinsToShow: PropTypes.number.isRequired,
  onToggleShowAll: PropTypes.func.isRequired,
};
