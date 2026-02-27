// render.js — DOM rendering. Reads STATE + CURRICULUM, writes DOM. Never mutates STATE.

// ─── Helpers ─────────────────────────────────────────────────────────────────

// All course codes currently "in the path": every selection + every fixed course
// from all revealed semesters.
function getCoursesInPath() {
  const codes = new Set(Object.values(STATE.selections));
  for (const semNum of STATE.revealedSemesters) {
    const semDef = CURRICULUM.semesters[semNum];
    if (semDef) {
      for (const code of semDef.fixed) codes.add(code);
    }
  }
  return codes;
}

// Returns [{ code, title, met }] for every prereq of a course (explicit + implicit).
function getPrereqStatus(courseCode) {
  const inPath = getCoursesInPath();
  const prereqs  = CURRICULUM.courses[courseCode]?.prereqs ?? [];
  const implicit = CURRICULUM.implicitPrereqs[courseCode] ?? [];
  return [...prereqs, ...implicit].map(prereqCode => ({
    code:  prereqCode,
    title: CURRICULUM.courses[prereqCode]?.title ?? prereqCode,
    met:   inPath.has(prereqCode)
  }));
}

// Returns true if the course selected for slotKey is depended on by another
// selection — meaning swapping it would break a prereq chain.
function isSlotLocked(slotKey) {
  const currentSelection = STATE.selections[slotKey];
  if (!currentSelection) return false;
  const others = Object.entries(STATE.selections)
    .filter(([k]) => k !== slotKey)
    .map(([, v]) => v);
  return others.some(code => (CURRICULUM.courses[code]?.prereqs ?? []).includes(currentSelection));
}

// Returns true if courseCode is already chosen in a different slot.
function isDuplicateInOtherSlot(courseCode, slotKey) {
  for (const [k, v] of Object.entries(STATE.selections)) {
    if (k !== slotKey && v === courseCode) return true;
  }
  return false;
}

// Returns { courses, tabType } for the given slot key.
function getPoolForSlot(slotKey) {
  if (
    slotKey === 'DISCIPLINE_ELECTIVE_1' ||
    slotKey === 'DISCIPLINE_ELECTIVE_2' ||
    slotKey === 'DISCIPLINE_ELECTIVE_3' ||
    slotKey === 'DISCIPLINE_ELECTIVE_4'
  ) {
    return { courses: CURRICULUM.bscElectives, tabType: 'none' };
  }

  if (slotKey === 'OPEN_ELECTIVE_SEM7_1' || slotKey === 'OPEN_ELECTIVE_SEM7_2') {
    return { courses: CURRICULUM.openElectives, tabType: 'open_only' };
  }

  if (
    slotKey === 'DISC_OR_OPEN_SEM7' ||
    slotKey === 'OPEN_OR_DISC_SEM8_1' ||
    slotKey === 'OPEN_OR_DISC_SEM8_2'
  ) {
    return {
      courses: [...CURRICULUM.disciplineElectives, ...CURRICULUM.openElectives],
      tabType: 'mixed'
    };
  }

  if (slotKey === 'DISC_OR_MINI_SEM8') {
    return { courses: CURRICULUM.disciplineElectives, tabType: 'discipline' };
  }

  if (
    slotKey === 'DISC_ELECTIVE_SEM7_1' ||
    slotKey === 'DISC_ELECTIVE_SEM7_2' ||
    slotKey === 'DISC_ELECTIVE_SEM7_OPT' ||
    slotKey === 'DISC_ELECTIVE_SEM8_1' ||
    slotKey === 'DISC_ELECTIVE_SEM8_2' ||
    slotKey === 'DISC_ELECTIVE_SEM8_OPT'
  ) {
    return { courses: CURRICULUM.disciplineElectives, tabType: 'discipline' };
  }

  // Optional slots — pull choices from the semester definition.
  for (const [, semDef] of Object.entries(CURRICULUM.semesters)) {
    for (const opt of semDef.optionals || []) {
      if (opt.slotKey === slotKey) return { courses: opt.choices, tabType: 'none' };
    }
  }

  return { courses: [], tabType: 'none' };
}

// Fades out sidebar content, calls renderFn, then fades back in.
function swapSidebarContent(renderFn) {
  const content = document.getElementById('sidebar-content');
  if (!content) { renderFn(); return; }
  content.classList.add('is-fading');
  setTimeout(() => {
    renderFn();
    content.classList.remove('is-fading');
  }, 200);
}


// ─── Tree ─────────────────────────────────────────────────────────────────────

// Full tree re-render. If animateSemester is set, that block gets the staggered reveal.
function renderTree(animateSemester = null) {
  const treeEl = document.getElementById('tree');
  if (!treeEl) return;

  const trunkEl = document.getElementById('trunk-line');
  if (trunkEl) trunkEl.style.display = STATE.revealedSemesters.length > 0 ? 'block' : 'none';

  const startNode = document.getElementById('start-node');
  if (startNode) startNode.style.display = STATE.currentSemester === 0 ? 'flex' : 'none';

  treeEl.querySelectorAll('.semester-block').forEach(el => el.remove());
  const existingFork = treeEl.querySelector('#fork-container');
  if (existingFork) existingFork.remove();

  // Sems 1–6 first, then the fork visual, then Sems 7–8
  for (const semNum of STATE.revealedSemesters) {
    if (semNum <= 6) treeEl.appendChild(renderSemesterBlock(semNum, semNum === animateSemester));
  }

  if (STATE.forkUIShown || STATE.forkChosen) renderForkVisual(treeEl);

  for (const semNum of STATE.revealedSemesters) {
    if (semNum >= 7) treeEl.appendChild(renderSemesterBlock(semNum, semNum === animateSemester));
  }

  updateContinueButton();
}

// Builds a semester block element. animate=true triggers the staggered reveal.
function renderSemesterBlock(semNum, animate) {
  const semDef = CURRICULUM.semesters[semNum];
  if (!semDef) return document.createElement('div');

  const block = document.createElement('div');
  block.className = 'semester-block';
  block.dataset.semester = semNum;

  if (!animate) block.classList.add('no-animate', 'is-revealed');

  // Running unit total across all revealed semesters up to and including this one.
  const cumulative = STATE.revealedSemesters
    .filter(n => n <= semNum)
    .reduce((sum, n) => sum + (CURRICULUM.semesters[n]?.units ?? 0), 0);

  const labelNode = document.createElement('div');
  labelNode.className = 'semester-label-node';
  labelNode.setAttribute('role', 'button');
  labelNode.setAttribute('tabindex', '0');
  labelNode.dataset.action = 'sem-label';
  labelNode.dataset.semester = semNum;

  const labelSpan = document.createElement('span');
  labelSpan.className = 'sem-label';
  labelSpan.textContent = semDef.label;

  const unitsSpan = document.createElement('span');
  unitsSpan.className = 'sem-units';
  unitsSpan.textContent = `${semDef.units}u · ${cumulative}u total`;

  labelNode.appendChild(labelSpan);
  labelNode.appendChild(unitsSpan);
  block.appendChild(labelNode);

  const subtree = document.createElement('div');
  subtree.className = 'semester-subtree';
  let nodeIndex = 0;

  for (const code of semDef.fixed) {
    subtree.appendChild(renderCourseNode(code, null, nodeIndex, animate));
    nodeIndex++;
  }

  for (const opt of semDef.optionals || []) {
    subtree.appendChild(renderSlotNode(opt.slotKey, opt.label, 'optional', nodeIndex, animate));
    nodeIndex++;
    if (STATE.activeGridSlot === opt.slotKey) {
      subtree.appendChild(renderGrid(opt.slotKey));
    }
  }

  for (const elec of semDef.electives || []) {
    subtree.appendChild(renderSlotNode(elec.slotKey, elec.label, 'elective', nodeIndex, animate));
    nodeIndex++;
    if (STATE.activeGridSlot === elec.slotKey) {
      subtree.appendChild(renderGrid(elec.slotKey));
    }
  }

  block.appendChild(subtree);

  if (animate) {
    // Double rAF ensures the browser has painted the initial hidden state before transitioning.
    requestAnimationFrame(() => {
      requestAnimationFrame(() => block.classList.add('is-revealed'));
    });
  }

  return block;
}

// Builds a course row for a fixed course.
function renderCourseNode(courseCode, slotKey, nodeIndex, animate) {
  const course = CURRICULUM.courses[courseCode];
  if (!course) return document.createElement('div');

  const row = document.createElement('div');
  row.className = 'course-row';

  const node = document.createElement('div');
  node.className = 'node' + (course.type === 'project' ? ' node-project' : '');
  node.setAttribute('role', 'button');
  node.setAttribute('tabindex', '0');
  node.dataset.action = 'course-info';
  node.dataset.course = courseCode;
  if (slotKey) node.dataset.slot = slotKey;

  if (animate) {
    node.style.opacity = '0';
    node.style.transitionDelay = `${Math.min(nodeIndex * 0.06, 0.4)}s`;
    requestAnimationFrame(() => requestAnimationFrame(() => { node.style.opacity = '1'; }));
  }

  const titleEl = document.createElement('div');
  titleEl.className = 'node-title';
  titleEl.textContent = course.title;

  const metaEl = document.createElement('div');
  metaEl.className = 'node-meta';
  metaEl.textContent = `${courseCode} · ${course.units}u`;

  node.appendChild(titleEl);
  node.appendChild(metaEl);

  const prereqStatus = getPrereqStatus(courseCode);
  if (prereqStatus.length > 0) {
    const badgesEl = document.createElement('div');
    badgesEl.className = 'node-badges';
    for (const p of prereqStatus) {
      const badge = document.createElement('span');
      badge.className = `node-badge ${p.met ? 'met' : 'unmet'}`;
      badge.innerHTML = `<span class="badge-mark">${p.met ? '✓' : '✕'}</span><span class="badge-text"> ${p.title}</span>`;
      badgesEl.appendChild(badge);
    }
    node.appendChild(badgesEl);
  }

  row.appendChild(node);
  return row;
}

// Builds a slot node row — filled or empty, optional or elective.
function renderSlotNode(slotKey, slotLabel, slotType, nodeIndex, animate) {
  const selectedCode = STATE.selections[slotKey];
  const row = document.createElement('div');
  row.className = 'course-row';

  const locked = isSlotLocked(slotKey);
  const isActiveGrid = STATE.activeGridSlot === slotKey;

  if (selectedCode) {
    const course = CURRICULUM.courses[selectedCode];
    const node = document.createElement('div');
    node.className = 'node node-slot is-filled' +
                     (isActiveGrid ? ' is-active-grid' : '') +
                     (locked ? ' is-locked' : '');
    node.setAttribute('role', 'button');
    node.setAttribute('tabindex', '0');
    node.dataset.action = locked ? 'locked-slot' : 'open-grid';
    node.dataset.slot = slotKey;
    node.dataset.course = selectedCode;

    if (animate) {
      node.style.opacity = '0';
      node.style.transitionDelay = `${Math.min(nodeIndex * 0.06, 0.4)}s`;
      requestAnimationFrame(() => requestAnimationFrame(() => { node.style.opacity = '1'; }));
    }

    const checkEl = document.createElement('div');
    checkEl.className = 'node-title';
    checkEl.textContent = `✓ ${course ? course.title : selectedCode}`;

    const metaEl = document.createElement('div');
    metaEl.className = 'node-meta';
    metaEl.textContent = `${selectedCode} · ${course ? course.units + 'u' : ''}`;

    const slotLabelEl = document.createElement('div');
    slotLabelEl.className = 'node-slot-label';
    slotLabelEl.textContent = slotLabel;

    node.appendChild(checkEl);
    node.appendChild(metaEl);
    node.appendChild(slotLabelEl);

    if (locked) {
      const tooltipWrapper = document.createElement('div');
      tooltipWrapper.className = 'tooltip-wrapper';
      const dependents = Object.values(STATE.selections).filter(code => {
        return (CURRICULUM.courses[code]?.prereqs ?? []).includes(selectedCode);
      });
      const depNames = dependents.map(c => CURRICULUM.courses[c]?.title ?? c).join(', ');
      const tooltip = document.createElement('div');
      tooltip.className = 'tooltip-box';
      tooltip.textContent = `Can't change — ${depNames} in your path depends on this.`;
      tooltipWrapper.appendChild(node);
      tooltipWrapper.appendChild(tooltip);
      row.appendChild(tooltipWrapper);
    } else {
      row.appendChild(node);
    }
  } else {
    const node = document.createElement('div');
    node.className = 'node node-slot' + (isActiveGrid ? ' is-active-grid' : '');
    node.setAttribute('role', 'button');
    node.setAttribute('tabindex', '0');
    node.dataset.action = 'open-grid';
    node.dataset.slot = slotKey;

    if (animate) {
      node.style.opacity = '0';
      node.style.transitionDelay = `${Math.min(nodeIndex * 0.06, 0.4)}s`;
      requestAnimationFrame(() => requestAnimationFrame(() => { node.style.opacity = '1'; }));
    }

    const labelEl = document.createElement('div');
    labelEl.className = 'node-title';
    labelEl.textContent = slotLabel;

    const hintEl = document.createElement('div');
    hintEl.className = 'node-pick-hint';
    hintEl.textContent = '[ pick a course ]';

    node.appendChild(labelEl);
    node.appendChild(hintEl);
    row.appendChild(node);
  }

  return row;
}

// Renders the fork visual: BSc branch + dashed Hons trunk extension + Hons branch.
function renderForkVisual(treeEl) {
  const forkEl = document.createElement('div');
  forkEl.id = 'fork-container';
  forkEl.className = 'fork-container is-visible';

  const bscBranch = document.createElement('div');
  bscBranch.className = 'fork-bsc-branch';

  const bscTerminal = document.createElement('div');
  bscTerminal.className = 'terminal-node';

  const bscDot = document.createElement('div');
  bscDot.className = 'terminal-dot' + (STATE.pathType === 'BSC' ? ' is-active' : '');

  const bscLabel = document.createElement('span');
  bscLabel.className = 'terminal-label';
  bscLabel.textContent = 'End — BSc Computer Science';

  bscTerminal.appendChild(bscDot);
  bscTerminal.appendChild(bscLabel);
  bscBranch.appendChild(bscTerminal);
  forkEl.appendChild(bscBranch);

  const honsIndicator = document.createElement('div');
  honsIndicator.className = 'fork-hons-indicator';
  forkEl.appendChild(honsIndicator);

  const honsBranch = document.createElement('div');
  honsBranch.className = 'fork-hons-branch';

  const honsTerminal = document.createElement('div');
  honsTerminal.className = 'terminal-node';

  const honsDot = document.createElement('div');
  honsDot.className = 'terminal-dot' + (STATE.pathType === 'BSCH' ? ' is-active' : '');

  const honsLabel = document.createElement('span');
  honsLabel.className = 'terminal-label';
  honsLabel.textContent = 'End — BSc (Honours) Computer Science';

  honsTerminal.appendChild(honsDot);
  honsTerminal.appendChild(honsLabel);
  honsBranch.appendChild(honsTerminal);
  forkEl.appendChild(honsBranch);

  treeEl.appendChild(forkEl);
}

// Builds the inline elective/optional grid below its slot node.
function renderGrid(slotKey) {
  const { courses, tabType } = getPoolForSlot(slotKey);
  const selectedCode = STATE.selections[slotKey];

  const gridEl = document.createElement('div');
  gridEl.className = 'grid-picker';
  gridEl.dataset.slot = slotKey;
  gridEl.dataset.action = 'grid-container';

  const helpText = document.createElement('p');
  helpText.className = 'grid-help-text';
  helpText.textContent = 'Click on a course to see more about it in the sidebar.';
  gridEl.appendChild(helpText);

  // Restore the previously active tab from the DOM if the grid is being re-rendered.
  let activeTab = 'All';
  const existingGrid = document.querySelector(`.grid-picker[data-slot="${slotKey}"]`);
  if (existingGrid) {
    const activeTabEl = existingGrid.querySelector('.grid-tab.is-active');
    if (activeTabEl) activeTab = activeTabEl.dataset.tab;
  }

  if (tabType !== 'none' && tabType !== 'open_only') {
    const tabsEl = document.createElement('div');
    tabsEl.className = 'grid-tabs';
    const tabs = tabType === 'mixed'
      ? ['All', 'AIML', 'Cloud', 'Full-Stack', 'Other', 'Open Elective']
      : ['All', 'AIML', 'Cloud', 'Full-Stack', 'Other'];

    for (const tab of tabs) {
      const btn = document.createElement('button');
      btn.className = 'grid-tab' + (tab === activeTab ? ' is-active' : '');
      btn.dataset.tab = tab;
      btn.dataset.action = 'grid-tab';
      btn.dataset.slot = slotKey;
      btn.textContent = `[ ${tab} ]`;
      tabsEl.appendChild(btn);
    }
    gridEl.appendChild(tabsEl);
  }

  const cardsEl = document.createElement('div');
  cardsEl.className = 'grid-cards';

  for (const code of filterCoursesByTab(courses, activeTab, tabType)) {
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
      card.setAttribute('aria-label', `${course.title} — Already chosen in another slot.`);
    } else if (hasUnmetPrereqs) {
      card.classList.add('is-locked-prereq');
      card.setAttribute('aria-disabled', 'true');
      const missing = prereqStatus.filter(p => !p.met).map(p => p.title).join(', ');
      card.setAttribute('aria-label', `${course.title} — Missing prerequisites: ${missing}`);
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

  gridEl.appendChild(cardsEl);

  // Defer is-open so the CSS opacity transition actually plays.
  requestAnimationFrame(() => gridEl.classList.add('is-open'));
  return gridEl;
}

// Filters a course list by the active tab label.
function filterCoursesByTab(courses, activeTab, tabType) {
  if (activeTab === 'All') return courses;
  if (activeTab === 'Open Elective') return courses.filter(code => CURRICULUM.openElectives.includes(code));

  const specMap = { 'AIML': 'AIML', 'Cloud': 'Cloud', 'Full-Stack': 'FullStack' };
  const specKey = specMap[activeTab];

  if (specKey) {
    return courses.filter(code => CURRICULUM.courses[code]?.specialization === specKey);
  }

  if (activeTab === 'Other') {
    return courses.filter(code => {
      const course = CURRICULUM.courses[code];
      if (!course) return false;
      if (CURRICULUM.openElectives.includes(code)) return false;
      return !course.specialization;
    });
  }

  return courses;
}


// ─── Sidebar ──────────────────────────────────────────────────────────────────

function renderWelcome() {
  const content = document.getElementById('sidebar-content');
  if (!content) return;
  content.innerHTML = '';

  const el = document.createElement('div');
  el.className = 'sidebar-welcome';

  const h2 = document.createElement('h2');
  h2.textContent = 'Welcome';

  const p = document.createElement('p');
  p.textContent =
    'This tool helps you visualize your academic path through the BITS Pilani BSc Computer ' +
    'Science program. Click through semesters, pick your electives, and see how your choices ' +
    'shape your degree. Your progress is saved automatically.';

  el.appendChild(h2);
  el.appendChild(p);
  content.appendChild(el);

  const selectBtn = document.getElementById('select-btn');
  if (selectBtn) selectBtn.classList.remove('is-visible');
  const counter = document.getElementById('elective-counter');
  if (counter) counter.textContent = '';

  updateSpecTrackerVisibility();
}

function renderSemesterOverview(semNum) {
  swapSidebarContent(() => _renderSemesterOverview(semNum));
}

function _renderSemesterOverview(semNum) {
  const content = document.getElementById('sidebar-content');
  if (!content) return;
  content.innerHTML = '';

  const semDef = CURRICULUM.semesters[semNum];
  if (!semDef) return;

  const el = document.createElement('div');
  el.className = 'sem-overview';

  const header = document.createElement('div');
  header.className = 'sem-overview-header';

  const h2 = document.createElement('h2');
  h2.textContent = semDef.label;

  const unitsNote = document.createElement('div');
  unitsNote.className = 'sem-units-note';
  unitsNote.textContent = `${semDef.units} units`;

  header.appendChild(h2);
  header.appendChild(unitsNote);
  el.appendChild(header);

  if (semDef.fixed.length > 0) {
    const section = _makeOverviewSection('Core / Fixed');
    for (const code of semDef.fixed) {
      const course = CURRICULUM.courses[code];
      const item = document.createElement('div');
      item.className = 'sem-overview-item';
      item.textContent = course ? course.title : code;
      const units = document.createElement('span');
      units.className = 'text-muted text-sm';
      units.textContent = course ? `${course.units}u` : '';
      item.appendChild(units);
      section.querySelector('.sem-overview-items').appendChild(item);
    }
    el.appendChild(section);
  }

  if ((semDef.optionals || []).length > 0) {
    const section = _makeOverviewSection('Optionals');
    for (const opt of semDef.optionals) {
      const selected = STATE.selections[opt.slotKey];
      const item = document.createElement('div');
      item.className = 'sem-overview-item' + (selected ? '' : ' is-pending');
      if (selected) {
        const course = CURRICULUM.courses[selected];
        item.textContent = course ? course.title : selected;
        const units = document.createElement('span');
        units.className = 'text-muted text-sm';
        units.textContent = course ? `${course.units}u` : '';
        item.appendChild(units);
      } else {
        item.textContent = `${opt.label} — not yet chosen`;
      }
      section.querySelector('.sem-overview-items').appendChild(item);
    }
    el.appendChild(section);
  }

  if ((semDef.electives || []).length > 0) {
    const section = _makeOverviewSection('Electives');
    for (const elec of semDef.electives) {
      const selected = STATE.selections[elec.slotKey];
      const item = document.createElement('div');
      item.className = 'sem-overview-item' + (selected ? '' : ' is-pending');
      if (selected) {
        const course = CURRICULUM.courses[selected];
        item.textContent = course ? course.title : selected;
        const units = document.createElement('span');
        units.className = 'text-muted text-sm';
        units.textContent = course ? `${course.units}u` : '';
        item.appendChild(units);
      } else {
        item.textContent = `${elec.label} — not yet chosen`;
      }
      section.querySelector('.sem-overview-items').appendChild(item);
    }
    el.appendChild(section);
  }

  if (semNum === 5) {
    const panel = document.createElement('div');
    panel.className = 'sem-overview-section mt-md';
    const note = document.createElement('p');
    note.className = 'text-sm text-muted';
    note.textContent =
      'The Study Project (BCS ZC241T) is a 5-unit required course in Semester V. ' +
      'You will identify a software problem, study its scope, and submit a project proposal. ' +
      'It is a prerequisite for the Semester VI Project.';
    panel.appendChild(note);
    el.appendChild(panel);
  }

  if (semNum === 6) {
    const panel = document.createElement('div');
    panel.className = 'sem-overview-section mt-md';
    const note = document.createElement('p');
    note.className = 'text-sm text-muted';
    note.textContent =
      'Once you complete all Semester VI choices, you will decide whether to finish with ' +
      'a BSc or continue for two more semesters toward a BSc Honours degree.';
    panel.appendChild(note);
    el.appendChild(panel);
  }

  content.appendChild(el);

  const selectBtn = document.getElementById('select-btn');
  if (selectBtn) selectBtn.classList.remove('is-visible');

  _updateElectiveCounter(semNum);
  updateSpecTrackerVisibility();
}

function _makeOverviewSection(title) {
  const section = document.createElement('div');
  section.className = 'sem-overview-section';
  const h3 = document.createElement('h3');
  h3.textContent = title;
  const items = document.createElement('div');
  items.className = 'sem-overview-items';
  section.appendChild(h3);
  section.appendChild(items);
  return section;
}

// Shows full course info. If slotKey is provided, the SELECT button is shown.
function renderCourseInfo(courseCode, slotKey) {
  STATE.activeSidebarContent = { type: 'course-info', courseCode, slotKey: slotKey || null };
  swapSidebarContent(() => _renderCourseInfo(courseCode, slotKey));
}

function _renderCourseInfo(courseCode, slotKey) {
  const content = document.getElementById('sidebar-content');
  if (!content) return;
  content.innerHTML = '';

  const course = CURRICULUM.courses[courseCode];
  if (!course) {
    content.textContent = `Unknown course: ${courseCode}`;
    return;
  }

  const el = document.createElement('div');
  el.className = 'course-info';

  const title = document.createElement('h2');
  title.className = 'course-info-title';
  title.textContent = course.title;

  const hr = document.createElement('hr');
  hr.className = 'course-info-divider';

  const meta = document.createElement('div');
  meta.className = 'course-info-meta';
  meta.textContent = `${courseCode} · ${course.units} units`;

  const desc = document.createElement('p');
  desc.className = 'course-info-description';
  desc.textContent = course.description;

  el.appendChild(title);
  el.appendChild(hr);
  el.appendChild(meta);
  el.appendChild(desc);

  if (course.specializationHint) {
    const hint = document.createElement('p');
    hint.className = 'specialization-hint';
    const em = document.createElement('em');
    em.textContent = course.specializationHint;
    hint.appendChild(em);
    el.appendChild(hint);
  }

  const prereqStatus = getPrereqStatus(courseCode);
  if (prereqStatus.length > 0) {
    const prereqSection = document.createElement('div');
    prereqSection.className = 'prereqs-section';

    const h3 = document.createElement('h3');
    h3.textContent = 'Prerequisites';
    prereqSection.appendChild(h3);

    for (const p of prereqStatus) {
      const item = document.createElement('div');
      item.className = 'prereq-item';

      const badge = document.createElement('span');
      badge.className = `prereq-badge ${p.met ? 'met' : 'unmet'}`;
      badge.textContent = p.met ? '✓' : '✕';

      const name = document.createElement('span');
      name.textContent = `${p.title} (${p.code})`;

      item.appendChild(badge);
      item.appendChild(name);
      prereqSection.appendChild(item);
    }

    el.appendChild(prereqSection);
  }

  content.appendChild(el);

  const selectBtn = document.getElementById('select-btn');
  if (selectBtn) {
    if (slotKey) {
      selectBtn.classList.add('is-visible');
      selectBtn.textContent = STATE.selections[slotKey] === courseCode ? 'Selected ✓' : 'Select';
      selectBtn.disabled = STATE.selections[slotKey] === courseCode;
    } else {
      selectBtn.classList.remove('is-visible');
    }
  }

  _updateElectiveCounter(STATE.currentSemester);
  updateSpecTrackerVisibility();
}

// Grid prompt shown when the grid is open but no card has been clicked yet.
function renderGridPrompt(slotKey, slotLabel) {
  STATE.activeSidebarContent = { type: 'grid-prompt', slotKey };
  swapSidebarContent(() => _renderGridPrompt(slotKey, slotLabel));
}

function _renderGridPrompt(slotKey, slotLabel) {
  const content = document.getElementById('sidebar-content');
  if (!content) return;
  content.innerHTML = '';

  const el = document.createElement('div');
  el.className = 'grid-prompt';

  const h2 = document.createElement('h2');
  h2.textContent = 'Click any course to see its details';

  const p = document.createElement('p');
  p.textContent = `You are picking: ${slotLabel}`;

  el.appendChild(h2);
  el.appendChild(p);
  content.appendChild(el);

  const selectBtn = document.getElementById('select-btn');
  if (selectBtn) selectBtn.classList.remove('is-visible');

  _updateElectiveCounter(STATE.currentSemester);
  updateSpecTrackerVisibility();
}

function renderForkUI() {
  STATE.activeSidebarContent = { type: 'fork' };
  swapSidebarContent(() => _renderForkUI());
}

function _renderForkUI() {
  const content = document.getElementById('sidebar-content');
  if (!content) return;
  content.innerHTML = '';

  const el = document.createElement('div');
  el.className = 'fork-ui';

  const h2 = document.createElement('h2');
  h2.textContent = "You've completed Semester VI";
  el.appendChild(h2);

  const bscOption = document.createElement('div');
  bscOption.className = 'fork-option' + (STATE.pathType === 'BSC' ? ' is-chosen' : '');

  const bscH3 = document.createElement('h3');
  bscH3.textContent = 'Complete with BSc';

  const bscP = document.createElement('p');
  bscP.textContent =
    'Finish your degree as Bachelor of Science in Computer Science, BITS Pilani. ' +
    'You will have completed 6 semesters and accumulated all required units.';

  const bscBtn = document.createElement('button');
  bscBtn.dataset.action = 'fork-choice';
  bscBtn.dataset.pathtype = 'BSC';
  bscBtn.textContent = STATE.pathType === 'BSC' ? '✓ BSc chosen' : 'Complete with BSc';
  bscBtn.disabled = STATE.pathType === 'BSC';

  bscOption.appendChild(bscH3);
  bscOption.appendChild(bscP);
  bscOption.appendChild(bscBtn);
  el.appendChild(bscOption);

  const honsOption = document.createElement('div');
  honsOption.className = 'fork-option' + (STATE.pathType === 'BSCH' ? ' is-chosen' : '');

  const honsH3 = document.createElement('h3');
  honsH3.textContent = 'Continue to BSc Honours';

  const honsP = document.createElement('p');
  honsP.textContent =
    'Continue for two additional semesters (VII and VIII) toward a Bachelor of Science ' +
    '(Honours) in Computer Science, BITS Pilani. Choose discipline electives in AIML, ' +
    'Cloud Computing, or Full-Stack Development to earn a specialization.';

  const honsBtn = document.createElement('button');
  honsBtn.dataset.action = 'fork-choice';
  honsBtn.dataset.pathtype = 'BSCH';
  honsBtn.textContent = STATE.pathType === 'BSCH' ? '✓ Hons chosen' : 'Continue to BSc Hons.';
  honsBtn.disabled = STATE.pathType === 'BSCH';

  honsOption.appendChild(honsH3);
  honsOption.appendChild(honsP);
  honsOption.appendChild(honsBtn);
  el.appendChild(honsOption);

  content.appendChild(el);

  const selectBtn = document.getElementById('select-btn');
  if (selectBtn) selectBtn.classList.remove('is-visible');
  const counter = document.getElementById('elective-counter');
  if (counter) counter.textContent = '';
  updateSpecTrackerVisibility();
}

function renderEndCard(pathType) {
  STATE.activeSidebarContent = { type: 'end-card', pathType };
  swapSidebarContent(() => _renderEndCard(pathType));
}

function _renderEndCard(pathType) {
  const content = document.getElementById('sidebar-content');
  if (!content) return;
  content.innerHTML = '';

  const el = document.createElement('div');
  el.className = 'end-card';

  const logo = document.createElement('img');
  logo.className = 'end-card-logo';
  logo.src = 'assets/bits_logo.svg';
  logo.alt = 'BITS Pilani';
  el.appendChild(logo);

  const h2 = document.createElement('h2');
  h2.textContent = 'Congratulations';
  el.appendChild(h2);

  const degreeEl = document.createElement('div');
  degreeEl.className = 'end-degree';

  if (pathType === 'BSC') {
    degreeEl.textContent = 'Bachelor of Science in Computer Science, BITS Pilani';
  } else {
    degreeEl.appendChild(document.createTextNode('Bachelor of Science ('));
    const honsSpan = document.createElement('span');
    honsSpan.className = 'honours-highlight';
    honsSpan.textContent = 'Honours';
    degreeEl.appendChild(honsSpan);
    degreeEl.appendChild(document.createTextNode(') in Computer Science, BITS Pilani'));
  }
  el.appendChild(degreeEl);

  const choicesSection = document.createElement('div');
  choicesSection.className = 'end-card-section';
  const choicesH3 = document.createElement('h3');
  choicesH3.textContent = 'Your Choices';
  choicesSection.appendChild(choicesH3);

  for (const [, code] of Object.entries(STATE.selections)) {
    const course = CURRICULUM.courses[code];
    const item = document.createElement('div');
    item.className = 'end-card-item';
    item.textContent = course ? `${course.title} (${code})` : code;
    choicesSection.appendChild(item);
  }
  el.appendChild(choicesSection);

  const totalUnits = _computeTotalUnits();
  const unitsSection = document.createElement('div');
  unitsSection.className = 'end-card-section mt-md';
  const unitsH3 = document.createElement('h3');
  unitsH3.textContent = 'Total Units';
  const unitsVal = document.createElement('div');
  unitsVal.className = 'end-card-item';
  unitsVal.textContent = `${totalUnits} units`;
  unitsSection.appendChild(unitsH3);
  unitsSection.appendChild(unitsVal);
  el.appendChild(unitsSection);

  if (pathType === 'BSCH') {
    const spec = _determineSpecialization();
    if (spec) {
      const specEl = document.createElement('div');
      specEl.className = 'end-specialization mt-lg';
      specEl.textContent = `Specialization: ${spec.label} ✓`;
      el.appendChild(specEl);
    }
  }

  const switchBtn = document.createElement('button');
  switchBtn.className = 'end-card-switch-btn';
  switchBtn.dataset.action = 'show-fork-ui';
  switchBtn.textContent = pathType === 'BSC' ? 'Switch to Honours path' : 'Exit with BSc instead';
  el.appendChild(switchBtn);

  content.appendChild(el);

  const selectBtn = document.getElementById('select-btn');
  if (selectBtn) selectBtn.classList.remove('is-visible');
  const counter = document.getElementById('elective-counter');
  if (counter) counter.textContent = '';
  updateSpecTrackerVisibility();
}

function renderSpecializationTracker() {
  const trackerEl = document.getElementById('sidebar-spec-tracker');
  if (!trackerEl) return;
  trackerEl.innerHTML = '';

  const h4 = document.createElement('h4');
  h4.textContent = 'Specialization Progress';
  trackerEl.appendChild(h4);

  const inPath = getCoursesInPath();

  for (const [specKey, specDef] of Object.entries(CURRICULUM.specializations)) {
    const count = specDef.mandatoryCourses.filter(c => inPath.has(c)).length;
    const total = specDef.mandatoryCourses.length;
    const hasMiniProject = inPath.has(specDef.miniProject);
    const isAchieved = count === total && hasMiniProject;

    const row = document.createElement('div');
    row.className = 'spec-row' + (isAchieved ? ' is-achieved' : '');

    const labelEl = document.createElement('span');
    labelEl.className = 'spec-row-label';
    const labelMap = { AIML: 'AIML', Cloud: 'Cloud', FullStack: 'Full-Stack' };
    labelEl.textContent = labelMap[specKey] || specKey;

    const progressBar = document.createElement('div');
    progressBar.className = 'spec-progress-bar';
    for (let i = 0; i < total; i++) {
      const seg = document.createElement('div');
      seg.className = 'spec-bar-segment' + (i < count ? ' filled' : '');
      progressBar.appendChild(seg);
    }

    const countEl = document.createElement('span');
    countEl.className = 'spec-count';
    countEl.textContent = `${count}/${total}`;

    row.appendChild(labelEl);
    row.appendChild(progressBar);
    row.appendChild(countEl);

    if (isAchieved) {
      const achievedLabel = document.createElement('span');
      achievedLabel.className = 'spec-achieved-label';
      achievedLabel.textContent = 'achievable ✓';
      row.appendChild(achievedLabel);
    }

    trackerEl.appendChild(row);
  }
}

function updateSpecTrackerVisibility() {
  const trackerEl = document.getElementById('sidebar-spec-tracker');
  if (!trackerEl) return;
  const show = STATE.pathType === 'BSCH' && STATE.currentSemester >= 7;
  trackerEl.classList.toggle('is-visible', show);
  if (show) renderSpecializationTracker();
}


// ─── Continue Button ──────────────────────────────────────────────────────────

function updateContinueButton() {
  const wrapper = document.getElementById('continue-btn-wrapper');
  const btn = document.getElementById('continue-btn');
  const hint = document.getElementById('continue-hint');
  if (!wrapper || !btn || !hint) return;

  const hide = () => {
    wrapper.classList.remove('is-visible');
    wrapper.dataset.disabled = 'false';
  };

  if (STATE.currentSemester === 0) { hide(); return; }
  if (STATE.currentSemester === 6 && (STATE.forkUIShown || STATE.forkChosen)) { hide(); return; }
  if (STATE.pathType === 'BSC' && STATE.forkChosen) { hide(); return; }

  wrapper.classList.add('is-visible');

  const complete = isSemesterComplete(STATE.currentSemester);

  if (STATE.currentSemester === 6) {
    btn.textContent = 'Finish Semester 6';
  } else if (STATE.currentSemester === 8) {
    btn.textContent = 'Complete Programme';
  } else {
    btn.textContent = `Continue to Semester ${STATE.currentSemester + 1}`;
  }

  btn.disabled = !complete;
  wrapper.dataset.disabled = complete ? 'false' : 'true';

  if (!complete) {
    const missing = _getMissingSlots(STATE.currentSemester);
    hint.textContent = missing.length > 0 ? `Still needed: ${missing.join(', ')}` : '';
  } else {
    hint.textContent = '';
  }
}

function isSemesterComplete(semNum) {
  const semDef = CURRICULUM.semesters[semNum];
  if (!semDef) return false;
  for (const opt of semDef.optionals || []) {
    if (!STATE.selections[opt.slotKey]) return false;
  }
  for (const elec of semDef.electives || []) {
    if (elec.optional) continue;
    if (!STATE.selections[elec.slotKey]) return false;
  }
  return true;
}

function _getMissingSlots(semNum) {
  const semDef = CURRICULUM.semesters[semNum];
  if (!semDef) return [];
  const missing = [];
  for (const opt of semDef.optionals || []) {
    if (!STATE.selections[opt.slotKey]) missing.push(opt.label);
  }
  for (const elec of semDef.electives || []) {
    if (elec.optional) continue;
    if (!STATE.selections[elec.slotKey]) missing.push(elec.label);
  }
  return missing;
}


// ─── Elective Counter ─────────────────────────────────────────────────────────

function _updateElectiveCounter(semNum) {
  const counter = document.getElementById('elective-counter');
  if (!counter) return;
  if (semNum >= 4 && semNum <= 6) {
    const slots = ['DISCIPLINE_ELECTIVE_1', 'DISCIPLINE_ELECTIVE_2',
                   'DISCIPLINE_ELECTIVE_3', 'DISCIPLINE_ELECTIVE_4'];
    const chosen = slots.filter(s => !!STATE.selections[s]).length;
    counter.textContent = `${chosen}/4 electives chosen`;
  } else {
    counter.textContent = '';
  }
}


// ─── Total Units & Specialization ────────────────────────────────────────────

function _computeTotalUnits() {
  let total = 0;
  const inPath = getCoursesInPath();
  for (const code of inPath) {
    const course = CURRICULUM.courses[code];
    if (course) total += course.units;
  }
  return total;
}

function _determineSpecialization() {
  if (STATE.pathType !== 'BSCH') return null;
  const inPath = getCoursesInPath();
  for (const [, specDef] of Object.entries(CURRICULUM.specializations)) {
    const allMandatory = specDef.mandatoryCourses.every(c => inPath.has(c));
    const hasMiniProject = inPath.has(specDef.miniProject);
    if (allMandatory && hasMiniProject) return specDef;
  }
  return null;
}


// ─── App Entry Point ──────────────────────────────────────────────────────────

function renderApp() {
  applyTheme();

  if (STATE.currentSemester === 0) {
    const treeEl = document.getElementById('tree');
    if (treeEl) {
      const startNode = document.getElementById('start-node');
      if (startNode) startNode.style.display = 'flex';
      const trunkLine = document.getElementById('trunk-line');
      if (trunkLine) trunkLine.style.display = 'none';
      treeEl.querySelectorAll('.semester-block').forEach(el => el.remove());
      const fc = treeEl.querySelector('#fork-container');
      if (fc) fc.remove();
    }
    renderWelcome();
    updateContinueButton();
  } else {
    renderTree();
    if (STATE.activeSidebarContent) {
      const ctx = STATE.activeSidebarContent;
      if (ctx.type === 'course-info') {
        _renderCourseInfo(ctx.courseCode, ctx.slotKey);
      } else if (ctx.type === 'fork') {
        _renderForkUI();
      } else if (ctx.type === 'end-card') {
        _renderEndCard(ctx.pathType);
      } else {
        _renderSemesterOverview(STATE.currentSemester);
      }
    } else {
      // Reconstruct sidebar after page reload.
      if (STATE.forkUIShown && !STATE.forkChosen) {
        _renderForkUI();
      } else if (STATE.forkChosen && STATE.pathType === 'BSC') {
        _renderEndCard('BSC');
      } else {
        _renderSemesterOverview(STATE.currentSemester);
      }
    }
  }
}

function applyTheme() {
  document.body.classList.toggle('theme-dark', STATE.theme === 'dark');
  document.body.classList.toggle('theme-light', STATE.theme !== 'dark');
}
