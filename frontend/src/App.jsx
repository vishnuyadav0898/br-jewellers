import { useEffect } from "react";
import { AppRoutes } from "./routes/AppRoutes";
import { useAppStore } from "./shared/store/useAppStore";

function App() {
  const initializePreferences = useAppStore((state) => state.initializePreferences);
  const setCurrency = useAppStore((state) => state.setCurrency);

  useEffect(() => {
    initializePreferences();

    const manuallySetKey = "br_currency_manually_set";
    const isManuallySet = localStorage.getItem(manuallySetKey);

    if (isManuallySet !== "true") {
      const hasAutoDetected = localStorage.getItem("br_currency_auto_detected");
      if (hasAutoDetected !== "true") {
        if (navigator.geolocation) {
          navigator.geolocation.getCurrentPosition(
            (position) => {
              const { latitude, longitude } = position.coords;
              // India Bounding Box: Latitude [6.0, 37.5], Longitude [68.0, 98.0]
              const isIndia =
                latitude >= 6.0 &&
                latitude <= 37.5 &&
                longitude >= 68.0 &&
                longitude <= 98.0;

              setCurrency(isIndia ? "INR" : "USD");
              localStorage.setItem("br_currency_auto_detected", "true");
            },
            (error) => {
              // Geolocation blocked or failed -> leave currency as timezone-detected default
              localStorage.setItem("br_currency_auto_detected", "true");
            },
            { timeout: 3000 }
          );
        }
      }
    }
  }, [initializePreferences, setCurrency]);

  return (
    <AppRoutes />
  );
}

export default App;
