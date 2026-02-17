class AdaptiveEngine {
  calculate({ momentum, correct, difficulty }) {
    const signal = correct ? 1 : -1;

    const newMomentum = momentum * 0.7 + signal * 0.3;

    let newDifficulty = difficulty;

    if (newMomentum > 0.6) {
      newDifficulty = Math.min(difficulty + 1, 10);
    } else if (newMomentum < -0.6) {
      newDifficulty = Math.max(difficulty - 1, 1);
    }

    return { newMomentum, newDifficulty };
  }
}

module.exports = new AdaptiveEngine();
