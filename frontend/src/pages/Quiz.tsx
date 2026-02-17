import { useState } from "react";
import { useQuiz } from "@/hooks/useQuiz";
import { useAuth } from "@/contexts/AuthContext";
import { Navigate } from "react-router-dom";
import StatsBar from "@/components/quiz/StatsBar";
import QuestionCard from "@/components/quiz/QuestionCard";
import AppHeader from "@/components/layout/AppHeader";
import { Loader2 } from "lucide-react";

const Quiz = () => {
  const { user, loading: authLoading } = useAuth();
  const { question, userState, loading, answerResult, answering, submitAnswer, nextQuestion, calculateStreakMultiplier } = useQuiz();
  const [selectedAnswer, setSelectedAnswer] = useState<string | undefined>();

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!user) return <Navigate to="/auth" replace />;

  const accuracy = userState && userState.total_answered > 0
    ? Math.round((userState.total_correct / userState.total_answered) * 100)
    : 0;

  const streakMultiplier = userState ? calculateStreakMultiplier(userState.streak) : 1;

  const handleAnswer = (id: string) => {
    setSelectedAnswer(id);
    submitAnswer(id);
  };

  const handleNext = () => {
    setSelectedAnswer(undefined);
    nextQuestion();
  };

  return (
    <div className="min-h-screen bg-background">
      <AppHeader />
      <main className="container max-w-4xl mx-auto px-4 py-6 space-y-6">
        {userState && (
          <StatsBar
            score={userState.total_score}
            streak={userState.streak}
            maxStreak={userState.max_streak}
            difficulty={userState.current_difficulty}
            accuracy={accuracy}
            streakMultiplier={streakMultiplier}
          />
        )}

        {loading || !question ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
          </div>
        ) : (
          <QuestionCard
            prompt={question.prompt}
            choices={question.choices}
            difficulty={question.difficulty}
            onAnswer={handleAnswer}
            answerResult={answerResult}
            selectedAnswer={selectedAnswer}
            correctAnswer={answerResult ? question.correct_answer : undefined}
            onNext={handleNext}
            disabled={answering}
          />
        )}
      </main>
    </div>
  );
};

export default Quiz;
