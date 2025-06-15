
import { supabase } from "@/integrations/supabase/client";
import { contentGenerationService } from "./ContentGenerationService";

export interface BlogTestResult {
  testName: string;
  success: boolean;
  details: any;
  error?: string;
  timing?: number;
}

class BlogTestingService {
  private testResults: BlogTestResult[] = [];

  async runFullBlogSystemTest(): Promise<BlogTestResult[]> {
    console.log("[BlogTesting] Starte vollständigen Blog-System-Test");
    this.testResults = [];

    // Test 1: Supabase-Verbindung
    await this.testSupabaseConnection();
    
    // Test 2: Blog-Posts-Tabelle
    await this.testBlogPostsTable();
    
    // Test 3: Content-Generation-Service
    await this.testContentGeneration();
    
    // Test 4: Blog-Post-Erstellung
    await this.testBlogPostCreation();
    
    // Test 5: Edge-Functions
    await this.testEdgeFunctions();

    return this.testResults;
  }

  private async testSupabaseConnection(): Promise<void> {
    const startTime = Date.now();
    try {
      const { data, error } = await supabase.from('blog_posts').select('count').limit(1);
      
      if (error) throw error;
      
      this.testResults.push({
        testName: "Supabase Connection",
        success: true,
        details: { connectionEstablished: true },
        timing: Date.now() - startTime
      });
      
      console.log("[BlogTesting] ✅ Supabase-Verbindung erfolgreich");
    } catch (error: any) {
      this.testResults.push({
        testName: "Supabase Connection",
        success: false,
        details: { connectionEstablished: false },
        error: error.message,
        timing: Date.now() - startTime
      });
      
      console.error("[BlogTesting] ❌ Supabase-Verbindung fehlgeschlagen:", error);
    }
  }

  private async testBlogPostsTable(): Promise<void> {
    const startTime = Date.now();
    try {
      console.log("[BlogTesting] Teste Blog-Posts-Tabelle...");
      
      // Test SELECT
      const { data: posts, error: selectError } = await supabase
        .from('blog_posts')
        .select('id, title, slug, published, created_at')
        .limit(5);

      if (selectError) throw selectError;

      // Test COUNT
      const { count, error: countError } = await supabase
        .from('blog_posts')
        .select('*', { count: 'exact', head: true });

      if (countError) throw countError;

      this.testResults.push({
        testName: "Blog Posts Table",
        success: true,
        details: { 
          totalPosts: count,
          samplePosts: posts?.length || 0,
          posts: posts
        },
        timing: Date.now() - startTime
      });
      
      console.log(`[BlogTesting] ✅ Blog-Posts-Tabelle: ${count} Artikel gefunden`);
    } catch (error: any) {
      this.testResults.push({
        testName: "Blog Posts Table",
        success: false,
        details: { totalPosts: 0 },
        error: error.message,
        timing: Date.now() - startTime
      });
      
      console.error("[BlogTesting] ❌ Blog-Posts-Tabelle Fehler:", error);
    }
  }

  private async testContentGeneration(): Promise<void> {
    const startTime = Date.now();
    try {
      console.log("[BlogTesting] Teste Content-Generation-Service...");
      
      const testPrompt = "Teste die Content-Generierung mit einem einfachen Gartentipp";
      
      const result = await contentGenerationService.generateBlogPost({
        prompt: testPrompt,
        category: "Gartentipps",
        season: "Herbst",
        audiences: ["anfaenger"],
        contentType: ["blog"],
        tags: ["Test"],
        excerpt: "Test-Excerpt",
        imageUrl: ""
      });

      this.testResults.push({
        testName: "Content Generation",
        success: true,
        details: {
          title: result.title,
          contentLength: result.content.length,
          qualityScore: result.quality.score,
          wordCount: result.quality.wordCount
        },
        timing: Date.now() - startTime
      });
      
      console.log("[BlogTesting] ✅ Content-Generation erfolgreich");
    } catch (error: any) {
      this.testResults.push({
        testName: "Content Generation",
        success: false,
        details: {},
        error: error.message,
        timing: Date.now() - startTime
      });
      
      console.error("[BlogTesting] ❌ Content-Generation fehlgeschlagen:", error);
    }
  }

  private async testBlogPostCreation(): Promise<void> {
    const startTime = Date.now();
    try {
      console.log("[BlogTesting] Teste Blog-Post-Erstellung...");
      
      const testPost = {
        slug: `test-blog-post-${Date.now()}`,
        title: "Test Blog Post",
        content: "Dies ist ein Test-Artikel für das Blog-System.",
        excerpt: "Test-Excerpt für Blog-System-Test",
        category: "Test",
        tags: ["Test", "System"],
        content_types: ["blog"],
        season: "herbst",
        audiences: ["anfaenger"],
        featured_image: "",
        og_image: "",
        seo_title: "Test Blog Post | Mien Tuun",
        seo_description: "Test-Beschreibung",
        seo_keywords: ["test"],
        published: false,
        featured: false,
        reading_time: 2,
        author: "Blog Test System",
        status: "entwurf"
      };

      const { data, error } = await supabase
        .from('blog_posts')
        .insert([testPost])
        .select()
        .single();

      if (error) throw error;

      // Cleanup: Delete test post
      await supabase
        .from('blog_posts')
        .delete()
        .eq('id', data.id);

      this.testResults.push({
        testName: "Blog Post Creation",
        success: true,
        details: {
          createdId: data.id,
          slug: data.slug,
          cleanedUp: true
        },
        timing: Date.now() - startTime
      });
      
      console.log("[BlogTesting] ✅ Blog-Post-Erstellung erfolgreich");
    } catch (error: any) {
      this.testResults.push({
        testName: "Blog Post Creation",
        success: false,
        details: {},
        error: error.message,
        timing: Date.now() - startTime
      });
      
      console.error("[BlogTesting] ❌ Blog-Post-Erstellung fehlgeschlagen:", error);
    }
  }

  private async testEdgeFunctions(): Promise<void> {
    const startTime = Date.now();
    try {
      console.log("[BlogTesting] Teste Edge Functions...");
      
      // Test generate-blog-post function
      const { data, error } = await supabase.functions.invoke('generate-blog-post', {
        body: { prompt: 'Test prompt für Edge Function' }
      });

      if (error) throw error;

      this.testResults.push({
        testName: "Edge Functions",
        success: true,
        details: {
          functionTested: "generate-blog-post",
          responseReceived: !!data,
          responseKeys: data ? Object.keys(data) : []
        },
        timing: Date.now() - startTime
      });
      
      console.log("[BlogTesting] ✅ Edge Functions erfolgreich");
    } catch (error: any) {
      this.testResults.push({
        testName: "Edge Functions",
        success: false,
        details: { functionTested: "generate-blog-post" },
        error: error.message,
        timing: Date.now() - startTime
      });
      
      console.error("[BlogTesting] ❌ Edge Functions fehlgeschlagen:", error);
    }
  }

  getTestSummary(): { total: number; passed: number; failed: number; details: BlogTestResult[] } {
    const passed = this.testResults.filter(r => r.success).length;
    const failed = this.testResults.filter(r => !r.success).length;
    
    return {
      total: this.testResults.length,
      passed,
      failed,
      details: this.testResults
    };
  }
}

export const blogTestingService = new BlogTestingService();
