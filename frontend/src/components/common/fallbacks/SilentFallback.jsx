/**
 * SilentFallback Component
 *
 * A fallback component that renders nothing (null).
 * Used for optional features where silent failure is acceptable.
 *
 * The error is still logged to console by the NamedErrorBoundary,
 * but no UI is shown to the user.
 *
 * Example usage: StatesLayer (map works without state highlighting)
 */
function SilentFallback() {
  return null;
}

export default SilentFallback;
