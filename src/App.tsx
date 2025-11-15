import { useState } from "react";
import { LoginPage } from "./components/LoginPage";
import { ReportForm, type ReportData } from "./components/ReportForm";
import { ReportPreview } from "./components/ReportPreview";
import { Toaster } from "./components/ui/sonner";

type Screen = "login" | "form" | "preview";

interface UserInfo {
  region: string;
  organization: string;
  reportType: string;
  customReportType?: string;
}

export default function App() {
  const [screen, setScreen] = useState<Screen>("login");
  const [userInfo, setUserInfo] = useState<UserInfo | null>(null);
  const [reportData, setReportData] = useState<ReportData | null>(null);

  const handleLogin = (data: UserInfo) => {
    setUserInfo(data);
    setScreen("form");
  };

  const handleBack = () => {
    setScreen("login");
    setUserInfo(null);
    setReportData(null);
  };

  const handleBackToForm = () => {
    setScreen("form");
  };

  const handleGenerate = (data: ReportData) => {
    setReportData(data);
    setScreen("preview");
  };

  const handleNewReport = () => {
    setScreen("login");
    setUserInfo(null);
    setReportData(null);
  };

  return (
    <>
      {screen === "login" && <LoginPage onLogin={handleLogin} />}

      {screen === "form" && userInfo && (
        <ReportForm
          userInfo={userInfo}
          onBack={handleBack}
          onGenerate={handleGenerate}
        />
      )}

      {screen === "preview" && reportData && (
        <ReportPreview
          reportData={reportData}
          onBack={handleBackToForm}
          onNewReport={handleNewReport}
        />
      )}

      <Toaster />
    </>
  );
}
