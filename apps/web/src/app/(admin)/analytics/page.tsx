'use client';

import { BarChart3 } from 'lucide-react';
import { EmptyState } from '@/components/layout/EmptyState';

export default function AnalyticsPage() {
  return (
    <section>
      <h1 className="mb-6 text-2xl font-semibold">Аналитика</h1>
      <div className="rounded-xl bg-white p-8 shadow-sm">
        <EmptyState
          icon={<BarChart3 className="h-12 w-12" />}
          title="Нет данных"
          description="Аналитика появится после завершения первого опроса"
        />
      </div>
    </section>
  );
}
