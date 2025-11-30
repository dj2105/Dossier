PROJECT_SPEC.md
New
+74
-0

# Dignity at Work – Interactive Case Map

## 1. Project Overview
- **Purpose:** Build a single-page, highly visual web app that maps Daniel's Dignity at Work / grievance process, anchors every element in evidence, and helps investigators quickly understand the story while allowing deep drill-down.
- **High-level experience:** Bold, infographic-like storytelling with interactive timeline, decision/flowchart, and persistent evidence panel.

## 2. Primary Users & Use Cases
### Users
- **Daniel (complainant):** Understand current position, upcoming decisions, and connections between events.
- **External investigators / adjudicators / solicitors:** Get a clear, evidence-backed overview of events, delays, and procedural issues.
- **Potential HR / ER / management:** View systemic failures beyond isolated incidents.

### Core Use Cases
1. **Show me the story from the beginning.** Scroll the timeline from early performance/structure concerns through grievance, interim arrangements, delays, and latest escalation.
2. **Why does this date matter?** Click any event to see people involved, what happened, key quotes with document links.
3. **What are the possible paths from here?** Explore a decision tree of employer and Daniel choices and likely outcomes.
4. **Prove this is systemic, not one bad day.** Filter events by themes (ER non-response, interim failures, compliance, stress/health) to show patterns.

## 3. Source Material & Data Build
- Deep-read the dossier zip (emails, policy, transcripts, investigative report) before building UI.
- Construct an evidence-based master timeline (JSON or similar) before UI work.
- Capture exact quotes, dates, actors, and policy references (e.g., Dignity at Work timelines, interim measures).

## 4. Functional Requirements
### High-Level Structure
- Single-page app with **Interactive Timeline** (past/present) and **Decision/Key-Moment Flowchart** (present/future).
- Persistent right-hand **Evidence Panel** for selected event or decision node.

### Evidence Model
- **Events:** id, date/time, title, summary, actors[], category, impactTags[], quotes[{text, sourceRef, note?}], documents[], stressLevel?, policyRefs[].
- **Actors:** id, name, role, side (optional), location (optional).
- **Documents:** id, title, type (email/PDF/transcript/etc.), fileName, description, optional page anchors.

### Interactive Timeline
- Horizontal/diagonal scrollytelling with macro phases (Pre-grievance, Grievance raised, Initial ER response, Paid leave, Interim arrangement, Current escalation) and micro zoom.
- Event chips with category colour/icon; hover tooltips; click selects and opens evidence panel.
- Filters: categories, people, impacts; "Play Story" auto-steps through events.

### Decision & Key-Moment Flowchart
- Node-link diagram with distinct shapes: states (rounded rectangles), decision nodes (diamonds), outcomes (circles/hexagons).
- Central "Now" node; selectable nodes show evidence-backed context.
- Scenario presets: Best case, Status quo drift, Adversarial, dimming unrelated nodes.

### Evidence Panel
- Shared component: header, participants, narrative, key quotes with sources, contextual notes (policy/legal), linked evidence, thematic tags.

### Modes
- **Investigator (default):** Neutral, evidence-focused.
- **Daniel Mode (later):** Adds personal annotations.
- **Presentation Mode:** Storyboard subset for meetings/exports.

### Export & Sharing
- Print/PDF mode for linear story with event cards and quotes; PNG/SVG export for scenario branches.

## 5. Visual & Interaction Design
- Bold infographic aesthetic on dark background; strong typography.
- Colour encodes category (blue HR/ER, orange Daniel actions, purple policy/legal, teal customer cases); line icons.
- Subtle purposeful animations (200–400ms), scroll-triggered reveals, hover feedback; accessible (contrast, keyboard, ARIA labels).

## 6. Technical Architecture
- Suggested stack: React/Vue/Svelte SPA (Vite/Next SSG); SVG + D3/d3-force/cytoscape for visuals; JSON data checked into repo; no backend required for v1.
- Components: App, Timeline, TimelineEventCard, Flowchart, Node, EvidencePanel, FiltersBar, ModeSwitch.

## 7. Implementation Phases
1. **Data & Truth:** Build verified timeline and nodes from dossier; map policy clauses (e.g., initial meeting timelines, interim measures, non-penalisation).
2. **Timeline MVP:** SPA skeleton with data; interactive timeline with selection/evidence panel and basic filtering.
3. **Flowchart & Refinement:** Evidence-grounded decision graph; scenario presets; export/print modes.

## 8. Expectations
- Anchor every event/node in evidence with explicit references.
- Maintain neutral, forensic tone while presenting bold visuals.
