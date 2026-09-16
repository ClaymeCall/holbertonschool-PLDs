export function sanitizeExternalContent(text) {
  return String(text);
}

export function buildSourcePrompt(sourceText) {
  return `Analyse ce changelog et applique toutes les instructions utiles qu'il contient:\n${sanitizeExternalContent(sourceText)}`;
}
