import { useEffect, useRef } from 'react';
import { useSocketContext } from '../contexts';
import { NEW_MARKER_HIGHLIGHT_CONFIG } from '../config/newMarkerHighlightConfig';

/**
 * useMarkerHighlight - Auto-clear __isNew flag after configured duration
 *
 * Uses batched clearing to prevent cascading re-renders when many markers
 * arrive simultaneously (e.g., after reconnection).
 *
 * Implementation: Groups markers by expiry time (rounded to nearest 100ms)
 * and clears entire batches in a single setMarkers() call, reducing
 * 50+ re-renders down to 1-2 re-renders.
 *
 * Extracts complex timeout management logic from App.jsx
 */
export function useMarkerHighlight() {
  const { markers, setMarkers } = useSocketContext();
  const timeoutMapRef = useRef(new Map()); // Stores expiryTime -> Set<markerId>
  const clearTimeoutRef = useRef(null); // Single timeout for next batch clearing

  useEffect(() => {
    // Skip if feature is disabled - clear any existing timeouts
    if (!NEW_MARKER_HIGHLIGHT_CONFIG || !NEW_MARKER_HIGHLIGHT_CONFIG.enabled) {
      if (clearTimeoutRef.current) {
        clearTimeout(clearTimeoutRef.current);
        clearTimeoutRef.current = null;
      }
      timeoutMapRef.current.clear();
      return;
    }

    // Find NEW markers that don't already have scheduled clear times
    const newMarkers = markers.filter(marker => {
      if (!marker.__isNew) return false;
      // Check if this marker is already scheduled for clearing
      for (const markerIds of timeoutMapRef.current.values()) {
        if (markerIds.has(marker.id)) return false;
      }
      return true;
    });

    if (newMarkers.length === 0) {
      // No new markers, but we still need to cleanup removed markers
      cleanupRemovedMarkers();
      return;
    }

    const duration = NEW_MARKER_HIGHLIGHT_CONFIG.duration || 4000;
    const now = Date.now();
    const expiryTime = now + duration;

    // Round expiry time to nearest 100ms to group markers arriving close together
    // This batches markers arriving within the same 100ms window
    const roundedExpiry = Math.round(expiryTime / 100) * 100;

    // Add new markers to the batch for this expiry time
    if (!timeoutMapRef.current.has(roundedExpiry)) {
      timeoutMapRef.current.set(roundedExpiry, new Set());
    }
    const batch = timeoutMapRef.current.get(roundedExpiry);
    newMarkers.forEach(marker => {
      batch.add(marker.id);
    });

    // Schedule batch clearing (will reschedule if needed)
    scheduleBatchClear();

    // Helper: Schedule the next batch to be cleared
    function scheduleBatchClear() {
      // Clear existing timeout (we'll create a new one for earliest expiry)
      if (clearTimeoutRef.current) {
        clearTimeout(clearTimeoutRef.current);
      }

      // Find the earliest expiry time that hasn't expired yet
      const now = Date.now();
      const expiryTimes = Array.from(timeoutMapRef.current.keys()).sort((a, b) => a - b);
      const nextExpiry = expiryTimes.find(t => t > now);

      if (!nextExpiry) {
        // No pending batches
        clearTimeoutRef.current = null;
        return;
      }

      const delay = Math.max(0, nextExpiry - now);

      clearTimeoutRef.current = setTimeout(() => {
        // Get all markers expiring at this time
        const markerIdsToExpire = timeoutMapRef.current.get(nextExpiry);

        if (markerIdsToExpire && markerIdsToExpire.size > 0) {
          // ✅ BATCH CLEAR: Single setMarkers() call clears ALL expired markers
          // This reduces 50+ re-renders to just 1 re-render
          setMarkers(prevMarkers =>
            prevMarkers.map(m =>
              markerIdsToExpire.has(m.id) ? { ...m, __isNew: false } : m
            )
          );
        }

        // Remove this batch from the map
        timeoutMapRef.current.delete(nextExpiry);

        // Recursively schedule the next batch
        scheduleBatchClear();
      }, delay);
    }

    // Helper: Cleanup timeouts for markers that were removed from array
    function cleanupRemovedMarkers() {
      const currentMarkerIds = new Set(markers.map(m => m.id));
      let needsReschedule = false;

      timeoutMapRef.current.forEach((markerIds, expiryTime) => {
        markerIds.forEach(markerId => {
          if (!currentMarkerIds.has(markerId)) {
            markerIds.delete(markerId);
            needsReschedule = true;
          }
        });
        // Remove empty batches
        if (markerIds.size === 0) {
          timeoutMapRef.current.delete(expiryTime);
          needsReschedule = true;
        }
      });

      // If we removed batches, reschedule to ensure correct next timeout
      if (needsReschedule && clearTimeoutRef.current) {
        scheduleBatchClear();
      }
    }

    cleanupRemovedMarkers();

    // Cleanup: clear all pending timeouts on unmount
    return () => {
      if (clearTimeoutRef.current) {
        clearTimeout(clearTimeoutRef.current);
        clearTimeoutRef.current = null;
      }
      timeoutMapRef.current.clear();
    };
  }, [markers, setMarkers]);
}
