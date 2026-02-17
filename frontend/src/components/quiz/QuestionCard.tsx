import { motion } from "framer-motion";
import { Check, X, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";

interface QuestionCardProps {
  prompt: string;
  choices: { id: string; text: string }[];
  difficulty: number;
  onAnswer: (id: string) => void;
  answerResult: {
    correct: boolean;
    scoreDelta: number;
    newStreak: number;
    newDifficulty: number;
  } | null;
  selectedAnswer?: string;
  correctAnswer?: string;
  onNext: () => void;
  disabled?: boolean;
}

const difficultyColors: Record<number, string> = {
  1: "bg-success/20 text-success",
  2: "bg-success/20 text-success",
  3: "bg-primary/20 text-primary",
  4: "bg-primary/20 text-primary",
  5: "bg-accent/20 text-accent",
  6: "bg-accent/20 text-accent",
  7: "bg-streak/20 text-streak",
  8: "bg-streak/20 text-streak",
  9: "bg-destructive/20 text-destructive",
  10: "bg-destructive/20 text-destructive",
};

const QuestionCard = ({
  prompt,
  choices,
  difficulty,
  onAnswer,
  answerResult,
  selectedAnswer,
  correctAnswer,
  onNext,
  disabled,
}: QuestionCardProps) => {
  const answered = answerResult !== null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -30 }}
      transition={{ duration: 0.4, type: "spring", stiffness: 100 }}
      className="glass rounded-2xl p-6 sm:p-8 max-w-2xl mx-auto"
    >
      {/* Difficulty badge */}
      <div className="flex items-center justify-between mb-6">
        <span className={`text-xs font-bold px-3 py-1 rounded-full ${difficultyColors[difficulty] || "bg-muted text-muted-foreground"}`}>
          Level {difficulty}
        </span>
      </div>

      {/* Question */}
      <h2 className="text-xl sm:text-2xl font-bold mb-8 leading-relaxed">{prompt}</h2>

      {/* Choices */}
      <div className="grid gap-3">
        {choices.map((choice, i) => {
          const isSelected = selectedAnswer === choice.id;
          const isCorrect = correctAnswer === choice.id;
          let choiceStyle = "glass hover:border-primary/50 hover:bg-primary/5 cursor-pointer";

          if (answered) {
            if (isCorrect) {
              choiceStyle = "bg-success/10 border-success/50 glow-success";
            } else if (isSelected && !isCorrect) {
              choiceStyle = "bg-destructive/10 border-destructive/50 glow-destructive";
            } else {
              choiceStyle = "glass opacity-50";
            }
          }

          return (
            <motion.button
              key={choice.id}
              onClick={() => !answered && !disabled && onAnswer(choice.id)}
              disabled={answered || disabled}
              className={`w-full text-left p-4 rounded-xl border transition-all ${choiceStyle}`}
              whileHover={!answered && !disabled ? { scale: 1.01 } : {}}
              whileTap={!answered && !disabled ? { scale: 0.99 } : {}}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.08 }}
            >
              <div className="flex items-center gap-3">
                <span className="flex-shrink-0 w-8 h-8 rounded-lg bg-secondary flex items-center justify-center text-sm font-bold text-secondary-foreground">
                  {choice.id.toUpperCase()}
                </span>
                <span className="font-medium flex-1">{choice.text}</span>
                {answered && isCorrect && <Check className="w-5 h-5 text-success" />}
                {answered && isSelected && !isCorrect && <X className="w-5 h-5 text-destructive" />}
              </div>
            </motion.button>
          );
        })}
      </div>

      {/* Result & Next */}
      {answered && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mt-6 flex flex-col sm:flex-row items-center justify-between gap-4"
        >
          <div className="flex items-center gap-3">
            {answerResult.correct ? (
              <div className="flex items-center gap-2 text-success font-bold">
                <Check className="w-5 h-5" />
                <span>Correct! +{answerResult.scoreDelta} points</span>
              </div>
            ) : (
              <div className="flex items-center gap-2 text-destructive font-bold">
                <X className="w-5 h-5" />
                <span>Wrong! Streak reset</span>
              </div>
            )}
          </div>
          <Button onClick={onNext} className="bg-primary text-primary-foreground hover:bg-primary/90 gap-2">
            Next Question <ArrowRight className="w-4 h-4" />
          </Button>
        </motion.div>
      )}
    </motion.div>
  );
};

export default QuestionCard;
