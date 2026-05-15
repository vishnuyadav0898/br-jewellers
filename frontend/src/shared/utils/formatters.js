const getLocale = (language = "en") => (language === "hi" ? "hi-IN" : "en-IN");

const getValidDate = (value) => {
  if (!value) return null;

  const date = value instanceof Date ? value : new Date(value);
  return Number.isNaN(date.getTime()) ? null : date;
};

export const formatDate = (value, language = "en", fallback = "Not available") => {
  const date = getValidDate(value);

  if (!date) return fallback;

  return new Intl.DateTimeFormat(getLocale(language), {
    dateStyle: "medium",
  }).format(date);
};

export const formatDateTime = (value, language = "en", fallback = "Not available") => {
  const date = getValidDate(value);

  if (!date) return fallback;

  return new Intl.DateTimeFormat(getLocale(language), {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(date);
};

export const getInitials = (value = "") =>
  value
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join("");

export const getStatusTone = (value = "") => {
  const normalized = value.toLowerCase();

  if (["approved", "delivered", "paid", "active"].includes(normalized)) {
    return "bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200";
  }

  if (["pending", "processing", "ordered", "shipped"].includes(normalized)) {
    return "bg-amber-50 text-amber-700 ring-1 ring-amber-200";
  }

  return "bg-rose-50 text-rose-700 ring-1 ring-rose-200";
};
