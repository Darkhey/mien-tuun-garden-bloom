import React from "react";
import { Skeleton } from "@/components/ui/skeleton";

export const BlogHeroSkeleton: React.FC = () => (
  <div className="rounded-2xl overflow-hidden border border-border bg-card mb-10">
    <div className="flex flex-col md:flex-row">
      <div className="md:w-3/5">
        <Skeleton className="w-full h-56 md:h-80" />
      </div>
      <div className="p-6 md:p-8 flex flex-col justify-center md:w-2/5 space-y-3">
        <Skeleton className="h-3 w-16" />
        <Skeleton className="h-7 w-full" />
        <Skeleton className="h-7 w-3/4" />
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-2/3" />
        <Skeleton className="h-3 w-32" />
      </div>
    </div>
  </div>
);

export const BlogCardSkeleton: React.FC = () => (
  <div className="rounded-xl overflow-hidden border border-border bg-card">
    <Skeleton className="w-full h-56" />
    <div className="p-6 space-y-3">
      <div className="flex gap-2">
        <Skeleton className="h-5 w-16 rounded-full" />
        <Skeleton className="h-5 w-12 rounded-full" />
      </div>
      <Skeleton className="h-5 w-full" />
      <Skeleton className="h-5 w-3/4" />
      <Skeleton className="h-4 w-full" />
      <Skeleton className="h-4 w-2/3" />
      <div className="flex gap-2 pt-2">
        <Skeleton className="h-4 w-14 rounded-md" />
        <Skeleton className="h-4 w-14 rounded-md" />
      </div>
    </div>
  </div>
);

interface BlogGridSkeletonProps {
  count?: number;
}

const BlogGridSkeleton: React.FC<BlogGridSkeletonProps> = ({ count = 6 }) => (
  <div className="space-y-12">
    <BlogHeroSkeleton />
    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
      {Array.from({ length: count }).map((_, i) => (
        <BlogCardSkeleton key={i} />
      ))}
    </div>
  </div>
);

export default BlogGridSkeleton;
