'use client';

import { FileText } from 'lucide-react';
import { EmptyState } from '@/components/layout/EmptyState';

export default function SurveysPage() {
  return (
    <section>
      <h1 className="mb-6 text-2xl font-semibold">Опросы</h1>
      <div className="rounded-xl bg-white p-8 shadow-sm">
        <EmptyState
          icon={<FileText className="h-12 w-12" />}
          title="Нет опросов"
          description="Здесь будет список ваших опросов"
        />
      </div>
    </section>
  );
}
