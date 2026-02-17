import { motion } from "framer-motion";
import { Flame, Target, Trophy, Gauge } from "lucide-react";

interface StatsBarProps {
  score: number;
  streak: number;
  maxStreak: number;
  difficulty: number;
  accuracy: number;
  streakMultiplier: number;
}

const StatsBar = ({ score, streak, maxStreak, difficulty, accuracy, streakMultiplier }: StatsBarProps) => {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
      <StatCard icon={<Trophy className="w-4 h-4" />} label="Score" value={score.toLocaleString()} variant="primary" />
      <StatCard
        icon={<Flame className="w-4 h-4" />}
        label="Streak"
        value={streak.toString()}
        variant={streak >= 5 ? "fire" : "default"}
        animate={streak >= 3}
      />
      <StatCard icon={<Flame className="w-4 h-4" />} label="Max Streak" value={maxStreak.toString()} variant="default" />
      <StatCard icon={<Gauge className="w-4 h-4" />} label="Difficulty" value={`${difficulty}/10`} variant="accent" />
      <StatCard icon={<Target className="w-4 h-4" />} label="Accuracy" value={`${accuracy}%`} variant="default" />
      <StatCard icon={<Flame className="w-4 h-4" />} label="Multiplier" value={`${streakMultiplier.toFixed(1)}x`} variant={streakMultiplier > 1.5 ? "fire" : "default"} />
    </div>
  );
};

function StatCard({
  icon,
  label,
  value,
  variant = "default",
  animate = false,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  variant?: "default" | "primary" | "fire" | "accent";
  animate?: boolean;
}) {
  const variantClasses = {
    default: "glass",
    primary: "glass glow-primary",
    fire: "bg-streak/10 border border-streak/30 glow-accent",
    accent: "bg-accent/10 border border-accent/30",
  };

  return (
    <motion.div
      className={`rounded-xl p-3 ${variantClasses[variant]}`}
      animate={animate ? { scale: [1, 1.03, 1] } : {}}
      transition={animate ? { repeat: Infinity, duration: 1.5 } : {}}
    >
      <div className="flex items-center gap-1.5 text-muted-foreground mb-1">
        {icon}
        <span className="text-xs font-medium">{label}</span>
      </div>
      <p className={`text-lg font-bold ${variant === "fire" ? "text-streak" : variant === "primary" ? "text-primary" : variant === "accent" ? "text-accent" : "text-foreground"}`}>
        {value}
      </p>
    </motion.div>
  );
}

export default StatsBar;
