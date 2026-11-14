import { BellLab, BlochLab, ClassifierLab, MeasurementLab } from '../components/Labs';
import { Icon } from '../components/Icons';
import { SiteHeader } from '../components/SiteHeader';

const base = import.meta.env.BASE_URL;

const chapters = [
  ['states', '01', 'States & measurement'],
  ['circuits', '02', 'Gates & interference'],
  ['entanglement', '03', 'Entanglement'],
  ['model', '04', 'A learning model'],
  ['evidence', '05', 'Evidence & limits'],
  ['sources', '06', 'Sources'],
];

export function BookPage() {
  return (
    <>
      <SiteHeader current="learn"/>
      <main className="reading-layout shell">
        <aside className="reading-sidebar">
          <a className="back-link" href={`${base}index.html`}>← Field guide</a>
          <span className="eyebrow">The guided book</span>
          <h2>Quantum computing for machine learning</h2>
          <nav aria-label="Book chapters" className="chapter-nav">{chapters.map(([id, number, title]) => <a href={`#${id}`} key={id}><span>{number}</span>{title}</a>)}</nav>
          <div className="sidebar-note"><Icon name="check"/><span>Small, idealized simulations. No hardware claims.</span></div>
        </aside>
        <article className="book-content">
          <div className="book-kicker"><span>LEARNING PATH · 6 CHAPTERS</span><span>FOUNDATIONS → EVIDENCE</span></div>
          <h1>Quantum computing for machine learning</h1>
          <p className="book-deck">Build from state vectors to variational models. Each lesson states its assumptions; the labs run small, exact simulations in your browser.</p>
          <div className="editorial-note"><span className="note-index">SCOPE</span><p>This is an educational state-vector simulator for small ideal circuits. It is not quantum hardware and does not demonstrate computational advantage.</p></div>

          <section className="lesson-section" id="states"><span className="chapter-label">01 · QUANTUM STATES</span><h2>States, amplitudes, and measurement</h2><p>A pure state of one qubit is a normalized vector in a two-dimensional complex space. In the computational basis, write it as <code>|ψ⟩ = α|0⟩ + β|1⟩</code>, where <code>|α|² + |β|² = 1</code>. Measuring in that basis returns 0 with probability <code>|α|²</code> and 1 with probability <code>|β|²</code>. One measurement is one sample; repeated shots estimate the probabilities.</p><p>Global phase does not change measurement statistics. Relative phase can matter when later gates interfere amplitudes. The Bloch sphere depicts pure single-qubit states, with antipodal points representing orthogonal states.</p><BlochLab/><MeasurementLab/></section>

          <section className="lesson-section" id="circuits"><span className="chapter-label">02 · QUANTUM CIRCUITS</span><h2>Gates are unitary transformations</h2><p>A gate maps the state vector through a unitary matrix. The Hadamard gate maps <code>|0⟩ → (|0⟩ + |1⟩)/√2</code>. Measuring immediately then gives either result with equal probability. Applying H again returns |0⟩: amplitudes interfere, so this is not ordinary uncertainty over hidden bit values.</p><div className="circuit-strip" aria-label="Hadamard then Hadamard circuit"><span>|0⟩</span><b>H</b><i/><b>H</b><span>→ |0⟩</span></div><p>The circuit model describes ideal operations. Real devices add noise, control limitations, and readout errors that these examples omit.</p></section>

          <section className="lesson-section" id="entanglement"><span className="chapter-label">03 · MULTI-QUBIT STATES</span><h2>Entanglement and correlated outcomes</h2><p>The Bell state <code>(|00⟩ + |11⟩)/√2</code> cannot be written as a product of two single-qubit states. Measuring both qubits in the computational basis gives correlated outcomes: 00 or 11, each with probability one half. Each individual outcome is random; correlation does not let either party choose or signal the result.</p><BellLab/></section>

          <section className="lesson-section" id="model"><span className="chapter-label">04 · HYBRID LEARNING</span><h2>From circuits to a learning model</h2><p>A common QML pattern encodes input data into a parameterized circuit, measures an observable, then uses a classical optimizer to update parameters. A binary classifier may map an expectation value to a score and compare it with labels. Data representation, measurement cost, optimizer behavior, and classical baselines all matter.</p><ClassifierLab/><p>For practical study, record the dataset, split, encoding, circuit depth, shot count, optimizer, and tuned classical baseline. Keep training and test data separate.</p></section>

          <section className="lesson-section" id="evidence"><span className="chapter-label">05 · EVALUATION</span><h2>Read QML claims carefully</h2><p>A quantum circuit formulation or a successful toy simulation does not establish useful quantum advantage. Results depend on a precise task and cost model, how inputs reach the device, measurement complexity, noise, and the strength of classical alternatives. Variational circuits can encounter training difficulties such as barren plateaus under particular assumptions; this is an active research topic, not universal behavior for every circuit.</p><div className="evidence-checklist">{['Name the task and input model.', 'Count state preparation, circuit executions, and measurements.', 'Report precision and classical post-processing.', 'Compare with a tuned classical method on the same data.', 'Separate theoretical guarantees from hardware demonstrations.'].map((item) => <p key={item}><Icon name="check"/>{item}</p>)}</div></section>

          <section className="lesson-section source-section" id="sources"><span className="chapter-label">06 · CONTINUE READING</span><h2>Sources and further reading</h2><ul><li><a href="https://quantum-computing.ibm.com/composer/docs/iqx/guide/" target="_blank" rel="noreferrer">IBM Quantum: circuit composer guide</a> — states, gates, measurement, and circuit concepts.</li><li><a href="https://docs.pennylane.ai/en/stable/introduction/" target="_blank" rel="noreferrer">PennyLane documentation</a> — differentiable and hybrid quantum workflows.</li><li><a href="https://doi.org/10.22331/q-2021-10-05-558" target="_blank" rel="noreferrer">Quantum 5, 558 (2021)</a> — resource limitations for gradient-free optimization in barren-plateau settings.</li><li><a href="https://doi.org/10.22331/q-2023-12-20-1210" target="_blank" rel="noreferrer">Quantum 7, 1210 (2023)</a> — generalization and overfitting analysis for a class of quantum models.</li></ul><p className="lab-footnote">The README library is a broad community index. Its inherited entries are shown as source material; they should be checked against primary sources before being treated as instruction.</p><a className="button button-quiet" href={`${base}library.html`}>Open every README reference <Icon name="arrow"/></a></section>
        </article>
      </main>
      <footer className="site-footer"><div className="shell"><span>FIELD NOTES · IDEAL CIRCUIT MODEL</span><a href={`${base}library.html`}>Continue to the topic library <Icon name="arrow"/></a></div></footer>
    </>
  );
}
