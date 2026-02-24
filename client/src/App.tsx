import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/NotFound";
import { Route, Switch } from "wouter";
import ErrorBoundary from "./components/ErrorBoundary";
import { ThemeProvider } from "./contexts/ThemeContext";
import { AuthProvider } from "./contexts/AuthContext";
import Home from "./pages/Home";

/// Dashboard pages
import AdminDashboard from "./pages/dashboard/AdminDashboard";
import MentorDashboard from "./pages/dashboard/MentorDashboard";
import StudentDashboard from "./pages/dashboard/StudentDashboard";
import StudentStageForm from "./pages/student/StageForm";
import StudentDetailView from "./pages/student/StudentDetailView";
import MyReports from "./pages/student/MyReports";
import StudentReportView from "./pages/student/ReportView";
import MentorReportApproval from "./pages/mentor/MentorReportApproval";
import Login from "./pages/Login";
import ReportView from "./pages/ReportView";
import Dashboard from "./pages/Dashboard";
import ResetPassword from "./pages/ResetPassword";
import VerifyCertificate from "./pages/VerifyCertificate";

function Router() {
  return (
    <Switch>
      <Route path="/" component={Home} />
      <Route path="/login" component={Login} />
      <Route path="/reset-password/:token" component={ResetPassword} />
      <Route path="/verify-certificate/:id" component={VerifyCertificate} />
      
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
