
-- Questions table with varying difficulty 1-10
CREATE TABLE public.questions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  difficulty INT NOT NULL CHECK (difficulty >= 1 AND difficulty <= 10),
  prompt TEXT NOT NULL,
  choices JSONB NOT NULL, -- array of {id, text}
  correct_answer TEXT NOT NULL,
  tags TEXT[] DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- User state for adaptive quiz
CREATE TABLE public.user_state (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  current_difficulty INT NOT NULL DEFAULT 5,
  streak INT NOT NULL DEFAULT 0,
  max_streak INT NOT NULL DEFAULT 0,
  total_score INT NOT NULL DEFAULT 0,
  total_answered INT NOT NULL DEFAULT 0,
  total_correct INT NOT NULL DEFAULT 0,
  momentum FLOAT NOT NULL DEFAULT 0.0, -- anti-ping-pong stabilizer
  last_question_id UUID REFERENCES public.questions(id),
  last_answer_at TIMESTAMP WITH TIME ZONE,
  state_version INT NOT NULL DEFAULT 1,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id)
);

-- Answer log for history
CREATE TABLE public.answer_log (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  question_id UUID NOT NULL REFERENCES public.questions(id),
  difficulty INT NOT NULL,
  answer TEXT NOT NULL,
  correct BOOLEAN NOT NULL,
  score_delta INT NOT NULL DEFAULT 0,
  streak_at_answer INT NOT NULL DEFAULT 0,
  idempotency_key TEXT NOT NULL,
  answered_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id, idempotency_key)
);

-- Leaderboard score
CREATE TABLE public.leaderboard_score (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE,
  display_name TEXT NOT NULL DEFAULT 'Anonymous',
  total_score INT NOT NULL DEFAULT 0,
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Leaderboard streak
CREATE TABLE public.leaderboard_streak (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE,
  display_name TEXT NOT NULL DEFAULT 'Anonymous',
  max_streak INT NOT NULL DEFAULT 0,
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Profiles table
CREATE TABLE public.profiles (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE,
  display_name TEXT NOT NULL DEFAULT 'Player',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on all tables
ALTER TABLE public.questions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_state ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.answer_log ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.leaderboard_score ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.leaderboard_streak ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Questions are readable by all authenticated users
CREATE POLICY "Anyone can read questions" ON public.questions FOR SELECT USING (true);

-- User state policies
CREATE POLICY "Users can read own state" ON public.user_state FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own state" ON public.user_state FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own state" ON public.user_state FOR UPDATE USING (auth.uid() = user_id);

-- Answer log policies
CREATE POLICY "Users can read own answers" ON public.answer_log FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own answers" ON public.answer_log FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Leaderboard readable by all, writable by own
CREATE POLICY "Anyone can read score leaderboard" ON public.leaderboard_score FOR SELECT USING (true);
CREATE POLICY "Users can insert own score" ON public.leaderboard_score FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own score" ON public.leaderboard_score FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Anyone can read streak leaderboard" ON public.leaderboard_streak FOR SELECT USING (true);
CREATE POLICY "Users can insert own streak" ON public.leaderboard_streak FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own streak" ON public.leaderboard_streak FOR UPDATE USING (auth.uid() = user_id);

-- Profiles policies
CREATE POLICY "Anyone can read profiles" ON public.profiles FOR SELECT USING (true);
CREATE POLICY "Users can insert own profile" ON public.profiles FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own profile" ON public.profiles FOR UPDATE USING (auth.uid() = user_id);

-- Auto-create profile and state on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (user_id, display_name)
  VALUES (NEW.id, COALESCE(NEW.raw_user_meta_data->>'display_name', 'Player'));
  
  INSERT INTO public.user_state (user_id)
  VALUES (NEW.id);
  
  INSERT INTO public.leaderboard_score (user_id, display_name)
  VALUES (NEW.id, COALESCE(NEW.raw_user_meta_data->>'display_name', 'Player'));
  
  INSERT INTO public.leaderboard_streak (user_id, display_name)
  VALUES (NEW.id, COALESCE(NEW.raw_user_meta_data->>'display_name', 'Player'));
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Enable realtime for leaderboards
ALTER PUBLICATION supabase_realtime ADD TABLE public.leaderboard_score;
ALTER PUBLICATION supabase_realtime ADD TABLE public.leaderboard_streak;

-- Indexes
CREATE INDEX idx_questions_difficulty ON public.questions(difficulty);
CREATE INDEX idx_answer_log_user ON public.answer_log(user_id, answered_at DESC);
CREATE INDEX idx_leaderboard_score_rank ON public.leaderboard_score(total_score DESC);
CREATE INDEX idx_leaderboard_streak_rank ON public.leaderboard_streak(max_streak DESC);
