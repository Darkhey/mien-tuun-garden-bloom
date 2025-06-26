
import { useState, useMemo } from 'react';
import { AdminBlogPost } from "@/types/admin";

export const useBlogPostFiltering = (posts: AdminBlogPost[]) => {
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("");
  const [sort, setSort] = useState<'date' | 'title'>('date');
  const [direction, setDirection] = useState<'asc' | 'desc'>('desc');

  const filteredPosts = useMemo(() => {
    return posts.filter(p => {
      if (category && p.category !== category) return false;
      if (search && !p.title.toLowerCase().includes(search.toLowerCase())) return false;
      return true;
    });
  }, [posts, category, search]);

  const sortedPosts = useMemo(() => {
    const sorted = [...filteredPosts];
    sorted.sort((a, b) => {
      let res = 0;
      if (sort === 'title') {
        res = a.title.localeCompare(b.title);
      } else {
        const dateA = a.published_at ? new Date(a.published_at).getTime() : NaN;
        const dateB = b.published_at ? new Date(b.published_at).getTime() : NaN;
        const validA = !isNaN(dateA);
        const validB = !isNaN(dateB);
        if (validA && validB) {
          res = dateA - dateB;
        } else if (validA) {
          res = -1;
        } else if (validB) {
          res = 1;
        } else {
          res = 0;
        }
      }
      return direction === 'asc' ? res : -res;
    });
    return sorted;
  }, [filteredPosts, sort, direction]);

  return {
    search,
    setSearch,
    category,
    setCategory,
    sort,
    setSort,
    direction,
    setDirection,
    sortedPosts
  };
};
