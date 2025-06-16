import React from "react";
import { Link } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { TestTube, ArrowLeft } from "lucide-react";
import BlogSystemTestDashboard from "../BlogSystemTestDashboard";
import { blogTestingService } from "@/services/BlogTestingService";

interface BlogTestingViewProps {
  testSlug?: string;
}

const BlogTestingView: React.FC<BlogTestingViewProps> = ({ testSlug }) => {
  if (testSlug) {
    const info = blogTestingService
      .getAvailableTests()
      .find((t) => t.slug === testSlug);
    if (!info) {
      return <div className="p-4">Unbekannter Test.</div>;
    }
    return (
      <div className="space-y-4">
        <Link to=".." className="flex items-center text-sm text-sage-600">
          <ArrowLeft className="h-4 w-4 mr-1" /> Zurück
        </Link>
        <BlogSystemTestDashboard testSlug={testSlug} />
      </div>
    );
  }

  const tests = blogTestingService.getAvailableTests();

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <div className="p-2 bg-purple-100 rounded-lg">
          <TestTube className="h-6 w-6 text-purple-600" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Blog-System-Tests</h1>
          <p className="text-gray-600">Wähle einen Test aus oder starte alle</p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Tests</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          {tests.map((t) => (
            <Link
              key={t.slug}
              to={t.slug}
              className="block px-4 py-2 rounded border hover:bg-sage-50"
            >
              {t.name}
            </Link>
          ))}
        </CardContent>
      </Card>

      <BlogSystemTestDashboard />
    </div>
  );
};

export default BlogTestingView;
