import React, { useState } from 'react';
import { Unit, ConstructionStage } from '../types';
import { STAGES_ORDER, STAGE_COLORS, getStageIndex } from '../constants';
import { CheckCircle2, Circle, Clock, ArrowRight, ShieldCheck, FileText, Calendar, Download, AlertCircle } from 'lucide-react';

interface UnitDetailViewProps {
  unit: Unit | null;
  onClose: () => void;
}

type TabType = 'timeline' | 'quality' | 'documents';

export const UnitDetailView: React.FC<UnitDetailViewProps> = ({ unit, onClose }) => {
  const [activeTab, setActiveTab] = useState<TabType>('timeline');

  if (!unit) return (
    <div className="h-full flex items-center justify-center text-gray-400 p-8 text-center border-2 border-dashed border-gray-200 rounded-xl bg-gray-50/50">
      <div className="max-w-xs">
          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Clock className="text-gray-300" size={32} />
          </div>
          <p className="font-medium text-gray-600">No Unit Selected</p>
          <p className="text-sm mt-2">Select a unit from the building view to see real-time progress, delivery dates, and quality reports.</p>
      </div>
    </div>
  );

  const currentStageIndex = getStageIndex(unit.currentStage);
  const timelineStages = STAGES_ORDER.filter(s => s !== ConstructionStage.NOT_STARTED);
  
  const formattedDeliveryDate = new Date(unit.expectedDeliveryDate).toLocaleDateString('en-US', {
      month: 'long',
      year: 'numeric'
  });

  return (
    <div className="h-full flex flex-col bg-white rounded-xl shadow-lg border border-gray-100 overflow-hidden">
      {/* Header */}
      <div className={`p-6 ${STAGE_COLORS[unit.currentStage]} bg-opacity-20 relative overflow-hidden`}>
        {/* Abstract Pattern overlay */}
        <div className="absolute top-0 right-0 p-8 opacity-10">
            <ShieldCheck size={120} />
        </div>

        <div className="flex justify-between items-start relative z-10">
          <div>
            <h2 className="text-3xl font-bold text-gray-800">Unit {unit.id}</h2>
            <p className="text-sm font-medium opacity-75 mt-1 flex items-center gap-2">
                Floor {unit.floorNumber} • {unit.status === 'Sold' ? 'Private Residence' : 'Available for Sale'}
            </p>
          </div>
          <button onClick={onClose} className="bg-white/50 hover:bg-white p-2 rounded-full transition-colors text-gray-700">
            <ArrowRight size={20} />
          </button>
        </div>

        <div className="mt-6 flex flex-wrap gap-4 relative z-10">
            <div className="bg-white/80 backdrop-blur-sm px-4 py-2 rounded-lg shadow-sm">
                <p className="text-[10px] uppercase tracking-wider text-gray-500 font-bold mb-1">Current Stage</p>
                <div className="text-lg font-bold text-gray-800 flex items-center gap-2">
                    {unit.currentStage}
                    <span className="text-xs font-normal px-2 py-0.5 bg-blue-100 text-blue-700 rounded-full">
                    {unit.progressPercentage}%
                    </span>
                </div>
            </div>
            
            <div className="bg-white/80 backdrop-blur-sm px-4 py-2 rounded-lg shadow-sm border-l-4 border-blue-500">
                <p className="text-[10px] uppercase tracking-wider text-gray-500 font-bold mb-1">Expected Delivery</p>
                <div className="text-lg font-bold text-gray-800 flex items-center gap-2">
                    <Calendar size={18} className="text-blue-500" />
                    {formattedDeliveryDate}
                </div>
            </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="flex border-b border-gray-100 px-6 pt-4 gap-6">
          <button 
            onClick={() => setActiveTab('timeline')}
            className={`pb-3 text-sm font-semibold flex items-center gap-2 transition-colors ${activeTab === 'timeline' ? 'text-blue-600 border-b-2 border-blue-600' : 'text-gray-500 hover:text-gray-700'}`}
          >
              <Clock size={16} /> Timeline & Updates
          </button>
          <button 
            onClick={() => setActiveTab('quality')}
            className={`pb-3 text-sm font-semibold flex items-center gap-2 transition-colors ${activeTab === 'quality' ? 'text-blue-600 border-b-2 border-blue-600' : 'text-gray-500 hover:text-gray-700'}`}
          >
              <ShieldCheck size={16} /> Quality & Safety
          </button>
          <button 
            onClick={() => setActiveTab('documents')}
            className={`pb-3 text-sm font-semibold flex items-center gap-2 transition-colors ${activeTab === 'documents' ? 'text-blue-600 border-b-2 border-blue-600' : 'text-gray-500 hover:text-gray-700'}`}
          >
              <FileText size={16} /> My Documents
          </button>
      </div>

      {/* Scrollable Content */}
      <div className="flex-1 overflow-y-auto p-6 bg-gray-50/30">
        
        {activeTab === 'timeline' && (
            <div className="space-y-8 animate-in fade-in slide-in-from-bottom-2 duration-300">
                {/* Visual Timeline */}
                <section>
                <h3 className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-4">Construction Milestones</h3>
                <div className="relative pl-2">
                    <div className="absolute left-[9px] top-2 bottom-2 w-0.5 bg-gray-200"></div>
                    <div className="space-y-4">
                    {timelineStages.map((stage) => {
                        const stageIdx = getStageIndex(stage);
                        const isCompleted = stageIdx <= currentStageIndex;
                        const isCurrent = stageIdx === currentStageIndex;

                        return (
                        <div key={stage} className="relative flex items-center gap-4 group">
                            <div className={`z-10 w-5 h-5 rounded-full border-2 flex items-center justify-center bg-white transition-all duration-300 ${isCompleted ? 'border-emerald-500 text-emerald-500 scale-110' : 'border-gray-300 text-gray-300'}`}>
                            {isCompleted ? <CheckCircle2 size={12} fill="currentColor" className="text-white" /> : <Circle size={10} />}
                            </div>
                            <div className={`flex-1 p-3 rounded-lg border transition-all duration-300 ${isCurrent ? 'bg-white border-blue-200 shadow-md translate-x-1' : 'bg-transparent border-transparent opacity-60'}`}>
                            <span className={`text-sm font-medium ${isCurrent ? 'text-blue-700' : 'text-gray-700'}`}>
                                {stage}
                            </span>
                            </div>
                        </div>
                        );
                    })}
                    </div>
                </div>
                </section>

                {/* Updates Feed */}
                <section>
                    <h3 className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-4">Latest Site Activity</h3>
                    <div className="space-y-4">
                        {unit.updates.length === 0 ? (
                            <p className="text-sm text-gray-400 italic">No specific updates logged yet.</p>
                        ) : (
                            unit.updates.map((update) => (
                            <div key={update.id} className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow">
                                <div className="flex justify-between items-center mb-2">
                                    <span className={`text-[10px] font-bold px-2 py-1 rounded uppercase ${STAGE_COLORS[update.stage]}`}>
                                        {update.stage}
                                    </span>
                                    <span className="text-xs text-gray-400">
                                        {new Date(update.date).toLocaleDateString()}
                                    </span>
                                </div>
                                <p className="text-sm text-gray-700 leading-relaxed mb-3">{update.note}</p>
                                {update.imageUrl && (
                                <div className="rounded-lg overflow-hidden border border-gray-100">
                                    <img src={update.imageUrl} alt="Construction update" className="w-full h-40 object-cover hover:scale-105 transition-transform duration-500" />
                                </div>
                                )}
                            </div>
                            ))
                        )}
                    </div>
                </section>
            </div>
        )}

        {activeTab === 'quality' && (
             <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-300">
                <div className="bg-blue-50 border border-blue-100 p-4 rounded-lg flex gap-3">
                    <ShieldCheck className="text-blue-600 flex-shrink-0" size={24} />
                    <div>
                        <h4 className="font-semibold text-blue-900 text-sm">Verified Standards</h4>
                        <p className="text-xs text-blue-700 mt-1">Every stage of construction is rigorously inspected by certified engineers to ensure structural integrity and safety.</p>
                    </div>
                </div>

                <div className="grid gap-3">
                    {unit.qualityChecks.map((check) => (
                        <div key={check.id} className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                {check.status === 'Passed' && <div className="w-8 h-8 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center"><CheckCircle2 size={18} /></div>}
                                {check.status === 'In Progress' && <div className="w-8 h-8 rounded-full bg-yellow-100 text-yellow-600 flex items-center justify-center animate-pulse"><Circle size={18} /></div>}
                                {check.status === 'Pending' && <div className="w-8 h-8 rounded-full bg-gray-100 text-gray-400 flex items-center justify-center"><Circle size={18} /></div>}
                                
                                <div>
                                    <p className="text-sm font-semibold text-gray-800">{check.name}</p>
                                    <p className="text-xs text-gray-500">
                                        {check.status === 'Passed' ? `Verified by ${check.inspector} on ${check.date}` : check.status}
                                    </p>
                                </div>
                            </div>
                            <div className={`text-xs font-bold px-3 py-1 rounded-full ${
                                check.status === 'Passed' ? 'bg-emerald-50 text-emerald-600' :
                                check.status === 'In Progress' ? 'bg-yellow-50 text-yellow-600' :
                                'bg-gray-100 text-gray-400'
                            }`}>
                                {check.status.toUpperCase()}
                            </div>
                        </div>
                    ))}
                </div>
             </div>
        )}

        {activeTab === 'documents' && (
            <div className="space-y-4 animate-in fade-in slide-in-from-bottom-2 duration-300">
                 <div className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm text-center py-8">
                     <div className="w-12 h-12 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-3 text-gray-400">
                         <Download size={24} />
                     </div>
                     <h3 className="text-sm font-semibold text-gray-900">Official Unit Documents</h3>
                     <p className="text-xs text-gray-500 max-w-xs mx-auto mt-1">Access all your property related documents, blueprints, and payment receipts.</p>
                 </div>

                 <div className="grid gap-3">
                     {unit.documents.map((doc) => (
                         <div key={doc.id} className="group flex items-center justify-between p-3 bg-white border border-gray-100 rounded-lg hover:border-blue-200 hover:shadow-sm transition-all cursor-pointer">
                             <div className="flex items-center gap-3">
                                 <div className={`w-10 h-10 rounded-lg flex items-center justify-center font-bold text-xs ${
                                     doc.type === 'PDF' ? 'bg-red-50 text-red-600' :
                                     doc.type === 'IMG' ? 'bg-purple-50 text-purple-600' :
                                     'bg-blue-50 text-blue-600'
                                 }`}>
                                     {doc.type}
                                 </div>
                                 <div>
                                     <p className="text-sm font-medium text-gray-700 group-hover:text-blue-600 transition-colors">{doc.name}</p>
                                     <p className="text-xs text-gray-400">{doc.date} • {doc.size}</p>
                                 </div>
                             </div>
                             <Download size={16} className="text-gray-300 group-hover:text-blue-600" />
                         </div>
                     ))}
                 </div>
            </div>
        )}

      </div>
    </div>
  );
};