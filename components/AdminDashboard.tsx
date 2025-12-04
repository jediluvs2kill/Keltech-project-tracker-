import React, { useState, useRef } from 'react';
import { Unit, ConstructionStage, UpdateLog } from '../types';
import { analyzeConstructionUpdate } from '../services/gemini';
import { Mic, Send, Image as ImageIcon, Sparkles, Loader2, Check, Settings, AlertTriangle } from 'lucide-react';
import { STAGE_COLORS_HEX, getStageProgress } from '../constants';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';

interface AdminDashboardProps {
  units: Unit[];
  currentBuildingName: string;
  totalFloors: number;
  onUpdateUnit: (unitId: string, newStage: ConstructionStage, note: string, imageUrl?: string) => void;
  onConfigureBuilding: (name: string, floors: number, unitsPerFloor: number, prefix: string) => void;
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({ 
    units, 
    currentBuildingName,
    totalFloors,
    onUpdateUnit, 
    onConfigureBuilding 
}) => {
  const [inputText, setInputText] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  // Configuration State
  const [showConfig, setShowConfig] = useState(false);
  const [configName, setConfigName] = useState(currentBuildingName);
  const [configFloors, setConfigFloors] = useState(totalFloors);
  const [configUnits, setConfigUnits] = useState(4); // Default assumption since we don't have it in props directly, could derive it
  const [configPrefix, setConfigPrefix] = useState("");


  // Stats for chart
  const stageCounts = units.reduce((acc, unit) => {
    acc[unit.currentStage] = (acc[unit.currentStage] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const chartData = Object.keys(stageCounts).map(stage => ({
    name: stage,
    count: stageCounts[stage],
    color: STAGE_COLORS_HEX[stage as ConstructionStage] || '#ccc'
  }));

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setSelectedImage(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleAIProcess = async () => {
    if (!inputText && !selectedImage) return;

    setIsProcessing(true);
    try {
      // Clean image base64 if exists (remove data:image/jpeg;base64, prefix for API if needed, 
      // but Gemini SDK handles standard base64 strings usually if inlineData is used correctly. 
      // The SDK expects just the base64 data usually, so let's strip header.)
      let imageBase64Data = undefined;
      if (selectedImage) {
        imageBase64Data = selectedImage.split(',')[1];
      }

      const result = await analyzeConstructionUpdate(inputText, imageBase64Data);
      
      console.log("AI Result:", result);

      // Apply updates based on AI result
      const targetIds = result.detectedUnitIds.length > 0 
        ? result.detectedUnitIds 
        : []; 

      if (targetIds.length === 0) {
        alert(`AI Analysis: ${result.summary}\n\nNo specific Unit IDs detected to update. Please mention unit numbers like "101".`);
      } else {
        let updateCount = 0;
        targetIds.forEach(id => {
            // Fuzzy match ID
            const unit = units.find(u => u.id === id || u.unitNumber === id); // Simple check
            if (unit) {
                onUpdateUnit(unit.id, result.suggestedStage, result.summary, selectedImage || undefined);
                updateCount++;
            }
        });
        
        if (updateCount > 0) {
            setInputText('');
            setSelectedImage(null);
            alert(`Successfully updated ${updateCount} units to ${result.suggestedStage} based on AI analysis.`);
        } else {
            alert(`Found IDs ${targetIds.join(', ')} but could not match them to building units.`);
        }
      }

    } catch (error) {
      console.error(error);
      alert("Failed to process update with AI.");
    } finally {
      setIsProcessing(false);
    }
  };

  const handleSaveConfig = () => {
      if (window.confirm("WARNING: Changing building configuration will RESET all current unit data and progress. Are you sure?")) {
          onConfigureBuilding(configName, configFloors, configUnits, configPrefix);
          setShowConfig(false);
      }
  };

  return (
    <div className="h-full flex flex-col space-y-6 overflow-y-auto">
      
      {/* Configuration Toggle */}
      <div className="flex justify-end">
          <button 
            onClick={() => setShowConfig(!showConfig)}
            className="flex items-center gap-2 text-sm text-gray-500 hover:text-gray-800"
          >
              <Settings size={14} /> {showConfig ? 'Hide Settings' : 'Building Settings'}
          </button>
      </div>

      {showConfig && (
          <div className="bg-white p-6 rounded-xl border border-blue-200 shadow-md animate-in slide-in-from-top-2">
              <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
                  <Settings size={20} className="text-blue-500" /> Building Configuration
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                  <div>
                      <label className="block text-xs font-semibold text-gray-500 uppercase mb-1">Building Name</label>
                      <input 
                        type="text" 
                        value={configName}
                        onChange={(e) => setConfigName(e.target.value)}
                        className="w-full p-2 border border-gray-200 rounded text-sm"
                      />
                  </div>
                   <div>
                      <label className="block text-xs font-semibold text-gray-500 uppercase mb-1">Unit ID Prefix</label>
                      <input 
                        type="text" 
                        placeholder="e.g. A- or T1-"
                        value={configPrefix}
                        onChange={(e) => setConfigPrefix(e.target.value)}
                        className="w-full p-2 border border-gray-200 rounded text-sm"
                      />
                  </div>
                  <div>
                      <label className="block text-xs font-semibold text-gray-500 uppercase mb-1">Total Floors</label>
                      <input 
                        type="number" 
                        min={1} max={100}
                        value={configFloors}
                        onChange={(e) => setConfigFloors(parseInt(e.target.value))}
                        className="w-full p-2 border border-gray-200 rounded text-sm"
                      />
                  </div>
                  <div>
                      <label className="block text-xs font-semibold text-gray-500 uppercase mb-1">Units per Floor</label>
                      <input 
                        type="number" 
                        min={1} max={20}
                        value={configUnits}
                        onChange={(e) => setConfigUnits(parseInt(e.target.value))}
                        className="w-full p-2 border border-gray-200 rounded text-sm"
                      />
                  </div>
              </div>
              <div className="flex items-center justify-between bg-yellow-50 p-3 rounded-lg border border-yellow-100 mb-4">
                  <div className="flex items-center gap-2 text-yellow-700 text-xs">
                      <AlertTriangle size={16} />
                      <span>Updates will reset the entire project visualization.</span>
                  </div>
                  <button 
                    onClick={handleSaveConfig}
                    className="px-4 py-2 bg-blue-600 text-white text-sm font-bold rounded-lg hover:bg-blue-700"
                  >
                      Apply & Regenerate
                  </button>
              </div>
          </div>
      )}

      {/* AI Assistant */}
      <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm">
        <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
            <Sparkles className="text-purple-500" /> AI Project Update Assistant
        </h2>
        
        <div className="flex gap-4 mb-4">
           {selectedImage && (
               <div className="relative w-24 h-24 rounded-lg overflow-hidden border border-gray-200 group">
                   <img src={selectedImage} className="w-full h-full object-cover" alt="Preview" />
                   <button 
                    onClick={() => setSelectedImage(null)}
                    className="absolute top-0 right-0 bg-red-500 text-white p-1 rounded-bl text-xs opacity-0 group-hover:opacity-100 transition-opacity"
                   >
                       Remove
                   </button>
               </div>
           )}
           <textarea 
            className="flex-1 p-3 border border-gray-200 rounded-lg bg-gray-50 focus:bg-white focus:ring-2 focus:ring-purple-200 transition-all outline-none resize-none h-24"
            placeholder="Describe progress... e.g. 'Completed brickwork for units 301 and 302. Site looks clean.'"
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
           />
        </div>

        <div className="flex justify-between items-center">
            <div className="flex gap-2">
                 <input 
                    type="file" 
                    accept="image/*" 
                    className="hidden" 
                    ref={fileInputRef}
                    onChange={handleImageUpload}
                 />
                <button 
                    onClick={() => fileInputRef.current?.click()}
                    className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-600 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
                >
                    <ImageIcon size={16} /> Add Photo
                </button>
                {/* Microphone is visual only for this demo */}
                <button className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-600 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors opacity-50 cursor-not-allowed">
                    <Mic size={16} /> Voice
                </button>
            </div>

            <button 
                onClick={handleAIProcess}
                disabled={isProcessing || (!inputText && !selectedImage)}
                className={`
                    flex items-center gap-2 px-6 py-2 rounded-lg font-semibold text-white shadow-md transition-all
                    ${isProcessing ? 'bg-purple-400 cursor-wait' : 'bg-purple-600 hover:bg-purple-700 hover:shadow-lg'}
                `}
            >
                {isProcessing ? (
                    <><Loader2 size={18} className="animate-spin" /> Analyzing...</>
                ) : (
                    <><Sparkles size={18} /> Process Update</>
                )}
            </button>
        </div>
        <p className="text-xs text-gray-400 mt-2 text-right">
            Powered by Gemini 2.5 • Detects stages & unit numbers automatically
        </p>
      </div>

      <div className="flex-1 bg-white p-6 rounded-xl border border-gray-100 shadow-sm flex flex-col">
        <h3 className="text-lg font-semibold text-gray-800 mb-6">Overall Project Progress</h3>
        <div className="flex-1 min-h-[200px]">
            <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData} layout="vertical" margin={{ left: 40 }}>
                    <XAxis type="number" hide />
                    <YAxis dataKey="name" type="category" width={100} tick={{fontSize: 12}} />
                    <Tooltip cursor={{fill: 'transparent'}} />
                    <Bar dataKey="count" radius={[0, 4, 4, 0]} barSize={30}>
                        {chartData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                    </Bar>
                </BarChart>
            </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};