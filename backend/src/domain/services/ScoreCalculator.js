class ScoreCalculator {
  calculate({ difficulty, streak }) {
    const base = difficulty * 10;
    const multiplier = Math.min(1 + streak * 0.15, 3.0);
    return Math.round(base * multiplier);
  }
}

module.exports = new ScoreCalculator();
