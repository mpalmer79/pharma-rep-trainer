
'use client';

import { AnimatedSection } from '@/components/ui/AnimatedSection';
import { drugs } from '@/data/drugs';
import { personas } from '@/data/personas';

interface SimulatorSectionProps {
  selectedDrug: string | null;
  selectedPersona: string | null;
  onDrugSelect: (drugId: string) => void;
  onPersonaSelect: (personaId: string) => void;
  onStartTraining: () => void;
}

export const SimulatorSection = ({
  selectedDrug,
  selectedPersona,
  onDrugSelect,
  onPersonaSelect,
  onStartTraining
}: SimulatorSectionProps) => {
  const getPersonaImage = (personaId: string) => {
    const imageMap: Record<string, string> = {
      'rush': '1559839734-2b71ea197ec2',
      'skeptic': '1612349317150-e413f6a5b16d',
      'loyalist': '1594824476967-48c8b964273f',
      'gatekeeper': '1573496359142-b8d87734a5a2',
      'curious': '1537368910025-700350fe46c7'
    };
    return `https://images.unsplash.com/photo-${imageMap[personaId] || '1537368910025-700350fe46c7'}?w=100&h=100&fit=crop&crop=face`;
  };

  return (
    <section id="simulator" className="py-20 lg:py-28">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <AnimatedSection className="text-center mb-12">
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-[#1B4D7A] mb-4">
            <span className="relative inline-block">
              Try RepIQ
              <span className="absolute bottom-0 left-0 w-full h-1 bg-[#E67E22]"></span>
            </span>{' '}
            Now
          </h2>
          <p className="text-lg text-gray-600">
            Select a product and physician persona to start your training simulation
          </p>
        </AnimatedSection>

        <AnimatedSection delay={200}>
          <div className="bg-white rounded-lg shadow-xl border border-gray-200 p-6 sm:p-8">
            {/* Product Selection */}
            <div className="mb-10">
              <h4 className="text-lg font-bold text-[#1B4D7A] mb-4 flex items-center gap-3">
                <span className="w-8 h-8 bg-[#E67E22] text-white rounded-full flex items-center justify-center text-sm font-bold">1</span>
                Select Your Product
              </h4>
              <div className="grid gap-3">
                {drugs.map(drug => (
                  <button
                    key={drug.id}
                    onClick={() => onDrugSelect(drug.id)}
                    className={`p-4 sm:p-5 rounded-lg border-2 text-left transition-all ${
                      selectedDrug === drug.id 
                        ? 'bg-blue-50 border-[#1B4D7A]' 
                        : 'bg-white border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <div className="flex justify-between items-start gap-3">
                      <div className="flex-1">
                        <h5 className="font-semibold text-[#1B4D7A]">{drug.name}</h5>
                        <p className="text-sm text-gray-500">{drug.category} • {drug.indication}</p>
                        <p className="text-sm text-gray-500 mt-1">{drug.keyData}</p>
                      </div>
                      <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 ${
                        selectedDrug === drug.id ? 'border-[#1B4D7A] bg-[#1B4D7A]' : 'border-gray-300'
                      }`}>
                        {selectedDrug === drug.id && <span className="w-2 h-2 rounded-full bg-white" />}
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Persona Selection */}
            <div className="mb-10">
              <h4 className="text-lg font-bold text-[#1B4D7A] mb-4 flex items-center gap-3">
                <span className="w-8 h-8 bg-[#E67E22] text-white rounded-full flex items-center justify-center text-sm font-bold">2</span>
                Select Your Physician
              </h4>
              <div className="grid gap-3">
                {personas.map(persona => (
                  <button
                    key={persona.id}
                    onClick={() => onPersonaSelect(persona.id)}
                    className={`p-4 sm:p-5 rounded-lg border-2 text-left transition-all ${
                      selectedPersona === persona.id 
                        ? 'bg-blue-50 border-[#1B4D7A]' 
                        : 'bg-white border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <div className="flex gap-4 items-start">
                      <img 
                        src={getPersonaImage(persona.id)}
                        alt={persona.name}
                        className="w-14 h-14 rounded-lg object-cover flex-shrink-0"
                      />
                      <div className="flex-1">
                        <div className="flex justify-between items-start">
                          <div>
                            <h5 className="font-semibold text-[#1B4D7A]">{persona.name}</h5>
                            <p className="text-sm text-[#E67E22] font-medium">{persona.title}</p>
                          </div>
                          <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 ${
                            selectedPersona === persona.id ? 'border-[#1B4D7A] bg-[#1B4D7A]' : 'border-gray-300'
                          }`}>
                            {selectedPersona === persona.id && <span className="w-2 h-2 rounded-full bg-white" />}
                          </div>
                        </div>
                        <p className="text-sm text-gray-500 mt-1">{persona.description}</p>
                        <p className="text-xs text-gray-400 mt-2">
                          {Math.floor(persona.timerSeconds / 60)}:{(persona.timerSeconds % 60).toString().padStart(2, '0')} time limit • {persona.difficulty} difficulty
                        </p>
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            </div>

            <button
              onClick={onStartTraining}
              disabled={!selectedDrug}
              className="w-full py-4 rounded-lg bg-[#E67E22] hover:bg-[#D35400] text-white font-bold text-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              START TRAINING SESSION
            </button>
          </div>
        </AnimatedSection>
      </div>
    </section>
  );
};

export default SimulatorSection;
