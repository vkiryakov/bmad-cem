import { toast } from 'sonner';

export function showSuccess(message: string): void {
  toast.success(message, { duration: 3000 });
}

export function showError(message: string): void {
  toast.error(message, { duration: Infinity });
}
