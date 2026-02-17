import { useEffect, useState, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

interface Question {
  id: string;
  difficulty: number;
  prompt: string;
  choices: { id: string; text: string }[];
  correct_answer: string;
}

interface UserState {
  current_difficulty: number;
  streak: number;
  max_streak: number;
  total_score: number;
  total_answered: number;
  total_correct: number;
  momentum: number;
  state_version: number;
  last_question_id: string | null;
}

interface AnswerResult {
  correct: boolean;
  scoreDelta: number;
  newStreak: number;
  newDifficulty: number;
}

const STREAK_MULTIPLIER_CAP = 3.0;
const MOMENTUM_DECAY = 0.7;
const MOMENTUM_THRESHOLD = 0.6; // hysteresis: need momentum > this to change difficulty

function calculateStreakMultiplier(streak: number): number {
  return Math.min(1 + streak * 0.15, STREAK_MULTIPLIER_CAP);
}

function calculateScoreDelta(difficulty: number, streak: number, correct: boolean): number {
  if (!correct) return 0;
  const base = difficulty * 10;
  const multiplier = calculateStreakMultiplier(streak);
  return Math.round(base * multiplier);
}

function calculateNewDifficulty(
  currentDifficulty: number,
  correct: boolean,
  momentum: number
): { newDifficulty: number; newMomentum: number } {
  // Momentum: positive = trending correct, negative = trending wrong
  // Decays old momentum and adds new signal
  const signal = correct ? 1 : -1;
  const newMomentum = momentum * MOMENTUM_DECAY + signal * (1 - MOMENTUM_DECAY);

  let newDifficulty = currentDifficulty;

  // Hysteresis: only change difficulty if momentum exceeds threshold
  if (newMomentum > MOMENTUM_THRESHOLD) {
    newDifficulty = Math.min(10, currentDifficulty + 1);
  } else if (newMomentum < -MOMENTUM_THRESHOLD) {
    newDifficulty = Math.max(1, currentDifficulty - 1);
  }

  return { newDifficulty, newMomentum };
}

export function useQuiz() {
  const { user } = useAuth();
  const [question, setQuestion] = useState<Question | null>(null);
  const [userState, setUserState] = useState<UserState | null>(null);
  const [loading, setLoading] = useState(true);
  const [answerResult, setAnswerResult] = useState<AnswerResult | null>(null);
  const [answering, setAnswering] = useState(false);

  const fetchUserState = useCallback(async () => {
    if (!user) return;
    const { data } = await supabase
      .from("user_state")
      .select("*")
      .eq("user_id", user.id)
      .single();
    if (data) {
      setUserState({
        current_difficulty: data.current_difficulty,
        streak: data.streak,
        max_streak: data.max_streak,
        total_score: data.total_score,
        total_answered: data.total_answered,
        total_correct: data.total_correct,
        momentum: data.momentum,
        state_version: data.state_version,
        last_question_id: data.last_question_id,
      });
    }
  }, [user]);

  const fetchNextQuestion = useCallback(async (difficulty: number, excludeId?: string | null) => {
    if (!user) return;
    let query = supabase
      .from("questions")
      .select("*")
      .eq("difficulty", difficulty);
    
    if (excludeId) {
      query = query.neq("id", excludeId);
    }

    const { data } = await query;
    
    if (data && data.length > 0) {
      const randomQ = data[Math.floor(Math.random() * data.length)];
      setQuestion({
        id: randomQ.id,
        difficulty: randomQ.difficulty,
        prompt: randomQ.prompt,
        choices: randomQ.choices as any,
        correct_answer: randomQ.correct_answer,
      });
    } else {
      // fallback: get any question at nearby difficulty
      const { data: fallback } = await supabase
        .from("questions")
        .select("*")
        .gte("difficulty", Math.max(1, difficulty - 1))
        .lte("difficulty", Math.min(10, difficulty + 1))
        .limit(10);
      if (fallback && fallback.length > 0) {
        const randomQ = fallback[Math.floor(Math.random() * fallback.length)];
        setQuestion({
          id: randomQ.id,
          difficulty: randomQ.difficulty,
          prompt: randomQ.prompt,
          choices: randomQ.choices as any,
          correct_answer: randomQ.correct_answer,
        });
      }
    }
    setLoading(false);
  }, [user]);

  useEffect(() => {
    if (user) {
      fetchUserState();
    }
  }, [user, fetchUserState]);

  useEffect(() => {
    if (userState && !question && !answerResult) {
      fetchNextQuestion(userState.current_difficulty, userState.last_question_id);
    }
  }, [userState, question, answerResult, fetchNextQuestion]);

  const submitAnswer = useCallback(async (answerId: string) => {
    if (!user || !question || !userState || answering) return;
    setAnswering(true);

    const correct = answerId === question.correct_answer;
    const idempotencyKey = `${user.id}-${question.id}-${userState.state_version}`;

    const newStreak = correct ? userState.streak + 1 : 0;
    const newMaxStreak = Math.max(userState.max_streak, newStreak);
    const scoreDelta = calculateScoreDelta(question.difficulty, correct ? newStreak : 0, correct);
    const newTotalScore = userState.total_score + scoreDelta;
    const { newDifficulty, newMomentum } = calculateNewDifficulty(
      userState.current_difficulty,
      correct,
      userState.momentum
    );

    // Log the answer (idempotent via unique constraint)
    await supabase.from("answer_log").upsert({
      user_id: user.id,
      question_id: question.id,
      difficulty: question.difficulty,
      answer: answerId,
      correct,
      score_delta: scoreDelta,
      streak_at_answer: correct ? newStreak : 0,
      idempotency_key: idempotencyKey,
    }, { onConflict: "user_id,idempotency_key" });

    // Update user state
    await supabase
      .from("user_state")
      .update({
        current_difficulty: newDifficulty,
        streak: newStreak,
        max_streak: newMaxStreak,
        total_score: newTotalScore,
        total_answered: userState.total_answered + 1,
        total_correct: userState.total_correct + (correct ? 1 : 0),
        momentum: newMomentum,
        last_question_id: question.id,
        last_answer_at: new Date().toISOString(),
        state_version: userState.state_version + 1,
        updated_at: new Date().toISOString(),
      })
      .eq("user_id", user.id);

    // Update leaderboards
    await supabase
      .from("leaderboard_score")
      .update({ total_score: newTotalScore, updated_at: new Date().toISOString() })
      .eq("user_id", user.id);

    await supabase
      .from("leaderboard_streak")
      .update({ max_streak: newMaxStreak, updated_at: new Date().toISOString() })
      .eq("user_id", user.id);

    setAnswerResult({ correct, scoreDelta, newStreak, newDifficulty });
    setUserState((prev) =>
      prev
        ? {
            ...prev,
            streak: newStreak,
            max_streak: newMaxStreak,
            total_score: newTotalScore,
            total_answered: prev.total_answered + 1,
            total_correct: prev.total_correct + (correct ? 1 : 0),
            current_difficulty: newDifficulty,
            momentum: newMomentum,
            state_version: prev.state_version + 1,
            last_question_id: question.id,
          }
        : prev
    );
    setAnswering(false);
  }, [user, question, userState, answering]);

  const nextQuestion = useCallback(() => {
    setAnswerResult(null);
    setQuestion(null);
    setLoading(true);
    if (userState) {
      fetchNextQuestion(userState.current_difficulty, userState.last_question_id);
    }
  }, [userState, fetchNextQuestion]);

  return {
    question,
    userState,
    loading,
    answerResult,
    answering,
    submitAnswer,
    nextQuestion,
    calculateStreakMultiplier,
  };
}
