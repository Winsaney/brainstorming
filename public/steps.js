// =============================================
// Steps Module — Track brainstorming phase
// =============================================

const STEP_INFO = [
  { id: 1, label: '探索', desc: '了解想法与需求' },
  { id: 2, label: '方案', desc: '探索可能性' },
  { id: 3, label: '设计', desc: '打磨细节' },
  { id: 4, label: '审核', desc: '确保质量' },
  { id: 5, label: '完成', desc: '输出设计文档' },
];

let currentStep = 1;

function setStep(step) {
  const n = Math.max(1, Math.min(5, step));
  if (n === currentStep) return;
  currentStep = n;
  render();
  updateHint();
}

function getStep() {
  return currentStep;
}

/**
 * Parse step marker from AI response: <!-- step:N -->
 */
function detectStep(text) {
  const match = text.match(/<!--\s*step:\s*(\d)\s*-->/);
  if (match) {
    return parseInt(match[1], 10);
  }
  return null;
}

function render() {
  const tracker = document.getElementById('step-tracker');
  if (!tracker) return;

  const steps = tracker.querySelectorAll('.step');
  const lines = tracker.querySelectorAll('.step-line');

  steps.forEach((el, i) => {
    const stepNum = i + 1;
    el.classList.remove('active', 'completed');

    if (stepNum < currentStep) {
      el.classList.add('completed');
    } else if (stepNum === currentStep) {
      el.classList.add('active');
    }
  });

  lines.forEach((line, i) => {
    const afterStep = i + 1;
    line.classList.toggle('completed', afterStep < currentStep);
  });
}

function updateHint() {
  const hint = document.getElementById('step-hint');
  if (!hint) return;
  const info = STEP_INFO[currentStep - 1];
  hint.textContent = `阶段 ${info.id} · ${info.desc}`;
}

function reset() {
  currentStep = 1;
  render();
  updateHint();
}

export const Steps = {
  setStep,
  getStep,
  detectStep,
  render,
  reset,
  STEP_INFO,
};
