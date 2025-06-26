
import React from "react";
import { Loader2 } from "lucide-react";
import EditBlogPostModal from "../EditBlogPostModal";
import InstagramPostModal from "../InstagramPostModal";
import BlogPostsHeader from "./BlogPostsHeader";
import BlogPostsFilter from "./BlogPostsFilter";
import BlogPostsTable from "./BlogPostsTable";
import BlogPostsBulkActions from "./BlogPostsBulkActions";
import { useBlogPostsData } from "./useBlogPostsData";
import { useSelection } from "./useSelection";
import { useBulkOperations } from "./useBulkOperations";
import { useBlogPostModals } from "./useBlogPostModals";
import { useBlogPostFiltering } from "./useBlogPostFiltering";
import { BLOG_CATEGORIES } from "../blogHelpers";

const BlogPostsView: React.FC = () => {
  const {
    posts,
    loading,
    error,
    instagramStatuses,
    loadBlogPosts,
    loadInstagramStatuses,
    handleToggleStatus,
    handleDelete
  } = useBlogPostsData();

  const { selectedIds, toggleSelect, toggleSelectAll, clearSelection } = useSelection();

  const {
    bulkLoading,
    progress,
    batchProgress,
    optimizeTitles,
    generateImages,
    cancelOperation
  } = useBulkOperations(selectedIds, clearSelection, loadBlogPosts);

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

  if (loading) {
    return (
      <div className="flex justify-center items-center h-40">
        <Loader2 className="animate-spin mr-2" /> Blog-Artikel werden geladen...
      </div>
    );
  }

  if (error) {
    return <div className="text-red-600 p-4 bg-red-50 rounded">{error}</div>;
  }

  return (
    <>
      <div className="space-y-4">
        <BlogPostsHeader
          postsCount={posts.length}
          onRefresh={loadBlogPosts}
        />
        
        <BlogPostsFilter
          categories={BLOG_CATEGORIES}
          search={search}
          setSearch={setSearch}
          category={category}
          setCategory={setCategory}
          sort={sort}
          setSort={setSort}
          direction={direction}
          setDirection={setDirection}
        />

        <BlogPostsBulkActions
          selectedCount={selectedIds.length}
          onOptimizeTitles={optimizeTitles}
          onGenerateImages={generateImages}
          onClear={clearSelection}
          onCancel={cancelOperation}
          loading={bulkLoading}
          progress={progress}
          batchProgress={batchProgress}
        />

        <BlogPostsTable
          posts={sortedPosts}
          instagramStatuses={instagramStatuses}
          selectedIds={selectedIds}
          onToggleSelect={toggleSelect}
          onToggleSelectAll={() => toggleSelectAll(sortedPosts)}
          onToggleStatus={handleToggleStatus}
          onEdit={handleEdit}
          onInstagramPost={handleInstagramPost}
          onDelete={handleDelete}
        />
      </div>

      {editingPost && (
        <EditBlogPostModal
          post={editingPost}
          onClose={() => closeEditModal()}
          onSaved={() => closeEditModal()}
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
    </>
  );
};

export default BlogPostsView;
