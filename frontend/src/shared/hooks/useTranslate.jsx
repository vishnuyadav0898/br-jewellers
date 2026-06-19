/**
 * Custom hook to translate text dynamically (reverted to return the original text directly in English)
 * @param {string} text - The input text in English
 */
export function useTranslateText(text) {
  return { translatedText: text || "", isLoading: false };
}

/**
 * Declarative component to wrap and translate child text (reverted to render children directly in English)
 */
export function Translate({ children }) {
  return <>{children}</>;
}
