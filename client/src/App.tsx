import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/NotFound";
import { Route, Switch } from "wouter";
import ErrorBoundary from "./components/ErrorBoundary";
import { ThemeProvider } from "./contexts/ThemeContext";
import Home from "./pages/Home";

// Admin pages
import AdminDashboard from "./pages/admin/Dashboard";
import AdminUsers from "./pages/admin/Users";

// Mentor pages
import MentorDashboard from "./pages/mentor/Dashboard";

// Student pages
import StudentDashboard from "./pages/student/Dashboard";
import StudentStageForm from "./pages/student/StageForm";

function Router() {
  return (
    <Switch>
      <Route path="/" component={Home} />
      
      {/* Admin routes */}
      <Route path="/dashboard/admin" component={AdminDashboard} />
      <Route path="/dashboard/admin/users" component={AdminUsers} />
      
      {/* Mentor routes */}
      <Route path="/dashboard/mentor" component={MentorDashboard} />
      
      {/* Student routes */}
      <Route path="/dashboard/student" component={StudentDashboard} />
      <Route path="/dashboard/student/stage" component={StudentStageForm} />
      
      <Route path="/404" component={NotFound} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <ErrorBoundary>
      <ThemeProvider defaultTheme="light">
        <TooltipProvider>
          <Toaster />
          <Router />
        </TooltipProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}

export default App;
