# Dossier Architecture Draft

## Dossier-first design philosophy
This prototype deliberately treats the dossier as the primary object and the timeline as a navigation layer into it. The shell opens with dossier context, report routes, appendix families, and document-map framing before the user moves into the master timeline. The result is intended to feel like an online evidential workspace rather than a timeline-first story site.

## File structure
- `index.html` – main dossier shell with overview, timeline, sections, appendices, document map, and evidence panel containers.
- `styles.css` – archival/documentary visual system, multi-panel layout, phase banding, and zoom-dependent timeline card styling.
- `script.js` – data loading, navigation switching, zoom logic, phase focus controls, timeline rendering, and dossier-oriented evidence panel behaviour.
- `data/dossier-shell.json` – dossier title, submission context, route descriptions, and document map placeholders.
- `data/master-timeline.json` – full chronology span and phase summary metadata.
- `data/phase1.json` – refined Phase 1 evidential items preserved from the prototype and adapted into the modular data model.
- `data/phase2-stub.json` / `data/phase3-stub.json` – draft placeholder phase bands used to test full-site navigation and zoom behaviour without inventing unsupported evidential detail.
- `data/dossier-sections.json` – report section routes and placeholder dossier page targets.
- `data/appendices.json` – appendix families and placeholder exhibit viewer routes.

## Zoom architecture
Four zoom levels are implemented:
1. **Macro** – compresses the chronology into a whole-dossier view, showing only the highest-priority markers across multiple phases with short labels.
2. **Phase** – keeps one or more phases legible with readable summary cards and phase band context.
3. **Evidence** – reveals fuller summaries, appendix/report routing, and stronger evidential metadata.
4. **Cluster** – exposes the richest draft card presentation for dense evidential reading and routing checks.

Zooming changes presentation logic rather than simply scaling the same cards. At wider views, the shell hides dense text and uses short labels. At closer views, the shell progressively reveals summaries, bodies, quotes, and dossier linkage metadata.

## Stub phase modelling
Phase 2 and Phase 3 are intentionally marked as draft placeholder bands. Their markers use dossier-aware holder text such as receipt chips, grievance handling markers, response-gap analysis blocks, HR/ER silence placeholders, and escalation routes. The placeholders are present to test chronology continuity, phase focus, evidence routing, and future appendix/report linkage.

## Evidence panel intent
Clicking a timeline item, report section, or appendix family opens a dossier-oriented evidence panel. Instead of repeating the card text, the panel is structured as a gateway into future dossier content with modules for:
- related report section
- appendix reference
- investigator notes / evidence context
- source extract
- future dossier section target
- future appendix exhibit target

## What is implemented vs placeholder
### Implemented now
- dossier-led shell and navigation
- multi-phase timeline with phase bands
- four zoom levels
- preserved/refined Phase 1 content in the new data model
- clickable report section and appendix placeholder views
- dossier-oriented evidence panel
- debug layers and phase focus controls

### Still placeholder
- full evidential import for Phases 2 and 3
- real dossier page rendering for each report section
- exhibit-level appendix viewers
- deeper item-to-item relationship lines and appendix previews
- optional ultra-dense cluster reading for later-phase evidence once the complete corpus is available

## Running locally
Serve the directory over HTTP so the JSON data files can load, for example:

```bash
python3 -m http.server 8000
```

Then open `http://localhost:8000/app/dossier/`.
