export interface BlochState {
  theta: number;
  phi: number;
  probabilityZero: number;
  probabilityOne: number;
  amplitudeZero: number;
  amplitudeOne: number;
}

export function blochState(thetaDegrees: number, phiDegrees: number): BlochState {
  const theta = (thetaDegrees * Math.PI) / 180;
  const phi = (phiDegrees * Math.PI) / 180;
  const amplitudeZero = Math.cos(theta / 2);
  const amplitudeOne = Math.sin(theta / 2);
  return {
    theta: thetaDegrees,
    phi: phiDegrees,
    probabilityZero: amplitudeZero ** 2,
    probabilityOne: amplitudeOne ** 2,
    amplitudeZero,
    amplitudeOne,
  };
}

export function sampleCounts(probabilityZero: number, shots: number, random = Math.random): number[] {
  const counts = [0, 0];
  for (let shot = 0; shot < shots; shot += 1) {
    counts[random() < probabilityZero ? 0 : 1] += 1;
  }
  return counts;
}

export function classifierExpectation(input: number, weight: number): number {
  return Math.cos(input + weight);
}

export const trainingExamples: ReadonlyArray<readonly [number, number]> = [
  [-1.5, 1],
  [-1, 1],
  [1, -1],
  [1.5, -1],
];

export function trainingLoss(weight: number): number {
  return trainingExamples.reduce((total, [input, label]) => total + (classifierExpectation(input, weight) - label) ** 2, 0) / trainingExamples.length;
}

export function trainWeight(weight: number, learningRate = 0.2): number {
  const gradient = trainingExamples.reduce((total, [input, label]) => {
    const current = classifierExpectation(input, weight);
    const derivative = (classifierExpectation(input, weight + Math.PI / 2) - classifierExpectation(input, weight - Math.PI / 2)) / 2;
    return total + 2 * (current - label) * derivative;
  }, 0) / trainingExamples.length;
  return weight - learningRate * gradient;
}
