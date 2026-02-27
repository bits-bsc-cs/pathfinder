// state.js — runtime state and localStorage persistence

const STATE_VERSION = 1;
const STORAGE_KEY = 'bits_path_state';

const STATE = {
  version: STATE_VERSION,
  currentSemester: 0,       // 0 = not started, 1–8 = active semester
  revealedSemesters: [],    // semester numbers revealed so far
  pathType: null,           // null | 'BSC' | 'BSCH'
  forkChosen: false,        // whether the Sem 6 fork decision has been made
  forkUIShown: false,       // true after the user clicks "Finish Semester 6"
  selections: {
    // Key: slot identifier, Value: course code string
    // e.g. "SCIENCE_ELECTIVE": "BCS ZC223"
  },
  activeSidebarContent: null, // describes what the sidebar is currently showing
  activeGridSlot: null,       // slotKey of the open grid; null if none
  theme: 'light'              // 'light' | 'dark'
};

function saveState() {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(STATE));
  } catch (e) {
    // Storage may be unavailable in private browsing or when quota is exceeded
  }
}

function loadState() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return;

    const saved = JSON.parse(raw);

    if (saved.version !== STATE_VERSION) {
      console.warn(
        `[STATE] localStorage version mismatch (saved: ${saved.version}, expected: ${STATE_VERSION}). ` +
        'Resetting to defaults.'
      );
      localStorage.removeItem(STORAGE_KEY);
      return;
    }

    STATE.currentSemester     = typeof saved.currentSemester === 'number' ? saved.currentSemester : 0;
    STATE.revealedSemesters   = Array.isArray(saved.revealedSemesters) ? saved.revealedSemesters : [];
    STATE.pathType            = saved.pathType ?? null;
    STATE.forkChosen          = typeof saved.forkChosen === 'boolean' ? saved.forkChosen : false;
    STATE.forkUIShown         = typeof saved.forkUIShown === 'boolean' ? saved.forkUIShown : false;
    STATE.selections          = (saved.selections && typeof saved.selections === 'object') ? saved.selections : {};
    STATE.activeSidebarContent = null;  // never restore; recomputed on init
    STATE.activeGridSlot      = null;   // never restore; grids should not re-open after reload
    STATE.theme               = (saved.theme === 'dark') ? 'dark' : 'light';

  } catch (e) {
    console.warn('[STATE] Failed to parse localStorage state. Resetting to defaults.');
    localStorage.removeItem(STORAGE_KEY);
  }
}

function resetState() {
  localStorage.removeItem(STORAGE_KEY);

  // Reset all fields in-place so external references to STATE remain valid
  STATE.version             = STATE_VERSION;
  STATE.currentSemester     = 0;
  STATE.revealedSemesters   = [];
  STATE.pathType            = null;
  STATE.forkChosen          = false;
  STATE.forkUIShown         = false;
  STATE.selections          = {};
  STATE.activeSidebarContent = null;
  STATE.activeGridSlot      = null;
  // theme is intentionally NOT reset — visual preference persists across resets

  if (typeof renderApp === 'function') {
    renderApp();
  }
}
