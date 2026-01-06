'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ChevronLeft, Save, Edit2, Building2, MapPin, Users, Briefcase, FileText, Newspaper, Clock, AlertTriangle } from 'lucide-react';
import { Header } from '@/components/layout/header';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { SelectNative } from '@/components/ui/select-native';
import { cn } from '@/lib/utils';
import { getCategoryColor, getSegmentColor, getStatusColor, getMediaStatusColor } from '@/lib/category-utils';
import { calculateDateInfo, formatElapsedDays, formatRemainingDays, formatDate } from '@/lib/date-utils';
import { 
  CATEGORIES, 
  SEGMENTS, 
  PROJECT_STATUSES, 
  DEPARTMENTS, 
  POSITIONS, 
  EMPLOYMENT_TYPES,
  PREFECTURES,
  MEDIA_STATUSES,
  type Project,
} from '@/types/database';
import { getActiveAssignees } from '@/data/master-data';

const assignees = getActiveAssignees();

interface ProjectDetailClientProps {
  project: Project;
}

export function ProjectDetailClient({ project: initialProject }: ProjectDetailClientProps) {
  const router = useRouter();
  
  const [project, setProject] = useState<Project>(initialProject);
  const [isEditing, setIsEditing] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [editedProject, setEditedProject] = useState<Project>(initialProject);

  const dateInfo = calculateDateInfo(project.handoverDate, project.deadlineDate);

  const handleChange = (field: keyof Project, value: unknown) => {
    setEditedProject({ ...editedProject, [field]: value });
  };

  const handleMediaChange = (mediaId: number, field: 'status' | 'startDate' | 'endDate', value: string) => {
    const updatedMedia = editedProject.media.map(m => 
      m.id === mediaId ? { ...m, [field]: field === 'startDate' || field === 'endDate' ? (value ? new Date(value) : null) : value } : m
    );
    setEditedProject({ ...editedProject, media: updatedMedia });
  };

  const handleSave = async () => {
    setIsSubmitting(true);
    // TODO: API呼び出し
    console.log('Saving project:', editedProject);
    setTimeout(() => {
      setProject(editedProject);
      setIsEditing(false);
      setIsSubmitting(false);
    }, 500);
  };

  const handleCancel = () => {
    setEditedProject(project);
    setIsEditing(false);
  };

  return (
    <>
      <Header 
        title={isEditing ? '案件編集' : '案件詳細'}
        subtitle={`${project.hrId} - ${project.clientName}`}
        showSearch={false}
        actions={
          <div className="flex items-center gap-2">
            <Link href="/projects">
              <Button variant="ghost" size="sm" className="h-9 gap-1.5 rounded-full">
                <ChevronLeft className="h-4 w-4" />
                戻る
              </Button>
            </Link>
            {isEditing ? (
              <>
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="h-9 rounded-full"
                  onClick={handleCancel}
                >
                  キャンセル
                </Button>
                <Button 
                  variant="primary"
                  className="h-9 rounded-full pl-3.5 pr-5 gap-2"
                  onClick={handleSave}
                  disabled={isSubmitting}
                >
                  <Save className="h-4 w-4" strokeWidth={2} />
                  <span className="leading-none tracking-[-0.01em]">{isSubmitting ? '保存中...' : '保存'}</span>
                </Button>
              </>
            ) : (
              <Button 
                variant="primary"
                className="h-9 rounded-full pl-3.5 pr-5 gap-2"
                onClick={() => setIsEditing(true)}
              >
                <Edit2 className="h-4 w-4" strokeWidth={2} />
                <span className="leading-none tracking-[-0.01em]">編集</span>
              </Button>
            )}
          </div>
        }
      />
      
      <div className="p-8 space-y-8 max-w-5xl mx-auto">
        {/* ステータスサマリー */}
        <div className="flex items-center gap-4 p-4 rounded-2xl bg-white card-shadow">
          <div className="flex items-center gap-3">
            <Badge className={cn('text-xs', getSegmentColor(project.segment))}>{project.segment}</Badge>
            <Badge className={cn('text-xs', getCategoryColor(project.category))}>{project.category}</Badge>
            <Badge className={cn('text-xs', getStatusColor(project.status))}>{project.status}</Badge>
          </div>
          <div className="flex-1" />
          <div className="flex items-center gap-6 text-sm">
            {dateInfo.elapsedDays !== null && (
              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4 text-gray-400" />
                <span className={cn(dateInfo.isSlow ? 'text-amber-600 font-medium' : 'text-gray-600')}>
                  {formatElapsedDays(dateInfo.elapsedDays)}
                </span>
                {dateInfo.isSlow && <Badge className="bg-amber-100 text-amber-700 border-0 text-[10px]">Slow</Badge>}
              </div>
            )}
            {dateInfo.remainingDays !== null && (
              <div className="flex items-center gap-2">
                <AlertTriangle className={cn('h-4 w-4', dateInfo.isOverdue ? 'text-red-500' : dateInfo.isUrgent ? 'text-amber-500' : 'text-gray-400')} />
                <span className={cn(
                  dateInfo.isOverdue ? 'text-red-600 font-medium' :
                  dateInfo.isUrgent ? 'text-amber-600 font-medium' : 'text-gray-600'
                )}>
                  {formatRemainingDays(dateInfo.remainingDays)}
                </span>
              </div>
            )}
            <div className="text-gray-500">
              進捗: <span className="font-semibold text-gray-900">{project.currentHiringCount}</span> / {project.targetHiringCount}名
            </div>
          </div>
        </div>

        {/* 案件情報 & クライアント情報 */}
        <div className="grid grid-cols-2 gap-8">
          {/* 案件情報 */}
          <Card className="card-shadow border-0">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-sm font-semibold">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gray-100">
                  <FileText className="h-4 w-4 text-gray-600" />
                </div>
                案件情報
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex justify-between items-center py-2 border-b border-gray-100">
                <span className="text-xs text-gray-500">HR ID</span>
                <span className="text-sm font-mono text-gray-900">{project.hrId}</span>
              </div>
              <div className="flex justify-between items-center py-2 border-b border-gray-100">
                <span className="text-xs text-gray-500">セグメント</span>
                {isEditing ? (
                  <SelectNative
                    selectSize="sm"
                    value={editedProject?.segment}
                    onChange={(e) => handleChange('segment', e.target.value)}
                    className="w-28"
                  >
                    {SEGMENTS.map(seg => <option key={seg} value={seg}>{seg}</option>)}
                  </SelectNative>
                ) : (
                  <Badge className={cn('text-xs', getSegmentColor(project.segment))}>{project.segment}</Badge>
                )}
              </div>
              <div className="flex justify-between items-center py-2">
                <span className="text-xs text-gray-500">業態</span>
                {isEditing ? (
                  <SelectNative
                    selectSize="sm"
                    value={editedProject?.category}
                    onChange={(e) => handleChange('category', e.target.value)}
                    className="w-28"
                  >
                    {CATEGORIES.map(cat => <option key={cat} value={cat}>{cat}</option>)}
                  </SelectNative>
                ) : (
                  <Badge className={cn('text-xs', getCategoryColor(project.category))}>{project.category}</Badge>
                )}
              </div>
            </CardContent>
          </Card>

          {/* クライアント情報 */}
          <Card className="card-shadow border-0">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-sm font-semibold">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-100">
                  <Building2 className="h-4 w-4 text-blue-600" />
                </div>
                クライアント情報
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex justify-between items-center py-2 border-b border-gray-100">
                <span className="text-xs text-gray-500">クライアント名</span>
                {isEditing ? (
                  <Input
                    value={editedProject?.clientName}
                    onChange={(e) => handleChange('clientName', e.target.value)}
                    className="h-8 w-48 text-sm"
                  />
                ) : (
                  <span className="text-sm font-medium text-gray-900">{project.clientName}</span>
                )}
              </div>
              <div className="flex justify-between items-center py-2 border-b border-gray-100">
                <span className="text-xs text-gray-500">補足</span>
                {isEditing ? (
                  <Input
                    value={editedProject?.clientNameKana}
                    onChange={(e) => handleChange('clientNameKana', e.target.value)}
                    className="h-8 w-48 text-sm"
                  />
                ) : (
                  <span className="text-sm text-gray-600">{project.clientNameKana || '-'}</span>
                )}
              </div>
              <div className="flex justify-between items-center py-2 border-b border-gray-100">
                <span className="text-xs text-gray-500">クライアントID</span>
                <span className="text-sm text-gray-600">{project.clientId || '-'}</span>
              </div>
              <div className="flex justify-between items-center py-2">
                <span className="text-xs text-gray-500">申請ID</span>
                <span className="text-sm text-gray-600">{project.applicationId || '-'}</span>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* 勤務地 & 募集内容 */}
        <div className="grid grid-cols-2 gap-8">
          {/* 勤務地 */}
          <Card className="card-shadow border-0">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-sm font-semibold">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-100">
                  <MapPin className="h-4 w-4 text-emerald-600" />
                </div>
                勤務地
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex justify-between items-center py-2 border-b border-gray-100">
                <span className="text-xs text-gray-500">都道府県</span>
                {isEditing ? (
                  <SelectNative
                    selectSize="sm"
                    value={editedProject?.prefecture}
                    onChange={(e) => handleChange('prefecture', e.target.value)}
                    className="w-28"
                  >
                    {PREFECTURES.map(pref => <option key={pref} value={pref}>{pref}</option>)}
                  </SelectNative>
                ) : (
                  <span className="text-sm text-gray-900">{project.prefecture}</span>
                )}
              </div>
              <div className="flex justify-between items-center py-2 border-b border-gray-100">
                <span className="text-xs text-gray-500">市区町村</span>
                {isEditing ? (
                  <Input
                    value={editedProject?.city}
                    onChange={(e) => handleChange('city', e.target.value)}
                    className="h-8 w-48 text-sm"
                  />
                ) : (
                  <span className="text-sm text-gray-600">{project.city || '-'}</span>
                )}
              </div>
              <div className="flex justify-between items-center py-2">
                <span className="text-xs text-gray-500">事業所名</span>
                {isEditing ? (
                  <Input
                    value={editedProject?.facilityName}
                    onChange={(e) => handleChange('facilityName', e.target.value)}
                    className="h-8 w-48 text-sm"
                  />
                ) : (
                  <span className="text-sm text-gray-600">{project.facilityName || '-'}</span>
                )}
              </div>
            </CardContent>
          </Card>

          {/* 募集内容 */}
          <Card className="card-shadow border-0">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-sm font-semibold">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-purple-100">
                  <Users className="h-4 w-4 text-purple-600" />
                </div>
                募集内容
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex justify-between items-center py-2 border-b border-gray-100">
                <span className="text-xs text-gray-500">募集職種</span>
                {isEditing ? (
                  <SelectNative
                    selectSize="sm"
                    value={editedProject?.position}
                    onChange={(e) => handleChange('position', e.target.value)}
                    className="w-28"
                  >
                    {POSITIONS.map(pos => <option key={pos} value={pos}>{pos}</option>)}
                  </SelectNative>
                ) : (
                  <span className="text-sm text-gray-900">{project.position}</span>
                )}
              </div>
              <div className="flex justify-between items-center py-2 border-b border-gray-100">
                <span className="text-xs text-gray-500">勤務形態</span>
                {isEditing ? (
                  <SelectNative
                    selectSize="sm"
                    value={editedProject?.employmentType}
                    onChange={(e) => handleChange('employmentType', e.target.value)}
                    className="w-28"
                  >
                    {EMPLOYMENT_TYPES.map(type => <option key={type} value={type}>{type}</option>)}
                  </SelectNative>
                ) : (
                  <span className="text-sm text-gray-600">{project.employmentType}</span>
                )}
              </div>
              <div className="flex justify-between items-center py-2">
                <span className="text-xs text-gray-500">採用進捗</span>
                {isEditing ? (
                  <div className="flex items-center gap-2">
                    <Input
                      type="number"
                      value={editedProject?.currentHiringCount}
                      onChange={(e) => handleChange('currentHiringCount', parseInt(e.target.value) || 0)}
                      className="h-8 w-16 text-sm text-center"
                    />
                    <span className="text-gray-400">/</span>
                    <Input
                      type="number"
                      value={editedProject?.targetHiringCount}
                      onChange={(e) => handleChange('targetHiringCount', parseInt(e.target.value) || 0)}
                      className="h-8 w-16 text-sm text-center"
                    />
                  </div>
                ) : (
                  <span className="text-sm font-medium text-gray-900">
                    {project.currentHiringCount} / {project.targetHiringCount}名
                  </span>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* 社内管理 */}
        <Card className="card-shadow border-0">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-sm font-semibold">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-amber-100">
                <Briefcase className="h-4 w-4 text-amber-600" />
              </div>
              社内管理
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-3 gap-4">
              <div className="p-3 rounded-lg bg-gray-50">
                <span className="text-xs text-gray-500 block mb-1">ステータス</span>
                {isEditing ? (
                  <SelectNative
                    selectSize="sm"
                    value={editedProject?.status}
                    onChange={(e) => handleChange('status', e.target.value)}
                    className="w-full"
                  >
                    {PROJECT_STATUSES.map(status => <option key={status} value={status}>{status}</option>)}
                  </SelectNative>
                ) : (
                  <Badge className={cn('text-xs', getStatusColor(project.status))}>{project.status}</Badge>
                )}
              </div>
              <div className="p-3 rounded-lg bg-gray-50">
                <span className="text-xs text-gray-500 block mb-1">担当者</span>
                {isEditing ? (
                  <SelectNative
                    selectSize="sm"
                    value={editedProject?.assignee}
                    onChange={(e) => handleChange('assignee', e.target.value)}
                    className="w-full"
                  >
                    {assignees.map(name => <option key={name} value={name}>{name}</option>)}
                  </SelectNative>
                ) : (
                  <span className="text-sm font-medium text-gray-900">{project.assignee}</span>
                )}
              </div>
              <div className="p-3 rounded-lg bg-gray-50">
                <span className="text-xs text-gray-500 block mb-1">管轄部署</span>
                {isEditing ? (
                  <SelectNative
                    selectSize="sm"
                    value={editedProject?.department}
                    onChange={(e) => handleChange('department', e.target.value)}
                    className="w-full"
                  >
                    {DEPARTMENTS.map(dept => <option key={dept} value={dept}>{dept}</option>)}
                  </SelectNative>
                ) : (
                  <span className="text-sm text-gray-900">{project.department}</span>
                )}
              </div>
              <div className="p-3 rounded-lg bg-gray-50">
                <span className="text-xs text-gray-500 block mb-1">引継日</span>
                {isEditing ? (
                  <Input
                    type="date"
                    value={editedProject?.handoverDate ? new Date(editedProject.handoverDate).toISOString().split('T')[0] : ''}
                    onChange={(e) => handleChange('handoverDate', e.target.value ? new Date(e.target.value) : null)}
                    className="h-8 text-sm"
                  />
                ) : (
                  <span className="text-sm text-gray-900">{project.handoverDate ? formatDate(project.handoverDate) : '-'}</span>
                )}
              </div>
              <div className="p-3 rounded-lg bg-gray-50">
                <span className="text-xs text-gray-500 block mb-1">期限</span>
                {isEditing ? (
                  <Input
                    type="date"
                    value={editedProject?.deadlineDate ? new Date(editedProject.deadlineDate).toISOString().split('T')[0] : ''}
                    onChange={(e) => handleChange('deadlineDate', e.target.value ? new Date(e.target.value) : null)}
                    className="h-8 text-sm"
                  />
                ) : (
                  <span className="text-sm text-gray-900">{project.deadlineDate ? formatDate(project.deadlineDate) : '-'}</span>
                )}
              </div>
              <div className="p-3 rounded-lg bg-gray-50">
                <span className="text-xs text-gray-500 block mb-1">開業日</span>
                {isEditing ? (
                  <Input
                    value={editedProject?.openingDate || ''}
                    onChange={(e) => handleChange('openingDate', e.target.value)}
                    className="h-8 text-sm"
                    placeholder="2026年4月予定"
                  />
                ) : (
                  <span className="text-sm text-gray-900">{project.openingDate || '-'}</span>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* 採用媒体 */}
        <Card className="card-shadow border-0">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-sm font-semibold">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-indigo-100">
                <Newspaper className="h-4 w-4 text-indigo-600" />
              </div>
              採用媒体
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-3">
              {(isEditing ? editedProject.media : project.media).map((media) => (
                <div key={media.id} className={cn(
                  "p-3 rounded-lg bg-gray-50",
                  isEditing ? "space-y-2" : "flex items-center gap-3"
                )}>
                  <div className="flex items-center gap-3">
                    <span className="text-sm font-medium text-gray-700 w-32 truncate">{media.mediaName}</span>
                    {isEditing ? (
                      <SelectNative
                        selectSize="sm"
                        value={media.status}
                        onChange={(e) => handleMediaChange(media.id, 'status', e.target.value)}
                        className="flex-1"
                      >
                        {MEDIA_STATUSES.map(status => (
                          <option key={status} value={status}>{status}</option>
                        ))}
                      </SelectNative>
                    ) : (
                      <Badge className={cn('text-xs', getMediaStatusColor(media.status))}>{media.status}</Badge>
                    )}
                  </div>
                  {isEditing ? (
                    <div className="flex items-center gap-2 pl-[140px]">
                      <Input
                        type="date"
                        value={media.startDate ? new Date(media.startDate).toISOString().split('T')[0] : ''}
                        onChange={(e) => handleMediaChange(media.id, 'startDate', e.target.value)}
                        className="h-8 text-xs flex-1"
                        placeholder="開始日"
                      />
                      <span className="text-gray-400 text-xs">〜</span>
                      <Input
                        type="date"
                        value={media.endDate ? new Date(media.endDate).toISOString().split('T')[0] : ''}
                        onChange={(e) => handleMediaChange(media.id, 'endDate', e.target.value)}
                        className="h-8 text-xs flex-1"
                        placeholder="終了日"
                      />
                    </div>
                  ) : (
                    media.startDate && (
                      <span className="text-xs text-gray-400">
                        {formatDate(media.startDate)}〜{media.endDate ? formatDate(media.endDate) : ''}
                      </span>
                    )
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* メモ */}
        <Card className="card-shadow border-0">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-sm font-semibold">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-pink-100">
                <FileText className="h-4 w-4 text-pink-600" />
              </div>
              メモ
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <span className="text-xs text-gray-500 block mb-2">ハードル・アラーム</span>
              {isEditing ? (
                <textarea
                  value={editedProject?.hurdles || ''}
                  onChange={(e) => handleChange('hurdles', e.target.value)}
                  className="w-full h-20 px-3 py-2 rounded-md border border-gray-200 text-sm resize-none"
                />
              ) : (
                <p className="text-sm text-gray-700 whitespace-pre-wrap bg-gray-50 rounded-lg p-3 min-h-[60px]">
                  {project.hurdles || '-'}
                </p>
              )}
            </div>
            <div>
              <span className="text-xs text-gray-500 block mb-2">備考・状況</span>
              {isEditing ? (
                <textarea
                  value={editedProject?.notes || ''}
                  onChange={(e) => handleChange('notes', e.target.value)}
                  className="w-full h-20 px-3 py-2 rounded-md border border-gray-200 text-sm resize-none"
                />
              ) : (
                <p className="text-sm text-gray-700 whitespace-pre-wrap bg-gray-50 rounded-lg p-3 min-h-[60px]">
                  {project.notes || '-'}
                </p>
              )}
            </div>
            <div>
              <span className="text-xs text-gray-500 block mb-2">次アクション</span>
              {isEditing ? (
                <textarea
                  value={editedProject?.nextAction || ''}
                  onChange={(e) => handleChange('nextAction', e.target.value)}
                  className="w-full h-20 px-3 py-2 rounded-md border border-gray-200 text-sm resize-none"
                />
              ) : (
                <p className="text-sm text-gray-700 whitespace-pre-wrap bg-indigo-50 rounded-lg p-3 min-h-[60px]">
                  {project.nextAction || '-'}
                </p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </>
  );
}

