import { useAuth } from "@/contexts/AuthContext";
import { Navigate, Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Zap, Brain, Trophy, Flame, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";

const Index = () => {
  const { user, loading } = useAuth();

  if (loading) return null;
  if (user) return <Navigate to="/quiz" replace />;

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <main className="flex-1 flex items-center justify-center p-4">
        <div className="max-w-2xl mx-auto text-center space-y-8">
          {/* Hero */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="space-y-6"
          >
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: "spring", stiffness: 200, delay: 0.2 }}
              className="inline-flex items-center justify-center w-20 h-20 rounded-3xl bg-primary/10 glow-primary"
            >
              <Zap className="w-10 h-10 text-primary" />
            </motion.div>

            <h1 className="text-5xl sm:text-6xl font-bold tracking-tight leading-tight">
              <span className="text-gradient-primary">BrainBolt</span>
            </h1>

            <p className="text-xl text-muted-foreground max-w-lg mx-auto leading-relaxed">
              The adaptive infinite quiz that grows with you. Build streaks, climb leaderboards, and prove your knowledge.
            </p>
          </motion.div>

          {/* Features */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
            className="grid grid-cols-1 sm:grid-cols-3 gap-4"
          >
            {[
              { icon: Brain, title: "Adaptive", desc: "Difficulty adjusts to your skill" },
              { icon: Flame, title: "Streaks", desc: "Build combos for bonus points" },
              { icon: Trophy, title: "Compete", desc: "Real-time leaderboards" },
            ].map(({ icon: Icon, title, desc }, i) => (
              <motion.div
                key={title}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 + i * 0.1 }}
                className="glass rounded-xl p-5 text-center"
              >
                <Icon className="w-6 h-6 text-primary mx-auto mb-2" />
                <h3 className="font-bold">{title}</h3>
                <p className="text-sm text-muted-foreground mt-1">{desc}</p>
              </motion.div>
            ))}
          </motion.div>

          {/* CTA */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.8 }}
          >
            <Link to="/auth">
              <Button size="lg" className="bg-primary text-primary-foreground hover:bg-primary/90 glow-primary text-lg h-14 px-8 gap-2">
                Start Playing <ArrowRight className="w-5 h-5" />
              </Button>
            </Link>
          </motion.div>
        </div>
      </main>

      <footer className="text-center py-4 text-sm text-muted-foreground">
        Built with ⚡ BrainBolt
      </footer>
    </div>
  );
};

export default Index;
