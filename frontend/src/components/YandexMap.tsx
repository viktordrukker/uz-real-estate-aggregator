'use client';

import React, { useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation'; // Import useRouter

// Define structure for individual placemark data
interface PlacemarkData {
  id: number | string;
  documentId: string; // Add documentId for linking
  coords: [number, number];
  popupContent?: string;
}

interface YandexMapProps {
  center: [number, number];
  zoom?: number;
  placemarks?: PlacemarkData[]; // Accept an array of placemarks
}

const YandexMap: React.FC<YandexMapProps> = ({
  center,
  zoom = 12,
  placemarks = [],
}) => {
  const mapRef = useRef<HTMLDivElement>(null);
  const ymapsRef = useRef<any>(null);
  const router = useRouter(); // Initialize router
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
        script.src = `https://api-maps.yandex.ru/2.1/?apikey=${YANDEX_API_KEY}&lang=en_US`;
        script.async = true;
        script.onload = () => {
          // @ts-ignore
          if (window.ymaps) {
             // @ts-ignore
            window.ymaps.ready(initMap);
          } else {
            console.error("window.ymaps not found after script load.");
          }
        };
        script.onerror = () => {
          console.error("Failed to load Yandex Maps script.");
        };
        document.body.appendChild(script);
      } else {
         // @ts-ignore
        if (window.ymaps) {
           // @ts-ignore
          window.ymaps.ready(initMap);
        } else {
          existingScript.addEventListener('load', () => {
             // @ts-ignore
             if (window.ymaps) {
               // @ts-ignore
              window.ymaps.ready(initMap);
             } else {
               console.error("window.ymaps not found even after existing script load event.");
             }
          });
           existingScript.addEventListener('error', () => {
             console.error("Error event on existing Yandex Maps script.");
           });
        }
      }
    };

    const initMap = () => {
       // @ts-ignore
      if (!window.ymaps) {
        console.error("initMap called but window.ymaps is not available.");
        return;
      }
       // @ts-ignore
      ymapsRef.current = window.ymaps;
      const ymaps = ymapsRef.current;

      if (!mapRef.current) {
        console.error("Map container ref is not available.");
        return;
      }

      // Ensure container is clean before initializing
      if (mapRef.current) {
          mapRef.current.innerHTML = ''; // Clear previous map elements
      } else {
          console.error("Map container ref is null before init.");
          return;
      }

      try {
        const map = new ymaps.Map(mapRef.current, {
          center: center,
          zoom: zoom,
          controls: ['zoomControl', 'fullscreenControl']
        });

        // Add multiple placemarks using a collection
        if (placemarks && placemarks.length > 0) {
            const placemarkCollection = new ymaps.GeoObjectCollection({}, {
                preset: 'islands#blueDotIcon' // Apply preset to the collection
            });

            placemarks.forEach((pm: PlacemarkData) => {
                if (!pm || !Array.isArray(pm.coords) || pm.coords.length !== 2) {
                    console.warn("Skipping invalid placemark data:", pm);
                    return;
                }
                const placemark = new ymaps.Placemark(pm.coords, {
                    // hintContent: pm.popupContent || `Property ${pm.id}`, // Example hint
                    // balloonContent: pm.popupContent || `Details for ${pm.id}`
                }, {
                });
                // Add click listener
                placemark.events.add('click', () => {
                    router.push(`/properties/${pm.documentId}`);
                });
                placemarkCollection.add(placemark); // Add to collection instead of map directly
            });

            map.geoObjects.add(placemarkCollection); // Add the collection to the map
            console.log(`[DEBUG] Added ${placemarkCollection.getLength()} placemarks to map.`);

            // Adjust map bounds after adding the collection
            const collectionLength = placemarkCollection.getLength();
            if (collectionLength > 1) {
                const bounds = placemarkCollection.getBounds();
                if (bounds) {
                    console.log(`[DEBUG] Setting map bounds for ${collectionLength} placemarks:`, bounds);
                    // Use a slight delay in case the map needs a moment after adding objects
                    setTimeout(() => {
                        map.setBounds(bounds, {
                            checkZoomRange: true,
                            zoomMargin: 30
                        }).catch((err: any) => console.error("Error setting map bounds:", err));
                    }, 100); // 100ms delay
                } else {
                    console.warn("[DEBUG] Could not get bounds from placemark collection.");
                    // Fallback: Center on the first placemark if bounds fail
                    if(placemarks[0]?.coords) map.setCenter(placemarks[0].coords, zoom);
                }
            } else if (collectionLength === 1) {
                 console.log("[DEBUG] Centering map on single placemark.");
                 // Center on single placemark with appropriate zoom
                 map.setCenter(placemarks[0].coords, 15); // Use zoom 15 for single point
            } else {
                 console.log("[DEBUG] No valid placemarks to set bounds or center.");
                 // Keep default center and zoom if no placemarks
                 map.setCenter(center, zoom);
            }
        }

        // Optional: Cleanup function
        // return () => { map?.destroy(); };

      } catch (mapError) {
          console.error("Error initializing Yandex Map:", mapError);
      }
    };

    loadYandexMapsScript();

  }, [center, zoom, placemarks, YANDEX_API_KEY]); // Dependencies

  return (
    <div ref={mapRef} style={{ width: '100%', height: '100%' }} className="bg-gray-200">
      {/* Display message if API key is missing */}
      {!YANDEX_API_KEY && (
        <div className="flex items-center justify-center h-full">
           <p className="text-red-500 p-4">Yandex Maps API Key is missing.</p>
        </div>
       )}
    </div>
  );
};

export default YandexMap;
