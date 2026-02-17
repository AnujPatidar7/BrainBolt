import { useAuth } from "@/contexts/AuthContext";
import { Navigate } from "react-router-dom";
import { useLeaderboard } from "@/hooks/useLeaderboard";
import LeaderboardTable from "@/components/leaderboard/LeaderboardTable";
import AppHeader from "@/components/layout/AppHeader";
import { Loader2 } from "lucide-react";
import { useState } from "react";
import { motion } from "framer-motion";

const Leaderboard = () => {
  const { user, loading: authLoading } = useAuth();
  const [tab, setTab] = useState<"score" | "streak">("score");
  const scoreBoard = useLeaderboard("score");
  const streakBoard = useLeaderboard("streak");

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!user) return <Navigate to="/auth" replace />;

  const current = tab === "score" ? scoreBoard : streakBoard;

  return (
    <div className="min-h-screen bg-background">
      <AppHeader />
      <main className="container max-w-2xl mx-auto px-4 py-6 space-y-6">
        {/* Tab switcher */}
        <div className="flex gap-2 p-1 glass rounded-xl w-fit mx-auto">
          {(["score", "streak"] as const).map((t) => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={`relative px-6 py-2 rounded-lg text-sm font-semibold transition-colors ${
                tab === t ? "text-primary-foreground" : "text-muted-foreground hover:text-foreground"
              }`}
            >
              {tab === t && (
                <motion.div
                  layoutId="tab-bg"
                  className="absolute inset-0 bg-primary rounded-lg"
                  transition={{ type: "spring", stiffness: 300, damping: 30 }}
                />
              )}
              <span className="relative z-10 capitalize">{t === "score" ? "Top Scores" : "Top Streaks"}</span>
            </button>
          ))}
        </div>

        <LeaderboardTable
          entries={current.entries}
          type={tab}
          userRank={current.userRank}
          loading={current.loading}
        />
      </main>
    </div>
  );
};

export default Leaderboard;
