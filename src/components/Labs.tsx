import { useState } from 'react';
import { blochState, classifierExpectation, sampleCounts, trainWeight, trainingExamples, trainingLoss } from '../quantum/math';
import { Icon } from './Icons';

export function BlochLab() {
  const [theta, setTheta] = useState(90);
  const [phi, setPhi] = useState(0);
  const state = blochState(theta, phi);
  return (
    <section className="lab-panel" aria-labelledby="bloch-title">
      <div className="lab-heading"><span className="lab-index">LAB 01</span><span className="lab-status">IDEAL STATE VECTOR</span></div>
      <h3 id="bloch-title">Explore a qubit</h3>
      <p className="lab-intro">Set polar angle θ and azimuth φ. The controls update a pure state on the Bloch sphere and its computational-basis probabilities.</p>
      <div className="bloch-layout">
        <div className="bloch-stage" role="img" aria-label={`Bloch sphere illustration with theta ${theta} degrees and phi ${phi} degrees`}>
          <div className="bloch-sphere">
            <span className="sphere-latitude"/><span className="sphere-longitude"/><span className="sphere-equator"/>
            <span className="sphere-axis sphere-axis-x"/><span className="sphere-axis sphere-axis-z"/>
            <span className="bloch-vector" style={{ transform: `rotateY(${phi}deg) rotateX(${theta}deg)` }}/>
          </div>
          <span className="sphere-label label-zero">|0⟩</span><span className="sphere-label label-one">|1⟩</span>
        </div>
        <div className="lab-controls">
          <label htmlFor="theta">Polar angle <output>{theta}°</output></label>
          <input id="theta" type="range" min="0" max="180" value={theta} onChange={(event) => setTheta(Number(event.target.value))}/>
          <label htmlFor="phi">Azimuth <output>{phi}°</output></label>
          <input id="phi" type="range" min="0" max="360" value={phi} onChange={(event) => setPhi(Number(event.target.value))}/>
          <div className="probability-bars" aria-live="polite">
            <div className="probability-row"><span>P(0)</span><div className="probability-track"><i style={{ width: `${state.probabilityZero * 100}%` }}/></div><strong>{(state.probabilityZero * 100).toFixed(1)}%</strong></div>
            <div className="probability-row"><span>P(1)</span><div className="probability-track"><i style={{ width: `${state.probabilityOne * 100}%` }}/></div><strong>{(state.probabilityOne * 100).toFixed(1)}%</strong></div>
          </div>
          <code className="state-readout">|ψ⟩ = {state.amplitudeZero.toFixed(3)}|0⟩ + e^(i{((phi * Math.PI) / 180).toFixed(2)}) {state.amplitudeOne.toFixed(3)}|1⟩</code>
        </div>
      </div>
      <p className="lab-footnote">Exact probabilities for an ideal pure state. This model does not include noise, measurement error, or hardware behavior.</p>
    </section>
  );
}

export function MeasurementLab() {
  const [counts, setCounts] = useState<number[] | undefined>();
  const result = counts ?? [0, 0];
  return (
    <section className="lab-panel" aria-labelledby="measurement-title">
      <div className="lab-heading"><span className="lab-index">LAB 02</span><span className="lab-status">100 SHOTS</span></div>
      <h3 id="measurement-title">Measure |+⟩</h3>
      <p className="lab-intro">An H gate maps |0⟩ to |+⟩ = (|0⟩ + |1⟩)/√2. Simulate 100 independent measurements against the exact 50/50 distribution.</p>
      <button className="button button-quiet" onClick={() => setCounts(sampleCounts(0.5, 100))}><Icon name="flask"/> Run 100 shots</button>
      {counts ? <div className="shot-result" aria-live="polite"><div className="shot-bars"><div><i style={{ height: `${result[0]}%` }}/><span>|0⟩</span></div><div><i style={{ height: `${result[1]}%` }}/><span>|1⟩</span></div></div><p>Observed {result[0]} zeros and {result[1]} ones. Expected probability: 50% each.</p></div> : <p className="lab-footnote">Run the simulation to see a finite sample. Each run can produce different counts.</p>}
    </section>
  );
}

export function BellLab() {
  const [counts, setCounts] = useState<number[] | undefined>();
  return (
    <section className="lab-panel" aria-labelledby="bell-title">
      <div className="lab-heading"><span className="lab-index">LAB 03</span><span className="lab-status">256 SHOTS · IDEAL</span></div>
      <h3 id="bell-title">Prepare a Bell pair</h3>
      <p className="lab-intro">Starting with |00⟩, apply H to the first qubit, then CNOT. The ideal state is (|00⟩ + |11⟩)/√2.</p>
      <button className="button button-quiet" onClick={() => setCounts(sampleCounts(0.5, 256))}><Icon name="flask"/> Run Bell-state shots</button>
      {counts ? <div className="bell-counts" aria-live="polite"><code>00 <b>{counts[0]}</b></code><code>01 <b>0</b></code><code>10 <b>0</b></code><code>11 <b>{counts[1]}</b></code></div> : <p className="lab-footnote">No measurements yet. The ideal state has no 01 or 10 outcomes in the computational basis.</p>}
      <p className="lab-footnote">Noiseless sampling illustrates correlation; it does not model hardware or permit signaling.</p>
    </section>
  );
}

export function ClassifierLab() {
  const [input, setInput] = useState(1);
  const [weight, setWeight] = useState(0.5);
  const [trainedWeight, setTrainedWeight] = useState(0.2);
  const expectation = classifierExpectation(input, weight);
  const accuracy = trainingExamples.filter(([x, label]) => Math.sign(classifierExpectation(x, trainedWeight)) === label).length;
  return (
    <section className="lab-panel" aria-labelledby="classifier-title">
      <div className="lab-heading"><span className="lab-index">LAB 04</span><span className="lab-status">TOY CLASSIFIER</span></div>
      <h3 id="classifier-title">A variational circuit sketch</h3>
      <p className="lab-intro">For one input x and trainable angle w, the circuit RY(x)RY(w)|0⟩ has ideal expectation ⟨Z⟩ = cos(x + w). This tiny example demonstrates the calculation only.</p>
      <div className="classifier-controls">
        <label htmlFor="classifier-x">Input x <output>{input.toFixed(2)} rad</output></label><input id="classifier-x" type="range" min="-314" max="314" value={Math.round(input * 100)} onChange={(event) => setInput(Number(event.target.value) / 100)}/>
        <label htmlFor="classifier-w">Weight w <output>{weight.toFixed(2)} rad</output></label><input id="classifier-w" type="range" min="-314" max="314" value={Math.round(weight * 100)} onChange={(event) => setWeight(Number(event.target.value) / 100)}/>
      </div>
      <div className="expectation-readout"><span>⟨Z⟩</span><strong>{expectation.toFixed(3)}</strong><span>p(0) = {((1 + expectation) / 2).toFixed(3)}</span></div>
      <div className="training-row"><div><span className="eyebrow">Four fixed examples</span><p>Mean squared error <strong>{trainingLoss(trainedWeight).toFixed(4)}</strong> · sign accuracy <strong>{accuracy}/4</strong></p></div><div className="button-row"><button className="button button-quiet" onClick={() => setTrainedWeight((current) => trainWeight(current))}>Train one epoch</button><button className="text-button" onClick={() => setTrainedWeight(0.2)}>Reset</button></div></div>
      <p className="lab-footnote">Training labels are +1, +1, −1, −1 at x = −1.5, −1, 1, 1.5 radians. The parameter-shift derivative applies to this single Pauli rotation. It is not a benchmark or evidence of advantage.</p>
    </section>
  );
}
