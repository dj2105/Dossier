# Information Architecture

## Core principle
The online dossier should be navigated as an evidential workspace.

The user should always understand that:
- the **dossier body** is the main reading route
- the **appendices** are the supporting evidence repositories
- the **timeline** is a chronology and navigation layer into those materials
- the **document map** explains cross-links between report sections, chronology clusters, and appendix families

In other words:

**Dossier → sections / appendices → timeline support layer**

not

**Timeline → everything else**

## Primary user journeys

### 1. Investigator / reader arriving cold
This user needs to understand what the dossier is, how it is organised, and where to read first.

Recommended route:
1. Overview
2. Report Sections
3. Timeline for chronology checks
4. Appendices for evidence verification
5. Document Map for cross-reference

### 2. Reader already reviewing a timeline event
This user needs to move from a chronology marker into the right part of the dossier.

Recommended route:
1. Master Timeline
2. Select timeline item
3. Evidence panel shows:
   - report section target
   - appendix family target
   - future dossier anchor / exhibit anchor
4. Open full dossier section or appendix exhibit

### 3. Reader reviewing a report section
This user needs to inspect how the section sits in chronology and what appendices support it.

Recommended route:
1. Report Sections
2. Open selected section
3. Evidence panel or side panel shows:
   - linked timeline cluster(s)
   - linked appendix family
   - linked document-map anchor

## Recommended top-level navigation
The top-level navigation is already broadly correct and should be retained in this order:

1. **Overview**
2. **Report Sections**
3. **Appendices**
4. **Master Timeline**
5. **Document Map**

### Why this order is clearer
The current navigation makes the timeline very prominent. Structurally, however, the timeline should sit after the report and appendix routes, because it is a support layer rather than the primary evidential destination.

Recommended emphasis hierarchy:
- Overview = orientation
- Report Sections = main narrative spine
- Appendices = evidence store
- Master Timeline = chronology navigator
- Document Map = cross-reference layer

## Page / workspace roles

### Overview
Purpose:
- introduce the dossier
- explain status and scope
- show how the site is organised
- direct the user to the best reading route

Should contain:
- dossier summary
- reading-path guidance
- phase summary cards
- section/appx counts
- short explanation of timeline purpose

Should not feel like:
- a splash page
- a decorative landing page
- a compressed restatement of the whole dossier

### Report Sections
Purpose:
- act as the primary reading route
- reflect the report’s actual structure
- allow future dossier page loading

Should contain:
- section cards or list
- section summaries
- linked appendix families
- linked timeline clusters
- future page targets

This should become the central editorial spine of the site.

### Appendices
Purpose:
- expose evidence families clearly
- route users toward exhibit-level material

Should contain:
- appendix families
- scope summaries
- likely exhibit targets
- relation to report sections
- relation to timeline markers

### Master Timeline
Purpose:
- support chronology checking
- show escalation and clustering
- route into sections and appendices

Should contain:
- phase bands
- zoom controls
- timeline markers
- route metadata in the evidence panel

Should not become the main reading surface for all details.

### Document Map
Purpose:
- show the relationship between chronology, report sections, and appendices
- provide an explicit cross-reference layer

Should contain:
- clusters
- section targets
- appendix targets
- future dossier anchors

## Recommended evidence panel role
The evidence panel should act as a **route resolver**.

For any selected object, it should answer:
- what is this?
- where does it belong in the dossier?
- which section should be opened?
- which appendix family supports it?
- which exact exhibit or dossier anchor will eventually load?

### For timeline items
Show:
- date
- certainty
- evidence code
- summary wording
- related report section
- related appendix family
- future exhibit anchor
- future dossier anchor

### For sections
Show:
- section purpose
- appendix families used
- main chronology clusters
- future page target

### For appendices
Show:
- scope
- related sections
- related timeline markers
- future viewer target

## Recommended navigation refinements

### 1. Reorder top navigation
Preferred order:
- Overview
- Report Sections
- Appendices
- Master Timeline
- Document Map

### 2. Rename some labels for clarity
Suggested labels:
- `Report Sections` instead of just `Sections`
- `Appendix Families` or `Appendices`
- `Master Timeline` retained
- `Document Map` retained

### 3. Add explicit reading path text on overview
Suggested wording concept:
- Read the report sections for the main narrative
- Use appendices to inspect supporting evidence
- Use the timeline to trace chronology and escalation
- Use the document map to cross-reference clusters and targets

### 4. Give timeline a secondary but powerful role
The timeline should feel important, but not primary.
That means:
- high utility
- strong zoom/navigation
- clear evidence routing
- less dominance in default landing flow

## Proposed future route model
Every object should be able to point cleanly to related destinations.

### Timeline item
Should link to:
- report section id
- appendix id
- document map id
- dossier anchor id
- exhibit anchor id

### Section
Should link to:
- appendix ids
- timeline cluster ids
- document map ids

### Appendix family
Should link to:
- section ids
- timeline item ids
- exhibit viewer target ids

## Practical UI consequence
A clearer site will feel like:
- an organised dossier workspace first
- a chronology tool second
- a routed evidence system third

rather than a timeline prototype with several extra panels attached.
