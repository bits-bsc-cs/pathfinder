// render.js — DOM rendering. Reads STATE + CURRICULUM, writes DOM. Never mutates STATE.

// In-memory set of semesters the user has manually expanded (not persisted).
const expandedSemesters = new Set();

// Currently open modal element, if any.
let openModalEl = null;
let lastFocusedEl = null;

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

// Returns [{ code, title, met, semesterFixed }] for every prereq of a course.
function getPrereqStatus(courseCode) {
	const inPath = getCoursesInPath();
	const prereqs = CURRICULUM.courses[courseCode]?.prereqs ?? [];
	const implicit = CURRICULUM.implicitPrereqs[courseCode] ?? [];
	return [...prereqs, ...implicit].map((prereqCode) => {
		const pc = CURRICULUM.courses[prereqCode];
		return {
			code: prereqCode,
			title: pc?.title ?? prereqCode,
			semesterFixed: pc?.semesterFixed ?? null,
			met: inPath.has(prereqCode),
		};
	});
}

// An unmet prereq is "blocking" (red) when it should already have been taken;
// otherwise it's "upcoming" (amber) — scheduled in a later semester.
function isPrereqBlocking(p) {
	if (p.met) return false;
	if (p.semesterFixed === null) return true;
	return p.semesterFixed <= STATE.currentSemester;
}

// Returns true if the course selected for slotKey is depended on by another
// selection — meaning swapping it would break a prereq chain.
function isSlotLocked(slotKey) {
	const currentSelection = STATE.selections[slotKey];
	if (!currentSelection) return false;
	const others = Object.entries(STATE.selections)
		.filter(([k]) => k !== slotKey)
		.map(([, v]) => v);
	return others.some((code) =>
		(CURRICULUM.courses[code]?.prereqs ?? []).includes(currentSelection),
	);
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
		slotKey === "DISCIPLINE_ELECTIVE_1" ||
		slotKey === "DISCIPLINE_ELECTIVE_2" ||
		slotKey === "DISCIPLINE_ELECTIVE_3" ||
		slotKey === "DISCIPLINE_ELECTIVE_4"
	) {
		return { courses: CURRICULUM.bscElectives, tabType: "none" };
	}

	if (
		slotKey === "OPEN_ELECTIVE_SEM7_1" ||
		slotKey === "OPEN_ELECTIVE_SEM7_2"
	) {
		return { courses: CURRICULUM.openElectives, tabType: "open_only" };
	}

	if (
		slotKey === "DISC_OR_OPEN_SEM7" ||
		slotKey === "OPEN_OR_DISC_SEM8_1" ||
		slotKey === "OPEN_OR_DISC_SEM8_2"
	) {
		return {
			courses: [...CURRICULUM.disciplineElectives, ...CURRICULUM.openElectives],
			tabType: "mixed",
		};
	}

	if (slotKey === "DISC_OR_MINI_SEM8") {
		return { courses: CURRICULUM.disciplineElectives, tabType: "discipline" };
	}

	if (
		slotKey === "DISC_ELECTIVE_SEM7_1" ||
		slotKey === "DISC_ELECTIVE_SEM7_2" ||
		slotKey === "DISC_ELECTIVE_SEM7_OPT" ||
		slotKey === "DISC_ELECTIVE_SEM8_1" ||
		slotKey === "DISC_ELECTIVE_SEM8_2" ||
		slotKey === "DISC_ELECTIVE_SEM8_OPT"
	) {
		return { courses: CURRICULUM.disciplineElectives, tabType: "discipline" };
	}

	// Optional slots — pull choices from the semester definition.
	for (const [, semDef] of Object.entries(CURRICULUM.semesters)) {
		for (const opt of semDef.optionals || []) {
			if (opt.slotKey === slotKey)
				return { courses: opt.choices, tabType: "none" };
		}
	}

	return { courses: [], tabType: "none" };
}

// Filters a course list by the active tab label.
function filterCoursesByTab(courses, activeTab) {
	if (activeTab === "All") return courses;
	if (activeTab === "Open Elective")
		return courses.filter((code) => CURRICULUM.openElectives.includes(code));

	const specMap = { AIML: "AIML", Cloud: "Cloud", "Full-Stack": "FullStack" };
	const specKey = specMap[activeTab];

	if (specKey) {
		return courses.filter(
			(code) => CURRICULUM.courses[code]?.specialization === specKey,
		);
	}

	if (activeTab === "Other") {
		return courses.filter((code) => {
			const course = CURRICULUM.courses[code];
			if (!course) return false;
			if (CURRICULUM.openElectives.includes(code)) return false;
			return !course.specialization;
		});
	}

	return courses;
}

// Human-readable label for a slot key (e.g. "Discipline Elective #1").
function _getSlotMeta(slotKey) {
	for (const [, semDef] of Object.entries(CURRICULUM.semesters)) {
		for (const opt of semDef.optionals || []) {
			if (opt.slotKey === slotKey)
				return { label: opt.label, optional: false };
		}
		for (const elec of semDef.electives || []) {
			if (elec.slotKey === slotKey)
				return { label: elec.label, optional: !!elec.optional };
		}
	}
	return { label: slotKey, optional: false };
}

function _getSlotLabel(slotKey) {
	return _getSlotMeta(slotKey).label;
}

// Semester number + label containing the given slot key.
function _getSlotSemester(slotKey) {
	for (const [semNum, semDef] of Object.entries(CURRICULUM.semesters)) {
		const has =
			(semDef.optionals || []).some((o) => o.slotKey === slotKey) ||
			(semDef.electives || []).some((e) => e.slotKey === slotKey);
		if (has) return { num: parseInt(semNum, 10), label: semDef.label };
	}
	return { num: 0, label: "" };
}

function _getTypeLabel(type) {
	const map = {
		core: "Core",
		foundation: "Foundation",
		project: "Project",
		elective: "Elective",
		discipline_elective: "Discipline",
		open_elective: "Open",
		science_elective: "Science",
		humanities_elective: "Humanities",
		social_science_elective: "Social Science",
	};
	return map[type] || type || "Course";
}

const _specLabelMap = { AIML: "AIML", Cloud: "Cloud", FullStack: "Full-Stack" };

function _getSpecLabel(specKey) {
	return _specLabelMap[specKey] || specKey;
}

// BSc total units (sems 1–6) and Honours extra (sems 7–8).
function _getUnitTotals() {
	let bsc = 0,
		hons = 0;
	for (const [semNum, semDef] of Object.entries(CURRICULUM.semesters)) {
		const u = semDef.units || 0;
		if (parseInt(semNum, 10) <= 6) bsc += u;
		else hons += u;
	}
	return { bsc, hons };
}

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
	if (STATE.pathType !== "BSCH") return null;
	const inPath = getCoursesInPath();
	for (const [, specDef] of Object.entries(CURRICULUM.specializations)) {
		const allMandatory = specDef.mandatoryCourses.every((c) => inPath.has(c));
		const hasMiniProject = inPath.has(specDef.miniProject);
		if (allMandatory && hasMiniProject) return specDef;
	}
	return null;
}

// Replaces the card for a slot with a freshly rendered one, swapping it back
// into the DOM in place (handles the tooltip-wrapper case for locked cards).
function replaceSlotCard(slotKey) {
	const card = document.querySelector(`.course-card[data-slot="${slotKey}"]`);
	if (!card || !card.isConnected) return;
	const meta = _getSlotMeta(slotKey);
	const replacement = renderSlotCard(slotKey, meta.label, meta.optional);
	const wrapper = card.closest(".tooltip-wrapper");
	// Replace only the card itself (or its wrapper) — never the parent grid.
	if (wrapper) wrapper.replaceWith(replacement);
	else card.replaceWith(replacement);
}

// Targeted update after a course pick: swaps only the changed slot card and
// re-renders cards whose prereq marks changed. No full-journey rebuild.
function patchCourseSelection(slotKey, code) {
	const prevCode = STATE.selections[slotKey];
	replaceSlotCard(slotKey);

	const touched = document.querySelectorAll(".course-card");
	for (const el of touched) {
		const courseCode = el.dataset.course;
		if (!courseCode || !el.isConnected) continue;
		const prereqs = [
			...(CURRICULUM.courses[courseCode]?.prereqs ?? []),
			...(CURRICULUM.implicitPrereqs[courseCode] ?? []),
		];
		// Re-render dependents (their prereqs changed) and prereq cards of the
		// picked course (they may now be locked).
		const isDependent =
			prereqs.includes(code) || (prevCode && prereqs.includes(prevCode));
		const isPrereqOfPick =
			(CURRICULUM.courses[code]?.prereqs ?? []).includes(courseCode) ||
			(prevCode &&
				(CURRICULUM.courses[prevCode]?.prereqs ?? []).includes(courseCode));
		if (!isDependent && !isPrereqOfPick) {
			continue;
		}
		if (el.dataset.slot) {
			replaceSlotCard(el.dataset.slot);
		} else {
			const wrapper = el.closest(".tooltip-wrapper");
			// Replace only the card itself (or its wrapper) — never the parent grid.
			if (wrapper) wrapper.replaceWith(renderCourseCard(courseCode));
			else el.replaceWith(renderCourseCard(courseCode));
		}
	}

	updateContinueBar();
	updateElectiveCounter();
	renderProgressBar();
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

function _courseCount(semNum) {
	const semDef = CURRICULUM.semesters[semNum];
	if (!semDef) return 0;
	return (
		semDef.fixed.length +
		(semDef.optionals || []).length +
		(semDef.electives || []).length
	);
}

// ─── App Entry Point ─────────────────────────────────────────────────────────

function applyTheme() {
	document.body.classList.toggle("theme-dark", STATE.theme === "dark");
	document.body.classList.toggle("theme-light", STATE.theme !== "dark");
}

function renderApp() {
	applyTheme();
	const content = document.getElementById("page-content");
	if (!content) return;

	if (STATE.currentSemester === 0) {
		renderStartScreen();
	} else {
		renderJourney();
	}
	updateContinueBar();
	renderProgressBar();
}

// ─── Start Screen ────────────────────────────────────────────────────────────

function renderStartScreen() {
	const content = document.getElementById("page-content");
	if (!content) return;
	content.replaceChildren();

	const journey = document.createElement("div");
	journey.className = "path-journey";

	const hero = document.createElement("div");
	hero.className = "hero";

	const h1 = document.createElement("h1");
	h1.textContent = "Plan your BSc CS at BITS Pilani";
	hero.appendChild(h1);

	const lead = document.createElement("p");
	lead.className = "hero-lead";
	lead.textContent =
		"Pick electives semester by semester. Prerequisites are checked as you go. " +
		"Your progress is saved in your browser.";
	hero.appendChild(lead);

	const begin = document.createElement("button");
	begin.className = "btn btn-primary btn-lg";
	begin.dataset.action = "start";
	begin.textContent = "Start planning";
	hero.appendChild(begin);

	journey.appendChild(hero);

	// Flat semester list
	const list = document.createElement("div");
	list.className = "start-list";

	const listTitle = document.createElement("div");
	listTitle.className = "start-list-title";
	listTitle.textContent = "The degree";
	list.appendChild(listTitle);

	for (let semNum = 1; semNum <= 8; semNum++) {
		const semDef = CURRICULUM.semesters[semNum];
		const row = document.createElement("div");
		row.className = "start-list-row" + (semNum >= 7 ? " is-hons" : "");

		const num = document.createElement("span");
		num.className = "sl-sem";
		num.textContent = String(semNum);
		row.appendChild(num);

		const name = document.createElement("span");
		name.className = "sl-name";
		name.textContent = semDef.label;
		row.appendChild(name);

		const desc = document.createElement("span");
		desc.className = "sl-desc";
		if (semNum >= 7) {
			desc.textContent = "Honours path — discipline & open electives";
		} else if (semNum === 6) {
			desc.textContent = `${_courseCount(semNum)} courses · ${semDef.units}u · decision point`;
		} else {
			desc.textContent = `${_courseCount(semNum)} courses · ${semDef.units}u`;
		}
		row.appendChild(desc);
		list.appendChild(row);
	}
	journey.appendChild(list);
	content.appendChild(journey);
}

// ─── Journey (in-path rendering) ─────────────────────────────────────────────

function renderJourney() {
	const content = document.getElementById("page-content");
	if (!content) return;
	content.replaceChildren();

	const journey = document.createElement("div");
	journey.className = "path-journey";

	const revealed = [...STATE.revealedSemesters].sort((a, b) => a - b);

	// Sems 1–6
	for (const semNum of revealed) {
		if (semNum <= 6) journey.appendChild(renderSemesterSection(semNum));
	}

	// Fork decision (after Sem 6)
	const forkVisible = STATE.forkUIShown || STATE.forkChosen;
	if (forkVisible) journey.appendChild(renderForkSection());

	// Locked future rows
	if (STATE.pathType === "BSCH") {
		if (STATE.currentSemester < 8) {
			for (
				let semNum = Math.max(7, STATE.currentSemester + 1);
				semNum <= 8;
				semNum++
			) {
				journey.appendChild(renderLockedSemesterRow(semNum));
			}
		}
	} else if (!forkVisible && STATE.currentSemester < 6) {
		for (let semNum = STATE.currentSemester + 1; semNum <= 6; semNum++) {
			journey.appendChild(renderLockedSemesterRow(semNum));
		}
	}

	// Honours continuation
	if (STATE.pathType === "BSCH") {
		journey.appendChild(renderSpecProgressSection());
		for (const semNum of revealed) {
			if (semNum >= 7) journey.appendChild(renderSemesterSection(semNum));
		}
		if (STATE.currentSemester >= 8 && isSemesterComplete(8)) {
			journey.appendChild(renderEndSection("BSCH"));
		}
	} else if (STATE.forkChosen && STATE.pathType === "BSC") {
		journey.appendChild(renderEndSection("BSC"));
	}

	content.appendChild(journey);
	updateContinueBar();
	updateElectiveCounter();
}

// Builds a semester section: header row + course grid.
function renderSemesterSection(semNum) {
	const semDef = CURRICULUM.semesters[semNum];
	const section = document.createElement("section");
	section.className = "sem-section";
	section.dataset.semester = semNum;

	const isPast = semNum < STATE.currentSemester;
	const isCurrent = semNum === STATE.currentSemester;
	const collapsed = isPast && !expandedSemesters.has(semNum);
	if (collapsed) section.classList.add("is-collapsed");
	if (isPast) section.classList.add("is-past");
	if (isCurrent) section.classList.add("is-current");

	// Header
	const head = document.createElement("div");
	head.className = "sem-head";
	head.setAttribute("role", "button");
	head.setAttribute("tabindex", "0");
	head.dataset.action = "toggle-sem";
	head.dataset.semester = semNum;

	const chevron = document.createElement("span");
	chevron.className = "sem-chevron";
	chevron.setAttribute("aria-hidden", "true");
	chevron.appendChild(makeIcon("m6 9 6 6 6-6"));
	head.appendChild(chevron);

	const name = document.createElement("h2");
	name.className = "sem-name";
	name.textContent = semDef.label;
	head.appendChild(name);

	const meta = document.createElement("div");
	meta.className = "sem-meta";

	const units = document.createElement("span");
	units.className = "sem-units";
	units.textContent = `${semDef.units}u`;
	meta.appendChild(units);

	const status = document.createElement("span");
	status.className = "sem-status";
	status.textContent = isCurrent ? "current" : isPast ? "done" : "next";
	meta.appendChild(status);

	const count = document.createElement("span");
	count.className = "sem-count";
	count.textContent = `${_courseCount(semNum)} courses`;
	meta.appendChild(count);

	head.appendChild(meta);
	section.appendChild(head);

	// Body: course grid
	const body = document.createElement("div");
	body.className = "sem-body";

	const grid = document.createElement("div");
	grid.className = "course-grid";

	for (const code of semDef.fixed) {
		grid.appendChild(renderCourseCard(code));
	}
	for (const opt of semDef.optionals || []) {
		grid.appendChild(renderSlotCard(opt.slotKey, opt.label));
	}
	for (const elec of semDef.electives || []) {
		grid.appendChild(renderSlotCard(elec.slotKey, elec.label, elec.optional));
	}

	body.appendChild(grid);

	// Inline Continue CTA — only for the current semester, right after its cards
	if (isCurrent) {
		const block = document.createElement("div");
		block.className = "sem-continue";
		block.id = "continue-block";

		const status = document.createElement("div");
		status.className = "sem-continue-status";
		const counter = document.createElement("span");
		counter.id = "elective-counter";
		status.appendChild(counter);
		const hint = document.createElement("span");
		hint.id = "continue-hint";
		status.appendChild(hint);
		block.appendChild(status);

		const btn = document.createElement("button");
		btn.id = "continue-btn";
		btn.dataset.action = "continue";
		btn.disabled = true;
		btn.textContent = "Continue";
		block.appendChild(btn);

		body.appendChild(block);
	}

	section.appendChild(body);
	return section;
}

// Locked row for a semester the user hasn't reached yet.
function renderLockedSemesterRow(semNum) {
	const semDef = CURRICULUM.semesters[semNum];
	const row = document.createElement("div");
	row.className = "sem-locked";
	row.dataset.semester = semNum;

	const node = document.createElement("span");
	node.setAttribute("aria-hidden", "true");

	const ico = document.createElement("span");
	ico.className = "lock-ico";
	ico.setAttribute("aria-hidden", "true");
	ico.appendChild(
		makeSvg(
			[
				{
					tag: "rect",
					attrs: { width: "18", height: "11", x: "3", y: "11", rx: "2" },
				},
				{ tag: "path", attrs: { d: "M7 11V7a5 5 0 0 1 10 0v4" } },
			],
			2.2,
		),
	);
	node.appendChild(ico);
	row.appendChild(node);

	const name = document.createElement("span");
	name.className = "sem-locked-name";
	name.textContent = semDef.label;
	row.appendChild(name);

	const note = document.createElement("span");
	note.className = "sem-locked-note";
	note.textContent =
		STATE.pathType === "BSCH"
			? "Complete the previous semester to unlock"
			: semNum === 6
				? `Complete Semester ${semNum - 1} to reach the fork`
				: `Complete Semester ${semNum - 1} to unlock`;
	row.appendChild(note);

	return row;
}

// ─── Course Cards ────────────────────────────────────────────────────────────

function renderCourseCard(courseCode) {
	const course = CURRICULUM.courses[courseCode];
	const card = document.createElement("div");
	card.className =
		"course-card" + (course?.type === "project" ? " is-project" : "");
	card.setAttribute("role", "button");
	card.setAttribute("tabindex", "0");
	card.dataset.action = "course-info";
	card.dataset.course = courseCode;

	const top = document.createElement("div");
	top.className = "cc-top";

	const index = document.createElement("span");
	index.className = "cc-index";
	top.appendChild(index);

	const title = document.createElement("span");
	title.className = "cc-title";
	title.textContent = course ? course.title : courseCode;
	top.appendChild(title);

	card.appendChild(top);

	const meta = document.createElement("div");
	meta.className = "cc-meta";
	const codeEl = document.createElement("code");
	codeEl.textContent = courseCode;
	meta.appendChild(codeEl);
	meta.appendChild(
		document.createTextNode(`· ${course ? course.units + "u" : ""}`),
	);
	card.appendChild(meta);

	// Prereq status — plain text lines
	const prereqLines = buildPrereqLines(courseCode);
	if (prereqLines) card.appendChild(prereqLines);

	return card;
}

// Renders prereq status as plain text lines, or null if the course has none.
function buildPrereqLines(courseCode) {
	const prereqStatus = getPrereqStatus(courseCode);
	if (prereqStatus.length === 0) return null;
	const lines = document.createElement("div");
	lines.className = "cc-prereqs";
	for (const p of prereqStatus) {
		const line = document.createElement("div");
		const label = document.createElement("span");
		label.className = "label";
		const text = document.createElement("span");
		text.textContent =
			p.title + (p.semesterFixed && !p.met ? ` (Sem ${p.semesterFixed})` : "");
		if (p.met) {
			line.className = "prereq-line met";
			label.textContent = "Met:";
		} else if (isPrereqBlocking(p)) {
			line.className = "prereq-line blocking";
			label.textContent = "Missing:";
		} else {
			line.className = "prereq-line upcoming";
			label.textContent = "Upcoming:";
		}
		line.appendChild(label);
		line.appendChild(text);
		lines.appendChild(line);
	}
	return lines;
}

// Slot card — empty (choose) or filled (chosen course).
function renderSlotCard(slotKey, slotLabel, isOptional = false) {
	const selectedCode = STATE.selections[slotKey];
	const row = document.createElement("div");
	row.className = "course-row";
	row.style.display = "contents";

	if (selectedCode) {
		const course = CURRICULUM.courses[selectedCode];
		const locked = isSlotLocked(slotKey);

		const card = document.createElement("div");
		card.className = "course-card is-filled" + (locked ? " is-locked" : "");
		card.setAttribute("role", "button");
		card.setAttribute("tabindex", locked ? "-1" : "0");
		card.dataset.action = "course-info";
		card.dataset.course = selectedCode;
		card.dataset.slot = slotKey;

		const top = document.createElement("div");
		top.className = "cc-top";
		const index = document.createElement("span");
		index.className = "cc-index";
		top.appendChild(index);
		const title = document.createElement("span");
		title.className = "cc-title";
		title.textContent = course ? course.title : selectedCode;
		top.appendChild(title);
		card.appendChild(top);

		const meta = document.createElement("div");
		meta.className = "cc-meta";
		const codeEl = document.createElement("code");
		codeEl.textContent = selectedCode;
		meta.appendChild(codeEl);
		meta.appendChild(
			document.createTextNode(` · ${course ? course.units + "u" : ""}`),
		);
		card.appendChild(meta);

		const slotLabelEl = document.createElement("div");
		slotLabelEl.className = "cc-slot-label";
		slotLabelEl.textContent = slotLabel + (isOptional ? " · optional" : "");
		card.appendChild(slotLabelEl);

		if (!locked) {
			const changeEl = document.createElement("span");
			changeEl.className = "cc-change";
			changeEl.textContent = "Change";
			card.appendChild(changeEl);
		}

		if (locked) {
			const dependents = Object.values(STATE.selections).filter((code) =>
				(CURRICULUM.courses[code]?.prereqs ?? []).includes(selectedCode),
			);
			const depNames = dependents
				.map((c) => CURRICULUM.courses[c]?.title ?? c)
				.join(", ");
			const wrapper = document.createElement("div");
			wrapper.className = "tooltip-wrapper";
			const tooltip = document.createElement("div");
			tooltip.className = "tooltip-box";
			tooltip.textContent = `Can't change — ${depNames} in your path depends on this.`;
			wrapper.appendChild(card);
			wrapper.appendChild(tooltip);
			return wrapper;
		}

		return card;
	}

	const card = document.createElement("div");
	card.className = "course-card is-slot";
	card.setAttribute("role", "button");
	card.setAttribute("tabindex", "0");
	card.dataset.action = "open-grid";
	card.dataset.slot = slotKey;

	const title = document.createElement("span");
	title.className = "cc-title";
	title.textContent = slotLabel + (isOptional ? " · optional" : "");
	card.appendChild(title);

	const hint = document.createElement("span");
	hint.className = "cc-hint";
	const hintLabel = document.createElement("span");
	hintLabel.textContent = "Choose course";
	hint.appendChild(hintLabel);
	card.appendChild(hint);

	return card;
}

// ─── Fork Decision Section ───────────────────────────────────────────────────

function renderForkSection() {
	const { bsc, hons } = _getUnitTotals();
	const section = document.createElement("section");
	section.className = "fork-section";
	section.id = "fork-section";

	const banner = document.createElement("div");
	banner.className = "fork-banner";
	banner.textContent = "You have completed Semester VI";
	section.appendChild(banner);

	const h2 = document.createElement("h2");
	h2.textContent = "How would you like to finish?";
	section.appendChild(h2);

	const lead = document.createElement("p");
	lead.className = "fork-lead";
	lead.textContent =
		"Choose how your degree ends. You can switch your decision later.";
	section.appendChild(lead);

	const cards = document.createElement("div");
	cards.className = "fork-cards";

	const options = [
		{
			pathType: "BSC",
			title: "Finish with BSc",
			desc: "Graduate after six semesters as a Bachelor of Science in Computer Science.",
			bullets: ["6 semesters", `${bsc} units`, "No specialization"],
			chosenText: "BSc chosen",
		},
		{
			pathType: "BSCH",
			title: "Continue to BSc (Honours)",
			desc: "Two more semesters of deep electives — and a specialization in AIML, Cloud, or Full-Stack.",
			bullets: ["8 semesters", `${bsc + hons} units`, "Earn a specialization"],
			chosenText: "Honours chosen",
		},
	];

	for (const opt of options) {
		const chosen = STATE.pathType === opt.pathType;
		const cardEl = document.createElement("div");
		cardEl.className = "fork-card" + (chosen ? " is-chosen" : "");

		const h3 = document.createElement("h3");
		h3.textContent = opt.title;
		cardEl.appendChild(h3);

		const p = document.createElement("p");
		p.textContent = opt.desc;
		cardEl.appendChild(p);

		const ul = document.createElement("ul");
		for (const b of opt.bullets) {
			const li = document.createElement("li");
			li.textContent = b;
			ul.appendChild(li);
		}
		cardEl.appendChild(ul);

		const btn = document.createElement("button");
		btn.dataset.action = "fork-choice";
		btn.dataset.pathtype = opt.pathType;
		btn.textContent = chosen
			? opt.chosenText
			: opt.pathType === "BSCH"
				? "Continue to Honours"
				: "Finish with BSc";
		btn.disabled = chosen;
		btn.className = chosen
			? "btn btn-ghost"
			: opt.pathType === "BSCH"
				? "btn btn-primary"
				: "btn btn-ghost";
		cardEl.appendChild(btn);

		cards.appendChild(cardEl);
	}

	section.appendChild(cards);
	return section;
}

// ─── End / Celebration Section ───────────────────────────────────────────────

function renderEndSection(pathType) {
	const section = document.createElement("section");
	section.className = "end-section";
	section.id = "end-section";

	const h2 = document.createElement("h2");
	h2.textContent = "Congratulations!";
	section.appendChild(h2);

	const degree = document.createElement("div");
	degree.className = "end-degree";
	if (pathType === "BSC") {
		degree.textContent = "Bachelor of Science in Computer Science, BITS Pilani";
	} else {
		degree.appendChild(document.createTextNode("Bachelor of Science ("));
		const honsSpan = document.createElement("span");
		honsSpan.className = "honours-highlight";
		honsSpan.textContent = "Honours";
		degree.appendChild(honsSpan);
		degree.appendChild(
			document.createTextNode(") in Computer Science, BITS Pilani"),
		);
	}
	section.appendChild(degree);

	const stats = document.createElement("div");
	stats.className = "end-stats";

	const units = document.createElement("span");
	units.textContent = `${_computeTotalUnits()} units`;
	stats.appendChild(units);

	const sem = document.createElement("span");
	sem.textContent = pathType === "BSC" ? "6 semesters" : "8 semesters";
	stats.appendChild(sem);

	const spec = _determineSpecialization();
	if (spec) {
		const specEl = document.createElement("span");
		specEl.textContent = `Specialization: ${spec.label}`;
		stats.appendChild(specEl);
	} else if (pathType === "BSCH") {
		const specEl = document.createElement("span");
		specEl.textContent = "No specialization";
		stats.appendChild(specEl);
	}
	section.appendChild(stats);

	// Choices grouped by semester
	const choices = document.createElement("div");
	choices.className = "end-choices";
	const h3 = document.createElement("h3");
	h3.textContent = "Your path at a glance";
	choices.appendChild(h3);

	const revealed = [...STATE.revealedSemesters].sort((a, b) => a - b);
	for (const semNum of revealed) {
		const semDef = CURRICULUM.semesters[semNum];
		const group = document.createElement("div");
		group.className = "end-choice-group";

		const h4 = document.createElement("h4");
		h4.textContent = semDef.label;
		group.appendChild(h4);

		const ul = document.createElement("ul");
		const addItem = (text, muted) => {
			const li = document.createElement("li");
			li.textContent = text;
			if (muted) li.style.color = "var(--color-ink-faint)";
			ul.appendChild(li);
		};
		for (const code of semDef.fixed) {
			const course = CURRICULUM.courses[code];
			addItem(course ? `${course.title} (${code})` : code, false);
		}
		for (const opt of semDef.optionals || []) {
			const selected = STATE.selections[opt.slotKey];
			const course = selected ? CURRICULUM.courses[selected] : null;
			addItem(
				course ? `${course.title} (${selected})` : `${opt.label} — not chosen`,
				!course,
			);
		}
		for (const elec of semDef.electives || []) {
			const selected = STATE.selections[elec.slotKey];
			const course = selected ? CURRICULUM.courses[selected] : null;
			addItem(
				course ? `${course.title} (${selected})` : `${elec.label} — not chosen`,
				!course,
			);
		}
		group.appendChild(ul);
		choices.appendChild(group);
	}
	section.appendChild(choices);

	// Actions
	const actions = document.createElement("div");
	actions.className = "end-actions";

	const restart = document.createElement("button");
	restart.className = "btn btn-ghost";
	restart.dataset.action = "start-over";
	restart.textContent = "Start a new path";
	actions.appendChild(restart);

	const switchBtn = document.createElement("button");
	switchBtn.className = "end-switch-btn";
	switchBtn.dataset.action = "switch-path";
	switchBtn.textContent =
		pathType === "BSC"
			? "Switch to the Honours path"
			: "Exit with a BSc instead";
	actions.appendChild(switchBtn);

	section.appendChild(actions);
	return section;
}

// ─── Specialization Progress Section ─────────────────────────────────────────

function renderSpecProgressSection() {
	const section = document.createElement("section");
	section.className = "spec-section";

	const h3 = document.createElement("h3");
	h3.textContent = "Specialization progress";
	section.appendChild(h3);

	const inPath = getCoursesInPath();

	for (const [specKey, specDef] of Object.entries(CURRICULUM.specializations)) {
		const count = specDef.mandatoryCourses.filter((c) => inPath.has(c)).length;
		const total = specDef.mandatoryCourses.length;
		const hasMiniProject = inPath.has(specDef.miniProject);
		const isAchieved = count === total && hasMiniProject;

		const row = document.createElement("div");
		row.className = "spec-row" + (isAchieved ? " is-achieved" : "");

		const labelEl = document.createElement("span");
		labelEl.className = "spec-row-label";
		labelEl.textContent = _getSpecLabel(specKey);
		row.appendChild(labelEl);

		const bar = document.createElement("div");
		bar.className = "spec-progress-bar";
		for (let i = 0; i < total; i++) {
			const seg = document.createElement("div");
			seg.className = "spec-bar-segment" + (i < count ? " filled" : "");
			bar.appendChild(seg);
		}
		row.appendChild(bar);

		const countEl = document.createElement("span");
		countEl.className = "spec-count";
		countEl.textContent = `${count}/${total}`;
		row.appendChild(countEl);

		if (isAchieved) {
			const achieved = document.createElement("span");
			achieved.className = "spec-achieved-label";
			achieved.textContent = "Achieved";
			row.appendChild(achieved);
		}

		section.appendChild(row);
	}

	const note = document.createElement("p");
	note.className = "spec-note";
	note.textContent =
		"Take all four specialization courses plus the Mini Project to earn the specialization.";
	section.appendChild(note);

	return section;
}

// ─── Progress Bar ────────────────────────────────────────────────────────────

function renderProgressBar() {
	const bar = document.getElementById("progress-bar");
	if (!bar) return;
	bar.replaceChildren();

	if (STATE.currentSemester === 0) return;

	const endNum =
		STATE.pathType === "BSCH" ? 8 : STATE.pathType === "BSC" ? 6 : 8;
	const { bsc, hons } = _getUnitTotals();
	const total = STATE.pathType === "BSCH" ? bsc + hons : bsc;

	const chip = document.createElement("div");
	chip.className = "progress-chip";

	const dots = document.createElement("span");
	dots.className = "progress-dots";
	dots.setAttribute("role", "img");
	dots.setAttribute(
		"aria-label",
		`Progress: semester ${STATE.currentSemester} of ${endNum}`,
	);

	for (let i = 1; i <= endNum; i++) {
		const dot = document.createElement("span");
		dot.className =
			"progress-dot" +
			(i < STATE.currentSemester
				? " is-done"
				: i === STATE.currentSemester
					? " is-current"
					: " is-locked");
		dot.setAttribute("aria-label", `Semester ${i}`);
		dot.title = CURRICULUM.semesters[i]?.label ?? `Semester ${i}`;
		dots.appendChild(dot);
	}
	chip.appendChild(dots);

	let doneUnits = 0;
	for (let i = 1; i < STATE.currentSemester; i++) {
		doneUnits += CURRICULUM.semesters[i]?.units ?? 0;
	}

	const text = document.createElement("span");
	text.className = "progress-text";
	text.textContent = `Sem ${STATE.currentSemester} · ${doneUnits}/${total}u`;
	chip.appendChild(text);

	if (STATE.pathType) {
		const type = document.createElement("span");
		type.className = "chip chip-accent";
		type.textContent = STATE.pathType === "BSCH" ? "BSc (Hons)" : "BSc";
		chip.appendChild(type);
	}

	bar.appendChild(chip);
}

// ─── Inline Continue Block ───────────────────────────────────────────────────

function updateContinueBar() {
	const wrapper = document.getElementById("continue-block");
	const btn = document.getElementById("continue-btn");
	const hint = document.getElementById("continue-hint");
	if (!wrapper || !btn || !hint) return;

	const hide = () => {
		wrapper.style.display = "none";
	};

	if (STATE.currentSemester === 0) {
		hide();
		return;
	}

	// The end section is rendered by renderJourney; once it exists in the DOM
	// the continue block is no longer needed.
	const endShown = !!document.getElementById("end-section");
	if (endShown) {
		hide();
		return;
	}

	if (STATE.currentSemester === 6 && (STATE.forkUIShown || STATE.forkChosen)) {
		hide();
		return;
	}

	wrapper.style.display = "flex";

	const complete = isSemesterComplete(STATE.currentSemester);

	if (STATE.currentSemester === 6) {
		btn.textContent = "Finish Semester 6";
	} else if (STATE.currentSemester === 8) {
		btn.textContent = "Complete Programme";
	} else {
		btn.textContent = `Continue to Semester ${STATE.currentSemester + 1}`;
	}

	btn.disabled = !complete;

	hint.replaceChildren();
	if (!complete) {
		const missing = _getMissingSlots(STATE.currentSemester);
		for (const label of missing) {
			const chip = document.createElement("span");
			chip.className = "chip chip-neutral";
			chip.textContent = label;
			hint.appendChild(chip);
		}
	} else {
		const chip = document.createElement("span");
		chip.className = "chip chip-met";
		chip.textContent = "All choices made";
		hint.appendChild(chip);
	}
}

// Elective counter shown in the inline continue block during Sems 4–6.
function updateElectiveCounter() {
	const counter = document.getElementById("elective-counter");
	if (!counter) return;
	if (
		STATE.currentSemester >= 4 &&
		STATE.currentSemester <= 6 &&
		STATE.currentSemester !== 0
	) {
		const slots = [
			"DISCIPLINE_ELECTIVE_1",
			"DISCIPLINE_ELECTIVE_2",
			"DISCIPLINE_ELECTIVE_3",
			"DISCIPLINE_ELECTIVE_4",
		];
		const chosen = slots.filter((s) => !!STATE.selections[s]).length;
		counter.textContent = `${chosen}/4 electives chosen`;
	} else {
		counter.textContent = "";
	}
}

// ─── Modals ──────────────────────────────────────────────────────────────────

function openModal(node) {
	closeModal();
	lastFocusedEl = document.activeElement;
	document.body.appendChild(node);
	openModalEl = node;
	requestAnimationFrame(() => node.classList.add("is-open"));
	const first = node.querySelector(
		'.picker-search, .modal-close, button, input, [tabindex]:not([tabindex="-1"])',
	);
	if (first && typeof first.focus === "function") first.focus();
}

function closeModal() {
	if (openModalEl) {
		openModalEl.remove();
		openModalEl = null;
	}
	if (typeof hideInfoTip === "function") hideInfoTip();
	if (
		lastFocusedEl &&
		lastFocusedEl.isConnected &&
		typeof lastFocusedEl.focus === "function"
	) {
		lastFocusedEl.focus();
	}
}

function isModalOpen() {
	return openModalEl !== null;
}

function getOpenModal() {
	return openModalEl;
}

// The actual .modal node inside the open backdrop (or the node itself).
function getOpenModalNode() {
	const bd = getOpenModal();
	if (!bd) return null;
	return bd.classList.contains("modal") ? bd : bd.querySelector(".modal");
}

// ── Course detail modal ──

function renderCourseDetailModal(courseCode, slotKey) {
	const course = CURRICULUM.courses[courseCode];
	if (!course) return;

	const backdrop = document.createElement("div");
	backdrop.className = "modal-backdrop";
	backdrop.dataset.action = "close-modal";

	const modal = document.createElement("div");
	modal.className = "modal";
	modal.setAttribute("role", "dialog");
	modal.setAttribute("aria-modal", "true");
	modal.setAttribute("aria-label", course.title);

	const header = document.createElement("div");
	header.className = "modal-header";

	const headerText = document.createElement("div");
	const h2 = document.createElement("h2");
	h2.textContent = course.title;
	headerText.appendChild(h2);

	if (slotKey) {
		const context = document.createElement("p");
		context.className = "modal-context";
		context.textContent = `Picked for: ${_getSlotLabel(slotKey)} · ${_getSlotSemester(slotKey).label}`;
		headerText.appendChild(context);
	}
	header.appendChild(headerText);

	const closeBtn = makeModalCloseButton();
	header.appendChild(closeBtn);
	modal.appendChild(header);

	const body = document.createElement("div");
	body.className = "modal-body";

	const meta = document.createElement("div");
	meta.className = "modal-meta";
	const codeChip = document.createElement("span");
	codeChip.className = "chip chip-neutral";
	const codeEl = document.createElement("code");
	codeEl.textContent = courseCode;
	codeChip.appendChild(codeEl);
	meta.appendChild(codeChip);

	const unitsChip = document.createElement("span");
	unitsChip.className = "chip chip-neutral";
	unitsChip.textContent = `${course.units} units`;
	meta.appendChild(unitsChip);

	const typeChip = document.createElement("span");
	typeChip.className =
		course.type === "project" ? "chip chip-accent" : "chip chip-neutral";
	typeChip.textContent = _getTypeLabel(course.type);
	meta.appendChild(typeChip);
	body.appendChild(meta);

	const desc = document.createElement("p");
	desc.className = "modal-desc";
	desc.textContent = course.description;
	body.appendChild(desc);

	if (course.specializationHint) {
		const hint = document.createElement("div");
		hint.className = "spec-hint";
		hint.textContent = course.specializationHint;
		body.appendChild(hint);
	}

	const prereqStatus = getPrereqStatus(courseCode);
	if (prereqStatus.length > 0) {
		const section = document.createElement("div");
		section.className = "modal-section";
		const h3 = document.createElement("h3");
		h3.textContent = "Prerequisites";
		section.appendChild(h3);

		for (const p of prereqStatus) {
			const item = document.createElement("div");
			if (p.met) {
				item.className = "prereq-item met";
			} else if (isPrereqBlocking(p)) {
				item.className = "prereq-item blocking";
			} else {
				item.className = "prereq-item upcoming";
			}

			const badge = document.createElement("span");
			badge.className = `prereq-badge ${p.met ? "met" : isPrereqBlocking(p) ? "blocking" : "upcoming"}`;
			badge.textContent = p.met
				? "Met"
				: isPrereqBlocking(p)
					? "Missing"
					: "Upcoming";

			const name = document.createElement("span");
			name.textContent = `${p.title} (${p.code})`;
			if (!p.met && !isPrereqBlocking(p) && p.semesterFixed) {
				name.textContent += ` — taken in Semester ${p.semesterFixed}`;
			}

			item.appendChild(badge);
			item.appendChild(name);
			section.appendChild(item);
		}
		body.appendChild(section);
	}

	// Actions
	if (slotKey) {
		const locked = isSlotLocked(slotKey);
		if (locked) {
			const dependents = Object.values(STATE.selections).filter((code) =>
				(CURRICULUM.courses[code]?.prereqs ?? []).includes(courseCode),
			);
			const depNames = dependents
				.map((c) => CURRICULUM.courses[c]?.title ?? c)
				.join(", ");
			const note = document.createElement("div");
			note.className = "modal-lock-note";
			note.textContent = `Locked — can't change this choice because ${depNames} in your path depends on it.`;
			body.appendChild(note);
		} else {
			const actions = document.createElement("div");
			actions.className = "modal-actions";
			const changeBtn = document.createElement("button");
			changeBtn.className = "btn btn-primary";
			changeBtn.dataset.action = "change-course";
			changeBtn.dataset.slot = slotKey;
			changeBtn.textContent = "Change course";
			actions.appendChild(changeBtn);
			body.appendChild(actions);
		}
	}

	modal.appendChild(body);
	backdrop.appendChild(modal);
	openModal(backdrop);
}

// ── Course picker modal ──

function renderPickerModal(slotKey) {
	const slotLabel = _getSlotLabel(slotKey);
	const semInfo = _getSlotSemester(slotKey);
	const { courses, tabType } = getPoolForSlot(slotKey);

	const backdrop = document.createElement("div");
	backdrop.className = "modal-backdrop";
	backdrop.dataset.action = "close-modal";

	const modal = document.createElement("div");
	modal.className = "modal is-picker";
	modal.setAttribute("role", "dialog");
	modal.setAttribute("aria-modal", "true");
	modal.dataset.slot = slotKey;
	modal.dataset.tab = "All";
	modal.dataset.search = "";
	modal.setAttribute("aria-label", `Choose ${slotLabel}`);

	const header = document.createElement("div");
	header.className = "modal-header";

	const headerText = document.createElement("div");
	const h2 = document.createElement("h2");
	h2.textContent = `Choose · ${slotLabel}`;
	headerText.appendChild(h2);
	const context = document.createElement("p");
	context.className = "modal-context";
	context.textContent = `${semInfo.label} · ${courses.length} courses available`;
	headerText.appendChild(context);
	header.appendChild(headerText);

	const closeBtn = makeModalCloseButton();
	header.appendChild(closeBtn);
	modal.appendChild(header);

	const toolbar = document.createElement("div");
	toolbar.className = "picker-toolbar";

	const search = document.createElement("input");
	search.className = "picker-search";
	search.type = "search";
	search.placeholder = "Search by course name or code…";
	search.setAttribute("aria-label", "Search courses");
	toolbar.appendChild(search);

	if (tabType !== "none" && tabType !== "open_only") {
		const tabsEl = document.createElement("div");
		tabsEl.className = "grid-tabs";
		const tabs =
			tabType === "mixed"
				? ["All", "AIML", "Cloud", "Full-Stack", "Other", "Open Elective"]
				: ["All", "AIML", "Cloud", "Full-Stack", "Other"];
		for (const tab of tabs) {
			const btn = document.createElement("button");
			btn.className = "grid-tab" + (tab === "All" ? " is-active" : "");
			btn.dataset.tab = tab;
			btn.dataset.action = "grid-tab";
			btn.textContent = tab;
			tabsEl.appendChild(btn);
		}
		toolbar.appendChild(tabsEl);
	}
	modal.appendChild(toolbar);

	const body = document.createElement("div");
	body.className = "modal-body";
	const cards = document.createElement("div");
	cards.className = "picker-cards";
	body.appendChild(cards);
	modal.appendChild(body);

	const footer = document.createElement("p");
	footer.className = "picker-footer-note";
	footer.textContent =
		"Click a course to add it — you can change it later from your path.";
	modal.appendChild(footer);

	backdrop.appendChild(modal);
	openModal(backdrop);
	renderPickerCards(modal);
}

// Re-renders the card grid inside an open picker modal, honoring tab + search.
function renderPickerCards(modalEl) {
	// Normalize: state lives on the .modal node, handlers may pass the backdrop.
	modalEl =
		modalEl.classList.contains("modal")
			? modalEl
			: modalEl.querySelector(".modal");
	if (!modalEl) return;
	if (typeof hideInfoTip === "function") hideInfoTip();

	const slotKey = modalEl.dataset.slot;
	const activeTab = modalEl.dataset.tab || "All";
	const q = (modalEl.dataset.search || "").toLowerCase();

	const cardsEl = modalEl.querySelector(".picker-cards");
	if (!cardsEl) return;
	cardsEl.replaceChildren();

	const footer = modalEl.querySelector(".picker-footer-note");
	if (footer)
		footer.textContent =
			"Tap a course to select it — hover the info mark for details.";

	const { courses } = getPoolForSlot(slotKey);
	const selectedCode = STATE.selections[slotKey];

	const list = filterCoursesByTab(courses, activeTab).filter((code) => {
		if (!q) return true;
		const course = CURRICULUM.courses[code];
		const title = course?.title ?? "";
		return title.toLowerCase().includes(q) || code.toLowerCase().includes(q);
	});

	// Enabled cards first (selected first), then disabled ones.
	const withState = list.map((code) => {
		const prereqStatus = getPrereqStatus(code);
		const unmet = prereqStatus.filter((p) => !p.met);
		const isDup = isDuplicateInOtherSlot(code, slotKey);
		const disabled = unmet.length > 0 || isDup;
		return { code, unmet, isDup, disabled, isSelected: selectedCode === code };
	});
	withState.sort(
		(a, b) =>
			Number(a.disabled) - Number(b.disabled) ||
			Number(b.isSelected) - Number(a.isSelected),
	);

	if (withState.length === 0) {
		const empty = document.createElement("p");
		empty.className = "picker-empty";
		empty.textContent = q
			? "No courses match your search."
			: "No courses available here.";
		cardsEl.appendChild(empty);
		return;
	}

	for (const item of withState) {
		cardsEl.appendChild(buildPickerCard(item.code, slotKey, item));
	}
}

function buildPickerCard(code, slotKey, item) {
	const course = CURRICULUM.courses[code];
	const btn = document.createElement("button");
	btn.type = "button";
	btn.className = "picker-card" + (item.isSelected ? " is-selected" : "");
	btn.dataset.action = "choose-course";
	btn.dataset.course = code;
	btn.dataset.slot = slotKey;
	btn.disabled = item.disabled;
	btn.setAttribute(
		"aria-label",
		item.isSelected ? `${course.title} — currently chosen` : course.title,
	);

	// Info mark — hover (or tap) shows a description tooltip
	const info = document.createElement("span");
	info.className = "picker-info";
	info.setAttribute("aria-hidden", "true");
	info.textContent = "i";
	btn.appendChild(info);

	const top = document.createElement("div");
	top.className = "picker-card-top";
	const title = document.createElement("span");
	title.className = "picker-card-title";
	title.textContent = course.title;
	top.appendChild(title);
	btn.appendChild(top);

	const meta = document.createElement("div");
	meta.className = "picker-card-meta";
	const codeEl = document.createElement("code");
	codeEl.textContent = code;
	meta.appendChild(codeEl);
	meta.appendChild(document.createTextNode(` · ${course.units}u`));
	if (course.specialization) {
		const specChip = document.createElement("span");
		specChip.className = "chip chip-accent";
		specChip.textContent = _getSpecLabel(course.specialization);
		meta.appendChild(specChip);
	}
	btn.appendChild(meta);

	const status = document.createElement("div");
	status.className = "picker-card-status";

	if (item.isSelected) {
		const chip = document.createElement("span");
		chip.className = "chip chip-met";
		chip.textContent = "Selected";
		status.appendChild(chip);
	} else if (item.isDup) {
		const span = document.createElement("span");
		span.textContent = "Already chosen in another slot.";
		status.appendChild(span);
	} else if (item.unmet.length > 0) {
		const span = document.createElement("span");
		const label = document.createElement("span");
		label.className = "needs-label";
		label.textContent = "Needs: ";
		span.appendChild(label);
		span.appendChild(
			document.createTextNode(item.unmet.map((p) => p.title).join(", ")),
		);
		status.appendChild(span);
	}

	btn.appendChild(status);
	return btn;
}

// ─── SVG / UI helpers ────────────────────────────────────────────────────────

// Builds an inline SVG icon from part descriptors ({ tag, attrs }).
function makeSvg(parts, strokeWidth = 2.5) {
	const svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
	svg.setAttribute("viewBox", "0 0 24 24");
	svg.setAttribute("fill", "none");
	svg.setAttribute("stroke", "currentColor");
	svg.setAttribute("stroke-width", String(strokeWidth));
	svg.setAttribute("stroke-linecap", "round");
	svg.setAttribute("stroke-linejoin", "round");
	for (const part of parts) {
		const el = document.createElementNS("http://www.w3.org/2000/svg", part.tag);
		for (const [k, v] of Object.entries(part.attrs)) el.setAttribute(k, v);
		svg.appendChild(el);
	}
	return svg;
}

function makeIcon(pathD) {
	return makeSvg([{ tag: "path", attrs: { d: pathD } }]);
}

function makeModalCloseButton() {
	const btn = document.createElement("button");
	btn.className = "modal-close";
	btn.dataset.action = "close-modal";
	btn.setAttribute("aria-label", "Close");
	btn.textContent = "Close";
	return btn;
}
