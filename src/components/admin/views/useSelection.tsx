
import { useState } from 'react';
import { AdminBlogPost } from "@/types/admin";

export const useSelection = () => {
  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  const toggleSelect = (id: string) => {
    setSelectedIds(prev =>
      prev.includes(id) ? prev.filter(p => p !== id) : [...prev, id]
    );
  };

  const toggleSelectAll = (visiblePosts: AdminBlogPost[]) => {
    const allSelected = visiblePosts.every(p => selectedIds.includes(p.id));

    if (allSelected) {
      setSelectedIds(prev => prev.filter(id => !visiblePosts.some(p => p.id === id)));
    } else {
      const newIds = visiblePosts.map(p => p.id);
      setSelectedIds(prev => Array.from(new Set([...prev, ...newIds])));
    }
  };

  const clearSelection = () => setSelectedIds([]);

  return {
    selectedIds,
    toggleSelect,
    toggleSelectAll,
    clearSelection
  };
};
