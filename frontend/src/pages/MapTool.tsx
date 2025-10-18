import { GeocodingControl } from "@maptiler/geocoding-control/maplibregl";
import "@maptiler/geocoding-control/style.css";
import axios from "axios";
import { motion } from "framer-motion";
import maplibregl from "maplibre-gl";
import "maplibre-gl/dist/maplibre-gl.css";
import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import CoordinatesDisplay from "../components/CoordinatesDisplay";
import QueryPanel from "../components/QueryPanel";
import { MapLibreApiKey } from "../SensitiveData";

interface Props {
  navBar: any;
  initLng: number;
  initLat: number;
  markerInitPos: any;
  initZoom: number;
  setInitLng: (newLng: number) => void;
  setInitLat: (newLat: number) => void;
  setInitMarkPos: (newMarkPos: any) => void;
  setInitZoom: (newZoom: number) => void;
}

const MapDisplay = ({
  navBar,
  initLng,
  initLat,
  markerInitPos,
  initZoom,
  setInitLng,
  setInitLat,
  setInitMarkPos,
  setInitZoom,
}: Props) => {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<maplibregl.Map | null>(null);
  const [lng, setLng] = useState(initLng);
  const [lat, setLat] = useState(initLat);
  const [zoom, setZoom] = useState(initZoom);
  const [season, setSeason] = useState(getCurrentSeason());
  const [markerPos, setMarkerPos] = useState(markerInitPos);
  const markerRef = useRef<maplibregl.Marker | null>(null);
  const [data, setData] = useState<any>(undefined);
  const [ai_crop_rec, setAi_crop_rec] = useState<any>(undefined);

  const navigate = useNavigate();

  // Helper to get the current season based on the month
  function getCurrentSeason(): string {
    const month = new Date().getMonth() + 1;
    if (month === 12 || month === 1 || month === 2) return "Winter";
    if (month >= 3 && month <= 5) return "Spring";
    if (month >= 6 && month <= 8) return "Summer";
    return "Fall";
  }

  // Initialize the map and controls on mount
  useEffect(() => {
    if (map.current) return;
    map.current = new maplibregl.Map({
      container: mapContainer.current!,
      style: `https://api.maptiler.com/maps/f8f7d758-8ad6-42b9-a56c-e29abc616091/style.json?key=${MapLibreApiKey}`,
      center: [lng, lat],
      zoom: zoom,
    });
    // Add navigation, geocoding, and geolocate controls
    const navigationControl = new maplibregl.NavigationControl();
    map.current.addControl(navigationControl, "bottom-right");
    const gc = new GeocodingControl({ apiKey: MapLibreApiKey });
    map.current.addControl(gc, "bottom-left");
    const geolocateControl = new maplibregl.GeolocateControl({
      positionOptions: { enableHighAccuracy: true },
      trackUserLocation: true,
    });
    map.current.addControl(geolocateControl, "bottom-right");

    // Update state when map moves
    map.current.on("move", () => {
      if (!map.current) return;
      const mapCenter = map.current.getCenter();
      const mapZoom = map.current.getZoom();
      setLng(mapCenter.lng);
      setLat(mapCenter.lat);
      setZoom(mapZoom);
      setInitLng(mapCenter.lng);
      setInitLat(mapCenter.lat);
      setInitZoom(mapZoom);
    });

    // Set marker position on map click
    map.current.on("click", (e) => {
      setMarkerPos(e.lngLat);
      setInitMarkPos(e.lngLat);
    });
  }, [MapLibreApiKey, lng, lat, zoom]);

  // Handle marker placement and removal
  useEffect(() => {
    if (!map.current || !markerPos) return;
    let currLngLat;
    if (markerRef.current) {
      currLngLat = markerRef.current.getLngLat();
      markerRef.current.remove();
      setData(undefined);
    }
    if (
      !currLngLat ||
      markerPos.lng !== currLngLat.lng ||
      markerPos.lat !== currLngLat.lat
    ) {
      const newMarker = new maplibregl.Marker({
        color: "#10b981",
        scale: 1.2,
      })
        .setLngLat([markerPos.lng, markerPos.lat])
        .addTo(map.current);
      markerRef.current = newMarker;
    } else {
      setMarkerPos(null);
    }
  }, [markerPos]);

  // Fetch weather and AI crop recommendation data
  async function RetrieveWeatherData(longitude: number, latitude: number) {
    setData(undefined);
    const retrievalParams = {
      longitude: longitude,
      latitude: latitude,
      season: season,
    };
    try {
      const response = await axios.get("http://127.0.0.1:5000/get-weather", {
        params: retrievalParams,
        validateStatus: (status) => true,
      });
      setData(response.data.Weather_Response);
      setAi_crop_rec(response.data.AI_Response);
    } catch (error) {
      console.error("Error fetching weather data:", error);
      setData({ error: "Failed to fetch weather data" });
    }
  }

  return (
    <div className="relative h-screen w-screen overflow-hidden">
      {navBar}

      {/* Display current coordinates and zoom */}
      <CoordinatesDisplay lng={lng} lat={lat} zoom={zoom} />

      {/* Panel for querying weather and crop info */}
      <QueryPanel
        markerPos={markerPos}
        season={season}
        onSeasonChange={setSeason}
        onSubmit={() => RetrieveWeatherData(markerPos!.lng, markerPos!.lat)}
        data={data}
        ai_crop_thingy={ai_crop_rec}
      />

      {markerPos && (
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
          className="border-gray-100 absolute left-12 top-32 z-40 w-80 rounded-2xl border bg-black/60 p-3 shadow-xl"
          style={{ color: "white" }}
        >
          <button
            onClick={() => {
              navigate("/account", {
                state: {
                  addingFarmFromMap: true,
                  selectedLocation:
                    markerPos.lng.toFixed(3) + ", " + markerPos.lat.toFixed(3),
                },
              });
            }}
            className="bg-emerald-500 hover:bg-emerald-600 focus:ring-emerald-500 w-full rounded-lg border px-4 py-2 font-medium transition-colors focus:ring-2 focus:ring-offset-2"
          >
            + Add Farm
          </button>
        </motion.div>
      )}

      {/* Map container */}
      <div ref={mapContainer} className="map absolute inset-0 z-0" />
    </div>
  );
};

export default MapDisplay;
