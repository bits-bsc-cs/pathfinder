// app.js — event wiring and application logic

function initApp() {
	loadState();
	applyTheme();
	renderApp();
	attachEventListeners();
	updateThemeButton();
}

function attachEventListeners() {
	const header = document.getElementById("app-header");
	if (header) header.addEventListener("click", handleHeaderClick);

	const page = document.getElementById("page");
	if (page) {
		page.addEventListener("click", handlePageClick);
		page.addEventListener("keydown", handlePageKeydown);
	}

	// Modal interactions (modals live at body level)
	document.addEventListener("click", handleDocumentClick);
	document.addEventListener("input", handleDocumentInput);
	document.addEventListener("keydown", handleGlobalKeydown);

	// Info tooltip: hover in/out
	document.addEventListener("mouseover", handleInfoMouseover);
	document.addEventListener("mouseout", handleInfoMouseout);
}

// ─── Page (journey) interactions ─────────────────────────────────────────────

function handlePageClick(e) {
	const target = e.target.closest("[data-action]");
	if (!target) return;
	const action = target.dataset.action;

	switch (action) {
		case "start":
			onStart();
			break;

		case "course-info": {
			const code = target.dataset.course;
			const slot = target.dataset.slot || null;
			renderCourseDetailModal(code, slot);
			break;
		}

		case "open-grid": {
			const slotKey = target.dataset.slot;
			if (slotKey) onOpenGrid(slotKey);
			break;
		}

		case "toggle-sem": {
			const semNum = parseInt(target.dataset.semester, 10);
			if (semNum) toggleSemester(semNum);
			break;
		}

		case "fork-choice": {
			const pathType = target.dataset.pathtype;
			if (pathType) onForkChoice(pathType);
			break;
		}

		case "start-over":
			onStartOver();
			break;

		case "switch-path":
			onSwitchPath();
			break;

		case "continue":
			handleContinue();
			break;

		default:
			break;
	}
}

// Enter/Space activate any [role="button"] element in the page.
function handlePageKeydown(e) {
	if (e.key !== "Enter" && e.key !== " ") return;
	const target = e.target.closest('[role="button"][data-action]');
	if (!target) return;
	e.preventDefault();
	target.click();
}

// ─── Header interactions ─────────────────────────────────────────────────────

function handleHeaderClick(e) {
	const target = e.target.closest("[data-action]");
	if (!target) return;

	switch (target.dataset.action) {
		case "toggle-theme":
			onToggleTheme();
			break;

		case "reset-btn":
			onResetBtnClick();
			break;

		default:
			break;
	}
}

// ─── Modal interactions ──────────────────────────────────────────────────────

function handleDocumentClick(e) {
	if (!isModalOpen()) return;
	const backdropEl = getOpenModal();
	if (!backdropEl.contains(e.target)) return;
	const modalEl = getOpenModalNode();
	if (!modalEl) return;

	// Info mark: show the tooltip, never select the course.
	const infoEl = e.target.closest(".picker-info");
	if (infoEl) {
		showInfoTip(infoEl);
		return;
	}
	// Clicking anywhere else closes any open info tip.
	hideInfoTip();

	const target = e.target.closest("[data-action]");
	if (!target) return;
	const action = target.dataset.action;

	switch (action) {
		case "close-modal": {
			// Close only when the backdrop itself (outside the modal) or the
			// Close button was clicked — not on clicks inside the modal.
			const isCloseBtn = target.classList.contains("modal-close");
			if (e.target === backdropEl || isCloseBtn) closeModal();
			break;
		}

		case "choose-course": {
			const code = target.dataset.course;
			const slot = target.dataset.slot;
			if (code && slot) chooseCourse(code, slot);
			break;
		}

		case "change-course": {
			const slot = target.dataset.slot;
			if (slot) {
				closeModal();
				onOpenGrid(slot);
			}
			break;
		}

		case "grid-tab": {
			const tab = target.dataset.tab;
			if (!tab) break;
			modalEl.querySelectorAll(".grid-tab").forEach((b) => {
				b.classList.toggle("is-active", b === target);
			});
			modalEl.dataset.tab = tab;
			renderPickerCards(modalEl);
			break;
		}

		default:
			break;
	}
}

// Live filtering while typing in the picker search box.
function handleDocumentInput(e) {
	if (!isModalOpen()) return;
	if (!e.target.classList.contains("picker-search")) return;
	const modalEl = getOpenModalNode();
	if (!modalEl) return;
	modalEl.dataset.search = e.target.value;
	renderPickerCards(modalEl);
}

function handleGlobalKeydown(e) {
	if (e.key === "Escape" && isModalOpen()) closeModal();
}

// ─── Course info tooltip (picker) ────────────────────────────────────────────
// Rendered at body level with position:fixed so it never clips inside the
// modal's scroll container.

let infoTipEl = null;
let infoTipFor = null;

function showInfoTip(infoEl) {
	if (infoTipFor === infoEl) return;
	hideInfoTip();

	const card = infoEl.closest(".picker-card");
	const code = card?.dataset.course;
	if (!code) return;
	const course = CURRICULUM.courses[code];
	const desc = course?.description || "";
	if (!desc) return;

	const tip = document.createElement("div");
	tip.className = "picker-info-tip-fixed";

	const head = document.createElement("div");
	head.className = "picker-info-tip-head";
	const headTitle = document.createElement("span");
	headTitle.textContent = course.title;
	head.appendChild(headTitle);
	const headCode = document.createElement("code");
	headCode.textContent = code;
	head.appendChild(headCode);
	tip.appendChild(head);

	const body = document.createElement("p");
	body.textContent = course.description;
	tip.appendChild(body);

	document.body.appendChild(tip);

	// Place near the mark, flipping above if it would overflow the viewport.
	const r = infoEl.getBoundingClientRect();
	const gap = 8;
	const below = r.bottom + gap;
	const top = below + tip.offsetHeight > window.innerHeight - gap
		? Math.max(gap, r.top - tip.offsetHeight - gap)
		: below;
	let left = r.right - tip.offsetWidth;
	left = Math.max(gap, Math.min(left, window.innerWidth - tip.offsetWidth - gap));

	tip.style.top = top + "px";
	tip.style.left = left + "px";

	infoTipEl = tip;
	infoTipFor = infoEl;
}

function hideInfoTip() {
	if (infoTipEl) {
		infoTipEl.remove();
		infoTipEl = null;
	}
	infoTipFor = null;
}

function handleInfoMouseover(e) {
	if (!isModalOpen()) return;
	const infoEl = e.target.closest(".picker-info");
	if (infoEl) showInfoTip(infoEl);
	// Leaving an info is handled by handleInfoMouseout — no hiding here, or
	// synthetic mouseovers (cursor under mutated DOM) would kill fresh tips.
}

function handleInfoMouseout(e) {
	if (!infoTipFor) return;
	// Only react when the cursor leaves the info that owns the open tip —
	// synthetic mouseouts from DOM mutations under the cursor must not kill it.
	if (e.target !== infoTipFor && !infoTipFor.contains(e.target)) return;
	const rel = e.relatedTarget;
	if (!rel || !rel.closest || !rel.closest(".picker-info")) hideInfoTip();
}

// ─── Actions ─────────────────────────────────────────────────────────────────

function onStart() {
	STATE.currentSemester = 1;
	STATE.revealedSemesters = [1];
	saveState();
	renderApp();
	scrollPageToTop();
}

function toggleSemester(semNum) {
	const section = document.querySelector(
		`.sem-section[data-semester="${semNum}"]`,
	);
	if (!section) return;
	const collapsed = section.classList.toggle("is-collapsed");
	if (collapsed) {
		expandedSemesters.delete(semNum);
	} else {
		expandedSemesters.add(semNum);
	}
}

function onOpenGrid(slotKey) {
	renderPickerModal(slotKey);
}

// Adds a course to a slot, closes the picker, patches the path in place.
function chooseCourse(code, slotKey) {
	STATE.selections[slotKey] = code;
	saveState();
	closeModal();
	patchCourseSelection(slotKey, code);

	// Return focus to the freshly filled card.
	const card = document.querySelector(`.course-card[data-slot="${slotKey}"]`);
	if (card && typeof card.focus === "function")
		card.focus({ preventScroll: true });
}

function handleContinue() {
	if (STATE.currentSemester === 0) return;
	if (!isSemesterComplete(STATE.currentSemester)) return;

	// Sem 6: reveal the fork decision
	if (STATE.currentSemester === 6 && !STATE.forkUIShown && !STATE.forkChosen) {
		STATE.forkUIShown = true;
		saveState();
		renderJourney();
		scrollToSection("fork-section");
		return;
	}

	// Programme complete at Sem 8
	if (STATE.currentSemester === 8) {
		STATE.forkChosen = true;
		saveState();
		renderJourney();
		scrollToSection("end-section");
		return;
	}

	const nextSem = STATE.currentSemester + 1;

	// BSc path ends after Sem 6
	if (nextSem > 6 && STATE.pathType === "BSC") {
		renderJourney();
		scrollToSection("end-section");
		return;
	}

	STATE.currentSemester = nextSem;
	if (!STATE.revealedSemesters.includes(nextSem)) {
		STATE.revealedSemesters.push(nextSem);
	}
	saveState();

	renderJourney();
	scrollToSemester(nextSem);
}

function onForkChoice(pathType) {
	STATE.pathType = pathType;
	STATE.forkChosen = true;

	if (pathType === "BSCH") {
		STATE.currentSemester = 7;
		if (!STATE.revealedSemesters.includes(7)) STATE.revealedSemesters.push(7);
	}
	saveState();

	renderJourney();
	renderProgressBar();

	if (pathType === "BSCH") {
		scrollToSemester(7);
	} else {
		scrollToSection("end-section");
	}
}

// From the end card: return to the fork decision (selections are kept).
function onSwitchPath() {
	STATE.pathType = null;
	STATE.forkChosen = false;
	STATE.forkUIShown = true;
	STATE.revealedSemesters = STATE.revealedSemesters.filter((n) => n <= 6);
	STATE.currentSemester = 6;
	saveState();
	renderJourney();
	scrollToSection("fork-section");
}

function onStartOver() {
	resetState(); // triggers renderApp()
	scrollPageToTop();
}

function onToggleTheme() {
	STATE.theme = STATE.theme === "dark" ? "light" : "dark";
	saveState();
	applyTheme();
	updateThemeButton();
}

function updateThemeButton() {
	const btn = document.getElementById("theme-toggle-btn");
	if (!btn) return;

	const dark = STATE.theme === "dark";
	btn.textContent = dark ? "Light" : "Dark";
	btn.setAttribute(
		"aria-label",
		dark ? "Switch to light theme" : "Switch to dark theme",
	);
}

function onResetBtnClick() {
	if (!window.confirm("Reset your whole path? This clears all selections.")) return;
	resetState(); // triggers renderApp()
	updateThemeButton();
	scrollPageToTop();
}

// ─── Scrolling helpers ───────────────────────────────────────────────────────

function scrollPageToTop() {
	const page = document.getElementById("page");
	if (page) page.scrollTo({ top: 0, behavior: "smooth" });
}

function scrollToSection(id) {
	const page = document.getElementById("page");
	if (!page) return;
	const el = document.getElementById(id);
	if (!el) return;
	const top = el.getBoundingClientRect().top + page.scrollTop - 76;
	page.scrollTo({ top: Math.max(top, 0), behavior: "smooth" });
}

function scrollToSemester(semNum) {
	const page = document.getElementById("page");
	if (!page) return;
	const section = document.querySelector(
		`.sem-section[data-semester="${semNum}"]`,
	);
	if (!section) return;
	const top = section.getBoundingClientRect().top + page.scrollTop - 76;
	page.scrollTo({ top: Math.max(top, 0), behavior: "smooth" });
}

document.addEventListener("DOMContentLoaded", initApp);
