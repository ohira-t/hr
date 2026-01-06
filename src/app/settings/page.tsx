'use client';

import { useState } from 'react';
import { Header } from '@/components/layout/header';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { 
  Target, 
  Save, 
  RefreshCcw,
  HandHeart,
  Home,
  HeartPulse,
  CheckCircle2
} from 'lucide-react';
import { cn } from '@/lib/utils';
import type { Category, Segment } from '@/types/database';

interface TargetSetting {
  category: Category;
  segment: Segment;
  target: number;
}

const initialTargets: TargetSetting[] = [
  { category: '就労', segment: '新規', target: 10 },
  { category: '就労', segment: '既存', target: 15 },
  { category: 'GH', segment: '新規', target: 8 },
  { category: 'GH', segment: '既存', target: 12 },
  { category: '看護', segment: '新規', target: 5 },
  { category: '看護', segment: '既存', target: 8 },
];

const categoryConfig: Record<string, { icon: typeof HandHeart; color: string; bg: string }> = {
  '就労': { icon: HandHeart, color: 'text-emerald-600', bg: 'bg-emerald-50' },
  'GH': { icon: Home, color: 'text-blue-600', bg: 'bg-blue-50' },
  '看護': { icon: HeartPulse, color: 'text-purple-600', bg: 'bg-purple-50' },
};

export default function SettingsPage() {
  const [targets, setTargets] = useState<TargetSetting[]>(initialTargets);
  const [saved, setSaved] = useState(false);

  const handleTargetChange = (category: Category, segment: Segment, value: number) => {
    setTargets(prev => 
      prev.map(t => 
        t.category === category && t.segment === segment 
          ? { ...t, target: value }
          : t
      )
    );
    setSaved(false);
  };

  const handleSave = () => {
    // ここで実際にはAPIに保存する処理を行う
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const handleReset = () => {
    setTargets(initialTargets);
    setSaved(false);
  };

  const categories: Category[] = ['就労', 'GH', '看護'];

  return (
    <>
      <Header 
        title="設定" 
        subtitle="採用目標数値の設定"
      />
      
      <div className="p-8 max-w-4xl">
        {/* Target Settings */}
        <Card className="border-0 card-shadow">
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600">
                <Target className="h-5 w-5 text-white" />
              </div>
              <div>
                <CardTitle className="text-sm font-semibold">採用目標設定</CardTitle>
                <CardDescription>
                  業態・セグメント別の採用目標人数を設定します
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            {categories.map((category) => {
              const config = categoryConfig[category];
              const Icon = config.icon;
              const categoryTargets = targets.filter(t => t.category === category);

              return (
                <div key={category} className="space-y-4">
                  <div className="flex items-center gap-2">
                    <div className={cn('rounded-lg p-1.5', config.bg)}>
                      <Icon className={cn('h-4 w-4', config.color)} />
                    </div>
                    <span className="font-medium text-gray-900">
                      {category === '就労' ? '就労継続支援' : 
                       category === 'GH' ? 'グループホーム' : '訪問看護'}
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-4 pl-8">
                    {categoryTargets.map((target) => (
                      <div 
                        key={`${target.category}-${target.segment}`}
                        className="flex items-center justify-between rounded-xl bg-gray-50 p-4"
                      >
                        <div className="flex items-center gap-2">
                          <Badge 
                            variant="outline" 
                            className={cn(
                              'text-xs',
                              target.segment === '新規' 
                                ? 'border-amber-200 bg-amber-50 text-amber-700'
                                : 'border-slate-200 bg-slate-50 text-slate-600'
                            )}
                          >
                            {target.segment}
                          </Badge>
                          <span className="text-sm text-gray-600">案件</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <input
                            type="number"
                            min="0"
                            value={target.target}
                            onChange={(e) => handleTargetChange(
                              target.category,
                              target.segment,
                              parseInt(e.target.value) || 0
                            )}
                            className="w-16 rounded-lg border border-gray-200 bg-white px-3 py-1.5 text-center text-sm font-medium text-gray-900 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                          />
                          <span className="text-sm text-gray-500">名</span>
                        </div>
                      </div>
                    ))}
                  </div>

                  {category !== '看護' && <Separator className="mt-6" />}
                </div>
              );
            })}

            {/* Summary */}
            <div className="rounded-xl bg-gradient-to-br from-gray-50 to-gray-100 p-4 mt-6">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-gray-600">合計目標採用数</span>
                <span className="text-2xl font-bold text-gray-900">
                  {targets.reduce((sum, t) => sum + t.target, 0)}名
                </span>
              </div>
            </div>

            {/* Actions */}
            <div className="flex items-center justify-between pt-4">
              <Button
                variant="ghost"
                onClick={handleReset}
                className="gap-2 text-gray-500 hover:text-gray-900"
              >
                <RefreshCcw className="h-4 w-4" />
                デフォルトに戻す
              </Button>
              <Button
                onClick={handleSave}
                className={cn(
                  'gap-2 transition-all',
                  saved 
                    ? 'bg-emerald-600 hover:bg-emerald-700' 
                    : 'bg-gray-900 hover:bg-gray-800'
                )}
              >
                {saved ? (
                  <>
                    <CheckCircle2 className="h-4 w-4" />
                    保存しました
                  </>
                ) : (
                  <>
                    <Save className="h-4 w-4" />
                    設定を保存
                  </>
                )}
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* App Info */}
        <div className="mt-8 text-center">
          <p className="text-sm text-gray-400">
            採用管理システム v1.0.0 · HR部
          </p>
        </div>
      </div>
    </>
  );
}

