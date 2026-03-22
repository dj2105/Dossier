# Repo Structure Audit

## What is working
- The repo already expresses a dossier-first intention rather than a timeline-only site.
- The current shell separates overview, timeline, sections, appendices, and document map.
- Phase 1, zoom behaviour, and placeholder modelling for later phases are already present.

## Why the structure still feels confusing
The current implementation mixes three different concerns too closely:

1. **Site architecture**
   - overview shell
   - navigation model
   - workspace state

2. **Timeline engine**
   - zoom levels
   - lane positions
   - phase focus
   - item filtering / visibility

3. **Dossier content routing**
   - report sections
   - appendix families
   - evidence panel rendering
   - document map relationships

At the moment, these concerns are all heavily centralised inside `script.js`, while the JSON files hold content but not a strong enough navigation model. That makes the repo feel harder to reason about than it needs to be.

## Main structural issues identified

### 1. Too much logic in `script.js`
`script.js` is acting as:
- app bootstrap
- state store
- router
- timeline renderer
- evidence panel renderer
- section renderer
- appendix renderer
- document map renderer
- zoom controller

That makes future dossier wiring harder, because every new feature will likely enlarge the same file.

### 2. The data model is split by file type, but not by information role
Current files are useful, but they are arranged more around implementation convenience than editorial structure.

Current pattern:
- `dossier-shell.json`
- `master-timeline.json`
- `phase1.json`
- `phase2-stub.json`
- `phase3-stub.json`
- `dossier-sections.json`
- `appendices.json`

This works, but it leaves the repo without a strong central map answering:
- which timeline items route to which report sections
- which sections route to which appendix families
- which future dossier pages or anchors should open

### 3. The evidence panel is structurally present, but not yet driven by a first-class routing model
The evidence panel currently works more like a rich placeholder renderer than a true dossier route resolver.

### 4. The repo does not yet clearly distinguish between:
- **summary timeline content**
- **dossier navigation metadata**
- **future evidence target definitions**

That distinction will become essential once more real evidence is wired in.

## Recommended refactor direction

## A. Separate the repo into clearer layers

### 1. `data/`
Keep pure dossier content and routing metadata here.

Suggested sub-structure:

```text
/data
  /dossier
    shell.json
    sections.json
    appendices.json
    document-map.json
  /timeline
    master.json
    phase1.json
    phase2.json
    phase3.json
  /routes
    evidence-links.json
    section-links.json
```

### 2. `js/`
Split rendering and behaviour into modules.

Suggested sub-structure:

```text
/js
  app.js
  state.js
  router.js
  timeline.js
  timeline-zoom.js
  evidence-panel.js
  sections-view.js
  appendices-view.js
  document-map-view.js
  data-loader.js
```

### 3. `docs/`
Use this for architecture notes and editorial plans.

Suggested additions:
- `REPO_STRUCTURE_AUDIT.md`
- `INFORMATION_ARCHITECTURE.md`
- `DATA_MODEL_NOTES.md`
- `EVIDENCE_ROUTING_PLAN.md`

## B. Make dossier routing explicit in data
Introduce a first-class routing layer so a timeline item can say, in one place:
- report section target
- appendix family target
- future dossier page target
- future exhibit target
- related document-map cluster

Suggested item-level fields:
- `route.section_id`
- `route.appendix_id`
- `route.document_map_id`
- `route.dossier_anchor`
- `route.exhibit_anchor`

This will make the evidence panel genuinely dossier-led.

## C. Treat timeline data as editorial summaries, not as the whole evidence object
Each timeline item should be understood as a summary card that points into the dossier.
That should be reflected in both naming and rendering.

Suggested conceptual split:
- **timeline item** = chronology summary / navigation object
- **evidence route** = pointer into dossier body / appendix exhibit
- **dossier section** = primary reading destination

## D. Simplify top-level repo navigation for humans
The repo should become easier to understand at a glance.

Recommended top-level structure:

```text
/
  index.html
  styles.css
  /js
  /data
  /docs
  README.md
```

This is clearer than allowing logic, content, and editorial notes to accumulate loosely at root level over time.

## Immediate recommended next changes
1. Split `script.js` into at least:
   - `app.js`
   - `timeline.js`
   - `evidence-panel.js`
   - `views.js`
2. Move dossier shell files into grouped subfolders inside `data/`.
3. Add a route-mapping JSON layer for dossier destinations.
4. Replace placeholder-only evidence panel fields with a more explicit route model.
5. Add an information architecture document explaining how overview, timeline, sections, appendices, and document map relate.

## Priority order

### High priority
- modularise JS
- clarify route mapping
- separate content from rendering logic

### Medium priority
- normalise naming across JSON files
- improve README with repo map and data flow diagram

### Later
- wire real dossier page targets
- wire real exhibit targets
- expand phase 2 and 3 from stubs into full evidential models

## Practical outcome
After this refactor, the repo should read as:
- a dossier site
- with a timeline engine
- and a routing layer into evidence

rather than as one large timeline prototype that also happens to contain dossier views.
