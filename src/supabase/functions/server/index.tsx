import { Hono } from "npm:hono";
import { cors } from "npm:hono/cors";
import { logger } from "npm:hono/logger";
import * as kv from "./kv_store.tsx";

const app = new Hono();

// Enable logger
app.use("*", logger(console.log));

// Enable CORS for all routes and methods
app.use(
  "/*",
  cors({
    origin: "*",
    allowHeaders: ["Content-Type", "Authorization"],
    allowMethods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    exposeHeaders: ["Content-Length"],
    maxAge: 600,
  })
);

// Health check endpoint
app.get("/make-server-207bf4c4/health", (c) => {
  return c.json({ status: "ok" });
});

// Get usage count
app.get("/make-server-207bf4c4/usage-count", async (c) => {
  try {
    const count = await kv.get("app_usage_count");
    return c.json({ count: count || 0 });
  } catch (error) {
    console.error("Error fetching usage count:", error);
    return c.json({ count: 0 }, 200);
  }
});

// Increment usage count
app.post("/make-server-207bf4c4/increment-usage", async (c) => {
  try {
    const currentCount = (await kv.get("app_usage_count")) || 0;
    const newCount = currentCount + 1;
    await kv.set("app_usage_count", newCount);
    return c.json({ count: newCount });
  } catch (error) {
    console.error("Error incrementing usage count:", error);
    return c.json({ error: "Failed to increment usage count" }, 500);
  }
});

// AI assistance endpoint (placeholder - would need actual AI API integration)
app.post("/make-server-207bf4c4/ai-assist", async (c) => {
  try {
    const body = await c.req.json();
    const { reportType, organization, region, currentSummary, currentDetails } =
      body;

    // This is a mock response. In production, you would integrate with an AI API
    // like OpenAI, Claude, or similar services
    const suggestions = {
      summary:
        currentSummary ||
        `يقدم هذا التقرير ${reportType} نظرة شاملة على عمليات ${organization} في ${region}. تشمل الميزات الرئيسية تقدماً كبيراً عبر جميع المقاييس، وتنفيذ ناجح للمبادرات الاستراتيجية، ومسار إيجابي للنمو المستمر.`,
      details:
        currentDetails ||
        `التحليل التفصيلي:\n\n1. نظرة عامة\n${organization} في ${region} أظهرت أداءً استثنائياً خلال فترة الإبلاغ.\n\n2. الإنجازات الرئيسية\n- إنجاز المشاريع الرئيسية في الوقت المحدد وضمن الميزانية\n- تحسين الكفاءة التشغيلية من خلال تنفيذ عمليات جديدة\n- تعزيز رضا أصحاب المصلحة والمشاركة\n\n3. التحديات والحلول\n- تحديد المجالات المحتملة للتحسين\n- وضع خطط عمل لمعالجة التحديات\n- تخصيص الموارد للتحسين المستمر\n\n4. التوقعات المستقبلية\nبالنظر إلى الأمام، ${organization} في موضع جيد للاستفادة من الفرص الناشئة مع الحفاظ على التميز التشغيلي.`,
    };

    return c.json(suggestions);
  } catch (error) {
    console.error("AI assistance error:", error);
    return c.json({ error: "AI assistance failed" }, 500);
  }
});

// Generate PDF endpoint
app.post("/make-server-207bf4c4/generate-pdf", async (c) => {
  try {
    const reportData = await c.req.json();

    // In a real implementation, you would use a PDF generation library
    // For now, we'll create a simple HTML-based response that could be converted to PDF
    const html = generateReportHTML(reportData);

    // Return HTML content that can be printed/saved as PDF
    // In production, use libraries like puppeteer or pdfmake
    return new Response(html, {
      headers: {
        "Content-Type": "text/html",
        "Content-Disposition": `attachment; filename="report.html"`,
      },
    });
  } catch (error) {
    console.error("PDF generation error:", error);
    return c.json({ error: "PDF generation failed" }, 500);
  }
});

// Send email endpoint
app.post("/make-server-207bf4c4/send-email", async (c) => {
  try {
    const { reportData, recipientEmail, message } = await c.req.json();

    // In production, integrate with an email service like SendGrid, Mailgun, or Resend
    // For now, we'll log the attempt and return success
    console.log(`Sending report to ${recipientEmail}`);
    console.log(`Report: ${reportData.title}`);
    console.log(`Message: ${message}`);

    // Store email log
    const emailLogs = (await kv.get("email_logs")) || [];
    emailLogs.push({
      timestamp: new Date().toISOString(),
      recipient: recipientEmail,
      reportTitle: reportData.title,
      reportType: reportData.userInfo.reportType,
    });
    await kv.set("email_logs", emailLogs);

    return c.json({ success: true, message: "Email sent successfully" });
  } catch (error) {
    console.error("Email sending error:", error);
    return c.json({ error: "Failed to send email" }, 500);
  }
});

// Submit rating endpoint
app.post("/make-server-207bf4c4/submit-rating", async (c) => {
  try {
    const { rating, feedback, reportType } = await c.req.json();

    // Store rating
    const ratings = (await kv.get("app_ratings")) || [];
    ratings.push({
      timestamp: new Date().toISOString(),
      rating,
      feedback,
      reportType,
    });
    await kv.set("app_ratings", ratings);

    // Update average rating
    const totalRating = ratings.reduce(
      (sum: number, r: any) => sum + r.rating,
      0
    );
    const avgRating = totalRating / ratings.length;
    await kv.set("average_rating", avgRating);

    return c.json({ success: true, averageRating: avgRating });
  } catch (error) {
    console.error("Rating submission error:", error);
    return c.json({ error: "Failed to submit rating" }, 500);
  }
});

// Helper function to generate HTML for PDF
function generateReportHTML(reportData: any): string {
  const themeColors: any = {
    professional: { primary: "#2563eb", secondary: "#dbeafe", text: "#1e3a8a" },
    corporate: { primary: "#374151", secondary: "#f3f4f6", text: "#111827" },
    creative: { primary: "#9333ea", secondary: "#f3e8ff", text: "#581c87" },
    modern: { primary: "#0d9488", secondary: "#ccfbf1", text: "#134e4a" },
    elegant: { primary: "#111827", secondary: "#fef3c7", text: "#111827" },
  };

  const theme = themeColors[reportData.theme] || themeColors.professional;

  const hasDocumentation =
    reportData.documentation &&
    (reportData.documentation.images.length > 0 ||
      reportData.documentation.videos.length > 0 ||
      reportData.documentation.links.filter((l: string) => l.trim()).length >
        0);

  return `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <title>${reportData.title}</title>
        <style>
          body { font-family: Arial, sans-serif; margin: 40px; line-height: 1.6; }
          .header { background-color: ${
            theme.primary
          }; color: white; padding: 30px; border-radius: 8px; margin-bottom: 30px; }
          .header h1 { margin: 0 0 10px 0; font-size: 28px; }
          .header-info { font-size: 14px; opacity: 0.9; }
          .info-box { background-color: ${
            theme.secondary
          }; padding: 20px; border-radius: 8px; margin-bottom: 20px; }
          .section { margin-bottom: 30px; }
          .section h2 { color: ${theme.text}; border-bottom: 2px solid ${
    theme.primary
  }; padding-bottom: 10px; }
          .footer { background-color: ${
            theme.secondary
          }; padding: 15px; border-radius: 8px; text-align: center; font-size: 12px; color: #666; margin-top: 50px; }
          pre { white-space: pre-wrap; word-wrap: break-word; }
        </style>
      </head>
      <body>
        <div class="header">
          <h1>${reportData.title}</h1>
          <div class="header-info">
            ${reportData.userInfo.organization} • ${
    reportData.userInfo.region
  } • ${reportData.date}
          </div>
        </div>
        
        <div class="info-box">
          <strong>نوع التقرير:</strong> ${reportData.userInfo.reportType}<br>
          <strong>فترة الإبلاغ:</strong> ${reportData.period}
        </div>
        
        <div class="section">
          <h2>الملخص التنفيذي</h2>
          <pre>${reportData.summary}</pre>
        </div>
        
        <div class="section">
          <h2>التقرير التفصيلي</h2>
          <pre>${reportData.details}</pre>
        </div>
        
        ${
          hasDocumentation
            ? `
          <div class="section">
            <h2>التوثيق المساعد</h2>
            ${
              reportData.documentation.images.length > 0
                ? `
              <h3>الصور المرفقة</h3>
              <ul>
                ${reportData.documentation.images
                  .map((img: any) => `<li>${img.name}</li>`)
                  .join("")}
              </ul>
            `
                : ""
            }
            ${
              reportData.documentation.videos.length > 0
                ? `
              <h3>الفيديوهات المرفقة</h3>
              <ul>
                ${reportData.documentation.videos
                  .map((vid: any) => `<li>${vid.name}</li>`)
                  .join("")}
              </ul>
            `
                : ""
            }
            ${
              reportData.documentation.links.filter((l: string) => l.trim())
                .length > 0
                ? `
              <h3>روابط المراجع</h3>
              <ul>
                ${reportData.documentation.links
                  .filter((l: string) => l.trim())
                  .map(
                    (link: string) => `<li><a href="${link}">${link}</a></li>`
                  )
                  .join("")}
              </ul>
            `
                : ""
            }
          </div>
        `
            : ""
        }
        
        <div class="footer">
          <p>تم إنشاؤه بواسطة نظام إدارة التقارير</p>
          <p>${new Date().toLocaleString("ar-SA")}</p>
        </div>
      </body>
    </html>
  `;
}

Deno.serve(app.fetch);
