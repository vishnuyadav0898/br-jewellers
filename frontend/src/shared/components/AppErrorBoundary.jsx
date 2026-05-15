import React from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { routes } from "../../config/routes";
import { isAdminPath } from "../utils/auth";

function ErrorFallback({ error, resetErrorBoundary }) {
  const location = useLocation();
  const navigate = useNavigate();
  const destination = isAdminPath(location.pathname) ? routes.adminDashboard : routes.appHome;

  const handleBack = () => {
    resetErrorBoundary();
    navigate(-1);
  };

  const handleRecover = () => {
    resetErrorBoundary();
    navigate(destination, { replace: true });
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-ivory px-6">
      <div className="glass-panel max-w-xl p-10 text-center">
        <p className="eyebrow">Something Broke</p>
        <h1 className="mt-4 font-display text-5xl text-espresso">BR Jewellers</h1>
        <p className="mt-4 text-sm leading-7 text-stone-600">
          This screen now resets automatically when you change routes, and you can safely go back
          to the previous page.
        </p>
        <p className="mt-2 text-xs leading-6 text-stone-500">
          {error?.message || "An unexpected rendering issue was caught by the app boundary."}
        </p>

        <div className="mt-6 flex flex-wrap justify-center gap-3">
          <button
            type="button"
            className="rounded-full border border-[#d7bf92] bg-white px-5 py-2 text-sm font-semibold text-[#20140f] transition hover:bg-[#f9f1df]"
            onClick={handleBack}
          >
            Go back
          </button>
          <button
            type="button"
            className="rounded-full border border-[#d7bf92] bg-[#1c120f] px-5 py-2 text-sm font-semibold text-[#f7eed9] transition hover:bg-[#2a1b16]"
            onClick={handleRecover}
          >
            {isAdminPath(location.pathname) ? "Open dashboard" : "Open home"}
          </button>
        </div>
      </div>
    </div>
  );
}

export class AppErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error) {
    console.error("Global error boundary caught:", error);
  }

  componentDidUpdate(prevProps) {
    if (this.state.hasError && prevProps.resetKey !== this.props.resetKey) {
      this.resetErrorBoundary();
    }
  }

  resetErrorBoundary = () => {
    this.setState({ hasError: false, error: null });
  };

  render() {
    if (this.state.hasError) {
      return this.props.fallbackRender({
        error: this.state.error,
        resetErrorBoundary: this.resetErrorBoundary,
      });
    }

    return this.props.children;
  }
}

export function RouteAwareErrorBoundary({ children }) {
  const location = useLocation();
  const resetKey = `${location.pathname}${location.search}${location.hash}`;

  return (
    <AppErrorBoundary
      resetKey={resetKey}
      fallbackRender={({ error, resetErrorBoundary }) => (
        <ErrorFallback error={error} resetErrorBoundary={resetErrorBoundary} />
      )}
    >
      {children}
    </AppErrorBoundary>
  );
}
