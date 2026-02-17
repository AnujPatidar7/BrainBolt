class UserState {
  constructor({
    userId,
    currentDifficulty = 1,
    streak = 0,
    maxStreak = 0,
    totalScore = 0,
    totalAnswers = 0,
    correctAnswers = 0,
    stateVersion = 1,
    lastAnswerAt = null,
  }) {
    this.userId = userId;
    this.currentDifficulty = currentDifficulty;
    this.streak = streak;
    this.maxStreak = maxStreak;
    this.totalScore = totalScore;
    this.totalAnswers = totalAnswers;
    this.correctAnswers = correctAnswers;
    this.stateVersion = stateVersion;
    this.lastAnswerAt = lastAnswerAt;
  }

  incrementStreak() {
    this.streak += 1;
    if (this.streak > this.maxStreak) {
      this.maxStreak = this.streak;
    }
  }

  resetStreak() {
    this.streak = 0;
  }

  incrementTotalAnswers() {
    this.totalAnswers += 1;
  }

  incrementCorrectAnswers() {
    this.correctAnswers += 1;
  }

  addScore(scoreDelta) {
    this.totalScore += scoreDelta;
  }

  incrementVersion() {
    this.stateVersion += 1;
  }

  getAccuracy() {
    if (this.totalAnswers === 0) return 0;
    return this.correctAnswers / this.totalAnswers;
  }
}

module.exports = UserState;
