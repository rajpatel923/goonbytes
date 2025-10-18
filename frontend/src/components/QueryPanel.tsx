import { motion } from "framer-motion";
import { useState } from "react";
import { PacmanLoader, PulseLoader } from "react-spinners";

interface QueryPanelProps {
  markerPos: { lng: number; lat: number } | null;
  season: string;
  onSeasonChange: (season: string) => void;
  onSubmit: () => void;
  data: any;
  ai_crop_thingy: any;
}

const QueryPanel = ({
  markerPos,
  season,
  onSeasonChange,
  onSubmit,
  data,
  ai_crop_thingy,
}: QueryPanelProps) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [loading, setLoading] = useState(false);

  if (!markerPos) return null;

  const handleRetrieveWeatherData = () => {
    setLoading(true);
    onSubmit();
  };

  // Simulate data retrieval completion
  if (data !== undefined && loading) {
    setLoading(false);
  }

  return (
    <div className="scrollable-container">
      <motion.div
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        exit={{ opacity: 0, x: 20 }}
        className="border-gray-100 absolute right-12 top-32 z-40 w-80 rounded-2xl border bg-black/60 p-6 shadow-xl"
        style={{ color: "white" }}
      >
        <h3 className="text-white-900 mb-1 text-lg font-semibold text-center">
          Location Details
        </h3>

        <div className="space-y-2">
          <div className="space-y-1">
            <div className="flex items-center">
              <div className="bg-emerald-500 rounded-full" />
              <span className="text-white-600 text-sm font-bold">Longitude</span>
            </div>
            <span className="block text-lg">{markerPos.lng.toFixed(4)}°</span>
          </div>
          <div className="space-y-1">
            <div className="flex items-center">
              <div className="bg-emerald-500 rounded-full" />
              <span className="text-white-600 text-sm font-bold">Latitude</span>
            </div>
            <span className="block text-lg font-medium">
              {markerPos.lat.toFixed(4)}°
            </span>
          </div>
          <div className="space-y-1">
            <label className="text-white-600 block text-sm font-bold">
              Season
            </label>
            <select
              value={season}
              onChange={(e) => onSeasonChange(e.target.value)}
              className="border-gray-200 focus:ring-emerald-500 focus:border-transparent w-full rounded-lg border bg-black px-4 py-1 text-center font-bold outline-none transition-all focus:ring-2"
            >
              <option value="Winter">Winter</option>
              <option value="Spring">Spring</option>
              <option value="Summer">Summer</option>
              <option value="Fall">Fall</option>
            </select>
          </div>
          <button
            onClick={handleRetrieveWeatherData}
            className="bg-emerald-500 hover:bg-emerald-600 focus:ring-emerald-500 w-full rounded-lg border px-4 py-2 font-medium transition-colors focus:ring-2 focus:ring-offset-2"
          >
            Retrieve Weather Data
          </button>
          <div className="mt-6 space-y-2">
            <h4 className="text-white-900 font-medium">Weather Data</h4>
            <div className="bg-gray-50 rounded-lg p-4">
              {loading ? (
                <div className="flex justify-center py-4">
                  <PacmanLoader color="#10b981" size={25} speedMultiplier={3} />
                </div>
              ) : (
                <div className="space-y-2">
                  {Object.entries(data || {}).map(
                    ([key, value]: [string, any]) => (
                      <div
                        key={key}
                        className="flex items-center justify-between"
                      >
                        <span className="text-gray-600 text-sm capitalize">
                          {key.replace(/_/g, " ")}
                        </span>
                        <span className="font-medium text-black">
                          {typeof value === "number" ? value.toFixed(3) : value}
                        </span>
                      </div>
                    ),
                  )}
                </div>
              )}
            </div>
          </div>
          <div className="mt-6 space-y-2">
            <button
              onClick={() => setIsExpanded(!isExpanded)}
              className="bg-emerald-500 hover:bg-emerald-600 focus:ring-emerald-500 w-full rounded-lg border px-4 py-0.5 font-medium transition-colors focus:ring-2 focus:ring-offset-2"
            >
              ↓ Crop Recommendations ↓
            </button>
            {isExpanded && (
              <div className="bg-gray-50 mt-2 rounded-lg p-4 text-black">
                {ai_crop_thingy}
              </div>
            )}
          </div>
        </div>
      </motion.div>
    </div>
  );
};
export default QueryPanel;