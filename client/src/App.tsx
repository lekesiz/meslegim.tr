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
import Login from "./pages/Login";

function Router() {
  return (
    <Switch>
      <Route path="/" component={Home} />
      <Route path="/login" component={Login} />
      
      {/* Admin routes */}
      <Route path="/dashboard/admin" component={AdminDashboard} />
      
      {/* Mentor routes */}
      <Route path="/dashboard/mentor" component={MentorDashboard} />
      
      {/* Student routes */}
      <Route path="/dashboard/student" component={StudentDashboard} />
      <Route path="/dashboard/student/stage/:stageId" component={StudentStageForm} />
      
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
