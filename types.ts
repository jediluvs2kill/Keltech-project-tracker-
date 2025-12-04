export enum ConstructionStage {
  NOT_STARTED = 'Not Started',
  FOUNDATION = 'Foundation',
  STRUCTURE = 'Structure',
  BRICKWORK = 'Brickwork',
  ELECTRICAL_CONDUITS = 'Electrical Conduits',
  PLUMBING_INTERNAL = 'Plumbing (Internal)',
  PLUMBING_EXTERNAL = 'Plumbing (External)',
  FIREFIGHTING_WORK = 'Firefighting Systems',
  PLASTER_INTERNAL = 'Plaster (Internal)',
  PLASTER_EXTERNAL = 'Plaster (External)',
  UPVC_WORK = 'UPVC Windows/Doors',
  RAILING_WORK = 'Railing Work',
  FLOORING_TILES = 'Flooring Tiles',
  BATHROOM_TILES = 'Bathroom Tiles',
  PAINTING_INTERNAL = 'Painting (Internal)',
  PAINTING_EXTERNAL = 'Painting (External)',
  HANDOVER_READY = 'Handover Ready'
}

export interface UpdateLog {
  id: string;
  date: string;
  stage: ConstructionStage;
  note: string;
  imageUrl?: string;
}

export interface QualityCheck {
  id: string;
  name: string;
  status: 'Pending' | 'In Progress' | 'Passed';
  date?: string;
  inspector?: string;
}

export interface Document {
  id: string;
  name: string;
  type: 'PDF' | 'IMG' | 'DOC';
  date: string;
  size: string;
}

export interface Unit {
  id: string; // e.g., "101"
  floorNumber: number;
  unitNumber: string; // "01", "02"
  ownerName?: string; // If sold
  status: 'Available' | 'Sold';
  currentStage: ConstructionStage;
  progressPercentage: number; // 0-100 within the current stage or overall
  expectedDeliveryDate: string; // ISO Date string
  qualityChecks: QualityCheck[];
  documents: Document[];
  updates: UpdateLog[];
}

export interface Floor {
  level: number;
  units: Unit[];
}

export interface BuildingData {
  name: string;
  totalFloors: number;
  floors: Floor[];
}

export interface AIAnalysisResult {
  suggestedStage: ConstructionStage;
  confidence: number;
  summary: string;
  detectedUnitIds: string[];
}