import { useState, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Textarea } from './ui/textarea';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from './ui/dialog';
import { ArrowLeft, Download, Send, Star } from 'lucide-react';
import { toast } from 'sonner@2.0.3';
import { ReportData } from './ReportForm';

interface ReportPreviewProps {
  reportData: ReportData;
  onBack: () => void;
  onNewReport: () => void;
}

export function ReportPreview({ reportData, onBack, onNewReport }: ReportPreviewProps) {
  const [showEmailDialog, setShowEmailDialog] = useState(false);
  const [showRatingDialog, setShowRatingDialog] = useState(false);
  const [email, setEmail] = useState('');
  const [emailMessage, setEmailMessage] = useState('');
  const [rating, setRating] = useState(0);
  const [feedback, setFeedback] = useState('');
  const [sending, setSending] = useState(false);
  const reportRef = useRef<HTMLDivElement>(null);

  const themeColors = {
    professional: {
      primary: 'bg-blue-600',
      secondary: 'bg-blue-100',
      text: 'text-blue-900',
      accent: 'border-blue-600',
    },
    corporate: {
      primary: 'bg-gray-700',
      secondary: 'bg-gray-100',
      text: 'text-gray-900',
      accent: 'border-gray-700',
    },
    creative: {
      primary: 'bg-purple-600',
      secondary: 'bg-purple-100',
      text: 'text-purple-900',
      accent: 'border-purple-600',
    },
    modern: {
      primary: 'bg-teal-600',
      secondary: 'bg-teal-100',
      text: 'text-teal-900',
      accent: 'border-teal-600',
    },
    elegant: {
      primary: 'bg-gray-900',
      secondary: 'bg-amber-50',
      text: 'text-gray-900',
      accent: 'border-amber-500',
    },
  };

  const theme = themeColors[reportData.theme as keyof typeof themeColors] || themeColors.professional;

  const hasDocumentation =
    reportData.documentation &&
    (reportData.documentation.images.length > 0 ||
      reportData.documentation.videos.length > 0 ||
      reportData.documentation.links.filter((l) => l.trim()).length > 0);

  const handleDownloadPDF = async () => {
    try {
      const { projectId, publicAnonKey } = await import('../utils/supabase/info');
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-207bf4c4/generate-pdf`,
        {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${publicAnonKey}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(reportData),
        }
      );

      if (!response.ok) {
        throw new Error('PDF generation failed');
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${reportData.title.replace(/\s+/g, '_')}_${reportData.date}.pdf`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
      toast.success('PDF downloaded successfully!');
    } catch (error) {
      console.error('PDF download error:', error);
      toast.error('Failed to generate PDF. Please try again.');
    }
  };

  const handleSendEmail = async () => {
    if (!email) {
      toast.error('Please enter an email address');
      return;
    }

    setSending(true);
    try {
      const { projectId, publicAnonKey } = await import('../utils/supabase/info');
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-207bf4c4/send-email`,
        {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${publicAnonKey}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            reportData,
            recipientEmail: email,
            message: emailMessage,
          }),
        }
      );

      if (!response.ok) {
        throw new Error('Email sending failed');
      }

      toast.success('Report sent successfully!');
      setShowEmailDialog(false);
      setShowRatingDialog(true);
    } catch (error) {
      console.error('Email sending error:', error);
      toast.error('Failed to send email. Please try again.');
    } finally {
      setSending(false);
    }
  };

  const handleSubmitRating = async () => {
    if (rating === 0) {
      toast.error('Please select a rating');
      return;
    }

    try {
      const { projectId, publicAnonKey } = await import('../utils/supabase/info');
      await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-207bf4c4/submit-rating`,
        {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${publicAnonKey}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            rating,
            feedback,
            reportType: reportData.userInfo.reportType,
          }),
        }
      );

      toast.success('Thank you for your feedback!');
      setShowRatingDialog(false);
      
      // Wait a bit before going back
      setTimeout(() => {
        onNewReport();
      }, 1000);
    } catch (error) {
      console.error('Rating submission error:', error);
      toast.error('Failed to submit rating');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <div className="max-w-5xl mx-auto py-8">
        <div className="flex items-center justify-between mb-4">
          <Button variant="ghost" onClick={onBack}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Edit
          </Button>
          <div className="flex gap-2">
            <Button variant="outline" onClick={handleDownloadPDF}>
              <Download className="mr-2 h-4 w-4" />
              Download PDF
            </Button>
            <Button onClick={() => setShowEmailDialog(true)}>
              <Send className="mr-2 h-4 w-4" />
              Send via Email
            </Button>
          </div>
        </div>

        {/* Report Preview */}
        <div ref={reportRef} className="bg-white rounded-lg shadow-2xl p-8 md:p-12">
          {/* Header */}
          <div className={`${theme.primary} text-white p-8 rounded-lg mb-8`}>
            <h1 className="text-3xl mb-2">{reportData.title}</h1>
            <div className="flex flex-wrap gap-4 text-sm opacity-90">
              <span>{reportData.userInfo.organization}</span>
              <span>•</span>
              <span>{reportData.userInfo.region}</span>
              <span>•</span>
              <span>{reportData.date}</span>
            </div>
          </div>

          {/* Report Type and Period */}
          <div className={`${theme.secondary} p-6 rounded-lg mb-6`}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-muted-foreground">Report Type</p>
                <p className="capitalize">{reportData.userInfo.reportType}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Reporting Period</p>
                <p>{reportData.period}</p>
              </div>
            </div>
          </div>

          {/* Executive Summary */}
          <div className="mb-8">
            <h2 className={`text-xl mb-4 pb-2 border-b-2 ${theme.accent}`}>
              Executive Summary
            </h2>
            <p className="whitespace-pre-wrap">{reportData.summary}</p>
          </div>

          {/* Detailed Content */}
          <div className="mb-8">
            <h2 className={`text-xl mb-4 pb-2 border-b-2 ${theme.accent}`}>
              Detailed Report
            </h2>
            <p className="whitespace-pre-wrap">{reportData.details}</p>
          </div>

          {/* Documentation Section (only if has content) */}
          {hasDocumentation && (
            <div className="mb-8">
              <h2 className={`text-xl mb-4 pb-2 border-b-2 ${theme.accent}`}>
                Supporting Documentation
              </h2>
              
              {reportData.documentation!.images.length > 0 && (
                <div className="mb-4">
                  <h3 className="mb-2">Attached Images</h3>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                    {reportData.documentation!.images.map((file, index) => (
                      <div key={index} className="bg-muted p-2 rounded text-sm truncate">
                        📷 {file.name}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {reportData.documentation!.videos.length > 0 && (
                <div className="mb-4">
                  <h3 className="mb-2">Attached Videos</h3>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                    {reportData.documentation!.videos.map((file, index) => (
                      <div key={index} className="bg-muted p-2 rounded text-sm truncate">
                        🎥 {file.name}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {reportData.documentation!.links.filter((l) => l.trim()).length > 0 && (
                <div>
                  <h3 className="mb-2">Reference Links</h3>
                  <ul className="space-y-1">
                    {reportData.documentation!.links
                      .filter((link) => link.trim())
                      .map((link, index) => (
                        <li key={index} className="text-sm text-blue-600 hover:underline">
                          🔗 {link}
                        </li>
                      ))}
                  </ul>
                </div>
              )}
            </div>
          )}

          {/* Footer */}
          <div className={`${theme.secondary} p-4 rounded-lg text-center text-sm text-muted-foreground mt-12`}>
            <p>Generated by Report Management System</p>
            <p>{new Date().toLocaleString()}</p>
          </div>
        </div>
      </div>

      {/* Email Dialog */}
      <Dialog open={showEmailDialog} onOpenChange={setShowEmailDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Send Report via Email</DialogTitle>
            <DialogDescription>
              Enter the recipient's email address and an optional message
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Recipient Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="recipient@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="message">Message (Optional)</Label>
              <Textarea
                id="message"
                placeholder="Add a message to include in the email..."
                value={emailMessage}
                onChange={(e) => setEmailMessage(e.target.value)}
                rows={3}
              />
            </div>
            <div className="flex gap-2 justify-end">
              <Button variant="outline" onClick={() => setShowEmailDialog(false)}>
                Cancel
              </Button>
              <Button onClick={handleSendEmail} disabled={sending}>
                {sending ? 'Sending...' : 'Send Email'}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Rating Dialog */}
      <Dialog open={showRatingDialog} onOpenChange={setShowRatingDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Rate Your Experience</DialogTitle>
            <DialogDescription>
              How would you rate the app and service?
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Your Rating</Label>
              <div className="flex gap-2 justify-center">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    type="button"
                    onClick={() => setRating(star)}
                    className="transition-transform hover:scale-110"
                  >
                    <Star
                      className={`h-8 w-8 ${
                        star <= rating
                          ? 'fill-yellow-400 text-yellow-400'
                          : 'text-gray-300'
                      }`}
                    />
                  </button>
                ))}
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="feedback">Additional Feedback (Optional)</Label>
              <Textarea
                id="feedback"
                placeholder="Tell us about your experience..."
                value={feedback}
                onChange={(e) => setFeedback(e.target.value)}
                rows={3}
              />
            </div>
            <div className="flex gap-2 justify-end">
              <Button variant="outline" onClick={() => setShowRatingDialog(false)}>
                Skip
              </Button>
              <Button onClick={handleSubmitRating}>
                Submit Rating
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
