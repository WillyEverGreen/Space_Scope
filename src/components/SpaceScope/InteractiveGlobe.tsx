import { motion, useScroll, useTransform } from "framer-motion";
import { useRef, useState, useEffect } from "react";
import {
  MapPin,
  Eye,
  Clock,
  Compass,
  Bell,
  Info,
  Navigation,
} from "lucide-react";
import {
  MapContainer,
  TileLayer,
  Marker,
  Popup,
  useMap,
  useMapEvents,
} from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

// Fix for default marker icons in react-leaflet
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png",
  iconUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png",
  shadowUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png",
});

interface Region {
  id: string;
  name: string;
  visibility: number;
  localTime: string;
  direction: string;
  status: "visible" | "partial" | "hidden";
  lat: number;
  lng: number;
}

const regions: Region[] = [
  {
    id: "na",
    name: "North America",
    visibility: 95,
    localTime: "11:30 PM - 3:00 AM",
    direction: "Northeast",
    status: "visible",
    lat: 40.7128,
    lng: -74.006,
  },
  {
    id: "eu",
    name: "Europe",
    visibility: 78,
    localTime: "4:30 AM - 6:00 AM",
    direction: "Northwest",
    status: "partial",
    lat: 52.52,
    lng: 13.405,
  },
  {
    id: "asia",
    name: "Asia",
    visibility: 45,
    localTime: "8:30 PM - 10:00 PM",
    direction: "North",
    status: "partial",
    lat: 35.6762,
    lng: 139.6503,
  },
  {
    id: "sa",
    name: "South America",
    visibility: 88,
    localTime: "10:00 PM - 2:00 AM",
    direction: "East",
    status: "visible",
    lat: -23.5505,
    lng: -46.6333,
  },
];

// Custom map event handler component
const MapEventHandler = ({
  onLocationClick,
}: {
  onLocationClick: (lat: number, lng: number) => void;
}) => {
  useMapEvents({
    click: (e) => {
      onLocationClick(e.latlng.lat, e.latlng.lng);
    },
  });
  return null;
};

// Location finder component
const LocationFinder = ({
  onLocate,
}: {
  onLocate: (lat: number, lng: number) => void;
}) => {
  const map = useMap();

  const handleLocate = () => {
    map.locate({ setView: true, maxZoom: 10 });
    map.on("locationfound", (e) => {
      onLocate(e.latlng.lat, e.latlng.lng);
    });
  };

  return (
    <button
      onClick={handleLocate}
      className="absolute top-4 right-4 z-[1000] p-3 rounded-xl glass-card hover:bg-star-white/20 transition-colors"
      title="Find my location"
    >
      <Navigation className="w-5 h-5 text-cosmic-glow" />
    </button>
  );
};

const InteractiveGlobe = () => {
  const ref = useRef<HTMLDivElement>(null);
  const [selectedRegion, setSelectedRegion] = useState<Region | null>(null);
  const [isHovering, setIsHovering] = useState<string | null>(null);
  const [userLocation, setUserLocation] = useState<{
    lat: number;
    lng: number;
  } | null>(null);
  const [mapKey, setMapKey] = useState(0);

  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "end start"],
  });

  const globeRotate = useTransform(scrollYProgress, [0, 1], [0, 30]);

  // Handle location selection
  const handleLocationClick = (lat: number, lng: number) => {
    setUserLocation({ lat, lng });
    // Find nearest region to the clicked location
    const distances = regions.map((r) => ({
      region: r,
      distance: Math.sqrt(Math.pow(r.lat - lat, 2) + Math.pow(r.lng - lng, 2)),
    }));
    const nearest = distances.sort((a, b) => a.distance - b.distance)[0];
    if (nearest) {
      setSelectedRegion(nearest.region);
    }
  };

  const handleLocate = (lat: number, lng: number) => {
    setUserLocation({ lat, lng });
    handleLocationClick(lat, lng);
  };

  // Force map re-render when component becomes visible
  useEffect(() => {
    const timer = setTimeout(() => setMapKey((prev) => prev + 1), 100);
    return () => clearTimeout(timer);
  }, []);

  const getStatusColor = (status: Region["status"]) => {
    switch (status) {
      case "visible":
        return "bg-green-500";
      case "partial":
        return "bg-amber-500";
      case "hidden":
        return "bg-gray-500";
    }
  };

  return (
    <section
      ref={ref}
      className="relative min-h-screen py-20 md:py-32 overflow-hidden"
    >
      {/* Background (Removed gradient) */}
      <div className="absolute inset-0" />

      <div className="container mx-auto px-4">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cosmic-glow/10 border border-cosmic-glow/20 mb-4">
            <MapPin className="w-4 h-4 text-cosmic-glow" />
            <span className="text-sm text-cosmic-glow font-medium">
              Personalized Tracking
            </span>
          </div>
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-heading font-bold mb-4">
            <span className="text-star-white">Your Sky, </span>
            <span className="text-gradient">Your Events</span>
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Every location sees space differently. SpaceScope adapts to your
            position on Earth.
          </p>
        </motion.div>

        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Interactive Map */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="relative aspect-[4/3] max-w-[600px] mx-auto w-full"
          >
            <div className="relative w-full h-full rounded-2xl overflow-hidden border border-cosmic-glow/30 shadow-2xl">
              <MapContainer
                key={mapKey}
                center={[20, 0]}
                zoom={2}
                style={{ height: "100%", width: "100%", background: "#0a0e27" }}
                zoomControl={false}
                className="z-0"
              >
                <TileLayer
                  url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
                  attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
                />
                <MapEventHandler onLocationClick={handleLocationClick} />
                <LocationFinder onLocate={handleLocate} />

                {/* Region markers */}
                {regions.map((region) => {
                  const icon = L.divIcon({
                    className: "custom-marker",
                    html: `
                      <div class="relative">
                        <div class="w-5 h-5 rounded-full ${getStatusColor(region.status)} border-2 border-white shadow-lg animate-pulse"></div>
                      </div>
                    `,
                    iconSize: [20, 20],
                  });

                  return (
                    <Marker
                      key={region.id}
                      position={[region.lat, region.lng]}
                      icon={icon}
                      eventHandlers={{
                        click: () => setSelectedRegion(region),
                      }}
                    >
                      <Popup>
                        <div className="text-sm">
                          <strong className="text-cosmic-glow">
                            {region.name}
                          </strong>
                          <div className="mt-1 text-xs">
                            <div>Visibility: {region.visibility}%</div>
                            <div>Best time: {region.localTime}</div>
                            <div>Direction: {region.direction}</div>
                          </div>
                        </div>
                      </Popup>
                    </Marker>
                  );
                })}

                {/* User location marker */}
                {userLocation && (
                  <Marker position={[userLocation.lat, userLocation.lng]}>
                    <Popup>
                      <div className="text-sm">
                        <strong className="text-cosmic-glow">
                          Your Location
                        </strong>
                        <div className="mt-1 text-xs">
                          {userLocation.lat.toFixed(4)}°,{" "}
                          {userLocation.lng.toFixed(4)}°
                        </div>
                      </div>
                    </Popup>
                  </Marker>
                )}
              </MapContainer>
            </div>

            {/* Map overlay instruction */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 1 }}
              className="absolute bottom-4 left-1/2 -translate-x-1/2 z-[1000] px-4 py-2 rounded-full glass-card border border-cosmic-glow/30"
            >
              <p className="text-xs text-star-white/80">
                Click on a region to see event visibility
              </p>
            </motion.div>
          </motion.div>

          {/* Info Card */}
          <motion.div
            initial={{ opacity: 0, x: 50 }}
            animate={{
              opacity: selectedRegion ? 1 : 0.5,
              x: selectedRegion ? 0 : 20,
            }}
            transition={{ type: "spring", stiffness: 200, damping: 20 }}
          >
            <div className="glass-card p-6 md:p-8 border-glow">
              {selectedRegion ? (
                <>
                  <div className="flex items-center justify-between mb-6">
                    <h3 className="text-2xl font-heading font-bold text-star-white">
                      {selectedRegion.name}
                    </h3>
                    <div
                      className={`px-3 py-1 rounded-full text-sm font-medium ${
                        selectedRegion.status === "visible"
                          ? "bg-green-500/20 text-green-400"
                          : "bg-amber-500/20 text-amber-400"
                      }`}
                    >
                      {selectedRegion.visibility}% Visible
                    </div>
                  </div>

                  <div className="space-y-4 mb-6">
                    <div className="flex items-center gap-4 p-3 rounded-xl bg-muted/50">
                      <Clock className="w-5 h-5 text-cosmic-glow flex-shrink-0" />
                      <div>
                        <p className="text-sm text-muted-foreground">
                          Best viewing time
                        </p>
                        <p className="text-star-white font-medium">
                          {selectedRegion.localTime}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-4 p-3 rounded-xl bg-muted/50">
                      <Compass className="w-5 h-5 text-cosmic-glow flex-shrink-0" />
                      <div>
                        <p className="text-sm text-muted-foreground">
                          Look towards
                        </p>
                        <p className="text-star-white font-medium">
                          {selectedRegion.direction}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-4 p-3 rounded-xl bg-muted/50">
                      <Eye className="w-5 h-5 text-cosmic-glow flex-shrink-0" />
                      <div>
                        <p className="text-sm text-muted-foreground">
                          Event visibility
                        </p>
                        <div className="w-full bg-muted rounded-full h-2 mt-1">
                          <div
                            className="h-2 rounded-full bg-gradient-cosmic"
                            style={{ width: `${selectedRegion.visibility}%` }}
                          />
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-col sm:flex-row gap-3">
                    <button className="btn-cosmic flex-1">
                      <Eye className="w-4 h-4 mr-2" />
                      AR View
                    </button>
                    <button className="btn-ghost-cosmic flex-1">
                      <Bell className="w-4 h-4 mr-2" />
                      Set Reminder
                    </button>
                  </div>

                  <button className="mt-4 flex items-center gap-2 text-sm text-muted-foreground hover:text-cosmic-glow transition-colors">
                    <Info className="w-4 h-4" />
                    Why does visibility vary?
                  </button>
                </>
              ) : (
                <div className="text-center py-8">
                  <MapPin className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-muted-foreground">
                    Click on a region to see event visibility
                  </p>
                </div>
              )}
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default InteractiveGlobe;
