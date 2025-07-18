import { supabase } from "@/integrations/supabase/client";
import { AdminBlogPost } from "@/types/admin";

interface TestResult {
  testName: string;
  expected: string;
  actual: string;
  status: 'PASS' | 'FAIL' | 'WARNING';
  details?: string;
  timestamp: Date;
}

interface BlogTestArticle {
  id?: string;
  title: string;
  content: string;
  excerpt: string;
  author: string;
  category: string;
  status: 'entwurf' | 'veröffentlicht';
  featured: boolean;
  tags: string[];
}

class BlogDataFlowTester {
  private testResults: TestResult[] = [];
  private testArticles: BlogTestArticle[] = [];

  private log(testName: string, expected: string, actual: string, status: 'PASS' | 'FAIL' | 'WARNING', details?: string) {
    const result: TestResult = {
      testName,
      expected,
      actual,
      status,
      details,
      timestamp: new Date()
    };
    this.testResults.push(result);
    console.log(`[BlogDataFlowTest] ${status}: ${testName}`, result);
  }

  private generateTestArticle(prefix: string = "Test"): BlogTestArticle {
    const timestamp = Date.now();
    return {
      title: `${prefix} Artikel ${timestamp}`,
      content: `# ${prefix} Content\n\nDies ist ein automatisch generierter Testartikel für die Datenfluss-Validierung.\n\nErstellt am: ${new Date().toLocaleString('de-DE')}`,
      excerpt: `${prefix} Kurzbeschreibung für automatisierten Test`,
      author: "Datenfluss Tester",
      category: "Testing",
      status: "entwurf",
      featured: false,
      tags: ["test", "datenfluss", "validierung"]
    };
  }

  async testBlogArticleCreation(): Promise<TestResult[]> {
    console.log("[BlogDataFlowTest] Starting blog article creation test...");
    
    try {
      // Test 1: Artikel mit allen Metadaten erstellen
      const testArticle = this.generateTestArticle("Neuanlage");
      
      const articleData = {
        slug: `test-artikel-${Date.now()}`,
        title: testArticle.title,
        content: testArticle.content,
        excerpt: testArticle.excerpt,
        author: testArticle.author,
        category: testArticle.category,
        tags: testArticle.tags,
        status: testArticle.status,
        featured: testArticle.featured,
        published: testArticle.status === 'veröffentlicht',
        reading_time: Math.ceil(testArticle.content.split(/\s+/).length / 160),
        seo_title: testArticle.title,
        seo_description: testArticle.excerpt,
        seo_keywords: testArticle.tags,
        featured_image: "https://images.unsplash.com/photo-1486312338219-ce68d2c6f44d?w=800&h=400&fit=crop",
        content_types: ["blog"],
        audiences: ["anfaenger"],
        published_at: new Date().toISOString().split('T')[0]
      };

      const { data: createdArticle, error: createError } = await supabase
        .from('blog_posts')
        .insert([articleData])
        .select()
        .maybeSingle();

      if (createError || !createdArticle) {
        this.log(
          "Artikel-Erstellung",
          "Erfolgreiche Speicherung in Datenbank",
          `Fehler: ${createError.message}`,
          "FAIL",
          `SQL Error Code: ${createError.code}, Details: ${createError.details}`
        );
        return this.testResults;
      }

      this.log(
        "Artikel-Erstellung",
        "Artikel erfolgreich in Datenbank gespeichert",
        `Artikel mit ID ${createdArticle.id} erstellt`,
        "PASS",
        `Slug: ${createdArticle.slug}, Status: ${createdArticle.status}`
      );

      testArticle.id = createdArticle.id;
      this.testArticles.push(testArticle);

      // Test 2: Metadaten-Validierung
      await this.validateArticleMetadata(createdArticle);

      // Test 3: Dashboard-Sichtbarkeit
      await this.testDashboardVisibility(createdArticle.id);

      return this.testResults;

    } catch (error: any) {
      this.log(
        "Artikel-Erstellung (Exception)",
        "Keine unbehandelten Exceptions",
        `Exception: ${error.message}`,
        "FAIL",
        error.stack
      );
      return this.testResults;
    }
  }

  private async validateArticleMetadata(article: any): Promise<void> {
    // Überprüfe alle erforderlichen Metadaten
    const requiredFields = ['id', 'title', 'content', 'excerpt', 'author', 'category', 'status'];
    
    for (const field of requiredFields) {
      if (!article[field]) {
        this.log(
          `Metadaten-Validierung: ${field}`,
          `Feld ${field} sollte gesetzt sein`,
          `Feld ${field} ist ${article[field]}`,
          "FAIL"
        );
      } else {
        this.log(
          `Metadaten-Validierung: ${field}`,
          `Feld ${field} korrekt gesetzt`,
          `Wert: ${article[field]}`,
          "PASS"
        );
      }
    }

    // Validiere Datentypen
    if (typeof article.featured !== 'boolean') {
      this.log(
        "Metadaten-Validierung: featured",
        "featured sollte boolean sein",
        `featured ist ${typeof article.featured}`,
        "FAIL"
      );
    }

    if (!Array.isArray(article.tags)) {
      this.log(
        "Metadaten-Validierung: tags",
        "tags sollte Array sein",
        `tags ist ${typeof article.tags}`,
        "FAIL"
      );
    }

    // Validiere Datum
    const publishedDate = new Date(article.published_at);
    if (isNaN(publishedDate.getTime())) {
      this.log(
        "Metadaten-Validierung: published_at",
        "Gültiges Datum",
        `Ungültiges Datum: ${article.published_at}`,
        "FAIL"
      );
    }
  }

  private async testDashboardVisibility(articleId: string): Promise<void> {
    try {
      // Simuliere Dashboard-Abfrage
      const { data: dashboardArticles, error } = await supabase
        .from('blog_posts')
        .select('id, title, status, author, published_at, category, featured')
        .order('published_at', { ascending: false })
        .limit(50);

      if (error) {
        this.log(
          "Dashboard-Sichtbarkeit",
          "Artikel im Dashboard sichtbar",
          `Dashboard-Abfrage fehlgeschlagen: ${error.message}`,
          "FAIL"
        );
        return;
      }

      const isVisible = dashboardArticles?.some(article => article.id === articleId);
      
      if (isVisible) {
        this.log(
          "Dashboard-Sichtbarkeit",
          "Artikel im Dashboard sichtbar",
          "Artikel erfolgreich im Dashboard geladen",
          "PASS"
        );
      } else {
        this.log(
          "Dashboard-Sichtbarkeit",
          "Artikel im Dashboard sichtbar",
          "Artikel nicht im Dashboard gefunden",
          "FAIL",
          `Geladene Artikel: ${dashboardArticles?.length || 0}`
        );
      }
    } catch (error: any) {
      this.log(
        "Dashboard-Sichtbarkeit (Exception)",
        "Keine Exceptions beim Dashboard-Load",
        `Exception: ${error.message}`,
        "FAIL"
      );
    }
  }

  async testDataPersistence(): Promise<TestResult[]> {
    console.log("[BlogDataFlowTest] Starting data persistence tests...");

    try {
      // Test 1: Entwurf speichern
      await this.testDraftSaving();

      // Test 2: Artikel veröffentlichen
      await this.testArticlePublishing();

      // Test 3: Artikel bearbeiten
      await this.testArticleEditing();

      // Test 4: Status ändern
      await this.testStatusChanges();

      // Test 5: Artikel löschen
      await this.testArticleDeletion();

      return this.testResults;

    } catch (error: any) {
      this.log(
        "Data Persistence Test Suite",
        "Alle Tests erfolgreich",
        `Test Suite Fehler: ${error.message}`,
        "FAIL"
      );
      return this.testResults;
    }
  }

  private async testDraftSaving(): Promise<void> {
    const draftArticle = this.generateTestArticle("Entwurf");
    draftArticle.status = "entwurf";

    const articleData = {
      slug: `draft-test-${Date.now()}`,
      title: draftArticle.title,
      content: draftArticle.content,
      excerpt: draftArticle.excerpt,
      author: draftArticle.author,
      category: draftArticle.category,
      status: draftArticle.status,
      published: false,
      tags: draftArticle.tags,
      reading_time: 5,
      seo_title: draftArticle.title,
      seo_description: draftArticle.excerpt,
      seo_keywords: draftArticle.tags,
      featured_image: "",
      content_types: ["blog"],
      audiences: ["anfaenger"],
      published_at: new Date().toISOString().split('T')[0]
    };

    const { data, error } = await supabase
      .from('blog_posts')
      .insert([articleData])
      .select()
      .maybeSingle();

    if (error || !data) {
      this.log(
        "Entwurf-Speicherung",
        "Entwurf erfolgreich gespeichert",
        `Fehler: ${error.message}`,
        "FAIL"
      );
    } else {
      this.log(
        "Entwurf-Speicherung",
        "Status: entwurf, published: false",
        `Status: ${data.status}, published: ${data.published}`,
        data.status === 'entwurf' && data.published === false ? "PASS" : "FAIL"
      );
      
      draftArticle.id = data.id;
      this.testArticles.push(draftArticle);
    }
  }

  private async testArticlePublishing(): Promise<void> {
    const publishArticle = this.generateTestArticle("Veröffentlichung");
    publishArticle.status = "veröffentlicht";

    const articleData = {
      slug: `publish-test-${Date.now()}`,
      title: publishArticle.title,
      content: publishArticle.content,
      excerpt: publishArticle.excerpt,
      author: publishArticle.author,
      category: publishArticle.category,
      status: publishArticle.status,
      published: true,
      tags: publishArticle.tags,
      reading_time: 5,
      seo_title: publishArticle.title,
      seo_description: publishArticle.excerpt,
      seo_keywords: publishArticle.tags,
      featured_image: "",
      content_types: ["blog"],
      audiences: ["anfaenger"],
      published_at: new Date().toISOString().split('T')[0]
    };

    const { data, error } = await supabase
      .from('blog_posts')
      .insert([articleData])
      .select()
      .maybeSingle();

    if (error || !data) {
      this.log(
        "Artikel-Veröffentlichung",
        "Artikel erfolgreich veröffentlicht",
        `Fehler: ${error.message}`,
        "FAIL"
      );
    } else {
      this.log(
        "Artikel-Veröffentlichung",
        "Status: veröffentlicht, published: true",
        `Status: ${data.status}, published: ${data.published}`,
        data.status === 'veröffentlicht' && data.published === true ? "PASS" : "FAIL"
      );
      
      publishArticle.id = data.id;
      this.testArticles.push(publishArticle);
    }
  }

  private async testArticleEditing(): Promise<void> {
    if (this.testArticles.length === 0) {
      this.log(
        "Artikel-Bearbeitung",
        "Testartikel verfügbar",
        "Keine Testartikel für Bearbeitung verfügbar",
        "WARNING"
      );
      return;
    }

    const testArticle = this.testArticles[0];
    if (!testArticle.id) return;

    const updatedTitle = `${testArticle.title} - BEARBEITET`;
    const updatedContent = `${testArticle.content}\n\n**UPDATE:** Artikel wurde bearbeitet am ${new Date().toLocaleString('de-DE')}`;

    const { data, error } = await supabase
      .from('blog_posts')
      .update({
        title: updatedTitle,
        content: updatedContent
      })
      .eq('id', testArticle.id)
      .select()
      .maybeSingle();

    if (error || !data) {
      this.log(
        "Artikel-Bearbeitung",
        "Artikel erfolgreich bearbeitet",
        `Fehler: ${error.message}`,
        "FAIL"
      );
    } else {
      const titleMatch = data.title === updatedTitle;
      const contentMatch = data.content === updatedContent;
      
      this.log(
        "Artikel-Bearbeitung",
        "Titel und Content korrekt aktualisiert",
        `Titel match: ${titleMatch}, Content match: ${contentMatch}`,
        titleMatch && contentMatch ? "PASS" : "FAIL"
      );
    }
  }

  private async testStatusChanges(): Promise<void> {
    if (this.testArticles.length === 0) {
      this.log(
        "Status-Änderung",
        "Testartikel verfügbar",
        "Keine Testartikel für Status-Änderung verfügbar",
        "WARNING"
      );
      return;
    }

    const testArticle = this.testArticles.find(a => a.status === 'entwurf');
    if (!testArticle?.id) {
      this.log(
        "Status-Änderung",
        "Entwurf-Artikel verfügbar",
        "Kein Entwurf-Artikel für Status-Test verfügbar",
        "WARNING"
      );
      return;
    }

    // Entwurf -> Veröffentlicht
    const { data, error } = await supabase
      .from('blog_posts')
      .update({
        status: 'veröffentlicht',
        published: true
      })
      .eq('id', testArticle.id)
      .select()
      .maybeSingle();

    if (error || !data) {
      this.log(
        "Status-Änderung (Entwurf → Veröffentlicht)",
        "Status erfolgreich geändert",
        `Fehler: ${error.message}`,
        "FAIL"
      );
    } else {
      this.log(
        "Status-Änderung (Entwurf → Veröffentlicht)",
        "Status: veröffentlicht, published: true",
        `Status: ${data.status}, published: ${data.published}`,
        data.status === 'veröffentlicht' && data.published === true ? "PASS" : "FAIL"
      );

      // Zurück zu Entwurf
      const { data: revertData, error: revertError } = await supabase
        .from('blog_posts')
        .update({
          status: 'entwurf',
          published: false
        })
        .eq('id', testArticle.id)
        .select()
        .maybeSingle();

      if (revertError || !revertData) {
        this.log(
          "Status-Änderung (Veröffentlicht → Entwurf)",
          "Status erfolgreich zurückgesetzt",
          `Fehler: ${revertError.message}`,
          "FAIL"
        );
      } else {
        this.log(
          "Status-Änderung (Veröffentlicht → Entwurf)",
          "Status: entwurf, published: false",
          `Status: ${revertData.status}, published: ${revertData.published}`,
          revertData.status === 'entwurf' && revertData.published === false ? "PASS" : "FAIL"
        );
      }
    }
  }

  private async testArticleDeletion(): Promise<void> {
    if (this.testArticles.length === 0) {
      this.log(
        "Artikel-Löschung",
        "Testartikel verfügbar",
        "Keine Testartikel für Löschung verfügbar",
        "WARNING"
      );
      return;
    }

    // Lösche alle Testartikel
    for (const testArticle of this.testArticles) {
      if (!testArticle.id) continue;

      const { error } = await supabase
        .from('blog_posts')
        .delete()
        .eq('id', testArticle.id);

      if (error) {
        this.log(
          "Artikel-Löschung",
          `Artikel ${testArticle.id} erfolgreich gelöscht`,
          `Fehler: ${error.message}`,
          "FAIL"
        );
      } else {
        // Überprüfe, ob Artikel wirklich gelöscht wurde
        const { data: checkData } = await supabase
          .from('blog_posts')
          .select('id')
          .eq('id', testArticle.id)
          .maybeSingle();

        this.log(
          "Artikel-Löschung",
          `Artikel ${testArticle.id} nicht mehr in Datenbank`,
          checkData ? `Artikel noch vorhanden` : `Artikel erfolgreich gelöscht`,
          checkData ? "FAIL" : "PASS"
        );
      }
    }
  }

  async runCompleteDataFlowTest(): Promise<{
    summary: {
      totalTests: number;
      passed: number;
      failed: number;
      warnings: number;
      successRate: number;
    };
    results: TestResult[];
    report: string;
  }> {
    console.log("[BlogDataFlowTest] Starting complete data flow test suite...");
    
    this.testResults = [];
    this.testArticles = [];

    // Führe alle Tests durch
    await this.testBlogArticleCreation();
    await this.testDataPersistence();

    // Berechne Statistiken
    const totalTests = this.testResults.length;
    const passed = this.testResults.filter(r => r.status === 'PASS').length;
    const failed = this.testResults.filter(r => r.status === 'FAIL').length;
    const warnings = this.testResults.filter(r => r.status === 'WARNING').length;
    const successRate = totalTests > 0 ? Math.round((passed / totalTests) * 100) : 0;

    const summary = {
      totalTests,
      passed,
      failed,
      warnings,
      successRate
    };

    const report = this.generateTestReport(summary);

    return {
      summary,
      results: this.testResults,
      report
    };
  }

  private generateTestReport(summary: any): string {
    const timestamp = new Date().toLocaleString('de-DE');
    
    let report = `# Blog-Artikel Datenfluss Test Report\n\n`;
    report += `**Erstellt am:** ${timestamp}\n\n`;
    report += `## 📊 Zusammenfassung\n\n`;
    report += `- **Gesamte Tests:** ${summary.totalTests}\n`;
    report += `- **Erfolgreich:** ${summary.passed}\n`;
    report += `- **Fehlgeschlagen:** ${summary.failed}\n`;
    report += `- **Warnungen:** ${summary.warnings}\n`;
    report += `- **Erfolgsrate:** ${summary.successRate}%\n\n`;

    if (summary.failed > 0) {
      report += `## ❌ Fehlgeschlagene Tests\n\n`;
      const failedTests = this.testResults.filter(r => r.status === 'FAIL');
      failedTests.forEach(test => {
        report += `### ${test.testName}\n`;
        report += `- **Erwartet:** ${test.expected}\n`;
        report += `- **Tatsächlich:** ${test.actual}\n`;
        if (test.details) {
          report += `- **Details:** ${test.details}\n`;
        }
        report += `- **Zeitstempel:** ${test.timestamp.toLocaleString('de-DE')}\n\n`;
      });
    }

    if (summary.warnings > 0) {
      report += `## ⚠️ Warnungen\n\n`;
      const warningTests = this.testResults.filter(r => r.status === 'WARNING');
      warningTests.forEach(test => {
        report += `### ${test.testName}\n`;
        report += `- **Erwartet:** ${test.expected}\n`;
        report += `- **Tatsächlich:** ${test.actual}\n`;
        if (test.details) {
          report += `- **Details:** ${test.details}\n`;
        }
        report += `- **Zeitstempel:** ${test.timestamp.toLocaleString('de-DE')}\n\n`;
      });
    }

    report += `## ✅ Erfolgreiche Tests\n\n`;
    const passedTests = this.testResults.filter(r => r.status === 'PASS');
    passedTests.forEach(test => {
      report += `- **${test.testName}:** ${test.actual}\n`;
    });

    report += `\n## 🔍 Detaillierte Testergebnisse\n\n`;
    this.testResults.forEach(test => {
      const icon = test.status === 'PASS' ? '✅' : test.status === 'FAIL' ? '❌' : '⚠️';
      report += `${icon} **${test.testName}**\n`;
      report += `   - Erwartet: ${test.expected}\n`;
      report += `   - Tatsächlich: ${test.actual}\n`;
      if (test.details) {
        report += `   - Details: ${test.details}\n`;
      }
      report += `   - Zeit: ${test.timestamp.toLocaleString('de-DE')}\n\n`;
    });

    return report;
  }

  getTestResults(): TestResult[] {
    return this.testResults;
  }

  getTestSummary() {
    const totalTests = this.testResults.length;
    const passed = this.testResults.filter(r => r.status === 'PASS').length;
    const failed = this.testResults.filter(r => r.status === 'FAIL').length;
    const warnings = this.testResults.filter(r => r.status === 'WARNING').length;
    
    return {
      totalTests,
      passed,
      failed,
      warnings,
      successRate: totalTests > 0 ? Math.round((passed / totalTests) * 100) : 0
    };
  }
}

export const blogDataFlowTester = new BlogDataFlowTester();
