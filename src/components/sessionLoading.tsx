import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

export default function SessionsSkeleton() {
  return (
    <div className="space-y-8 py-8">
      {[1, 2, 3].map((i) => (
        <Card key={i} className="w-full max-w-3xl mx-auto">
          <CardHeader>
            <Skeleton className="h-6 w-2/3" />
            <div className="flex items-center space-x-2 mt-2">
              <Skeleton className="h-4 w-4" />
              <Skeleton className="h-4 w-1/3" />
            </div>
            <div className="flex items-center space-x-2 mt-2">
              <Skeleton className="h-4 w-4" />
              <Skeleton className="h-4 w-1/4" />
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <Skeleton className="h-48 w-full" />
            <Skeleton className="h-[200px] w-full" />
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
