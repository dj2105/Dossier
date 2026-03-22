# Evidence Routing Plan

## Purpose
The timeline should not terminate in repeated card text.
It should route the reader into the correct dossier destination.

This document defines the routing layer needed to make that work.

## Problem the routing layer solves
At present, the timeline can select an item and open an evidence panel, but the panel is still mostly a structured placeholder. The next stage is to make each selected object resolve into:
- the right report section
- the right appendix family
- the right document-map cluster
- the future dossier anchor
- the future exhibit anchor

Without this layer, the timeline remains informative but not deeply navigable.

## Core routing objects

### 1. Timeline item route
Each timeline item should resolve to a route object.

Suggested structure:

```json
{
  "item_id": "phase1_t22",
  "section_id": "sec-1",
  "appendix_id": "appendix-t",
  "document_map_id": "cluster-a",
  "dossier_anchor": "sec-1-t22-analysis",
  "exhibit_anchor": "appendix-t-t22",
  "route_status": "draft"
}
```

### 2. Section route
Each report section should know:
- which timeline clusters feed into it
- which appendix families support it
- which dossier page target will load

### 3. Appendix route
Each appendix family should know:
- which sections use it
- which timeline items most commonly point into it
- which future exhibit viewer target should open

## Recommended new data file
Add a dedicated routing file rather than scattering this logic across multiple JSON files.

Suggested path:

`data/routes/evidence-links.json`

## Recommended structure for `evidence-links.json`

```json
{
  "timeline_routes": [],
  "section_routes": [],
  "appendix_routes": [],
  "document_map_routes": []
}
```

## Timeline route requirements
Each timeline route should include:
- `item_id`
- `section_id`
- `appendix_id`
- `document_map_id`
- `dossier_anchor`
- `exhibit_anchor`
- `route_status`
- `notes`

Possible `route_status` values:
- `draft`
- `placeholder`
- `mapped`
- `verified`

## Section route requirements
Each section route should include:
- `section_id`
- `primary_appendix_ids`
- `timeline_item_ids`
- `document_map_ids`
- `page_target`
- `route_status`

## Appendix route requirements
Each appendix route should include:
- `appendix_id`
- `section_ids`
- `timeline_item_ids`
- `viewer_target`
- `route_status`

## Document map route requirements
Each document-map cluster should include:
- `document_map_id`
- `section_ids`
- `appendix_ids`
- `timeline_item_ids`
- `cluster_summary`

## Initial practical mappings to prioritise
The first real mappings should focus on the strongest Phase 1 items, because those are already better modelled.

Suggested first mapping targets:
- T-01
- T-06
- T-22
- T-29
- GH-01
- GH-04

This would create the first real end-to-end flow:
Timeline item → evidence panel → report section → appendix target

## Evidence panel behaviour after routing is added
Once the routing layer exists, the evidence panel should show:

### For a timeline item
- title
- date and certainty
- evidence code
- linked report section
- linked appendix family
- linked document-map cluster
- future dossier anchor
- future exhibit anchor
- route status

### Buttons
- Open report section
- Open appendix exhibit
- Show document-map cluster

## Naming recommendation
Be consistent about identifiers.

Suggested patterns:
- sections: `sec-1`, `sec-2`, `sec-3`
- appendices: `appendix-t`, `appendix-gh`, `appendix-sc`
- document map clusters: `cluster-a`, `cluster-b`, `cluster-c`
- timeline items: `phase1-t01`, `phase2-gh04`, etc.

## Why this matters structurally
The repo is currently close to being a usable dossier shell, but the routing model is the missing connective tissue.

Once it exists, the site stops feeling like:
- timeline cards
- section cards
- appendix cards
that happen to coexist,

and starts feeling like:
- one evidence system with multiple navigation modes.

## Recommended implementation order
1. Create `evidence-links.json`
2. Map the main Phase 1 items first
3. Update the evidence panel renderer to consume route data
4. Add section-to-timeline and appendix-to-timeline reverse links
5. Expand the same structure through Phase 2 and Phase 3 later

## Immediate next coding task after this document
The most valuable next repo change would be:
- add the new routing JSON file
- wire `script.js` so selected timeline items resolve through that route table
- update the evidence panel to show explicit route status and targets
