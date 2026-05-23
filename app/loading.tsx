import { Skeleton } from '@/components/ui/skeleton';

export default function Loading() {
  return (
    <div className="grid min-h-[40vh] place-items-center p-8">
      <div className="w-full max-w-md space-y-3">
        <Skeleton className="h-4 w-32" />
        <Skeleton className="h-9 w-full" />
        <Skeleton className="h-9 w-3/4" />
      </div>
    </div>
  );
}
