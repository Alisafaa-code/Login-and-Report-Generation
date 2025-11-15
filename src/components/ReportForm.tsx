import { useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "./ui/card";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Button } from "./ui/button";
import { Textarea } from "./ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./ui/select";
import {
  ArrowLeft,
  FileText,
  Send,
  Eye,
  Sparkles,
  Upload,
  X,
} from "lucide-react";
import { toast } from "sonner@2.0.3";

interface ReportFormProps {
  userInfo: {
    region: string;
    organization: string;
    reportType: string;
  };
  onBack: () => void;
  onGenerate: (reportData: ReportData) => void;
}

export interface ReportData {
  userInfo: {
    region: string;
    organization: string;
    reportType: string;
  };
  title: string;
  date: string;
  period: string;
  summary: string;
  details: string;
  theme: string;
  documentation?: {
    images: File[];
    videos: File[];
    links: string[];
  };
}

export function ReportForm({ userInfo, onBack, onGenerate }: ReportFormProps) {
  const [title, setTitle] = useState("");
  const [date, setDate] = useState(new Date().toISOString().split("T")[0]);
  const [period, setPeriod] = useState("");
  const [summary, setSummary] = useState("");
  const [details, setDetails] = useState("");
  const [theme, setTheme] = useState("professional");
  const [images, setImages] = useState<File[]>([]);
  const [videos, setVideos] = useState<File[]>([]);
  const [links, setLinks] = useState<string[]>([""]);
  const [aiLoading, setAiLoading] = useState(false);

  const needsDocumentation =
    userInfo.reportType === "achievement" ||
    userInfo.reportType === "maintenance";

  const handleFileUpload = (
    e: React.ChangeEvent<HTMLInputElement>,
    type: "image" | "video"
  ) => {
    const files = Array.from(e.target.files || []);
    if (type === "image") {
      setImages([...images, ...files]);
    } else {
      setVideos([...videos, ...files]);
    }
  };

  const removeFile = (index: number, type: "image" | "video") => {
    if (type === "image") {
      setImages(images.filter((_, i) => i !== index));
    } else {
      setVideos(videos.filter((_, i) => i !== index));
    }
  };

  const addLink = () => {
    setLinks([...links, ""]);
  };

  const updateLink = (index: number, value: string) => {
    const newLinks = [...links];
    newLinks[index] = value;
    setLinks(newLinks);
  };

  const removeLink = (index: number) => {
    setLinks(links.filter((_, i) => i !== index));
  };

  const handleAIAssist = async () => {
    setAiLoading(true);
    try {
      const { projectId, publicAnonKey } = await import(
        "../utils/supabase/info"
      );
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-207bf4c4/ai-assist`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${publicAnonKey}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            reportType: userInfo.reportType,
            organization: userInfo.organization,
            region: userInfo.region,
            currentSummary: summary,
            currentDetails: details,
          }),
        }
      );

      if (!response.ok) {
        throw new Error("AI assistance failed");
      }

      const data = await response.json();
      if (data.summary) setSummary(data.summary);
      if (data.details) setDetails(data.details);
      toast.success("تم تطبيق الاقتراحات الذكية!");
    } catch (error) {
      console.error("AI assistance error:", error);
      toast.error("خدمة المساعدة الذكية غير متاحة حالياً");
    } finally {
      setAiLoading(false);
    }
  };

  const handleSubmit = (action: "preview" | "generate" | "email") => {
    if (!title || !period || !summary || !details) {
      toast.error("يرجى ملء جميع الحقول المطلوبة");
      return;
    }

    const reportData: ReportData = {
      userInfo,
      title,
      date,
      period,
      summary,
      details,
      theme,
      documentation: needsDocumentation
        ? {
            images,
            videos,
            links: links.filter((link) => link.trim() !== ""),
          }
        : undefined,
    };

    if (action === "preview") {
      onGenerate(reportData);
      toast.success("جاري فتح المعاينة...");
    } else if (action === "email") {
      onGenerate(reportData);
      // Email will be handled in the preview/rating page
    } else {
      onGenerate(reportData);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4" dir="rtl">
      <div className="max-w-4xl mx-auto py-8">
        <Button variant="ghost" onClick={onBack} className="mb-4">
          <ArrowLeft className="mr-2 h-4 w-4" />
          العودة إلى تسجيل الدخول
        </Button>

        <Card>
          <CardHeader>
            <CardTitle>إنشاء تقرير {userInfo.reportType}</CardTitle>
            <CardDescription>
              {userInfo.organization} - {userInfo.region}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="title">عنوان التقرير</Label>
                <Input
                  id="title"
                  placeholder="أدخل عنوان التقرير"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="date">تاريخ التقرير</Label>
                <Input
                  id="date"
                  type="date"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="period">فترة الإبلاغ</Label>
              <Input
                id="period"
                placeholder="مثال: الربع الرابع 2024، يناير 2025، إلخ"
                value={period}
                onChange={(e) => setPeriod(e.target.value)}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="theme">موضوع التقرير</Label>
              <Select value={theme} onValueChange={setTheme}>
                <SelectTrigger id="theme">
                  <SelectValue placeholder="اختر الموضوع" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="professional">احترافي (أزرق)</SelectItem>
                  <SelectItem value="corporate">الشركات (رمادي)</SelectItem>
                  <SelectItem value="creative">إبداعي (بنفسجي)</SelectItem>
                  <SelectItem value="modern">حديث (فيروزي)</SelectItem>
                  <SelectItem value="elegant">أنيق (أسود وذهبي)</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="summary">الملخص التنفيذي</Label>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={handleAIAssist}
                  disabled={aiLoading}
                >
                  <Sparkles className="mr-2 h-4 w-4" />
                  {aiLoading ? "جاري التوليد..." : "مساعدة ذكية"}
                </Button>
              </div>
              <Textarea
                id="summary"
                placeholder="نظرة عامة موجزة على التقرير..."
                value={summary}
                onChange={(e) => setSummary(e.target.value)}
                rows={4}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="details">محتوى التقرير التفصيلي</Label>
              <Textarea
                id="details"
                placeholder="تفاصيل التقرير الشاملة والنتائج والتحليل..."
                value={details}
                onChange={(e) => setDetails(e.target.value)}
                rows={8}
                required
              />
            </div>

            {needsDocumentation && (
              <Card className="border-dashed">
                <CardHeader>
                  <CardTitle className="text-base">التوثيق</CardTitle>
                  <CardDescription>
                    أضف صور وفيديوهات وروابط مساعدة. سيتم إخفاء هذا القسم إذا لم يتم استخدامه.
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label>تحميل الصور</Label>
                    <Input
                      type="file"
                      accept="image/*"
                      multiple
                      onChange={(e) => handleFileUpload(e, "image")}
                    />
                    {images.length > 0 && (
                      <div className="flex flex-wrap gap-2 mt-2">
                        {images.map((file, index) => (
                          <div
                            key={index}
                            className="relative bg-muted rounded px-3 py-2 text-sm flex items-center gap-2"
                          >
                            <span className="truncate max-w-[150px]">
                              {file.name}
                            </span>
                            <button
                              type="button"
                              onClick={() => removeFile(index, "image")}
                              className="text-destructive hover:text-destructive/80"
                            >
                              <X className="h-4 w-4" />
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label>تحميل الفيديوهات</Label>
                    <Input
                      type="file"
                      accept="video/*"
                      multiple
                      onChange={(e) => handleFileUpload(e, "video")}
                    />
                    {videos.length > 0 && (
                      <div className="flex flex-wrap gap-2 mt-2">
                        {videos.map((file, index) => (
                          <div
                            key={index}
                            className="relative bg-muted rounded px-3 py-2 text-sm flex items-center gap-2"
                          >
                            <span className="truncate max-w-[150px]">
                              {file.name}
                            </span>
                            <button
                              type="button"
                              onClick={() => removeFile(index, "video")}
                              className="text-destructive hover:text-destructive/80"
                            >
                              <X className="h-4 w-4" />
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label>روابط المراجع</Label>
                    {links.map((link, index) => (
                      <div key={index} className="flex gap-2">
                        <Input
                          placeholder="https://example.com"
                          value={link}
                          onChange={(e) => updateLink(index, e.target.value)}
                        />
                        {links.length > 1 && (
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            onClick={() => removeLink(index)}
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        )}
                      </div>
                    ))}
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={addLink}
                    >
                      إضافة رابط آخر
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}

            <div className="flex flex-col sm:flex-row gap-3 pt-4">
              <Button
                type="button"
                variant="outline"
                className="flex-1"
                onClick={() => handleSubmit("preview")}
              >
                <Eye className="mr-2 h-4 w-4" />
                معاينة التقرير
              </Button>
              <Button
                type="button"
                variant="default"
                className="flex-1"
                onClick={() => handleSubmit("generate")}
              >
                <FileText className="mr-2 h-4 w-4" />
                إنشاء ملف PDF
              </Button>
              <Button
                type="button"
                variant="secondary"
                className="flex-1"
                onClick={() => handleSubmit("email")}
              >
                <Send className="mr-2 h-4 w-4" />
                الإرسال عبر البريد
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
