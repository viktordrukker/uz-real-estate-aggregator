'use client'; // Needs to be a client component for map interaction

import React, { useEffect, useRef } from 'react';

interface YandexMapProps {
  center: [number, number]; // [latitude, longitude]
  zoom?: number;
  placemarkCoords?: [number, number]; // Optional coordinates for a single placemark
  // TODO: Add support for multiple placemarks later for list view
}

const YandexMap: React.FC<YandexMapProps> = ({
  center,
  zoom = 12, // Default zoom level
  placemarkCoords,
}) => {
  const mapRef = useRef<HTMLDivElement>(null);
  const ymapsRef = useRef<any>(null); // To hold the Yandex Maps API instance

  const YANDEX_API_KEY = process.env.NEXT_PUBLIC_YANDEX_MAPS_API_KEY;

  useEffect(() => {
    if (!YANDEX_API_KEY) {
      console.error("Yandex Maps API Key is missing.");
      return;
    }

    const loadYandexMapsScript = () => {
      const existingScript = document.getElementById('yandex-maps-api');

      if (!existingScript) {
        const script = document.createElement('script');
        script.id = 'yandex-maps-api';
        // Load API with geocoding capabilities
        script.src = `https://api-maps.yandex.ru/2.1/?apikey=${YANDEX_API_KEY}&lang=en_US`;
        script.async = true;
        script.onload = () => {
          // @ts-ignore // Yandex maps adds 'ymaps' to window
          window.ymaps.ready(initMap);
        };
        script.onerror = () => {
          console.error("Failed to load Yandex Maps script.");
        };
        document.body.appendChild(script);
      } else {
        // If script exists, check if ymaps is ready
        // @ts-ignore
        if (window.ymaps) {
          // @ts-ignore
          window.ymaps.ready(initMap);
        } else {
          // If script exists but ymaps not ready, wait for onload
          existingScript.addEventListener('load', () => {
             // @ts-ignore
            window.ymaps.ready(initMap);
          });
        }
      }
    };

    const initMap = () => {
      // @ts-ignore
      ymapsRef.current = window.ymaps; // Store ymaps instance
      const ymaps = ymapsRef.current;

      if (!mapRef.current) return;

      // Destroy previous map instance if it exists
      // This prevents errors on fast refresh / component remount
      const mapContainer = mapRef.current;
      if (mapContainer.innerHTML !== '') {
          // A simple way to check if map was already initialized
          // More robust check might involve checking map instance variable
          // For now, just clear and re-init
          mapContainer.innerHTML = '';
      }


      const map = new ymaps.Map(mapRef.current, {
        center: center,
        zoom: zoom,
        controls: ['zoomControl', 'fullscreenControl'] // Add basic controls
      });

      // Add placemark if coordinates are provided
      if (placemarkCoords) {
        const placemark = new ymaps.Placemark(placemarkCoords, {}, {
          preset: 'islands#icon',
          iconColor: '#0095b6' // Example color
        });
        map.geoObjects.add(placemark);
      }

      // Optional: Add cleanup function if needed, e.g., map.destroy()
      // return () => {
      //   if (map) {
      //     map.destroy();
      //   }
      // };
    };

    loadYandexMapsScript();

  }, [center, zoom, placemarkCoords, YANDEX_API_KEY]); // Rerun effect if these change

  return (
    <div ref={mapRef} style={{ width: '100%', height: '400px' }} className="bg-gray-200">
      {/* Map will be rendered here by the Yandex Maps API */}
      {!YANDEX_API_KEY && <p className="text-red-500 p-4">Yandex Maps API Key is missing.</p>}
    </div>
  );
};

export default YandexMap;
