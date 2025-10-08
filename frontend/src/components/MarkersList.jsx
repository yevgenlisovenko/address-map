export default function MarkersList({ markers, showAllPins, pinsToShow, onToggleShowAll }) {
  return (
    <div className="markers-list">
      <div className="markers-header">
        <h3>Pins ({markers.length})</h3>
      </div>
      <ul>
        {(showAllPins
          ? [...markers].reverse()
          : [...markers].reverse().slice(0, pinsToShow)
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
