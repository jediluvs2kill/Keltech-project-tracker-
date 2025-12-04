import React, { useState } from 'react';
import { INITIAL_BUILDING_DATA, generateBuilding } from './constants';
import { BuildingVisualizer } from './components/BuildingVisualizer';
import { UnitDetailView } from './components/UnitDetailView';
import { AdminDashboard } from './components/AdminDashboard';
import { Unit, ConstructionStage, BuildingData } from './types';
import { LayoutDashboard, UserCheck, ShieldCheck, LogOut, Building2, Sparkles, Smartphone, ArrowRight, CheckCircle2, ScanLine, BarChart3 } from 'lucide-react';

type UserRole = 'guest' | 'buyer' | 'admin';

const App: React.FC = () => {
  const [role, setRole] = useState<UserRole>('guest');
  const [buildingData, setBuildingData] = useState<BuildingData>(INITIAL_BUILDING_DATA);
  const [selectedUnitId, setSelectedUnitId] = useState<string | null>(null);

  // Flattened units helper
  const allUnits = buildingData.floors.flatMap(f => f.units);
  const selectedUnit = allUnits.find(u => u.id === selectedUnitId) || null;

  const handleConfigureBuilding = (name: string, floors: number, unitsPerFloor: number, prefix: string) => {
      const newData = generateBuilding(name, floors, unitsPerFloor, prefix);
      setBuildingData(newData);
      setSelectedUnitId(null);
  };

  const handleUnitUpdate = (unitId: string, newStage: ConstructionStage, note: string, imageUrl?: string) => {
    setBuildingData(prev => {
      const newFloors = prev.floors.map(floor => ({
        ...floor,
        units: floor.units.map(unit => {
          if (unit.id === unitId) {
            return {
              ...unit,
              currentStage: newStage,
              // Simple progress update logic: if new stage is "later" in array, set to 0% of that stage or 100% complete
              // For demo, we just update stage and reset progress to "started" (e.g. 10%)
              progressPercentage: 10, 
              updates: [
                {
                  id: Date.now().toString(),
                  date: new Date().toISOString(),
                  stage: newStage,
                  note: note,
                  imageUrl: imageUrl
                },
                ...unit.updates
              ]
            };
          }
          return unit;
        })
      }));
      return { ...prev, floors: newFloors };
    });
  };

  const MainContent = () => (
    <div className="flex flex-col lg:flex-row gap-6 h-[calc(100vh-100px)] animate-in fade-in duration-500">
      {/* Left: Building Visualization (Always Visible) */}
      <div className={`flex-1 transition-all duration-500 ease-in-out overflow-y-auto ${role === 'admin' ? 'lg:w-1/3 lg:flex-none' : 'lg:w-1/2'}`}>
        <BuildingVisualizer 
          data={buildingData} 
          onSelectUnit={(u) => setSelectedUnitId(u.id)} 
          selectedUnitId={selectedUnitId || undefined}
        />
      </div>

      {/* Right: Dynamic Panel */}
      <div className="flex-1 flex flex-col overflow-hidden h-full">
        {role === 'admin' ? (
          <AdminDashboard 
            units={allUnits} 
            currentBuildingName={buildingData.name}
            totalFloors={buildingData.totalFloors}
            onUpdateUnit={handleUnitUpdate} 
            onConfigureBuilding={handleConfigureBuilding}
          />
        ) : (
          <UnitDetailView unit={selectedUnit} onClose={() => setSelectedUnitId(null)} />
        )}
      </div>
    </div>
  );

  const Navbar = () => (
    <nav className={`flex items-center justify-between px-6 py-4 sticky top-0 z-50 transition-all duration-300 ${role === 'guest' ? 'bg-white/80 backdrop-blur-md border-b border-gray-100' : 'bg-white border-b border-gray-200'}`}>
      <div className="flex items-center gap-3 cursor-pointer" onClick={() => { setRole('guest'); setSelectedUnitId(null); }}>
        <div className="bg-gradient-to-tr from-blue-600 to-indigo-600 text-white p-2 rounded-lg font-bold shadow-lg shadow-blue-500/20">KP</div>
        <div>
            <h1 className="text-xl font-bold text-slate-800 leading-none tracking-tight">Keltech Project Tracker</h1>
            <p className="text-xs text-slate-500 font-medium tracking-wide">Live Residential Tracker</p>
        </div>
      </div>
      
      {role === 'guest' ? (
        <div className="flex gap-3 md:gap-4">
          <button 
            onClick={() => setRole('buyer')} 
            className="hidden md:flex items-center gap-2 px-5 py-2.5 text-sm font-semibold text-slate-600 hover:text-blue-600 hover:bg-blue-50 rounded-full transition-all"
          >
            I am a Buyer
          </button>
          <button 
            onClick={() => setRole('admin')} 
            className="flex items-center gap-2 px-5 py-2.5 text-sm font-semibold text-white bg-slate-900 hover:bg-slate-800 rounded-full shadow-lg shadow-slate-900/20 transition-all hover:scale-105"
          >
            <ShieldCheck size={16} /> Site Admin
          </button>
        </div>
      ) : (
        <div className="flex items-center gap-4">
            <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wide border ${role === 'admin' ? 'bg-purple-50 text-purple-600 border-purple-100' : 'bg-blue-50 text-blue-600 border-blue-100'}`}>
                {role === 'admin' ? 'Admin Mode' : 'Buyer View'}
            </span>
            <button 
                onClick={() => { setRole('guest'); setSelectedUnitId(null); }} 
                className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-full transition-all"
                title="Logout"
            >
                <LogOut size={20} />
            </button>
        </div>
      )}
    </nav>
  );

  const LandingHero = () => (
    <div className="flex flex-col w-full animate-in fade-in zoom-in-95 duration-700">
        {/* Hero Section */}
        <div className="relative overflow-hidden pt-12 pb-24 md:pt-20 md:pb-32">
            {/* Abstract Background */}
            <div className="absolute inset-0 -z-10 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-blue-50 via-white to-white"></div>
            <div className="absolute inset-y-0 right-0 w-1/2 bg-slate-50/50 -skew-x-12 translate-x-1/4 -z-10 blur-3xl"></div>

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex flex-col lg:flex-row items-center gap-16">
                    
                    {/* Text Content */}
                    <div className="flex-1 text-center lg:text-left space-y-8">
                        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 border border-blue-100 text-blue-600 text-xs font-bold tracking-wider uppercase mb-4">
                            <span className="relative flex h-2 w-2">
                              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
                              <span className="relative inline-flex rounded-full h-2 w-2 bg-blue-500"></span>
                            </span>
                            Live Updates Enabled
                        </div>
                        
                        <h2 className="text-5xl md:text-6xl lg:text-7xl font-extrabold text-slate-900 tracking-tight leading-[1.1]">
                            Watch Your <br/>
                            <span className="text-blue-600">
                                Dream Home Rise
                            </span>
                        </h2>
                        
                        <p className="text-lg md:text-xl text-slate-500 leading-relaxed max-w-2xl mx-auto lg:mx-0">
                            The world's first AI-powered construction tracker for modern real estate. 
                            Experience radical transparency with real-time digital twin technology.
                        </p>

                        <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start pt-4">
                            <button 
                                onClick={() => setRole('buyer')} 
                                className="group px-8 py-4 bg-blue-600 text-white font-bold text-lg rounded-2xl shadow-xl shadow-blue-500/30 hover:bg-blue-700 hover:shadow-2xl hover:shadow-blue-600/40 transition-all flex items-center justify-center gap-2"
                            >
                                Track My Unit
                                <ArrowRight className="group-hover:translate-x-1 transition-transform" />
                            </button>
                            <button 
                                onClick={() => setRole('admin')} 
                                className="px-8 py-4 bg-white text-slate-700 border border-slate-200 font-bold text-lg rounded-2xl shadow-sm hover:border-slate-300 hover:shadow-md hover:bg-slate-50 transition-all"
                            >
                                Admin Demo
                            </button>
                        </div>

                        <div className="pt-8 flex items-center justify-center lg:justify-start gap-8 text-slate-400 text-sm font-medium">
                            <div className="flex items-center gap-2">
                                <CheckCircle2 size={16} className="text-emerald-500" /> 100% Transparent
                            </div>
                            <div className="flex items-center gap-2">
                                <CheckCircle2 size={16} className="text-emerald-500" /> Real-time Data
                            </div>
                            <div className="flex items-center gap-2">
                                <CheckCircle2 size={16} className="text-emerald-500" /> AI Verified
                            </div>
                        </div>
                    </div>

                    {/* Visual Graphic */}
                    <div className="flex-1 w-full max-w-lg lg:max-w-none relative">
                        <div className="relative aspect-square md:aspect-[4/3] bg-gradient-to-br from-slate-900 to-slate-800 rounded-3xl shadow-2xl border border-slate-700 overflow-hidden group">
                            {/* Blueprint Grid Background */}
                            <div className="absolute inset-0 opacity-20" style={{ backgroundImage: 'radial-gradient(#94a3b8 1px, transparent 1px)', backgroundSize: '20px 20px' }}></div>
                            
                            {/* Decorative UI Overlay */}
                            <div className="absolute top-6 left-6 right-6 flex justify-between items-center text-slate-400 text-xs font-mono">
                                <span>ID: KEL-TWRS-01</span>
                                <span className="flex items-center gap-2 text-emerald-400">
                                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                                    SYSTEM ONLINE
                                </span>
                            </div>

                            {/* Abstract Building Representation */}
                            <div className="absolute inset-0 flex items-center justify-center p-12">
                                <div className="w-full h-full grid grid-cols-4 grid-rows-6 gap-2 opacity-90 transform group-hover:scale-105 transition-transform duration-700">
                                    {Array.from({length: 24}).map((_, i) => (
                                        <div 
                                            key={i} 
                                            className={`rounded-md border backdrop-blur-sm transition-all duration-1000 ${i % 3 === 0 ? 'bg-blue-500/30 border-blue-400/50 shadow-[0_0_10px_rgba(59,130,246,0.2)]' : 'bg-slate-700/40 border-slate-600/50'}`}
                                            style={{ transitionDelay: `${i * 50}ms` }}
                                        >
                                            {i === 7 && (
                                                <div className="absolute -top-4 -right-12 bg-white text-slate-900 text-[10px] font-bold px-2 py-1 rounded shadow-lg animate-bounce z-10">
                                                    Update!
                                                </div>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* Scanning Effect */}
                            <div className="absolute inset-0 bg-gradient-to-b from-transparent via-blue-500/10 to-transparent h-1/4 w-full animate-[scan_3s_ease-in-out_infinite] pointer-events-none"></div>
                        </div>

                        {/* Floating Badge */}
                        <div className="absolute -bottom-6 -left-6 md:bottom-8 md:-left-8 bg-white p-4 rounded-2xl shadow-xl border border-gray-100 flex items-center gap-4 animate-in slide-in-from-bottom-4 duration-1000 delay-300">
                            <div className="bg-purple-100 p-3 rounded-xl text-purple-600">
                                <Sparkles size={24} />
                            </div>
                            <div>
                                <p className="text-xs text-gray-500 font-semibold uppercase">Latest Analysis</p>
                                <p className="text-sm font-bold text-gray-800">Foundation Complete</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>

        {/* Features Grid */}
        <div className="bg-white py-20 border-t border-slate-100">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="grid md:grid-cols-3 gap-8">
                    {[
                        {
                            icon: Building2,
                            title: "Digital Twin",
                            desc: "Interactive visual representation of every floor and unit in real-time."
                        },
                        {
                            icon: ScanLine,
                            title: "AI Analysis",
                            desc: "Advanced computer vision automatically verifies construction progress from site photos."
                        },
                        {
                            icon: BarChart3,
                            title: "Live Reporting",
                            desc: "Instant notifications and detailed timeline views for complete peace of mind."
                        }
                    ].map((feature, idx) => (
                        <div key={idx} className="p-8 rounded-3xl bg-slate-50 border border-slate-100 hover:bg-white hover:shadow-xl hover:-translate-y-1 transition-all duration-300 group">
                            <div className="w-14 h-14 bg-white rounded-2xl shadow-sm border border-slate-100 flex items-center justify-center text-slate-700 mb-6 group-hover:bg-blue-600 group-hover:text-white transition-colors">
                                <feature.icon size={28} />
                            </div>
                            <h3 className="text-xl font-bold text-slate-900 mb-3">{feature.title}</h3>
                            <p className="text-slate-500 leading-relaxed">
                                {feature.desc}
                            </p>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans selection:bg-blue-100">
      <style>{`
        @keyframes scan {
          0% { top: -25%; opacity: 0; }
          20% { opacity: 1; }
          80% { opacity: 1; }
          100% { top: 125%; opacity: 0; }
        }
      `}</style>
      <Navbar />
      {role === 'guest' ? (
          <LandingHero />
      ) : (
          <main className="container mx-auto p-4 md:p-6 lg:p-8 h-full">
            <MainContent />
          </main>
      )}
    </div>
  );
};

export default App;