import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Button } from './ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { ImageWithFallback } from './figma/ImageWithFallback';
import { Eye } from 'lucide-react';

interface LoginPageProps {
  onLogin: (data: {
    region: string;
    organization: string;
    reportType: string;
    customReportType?: string;
  }) => void;
}

export function LoginPage({ onLogin }: LoginPageProps) {
  const [region, setRegion] = useState('');
  const [organization, setOrganization] = useState('');
  const [reportType, setReportType] = useState('');
  const [customReportType, setCustomReportType] = useState('');
  const [usageCount, setUsageCount] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Fetch usage count from backend
    const fetchUsageCount = async () => {
      try {
        const { projectId, publicAnonKey } = await import('../utils/supabase/info');
        const response = await fetch(
          `https://${projectId}.supabase.co/functions/v1/make-server-207bf4c4/usage-count`,
          {
            headers: {
              Authorization: `Bearer ${publicAnonKey}`,
            },
          }
        );
        const data = await response.json();
        setUsageCount(data.count || 0);
      } catch (error) {
        console.error('Error fetching usage count:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchUsageCount();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!region || !organization || !reportType) {
      return;
    }

    if (reportType === 'other' && !customReportType) {
      return;
    }

    // Increment usage count
    try {
      const { projectId, publicAnonKey } = await import('../utils/supabase/info');
      await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-207bf4c4/increment-usage`,
        {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${publicAnonKey}`,
          },
        }
      );
    } catch (error) {
      console.error('Error incrementing usage count:', error);
    }

    onLogin({
      region,
      organization,
      reportType: reportType === 'other' ? customReportType : reportType,
      customReportType: reportType === 'other' ? customReportType : undefined,
    });
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">
            <ImageWithFallback
              src="https://images.unsplash.com/photo-1760138270903-d95903188730?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxjb3Jwb3JhdGUlMjBsb2dvJTIwYnVzaW5lc3N8ZW58MXx8fHwxNzYyNjI4MTgwfDA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral"
              alt="Organization Logo"
              className="h-20 w-20 rounded-full object-cover"
            />
          </div>
          <CardTitle>Report Management System</CardTitle>
          <CardDescription>Enter your details to generate a report</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="region">Region</Label>
              <Input
                id="region"
                placeholder="Enter region"
                value={region}
                onChange={(e) => setRegion(e.target.value)}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="organization">Organization</Label>
              <Input
                id="organization"
                placeholder="Enter organization name"
                value={organization}
                onChange={(e) => setOrganization(e.target.value)}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="reportType">Report Type</Label>
              <Select value={reportType} onValueChange={setReportType} required>
                <SelectTrigger id="reportType">
                  <SelectValue placeholder="Select report type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="achievement">Achievement Report</SelectItem>
                  <SelectItem value="financial">Financial Report</SelectItem>
                  <SelectItem value="maintenance">Maintenance Report</SelectItem>
                  <SelectItem value="other">Other (Custom)</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {reportType === 'other' && (
              <div className="space-y-2">
                <Label htmlFor="customReportType">Custom Report Type</Label>
                <Input
                  id="customReportType"
                  placeholder="Enter custom report type"
                  value={customReportType}
                  onChange={(e) => setCustomReportType(e.target.value)}
                  required
                />
              </div>
            )}

            <Button type="submit" className="w-full">
              Continue to Report
            </Button>
          </form>

          <div className="mt-6 pt-4 border-t text-center">
            <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
              <Eye className="h-4 w-4" />
              <span>
                App Usage: {loading ? '...' : usageCount} {usageCount === 1 ? 'time' : 'times'}
              </span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
