
import React from "react";
import { TestTube } from "lucide-react";
import BlogDataFlowTestDashboard from "../BlogDataFlowTestDashboard";

interface BlogTestingViewProps {
  testSlug?: string;
}

const BlogTestingView: React.FC<BlogTestingViewProps> = ({ testSlug }) => {
  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <div className="p-2 bg-blue-100 rounded-lg">
          <TestTube className="h-6 w-6 text-blue-600" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Blog System Tests</h1>
          <p className="text-gray-600">Vollständige Datenfluss-Überprüfung der Blog-Artikel-Verwaltung</p>
        </div>
      </div>

      <BlogDataFlowTestDashboard />
    </div>
  );
};

export default BlogTestingView;
