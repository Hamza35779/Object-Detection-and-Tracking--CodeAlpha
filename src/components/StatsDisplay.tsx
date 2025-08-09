import React from 'react';
import { Activity, Target, Clock, BarChart3 } from 'lucide-react';
import { DetectionStats } from '../types/detection';

interface StatsDisplayProps {
  stats: DetectionStats;
}

export function StatsDisplay({ stats }: StatsDisplayProps) {
  const statItems = [
    {
      label: 'FPS',
      value: stats.fps.toFixed(1),
      icon: Activity,
      color: 'text-green-400',
      bg: 'bg-green-500/20 border-green-500/30'
    },
    {
      label: 'Objects',
      value: stats.objectCount.toString(),
      icon: Target,
      color: 'text-blue-400',
      bg: 'bg-blue-500/20 border-blue-500/30'
    },
    {
      label: 'Processing',
      value: `${stats.processingTime.toFixed(1)}ms`,
      icon: Clock,
      color: 'text-orange-400',
      bg: 'bg-orange-500/20 border-orange-500/30'
    },
    {
      label: 'Total',
      value: stats.totalDetections.toString(),
      icon: BarChart3,
      color: 'text-purple-400',
      bg: 'bg-purple-500/20 border-purple-500/30'
    }
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      {statItems.map(({ label, value, icon: Icon, color, bg }) => (
        <div
          key={label}
          className={`p-4 rounded-xl border backdrop-blur-sm ${bg} transition-all hover:scale-105`}
        >
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-gray-400">{label}</span>
            <Icon className={`w-4 h-4 ${color}`} />
          </div>
          <div className={`text-2xl font-bold ${color}`}>{value}</div>
        </div>
      ))}
    </div>
  );
}