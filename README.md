Phase 1: Compliance Concerns - Evidential Timeline
Refinement Overview
This update focuses heavily on documentary fidelity, removing arbitrary truncation of evidence text and resolving data model ambiguities found in the raw PDF extraction.
Key Improvements in V2:
1. Full Text Visibility: Line-clamping (-webkit-line-clamp) has been completely removed. Operational case cards dynamically size themselves to display the entire evidential body text, fulfilling the requirement for chronological honesty without hiding details behind clicks.
2. Data Model Correction ("Initial Email to HR"): - The original V1 model artificially merged the un-dated textual phrase "Initial email to HR" with the explicit transmission marker "30 Oct / SENT / GH-01".
• V2 strictly separates these in the JSON. The text block is now an approximate_from_layout item that floats visually in late October with a dashed boundary and dashed connector, distinct from the hard-anchored GH-01 chip on Oct 30.
3. Absolute SVG Connectors: The brittle CSS/DOM nested connectors from V1 have been replaced by a scalable, absolute <svg> layer. Connectors dynamically calculate coordinates based on exact bounding box geometry, allowing cards to grow organically without breaking the structural lines connecting them to the axis.
4. Editorial Detail Panel: The interaction panel now functions as an inspection view. It splits into a rigid metadata sidebar (showing explicit date certainty status, evidence codes, and GC regulatory references) alongside a large, readable text pane.
5. Archival Typography & Aesthetic: The interface uses stronger serif headers for the main title and month bands (opacity: 0.4), moving away from a generic SaaS look towards a serious, documentary-style dossier format.
Debug Mode
To inspect the chronological plotting engine, toggle the "Grid Debug" checkbox in the top header. This reveals:
• The px-per-day mathematical plot grid behind the canvas.
• Horizontal layout bounds marking exactly where lane coordinate Y-values are plotted.
