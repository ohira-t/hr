'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ChevronLeft, Save, Building2, MapPin, Users, Briefcase, FileText, Newspaper } from 'lucide-react';
import { Header } from '@/components/layout/header';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { SelectNative } from '@/components/ui/select-native';
import { cn } from '@/lib/utils';
import { 
  CATEGORIES, 
  SEGMENTS, 
  PROJECT_STATUSES, 
  DEPARTMENTS, 
  POSITIONS, 
  EMPLOYMENT_TYPES,
  PREFECTURES,
  MEDIA_NAMES,
  MEDIA_STATUSES,
  type ProjectFormData,
  type MediaFormData,
} from '@/types/database';
import { getActiveAssignees } from '@/data/master-data';

const assignees = getActiveAssignees();

export default function NewProjectPage() {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // フォームデータ
  const [formData, setFormData] = useState<ProjectFormData>({
    hrId: '',
    segment: '新規',
    category: '就労',
    clientName: '',
    clientNameKana: '',
    clientId: '',
    applicationId: '',
    prefecture: '',
    city: '',
    facilityName: '',
    position: 'サビ管',
    employmentType: '正社員',
    targetHiringCount: 1,
    currentHiringCount: 0,
    status: '採用活動中',
    assignee: '',
    department: '推進部',
    handoverDate: '',
    deadlineDate: '',
    openingDate: '',
    hurdles: '',
    notes: '',
    nextAction: '',
  });

  // 媒体データ
  const [mediaData, setMediaData] = useState<MediaFormData[]>(
    MEDIA_NAMES.map(name => ({
      mediaName: name,
      status: '未掲載',
      startDate: '',
      endDate: '',
    }))
  );

  const handleChange = (field: keyof ProjectFormData, value: string | number) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleMediaChange = (index: number, field: keyof MediaFormData, value: string) => {
    setMediaData(prev => {
      const updated = [...prev];
      updated[index] = { ...updated[index], [field]: value };
      return updated;
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    // TODO: 実際のAPI呼び出し
    console.log('Form Data:', formData);
    console.log('Media Data:', mediaData);
    
    // モック: 保存完了後に一覧に戻る
    setTimeout(() => {
      router.push('/projects');
    }, 500);
  };

  return (
    <>
      <Header 
        title="新規案件登録" 
        subtitle="採用案件の情報を入力してください"
        showSearch={false}
        actions={
          <div className="flex items-center gap-2">
            <Link href="/projects">
              <Button variant="ghost" size="sm" className="h-9 gap-1.5 rounded-full">
                <ChevronLeft className="h-4 w-4" />
                戻る
              </Button>
            </Link>
            <Button 
              variant="primary"
              className="h-9 rounded-full pl-3.5 pr-5 gap-2"
              onClick={handleSubmit}
              disabled={isSubmitting}
            >
              <Save className="h-4 w-4" strokeWidth={2} />
              <span className="leading-none tracking-[-0.01em]">{isSubmitting ? '保存中...' : '保存'}</span>
            </Button>
          </div>
        }
      />
      
      <form onSubmit={handleSubmit} className="p-8 space-y-6 max-w-5xl mx-auto">
        {/* 案件情報 */}
        <Card className="card-shadow border-0">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-sm font-semibold">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gray-100">
                <FileText className="h-4 w-4 text-gray-600" />
              </div>
              案件情報
            </CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1.5">HR ID *</label>
              <Input
                value={formData.hrId}
                onChange={(e) => handleChange('hrId', e.target.value)}
                placeholder="T0000-00"
                className="h-10"
                required
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1.5">セグメント *</label>
              <SelectNative
                value={formData.segment}
                onChange={(e) => handleChange('segment', e.target.value)}
              >
                {SEGMENTS.map(seg => (
                  <option key={seg} value={seg}>{seg}</option>
                ))}
              </SelectNative>
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1.5">業態 *</label>
              <SelectNative
                value={formData.category}
                onChange={(e) => handleChange('category', e.target.value)}
              >
                {CATEGORIES.map(cat => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </SelectNative>
            </div>
          </CardContent>
        </Card>

        {/* クライアント情報 */}
        <Card className="card-shadow border-0">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-sm font-semibold">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-100">
                <Building2 className="h-4 w-4 text-blue-600" />
              </div>
              クライアント情報
            </CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1.5">クライアント名 *</label>
              <Input
                value={formData.clientName}
                onChange={(e) => handleChange('clientName', e.target.value)}
                placeholder="株式会社〇〇"
                className="h-10"
                required
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1.5">補足（カナ・状態等）</label>
              <Input
                value={formData.clientNameKana}
                onChange={(e) => handleChange('clientNameKana', e.target.value)}
                placeholder="マルマル"
                className="h-10"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1.5">クライアントID</label>
              <Input
                value={formData.clientId}
                onChange={(e) => handleChange('clientId', e.target.value)}
                placeholder="CL-0000"
                className="h-10"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1.5">申請ID</label>
              <Input
                value={formData.applicationId}
                onChange={(e) => handleChange('applicationId', e.target.value)}
                placeholder="AP-2025-000"
                className="h-10"
              />
            </div>
          </CardContent>
        </Card>

        {/* 勤務地 */}
        <Card className="card-shadow border-0">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-sm font-semibold">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-100">
                <MapPin className="h-4 w-4 text-emerald-600" />
              </div>
              勤務地
            </CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1.5">都道府県 *</label>
              <SelectNative
                value={formData.prefecture}
                onChange={(e) => handleChange('prefecture', e.target.value)}
                required
              >
                <option value="">選択してください</option>
                {PREFECTURES.map(pref => (
                  <option key={pref} value={pref}>{pref}</option>
                ))}
              </SelectNative>
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1.5">市区町村</label>
              <Input
                value={formData.city}
                onChange={(e) => handleChange('city', e.target.value)}
                placeholder="〇〇市△△区"
                className="h-10"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1.5">事業所名</label>
              <Input
                value={formData.facilityName}
                onChange={(e) => handleChange('facilityName', e.target.value)}
                placeholder="〇〇支援センター"
                className="h-10"
              />
            </div>
          </CardContent>
        </Card>

        {/* 募集内容 */}
        <Card className="card-shadow border-0">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-sm font-semibold">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-purple-100">
                <Users className="h-4 w-4 text-purple-600" />
              </div>
              募集内容
            </CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-4 gap-4">
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1.5">募集職種 *</label>
              <SelectNative
                value={formData.position}
                onChange={(e) => handleChange('position', e.target.value)}
              >
                {POSITIONS.map(pos => (
                  <option key={pos} value={pos}>{pos}</option>
                ))}
              </SelectNative>
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1.5">勤務形態 *</label>
              <SelectNative
                value={formData.employmentType}
                onChange={(e) => handleChange('employmentType', e.target.value)}
              >
                {EMPLOYMENT_TYPES.map(type => (
                  <option key={type} value={type}>{type}</option>
                ))}
              </SelectNative>
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1.5">採用目標数</label>
              <Input
                type="number"
                min={0}
                value={formData.targetHiringCount}
                onChange={(e) => handleChange('targetHiringCount', parseInt(e.target.value) || 0)}
                className="h-10"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1.5">現在採用数</label>
              <Input
                type="number"
                min={0}
                value={formData.currentHiringCount}
                onChange={(e) => handleChange('currentHiringCount', parseInt(e.target.value) || 0)}
                className="h-10"
              />
            </div>
          </CardContent>
        </Card>

        {/* 社内管理 */}
        <Card className="card-shadow border-0">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-sm font-semibold">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-amber-100">
                <Briefcase className="h-4 w-4 text-amber-600" />
              </div>
              社内管理
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-4 gap-4">
              <div>
                <label className="block text-xs font-medium text-gray-500 mb-1.5">ステータス *</label>
                <SelectNative
                  value={formData.status}
                  onChange={(e) => handleChange('status', e.target.value)}
                >
                  {PROJECT_STATUSES.map(status => (
                    <option key={status} value={status}>{status}</option>
                  ))}
                </SelectNative>
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-500 mb-1.5">担当者 *</label>
                <SelectNative
                  value={formData.assignee}
                  onChange={(e) => handleChange('assignee', e.target.value)}
                  required
                >
                  <option value="">選択してください</option>
                  {assignees.map(name => (
                    <option key={name} value={name}>{name}</option>
                  ))}
                </SelectNative>
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-500 mb-1.5">管轄部署</label>
                <SelectNative
                  value={formData.department}
                  onChange={(e) => handleChange('department', e.target.value)}
                >
                  {DEPARTMENTS.map(dept => (
                    <option key={dept} value={dept}>{dept}</option>
                  ))}
                </SelectNative>
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-500 mb-1.5">開業日</label>
                <Input
                  value={formData.openingDate}
                  onChange={(e) => handleChange('openingDate', e.target.value)}
                  placeholder="2026年4月予定"
                  className="h-10"
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-gray-500 mb-1.5">引継日</label>
                <Input
                  type="date"
                  value={formData.handoverDate}
                  onChange={(e) => handleChange('handoverDate', e.target.value)}
                  className="h-10"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-500 mb-1.5">期限（採用期日）</label>
                <Input
                  type="date"
                  value={formData.deadlineDate}
                  onChange={(e) => handleChange('deadlineDate', e.target.value)}
                  className="h-10"
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* 採用媒体 */}
        <Card className="card-shadow border-0">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-sm font-semibold">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-indigo-100">
                <Newspaper className="h-4 w-4 text-indigo-600" />
              </div>
              採用媒体
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-3">
              {mediaData.map((media, index) => (
                <div key={media.mediaName} className="flex items-center gap-3 p-3 rounded-lg bg-gray-50">
                  <span className="text-sm font-medium text-gray-700 w-32 truncate">{media.mediaName}</span>
                  <select
                    value={media.status}
                    onChange={(e) => handleMediaChange(index, 'status', e.target.value)}
                    className={cn(
                      'flex-1 h-8 px-2 rounded-md border text-xs focus:outline-none focus:ring-2 focus:ring-gray-900/5',
                      media.status === '募集中' ? 'bg-green-50 border-green-200 text-green-700' :
                      media.status === '準備中' ? 'bg-yellow-50 border-yellow-200 text-yellow-700' :
                      media.status === '審査・同期中' ? 'bg-blue-50 border-blue-200 text-blue-700' :
                      'bg-white border-gray-200 text-gray-600'
                    )}
                  >
                    {MEDIA_STATUSES.map(status => (
                      <option key={status} value={status}>{status}</option>
                    ))}
                  </select>
                  <Input
                    type="date"
                    value={media.startDate}
                    onChange={(e) => handleMediaChange(index, 'startDate', e.target.value)}
                    className="w-32 h-8 text-xs"
                    placeholder="開始日"
                  />
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* メモ */}
        <Card className="card-shadow border-0">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-sm font-semibold">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-pink-100">
                <FileText className="h-4 w-4 text-pink-600" />
              </div>
              メモ
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1.5">ハードル・アラーム</label>
              <textarea
                value={formData.hurdles}
                onChange={(e) => handleChange('hurdles', e.target.value)}
                placeholder="採用活動における課題や注意点"
                className="w-full h-20 px-3 py-2 rounded-md border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-gray-900/5 resize-none"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1.5">備考・状況</label>
              <textarea
                value={formData.notes}
                onChange={(e) => handleChange('notes', e.target.value)}
                placeholder="その他の情報や現在の状況"
                className="w-full h-20 px-3 py-2 rounded-md border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-gray-900/5 resize-none"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1.5">次アクション</label>
              <textarea
                value={formData.nextAction}
                onChange={(e) => handleChange('nextAction', e.target.value)}
                placeholder="次に行うべきアクション"
                className="w-full h-20 px-3 py-2 rounded-md border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-gray-900/5 resize-none"
              />
            </div>
          </CardContent>
        </Card>

        {/* 送信ボタン（フッター） */}
        <div className="flex justify-end gap-3 pt-4">
          <Link href="/projects">
            <Button variant="outline" size="lg" className="rounded-full">
              キャンセル
            </Button>
          </Link>
          <Button 
            type="submit" 
            variant="primary"
            size="lg"
            className="rounded-full pl-4 pr-6 gap-2.5"
            disabled={isSubmitting}
          >
            <Save className="h-4 w-4" strokeWidth={2} />
            <span className="leading-none tracking-[-0.01em]">{isSubmitting ? '保存中...' : '案件を登録'}</span>
          </Button>
        </div>
      </form>
    </>
  );
}

