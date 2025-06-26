
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { Loader2 } from "lucide-react";

// Import hooks
import { useBlogPostsData } from './useBlogPostsData';
import { useSelection } from './useSelection';
import { useBlogPostModals } from './useBlogPostModals';
import { useBlogPostFiltering } from './useBlogPostFiltering';
import { useBulkOperations } from './useBulkOperations';

// Import components
import BlogPostsHeader from './BlogPostsHeader';
import BlogPostsFilter from './BlogPostsFilter';
import BlogPostsTable from './BlogPostsTable';
import EnhancedBlogPostsBulkActions from './EnhancedBlogPostsBulkActions';
import EditBlogPostModal from '../EditBlogPostModal';

const BlogPostsView: React.FC = () => {
  const { toast } = useToast();
  const { blogPosts, categories, loading, loadBlogPosts } = useBlogPostsData();
  const { selectedIds, toggleSelection, clearSelection, isSelected, selectAll, hasSelection } = useSelection();
  const { 
    editingPost, 
    setEditingPost, 
    showCreateModal, 
    setShowCreateModal, 
    handleEdit, 
    handleDelete, 
    handleToggleStatus, 
    handleSavePost 
  } = useBlogPostModals(loadBlogPosts, toast);
  
  const {
    search,
    setSearch,
    category,
    setCategory,
    sort,
    setSort,
    direction,
    setDirection,
    sortedPosts
  } = useBlogPostFiltering(blogPosts);

  const {
    bulkLoading,
    currentOptimizationBatch,
    recentOptimizations,
    optimizeTitles,
    generateImages,
    cancelOperation
  } = useBulkOperations(selectedIds, clearSelection, loadBlogPosts);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="flex items-center gap-2">
          <Loader2 className="h-6 w-6 animate-spin" />
          <span>Lade Blog-Artikel...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <BlogPostsHeader 
        onCreateNew={() => setShowCreateModal(true)}
        totalCount={blogPosts.length}
        filteredCount={sortedPosts.length}
      />

      <EnhancedBlogPostsBulkActions
        selectedCount={selectedIds.length}
        onOptimizeTitles={optimizeTitles}
        onGenerateImages={generateImages}
        onClear={clearSelection}
        onCancel={cancelOperation}
        loading={bulkLoading}
        currentBatch={currentOptimizationBatch}
        recentOptimizations={recentOptimizations}
      />

      <Card>
        <CardHeader>
          <CardTitle>Blog-Artikel verwalten</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <BlogPostsFilter
              search={search}
              setSearch={setSearch}
              category={category}
              setCategory={setCategory}
              sort={sort}
              setSort={setSort}
              direction={direction}
              setDirection={setDirection}
              categories={categories}
            />

            <BlogPostsTable
              posts={sortedPosts}
              selectedIds={selectedIds}
              onToggleSelection={toggleSelection}
              onSelectAll={() => selectAll(sortedPosts.map(p => p.id))}
              onEdit={handleEdit}
              onDelete={handleDelete}
              onToggleStatus={handleToggleStatus}
              isSelected={isSelected}
              hasSelection={hasSelection}
            />
          </div>
        </CardContent>
      </Card>

      {editingPost && (
        <EditBlogPostModal
          post={editingPost}
          onClose={() => setEditingPost(null)}
          onSaved={handleSavePost}
        />
      )}
    </div>
  );
};

export default BlogPostsView;
