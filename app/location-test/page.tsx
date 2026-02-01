'use client';

import { useState, useEffect } from 'react';

export default function LocationTest() {
  const [location, setLocation] = useState<any>(null);
  const [weather, setWeather] = useState<any>(null);
  const [error, setError] = useState<string>('');
  const [loading, setLoading] = useState(false);

  const getLocation = () => {
    setLoading(true);
    setError('');
    
    if (!navigator.geolocation) {
      setError('Geolocation is not supported by this browser.');
      setLoading(false);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const coords = {
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
          accuracy: position.coords.accuracy
        };
        
        setLocation(coords);
        
        // Get weather for this location
        try {
          const response = await fetch(`/api/weather?lat=${coords.latitude}&lon=${coords.longitude}`);
          const data = await response.json();
          setWeather(data.weather);
        } catch (err) {
          setError('Failed to fetch weather data');
        }
        
        setLoading(false);
      },
      (error) => {
        setError(`Geolocation error: ${error.message}`);
        setLoading(false);
      },
      { 
        enableHighAccuracy: true, 
        timeout: 10000, 
        maximumAge: 0 
      }
    );
  };

  const testDefaultWeather = async () => {
    try {
      const response = await fetch('/api/weather');
      const data = await response.json();
      setWeather(data.weather);
    } catch (err) {
      setError('Failed to fetch default weather data');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-3xl font-bold mb-8">Location & Weather Test</h1>
        
        <div className="space-y-4">
          <button
            onClick={getLocation}
            disabled={loading}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
          >
            {loading ? 'Getting Location...' : 'Get My Location & Weather'}
          </button>
          
          <button
            onClick={testDefaultWeather}
            className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 ml-4"
          >
            Test Default Weather
          </button>
        </div>

        {error && (
          <div className="mt-4 p-4 bg-red-100 border border-red-400 text-red-700 rounded">
            {error}
          </div>
        )}

        {location && (
          <div className="mt-6 p-4 bg-white rounded-lg shadow">
            <h2 className="text-xl font-semibold mb-2">Location Data</h2>
            <p><strong>Latitude:</strong> {location.latitude}</p>
            <p><strong>Longitude:</strong> {location.longitude}</p>
            <p><strong>Accuracy:</strong> {location.accuracy} meters</p>
          </div>
        )}

        {weather && (
          <div className="mt-6 p-4 bg-white rounded-lg shadow">
            <h2 className="text-xl font-semibold mb-2">Weather Data</h2>
            <p><strong>Location:</strong> {weather.location}</p>
            {weather.region && <p><strong>Region:</strong> {weather.region}</p>}
            <p><strong>Temperature:</strong> {weather.temperature}°C</p>
            <p><strong>Description:</strong> {weather.description}</p>
            <p><strong>Humidity:</strong> {weather.humidity}%</p>
            <p><strong>Wind Speed:</strong> {weather.windSpeed} km/h</p>
            <p><strong>Demo Data:</strong> {weather.isDemo ? 'Yes' : 'No'}</p>
          </div>
        )}
      </div>
    </div>
  );
}