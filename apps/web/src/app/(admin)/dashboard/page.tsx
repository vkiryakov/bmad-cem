'use client';

import { useRouter } from 'next/navigation';
import { ClipboardList } from 'lucide-react';
import { EmptyState } from '@/components/layout/EmptyState';

export default function DashboardPage() {
  const router = useRouter();

  return (
    <section>
      <h1 className="mb-6 text-2xl font-semibold">Дашборд</h1>
      <div className="rounded-xl bg-white p-8 shadow-sm">
        <EmptyState
          icon={<ClipboardList className="h-12 w-12" />}
          title="У вас ещё нет опросов"
          description="Создайте свой первый опрос, чтобы начать собирать обратную связь"
          actionLabel="Создать опрос"
          onAction={() => router.push('/surveys')}
        />
      </div>
    </section>
  );
}
