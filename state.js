

const STATE_VERSION = 1;
const STORAGE_KEY = 'bits_path_state';

const STATE = {
  version: STATE_VERSION,
  currentSemester: 0,       
  revealedSemesters: [],    
  pathType: null,           
  forkChosen: false,        
  forkUIShown: false,       
  selections: {

  },
  activeSidebarContent: null, 
  activeGridSlot: null,       
  theme: 'light'              
};

function saveState() {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(STATE));
  } catch (e) {
    
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
    STATE.activeSidebarContent = null;  
    STATE.activeGridSlot      = null;   
    STATE.theme               = (saved.theme === 'dark') ? 'dark' : 'light';

  } catch (e) {
    console.warn('[STATE] Failed to parse localStorage state. Resetting to defaults.');
    localStorage.removeItem(STORAGE_KEY);
  }
}

function resetState() {
  localStorage.removeItem(STORAGE_KEY);

  STATE.version             = STATE_VERSION;
  STATE.currentSemester     = 0;
  STATE.revealedSemesters   = [];
  STATE.pathType            = null;
  STATE.forkChosen          = false;
  STATE.forkUIShown         = false;
  STATE.selections          = {};
  STATE.activeSidebarContent = null;
  STATE.activeGridSlot      = null;

  if (typeof renderApp === 'function') {
    renderApp();
  }
}
