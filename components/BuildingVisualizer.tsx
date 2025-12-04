import React from 'react';
import { BuildingData, Floor, Unit, ConstructionStage } from '../types';
import { STAGE_COLORS, getStageIndex } from '../constants';
import { Home, User, Layers, Check, Clock } from 'lucide-react';

interface BuildingVisualizerProps {
  data: BuildingData;
  onSelectUnit: (unit: Unit) => void;
  selectedUnitId?: string;
}

const UnitBlock: React.FC<{ unit: Unit; onClick: () => void; isSelected: boolean }> = ({ unit, onClick, isSelected }) => {
  const baseColor = STAGE_COLORS[unit.currentStage];
  
  return (
    <div 
      onClick={onClick}
      className={`
        relative group cursor-pointer transition-all duration-300 ease-in-out
        w-full h-16 md:h-20 lg:h-24 rounded-md border-2 
        flex flex-col items-center justify-center shadow-sm hover:shadow-lg hover:-translate-y-1
        ${isSelected ? 'border-blue-600 ring-2 ring-blue-300 z-10 scale-105' : 'border-white/50 border-opacity-20'}
        ${baseColor}
      `}
    >
      <div className="text-xs md:text-sm font-bold opacity-90">Unit {unit.id}</div>
      <div className="hidden md:block text-[10px] uppercase tracking-wide opacity-75 mt-1 text-center px-1 truncate w-full">
        {unit.currentStage}
      </div>
      
      {/* Status Icon Indicator */}
      <div className="absolute top-1 right-1 opacity-50">
        {unit.status === 'Sold' ? <User size={12} /> : <Home size={12} />}
      </div>

      {/* Hover Tooltip */}
      <div className="absolute opacity-0 group-hover:opacity-100 transition-opacity bottom-full mb-2 w-max max-w-[150px] bg-gray-900 text-white text-xs p-2 rounded pointer-events-none z-20 shadow-xl">
        <p className="font-semibold">Unit {unit.id}</p>
        <p>Status: {unit.status}</p>
        <p>Stage: {unit.currentStage}</p>
      </div>
    </div>
  );
};

const FloorRow: React.FC<{ floor: Floor; onSelectUnit: (u: Unit) => void; selectedUnitId?: string }> = ({ floor, onSelectUnit, selectedUnitId }) => {
  // Determine if the floor is casted: 
  // We assume a floor is "Casted" if all units are at least at the STRUCTURE stage.
  // Using getStageIndex to compare order.
  const structureIndex = getStageIndex(ConstructionStage.STRUCTURE);
  const isCasted = floor.units.every(u => getStageIndex(u.currentStage) >= structureIndex);

  return (
    <div className="flex items-center gap-2 md:gap-4 my-2 group/floor">
      <div className="w-16 md:w-20 flex-shrink-0 text-right pr-3 border-r-2 border-dashed border-gray-200 flex flex-col items-end justify-center py-2">
        <span className="text-sm font-mono text-gray-700 font-bold">FL {floor.level}</span>
        
        {/* Casting Status Indicator */}
        {isCasted ? (
            <div className="flex items-center gap-1 text-[10px] text-emerald-600 font-bold bg-emerald-50 px-1.5 py-0.5 rounded-full mt-1 border border-emerald-100">
                <Layers size={10} /> Casted
            </div>
        ) : (
            <div className="flex items-center gap-1 text-[10px] text-amber-500 font-medium bg-amber-50 px-1.5 py-0.5 rounded-full mt-1 border border-amber-100">
                <Clock size={10} /> Pending
            </div>
        )}
      </div>
      
      <div className="flex-1 grid grid-cols-4 gap-2 md:gap-4 p-1 rounded-lg transition-colors group-hover/floor:bg-gray-50/50">
        {floor.units.map(unit => (
          <UnitBlock 
            key={unit.id} 
            unit={unit} 
            onClick={() => onSelectUnit(unit)}
            isSelected={selectedUnitId === unit.id}
          />
        ))}
      </div>
    </div>
  );
};

export const BuildingVisualizer: React.FC<BuildingVisualizerProps> = ({ data, onSelectUnit, selectedUnitId }) => {
  // Calculate stats
  const structureIndex = getStageIndex(ConstructionStage.STRUCTURE);
  const castedFloorsCount = data.floors.filter(f => 
    f.units.every(u => getStageIndex(u.currentStage) >= structureIndex)
  ).length;

  const castingPercentage = Math.round((castedFloorsCount / data.totalFloors) * 100);

  return (
    <div className="bg-white/50 backdrop-blur-sm p-4 rounded-xl border border-gray-100 shadow-inner overflow-hidden h-full flex flex-col">
      {/* Visualizer Header / Stats */}
      <div className="flex items-center justify-between mb-6 px-2">
          <div className="flex items-center gap-2">
            <h3 className="text-sm font-bold text-gray-800 uppercase tracking-wider">{data.name}</h3>
            <span className="text-xs text-gray-400">|</span>
            <span className="text-xs text-gray-500 font-medium">Live View</span>
          </div>

          <div className="flex items-center gap-2 bg-white px-3 py-1.5 rounded-full shadow-sm border border-gray-100">
              <div className="relative w-4 h-4">
                 <svg className="w-full h-full -rotate-90" viewBox="0 0 36 36">
                    <path className="text-gray-200" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="currentColor" strokeWidth="4" />
                    <path className="text-emerald-500 transition-all duration-1000" strokeDasharray={`${castingPercentage}, 100`} d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="currentColor" strokeWidth="4" />
                 </svg>
              </div>
              <div className="text-xs font-semibold text-gray-700">
                <span className="text-emerald-600">{castedFloorsCount}</span>/{data.totalFloors} Floors Casted
              </div>
          </div>
      </div>

      <div className="flex-1 overflow-y-auto pr-2 custom-scrollbar pb-10">
        {/* Roof Decoration */}
        <div className="w-full h-8 bg-slate-800 rounded-t-lg mx-auto mb-2 opacity-80 flex items-center justify-center shadow-lg">
             {/* Rooftop elements */}
             <div className="w-2 h-4 bg-gray-400 mx-1 rounded-sm"></div>
             <div className="w-2 h-3 bg-gray-500 mx-1 rounded-sm"></div>
        </div>
        
        <div className="space-y-1 relative">
          {/* Vertical Guide Line */}
          <div className="absolute left-[4.5rem] md:left-[5.5rem] top-0 bottom-0 w-px bg-gray-200 border-l border-dashed border-gray-300"></div>

          {data.floors.map(floor => (
            <FloorRow 
              key={floor.level} 
              floor={floor} 
              onSelectUnit={onSelectUnit}
              selectedUnitId={selectedUnitId}
            />
          ))}
        </div>

        {/* Ground Decoration */}
        <div className="w-full h-6 bg-gradient-to-b from-stone-200 to-stone-300 border-t-4 border-stone-400 rounded-b-lg mt-1 mx-auto flex justify-center gap-10">
            <div className="w-16 h-full bg-stone-400/20"></div>
            <div className="w-16 h-full bg-stone-400/20"></div>
        </div>
      </div>
    </div>
  );
};
