const DATA_FILES = {
  shell: './data/dossier-shell.json',
  masterTimeline: './data/master-timeline.json',
  phase1: './data/phase1.json',
  phase2: './data/phase2-stub.json',
  phase3: './data/phase3-stub.json',
  sections: './data/dossier-sections.json',
  appendices: './data/appendices.json'
};

const ZOOM_LEVELS = [
  { id: 'macro', label: 'Macro', pxPerDay: 7, cardClass: 'macro', monthsEvery: 1 },
  { id: 'phase', label: 'Phase', pxPerDay: 14, cardClass: 'phase', monthsEvery: 1 },
  { id: 'evidence', label: 'Evidence', pxPerDay: 24, cardClass: 'evidence', monthsEvery: 1 },
  { id: 'cluster', label: 'Cluster', pxPerDay: 34, cardClass: 'cluster', monthsEvery: 1 }
];

const LANE_POSITIONS = {
  operational: 90,
  communication: 205,
  process: 110,
  hr_grievance: 388
};

const NAV_ITEMS = [
  { id: 'overview', label: 'Overview' },
  { id: 'timeline', label: 'Master Timeline' },
  { id: 'sections', label: 'Report Sections' },
  { id: 'appendices', label: 'Appendices' },
  { id: 'document-map', label: 'Document Map' }
];

const state = {
  data: null,
  zoomIndex: 1,
  activeView: 'overview',
  selectedItem: null,
  selectedSection: null,
  selectedAppendix: null,
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
    dom.overviewPanel.innerHTML = `
      <div class="overview-hero">
        <p class="panel-kicker">Load error</p>
        <h2>Unable to load dossier architecture files</h2>
        <p>The prototype expects to be served over HTTP so that JSON files can load. If you opened the file directly, run a local server and reload.</p>
      </div>`;
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
  const [shell, masterTimeline, phase1, phase2, phase3, sections, appendices] = await Promise.all(
    Object.values(DATA_FILES).map((path) => fetch(path).then((response) => {
      if (!response.ok) throw new Error(`Failed to load ${path}`);
      return response.json();
    }))
  );

  const phases = [phase1, phase2, phase3];
  const allItems = phases.flatMap((phase) => phase.items.map((item) => ({ ...item, phase: phase.phase.id, phaseLabel: phase.phase.label })));

  return {
    shell,
    masterTimeline,
    phases,
    sections,
    appendices,
    allItems,
    dateStart: new Date(masterTimeline.start_date_iso),
    dateEnd: new Date(masterTimeline.end_date_iso)
  };
}

function bindShellEvents() {

  dom.zoomGroup.addEventListener('click', (event) => {
    const button = event.target.closest('[data-zoom-index]');
    if (!button) return;
    state.zoomIndex = Number(button.dataset.zoomIndex);
    renderTimeline();
  });

  document.addEventListener('click', (event) => {
    const viewButton = event.target.closest('[data-view]');
    if (viewButton) {
      setView(viewButton.dataset.view);
      return;
    }

    const actionButton = event.target.closest('[data-action]');
    if (!actionButton) return;
    handleAction(actionButton);
  });

  dom.debugToggle.addEventListener('change', (event) => {
    document.body.classList.toggle('debug', event.target.checked);
  });

  let isDragging = false;
  let startX = 0;
  let scrollLeft = 0;

  dom.timelineScroll.addEventListener('mousedown', (event) => {
    if (event.target.closest('.timeline-item')) return;
    isDragging = true;
    startX = event.pageX - dom.timelineScroll.offsetLeft;
    scrollLeft = dom.timelineScroll.scrollLeft;
  });

  ['mouseleave', 'mouseup'].forEach((name) => {
    dom.timelineScroll.addEventListener(name, () => { isDragging = false; });
  });

  dom.timelineScroll.addEventListener('mousemove', (event) => {
    if (!isDragging) return;
    event.preventDefault();
    const x = event.pageX - dom.timelineScroll.offsetLeft;
    const delta = (x - startX) * 1.25;
    dom.timelineScroll.scrollLeft = scrollLeft - delta;
  });
}

function renderShell() {
  const { shell, masterTimeline, phases } = state.data;
  dom.title.textContent = shell.title;
  dom.documentStatus.textContent = shell.status;
  dom.headerMeta.innerHTML = [
    `<span>${shell.organisation}</span>`,
    `<span>${shell.submission_context}</span>`,
    `<span>${shell.date}</span>`,
    `<span>${masterTimeline.date_display}</span>`
  ].join('');

  dom.primaryNav.innerHTML = NAV_ITEMS.map((item) => `
    <button class="nav-btn ${item.id === state.activeView ? 'active' : ''}" data-view="${item.id}">${item.label}</button>
  `).join('');

  dom.phaseSummaryList.innerHTML = phases.map((phase) => `
    <button class="phase-pill ${state.focusPhase === phase.phase.id ? 'active' : ''}" data-action="focus-phase" data-phase="${phase.phase.id}">
      <strong>${phase.phase.label}</strong>
      <small>${phase.phase.date_display}</small>
      <small>${phase.phase.summary}</small>
    </button>
  `).join('');

  renderRail('overview');
  renderOverview();
  renderZoomControls();
  renderRangeStrip();
}

function renderRail(mode) {
  const { shell, sections, appendices } = state.data;
  if (mode === 'overview' || mode === 'sections') {
    dom.railContent.innerHTML = `
      <div class="route-list">
        ${sections.sections.map((section) => `
          <button class="route-btn ${state.selectedSection?.id === section.id ? 'active' : ''}" data-action="open-section" data-section-id="${section.id}">
            <strong>${section.code} ${section.title}</strong>
            <small>${section.stub_summary}</small>
          </button>
        `).join('')}
      </div>`;
    return;
  }

  if (mode === 'appendices') {
    dom.railContent.innerHTML = `
      <div class="route-list">
        ${appendices.appendices.map((appendix) => `
          <button class="route-btn ${state.selectedAppendix?.id === appendix.id ? 'active' : ''}" data-action="open-appendix" data-appendix-id="${appendix.id}">
            <strong>Appendix ${appendix.code}</strong>
            <small>${appendix.stub_summary}</small>
          </button>
        `).join('')}
      </div>`;
    return;
  }

  dom.railContent.innerHTML = `
    <div class="route-list">
      ${shell.document_routes.map((route) => `
        <button class="route-btn ${state.activeView === route.view ? 'active' : ''}" data-view="${route.view}">
          <strong>${route.label}</strong>
          <small>${route.description}</small>
        </button>
      `).join('')}
    </div>`;
}

function renderOverview() {
  const { shell, sections, appendices, phases } = state.data;
  dom.overviewPanel.innerHTML = `
    <div class="overview-hero">
      <div class="intro-grid">
        <div class="summary-card">
          <p class="panel-kicker">Dossier overview</p>
          <h2>${shell.title}</h2>
          <p>${shell.concise_intro}</p>
          <div class="status-row">
            <span class="label-chip">Submission: ${shell.submission_context}</span>
            <span class="label-chip">Organisation: ${shell.organisation}</span>
            <span class="label-chip">Status: ${shell.status}</span>
          </div>
        </div>
        <div class="summary-card">
          <p class="panel-kicker">Architecture principle</p>
          <h3>Dossier → timeline</h3>
          <p>${shell.design_philosophy}</p>
          <p class="panel-note">The timeline is retained as an investigatory navigation layer. The report sections and appendices remain the primary destinations for evidential reading.</p>
        </div>
      </div>
      <div class="structure-grid">
        ${phases.map((phase) => `
          <div class="phase-card">
            <p class="panel-kicker">${phase.phase.label}</p>
            <h3>${phase.phase.subtitle}</h3>
            <p>${phase.phase.summary}</p>
            <div class="chip-row">
              <span class="label-chip">${phase.phase.date_display}</span>
              <span class="label-chip">${phase.items.length} timeline markers</span>
              <span class="label-chip">${phase.phase.stub_mode ? 'Draft stubs in use' : 'Phase 1 refined data'}</span>
            </div>
          </div>
        `).join('')}
      </div>
      <div class="cards-grid">
        <div class="content-card">
          <p class="panel-kicker">Report sections</p>
          <h3>${sections.sections.length} dossier destinations</h3>
          <p>The report section view is organised as the main narrative spine. Each section card can later open the full dossier page and associated evidence anchors.</p>
        </div>
        <div class="content-card">
          <p class="panel-kicker">Appendices</p>
          <h3>${appendices.appendices.length} appendix families</h3>
          <p>Appendix families are presented as evidence repositories rather than dead labels, with stub routes for future exhibit viewers and linked extracts.</p>
        </div>
        <div class="content-card">
          <p class="panel-kicker">Document map</p>
          <h3>Cross-reference shell</h3>
          <p>The document map summarises the relationship between timeline clusters, report sections, appendix families, and future dossier page targets.</p>
        </div>
      </div>
    </div>`;
}

function renderZoomControls() {
  dom.zoomGroup.innerHTML = ZOOM_LEVELS.map((zoom, index) => `
    <button class="zoom-btn ${index === state.zoomIndex ? 'active' : ''}" data-zoom-index="${index}">${zoom.label}</button>
  `).join('');
}

function setView(view) {
  state.activeView = view;
  dom.workspaceLabel.textContent = NAV_ITEMS.find((item) => item.id === view)?.label || 'Overview';
  dom.primaryNav.querySelectorAll('.nav-btn').forEach((button) => {
    button.classList.toggle('active', button.dataset.view === view);
  });

  dom.overviewPanel.classList.toggle('hidden', view !== 'overview');
  dom.timelinePanel.classList.toggle('hidden', view !== 'timeline');
  dom.contentPanel.classList.toggle('hidden', !['sections', 'appendices', 'document-map'].includes(view));

  renderRail(view);

  if (view === 'overview') renderOverview();
  if (view === 'sections') renderSections();
  if (view === 'appendices') renderAppendices();
  if (view === 'document-map') renderDocumentMap();
  if (view === 'timeline') renderTimeline();
}

function renderTimeline() {
  if (!state.data) return;
  renderZoomControls();
  renderRangeStrip();

  const zoom = ZOOM_LEVELS[state.zoomIndex];
  const totalDays = diffDays(state.data.dateStart, state.data.dateEnd);
  const width = 220 + totalDays * zoom.pxPerDay;
  dom.timelineCanvas.style.width = `${width}px`;
  dom.timelineCanvas.style.height = '600px';
  dom.timelineCanvas.style.setProperty('--axis-y', '330px');
  dom.timelinePhases.innerHTML = '';
  dom.timelineItems.innerHTML = '';
  dom.timelineGrid.innerHTML = '';

  renderTimelineGrid(width, zoom);
  renderPhaseBands(zoom);
  renderTimelineItems(zoom);

  dom.zoomIndicator.textContent = `Zoom: ${zoom.label}`;
  dom.timespanIndicator.textContent = `Timespan: ${state.data.masterTimeline.date_display}`;
  dom.focusIndicator.textContent = `Focus: ${state.focusPhase === 'all' ? 'all phases' : state.data.phases.find((phase) => phase.phase.id === state.focusPhase)?.phase.label}`;

  if (state.focusPhase !== 'all') scrollToPhase(state.focusPhase);
}

function renderTimelineGrid(width, zoom) {
  const months = buildMonthTicks(state.data.dateStart, state.data.dateEnd);
  months.forEach((month) => {
    const x = calculateX(month.iso, zoom);
    dom.timelineGrid.insertAdjacentHTML('beforeend', `
      <div class="grid-line" style="left:${x}px"></div>
      <div class="grid-label" style="left:${x + 6}px">${month.label}</div>
    `);
  });

  state.data.phases.slice(0, -1).forEach((phase) => {
    const x = calculateX(phase.phase.end_date_iso, zoom) + zoom.pxPerDay;
    dom.timelineGrid.insertAdjacentHTML('beforeend', `<div class="phase-boundary" style="left:${x}px"></div>`);
  });

  Object.entries(LANE_POSITIONS).forEach(([lane, y]) => {
    dom.timelineGrid.insertAdjacentHTML('beforeend', `
      <div class="lane-line" style="top:${y + 24}px"></div>
      <div class="lane-label" style="top:${y + 8}px">${lane.replace('_', ' ')}</div>
    `);
  });
}

function renderPhaseBands(zoom) {
  state.data.phases.forEach((phase) => {
    const left = calculateX(phase.phase.start_date_iso, zoom);
    const right = calculateX(addDay(phase.phase.end_date_iso), zoom);
    dom.timelinePhases.insertAdjacentHTML('beforeend', `
      <section class="phase-band ${phase.phase.id}" style="left:${left}px; width:${Math.max(right - left - 8, 180)}px;">
        <h3 class="phase-band__title">${phase.phase.label}</h3>
        <div class="phase-band__meta">
          <span>${phase.phase.subtitle}</span>
          <span>${phase.phase.date_display}</span>
        </div>
        <p class="phase-band__summary">${phase.phase.summary}</p>
      </section>
    `);
  });
}

function renderTimelineItems(zoom) {
  const focusItems = getVisibleItems();
  focusItems.forEach((item) => {
    const left = calculateX(item.date_iso, zoom);
    const top = LANE_POSITIONS[item.lane] ?? 150;
    const positionClass = top < 250 ? 'above' : 'below';
    const certainty = item.date_status.replaceAll('_', ' ');

    const connectorHeight = top < 250 ? 330 - (top + 44) : (top - 330) + 18;

    dom.timelineItems.insertAdjacentHTML('beforeend', `
      <article class="timeline-item ${zoom.cardClass} ${item.is_placeholder ? 'placeholder' : ''} ${positionClass} ${state.selectedItem?.id === item.id ? 'selected' : ''}"
        style="left:${left}px; top:${top}px;"
        data-id="${item.id}"
        data-lane="${item.lane}">
        <div class="item-connector ${positionClass}" style="height:${Math.max(connectorHeight, 18)}px;"></div>
        <div class="item-head">
          <span class="item-date">${item.date_display}</span>
          ${item.evidence_code ? `<span class="item-code">${item.evidence_code}</span>` : `<span class="marker-certainty">${certainty}</span>`}
        </div>
        <h3 class="item-title">${zoom.id === 'macro' ? item.short_label : item.title}</h3>
        ${item.status ? `<div class="status-inline">${item.status}</div>` : ''}
        ${item.summary ? `<div class="item-summary">${item.summary}</div>` : ''}
        ${item.body && zoom.id !== 'macro' ? `<div class="item-body">${item.body}</div>` : ''}
        ${item.quote && zoom.id !== 'macro' ? `<blockquote class="item-quote">${item.quote}</blockquote>` : ''}
        ${item.placeholder_note ? `<div class="placeholder-note">${item.placeholder_note}</div>` : ''}
        <div class="item-footer">
          <span>${item.related_report_section}</span>
          <span class="meta-rich">${item.appendix_family ? `Appendix ${item.appendix_family}` : 'Appendix target pending'}</span>
          <span class="meta-rich">${item.category}</span>
        </div>
      </article>
    `);
  });

  dom.timelineItems.querySelectorAll('.timeline-item').forEach((card) => {
    card.addEventListener('click', () => {
      const item = state.data.allItems.find((entry) => entry.id === card.dataset.id);
      state.selectedItem = item;
      renderTimeline();
      renderEvidencePanel(item);
    });
  });
}

function renderRangeStrip() {
  dom.rangeStrip.innerHTML = state.data.phases.map((phase) => `
    <button class="range-phase ${state.focusPhase === phase.phase.id ? 'active' : ''}" data-action="focus-phase" data-phase="${phase.phase.id}">
      <strong>${phase.phase.label}</strong>
      <span>${phase.phase.date_display}</span>
      <span>${phase.phase.subtitle}</span>
    </button>
  `).join('');
}

function renderSections() {
  const sections = state.data.sections.sections;
  const selected = state.selectedSection || sections[0];
  state.selectedSection = selected;
  dom.contentPanel.innerHTML = `
    <div class="content-list">
      ${sections.map((section) => `
        <article class="section-card ${selected.id === section.id ? 'active' : ''}">
          <p class="panel-kicker">${section.code}</p>
          <h3>${section.title}</h3>
          <p>${section.stub_summary}</p>
          <div class="chip-row">
            <span class="label-chip">${section.primary_appendix_family}</span>
            <span class="label-chip">${section.timeline_connection}</span>
          </div>
          <button class="inline-button" data-action="open-section" data-section-id="${section.id}">Open section placeholder</button>
        </article>
      `).join('')}
    </div>`;
  renderEvidencePanel({ type: 'section', ...selected });
}

function renderAppendices() {
  const appendices = state.data.appendices.appendices;
  const selected = state.selectedAppendix || appendices[0];
  state.selectedAppendix = selected;
  dom.contentPanel.innerHTML = `
    <div class="content-list">
      ${appendices.map((appendix) => `
        <article class="appendix-card">
          <p class="panel-kicker">Appendix ${appendix.code}</p>
          <h3>${appendix.title}</h3>
          <p>${appendix.stub_summary}</p>
          <div class="chip-row">
            <span class="label-chip">${appendix.scope}</span>
            <span class="label-chip">${appendix.future_viewer}</span>
          </div>
          <button class="inline-button" data-action="open-appendix" data-appendix-id="${appendix.id}">Open appendix placeholder</button>
        </article>
      `).join('')}
    </div>`;
  renderEvidencePanel({ type: 'appendix', ...selected });
}

function renderDocumentMap() {
  const { shell, phases, sections, appendices } = state.data;
  dom.contentPanel.innerHTML = `
    <div class="map-grid">
      ${shell.document_map.map((entry) => `
        <article class="document-map-card">
          <p class="panel-kicker">${entry.anchor}</p>
          <h3>${entry.title}</h3>
          <p>${entry.description}</p>
          <div class="chip-row">
            <span class="label-chip">${entry.section_target}</span>
            <span class="label-chip">${entry.appendix_target}</span>
          </div>
        </article>
      `).join('')}
      <article class="document-map-card">
        <p class="panel-kicker">Coverage status</p>
        <h3>Stub modelling in Phases 2 and 3</h3>
        <p>${phases.filter((phase) => phase.phase.stub_mode).length} phases currently use draft placeholders so zoom logic and dossier routing can be tested before the full evidence corpus is wired in.</p>
        <div class="chip-row">
          <span class="label-chip">${sections.sections.length} report section routes</span>
          <span class="label-chip">${appendices.appendices.length} appendix families</span>
        </div>
      </article>
    </div>`;
  renderEvidencePanel();
}

function renderEvidencePanel(item = state.selectedItem) {
  const shell = state.data?.shell;
  if (!item) {
    dom.evidencePanel.innerHTML = `
      <div class="evidence-panel__header">
        <p class="panel-kicker">Dossier evidence panel</p>
        <h2>Gateway into the dossier</h2>
        <p class="evidence-placeholder">Select a timeline item, report section, or appendix family to inspect its dossier-oriented routing metadata and placeholder evidence targets.</p>
      </div>
      <div class="detail-module">
        <strong>Expected panel modules</strong>
        <p>Related report section, appendix reference, investigator notes, source extract, and future dossier/exhibit buttons will surface here as the full site is wired in.</p>
      </div>
      <div class="detail-module">
        <strong>Document context</strong>
        <p>${shell ? shell.concise_intro : ''}</p>
      </div>`;
    return;
  }

  if (item.type === 'section') {
    dom.evidencePanel.innerHTML = `
      <div class="evidence-panel__header">
        <p class="panel-kicker">Report section placeholder</p>
        <h2>${item.code} ${item.title}</h2>
        <p>${item.stub_summary}</p>
      </div>
      <div class="meta-grid">
        <div class="meta-box"><strong>Primary appendix family</strong><span>${item.primary_appendix_family}</span></div>
        <div class="meta-box"><strong>Timeline connection</strong><span>${item.timeline_connection}</span></div>
      </div>
      <div class="detail-module"><strong>Section scope</strong><p>${item.stub_detail}</p></div>
      <div class="detail-actions">
        <button class="action-btn">Open full dossier section (placeholder)</button>
        <button class="action-btn">Open linked evidence extract (placeholder)</button>
      </div>`;
    return;
  }

  if (item.type === 'appendix') {
    dom.evidencePanel.innerHTML = `
      <div class="evidence-panel__header">
        <p class="panel-kicker">Appendix viewer target</p>
        <h2>Appendix ${item.code}</h2>
        <p>${item.stub_summary}</p>
      </div>
      <div class="meta-grid">
        <div class="meta-box"><strong>Scope</strong><span>${item.scope}</span></div>
        <div class="meta-box"><strong>Viewer route</strong><span>${item.future_viewer}</span></div>
      </div>
      <div class="detail-module"><strong>Exhibit target</strong><p>${item.stub_detail}</p></div>
      <div class="detail-actions">
        <button class="action-btn">Open appendix exhibit (placeholder)</button>
        <button class="action-btn">Document map cross-reference target</button>
      </div>`;
    return;
  }

  dom.evidencePanel.innerHTML = `
    <div class="evidence-panel__header">
      <p class="panel-kicker">Selected evidence route</p>
      <h2>${item.title}</h2>
      <p>${item.summary || item.body || item.placeholder_note || 'Linked evidence extract will load here.'}</p>
    </div>
    <div class="meta-grid">
      <div class="meta-box"><strong>Date</strong><span>${item.date_display}</span></div>
      <div class="meta-box"><strong>Certainty / status</strong><span>${item.date_status.replaceAll('_', ' ')}${item.status ? ` · ${item.status}` : ''}</span></div>
      <div class="meta-box"><strong>Evidence code</strong><span>${item.evidence_code || 'Pending exhibit mapping'}</span></div>
      <div class="meta-box"><strong>Appendix family</strong><span>${item.appendix_family || 'Appendix target pending'}</span></div>
    </div>
    <div class="detail-module"><strong>Related report section</strong><p>${item.related_report_section}</p></div>
    <div class="detail-module"><strong>Appendix reference</strong><p>${item.related_appendix_target || 'Appendix item viewer coming next.'}</p></div>
    <div class="detail-module"><strong>Investigator notes / evidence context</strong><p>${item.investigator_note || 'Documentary context placeholder. The full dossier page will expand the handling sequence, supporting exhibit links, and chronology notes.'}</p></div>
    <div class="detail-module"><strong>Source extract</strong><p>${item.quote || item.source_wording || 'Linked evidence extract will load here once the appendix viewer is connected.'}</p></div>
    <div class="detail-actions">
      <button class="action-btn">Open full dossier section (placeholder)</button>
      <button class="action-btn">Open appendix exhibit (placeholder)</button>
    </div>`;
}

function handleAction(button) {
  const { action } = button.dataset;
  if (action === 'zoom-in') {
    state.zoomIndex = Math.min(state.zoomIndex + 1, ZOOM_LEVELS.length - 1);
    renderTimeline();
    return;
  }
  if (action === 'zoom-out') {
    state.zoomIndex = Math.max(state.zoomIndex - 1, 0);
    renderTimeline();
    return;
  }
  if (action === 'reset-view' || action === 'fit-all') {
    state.focusPhase = 'all';
    state.zoomIndex = 1;
    dom.timelineScroll.scrollLeft = 0;
    renderShell();
    renderTimeline();
    return;
  }
  if (action === 'focus-phase') {
    state.focusPhase = button.dataset.phase;
    renderShell();
    setView('timeline');
    scrollToPhase(state.focusPhase);
    return;
  }
  if (action === 'open-section') {
    const section = state.data.sections.sections.find((entry) => entry.id === button.dataset.sectionId);
    state.selectedSection = section;
    setView('sections');
    renderRail('sections');
    return;
  }
  if (action === 'open-appendix') {
    const appendix = state.data.appendices.appendices.find((entry) => entry.id === button.dataset.appendixId);
    state.selectedAppendix = appendix;
    setView('appendices');
    renderRail('appendices');
  }
}

function getVisibleItems() {
  const focusPhase = state.focusPhase;
  const items = focusPhase === 'all'
    ? state.data.allItems
    : state.data.allItems.filter((item) => item.phase === focusPhase);

  if (state.zoomIndex === 0) {
    return items.filter((item) => item.display_priority <= 2);
  }

  if (state.zoomIndex === 1) {
    return items.filter((item) => item.zoom_visibility.includes('phase'));
  }

  if (state.zoomIndex === 2) {
    return items.filter((item) => item.zoom_visibility.includes('evidence'));
  }

  return items;
}

function calculateX(dateIso, zoom) {
  const days = diffDays(state.data.dateStart, new Date(dateIso));
  return 120 + days * zoom.pxPerDay;
}

function scrollToPhase(phaseId) {
  const phase = state.data.phases.find((entry) => entry.phase.id === phaseId);
  if (!phase) return;
  const zoom = ZOOM_LEVELS[state.zoomIndex];
  const left = calculateX(phase.phase.start_date_iso, zoom) - 80;
  dom.timelineScroll.scrollTo({ left: Math.max(0, left), behavior: 'smooth' });
}

function buildMonthTicks(startDate, endDate) {
  const ticks = [];
  const cursor = new Date(startDate);
  cursor.setDate(1);
  while (cursor <= endDate) {
    ticks.push({
      iso: cursor.toISOString().split('T')[0],
      label: cursor.toLocaleDateString('en-GB', { month: 'short', year: '2-digit' })
    });
    cursor.setMonth(cursor.getMonth() + 1);
  }
  return ticks;
}

function diffDays(start, end) {
  const day = 24 * 60 * 60 * 1000;
  return Math.round((new Date(end) - new Date(start)) / day);
}

function addDay(dateIso) {
  const date = new Date(dateIso);
  date.setDate(date.getDate() + 1);
  return date.toISOString().split('T')[0];
}
