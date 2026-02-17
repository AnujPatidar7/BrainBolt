import { Link, useLocation } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { Zap, Trophy, LogOut, Brain } from "lucide-react";
import { Button } from "@/components/ui/button";

const AppHeader = () => {
  const { signOut } = useAuth();
  const location = useLocation();

  const navItems = [
    { to: "/quiz", label: "Quiz", icon: Brain },
    { to: "/leaderboard", label: "Leaderboard", icon: Trophy },
  ];

  return (
    <header className="sticky top-0 z-50 glass border-b border-border/50">
      <div className="container max-w-4xl mx-auto px-4 h-14 flex items-center justify-between">
        <Link to="/quiz" className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
            <Zap className="w-4 h-4 text-primary" />
          </div>
          <span className="font-bold text-lg text-gradient-primary">BrainBolt</span>
        </Link>

        <nav className="flex items-center gap-1">
          {navItems.map(({ to, label, icon: Icon }) => (
            <Link key={to} to={to}>
              <Button
                variant={location.pathname === to ? "default" : "ghost"}
                size="sm"
                className={location.pathname === to ? "bg-primary text-primary-foreground" : "text-muted-foreground"}
              >
                <Icon className="w-4 h-4 mr-1.5" />
                <span className="hidden sm:inline">{label}</span>
              </Button>
            </Link>
          ))}
          <Button variant="ghost" size="sm" onClick={signOut} className="text-muted-foreground ml-2">
            <LogOut className="w-4 h-4" />
          </Button>
        </nav>
      </div>
    </header>
  );
};

export default AppHeader;
