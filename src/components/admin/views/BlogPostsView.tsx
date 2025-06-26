
import React from 'react';
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
import { BLOG_CATEGORIES } from '../blogHelpers';
import InstagramPostModal from '../InstagramPostModal';

const BlogPostsView: React.FC = () => {
  const { toast } = useToast();
  const { posts, loading, instagramStatuses, loadBlogPosts, loadInstagramStatuses, handleToggleStatus, handleDelete } = useBlogPostsData();
  const { selectedIds, toggleSelect, toggleSelectAll, clearSelection } = useSelection();
  const {
    editingPost,
    instagramPost,
    handleEdit,
    handleInstagramPost,
    handleInstagramSuccess,
    closeEditModal,
    closeInstagramModal
  } = useBlogPostModals(loadBlogPosts, loadInstagramStatuses);
  
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
  } = useBlogPostFiltering(posts);

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
        postsCount={posts.length}
        onRefresh={loadBlogPosts}
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
              categories={BLOG_CATEGORIES}
            />

            <BlogPostsTable
              posts={sortedPosts}
              instagramStatuses={instagramStatuses}
              selectedIds={selectedIds}
              onToggleSelect={toggleSelect}
              onToggleSelectAll={toggleSelectAll}
              onEdit={handleEdit}
              onInstagramPost={handleInstagramPost}
              onDelete={handleDelete}
              onToggleStatus={handleToggleStatus}
            />
          </div>
        </CardContent>
      </Card>

      {editingPost && (
        <EditBlogPostModal
          post={editingPost}
          onClose={closeEditModal}
          onSaved={closeEditModal}
        />
      )}

      {instagramPost && (
        <InstagramPostModal
          post={instagramPost}
          isOpen={true}
          onClose={closeInstagramModal}
          onSuccess={handleInstagramSuccess}
        />
      )}
    </div>
  );
};

export default BlogPostsView;
