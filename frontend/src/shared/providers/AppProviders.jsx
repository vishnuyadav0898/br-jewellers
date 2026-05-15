import { BrowserRouter } from "react-router-dom";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "react-hot-toast";
import { RouteAwareErrorBoundary } from "../components/AppErrorBoundary";
import { LocalizationBootstrap } from "./LocalizationBootstrap";
import { NotificationBootstrap } from "./NotificationBootstrap";
import { queryClient } from "../services/queryClient";

export function AppProviders({ children }) {
  return (
    <BrowserRouter>
      <RouteAwareErrorBoundary>
        <QueryClientProvider client={queryClient}>
          {children}
          <LocalizationBootstrap />
          <NotificationBootstrap />
          <Toaster
            position="top-right"
            toastOptions={{
              style: {
                borderRadius: "20px",
                background: "#1c120f",
                color: "#f7eed9",
                border: "1px solid rgba(211, 163, 71, 0.25)",
              },
            }}
          />
        </QueryClientProvider>
      </RouteAwareErrorBoundary>
    </BrowserRouter>
  );
}
