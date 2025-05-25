import React, { useEffect, useState, useCallback } from 'react';
import { GoogleMap, LoadScript, HeatmapLayer } from '@react-google-maps/api';

const GISHeatmap = () => {
  const [crimeData, setCrimeData] = useState([]);
  const [rawData, setRawData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [mapLoaded, setMapLoaded] = useState(false);

  // Kenya's center coordinates
  const center = {
    lat: 0.0236,
    lng: 37.9062
  };

  const mapOptions = {
    styles: [
      {
        featureType: 'all',
        elementType: 'geometry',
        stylers: [{ visibility: 'on' }, { saturation: -30 }]
      },
      {
        featureType: 'administrative',
        elementType: 'geometry.stroke',
        stylers: [{ color: '#2f343b' }, { weight: 1 }]
      },
      {
        featureType: 'landscape',
        elementType: 'geometry',
        stylers: [{ color: '#ffffff' }]
      },
      {
        featureType: 'water',
        elementType: 'geometry',
        stylers: [{ color: '#e9e9e9' }]
      }
    ],
    disableDefaultUI: false,
    zoomControl: true,
    mapTypeControl: true,
    streetViewControl: false,
    fullscreenControl: true,
  };

  // Fetch raw data
  useEffect(() => {
    console.log('GISHeatmap component mounted');
    const fetchData = async () => {
      try {
        console.log('Fetching crime data...');
        const response = await fetch('http://127.0.0.1:5000/api/heatmap-data');
        if (!response.ok) {
          throw new Error('Failed to fetch crime data');
        }
        const data = await response.json();
        console.log('Crime data received:', data);
        setRawData(data);
      } catch (err) {
        console.error('Error in fetchData:', err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // Transform data after map is loaded
  useEffect(() => {
    if (mapLoaded && window.google && rawData.length > 0) {
      try {
        console.log('Transforming data for heatmap...');
        const heatmapData = rawData.map(crime => ({
          location: new window.google.maps.LatLng(crime.latitude, crime.longitude),
          weight: Math.min(crime.count || 1, 100) // Cap the weight to prevent extreme values
        }));
        console.log('Heatmap data processed:', heatmapData.length, 'points');
        setCrimeData(heatmapData);
      } catch (err) {
        console.error('Error transforming data:', err);
        setError('Failed to process crime data');
      }
    }
  }, [mapLoaded, rawData]);

  const handleMapLoad = useCallback(() => {
    console.log('Map loaded successfully');
    setMapLoaded(true);
  }, []);

  const handleMapError = useCallback((error) => {
    console.error('Error loading Google Maps:', error);
    setError('Failed to load Google Maps');
  }, []);

  const heatmapOptions = {
    radius: 30,
    opacity: 0.7,
    maxIntensity: 50,
    gradient: [
      'rgba(0, 128, 0, 0)',    // transparent green
      'rgba(0, 255, 0, 0.5)',  // light green
      'rgba(150, 255, 0, 0.6)', // yellow-green
      'rgba(255, 255, 0, 0.7)', // yellow
      'rgba(255, 192, 0, 0.8)', // orange-yellow
      'rgba(255, 128, 0, 0.9)', // orange
      'rgba(255, 64, 0, 0.9)',  // red-orange
      'rgba(255, 0, 0, 1)'      // red
    ],
    dissipating: true
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-[calc(100vh-200px)] bg-white">
        <div className="text-gray-800">Loading GIS Heatmap...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-[calc(100vh-200px)] bg-white">
        <div className="text-red-600">Error: {error}</div>
      </div>
    );
  }

  return (
    <div className="relative h-[calc(100vh-200px)] w-full bg-white">
      <div className="absolute top-4 right-4 z-10 bg-white p-4 rounded-lg shadow-lg">
        <h3 className="text-sm font-semibold mb-2">Crime Density Legend</h3>
        <div className="flex flex-col gap-2">
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-green-500 rounded-sm"></div>
            <span className="text-xs">Low (0-10)</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-yellow-500 rounded-sm"></div>
            <span className="text-xs">Medium (11-50)</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-red-500 rounded-sm"></div>
            <span className="text-xs">High (&gt;50)</span>
          </div>
        </div>
      </div>
      <LoadScript 
        googleMapsApiKey="AIzaSyDnUhIrcmxYrLKj86l9LZ_HSa2HS-H8dBM"
        onLoad={() => console.log('Google Maps Script loaded')}
        onError={handleMapError}
        libraries={['visualization']}
      >
        <GoogleMap
          mapContainerClassName="w-full h-full"
          center={center}
          zoom={7}
          options={mapOptions}
          onLoad={handleMapLoad}
        >
          {mapLoaded && crimeData.length > 0 && (
            <HeatmapLayer
              data={crimeData}
              options={heatmapOptions}
            />
          )}
        </GoogleMap>
      </LoadScript>
    </div>
  );
};

export default GISHeatmap; 