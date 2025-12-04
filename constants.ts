import { BuildingData, ConstructionStage, Floor, Unit, QualityCheck, Document } from './types';

export const STAGES_ORDER = [
  ConstructionStage.NOT_STARTED,
  ConstructionStage.FOUNDATION,
  ConstructionStage.STRUCTURE,
  ConstructionStage.BRICKWORK,
  ConstructionStage.ELECTRICAL_CONDUITS,
  ConstructionStage.PLUMBING_INTERNAL,
  ConstructionStage.FIREFIGHTING_WORK,
  ConstructionStage.PLASTER_INTERNAL,
  ConstructionStage.UPVC_WORK,
  ConstructionStage.PLASTER_EXTERNAL,
  ConstructionStage.PLUMBING_EXTERNAL,
  ConstructionStage.RAILING_WORK,
  ConstructionStage.BATHROOM_TILES,
  ConstructionStage.FLOORING_TILES,
  ConstructionStage.PAINTING_INTERNAL,
  ConstructionStage.PAINTING_EXTERNAL,
  ConstructionStage.HANDOVER_READY,
];

export const getStageIndex = (stage: ConstructionStage) => STAGES_ORDER.indexOf(stage);
export const getStageProgress = (stage: ConstructionStage) => {
  const index = getStageIndex(stage);
  return Math.round(((index) / (STAGES_ORDER.length - 1)) * 100);
};

export const generateBuilding = (
    name: string = "Keltech Towers",
    totalFloors: number = 12,
    unitsPerFloor: number = 4,
    unitPrefix: string = "" // e.g. "A-" or "T1-"
): BuildingData => {
  const floors: Floor[] = [];

  const qualityTemplates: Omit<QualityCheck, 'id'>[] = [
    { name: 'Structural Integrity Test', status: 'Passed', date: '2023-11-15', inspector: 'Eng. Sarah Connor' },
    { name: 'Waterproofing Inspection', status: 'Passed', date: '2023-12-10', inspector: 'SafeGuard Labs' },
    { name: 'Electrical Wiring Safety', status: 'Pending' },
    { name: 'Plumbing Pressure Test', status: 'Pending' },
    { name: 'Fire Safety Compliance', status: 'Pending' },
  ];

  const docTemplates: Omit<Document, 'id'>[] = [
    { name: 'Sale Agreement', type: 'PDF', size: '2.4 MB', date: '2023-09-01' },
    { name: 'Floor Plan Blueprint', type: 'IMG', size: '4.1 MB', date: '2023-08-15' },
    { name: 'Payment Schedule', type: 'PDF', size: '1.2 MB', date: '2023-09-05' },
  ];

  for (let i = 1; i <= totalFloors; i++) {
    const units: Unit[] = [];
    for (let j = 1; j <= unitsPerFloor; j++) {
      // Pad unit number with leading zero if needed
      const unitNumStr = j < 10 ? `0${j}` : `${j}`;
      // Construct ID: Prefix + Floor + UnitNum. e.g. "T1-101" or just "101"
      const unitId = `${unitPrefix}${i}${unitNumStr}`;
      
      // Simulate staggered progress: Lower floors are more advanced
      let stage = ConstructionStage.NOT_STARTED;
      
      // Mock distribution of new granular stages
      if (i <= Math.floor(totalFloors * 0.15)) stage = ConstructionStage.PAINTING_INTERNAL;
      else if (i <= Math.floor(totalFloors * 0.3)) stage = ConstructionStage.FLOORING_TILES;
      else if (i <= Math.floor(totalFloors * 0.45)) stage = ConstructionStage.PLASTER_INTERNAL;
      else if (i <= Math.floor(totalFloors * 0.6)) stage = ConstructionStage.ELECTRICAL_CONDUITS;
      else if (i <= Math.floor(totalFloors * 0.8)) stage = ConstructionStage.STRUCTURE;
      else stage = ConstructionStage.FOUNDATION;

      // Calculate a mock delivery date based on floor (higher floors take longer)
      const today = new Date();
      const deliveryDate = new Date(today);
      deliveryDate.setMonth(today.getMonth() + (i * 1.5) + 6); // Base 6 months + 1.5 months per floor

      // Generate random quality checks based on stage
      const unitChecks = qualityTemplates.map((template, idx) => ({
        ...template,
        id: `qc-${unitId}-${idx}`,
        status: idx < (getStageIndex(stage) / 3) ? 'Passed' : (idx === Math.ceil(getStageIndex(stage) / 3) ? 'In Progress' : 'Pending')
      })) as QualityCheck[];

      units.push({
        id: unitId,
        floorNumber: i,
        unitNumber: unitNumStr,
        status: Math.random() > 0.3 ? 'Sold' : 'Available',
        ownerName: Math.random() > 0.3 ? `Buyer ${unitId}` : undefined,
        currentStage: stage,
        progressPercentage: getStageProgress(stage),
        expectedDeliveryDate: deliveryDate.toISOString(),
        qualityChecks: unitChecks,
        documents: docTemplates.map((d, idx) => ({ ...d, id: `doc-${unitId}-${idx}` })),
        updates: [
          {
            id: `init-${unitId}`,
            date: new Date(Date.now() - 100000000).toISOString(),
            stage: ConstructionStage.FOUNDATION,
            note: 'Foundation work completed successfully.',
          }
        ]
      });
    }
    floors.push({ level: i, units });
  }

  // Reverse so top floor is first in array (visually easier to stack)
  return {
    name: name,
    totalFloors,
    floors: floors.reverse() 
  };
};

export const INITIAL_BUILDING_DATA = generateBuilding();

export const STAGE_COLORS: Record<ConstructionStage, string> = {
  [ConstructionStage.NOT_STARTED]: 'bg-gray-200 text-gray-500',
  [ConstructionStage.FOUNDATION]: 'bg-stone-400 text-stone-900',
  [ConstructionStage.STRUCTURE]: 'bg-slate-400 text-slate-900',
  [ConstructionStage.BRICKWORK]: 'bg-orange-300 text-orange-900',
  [ConstructionStage.ELECTRICAL_CONDUITS]: 'bg-yellow-200 text-yellow-900',
  [ConstructionStage.PLUMBING_INTERNAL]: 'bg-blue-200 text-blue-900',
  [ConstructionStage.PLUMBING_EXTERNAL]: 'bg-blue-300 text-blue-900',
  [ConstructionStage.FIREFIGHTING_WORK]: 'bg-red-200 text-red-900',
  [ConstructionStage.PLASTER_INTERNAL]: 'bg-amber-100 text-amber-900',
  [ConstructionStage.PLASTER_EXTERNAL]: 'bg-amber-200 text-amber-900',
  [ConstructionStage.UPVC_WORK]: 'bg-sky-200 text-sky-900',
  [ConstructionStage.RAILING_WORK]: 'bg-zinc-300 text-zinc-900',
  [ConstructionStage.FLOORING_TILES]: 'bg-teal-200 text-teal-900',
  [ConstructionStage.BATHROOM_TILES]: 'bg-cyan-200 text-cyan-900',
  [ConstructionStage.PAINTING_INTERNAL]: 'bg-purple-200 text-purple-900',
  [ConstructionStage.PAINTING_EXTERNAL]: 'bg-purple-300 text-purple-900',
  [ConstructionStage.HANDOVER_READY]: 'bg-green-500 text-white',
};

export const STAGE_COLORS_HEX: Record<ConstructionStage, string> = {
  [ConstructionStage.NOT_STARTED]: '#e5e7eb',
  [ConstructionStage.FOUNDATION]: '#a8a29e',
  [ConstructionStage.STRUCTURE]: '#94a3b8',
  [ConstructionStage.BRICKWORK]: '#fdba74',
  [ConstructionStage.ELECTRICAL_CONDUITS]: '#fef08a',
  [ConstructionStage.PLUMBING_INTERNAL]: '#bfdbfe',
  [ConstructionStage.PLUMBING_EXTERNAL]: '#93c5fd',
  [ConstructionStage.FIREFIGHTING_WORK]: '#fecaca',
  [ConstructionStage.PLASTER_INTERNAL]: '#fef3c7',
  [ConstructionStage.PLASTER_EXTERNAL]: '#fde68a',
  [ConstructionStage.UPVC_WORK]: '#bae6fd',
  [ConstructionStage.RAILING_WORK]: '#d4d4d8',
  [ConstructionStage.FLOORING_TILES]: '#99f6e4',
  [ConstructionStage.BATHROOM_TILES]: '#a5f3fc',
  [ConstructionStage.PAINTING_INTERNAL]: '#e9d5ff',
  [ConstructionStage.PAINTING_EXTERNAL]: '#d8b4fe',
  [ConstructionStage.HANDOVER_READY]: '#22c55e',
};