import {
  AppConfigProvider,
  SocketProvider,
  UIStateProvider,
  FilterStateProvider,
  MapInteractionProvider,
  useAppConfig
} from './contexts';
import { useDocumentMeta } from './hooks/useDocumentMeta';
import { useMarkerHighlight } from './hooks/useMarkerHighlight';
import LoadingSpinner from './components/common/LoadingSpinner';
import ErrorMessage from './components/common/ErrorMessage';
import AppLayout from './components/layout/AppLayout';
import 'leaflet/dist/leaflet.css';
import './App.css';
import './styles/newMarkerHighlight.css';

function App() {
  return (
    <AppConfigProvider>
      <SocketProvider>
        <UIStateProvider>
          <FilterStateProvider>
            <MapInteractionProvider>
              <AppContent />
            </MapInteractionProvider>
          </FilterStateProvider>
        </UIStateProvider>
      </SocketProvider>
    </AppConfigProvider>
  );
}

function AppContent() {
  // Document meta and marker highlight hooks
  useDocumentMeta();
  useMarkerHighlight();

  // Access config and loading states
  const { loading, error } = useAppConfig();

  // Loading and error states
  if (loading) return <LoadingSpinner />;
  if (error) return <ErrorMessage error={error} />;

  return <AppLayout />;
}

export default App;
