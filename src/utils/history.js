const HISTORY_KEY = "verity_scan_history";
const MAX_ITEMS = 100;

export function getHistory() {
  try {
    const raw = localStorage.getItem(HISTORY_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export function addToHistory(entry) {
  try {
    const history = getHistory();
    history.push(entry);
    // Keep only last MAX_ITEMS
    const trimmed = history.slice(-MAX_ITEMS);
    localStorage.setItem(HISTORY_KEY, JSON.stringify(trimmed));
  } catch (e) {
    console.warn("Could not save to history:", e);
  }
}

export function clearHistory() {
  try {
    localStorage.removeItem(HISTORY_KEY);
  } catch {}
}
