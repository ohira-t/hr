'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { TrendingUp } from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts';

interface ChartData {
  category: string;
  新規: number;
  既存: number;
}

interface HiringChartProps {
  data: ChartData[];
}

export function HiringChart({ data }: HiringChartProps) {
  return (
    <Card className="border-0 card-shadow opacity-0 animate-fade-in stagger-3">
      <CardHeader className="pb-2">
        <div className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-indigo-50">
            <TrendingUp className="h-4 w-4 text-indigo-500" />
          </div>
          <div>
            <CardTitle className="text-base font-semibold text-gray-900">
              採用進捗状況
            </CardTitle>
            <p className="text-xs text-gray-500">業態別・セグメント別の採用数</p>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="h-[280px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={data}
              margin={{ top: 20, right: 30, left: 0, bottom: 5 }}
            >
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
              <XAxis 
                dataKey="category" 
                axisLine={false}
                tickLine={false}
                tick={{ fontSize: 12, fill: '#6b7280' }}
              />
              <YAxis 
                axisLine={false}
                tickLine={false}
                tick={{ fontSize: 12, fill: '#6b7280' }}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: 'rgba(255, 255, 255, 0.96)',
                  border: 'none',
                  borderRadius: '12px',
                  boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
                  padding: '12px 16px',
                }}
                labelStyle={{ fontWeight: 600, marginBottom: '8px' }}
              />
              <Legend 
                wrapperStyle={{ paddingTop: '16px' }}
                formatter={(value) => <span style={{ color: '#6b7280', fontSize: '12px' }}>{value}</span>}
              />
              <Bar 
                dataKey="新規" 
                fill="#f59e0b" 
                radius={[4, 4, 0, 0]}
                maxBarSize={40}
              />
              <Bar 
                dataKey="既存" 
                fill="#6366f1" 
                radius={[4, 4, 0, 0]}
                maxBarSize={40}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}

