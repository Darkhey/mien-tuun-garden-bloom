import React from 'react';
import { Input } from '@/components/ui/input';

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
  <div className="flex flex-wrap gap-2 items-center mb-4">
    <Input
      className="max-w-xs"
      placeholder="Suchen..."
      value={search}
      onChange={(e) => setSearch(e.target.value)}
    />
    <select
      className="border rounded p-2"
      value={category}
      onChange={(e) => setCategory(e.target.value)}
    >
      <option value="">Alle Kategorien</option>
      {categories.map((c) => (
        <option key={c.value} value={c.value}>{c.label}</option>
      ))}
    </select>
    <select
      className="border rounded p-2"
      value={sort}
      onChange={(e) => setSort(e.target.value as 'date' | 'title')}
    >
      <option value="date">Veröffentlichung</option>
      <option value="title">Titel</option>
    </select>
    <button
      className="p-2 border rounded"
      onClick={() => setDirection(direction === 'asc' ? 'desc' : 'asc')}
    >
      {direction === 'asc' ? '⬆️' : '⬇️'}
    </button>
  </div>
);

export default BlogPostsFilter;
