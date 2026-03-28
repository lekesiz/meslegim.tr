import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Route, Switch } from "wouter";
import ErrorBoundary from "./components/ErrorBoundary";
import { ThemeProvider } from "./contexts/ThemeContext";
import { AuthProvider } from "./contexts/AuthContext";
import { lazy, Suspense } from "react";
import { Loader2 } from "lucide-react";

// Eagerly loaded (above the fold)
import Home from "./pages/Home";
import Login from "./pages/Login";

// Lazy loaded pages
const NotFound = lazy(() => import("@/pages/NotFound"));
const AdminDashboard = lazy(() => import("./pages/dashboard/AdminDashboard"));
const MentorDashboard = lazy(() => import("./pages/dashboard/MentorDashboard"));
const StudentDashboard = lazy(() => import("./pages/dashboard/StudentDashboard"));
const StudentStageForm = lazy(() => import("./pages/student/StageForm"));
const StudentDetailView = lazy(() => import("./pages/student/StudentDetailView"));
const MyReports = lazy(() => import("./pages/student/MyReports"));
const StudentReportView = lazy(() => import("./pages/student/ReportView"));
const MentorReportApproval = lazy(() => import("./pages/mentor/MentorReportApproval"));
const ReportView = lazy(() => import("./pages/ReportView"));
const Dashboard = lazy(() => import("./pages/Dashboard"));
const ResetPassword = lazy(() => import("./pages/ResetPassword"));
const VerifyCertificate = lazy(() => import("./pages/VerifyCertificate"));
const GizlilikPolitikasi = lazy(() => import("./pages/GizlilikPolitikasi"));
const KullanimSartlari = lazy(() => import("./pages/KullanimSartlari"));
const Profile = lazy(() => import("./pages/Profile"));
const VerifyEmail = lazy(() => import("./pages/VerifyEmail"));

function PageLoader() {
  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="flex flex-col items-center gap-3">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <p className="text-sm text-muted-foreground">Yükleniyor...</p>
      </div>
    </div>
  );
}

function Router() {
  return (
    <Suspense fallback={<PageLoader />}>
      <Switch>
        <Route path="/" component={Home} />
        <Route path="/login" component={Login} />
        <Route path="/reset-password/:token" component={ResetPassword} />
        <Route path="/verify-certificate/:id" component={VerifyCertificate} />
        <Route path="/gizlilik-politikasi" component={GizlilikPolitikasi} />
        <Route path="/kullanim-sartlari" component={KullanimSartlari} />
        <Route path="/profile" component={Profile} />
        <Route path="/verify-email/:token" component={VerifyEmail} />
        
        {/* Dashboard - role-based routing */}
        <Route path="/dashboard" component={Dashboard} />
        
        {/* Legacy routes for backward compatibility */}
        <Route path="/dashboard/admin" component={AdminDashboard} />
        <Route path="/dashboard/mentor" component={MentorDashboard} />
        <Route path="/dashboard/mentor/reports" component={MentorReportApproval} />
        <Route path="/dashboard/student" component={StudentDashboard} />
        <Route path="/dashboard/student/reports" component={MyReports} />
        <Route path="/dashboard/student/reports/:id" component={StudentReportView} />
        <Route path="/dashboard/student/stage/:stageId" component={StudentStageForm} />
        <Route path="/dashboard/student/:id" component={StudentDetailView} />
        <Route path="/reports/:id" component={ReportView} />
        
        <Route path="/404" component={NotFound} />
        <Route component={NotFound} />
      </Switch>
    </Suspense>
  );
}

function App() {
  return (
    <ErrorBoundary>
      <ThemeProvider defaultTheme="light">
        <AuthProvider>
          <TooltipProvider>
            <Toaster />
            <Router />
          </TooltipProvider>
        </AuthProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}

export default App;
