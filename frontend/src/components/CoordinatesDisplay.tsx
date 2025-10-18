import { motion } from "framer-motion";

interface CoordinatesDisplayProps {
  lng: number;
  lat: number;
  zoom: number;
}

const CoordinatesDisplay = ({ lng, lat, zoom }: CoordinatesDisplayProps) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0, transition: { delay: 1 } }}
      className="fixed z-40 mt-24 px-6 py-3 bg-black/60 backdrop-blur-lg shadow-lg rounded-full text-center border-4 border-gray-300"
      style={{ color: 'white', top: '1.4rem', left: '40%' }}
    >
      <div className="flex items-center space-x-4">
        <div className="flex flex-col">
          <span className="text-xs">Longitude</span>
          <span className="font-medium">{lng.toFixed(4)}°</span>
        </div>
        <div className="h-8 w-px bg-gray-300" />
        <div className="flex flex-col">
          <span className="text-xs">Latitude</span>
          <span className="font-medium">{lat.toFixed(4)}°</span>
        </div>
        <div className="h-8 w-px bg-gray-300" />
        <div className="flex flex-col">
          <span className="text-xs">Zoom</span>
          <span className="font-medium">{zoom.toFixed(1)}x</span>
        </div>
      </div>
    </motion.div>
  );
};

export default CoordinatesDisplay;