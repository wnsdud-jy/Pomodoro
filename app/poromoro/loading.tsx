import { Card, CardContent, CardHeader } from "@/components/ui/card";

export default function PoromoroLoading() {
  return (
    <div className="grid flex-1 place-items-center">
      <Card className="w-full max-w-xl">
        <CardHeader className="space-y-3">
          <div className="h-4 w-24 animate-pulse rounded-full bg-slate-200" />
          <div className="h-9 w-56 animate-pulse rounded-2xl bg-slate-200" />
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="h-12 animate-pulse rounded-2xl bg-slate-100" />
          <div className="h-12 animate-pulse rounded-2xl bg-slate-100" />
          <div className="h-12 w-32 animate-pulse rounded-full bg-slate-200" />
        </CardContent>
      </Card>
    </div>
  );
}

