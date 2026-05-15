import { EmptyState } from "../../shared/components/EmptyState";
import { Loader } from "../../shared/components/Loader";

export function AdminDataState({
  query,
  empty = false,
  emptyTitle = "Nothing to show yet",
  emptyDescription = "Mock data or saved records will appear here.",
  loadingLabel = "Loading admin data...",
  missingDataTitle = "No data available",
  missingDataDescription = "The demo data did not return a usable response yet. Refresh and try again.",
  children,
}) {
  if (query.isPending || query.isLoading) {
    return <Loader label={loadingLabel} />;
  }

  if (query.isError) {
    return (
      <EmptyState
        title="Something went wrong"
        description={query.error?.message || "Please try again in a moment."}
      />
    );
  }

  if (query.data == null) {
    return (
      <EmptyState
        title={missingDataTitle}
        description={missingDataDescription}
      />
    );
  }

  if (empty) {
    return <EmptyState title={emptyTitle} description={emptyDescription} />;
  }

  return typeof children === "function" ? children(query.data, query) : children;
}
