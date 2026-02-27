// app.js — event wiring and application logic

function initApp() {
  loadState();
  applyTheme();
  renderApp();
  attachEventListeners();
}

function attachEventListeners() {
  const view = document.getElementById('view');
  if (view) {
    view.addEventListener('click', handleViewClick);
    view.addEventListener('dblclick', handleViewDblClick);
    view.addEventListener('keydown', handleViewKeydown);
  }

  const sidebar = document.getElementById('sidebar');
  if (sidebar) {
    sidebar.addEventListener('click', handleSidebarClick);
  }

  const continueBtn = document.getElementById('continue-btn');
  if (continueBtn) {
    continueBtn.addEventListener('click', handleContinue);
  }
}

function handleViewClick(e) {
  // Close grid if click lands outside it and outside its trigger slot
  if (STATE.activeGridSlot) {
    const clickedGrid = e.target.closest('.grid-picker');
    const clickedSlotNode = e.target.closest(`[data-slot="${STATE.activeGridSlot}"]`);
    if (!clickedGrid && !clickedSlotNode) {
      STATE.activeGridSlot = null;
      saveState();
      renderTree();
      renderSemesterOverview(STATE.currentSemester);
      return;
    }
  }

  const target = e.target.closest('[data-action]');
  if (!target) return;

  const action = target.dataset.action;

  switch (action) {
    case 'start':
      onStart();
      break;

    case 'sem-label':
      onSemLabelClick(parseInt(target.dataset.semester, 10));
      break;

    case 'course-info': {
      const code = target.dataset.course;
      const slot = target.dataset.slot || null;
      renderCourseInfo(code, slot);
      break;
    }

    case 'open-grid': {
      const slotKey = target.dataset.slot;
      onOpenGrid(slotKey);
      break;
    }

    case 'locked-slot':
      break;

    case 'grid-card': {
      const code = target.dataset.course;
      const slot = target.dataset.slot;
      onGridCardClick(code, slot);
      break;
    }

    case 'grid-tab': {
      const tab = target.dataset.tab;
      const slot = target.dataset.slot;
      onGridTabClick(tab, slot);
      break;
    }

    default:
      break;
  }
}

function handleViewKeydown(e) {
  if (e.key !== 'Enter' && e.key !== ' ') return;
  const target = e.target.closest('[data-action]');
  if (!target) return;
  e.preventDefault();
  target.click();
}

/**
 * Double-click a grid card to instantly select it.
 * Locked and duplicate cards are ignored.
 */
function handleViewDblClick(e) {
  const card = e.target.closest('[data-action="grid-card"]');
  if (!card) return;
  if (card.classList.contains('is-locked-prereq') || card.classList.contains('is-duplicate')) return;

  const code = card.dataset.course;
  const slot = card.dataset.slot;
  if (!code || !slot) return;

  STATE.activeSidebarContent = { type: 'course-info', courseCode: code, slotKey: slot };
  onSelectCourse();
}

function handleSidebarClick(e) {
  const target = e.target.closest('[data-action]');
  if (!target) return;

  const action = target.dataset.action;

  switch (action) {
    case 'toggle-theme':
      onToggleTheme();
      break;

    case 'reset-btn':
      onResetBtnClick();
      break;

    case 'reset-confirm-yes':
      onResetConfirm();
      break;

    case 'reset-confirm-cancel':
      onResetCancel();
      break;

    case 'select-course':
      onSelectCourse();
      break;

    case 'fork-choice': {
      const pathType = target.dataset.pathtype;
      onForkChoice(pathType);
      break;
    }

    case 'show-fork-ui':
      renderForkUI();
      break;

    default:
      break;
  }
}

function onStart() {
  STATE.currentSemester = 1;
  STATE.revealedSemesters = [1];
  saveState();
  renderTree(1);
  renderSemesterOverview(1);
  updateContinueButton();
}

function onSemLabelClick(semNum) {
  if (!STATE.revealedSemesters.includes(semNum)) return;
  renderSemesterOverview(semNum);
}

function onOpenGrid(slotKey) {
  if (STATE.activeGridSlot === slotKey) {
    STATE.activeGridSlot = null;
    saveState();
    renderTree();
    renderSemesterOverview(STATE.currentSemester);
    return;
  }

  STATE.activeGridSlot = slotKey;
  saveState();
  renderTree();

  const slotLabel = _getSlotLabel(slotKey);
  renderGridPrompt(slotKey, slotLabel);
}

function onGridCardClick(courseCode, slotKey) {
  renderCourseInfo(courseCode, slotKey);
}

// Re-renders grid cards in-place when a filter tab is clicked.
function onGridTabClick(tab, slotKey) {
  const existingGrid = document.querySelector(`.grid-picker[data-slot="${slotKey}"]`);
  if (!existingGrid) return;

  const activeTabEl = existingGrid.querySelector('.grid-tab.is-active');
  if (activeTabEl) activeTabEl.classList.remove('is-active');
  const newActiveTab = existingGrid.querySelector(`.grid-tab[data-tab="${tab}"]`);
  if (newActiveTab) newActiveTab.classList.add('is-active');

  const cardsEl = existingGrid.querySelector('.grid-cards');
  if (!cardsEl) return;

  const { courses, tabType } = getPoolForSlot(slotKey);
  const filtered = filterCoursesByTab(courses, tab, tabType);
  const selectedCode = STATE.selections[slotKey];

  cardsEl.innerHTML = '';

  for (const code of filtered) {
    const course = CURRICULUM.courses[code];
    if (!course) continue;

    const prereqStatus = getPrereqStatus(code);
    const hasUnmetPrereqs = prereqStatus.some(p => !p.met);
    const isDuplicate = isDuplicateInOtherSlot(code, slotKey);
    const isSelected = selectedCode === code;

    const wrapper = document.createElement('div');
    wrapper.className = 'grid-card-wrapper tooltip-wrapper';

    const card = document.createElement('div');
    card.className = 'grid-card';
    card.setAttribute('role', 'button');
    card.setAttribute('tabindex', hasUnmetPrereqs || isDuplicate ? '-1' : '0');
    card.dataset.action = 'grid-card';
    card.dataset.course = code;
    card.dataset.slot = slotKey;

    if (isSelected) card.classList.add('is-selected');
    if (isDuplicate) {
      card.classList.add('is-duplicate');
      card.setAttribute('aria-disabled', 'true');
    } else if (hasUnmetPrereqs) {
      card.classList.add('is-locked-prereq');
      card.setAttribute('aria-disabled', 'true');
    }

    const titleEl = document.createElement('div');
    titleEl.className = 'grid-card-title';
    titleEl.textContent = course.title;

    const metaEl = document.createElement('div');
    metaEl.className = 'grid-card-meta';
    metaEl.textContent = `${code} · ${course.units}u`;

    card.appendChild(titleEl);
    card.appendChild(metaEl);
    wrapper.appendChild(card);

    if (hasUnmetPrereqs && !isDuplicate) {
      const tooltip = document.createElement('div');
      tooltip.className = 'tooltip-box';
      const missingNames = prereqStatus.filter(p => !p.met).map(p => p.title).join(', ');
      const labelSpan = document.createElement('span');
      labelSpan.className = 'tooltip-missing-label';
      labelSpan.textContent = 'Missing: ';
      const coursesSpan = document.createElement('span');
      coursesSpan.className = 'tooltip-missing-courses';
      coursesSpan.textContent = missingNames;
      tooltip.appendChild(labelSpan);
      tooltip.appendChild(coursesSpan);
      wrapper.appendChild(tooltip);
    } else if (isDuplicate) {
      const tooltip = document.createElement('div');
      tooltip.className = 'tooltip-box';
      tooltip.textContent = 'Already chosen in another slot.';
      wrapper.appendChild(tooltip);
    }

    cardsEl.appendChild(wrapper);
  }
}

function onSelectCourse() {
  const ctx = STATE.activeSidebarContent;
  if (!ctx || ctx.type !== 'course-info' || !ctx.slotKey) return;

  const { courseCode, slotKey } = ctx;

  STATE.selections[slotKey] = courseCode;
  STATE.activeGridSlot = null;
  saveState();

  renderTree();
  renderCourseInfo(courseCode, slotKey);
  updateContinueButton();
}

function handleContinue() {
  if (STATE.currentSemester === 0) return;

  const semDef = CURRICULUM.semesters[STATE.currentSemester];
  if (!semDef) return;

  if (!isSemesterComplete(STATE.currentSemester)) return;

  // Sem 6: show fork UI first if not yet shown
  if (STATE.currentSemester === 6 && !STATE.forkUIShown && !STATE.forkChosen) {
    STATE.forkUIShown = true;
    saveState();
    renderForkUI();
    renderTree();
    updateContinueButton();
    return;
  }

  // Programme complete at Sem 8
  if (STATE.currentSemester === 8) {
    STATE.forkChosen = true;
    saveState();
    renderEndCard('BSCH');
    return;
  }

  const nextSem = STATE.currentSemester + 1;

  // BSc path ends after Sem 6
  if (nextSem > 6 && STATE.pathType === 'BSC') {
    renderEndCard('BSC');
    return;
  }

  STATE.currentSemester = nextSem;
  if (!STATE.revealedSemesters.includes(nextSem)) {
    STATE.revealedSemesters.push(nextSem);
  }
  STATE.activeGridSlot = null;
  saveState();

  renderTree(nextSem);
  renderSemesterOverview(nextSem);
  updateContinueButton();

  setTimeout(() => {
    const newBlock = document.querySelector(`.semester-block[data-semester="${nextSem}"]`);
    if (newBlock) {
      newBlock.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }, 350);
}

function onForkChoice(pathType) {
  STATE.pathType = pathType;
  STATE.forkChosen = true;
  saveState();

  _renderForkUI();
  renderTree();

  if (pathType === 'BSC') {
    renderEndCard('BSC');
  } else {
    const nextSem = 7;
    STATE.currentSemester = nextSem;
    if (!STATE.revealedSemesters.includes(nextSem)) {
      STATE.revealedSemesters.push(nextSem);
    }
    saveState();

    renderTree(nextSem);
    renderSemesterOverview(nextSem);
    updateContinueButton();

    setTimeout(() => {
      const newBlock = document.querySelector(`.semester-block[data-semester="${nextSem}"]`);
      if (newBlock) {
        newBlock.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    }, 350);
  }
}

function onToggleTheme() {
  STATE.theme = STATE.theme === 'dark' ? 'light' : 'dark';
  saveState();
  applyTheme();
  updateThemeButton();
}

function updateThemeButton() {
  const btn = document.getElementById('theme-toggle-btn');
  if (!btn) return;
  btn.textContent = STATE.theme === 'dark' ? '[ light ]' : '[ dark ]';
  btn.setAttribute('aria-label', STATE.theme === 'dark' ? 'Switch to light theme' : 'Switch to dark theme');
}

function onResetBtnClick() {
  const initial = document.getElementById('reset-btn-initial');
  const confirm = document.getElementById('reset-confirm');
  if (initial) initial.classList.add('is-hidden');
  if (confirm) confirm.classList.add('is-visible');
}

function onResetConfirm() {
  const initial = document.getElementById('reset-btn-initial');
  const confirm = document.getElementById('reset-confirm');
  if (initial) initial.classList.remove('is-hidden');
  if (confirm) confirm.classList.remove('is-visible');
  resetState();
  updateThemeButton();
}

function onResetCancel() {
  const initial = document.getElementById('reset-btn-initial');
  const confirm = document.getElementById('reset-confirm');
  if (initial) initial.classList.remove('is-hidden');
  if (confirm) confirm.classList.remove('is-visible');
}

// Finds the human-readable label for a slot key.
function _getSlotLabel(slotKey) {
  for (const [, semDef] of Object.entries(CURRICULUM.semesters)) {
    for (const opt of semDef.optionals || []) {
      if (opt.slotKey === slotKey) return opt.label;
    }
    for (const elec of semDef.electives || []) {
      if (elec.slotKey === slotKey) return elec.label;
    }
  }
  return slotKey;
}

document.addEventListener('DOMContentLoaded', initApp);
