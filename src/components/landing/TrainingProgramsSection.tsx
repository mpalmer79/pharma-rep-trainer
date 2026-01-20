
'use client';

import { AnimatedSection } from '@/components/ui/AnimatedSection';

const trainingPrograms = [
  {
    title: 'Clinical Data Presentation',
    description: 'Master the art of presenting Phase III trial data, survival rates, and comparative effectiveness studies to evidence-minded physicians.',
    image: 'https://images.unsplash.com/photo-1576091160550-2173dba999ef?w=600&q=80'
  },
  {
    title: 'Objection Handling',
    description: 'Practice responding to common physician objections about formulary status, side effect profiles, and cost considerations.',
    image: 'https://images.unsplash.com/photo-1582750433449-648ed127bb54?w=600&q=80'
  },
  {
    title: 'Time-Constrained Conversations',
    description: 'Learn to deliver your key messages effectively in 90-second hallway conversations with busy practitioners.',
    image: 'https://images.unsplash.com/photo-1579684385127-1ef15d508118?w=600&q=80'
  },
  {
    title: 'Gatekeeper Navigation',
    description: 'Develop strategies for building rapport with office staff and securing meaningful time with prescribers.',
    image: 'https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?w=600&q=80'
  },
  {
    title: 'Academic Detailing',
    description: 'Prepare for conversations with KOLs and academic physicians who demand rigorous scientific discussion.',
    image: 'https://images.unsplash.com/photo-1559757175-5700dde675bc?w=600&q=80'
  },
  {
    title: 'Competitive Positioning',
    description: 'Practice differentiating your products against established competitors with specific clinical advantages.',
    image: 'https://images.unsplash.com/photo-1573497019940-1c28c88b4f3e?w=600&q=80'
  }
];

export const TrainingProgramsSection = () => {
  return (
    <section id="training" className="py-20 lg:py-28 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <AnimatedSection className="text-center mb-16">
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-[#1B4D7A] mb-4">
            <span className="relative inline-block">
              AI-Powered Training
              <span className="absolute bottom-0 left-0 w-full h-1 bg-[#E67E22]"></span>
            </span>{' '}
            Programs
          </h2>
          <p className="text-lg text-gray-600 max-w-3xl mx-auto">
            Our comprehensive training simulations cover the full spectrum of pharmaceutical sales challenges, 
            from initial introductions to complex clinical discussions.
          </p>
        </AnimatedSection>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {trainingPrograms.map((program, i) => (
            <AnimatedSection key={program.title} delay={i * 100}>
              <div className="bg-white rounded-lg overflow-hidden shadow-lg hover:shadow-xl transition-shadow group">
                <div className="relative h-48 overflow-hidden">
                  <img 
                    src={program.image}
                    alt={program.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#1B4D7A]/60 to-transparent"></div>
                </div>
                <div className="p-6">
                  <h3 className="text-xl font-bold text-[#1B4D7A] mb-3">{program.title}</h3>
                  <p className="text-gray-600 leading-relaxed">{program.description}</p>
                </div>
              </div>
            </AnimatedSection>
          ))}
        </div>
      </div>
    </section>
  );
};

export default TrainingProgramsSection;
