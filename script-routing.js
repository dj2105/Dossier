const DATA_FILES = {
  shell: './data/dossier-shell.json',
  masterTimeline: './data/master-timeline.json',
  phase1: './data/phase1.json',
  phase2: './data/phase2-stub.json',
  phase3: './data/phase3-stub.json',
  sections: './data/dossier-sections.json',
  appendices: './data/appendices.json',
  routes: './data/routes/evidence-links.json'
};

const ZOOM_LEVELS = [
  { id: 'macro', label: 'Macro', pxPerDay: 7, cardClass: 'macro' },
  { id: 'phase', label: 'Phase', pxPerDay: 14, cardClass: 'phase' },
  { id: 'evidence', label: 'Evidence', pxPerDay: 24, cardClass: 'evidence' },
  { id: 'cluster', label: 'Cluster', pxPerDay: 34, cardClass: 'cluster' }
];

const LANE_POSITIONS = {
  operational: 90,
  communication: 205,
  process: 110,
  hr_grievance: 388
};

const NAV_ITEMS = [
  { id: 'overview', label: 'Overview' },
  { id: 'sections', label: 'Report Sections' },
  { id: 'appendices', label: 'Appendices' },
  { id: 'timeline', label: 'Master Timeline' },
  { id: 'document-map', label: 'Document Map' }
];

const state = {
  data: null,
  zoomIndex: 1,
  activeView: 'overview',
  selectedItem: null,
  selectedSection: null,
  selectedAppendix: null,
  selectedDocumentMap: null,
  focusPhase: 'all'
};

const dom = {};

init();

async function init() {
  cacheDom();
  bindShellEvents();
  try {
    state.data = await loadData();
    renderShell();
    setView('overview');
    renderTimeline();
    renderEvidencePanel();
  } catch (error) {
    console.error(error);
  }
}

function cacheDom() {
  dom.title = document.getElementById('dossier-title');
  dom.headerMeta = document.getElementById('header-meta');
  dom.documentStatus = document.getElementById('document-status');
  dom.workspaceLabel = document.getElementById('workspace-label');
  dom.primaryNav = document.getElementById('primary-nav');
  dom.railContent = document.getElementById('rail-content');
  dom.phaseSummaryList = document.getElementById('phase-summary-list');
  dom.overviewPanel = document.getElementById('overview-panel');
  dom.timelinePanel = document.getElementById('timeline-panel');
  dom.contentPanel = document.getElementById('content-panel');
  dom.evidencePanel = document.getElementById('evidence-panel');
  dom.zoomGroup = document.getElementById('zoom-group');
  dom.timelineScroll = document.getElementById('timeline-scroll');
  dom.timelineCanvas = document.getElementById('timeline-canvas');
  dom.timelineGrid = document.getElementById('timeline-grid');
  dom.timelinePhases = document.getElementById('timeline-phases');
  dom.timelineItems = document.getElementById('timeline-items');
  dom.zoomIndicator = document.getElementById('zoom-indicator');
  dom.timespanIndicator = document.getElementById('timespan-indicator');
  dom.focusIndicator = document.getElementById('focus-indicator');
  dom.rangeStrip = document.getElementById('range-strip');
  dom.debugToggle = document.getElementById('debug-toggle');
}

async function loadData() {
  const [shell, masterTimeline, phase1, phase2, phase3, sections, appendices, routes] = await Promise.all(
    Object.values(DATA_FILES).map((path) => fetch(path).then((response) => response.json()))
  );
  const phases = [phase1, phase2, phase3];
  const allItems = phases.flatMap((phase) => phase.items.map((item) => ({ ...item, phase: phase.phase.id })));
  const documentMap = shell.document_map.map((entry, index) => ({ id: `cluster-${String.fromCharCode(97 + index)}`, ...entry }));
  return {
    shell,
    masterTimeline,
    phases,
    sections,
    appendices,
    routes,
    documentMap,
    allItems,
    routeIndex: {
      timeline: new Map((routes.timeline_routes || []).map((route) => [route.item_id, route])),
      section: new Map((routes.section_routes || []).map((route) => [route.section_id, route])),
      appendix: new Map((routes.appendix_routes || []).map((route) => [route.appendix_id, route])),
      documentMap: new Map((routes.document_map_routes || []).map((route) => [route.document_map_id, route]))
    },
    dateStart: new Date(masterTimeline.start_date_iso),
    dateEnd: new Date(masterTimeline.end_date_iso)
  };
}

function bindShellEvents() {
  document.addEventListener('click', (event) => {
    const viewButton = event.target.closest('[data-view]');
    if (viewButton) return setView(viewButton.dataset.view);
    const actionButton = event.target.closest('[data-action]');
    if (!actionButton) return;
    handleAction(actionButton);
  });
  dom.zoomGroup.addEventListener('click', (event) => {
    const button = event.target.closest('[data-zoom-index]');
    if (!button) return;
    state.zoomIndex = Number(button.dataset.zoomIndex);
    renderTimeline();
  });
  dom.debugToggle.addEventListener('change', (event) => {
    document.body.classList.toggle('debug', event.target.checked);
  });
}

function renderShell() {
  const { shell, masterTimeline, phases } = state.data;
  dom.title.textContent = shell.title;
  dom.documentStatus.textContent = shell.status;
  dom.headerMeta.innerHTML = [shell.organisation, shell.submission_context, shell.date, masterTimeline.date_display].map((v) => `<span>${v}</span>`).join('');
  dom.primaryNav.innerHTML = NAV_ITEMS.map((item) => `<button class="nav-btn ${item.id === state.activeView ? 'active' : ''}" data-view="${item.id}">${item.label}</button>`).join('');
  dom.phaseSummaryList.innerHTML = phases.map((phase) => `<button class="phase-pill ${state.focusPhase === phase.phase.id ? 'active' : ''}" data-action="focus-phase" data-phase="${phase.phase.id}"><strong>${phase.phase.label}</strong><small>${phase.phase.date_display}</small><small>${phase.phase.summary}</small></button>`).join('');
  renderRail(state.activeView);
  renderOverview();
  renderZoomControls();
  renderRangeStrip();
}

function renderRail(mode) {
  if (mode === 'overview' || mode === 'sections') {
    dom.railContent.innerHTML = `<div class="route-list">${state.data.sections.sections.map((section) => `<button class="route-btn ${state.selectedSection?.id === section.id ? 'active' : ''}" data-action="open-section" data-section-id="${section.id}"><strong>${section.code} ${section.title}</strong><small>${section.stub_summary}</small></button>`).join('')}</div>`;
    return;
  }
  if (mode === 'appendices') {
    dom.railContent.innerHTML = `<div class="route-list">${state.data.appendices.appendices.map((appendix) => `<button class="route-btn ${state.selectedAppendix?.id === appendix.id ? 'active' : ''}" data-action="open-appendix" data-appendix-id="${appendix.id}"><strong>Appendix ${appendix.code}</strong><small>${appendix.stub_summary}</small></button>`).join('')}</div>`;
    return;
  }
  dom.railContent.innerHTML = `<div class="route-list">${state.data.shell.document_routes.map((route) => `<button class="route-btn ${state.activeView === route.view ? 'active' : ''}" data-view="${route.view}"><strong>${route.label}</strong><small>${route.description}</small></button>`).join('')}</div>`;
}

function renderOverview() {
  const { shell, sections, appendices, phases } = state.data;
  dom.overviewPanel.innerHTML = `
    <div class="overview-hero">
      <div class="intro-grid">
        <div class="summary-card"><p class="panel-kicker">Dossier overview</p><h2>${shell.title}</h2><p>${shell.concise_intro}</p></div>
        <div class="summary-card"><p class="panel-kicker">Reading order</p><h3>Dossier first</h3><p>Read report sections for the narrative spine, use appendices for evidence verification, then use the timeline to inspect chronology and escalation.</p></div>
      </div>
      <div class="structure-grid">${phases.map((phase) => `<div class="phase-card"><p class="panel-kicker">${phase.phase.label}</p><h3>${phase.phase.subtitle}</h3><p>${phase.phase.summary}</p><div class="chip-row"><span class="label-chip">${phase.phase.date_display}</span><span class="label-chip">${phase.items.length} markers</span></div></div>`).join('')}</div>
      <div class="cards-grid">
        <div class="content-card"><p class="panel-kicker">Report sections</p><h3>${sections.sections.length} destinations</h3><p>Main dossier reading routes.</p></div>
        <div class="content-card"><p class="panel-kicker">Appendices</p><h3>${appendices.appendices.length} families</h3><p>Evidence repositories for exhibit-level reading.</p></div>
        <div class="content-card"><p class="panel-kicker">Document map</p><h3>Cross-reference shell</h3><p>Cluster view linking chronology, sections, and appendices.</p></div>
      </div>
    </div>`;
}

function renderZoomControls() {
  dom.zoomGroup.innerHTML = ZOOM_LEVELS.map((zoom, index) => `<button class="zoom-btn ${index === state.zoomIndex ? 'active' : ''}" data-zoom-index="${index}">${zoom.label}</button>`).join('');
}

function setView(view) {
  state.activeView = view;
  dom.workspaceLabel.textContent = NAV_ITEMS.find((item) => item.id === view)?.label || 'Overview';
  dom.overviewPanel.classList.toggle('hidden', view !== 'overview');
  dom.timelinePanel.classList.toggle('hidden', view !== 'timeline');
  dom.contentPanel.classList.toggle('hidden', !['sections', 'appendices', 'document-map'].includes(view));
  renderRail(view);
  if (view === 'overview') renderOverview();
  if (view === 'sections') renderSections();
  if (view === 'appendices') renderAppendices();
  if (view === 'document-map') renderDocumentMap();
  if (view === 'timeline') renderTimeline();
  renderShellNavState();
}

function renderShellNavState() {
  dom.primaryNav.querySelectorAll('.nav-btn').forEach((button) => button.classList.toggle('active', button.dataset.view === state.activeView));
}

function renderTimeline() {
  const zoom = ZOOM_LEVELS[state.zoomIndex];
  const totalDays = diffDays(state.data.dateStart, state.data.dateEnd);
  const width = 220 + totalDays * zoom.pxPerDay;
  dom.timelineCanvas.style.width = `${width}px`;
  dom.timelinePhases.innerHTML = '';
  dom.timelineItems.innerHTML = '';
  dom.timelineGrid.innerHTML = '';
  renderTimelineGrid(zoom);
  renderPhaseBands(zoom);
  renderTimelineItems(zoom);
  dom.zoomIndicator.textContent = `Zoom: ${zoom.label}`;
  dom.timespanIndicator.textContent = `Timespan: ${state.data.masterTimeline.date_display}`;
  dom.focusIndicator.textContent = `Focus: ${state.focusPhase === 'all' ? 'all phases' : state.focusPhase}`;
}

function renderTimelineGrid(zoom) {
  buildMonthTicks(state.data.dateStart, state.data.dateEnd).forEach((month) => {
    const x = calculateX(month.iso, zoom);
    dom.timelineGrid.insertAdjacentHTML('beforeend', `<div class="grid-line" style="left:${x}px"></div><div class="grid-label" style="left:${x + 6}px">${month.label}</div>`);
  });
}

function renderPhaseBands(zoom) {
  state.data.phases.forEach((phase) => {
    const left = calculateX(phase.phase.start_date_iso, zoom);
    const right = calculateX(addDay(phase.phase.end_date_iso), zoom);
    dom.timelinePhases.insertAdjacentHTML('beforeend', `<section class="phase-band ${phase.phase.id}" style="left:${left}px; width:${Math.max(right - left - 8, 180)}px;"><h3 class="phase-band__title">${phase.phase.label}</h3><div class="phase-band__meta"><span>${phase.phase.subtitle}</span><span>${phase.phase.date_display}</span></div><p class="phase-band__summary">${phase.phase.summary}</p></section>`);
  });
}

function renderTimelineItems(zoom) {
  getVisibleItems().forEach((item) => {
    const left = calculateX(item.date_iso, zoom);
    const top = LANE_POSITIONS[item.lane] ?? 150;
    const positionClass = top < 250 ? 'above' : 'below';
    const route = getTimelineRoute(item.id);
    const connectorHeight = top < 250 ? 330 - (top + 44) : (top - 330) + 18;
    dom.timelineItems.insertAdjacentHTML('beforeend', `<article class="timeline-item ${zoom.cardClass} ${item.is_placeholder ? 'placeholder' : ''} ${positionClass} ${state.selectedItem?.id === item.id ? 'selected' : ''}" style="left:${left}px; top:${top}px;" data-id="${item.id}" data-lane="${item.lane}"><div class="item-connector ${positionClass}" style="height:${Math.max(connectorHeight, 18)}px;"></div><div class="item-head"><span class="item-date">${item.date_display}</span>${item.evidence_code ? `<span class="item-code">${item.evidence_code}</span>` : ''}</div><h3 class="item-title">${zoom.id === 'macro' ? item.short_label : item.title}</h3>${item.status ? `<div class="status-inline">${item.status}</div>` : ''}${item.summary ? `<div class="item-summary">${item.summary}</div>` : ''}${item.body && zoom.id !== 'macro' ? `<div class="item-body">${item.body}</div>` : ''}${item.quote && zoom.id !== 'macro' ? `<blockquote class="item-quote">${item.quote}</blockquote>` : ''}<div class="item-footer"><span>${route?.section_id ? getSectionLabel(route.section_id) : item.related_report_section}</span><span class="meta-rich">${route?.appendix_id ? getAppendixLabel(route.appendix_id) : (item.appendix_family ? `Appendix ${item.appendix_family}` : '')}</span><span class="meta-rich">${route ? `Route: ${route.route_status}` : item.category}</span></div></article>`);
  });
  dom.timelineItems.querySelectorAll('.timeline-item').forEach((card) => card.addEventListener('click', () => {
    state.selectedItem = state.data.allItems.find((entry) => entry.id === card.dataset.id);
    renderTimeline();
    renderEvidencePanel(state.selectedItem);
  }));
}

function renderRangeStrip() {
  dom.rangeStrip.innerHTML = state.data.phases.map((phase) => `<button class="range-phase ${state.focusPhase === phase.phase.id ? 'active' : ''}" data-action="focus-phase" data-phase="${phase.phase.id}"><strong>${phase.phase.label}</strong><span>${phase.phase.date_display}</span><span>${phase.phase.subtitle}</span></button>`).join('');
}

function renderSections() {
  const sections = state.data.sections.sections;
  const selected = state.selectedSection || sections[0];
  state.selectedSection = selected;
  dom.contentPanel.innerHTML = `<div class="content-list">${sections.map((section) => `<article class="section-card ${selected.id === section.id ? 'active' : ''}"><p class="panel-kicker">${section.code}</p><h3>${section.title}</h3><p>${section.stub_summary}</p><button class="inline-button" data-action="open-section" data-section-id="${section.id}">Open section placeholder</button></article>`).join('')}</div>`;
  renderEvidencePanel({ type: 'section', ...selected });
}

function renderAppendices() {
  const appendices = state.data.appendices.appendices;
  const selected = state.selectedAppendix || appendices[0];
  state.selectedAppendix = selected;
  dom.contentPanel.innerHTML = `<div class="content-list">${appendices.map((appendix) => `<article class="appendix-card"><p class="panel-kicker">Appendix ${appendix.code}</p><h3>${appendix.title}</h3><p>${appendix.stub_summary}</p><button class="inline-button" data-action="open-appendix" data-appendix-id="${appendix.id}">Open appendix placeholder</button></article>`).join('')}</div>`;
  renderEvidencePanel({ type: 'appendix', ...selected });
}

function renderDocumentMap() {
  const selected = state.selectedDocumentMap || state.data.documentMap[0];
  state.selectedDocumentMap = selected;
  dom.contentPanel.innerHTML = `<div class="map-grid">${state.data.documentMap.map((entry) => `<article class="document-map-card ${selected.id === entry.id ? 'active' : ''}"><p class="panel-kicker">${entry.anchor}</p><h3>${entry.title}</h3><p>${entry.description}</p><button class="inline-button" data-action="open-document-map" data-document-map-id="${entry.id}">Open cluster placeholder</button></article>`).join('')}</div>`;
  renderEvidencePanel({ type: 'document-map', ...selected });
}

function renderEvidencePanel(item = state.selectedItem) {
  if (!item) {
    dom.evidencePanel.innerHTML = `<div class="evidence-panel__header"><p class="panel-kicker">Dossier evidence panel</p><h2>Gateway into the dossier</h2><p class="evidence-placeholder">Select a timeline item, report section, appendix family, or document-map cluster to inspect its dossier route, linked evidence family, and future dossier/exhibit targets.</p></div>`;
    return;
  }
  if (item.type === 'section') {
    const route = state.data.routeIndex.section.get(item.id);
    dom.evidencePanel.innerHTML = `<div class="evidence-panel__header"><p class="panel-kicker">Report section placeholder</p><h2>${item.code} ${item.title}</h2><p>${item.stub_summary}</p></div><div class="meta-grid"><div class="meta-box"><strong>Primary appendix family</strong><span>${item.primary_appendix_family}</span></div>${route ? `<div class="meta-box"><strong>Linked markers</strong><span>${route.timeline_item_ids.length}</span></div>` : ''}</div><div class="detail-actions"><button class="action-btn" data-view="timeline">Open master timeline</button></div>`;
    return;
  }
  if (item.type === 'appendix') {
    const route = state.data.routeIndex.appendix.get(item.id);
    dom.evidencePanel.innerHTML = `<div class="evidence-panel__header"><p class="panel-kicker">Appendix viewer target</p><h2>Appendix ${item.code}</h2><p>${item.stub_summary}</p></div><div class="meta-grid"><div class="meta-box"><strong>Scope</strong><span>${item.scope}</span></div>${route ? `<div class="meta-box"><strong>Linked markers</strong><span>${route.timeline_item_ids.length}</span></div>` : ''}</div><div class="detail-actions"><button class="action-btn" data-view="timeline">Open master timeline</button></div>`;
    return;
  }
  if (item.type === 'document-map') {
    const route = state.data.routeIndex.documentMap.get(item.id);
    dom.evidencePanel.innerHTML = `<div class="evidence-panel__header"><p class="panel-kicker">Document-map cluster</p><h2>${item.title}</h2><p>${item.description}</p></div><div class="meta-grid"><div class="meta-box"><strong>Section target</strong><span>${item.section_target}</span></div>${route ? `<div class="meta-box"><strong>Linked markers</strong><span>${route.timeline_item_ids.length}</span></div>` : ''}</div><div class="detail-actions"><button class="action-btn" data-view="timeline">Open master timeline</button></div>`;
    return;
  }
  const route = getTimelineRoute(item.id);
  const section = route ? getSection(route.section_id) : null;
  const appendix = route ? getAppendix(route.appendix_id) : null;
  const documentMap = route ? getDocumentMap(route.document_map_id) : null;
  dom.evidencePanel.innerHTML = `<div class="evidence-panel__header"><p class="panel-kicker">Selected evidence route</p><h2>${item.title}</h2><p>${item.summary || item.body || item.placeholder_note || ''}</p></div><div class="meta-grid"><div class="meta-box"><strong>Date</strong><span>${item.date_display}</span></div><div class="meta-box"><strong>Route status</strong><span>${route?.route_status || 'Unmapped'}</span></div><div class="meta-box"><strong>Evidence code</strong><span>${item.evidence_code || 'Pending'}</span></div><div class="meta-box"><strong>Section</strong><span>${section ? `${section.code} ${section.title}` : item.related_report_section}</span></div></div><div class="detail-module"><strong>Appendix</strong><p>${appendix ? `Appendix ${appendix.code} — ${appendix.title}` : (item.related_appendix_target || '')}</p></div><div class="detail-module"><strong>Document-map cluster</strong><p>${documentMap ? `${documentMap.anchor} — ${documentMap.title}` : 'Cluster target pending'}</p></div><div class="detail-module"><strong>Dossier anchor</strong><p>${route?.dossier_anchor || item.related_dossier_page || 'Dossier anchor pending'}</p></div><div class="detail-module"><strong>Exhibit anchor</strong><p>${route?.exhibit_anchor || item.related_appendix_target || 'Exhibit anchor pending'}</p></div><div class="detail-module"><strong>Source extract</strong><p>${item.quote || item.source_wording || ''}</p></div><div class="detail-actions"><button class="action-btn" data-action="open-section" data-section-id="${route?.section_id || ''}">Open report section</button><button class="action-btn" data-action="open-appendix" data-appendix-id="${route?.appendix_id || ''}">Open appendix exhibit</button><button class="action-btn" data-action="open-document-map" data-document-map-id="${route?.document_map_id || ''}">Show document-map cluster</button></div>`;
}

function handleAction(button) {
  const action = button.dataset.action;
  if (action === 'zoom-in') { state.zoomIndex = Math.min(state.zoomIndex + 1, ZOOM_LEVELS.length - 1); return renderTimeline(); }
  if (action === 'zoom-out') { state.zoomIndex = Math.max(state.zoomIndex - 1, 0); return renderTimeline(); }
  if (action === 'focus-phase') { state.focusPhase = button.dataset.phase; setView('timeline'); return; }
  if (action === 'open-section') {
    const section = getSection(button.dataset.sectionId);
    if (!section) return;
    state.selectedSection = section;
    return setView('sections');
  }
  if (action === 'open-appendix') {
    const appendix = getAppendix(button.dataset.appendixId);
    if (!appendix) return;
    state.selectedAppendix = appendix;
    return setView('appendices');
  }
  if (action === 'open-document-map') {
    const cluster = getDocumentMap(button.dataset.documentMapId);
    if (!cluster) return;
    state.selectedDocumentMap = cluster;
    return setView('document-map');
  }
}

function getVisibleItems() {
  const items = state.focusPhase === 'all' ? state.data.allItems : state.data.allItems.filter((item) => item.phase === state.focusPhase);
  if (state.zoomIndex === 0) return items.filter((item) => item.display_priority <= 2);
  if (state.zoomIndex === 1) return items.filter((item) => item.zoom_visibility.includes('phase'));
  if (state.zoomIndex === 2) return items.filter((item) => item.zoom_visibility.includes('evidence'));
  return items;
}

function calculateX(dateIso, zoom) { return 120 + diffDays(state.data.dateStart, new Date(dateIso)) * zoom.pxPerDay; }
function buildMonthTicks(startDate, endDate) { const ticks = []; const cursor = new Date(startDate); cursor.setDate(1); while (cursor <= endDate) { ticks.push({ iso: cursor.toISOString().split('T')[0], label: cursor.toLocaleDateString('en-GB', { month: 'short', year: '2-digit' }) }); cursor.setMonth(cursor.getMonth() + 1); } return ticks; }
function diffDays(start, end) { return Math.round((new Date(end) - new Date(start)) / (24 * 60 * 60 * 1000)); }
function addDay(dateIso) { const date = new Date(dateIso); date.setDate(date.getDate() + 1); return date.toISOString().split('T')[0]; }
function getTimelineRoute(itemId) { return state.data.routeIndex.timeline.get(itemId) || null; }
function getSection(sectionId) { return state.data.sections.sections.find((entry) => entry.id === sectionId) || null; }
function getAppendix(appendixId) { return state.data.appendices.appendices.find((entry) => entry.id === appendixId) || null; }
function getDocumentMap(documentMapId) { return state.data.documentMap.find((entry) => entry.id === documentMapId) || null; }
function getSectionLabel(sectionId) { const section = getSection(sectionId); return section ? `${section.code} ${section.title}` : sectionId; }
function getAppendixLabel(appendixId) { const appendix = getAppendix(appendixId); return appendix ? `Appendix ${appendix.code}` : appendixId; }
