export default function AddressCoordinatesInput({
  showAddressForm,
  inputMode,
  address,
  latitude,
  longitude,
  label,
  status,
  isConnected,
  onToggleForm,
  onInputModeChange,
  onAddressChange,
  onLatitudeChange,
  onLongitudeChange,
  onLabelChange,
  onAddressSubmit,
  onCoordinatesSubmit
}) {
  return (
    <>
      <div className={`address-section ${showAddressForm ? 'expanded' : 'collapsed'}`}>
        <div className="input-mode-toggle">
          <button
            className={`mode-button ${inputMode === 'address' ? 'active' : ''}`}
            onClick={() => onInputModeChange('address')}
          >
            Address
          </button>
          <button
            className={`mode-button ${inputMode === 'coordinates' ? 'active' : ''}`}
            onClick={() => onInputModeChange('coordinates')}
          >
            Coordinates
          </button>
        </div>

        {inputMode === 'address' ? (
          <form onSubmit={onAddressSubmit} className="address-form">
            <input
              type="text"
              value={address}
              onChange={(e) => onAddressChange(e.target.value)}
              placeholder="Enter USA address..."
              className="address-input"
            />
            <button type="submit" disabled={!isConnected} className="submit-button">
              Add Pin
            </button>
          </form>
        ) : (
          <form onSubmit={onCoordinatesSubmit} className="coordinates-form">
            <input
              type="text"
              value={latitude}
              onChange={(e) => onLatitudeChange(e.target.value)}
              placeholder="Latitude (-90 to 90)..."
              className="coordinate-input"
            />
            <input
              type="text"
              value={longitude}
              onChange={(e) => onLongitudeChange(e.target.value)}
              placeholder="Longitude (-180 to 180)..."
              className="coordinate-input"
            />
            <input
              type="text"
              value={label}
              onChange={(e) => onLabelChange(e.target.value)}
              placeholder="Label (optional)..."
              className="label-input"
            />
            <button type="submit" disabled={!isConnected} className="submit-button">
              Add Pin
            </button>
          </form>
        )}

        <div className="status">
          {status && <p>{status}</p>}
        </div>
      </div>

      <button
        className="toggle-form-button"
        onClick={onToggleForm}
      >
        {showAddressForm ? '▼' : '▶'} Add Address/Coordinates
      </button>
    </>
  );
}
