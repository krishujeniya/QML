import { describe, expect, it } from 'vitest';
import { blochState, classifierExpectation, sampleCounts, trainWeight, trainingLoss } from './math';

describe('ideal state-vector lesson math', () => {
  it('keeps computational-basis probabilities normalized', () => {
    for (const theta of [0, 30, 90, 180]) {
      const state = blochState(theta, 45);
      expect(state.probabilityZero + state.probabilityOne).toBeCloseTo(1, 12);
    }
  });

  it('samples the requested number of outcomes from the supplied distribution', () => {
    expect(sampleCounts(0.75, 4, () => 0.5)).toEqual([4, 0]);
    expect(sampleCounts(0.25, 4, () => 0.75)).toEqual([0, 4]);
  });

  it('uses the documented one-qubit classifier expectation', () => {
    expect(classifierExpectation(0, 0)).toBeCloseTo(1, 12);
    expect(classifierExpectation(Math.PI, 0)).toBeCloseTo(-1, 12);
  });

  it('updates the toy model with a finite parameter-shift gradient', () => {
    expect(Number.isFinite(trainWeight(0.2))).toBe(true);
    expect(trainingLoss(trainWeight(0.2))).toBeLessThan(trainingLoss(0.2));
  });
});
