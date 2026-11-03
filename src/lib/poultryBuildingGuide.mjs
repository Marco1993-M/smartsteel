// Original Smart Steel project-planning copy. Production-specific limits are
// established by the client's poultry and professional team, not by this page.
export const POULTRY_BUILDING_GUIDE = {
  types: [
    { title: 'Broiler houses', label: 'Meat production', description: 'Plan the building shell around the growing cycle, usable bird area, feeder and drinker lines, brooding zones and the ventilation supplier’s layout.', brief: 'Birds per cycle, target finishing weight, equipment layout and environmental-control approach.' },
    { title: 'Layer houses and laying units', label: 'Egg production', description: 'A barn, aviary or cage-based operation needs its own equipment layout. Coordinate the steel shell with the selected system, egg collection, access and support requirements.', brief: 'Housing system, flock size, nests or equipment dimensions, egg handling and service routes.' },
    { title: 'Pullet and brooding houses', label: 'Young birds', description: 'Agree the rearing stages and any internal divisions before fixing the envelope. Heating, lighting, equipment and environmental needs should be coordinated with the poultry team.', brief: 'Age range, batch sizes, brooding areas and the heating or equipment supplier’s requirements.' },
    { title: 'Free-range chicken housing', label: 'Shelter and outdoor access', description: 'Plan the house together with the outdoor layout, access openings, weather protection and farm-management brief. A steel shelter alone does not establish free-range compliance.', brief: 'Bird type, indoor accommodation, outdoor access, range layout and the applicable production requirements.' },
  ],
  capacity: {
    title: 'What size poultry house do I need?',
    description: 'A request for a 500-, 1,000- or 5,000-bird chicken house is a useful starting point. The same bird count can need different buildings, depending on the production system, bird age, equipment and environmental design.',
    steps: [
      ['Start with the flock', 'Confirm broilers, layers or young birds, target numbers and the production or stocking brief agreed with your poultry adviser.'],
      ['Lay out the usable space', 'Map equipment, service aisles, brooding or internal divisions and bird areas. Gross roof area and usable flock space are different quantities.'],
      ['Select the structural envelope', 'Coordinate the operating layout with an Atlas span and 4m length bays, then review the site, ventilation and engineering requirements.'],
    ],
    examples: [
      { width: 8, length: 20, area: 160, title: 'A smaller structural footprint' },
      { width: 12, length: 40, area: 480, title: 'A longer structural footprint' },
    ],
    note: 'These are footprint examples, not recommended poultry-house sizes or bird capacities. The released structural range does not establish ventilation suitability, stocking density or welfare compliance.',
  },
  costDrivers: [
    ['Size and site', 'Span, bay length, wall height, site loads and any special structural requirements.'],
    ['Roof and walls', 'Steel finish, sheeting profile, enclosure extent and the selected insulation or lining specification.'],
    ['Openings and interfaces', 'Curtain or inlet zones, fan openings, doors and any engineered equipment-support details.'],
    ['Delivery and construction', 'Transport distance, access, installation scope, foundations, floor works and site preparation.'],
  ],
  comparisons: [
    ['Steel building package', 'Agreed frame, connection hardware, roof and wall sheeting. Confirm quantities, finishes and exclusions.'],
    ['Site and installation work', 'Foundations, slabs, drainage, delivery and erection. Establish which party supplies each item.'],
    ['Poultry operating systems', 'Feeding, drinking, heating, ventilation, controls, lighting and production equipment. Obtain the specialist system scope separately.'],
  ],
  wallOptions: [
    ['Open or curtain-sided', 'Agree the clear opening zones, mesh or curtain requirements, weather protection and fixing interfaces. Curtains and mesh are included only if specified.'],
    ['Clad steel shell', 'Define the roof, wall and gable cladding, access doors, inlets and fan openings. Ordinary sheeting alone is not an insulated environmental system.'],
    ['Insulated envelope', 'If the poultry brief requires insulated panels, roof lining or sealed construction, provide that specification for feasibility, structural coordination and pricing. It is not a standard inclusion.'],
  ],
  projects: [
    ['New poultry building', 'Send the site location, proposed bird numbers, production system and any equipment layout. The building and site works can then be scoped together.'],
    ['Extension or replacement', 'Provide existing dimensions, photographs and any available drawings. Review the old structure, connections, environmental system and expansion layout before assuming a new section can be attached.'],
  ],
}
