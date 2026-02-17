import { motion } from "framer-motion";
import { Trophy, Flame, Medal, Crown, User } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";

interface LeaderboardEntry {
  user_id: string;
  display_name: string;
  total_score?: number;
  max_streak?: number;
}

interface LeaderboardTableProps {
  entries: LeaderboardEntry[];
  type: "score" | "streak";
  userRank: number | null;
  loading: boolean;
}

const rankIcons = [
  <Crown className="w-5 h-5 text-streak" />,
  <Medal className="w-5 h-5 text-muted-foreground" />,
  <Medal className="w-5 h-5 text-accent" />,
];

const LeaderboardTable = ({ entries, type, userRank, loading }: LeaderboardTableProps) => {
  const { user } = useAuth();

  if (loading) {
    return (
      <div className="glass rounded-2xl p-8 text-center">
        <div className="animate-pulse-glow text-muted-foreground">Loading...</div>
      </div>
    );
  }

  return (
    <div className="glass rounded-2xl overflow-hidden">
      <div className="p-4 border-b border-border/50 flex items-center gap-2">
        {type === "score" ? (
          <Trophy className="w-5 h-5 text-primary" />
        ) : (
          <Flame className="w-5 h-5 text-streak" />
        )}
        <h3 className="font-bold text-lg">
          {type === "score" ? "Top Scores" : "Longest Streaks"}
        </h3>
        {userRank && (
          <span className="ml-auto text-sm text-muted-foreground">
            Your rank: <span className="text-primary font-bold">#{userRank}</span>
          </span>
        )}
      </div>

      <div className="divide-y divide-border/30">
        {entries.length === 0 ? (
          <div className="p-8 text-center text-muted-foreground">
            No entries yet. Be the first!
          </div>
        ) : (
          entries.map((entry, i) => {
            const isCurrentUser = user?.id === entry.user_id;
            const value = type === "score" ? entry.total_score : entry.max_streak;

            return (
              <motion.div
                key={entry.user_id}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.03 }}
                className={`flex items-center gap-3 p-4 transition-colors ${
                  isCurrentUser ? "bg-primary/5" : "hover:bg-secondary/50"
                }`}
              >
                <span className="w-8 flex items-center justify-center">
                  {i < 3 ? rankIcons[i] : (
                    <span className="text-sm text-muted-foreground font-mono">
                      {i + 1}
                    </span>
                  )}
                </span>
                <div className="flex items-center gap-2 flex-1 min-w-0">
                  <div className="w-8 h-8 rounded-full bg-secondary flex items-center justify-center">
                    <User className="w-4 h-4 text-secondary-foreground" />
                  </div>
                  <span className={`font-medium truncate ${isCurrentUser ? "text-primary" : ""}`}>
                    {entry.display_name}
                    {isCurrentUser && " (You)"}
                  </span>
                </div>
                <span className={`font-bold font-mono text-lg ${
                  i === 0 ? "text-streak" : i < 3 ? "text-primary" : "text-foreground"
                }`}>
                  {value?.toLocaleString() ?? 0}
                </span>
              </motion.div>
            );
          })
        )}
      </div>
    </div>
  );
};

export default LeaderboardTable;
