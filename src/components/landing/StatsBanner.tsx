
'use client';

const stats = [
  { number: '170%', label: 'Training Retention Boost' },
  { number: '55%', label: 'Coaching Effectiveness' },
  { number: '847', label: 'Reps Trained in 2025' },
  { number: '98%', label: 'User Satisfaction' }
];

export const StatsBanner = () => {
  return (
    <section className="py-16 bg-[#1B4D7A]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-8 text-center">
          {stats.map((stat) => (
            <div key={stat.label}>
              <p className="text-4xl sm:text-5xl font-bold text-white mb-2">{stat.number}</p>
              <p className="text-blue-200 text-sm sm:text-base">{stat.label}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default StatsBanner;
