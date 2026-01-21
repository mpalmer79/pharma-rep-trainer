'use client';

import React from 'react';
import {
  RadarChart as RechartsRadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
  ResponsiveContainer,
  Tooltip,
} from 'recharts';

interface ScoreBreakdown {
  opening: number;
  clinicalKnowledge: number;
  objectionHandling: number;
  timeManagement: number;
  compliance: number;
  closing: number;
}

interface RadarChartProps {
  scores: ScoreBreakdown;
  className?: string;
}

const scoreLabels: Record<keyof ScoreBreakdown, string> = {
  opening: 'Opening',
  clinicalKnowledge: 'Clinical Knowledge',
  objectionHandling: 'Objection Handling',
  timeManagement: 'Time Management',
  compliance: 'Compliance',
  closing: 'Closing',
};

export const RadarChart: React.FC<RadarChartProps> = ({ scores, className = '' }) => {
  const data = Object.entries(scores).map(([key, value]) => ({
    subject: scoreLabels[key as keyof ScoreBreakdown],
    score: value,
    fullMark: 100,
  }));

  const getScoreColor = (avgScore: number) => {
    if (avgScore >= 80) return '#10b981'; // emerald-500
    if (avgScore >= 60) return '#f59e0b'; // amber-500
    return '#ef4444'; // red-500
  };

  const avgScore = Object.values(scores).reduce((a, b) => a + b, 0) / Object.values(scores).length;
  const scoreColor = getScoreColor(avgScore);

  return (
    <div className={`w-full ${className}`}>
      <ResponsiveContainer width="100%" height={300}>
        <RechartsRadarChart cx="50%" cy="50%" outerRadius="80%" data={data}>
          <PolarGrid stroke="#334155" />
          <PolarAngleAxis
            dataKey="subject"
            tick={{ fill: '#94a3b8', fontSize: 11 }}
            tickLine={false}
          />
          <PolarRadiusAxis
            angle={30}
            domain={[0, 100]}
            tick={{ fill: '#64748b', fontSize: 10 }}
            tickCount={5}
            axisLine={false}
          />
          <Tooltip
            contentStyle={{
              backgroundColor: '#1e293b',
              border: '1px solid #334155',
              borderRadius: '8px',
              color: '#f1f5f9',
            }}
            formatter={(value: number) => [`${value}`, 'Score']}
          />
          <Radar
            name="Score"
            dataKey="score"
            stroke={scoreColor}
            fill={scoreColor}
            fillOpacity={0.3}
            strokeWidth={2}
          />
        </RechartsRadarChart>
      </ResponsiveContainer>
    </div>
  );
};

export default RadarChart;
