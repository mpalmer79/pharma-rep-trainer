'use client';

import { useState } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { Home, Star, Quote, Building2, GraduationCap, TrendingUp, Users, Award, ChevronDown } from 'lucide-react';

// Testimonial data with realistic pharma companies, employees, and course mentions
const testimonials = [
  {
    id: 1,
    name: 'Sarah Mitchell',
    title: 'Senior Sales Representative',
    company: 'Novagen Therapeutics',
    location: 'Boston, MA',
    avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&h=150&fit=crop&crop=face',
    rating: 5,
    course: 'Physician Objection Mastery',
    scenario: 'Cardiology Sales Call Simulation',
    quote: "RepIQ transformed our onboarding process completely. As a new hire, the 'Physician Objection Mastery' course helped me handle Dr. Torres-type skeptics in my first week. I closed my first cardiologist account within 30 days—something that typically takes 3 months at Novagen.",
    stats: { timeToFirstSale: '30 days', confidenceIncrease: '85%' },
    date: 'November 2024'
  },
  {
    id: 2,
    name: 'Michael Chen',
    title: 'District Sales Manager',
    company: 'Meridian BioSciences',
    location: 'San Francisco, CA',
    avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face',
    rating: 5,
    course: 'Time-Pressed Physician Strategies',
    scenario: 'Oncology Specialist Detailing',
    quote: "We've reduced new rep ramp-up time by 45% since implementing RepIQ. The 'Time-Pressed Physician Strategies' module is gold—our oncology team specifically requested more scenarios after seeing results. ROI was evident within the first quarter.",
    stats: { rampTimeReduction: '45%', teamAdoption: '100%' },
    date: 'October 2024'
  },
  {
    id: 3,
    name: 'Jennifer Rodriguez',
    title: 'Training & Development Director',
    company: 'Ascendant Pharmaceuticals',
    location: 'Chicago, IL',
    avatar: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=150&h=150&fit=crop&crop=face',
    rating: 5,
    course: 'Gatekeeper Navigation Tactics',
    scenario: 'Office Manager Challenge',
    quote: "The 'Gatekeeper Navigation Tactics' course solved our biggest onboarding challenge. New hires used to struggle getting past front desk staff. Now they practice with Monica Reynolds scenarios and walk into offices with confidence. Our access rates improved 62%.",
    stats: { accessRateImprovement: '62%', onboardingSuccess: '94%' },
    date: 'December 2024'
  },
  {
    id: 4,
    name: 'David Thompson',
    title: 'National Sales Director',
    company: 'Vertex Life Sciences',
    location: 'New York, NY',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face',
    rating: 5,
    course: 'Competitive Differentiation Workshop',
    scenario: 'Competitor Loyalist Conversion',
    quote: "RepIQ's 'Competitive Differentiation Workshop' gave our team the edge we needed. The Dr. Williams loyalist persona is incredibly realistic—our reps now convert competitor-loyal physicians at 3x our previous rate. This platform is non-negotiable for our training stack.",
    stats: { conversionRateIncrease: '3x', marketShareGain: '12%' },
    date: 'September 2024'
  },
  {
    id: 5,
    name: 'Amanda Foster',
    title: 'Associate Sales Representative',
    company: 'BioNexus Therapeutics',
    location: 'Houston, TX',
    avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&h=150&fit=crop&crop=face',
    rating: 5,
    course: 'Clinical Data Presentation',
    scenario: 'Evidence-Based Selling Simulation',
    quote: "As someone fresh out of training, the 'Clinical Data Presentation' course was a lifesaver. I practiced presenting EMPEROR trial data until it felt natural. My manager said my first live presentation was better than reps with 5 years experience. RepIQ made that possible.",
    stats: { presentationScore: '95/100', managerRating: 'Exceeds Expectations' },
    date: 'November 2024'
  },
  {
    id: 6,
    name: 'Robert Kim',
    title: 'Regional Sales Manager',
    company: 'Catalyst Pharmaceuticals Inc.',
    location: 'Seattle, WA',
    avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&h=150&fit=crop&crop=face',
    rating: 5,
    course: 'Neurology Specialist Engagement',
    scenario: 'Migraine Treatment Discussion',
    quote: "The neurology-specific modules are exceptional. Our NeuroZen launch team completed 'Neurology Specialist Engagement' before going to market. First-month prescription volume exceeded projections by 40%. The AI physician responses are eerily accurate.",
    stats: { launchExceedance: '40%', teamReadiness: '100%' },
    date: 'October 2024'
  },
  {
    id: 7,
    name: 'Lisa Patel',
    title: 'Senior Training Specialist',
    company: 'Helios Medical Solutions',
    location: 'Philadelphia, PA',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&h=150&fit=crop&crop=face',
    rating: 5,
    course: 'Compliance-First Selling',
    scenario: 'Regulatory Boundary Training',
    quote: "Compliance is everything in pharma. RepIQ's 'Compliance-First Selling' module trains reps to stay within FDA guidelines while still being effective. We've had zero compliance incidents since adopting the platform. Our legal team actually recommends it now.",
    stats: { complianceIncidents: '0', legalApproval: 'Yes' },
    date: 'August 2024'
  },
  {
    id: 8,
    name: 'James Wilson',
    title: 'Territory Manager',
    company: 'Paragon Biopharmaceuticals',
    location: 'Denver, CO',
    avatar: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=150&h=150&fit=crop&crop=face',
    rating: 5,
    course: 'Cardiovascular Sales Excellence',
    scenario: 'Heart Failure Specialist Call',
    quote: "I've been in pharma sales for 12 years, and RepIQ's 'Cardiovascular Sales Excellence' course taught me techniques I wish I'd learned a decade ago. The CardioMax scenarios helped me finally crack Dr. Harrison's practice—a white whale I'd been chasing for 3 years.",
    stats: { accountsWon: '8 new', experienceLevel: '12 years' },
    date: 'December 2024'
  },
  {
    id: 9,
    name: 'Emily Nakamura',
    title: 'Sales Excellence Lead',
    company: 'Seren Therapeutics',
    location: 'Los Angeles, CA',
    avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&h=150&fit=crop&crop=face',
    rating: 5,
    course: 'Advanced Objection Handling',
    scenario: 'Data-Driven Skeptic Engagement',
    quote: "We rolled out 'Advanced Objection Handling' to our entire West Coast team. The Dr. Torres skeptic persona is perfect for preparing reps to face academic physicians. Territory performance improved 28% within 60 days. Our CEO mentioned RepIQ in the earnings call.",
    stats: { performanceImprovement: '28%', executiveRecognition: 'Yes' },
    date: 'November 2024'
  },
  {
    id: 10,
    name: 'Christopher Brown',
    title: 'New Hire Sales Representative',
    company: 'Lumina Biotech',
    location: 'Atlanta, GA',
    avatar: 'https://images.unsplash.com/photo-1463453091185-61582044d556?w=150&h=150&fit=crop&crop=face',
    rating: 5,
    course: 'First 90 Days Accelerator',
    scenario: 'New Territory Launch Simulation',
    quote: "Started at Lumina with zero pharma experience. The 'First 90 Days Accelerator' course in RepIQ was my secret weapon. I practiced 50+ scenarios before my first real call. Finished Q1 at 115% of quota—the only new hire to hit target. My manager thinks I'm a natural, but it's all RepIQ.",
    stats: { quotaAttainment: '115%', practiceScenarios: '50+' },
    date: 'January 2025'
  },
  {
    id: 11,
    name: 'Rachel Martinez',
    title: 'Associate Director, Commercial Training',
    company: 'Zenith Pharmaceuticals',
    location: 'Miami, FL',
    avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&h=150&fit=crop&crop=face',
    rating: 5,
    course: 'Manager Coaching Certification',
    scenario: 'Rep Development Workshop',
    quote: "As someone who trains trainers, I'm picky about platforms. RepIQ's 'Manager Coaching Certification' gave our field managers a common language for feedback. Coaching quality scores jumped from 3.2 to 4.6 out of 5. The real-time AI feedback is a game-changer for development conversations.",
    stats: { coachingScoreIncrease: '3.2 → 4.6', managerSatisfaction: '97%' },
    date: 'October 2024'
  },
  {
    id: 12,
    name: 'Daniel O\'Brien',
    title: 'Senior Sales Consultant',
    company: 'Prism Health Sciences',
    location: 'Minneapolis, MN',
    avatar: 'https://images.unsplash.com/photo-1560250097-0b93528c311a?w=150&h=150&fit=crop&crop=face',
    rating: 5,
    course: 'Hospital System Selling',
    scenario: 'P&T Committee Presentation',
    quote: "Getting on hospital formularies is brutal. RepIQ's 'Hospital System Selling' course includes P&T committee simulations that are incredibly realistic. I practiced my presentation 20 times with the AI panel before the real thing. We got formulary approval at 3 major health systems this quarter.",
    stats: { formularyApprovals: '3', preparationTime: '20 sessions' },
    date: 'December 2024'
  },
  {
    id: 13,
    name: 'Victoria Chang',
    title: 'Field Sales Representative',
    company: 'Aurora Therapeutics',
    location: 'Portland, OR',
    avatar: 'https://images.unsplash.com/photo-1598550874175-4d0ef436c909?w=150&h=150&fit=crop&crop=face',
    rating: 5,
    course: 'Virtual Detailing Mastery',
    scenario: 'Telehealth Era Selling',
    quote: "Post-COVID selling is different. The 'Virtual Detailing Mastery' course helped me adapt to hybrid physician interactions. I learned to read digital body language and optimize my home office setup. My virtual call success rate went from 40% to 78%. Essential training for modern pharma.",
    stats: { virtualSuccessRate: '40% → 78%', adaptationSpeed: '2 weeks' },
    date: 'September 2024'
  },
  {
    id: 14,
    name: 'Marcus Johnson',
    title: 'Specialty Sales Manager',
    company: 'Elevate Biosciences',
    location: 'Dallas, TX',
    avatar: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=150&h=150&fit=crop&crop=face',
    rating: 5,
    course: 'Specialty Pharmacy Navigation',
    scenario: 'Complex Distribution Challenge',
    quote: "Specialty pharma has unique challenges. RepIQ's 'Specialty Pharmacy Navigation' course addresses hub services, prior authorizations, and patient support programs. My team's prescription-to-fill rate improved 35% because reps now proactively address access barriers during the sales conversation.",
    stats: { fillRateImprovement: '35%', accessBarrierResolution: '89%' },
    date: 'November 2024'
  },
  {
    id: 15,
    name: 'Katherine Sullivan',
    title: 'VP of Sales Operations',
    company: 'Nextera Pharma Group',
    location: 'Boston, MA',
    avatar: 'https://images.unsplash.com/photo-1551836022-deb4988cc6c0?w=150&h=150&fit=crop&crop=face',
    rating: 5,
    course: 'Enterprise Training Program',
    scenario: 'Full Onboarding Curriculum',
    quote: "We replaced our entire legacy training system with RepIQ. The 'Enterprise Training Program' reduced our onboarding costs by $2.3M annually while improving new hire performance. First-year rep retention increased from 68% to 89%. The analytics dashboard gives us unprecedented visibility into skill gaps.",
    stats: { costSavings: '$2.3M', retentionImprovement: '68% → 89%' },
    date: 'August 2024'
  },
  {
    id: 16,
    name: 'Andrew Park',
    title: 'Medical Science Liaison',
    company: 'Kinetic Therapeutics',
    location: 'San Diego, CA',
    avatar: 'https://images.unsplash.com/photo-1556157382-97edd2f9e5ee?w=150&h=150&fit=crop&crop=face',
    rating: 5,
    course: 'KOL Engagement Excellence',
    scenario: 'Thought Leader Discussion',
    quote: "Even as an MSL, RepIQ adds value. The 'KOL Engagement Excellence' course helped me prepare for advisory board interactions. The AI simulates challenging questions from key opinion leaders. I've since been promoted to Senior MSL, and my advisory boards are consistently rated 'highly valuable' by attendees.",
    stats: { advisoryBoardRating: 'Highly Valuable', promotionAchieved: 'Yes' },
    date: 'October 2024'
  },
  {
    id: 17,
    name: 'Nicole Torres',
    title: 'Sales Training Coordinator',
    company: 'Vanguard Medical',
    location: 'Phoenix, AZ',
    avatar: 'https://images.unsplash.com/photo-1587614382346-4ec70e388b28?w=150&h=150&fit=crop&crop=face',
    rating: 5,
    course: 'Train-the-Trainer Certification',
    scenario: 'Peer Coaching Development',
    quote: "The 'Train-the-Trainer Certification' empowered me to build internal champions across our organization. We now have 15 certified RepIQ trainers who run regional workshops. Training consistency improved dramatically, and our quarterly assessments show 94% material retention vs. 67% with our old program.",
    stats: { certifiedTrainers: '15', materialRetention: '94%' },
    date: 'November 2024'
  },
  {
    id: 18,
    name: 'Steven Wright',
    title: 'Primary Care Sales Representative',
    company: 'Clearview Pharmaceuticals',
    location: 'Nashville, TN',
    avatar: 'https://images.unsplash.com/photo-1507591064344-4c6ce005b128?w=150&h=150&fit=crop&crop=face',
    rating: 5,
    course: 'High-Volume Territory Management',
    scenario: 'Primary Care Blitz Strategy',
    quote: "Primary care territories are massive. RepIQ's 'High-Volume Territory Management' taught me to maximize impact with limited time. The 90-second Dr. Chen scenarios are perfect practice for busy PCPs. I now see 12 physicians daily instead of 8, without sacrificing quality. Promoted to Senior Rep in 18 months.",
    stats: { dailyCallsIncrease: '8 → 12', promotionTimeline: '18 months' },
    date: 'December 2024'
  },
  {
    id: 19,
    name: 'Olivia Richardson',
    title: 'Oncology Sales Specialist',
    company: 'Onyx Therapeutics',
    location: 'Raleigh, NC',
    avatar: 'https://images.unsplash.com/photo-1594744803329-e58b31de8bf5?w=150&h=150&fit=crop&crop=face',
    rating: 5,
    course: 'Oncology Product Launch Readiness',
    scenario: 'Tumor Board Integration',
    quote: "Launching an oncology product is high-stakes. RepIQ's 'Oncology Product Launch Readiness' course prepared our team for the most demanding specialists. The tumor board simulation was so realistic that the actual launch felt like a practice run. We hit 150% of launch targets.",
    stats: { launchTargetAchievement: '150%', teamConfidence: '98%' },
    date: 'January 2025'
  },
  {
    id: 20,
    name: 'Brian Hoffman',
    title: 'Director of Field Force Excellence',
    company: 'Sterling Biopharmaceuticals',
    location: 'Chicago, IL',
    avatar: 'https://images.unsplash.com/photo-1600486913747-55e5470d6f40?w=150&h=150&fit=crop&crop=face',
    rating: 5,
    course: 'Full Platform Implementation',
    scenario: 'Enterprise-Wide Deployment',
    quote: "We evaluated 7 training platforms before choosing RepIQ. The decision was unanimous after the pilot. Twelve months later, our field force NPS increased from 32 to 71, turnover dropped 23%, and we've promoted 40% more internal candidates. RepIQ isn't just training—it's a competitive advantage.",
    stats: { npsIncrease: '32 → 71', internalPromotions: '+40%' },
    date: 'January 2025'
  }
];

// Stats for the header
const overallStats = [
  { label: 'Companies Using RepIQ', value: '150+', icon: Building2 },
  { label: 'Reps Trained', value: '12,000+', icon: Users },
  { label: 'Average Rating', value: '4.9/5', icon: Star },
  { label: 'Training Hours Completed', value: '500K+', icon: GraduationCap },
];

export default function TestimonialsPage() {
  const [visibleCount, setVisibleCount] = useState(6);

  const loadMore = () => {
    setVisibleCount(prev => Math.min(prev + 6, testimonials.length));
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Fixed Header */}
      <header className="fixed top-0 w-full z-50 bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16 lg:h-20">
            {/* Logo */}
            <Link href="/" className="flex items-center gap-2">
              <div className="w-8 h-8 sm:w-10 sm:h-10 rounded bg-gradient-to-br from-[#1B4D7A] to-[#2D6A9F] flex items-center justify-center">
                <span className="text-white font-bold text-sm sm:text-lg">R</span>
              </div>
              <span className="text-lg sm:text-xl font-bold text-[#1B4D7A]">RepIQ</span>
            </Link>

            {/* Home Button */}
            <Link 
              href="/"
              className="flex items-center gap-2 px-6 py-2.5 bg-[#E67E22] hover:bg-[#D35400] text-white font-semibold rounded-lg transition-colors"
            >
              <Home className="w-5 h-5" />
              <span>Home</span>
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="pt-24 lg:pt-32 pb-16 bg-gradient-to-b from-gray-50 to-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center max-w-4xl mx-auto"
          >
            <span className="inline-block px-4 py-1.5 bg-[#E67E22]/10 text-[#E67E22] rounded-full text-sm font-semibold mb-4">
              Customer Success Stories
            </span>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-gray-900 mb-6">
              Trusted by Leading{' '}
              <span className="text-[#1B4D7A]">Pharmaceutical Companies</span>
            </h1>
            <p className="text-xl text-gray-600 mb-8">
              See how sales teams across the industry are transforming their training with RepIQ's 
              AI-powered physician simulations and accelerating time-to-productivity.
            </p>
          </motion.div>

          {/* Stats Banner */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-12"
          >
            {overallStats.map((stat, index) => (
              <div 
                key={index}
                className="bg-white rounded-xl p-6 shadow-lg border border-gray-100 text-center"
              >
                <stat.icon className="w-8 h-8 text-[#E67E22] mx-auto mb-3" />
                <div className="text-3xl font-bold text-[#1B4D7A]">{stat.value}</div>
                <div className="text-sm text-gray-600 mt-1">{stat.label}</div>
              </div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Testimonials Grid */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {testimonials.slice(0, visibleCount).map((testimonial, index) => (
              <motion.div
                key={testimonial.id}
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden hover:shadow-xl transition-shadow"
              >
                {/* Header with Avatar and Info */}
                <div className="p-6 pb-4">
                  <div className="flex items-start gap-4">
                    <img 
                      src={testimonial.avatar} 
                      alt={testimonial.name}
                      className="w-16 h-16 rounded-full object-cover border-2 border-[#E67E22]/20"
                    />
                    <div className="flex-1">
                      <h3 className="font-bold text-gray-900">{testimonial.name}</h3>
                      <p className="text-sm text-[#1B4D7A] font-medium">{testimonial.title}</p>
                      <p className="text-sm text-gray-500">{testimonial.company}</p>
                      <p className="text-xs text-gray-400">{testimonial.location}</p>
                    </div>
                  </div>

                  {/* Rating */}
                  <div className="flex items-center gap-1 mt-3">
                    {[...Array(testimonial.rating)].map((_, i) => (
                      <Star key={i} className="w-4 h-4 fill-[#E67E22] text-[#E67E22]" />
                    ))}
                    <span className="text-sm text-gray-500 ml-2">{testimonial.date}</span>
                  </div>
                </div>

                {/* Course & Scenario Tags */}
                <div className="px-6 pb-3">
                  <div className="flex flex-wrap gap-2">
                    <span className="inline-flex items-center gap-1 px-3 py-1 bg-[#1B4D7A]/10 text-[#1B4D7A] rounded-full text-xs font-medium">
                      <GraduationCap className="w-3 h-3" />
                      {testimonial.course}
                    </span>
                    <span className="inline-flex items-center gap-1 px-3 py-1 bg-[#E67E22]/10 text-[#E67E22] rounded-full text-xs font-medium">
                      <TrendingUp className="w-3 h-3" />
                      {testimonial.scenario}
                    </span>
                  </div>
                </div>

                {/* Quote */}
                <div className="px-6 pb-4">
                  <div className="relative">
                    <Quote className="w-8 h-8 text-[#E67E22]/20 absolute -top-2 -left-1" />
                    <p className="text-gray-700 text-sm leading-relaxed pl-6">
                      "{testimonial.quote}"
                    </p>
                  </div>
                </div>

                {/* Stats */}
                <div className="px-6 pb-6">
                  <div className="bg-gray-50 rounded-lg p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <Award className="w-4 h-4 text-[#E67E22]" />
                      <span className="text-xs font-semibold text-gray-700 uppercase tracking-wide">Results Achieved</span>
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      {Object.entries(testimonial.stats).map(([key, value]) => (
                        <div key={key}>
                          <div className="text-lg font-bold text-[#1B4D7A]">{value}</div>
                          <div className="text-xs text-gray-500 capitalize">
                            {key.replace(/([A-Z])/g, ' $1').trim()}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>

          {/* Load More Button */}
          {visibleCount < testimonials.length && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-center mt-12"
            >
              <button
                onClick={loadMore}
                className="inline-flex items-center gap-2 px-8 py-4 bg-[#1B4D7A] hover:bg-[#0F2D44] text-white font-semibold rounded-xl transition-colors"
              >
                <span>Load More Success Stories</span>
                <ChevronDown className="w-5 h-5" />
              </button>
              <p className="text-sm text-gray-500 mt-3">
                Showing {visibleCount} of {testimonials.length} testimonials
              </p>
            </motion.div>
          )}
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-br from-[#1B4D7A] to-[#2D6A9F]">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
              Ready to Transform Your Sales Training?
            </h2>
            <p className="text-xl text-white/80 mb-8">
              Join 150+ pharmaceutical companies already using RepIQ to accelerate rep performance.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link 
                href="/"
                className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-[#E67E22] hover:bg-[#D35400] text-white font-semibold rounded-xl transition-colors"
              >
                <Home className="w-5 h-5" />
                Try the Demo
              </Link>
              <Link 
                href="/"
                className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-white/10 hover:bg-white/20 text-white font-semibold rounded-xl border-2 border-white/30 transition-colors"
              >
                Request Enterprise Demo
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 bg-white border-t border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded bg-gradient-to-br from-[#1B4D7A] to-[#2D6A9F] flex items-center justify-center">
                <span className="text-white font-bold text-sm">R</span>
              </div>
              <span className="text-lg font-bold text-[#1B4D7A]">RepIQ</span>
            </div>
            <p className="text-sm text-gray-500">
              © 2025 RepIQ. AI-Powered Pharmaceutical Sales Training.
            </p>
            <Link 
              href="/"
              className="inline-flex items-center gap-2 text-[#E67E22] hover:text-[#D35400] font-medium"
            >
              <Home className="w-4 h-4" />
              Back to Home
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
