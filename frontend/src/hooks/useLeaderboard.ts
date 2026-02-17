import { useEffect, useState, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

interface LeaderboardEntry {
  user_id: string;
  display_name: string;
  total_score?: number;
  max_streak?: number;
}

export function useLeaderboard(type: "score" | "streak") {
  const { user } = useAuth();
  const [entries, setEntries] = useState<LeaderboardEntry[]>([]);
  const [userRank, setUserRank] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchLeaderboard = useCallback(async () => {
    const table = type === "score" ? "leaderboard_score" : "leaderboard_streak";
    const orderCol = type === "score" ? "total_score" : "max_streak";

    const { data } = await supabase
      .from(table)
      .select("*")
      .order(orderCol, { ascending: false })
      .limit(50);

    if (data) {
      setEntries(data as any);
      if (user) {
        const rank = data.findIndex((e: any) => e.user_id === user.id);
        setUserRank(rank >= 0 ? rank + 1 : null);
      }
    }
    setLoading(false);
  }, [type, user]);

  useEffect(() => {
    fetchLeaderboard();

    const table = type === "score" ? "leaderboard_score" : "leaderboard_streak";
    const channel = supabase
      .channel(`leaderboard-${type}`)
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table },
        () => fetchLeaderboard()
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [fetchLeaderboard, type]);

  return { entries, userRank, loading };
}
