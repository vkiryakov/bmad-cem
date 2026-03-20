'use client';

import { HelpCircle } from 'lucide-react';
import { EmptyState } from '@/components/layout/EmptyState';

export default function QuestionsPage() {
  return (
    <section>
      <h1 className="mb-6 text-2xl font-semibold">Вопросы</h1>
      <div className="rounded-xl bg-white p-8 shadow-sm">
        <EmptyState
          icon={<HelpCircle className="h-12 w-12" />}
          title="Нет вопросов"
          description="Здесь будет библиотека ваших вопросов"
        />
      </div>
    </section>
  );
}
