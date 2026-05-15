import { useEffect } from "react";
import { AppRoutes } from "./routes/AppRoutes";
import { useAppStore } from "./shared/store/useAppStore";

function App() {
  const initializePreferences = useAppStore((state) => state.initializePreferences);

  useEffect(() => {
    initializePreferences();
  }, [initializePreferences]);

  return (
    <AppRoutes />
  );
}

export default App;
