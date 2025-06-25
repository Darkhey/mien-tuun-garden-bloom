
import React from 'react';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select';
import { Button } from '@/components/ui/button';

interface BlogPostsFilterProps {
  categories: { value: string; label: string }[];
  search: string;
  setSearch: (v: string) => void;
  category: string;
  setCategory: (v: string) => void;
  sort: 'date' | 'title';
  setSort: (v: 'date' | 'title') => void;
  direction: 'asc' | 'desc';
  setDirection: (v: 'asc' | 'desc') => void;
}

const BlogPostsFilter: React.FC<BlogPostsFilterProps> = ({
  categories,
  search,
  setSearch,
  category,
  setCategory,
  sort,
  setSort,
  direction,
  setDirection
}) => (
  <div className="bg-white rounded-lg border p-4 mb-6">
    <div className="flex flex-wrap gap-4 items-center">
      <div className="min-w-0 flex-1">
        <Input
          className="max-w-xs"
          placeholder="Suchen..."
          aria-label="Blog-Posts durchsuchen"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>
      
      <Select value={category || "all"} onValueChange={(value) => setCategory(value === "all" ? "" : value)}>
        <SelectTrigger className="w-44">
          <SelectValue placeholder="Alle Kategorien" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">Alle Kategorien</SelectItem>
          {categories.map((c) => (
            <SelectItem key={c.value} value={c.value}>{c.label}</SelectItem>
          ))}
        </SelectContent>
      </Select>
      
      <Select value={sort} onValueChange={(v) => setSort(v as 'date' | 'title')}>
        <SelectTrigger className="w-44">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="date">Veröffentlichung</SelectItem>
          <SelectItem value="title">Titel</SelectItem>
        </SelectContent>
      </Select>
      
      <Button
        variant="outline"
        aria-pressed={direction === 'desc'}
        aria-label={`Sortierung ${direction === 'asc' ? 'aufsteigend' : 'absteigend'}`}
        onClick={() => setDirection(direction === 'asc' ? 'desc' : 'asc')}
      >
        {direction === 'asc' ? 'Aufsteigend' : 'Absteigend'}
      </Button>
    </div>
  </div>
);

export default BlogPostsFilter;
