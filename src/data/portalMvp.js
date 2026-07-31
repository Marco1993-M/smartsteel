function checklistItem(label, acceptanceCriteria) {
  return { label, acceptanceCriteria };
}

export const inspectionTemplates = [
  {
    stageKey: "prestart",
    stageLabel: "Project Setup and Pre-Start",
    holdPoint:
      "Before site work begins or before the build team moves into the first physical construction stage.",
    description:
      "Confirm scope, issued information, responsibilities, and key baseline records before the physical build sequence begins.",
    items: [
      checklistItem(
        "Issued drawings and revisions",
        "The latest coordinated drawings and revisions for the current scope are available to the site team.",
      ),
      checklistItem(
        "Scope confirmation",
        "The project scope, exclusions, and handover points between trades or client-supplied work are clearly understood.",
      ),
      checklistItem(
        "Baseline records",
        "Required baseline documents, photos, and site information are stored before physical works begin.",
      ),
      checklistItem(
        "Site readiness",
        "Access, sequencing, and any prerequisite works by others are confirmed before the team mobilises into the next stage.",
      ),
      checklistItem(
        "Safety file baseline",
        "The core safety-file and project-admin records required at start-up are in place for the job.",
      ),
    ],
  },
  {
    stageKey: "foundations",
    stageLabel: "Setting Out and Foundations",
    holdPoint: "Before concrete placement or before foundations are covered.",
    description:
      "Check set-out, levels, reinforcement, cast-ins, sleeves, and engineer instructions before the structure is locked in.",
    items: [
      checklistItem(
        "Building position",
        "Building footprint is set out to the approved drawings and boundary offsets are confirmed on site.",
      ),
      checklistItem(
        "Grid lines and levels",
        "Primary grid lines, benchmarks, and founding levels are established and match the issued setting-out information.",
      ),
      checklistItem(
        "Excavation depth",
        "Excavations reach the specified founding depth, with any soft spots or over-excavation resolved before placement.",
      ),
      checklistItem(
        "Ground preparation",
        "Founding surfaces are clean, stable, and prepared in accordance with the engineer's requirements.",
      ),
      checklistItem(
        "Services sleeves",
        "All required sleeves, conduits, and service penetrations are in position before concrete or backfilling proceeds.",
      ),
      checklistItem(
        "Reinforcement and cover",
        "Reinforcement size, spacing, laps, and concrete cover match the structural details and remain supported during the pour.",
      ),
      checklistItem(
        "Anchor bolts / cast-ins",
        "Anchor bolts, hold-downs, and cast-in items are correctly positioned, aligned, and secured to prevent movement.",
      ),
      checklistItem(
        "Engineer instructions",
        "Any engineer hold points or site instructions have been completed and recorded before release.",
      ),
    ],
  },
  {
    stageKey: "slab",
    stageLabel: "Subfloor / Slab and Floor System",
    holdPoint:
      "Before slab casting, floor sheeting closure, or any finish layer that hides the base build-up.",
    description:
      "Confirm floor-system support, vapour protection, reinforcement or subframe requirements, services, and set-out before the floor build-up is closed.",
    items: [
      checklistItem(
        "Sub-base compaction",
        "The sub-base is compacted, level, and accepted for the floor build-up specified for the project.",
      ),
      checklistItem(
        "Damp-proof / vapour layer",
        "Required membrane layers are intact, lapped correctly, and protected from puncture before covering.",
      ),
      checklistItem(
        "Floor set-out",
        "Slab edges, recesses, steps, and level transitions match the coordinated architectural and structural set-out.",
      ),
      checklistItem(
        "Service penetrations",
        "All floor penetrations, sleeves, and stub-ups are coordinated and fixed before pouring or closing the floor zone.",
      ),
      checklistItem(
        "Mesh and reinforcement",
        "Floor mesh and any supplemental reinforcement are supported, lapped, and positioned to the issued structural details.",
      ),
      checklistItem(
        "Falls and drainage zones",
        "Any required falls, channels, or recessed wet-area zones are formed before the slab is released.",
      ),
      checklistItem(
        "Perimeter isolation / edge details",
        "Perimeter details, edge thickening, and isolation requirements are complete and consistent with the drawings.",
      ),
    ],
  },
  {
    stageKey: "framing",
    stageLabel: "Framing Inspection",
    holdPoint:
      "Before linings, cladding closures, or concealed services prevent full review of the frame.",
    description:
      "Review structural layout, openings, tie-downs, bracing, member condition, and coordination before concealment.",
    items: [
      checklistItem(
        "Structural frame layout",
        "Wall, floor, and roof framing layout matches the latest coordinated architectural and structural drawings.",
      ),
      checklistItem(
        "Wall lines and openings",
        "Walls, openings, lintel positions, and bearing conditions are set out correctly for the approved brief.",
      ),
      checklistItem(
        "Plumb, line, and level",
        "Framing is straight, plumb, level, and within the tolerances required for lining and cladding trades.",
      ),
      checklistItem(
        "Hold-downs and anchors",
        "Anchors, brackets, and hold-down systems are complete, fixed correctly, and ready for engineer review where required.",
      ),
      checklistItem(
        "Framing connections",
        "Connections, fasteners, and screw patterns match the issued details and show no missing or damaged fixings.",
      ),
      checklistItem(
        "Permanent bracing",
        "Permanent bracing, straps, and shear elements are installed in the required locations before release.",
      ),
      checklistItem(
        "Member condition",
        "Framing members are free from unacceptable damage, corrosion, distortion, or site modifications without approval.",
      ),
      checklistItem(
        "Coordination with follow-on trades",
        "Blocking, support framing, and backing required for services, joinery, and cladding are in place before closure.",
      ),
    ],
  },
  {
    stageKey: "roof",
    stageLabel: "Roof Structure and Weather-Tight Shell",
    holdPoint:
      "Before ceilings, roof closures, or external layers make the roof framing and weatherproofing details inaccessible.",
    description:
      "Verify roof framing, tie-downs, sarking, flashings, drainage paths, and coordination before the roof build-up is closed.",
    items: [
      checklistItem(
        "Roof framing layout",
        "Trusses, rafters, purlins, and support members match the issued roof framing drawings and spans.",
      ),
      checklistItem(
        "Tie-down and uplift details",
        "Tie-downs, straps, and uplift restraint measures are complete and installed to the specified details.",
      ),
      checklistItem(
        "Roof sheeting support",
        "Batten or purlin spacing, straightness, and support conditions are ready for the selected roof covering.",
      ),
      checklistItem(
        "Sarking / underlay",
        "Sarking or roof underlay is continuous, lapped correctly, and installed without tears or open junctions.",
      ),
      checklistItem(
        "Flashings and penetrations",
        "Critical flashings, upstands, and roof penetrations are coordinated and ready to prevent water ingress.",
      ),
      checklistItem(
        "Falls and drainage",
        "Roof falls, outlets, and drainage paths are unobstructed and consistent with the approved roof-water strategy.",
      ),
      checklistItem(
        "Eaves and closure details",
        "Edge closures, eaves details, and ventilation provisions are complete for the selected envelope build-up.",
      ),
    ],
  },
  {
    stageKey: "predrywall",
    stageLabel: "Services Rough-In / Pre-Drywall",
    holdPoint:
      "Before drywall, ceilings, internal boards, or cladding close service zones.",
    description:
      "Verify plumbing, electrical, ventilation, penetrations, fire-stopping, and trade coordination before closure.",
    items: [
      checklistItem(
        "Plumbing rough-in",
        "Pipework routes, support, gradients, and outlet positions match the coordinated services layout.",
      ),
      checklistItem(
        "Electrical rough-in",
        "Conduits, cable routes, boxes, and switch positions align with the latest coordinated electrical information.",
      ),
      checklistItem(
        "Mechanical / ventilation routes",
        "Ventilation ducts, extract routes, and mechanical allowances are in place where required for the brief.",
      ),
      checklistItem(
        "Service penetrations",
        "Penetrations through structure or linings are coordinated, protected, and sealed as required at this stage.",
      ),
      checklistItem(
        "Pipe pressure testing",
        "Required pressure tests or preliminary commissioning checks have been completed and recorded before closure.",
      ),
      checklistItem(
        "Fire stopping / blocking",
        "Fire stopping, cavity barriers, and blocking elements required at this stage are installed in the relevant zones.",
      ),
      checklistItem(
        "Backing and support for fixtures",
        "Supports and backing for joinery, sanitaryware, fittings, and equipment are installed before closure.",
      ),
      checklistItem(
        "Trade clash check",
        "No unresolved trade clashes remain in the inspected area before boards or cladding are installed.",
      ),
    ],
  },
  {
    stageKey: "insulation",
    stageLabel: "Insulation and Lining Readiness",
    holdPoint:
      "Before internal linings or ceiling systems fully conceal insulation, cavity barriers, and service zones.",
    description:
      "Confirm insulation coverage, cavity detailing, moisture management, and lining readiness before the internal skin is closed.",
    items: [
      checklistItem(
        "Insulation type and thickness",
        "Installed insulation matches the specified type, thickness, and location for the wall or roof build-up.",
      ),
      checklistItem(
        "Continuous coverage",
        "Insulation is continuous and neatly fitted without major gaps, compression, or unsupported sagging.",
      ),
      checklistItem(
        "Moisture control layers",
        "Required vapour control, breathable membranes, or separation layers are correctly positioned for the build-up.",
      ),
      checklistItem(
        "Cavity barriers and closures",
        "Cavity closures and barrier details required for fire, vermin, or weather control are complete before lining.",
      ),
      checklistItem(
        "Service protection",
        "Installed services remain protected and accessible as intended, without compromising the insulation layer.",
      ),
      checklistItem(
        "Board support and backing",
        "Support framing and backing for boards, trims, fixtures, and edge details are complete ahead of lining installation.",
      ),
      checklistItem(
        "Area ready for closure",
        "The inspected area is clean, coordinated, and ready to proceed with lining or ceiling installation.",
      ),
    ],
  },
  {
    stageKey: "waterproofing",
    stageLabel: "Waterproofing and Wet Areas",
    holdPoint: "Before tiles or final finishes conceal the waterproofing system.",
    description:
      "Check substrate readiness, falls, waterproofing extents, curing windows, and critical wet-area interfaces.",
    items: [
      checklistItem(
        "Substrate preparation",
        "Substrates are sound, clean, dry enough, and prepared in accordance with the waterproofing system requirements.",
      ),
      checklistItem(
        "Falls to outlets",
        "Falls direct water positively to outlets without ponding zones or reverse falls in the inspected area.",
      ),
      checklistItem(
        "Corners and penetrations",
        "Corners, joints, outlets, and penetrations have the correct reinforcing treatment before the main membrane build-up.",
      ),
      checklistItem(
        "Waterproofing extent",
        "The membrane extent, upstands, and turn-ups match the specified wet-area detail for that room or exterior zone.",
      ),
      checklistItem(
        "Drain and threshold details",
        "Drains, thresholds, door tracks, and edge transitions are detailed to protect the waterproofing continuity.",
      ),
      checklistItem(
        "Flood / water test",
        "Any required water or flood test has been completed successfully before finishes proceed.",
      ),
      checklistItem(
        "Membrane condition",
        "The installed membrane is continuous and free from damage, blistering, contamination, or missed areas.",
      ),
    ],
  },
  {
    stageKey: "practicalcompletion",
    stageLabel: "Practical Completion",
    holdPoint:
      "Before final close-out and client handover while defects, missing information, or incomplete commissioning remain unresolved.",
    description:
      "Confirm the project is functionally complete, safe to occupy, and ready for close-out with only agreed minor items remaining.",
    items: [
      checklistItem(
        "Completion of contracted works",
        "The inspected scope is substantially complete and usable for its intended purpose, with only minor items outstanding.",
      ),
      checklistItem(
        "Defects / snag list",
        "Remaining defects are identified clearly, minor in nature, and recorded for close-out within an agreed timeframe.",
      ),
      checklistItem(
        "Testing and commissioning",
        "Required testing, commissioning, and functional demonstrations for installed systems are complete and recorded.",
      ),
      checklistItem(
        "Joinery, finishes, and fittings",
        "Visible finishes, joinery, and fittings are complete to the expected standard and free from avoidable damage.",
      ),
      checklistItem(
        "Health and safety close-out",
        "Temporary works, hazards, and residual safety issues have been resolved or formally communicated at close-out.",
      ),
      checklistItem(
        "Cleaning and presentation",
        "The area is clean, presentable, and suitable for a practical completion review with the client team.",
      ),
      checklistItem(
        "Outstanding information register",
        "Any remaining documents, certificates, or manuals still outstanding are listed and assigned for final close-out.",
      ),
    ],
  },
  {
    stageKey: "handover",
    stageLabel: "Final Completion and Handover",
    holdPoint: "At final close-out once all remaining defects are complete.",
    description:
      "Confirm defects are closed, documents are issued, client orientation is complete, and the project is ready for handover.",
    items: [
      checklistItem(
        "Snag / defect items",
        "All agreed defects and snag items are closed out or formally documented as accepted by the client.",
      ),
      checklistItem(
        "Final cleaning",
        "The building and immediate site are cleaned and presented for occupation or operational use.",
      ),
      checklistItem(
        "Keys and access items",
        "Keys, remotes, codes, and access-control items are issued, labelled, and acknowledged at handover.",
      ),
      checklistItem(
        "Compliance certificates",
        "Required compliance certificates, engineer sign-offs, and statutory records are complete and issued to the client file.",
      ),
      checklistItem(
        "Warranties and manuals",
        "Warranties, product data, and operating manuals are compiled and handed over in a usable format.",
      ),
      checklistItem(
        "Client orientation",
        "The client or operator has been walked through the building systems, maintenance needs, and key operating items.",
      ),
      checklistItem(
        "Final acceptance",
        "Final handover acceptance is recorded with the appropriate sign-off and any agreed residual notes.",
      ),
    ],
  },
];

export const projects = [
  {
    id: "coffee-spa-pretoria-east",
    name: "Coffee & Spa",
    projectNumber: "PK-026",
    address: "Pretoria East, Gauteng",
    clientName: "Verde Hospitality",
    projectType: "Double-storey commercial structure",
    status: "Construction",
    siteManager: "Marco Gerritsen",
    createdAt: "2026-04-18",
  },
  {
    id: "staff-compound-hoedspruit",
    name: "Staff Compound",
    projectNumber: "PK-031",
    address: "Hoedspruit, Limpopo",
    clientName: "Lowveld Estates",
    projectType: "Residential staff accommodation",
    status: "Finishing",
    siteManager: "Johan Mokoena",
    createdAt: "2026-03-02",
  },
  {
    id: "highland-retreat-dullstroom",
    name: "Highland Retreat",
    projectNumber: "PK-034",
    address: "Dullstroom, Mpumalanga",
    clientName: "Private Client",
    projectType: "Weekend retreat",
    status: "Pre-construction",
    siteManager: "Lerato Ndlovu",
    createdAt: "2026-05-09",
  },
  {
    id: "somerset-structure-package",
    name: "Somerset Structure Package",
    projectNumber: "PK-038",
    address: "Somerset West, Western Cape",
    clientName: "Private Client",
    projectType: "Subfloor system and LSF structure package",
    status: "Pre-construction",
    siteManager: "Marco Gerritsen",
    createdAt: "2026-06-10",
    stageOverrides: {
      foundations: "not_applicable",
      predrywall: "not_applicable",
      insulation: "not_applicable",
      waterproofing: "not_applicable",
    },
  },
];

export const inspections = [
  {
    id: "insp-031-framing-001",
    projectId: "staff-compound-hoedspruit",
    stageKey: "framing",
    inspectionRequestNo: "ITR-031-014",
    inspectionDate: "2026-06-06",
    area: "Block A and B",
    drawingRevision: "S3 / Rev C",
    weather: "Dry, warm",
    inspectorName: "Marco Gerritsen",
    overallOutcome: "Framing substantially complete with a few corrective items.",
    releaseDecision: "Accepted with minor corrections",
    summaryNotes:
      "The frame is aligned well overall. A handful of tie-down and opening coordination items need close-out before service closure proceeds in two rooms.",
    items: [
      {
        label: "Structural frame layout",
        acceptanceCriteria:
          "Matches structural and architectural drawings.",
        status: "Pass",
        comments: "Layout consistent with issued drawings.",
      },
      {
        label: "Wall lines and openings",
        acceptanceCriteria: "Correctly set out and coordinated.",
        status: "Corrections",
        comments: "Two door openings need minor adjustment before lining.",
      },
      {
        label: "Hold-downs and anchors",
        acceptanceCriteria: "Complete and properly fixed.",
        status: "Corrections",
        comments: "Three anchors still to be tagged and tightened.",
      },
      {
        label: "Permanent bracing",
        acceptanceCriteria: "Complete before release.",
        status: "Pass",
        comments: "Permanent bracing in place throughout inspected zones.",
      },
      {
        label: "Engineer inspection",
        acceptanceCriteria: "Completed where required.",
        status: "N/A",
        comments: "Not required on this intermediate internal review.",
      },
    ],
    correctiveActions: [
      {
        id: "ca-1",
        title: "Adjust two door openings in Block A",
        owner: "Frame install team",
        dueDate: "2026-06-09",
        status: "Open",
      },
      {
        id: "ca-2",
        title: "Tag and tighten remaining anchors",
        owner: "Site foreman",
        dueDate: "2026-06-09",
        status: "Open",
      },
    ],
    photos: [
      { id: "photo-1", caption: "North corridor framing alignment" },
      { id: "photo-2", caption: "Typical opening detail at Block B" },
    ],
  },
  {
    id: "insp-026-predrywall-001",
    projectId: "coffee-spa-pretoria-east",
    stageKey: "predrywall",
    inspectionRequestNo: "ITR-026-021",
    inspectionDate: "2026-06-04",
    area: "Ground floor service walls",
    drawingRevision: "A6 / Rev B",
    weather: "Mild",
    inspectorName: "Lerato Ndlovu",
    overallOutcome: "Ready for closure once one electrical route is corrected.",
    releaseDecision: "Partial release",
    summaryNotes:
      "Most rough-in work is coordinated well. One cable route at the reception wall needs to move before closure in that zone.",
    items: [
      {
        label: "Plumbing rough-in",
        acceptanceCriteria: "Installed to coordinated layout.",
        status: "Pass",
        comments: "All visible runs acceptable.",
      },
      {
        label: "Electrical rough-in",
        acceptanceCriteria: "Installed to coordinated layout.",
        status: "Corrections",
        comments: "Reception wall route clashes with joinery backing.",
      },
      {
        label: "Service penetrations",
        acceptanceCriteria: "Protected and coordinated.",
        status: "Pass",
        comments: "Penetration protection in place.",
      },
      {
        label: "Trade clash check",
        acceptanceCriteria: "No unresolved clashes before lining.",
        status: "Corrections",
        comments: "One local clash remains in the reception zone.",
      },
    ],
    correctiveActions: [
      {
        id: "ca-3",
        title: "Reroute reception wall cable before closure",
        owner: "Electrical subcontractor",
        dueDate: "2026-06-08",
        status: "Open",
      },
    ],
    photos: [{ id: "photo-3", caption: "Reception wall cable route" }],
  },
];

export const projectFiles = [
  {
    id: "file-1",
    projectId: "staff-compound-hoedspruit",
    category: "Safety file",
    fileName: "Safety_File_Revision_C.pdf",
    uploadedBy: "Marco Gerritsen",
    uploadedAt: "2026-06-01",
  },
  {
    id: "file-2",
    projectId: "staff-compound-hoedspruit",
    category: "Drawings",
    fileName: "Structural_Rev_C.pdf",
    uploadedBy: "Johan Mokoena",
    uploadedAt: "2026-05-28",
  },
  {
    id: "file-3",
    projectId: "coffee-spa-pretoria-east",
    category: "Certificates",
    fileName: "Electrical_Test_Certificate.pdf",
    uploadedBy: "Lerato Ndlovu",
    uploadedAt: "2026-06-05",
  },
];

export function getProjectById(projectId) {
  return projects.find((project) => project.id === projectId) || null;
}

export function getInspectionsByProjectId(projectId) {
  return inspections.filter((inspection) => inspection.projectId === projectId);
}

export function getInspectionById(inspectionId) {
  return inspections.find((inspection) => inspection.id === inspectionId) || null;
}

export function getTemplateByStage(stageKey) {
  return (
    inspectionTemplates.find((template) => template.stageKey === stageKey) || null
  );
}

export function getFilesByProjectId(projectId) {
  return projectFiles.filter((file) => file.projectId === projectId);
}

export function getPortalStats() {
  const openCorrectiveActions = inspections.reduce(
    (count, inspection) =>
      count +
      inspection.correctiveActions.filter((item) => item.status !== "Closed").length,
    0,
  );

  return {
    projects: projects.length,
    activeProjects: projects.filter((project) => project.status !== "Completed")
      .length,
    inspections: inspections.length,
    openCorrectiveActions,
  };
}
