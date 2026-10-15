/**
 * Teacher AI SLM Studio - Frontend Controller
 */

// Application State
const state = {
  currentBlueprint: null,
  currentSamples: [],
  lastTrainedModel: null,
  trainingHistory: [],
  systemStatus: null,
};

// DOM Elements
const elements = {
  // Navigation & Stepper
  tabs: document.querySelectorAll('.step-tab'),
  panes: document.querySelectorAll('.tab-pane'),
  
  // Status Bar
  teacherStatusText: document.getElementById('teacher-status-text'),
  teacherStatusPill: document.getElementById('teacher-status-pill'),
  deviceText: document.getElementById('device-text'),
  btnOpenSettings: document.getElementById('btn-open-settings'),
  
  // Presets & Task Input
  presetContainer: document.getElementById('preset-container'),
  taskPromptInput: document.getElementById('task-prompt-input'),
  archSelect: document.getElementById('arch-select'),
  sampleSizeRange: document.getElementById('sample-size-range'),
  sampleSizeVal: document.getElementById('sample-size-val'),
  btnSynthesize: document.getElementById('btn-synthesize-blueprint'),
  
  // Blueprint & Sample Space
  blueprintTitle: document.getElementById('blueprint-title'),
  blueprintSummary: document.getElementById('blueprint-summary'),
  badgeDomain: document.getElementById('badge-domain'),
  badgeSampleCount: document.getElementById('badge-sample-count'),
  dispSysInst: document.getElementById('disp-sys-inst'),
  dispOutFormat: document.getElementById('disp-out-format'),
  sampleTableBody: document.getElementById('sample-table-body'),
  btnRegenSamples: document.getElementById('btn-regenerate-samples'),
  btnProceedToParams: document.getElementById('btn-proceed-to-params'),
  
  // Architecture Parameters
  hpDmodel: document.getElementById('hp-dmodel'),
  hpNheads: document.getElementById('hp-nheads'),
  hpNlayers: document.getElementById('hp-nlayers'),
  hpDimffn: document.getElementById('hp-dimffn'),
  hpSeqlen: document.getElementById('hp-seqlen'),
  hpEpochs: document.getElementById('hp-epochs'),
  hpLr: document.getElementById('hp-lr'),
  dispEstParams: document.getElementById('disp-est-params'),
  btnBackToSamples: document.getElementById('btn-back-to-samples'),
  btnGoToTraining: document.getElementById('btn-go-to-training'),
  
  // Distillation & Training
  btnStartTraining: document.getElementById('btn-start-training'),
  trainStatusBox: document.getElementById('train-status-box'),
  trainProgressFill: document.getElementById('train-progress-fill'),
  trainEpochStatus: document.getElementById('train-epoch-status'),
  trainPercentStatus: document.getElementById('train-percent-status'),
  lossChart: document.getElementById('loss-chart'),
  metricTrainLoss: document.getElementById('metric-train-loss'),
  metricValLoss: document.getElementById('metric-val-loss'),
  metricPerplexity: document.getElementById('metric-perplexity'),
  metricTime: document.getElementById('metric-time'),
  trainFooterMsg: document.getElementById('train-footer-msg'),
  btnProceedToArena: document.getElementById('btn-proceed-to-arena'),
  
  // Arena & Playground
  arenaQueryInput: document.getElementById('arena-query-input'),
  btnArenaSubmit: document.getElementById('btn-arena-submit'),
  btnRunBenchmark: document.getElementById('btn-run-benchmark'),
  teacherOutputBox: document.getElementById('teacher-output-box'),
  studentOutputBox: document.getElementById('student-output-box'),
  teacherLatencyBadge: document.getElementById('teacher-latency-badge'),
  studentLatencyBadge: document.getElementById('student-latency-badge'),
  arenaSpeedupText: document.getElementById('arena-speedup-text'),
  arenaStudentTitle: document.getElementById('arena-student-title'),
  arenaStudentParams: document.getElementById('arena-student-params'),
  benchmarkBox: document.getElementById('benchmark-results-box'),
  benchmarkContainer: document.getElementById('benchmark-items-container'),
  btnBackToTrain: document.getElementById('btn-back-to-train'),
  btnGoToExport: document.getElementById('btn-go-to-export'),
  
  // Export & Standalone
  exportPathDisplay: document.getElementById('export-path-display'),
  exportSnippetCode: document.getElementById('export-snippet-code'),
  btnCopyCode: document.getElementById('btn-copy-code'),
  btnBackToArena: document.getElementById('btn-back-to-arena'),
  btnNewModel: document.getElementById('btn-new-model'),
  
  // Modal
  modal: document.getElementById('settings-modal'),
  modalApiKey: document.getElementById('modal-api-key'),
  modalStatusMsg: document.getElementById('modal-status-msg'),
  btnCloseModal: document.getElementById('btn-close-modal'),
  btnCancelModal: document.getElementById('btn-cancel-modal'),
  btnSaveKey: document.getElementById('btn-save-key'),
};

// --- Tab Navigation ---
function switchTab(targetTabId) {
  elements.tabs.forEach(tab => {
    tab.classList.toggle('active', tab.dataset.tab === targetTabId);
  });
  elements.panes.forEach(pane => {
    pane.classList.toggle('active', pane.id === targetTabId);
  });
}

elements.tabs.forEach(tab => {
  tab.addEventListener('click', () => switchTab(tab.dataset.tab));
});

elements.btnProceedToParams.addEventListener('click', () => switchTab('tab-params'));
elements.btnBackToSamples.addEventListener('click', () => switchTab('tab-samples'));
elements.btnGoToTraining.addEventListener('click', () => switchTab('tab-train'));
elements.btnBackToTrain.addEventListener('click', () => switchTab('tab-train'));
elements.btnProceedToArena.addEventListener('click', () => switchTab('tab-arena'));
elements.btnGoToExport.addEventListener('click', () => triggerExport());
elements.btnBackToArena.addEventListener('click', () => switchTab('tab-arena'));
elements.btnNewModel.addEventListener('click', () => switchTab('tab-task'));

// --- Slider Link ---
elements.sampleSizeRange.addEventListener('input', (e) => {
  elements.sampleSizeVal.textContent = e.target.value;
});

// --- Parameter Change Calculations ---
function updateEstParams() {
  const d_model = parseInt(elements.hpDmodel.value) || 128;
  const n_layers = parseInt(elements.hpNlayers.value) || 3;
  const vocab_size = state.currentBlueprint?.hyperparameters?.vocab_size || 512;
  const ffn_dim = parseInt(elements.hpDimffn.value) || 512;

  // Approximate transformer parameter count
  const embed_params = vocab_size * d_model;
  const layer_params = n_layers * (4 * d_model * d_model + 2 * d_model * ffn_dim);
  const total = embed_params + layer_params;
  const memoryMb = (total * 4 / (1024 * 1024)).toFixed(1);

  elements.dispEstParams.textContent = `~${total.toLocaleString()}`;
}

[elements.hpDmodel, elements.hpNlayers, elements.hpDimffn].forEach(el => {
  el.addEventListener('input', updateEstParams);
});

// --- API Client Helpers ---
async function apiGet(endpoint) {
  const res = await fetch(endpoint);
  if (!res.ok) throw new Error(await res.text());
  return res.json();
}

async function apiPost(endpoint, data) {
  const res = await fetch(endpoint, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ detail: res.statusText }));
    throw new Error(err.detail || 'API error');
  }
  return res.json();
}

// --- Initialization ---
async function initSystem() {
  try {
    const status = await apiGet('/api/status');
    state.systemStatus = status;

    elements.deviceText.textContent = `PyTorch ${status.device}`;
    if (status.has_api_key) {
      elements.teacherStatusText.textContent = 'Teacher: Gemini Active';
      elements.teacherStatusPill.className = 'status-pill';
    } else {
      elements.teacherStatusText.textContent = 'Teacher: Offline (Local Mode)';
      elements.teacherStatusPill.className = 'status-pill neutral';
    }

    // Load presets
    const presets = await apiGet('/api/presets');
    elements.presetContainer.innerHTML = '';
    presets.forEach(p => {
      const chip = document.createElement('button');
      chip.className = 'chip';
      chip.textContent = p.title;
      chip.addEventListener('click', () => {
        elements.taskPromptInput.value = p.prompt;
        elements.archSelect.value = p.recommended_arch;
      });
      elements.presetContainer.appendChild(chip);
    });
  } catch (err) {
    console.warn('System status fetch warning:', err);
  }
}

// --- Synthesize Blueprint & Sample Space ---
elements.btnSynthesize.addEventListener('click', async () => {
  const prompt = elements.taskPromptInput.value.trim();
  if (!prompt) {
    alert('Please enter a task description.');
    return;
  }

  elements.btnSynthesize.disabled = true;
  elements.btnSynthesize.innerHTML = `<span class="pulse-dot"></span> Synthesizing Blueprint & Dataset...`;

  try {
    // 1. Analyze task
    const blueprint = await apiPost('/api/analyze', {
      user_prompt: prompt,
      architecture: elements.archSelect.value,
    });
    state.currentBlueprint = blueprint;

    // 2. Generate sample space
    const sampleSize = parseInt(elements.sampleSizeRange.value) || 35;
    const dataset = await apiPost('/api/generate-dataset', {
      blueprint: blueprint,
      sample_size: sampleSize,
    });
    state.currentSamples = dataset.samples || [];

    // 3. Render Sample Space Tab
    renderSampleSpaceTab(blueprint, state.currentSamples);

    // 4. Fill Parameters Tab inputs
    syncParamsTab(blueprint.hyperparameters);

    // Switch view
    switchTab('tab-samples');
  } catch (err) {
    alert(`Synthesis failed: ${err.message}`);
  } finally {
    elements.btnSynthesize.disabled = false;
    elements.btnSynthesize.innerHTML = `
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83"/>
      </svg>
      Synthesize Blueprint with Teacher AI
    `;
  }
});

function renderSampleSpaceTab(blueprint, samples) {
  elements.blueprintTitle.textContent = blueprint.display_title;
  elements.blueprintSummary.textContent = blueprint.purpose_summary;
  elements.badgeDomain.textContent = `Domain: ${blueprint.sample_space.task_domain}`;
  elements.badgeSampleCount.textContent = `${samples.length} Samples`;
  elements.dispSysInst.textContent = blueprint.system_instruction;
  elements.dispOutFormat.textContent = blueprint.sample_space.output_format;

  elements.sampleTableBody.innerHTML = '';
  samples.forEach(s => {
    const row = document.createElement('tr');
    row.innerHTML = `
      <td class="font-mono text-muted">${s.id}</td>
      <td><span class="badge badge-purple">${s.category}</span></td>
      <td>${escapeHtml(s.input_text)}</td>
      <td class="font-mono text-sm">${escapeHtml(s.target_output)}</td>
      <td>${s.is_edge_case ? '<span class="badge badge-amber">Edge</span>' : '<span class="badge badge-cyan">Core</span>'}</td>
    `;
    elements.sampleTableBody.appendChild(row);
  });
}

function syncParamsTab(hp) {
  if (!hp) return;
  elements.hpDmodel.value = hp.d_model || 128;
  elements.hpNheads.value = hp.n_heads || 4;
  elements.hpNlayers.value = hp.n_layers || 3;
  elements.hpDimffn.value = hp.dim_feedforward || 512;
  elements.hpSeqlen.value = hp.max_seq_len || 128;
  elements.hpEpochs.value = hp.epochs || 25;
  elements.hpLr.value = hp.learning_rate || 0.001;
  updateEstParams();
}

function escapeHtml(text) {
  if (!text) return '';
  return text.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

// --- Distillation Lab & Canvas Chart ---
elements.btnStartTraining.addEventListener('click', async () => {
  if (!state.currentBlueprint || !state.currentSamples.length) {
    alert('Please synthesize a blueprint and sample space first.');
    return;
  }

  // Read customized hyperparameters
  state.currentBlueprint.hyperparameters.d_model = parseInt(elements.hpDmodel.value);
  state.currentBlueprint.hyperparameters.n_heads = parseInt(elements.hpNheads.value);
  state.currentBlueprint.hyperparameters.n_layers = parseInt(elements.hpNlayers.value);
  state.currentBlueprint.hyperparameters.dim_feedforward = parseInt(elements.hpDimffn.value);
  state.currentBlueprint.hyperparameters.max_seq_len = parseInt(elements.hpSeqlen.value);
  state.currentBlueprint.hyperparameters.epochs = parseInt(elements.hpEpochs.value);
  state.currentBlueprint.hyperparameters.learning_rate = parseFloat(elements.hpLr.value);

  elements.btnStartTraining.disabled = true;
  elements.btnStartTraining.innerHTML = `<span class="pulse-dot"></span> Distilling Model...`;
  elements.trainStatusBox.style.display = 'block';
  elements.btnProceedToArena.disabled = true;
  elements.trainFooterMsg.textContent = 'Distilling Teacher knowledge into Micro-SLM weights...';

  // Animate progress bar smoothly during training
  let currentPercent = 5;
  const progressTimer = setInterval(() => {
    if (currentPercent < 90) {
      currentPercent += 3;
      elements.trainProgressFill.style.width = `${currentPercent}%`;
      elements.trainPercentStatus.textContent = `${currentPercent}%`;
    }
  }, 400);

  try {
    const result = await apiPost('/api/train', {
      blueprint: state.currentBlueprint,
      samples: state.currentSamples,
    });

    clearInterval(progressTimer);
    elements.trainProgressFill.style.width = '100%';
    elements.trainPercentStatus.textContent = '100%';
    elements.trainEpochStatus.textContent = `Epoch ${state.currentBlueprint.hyperparameters.epochs} / ${state.currentBlueprint.hyperparameters.epochs}`;

    state.lastTrainedModel = result.model_name;
    state.trainingHistory = result.history || [];

    // Render stats
    elements.metricTrainLoss.textContent = result.final_train_loss;
    elements.metricValLoss.textContent = result.final_val_loss;
    elements.metricPerplexity.textContent = result.final_perplexity;
    elements.metricTime.textContent = `${result.training_time_seconds}s`;

    elements.trainFooterMsg.innerHTML = `<span class="text-emerald">✓ Distillation Complete! Model ready for edge execution.</span>`;
    elements.btnProceedToArena.disabled = false;

    // Draw dynamic loss chart
    drawLossChart(result.history);
  } catch (err) {
    clearInterval(progressTimer);
    alert(`Distillation failed: ${err.message}`);
    elements.trainFooterMsg.textContent = 'Training encountered an error.';
  } finally {
    elements.btnStartTraining.disabled = false;
    elements.btnStartTraining.innerHTML = `🚀 Start Distillation`;
  }
});

function drawLossChart(history) {
  const canvas = elements.lossChart;
  const ctx = canvas.getContext('2d');
  const w = canvas.width;
  const h = canvas.height;

  ctx.clearRect(0, 0, w, h);

  if (!history || history.length < 2) return;

  const padding = 36;
  const chartW = w - padding * 2;
  const chartH = h - padding * 2;

  // Find max loss
  const trainLosses = history.map(d => d.train_loss);
  const valLosses = history.map(d => d.val_loss);
  const maxLoss = Math.max(...trainLosses, ...valLosses) * 1.15;
  const minLoss = Math.max(0, Math.min(...trainLosses, ...valLosses) * 0.85);

  // Background Gridlines
  ctx.strokeStyle = 'rgba(255, 255, 255, 0.06)';
  ctx.lineWidth = 1;
  for (let i = 0; i <= 4; i++) {
    const y = padding + (chartH / 4) * i;
    ctx.beginPath();
    ctx.moveTo(padding, y);
    ctx.lineTo(w - padding, y);
    ctx.stroke();

    // Axis label
    const val = (maxLoss - ((maxLoss - minLoss) / 4) * i).toFixed(2);
    ctx.fillStyle = '#64748b';
    ctx.font = '10px JetBrains Mono';
    ctx.fillText(val, 8, y + 3);
  }

  function getX(idx) {
    return padding + (idx / (history.length - 1)) * chartW;
  }
  function getY(loss) {
    return padding + chartH - ((loss - minLoss) / (maxLoss - minLoss)) * chartH;
  }

  // Draw Train Loss Curve (Cyan)
  ctx.strokeStyle = '#06b6d4';
  ctx.lineWidth = 2.5;
  ctx.beginPath();
  history.forEach((d, i) => {
    const x = getX(i);
    const y = getY(d.train_loss);
    if (i === 0) ctx.moveTo(x, y);
    else ctx.lineTo(x, y);
  });
  ctx.stroke();

  // Draw Val Loss Curve (Emerald)
  ctx.strokeStyle = '#10b981';
  ctx.lineWidth = 2.5;
  ctx.beginPath();
  history.forEach((d, i) => {
    const x = getX(i);
    const y = getY(d.val_loss);
    if (i === 0) ctx.moveTo(x, y);
    else ctx.lineTo(x, y);
  });
  ctx.stroke();

  // Legend
  ctx.fillStyle = '#06b6d4';
  ctx.fillRect(w - 180, 12, 10, 10);
  ctx.fillStyle = '#e2e8f0';
  ctx.font = '11px Outfit';
  ctx.fillText('Train Loss', w - 165, 21);

  ctx.fillStyle = '#10b981';
  ctx.fillRect(w - 90, 12, 10, 10);
  ctx.fillStyle = '#e2e8f0';
  ctx.fillText('Val Loss', w - 75, 21);
}

// --- Battle Arena & Inference ---
elements.btnArenaSubmit.addEventListener('click', async () => {
  const query = elements.arenaQueryInput.value.trim();
  if (!query) return;

  const modelName = state.lastTrainedModel;
  if (!modelName) {
    alert('Please train a model first.');
    return;
  }

  elements.btnArenaSubmit.disabled = true;
  elements.studentOutputBox.textContent = 'Generating locally...';
  elements.teacherOutputBox.textContent = 'Calling Teacher AI...';

  try {
    // Run student inference
    const studentRes = await apiPost('/api/infer', {
      model_name: modelName,
      prompt: query,
      temperature: 0.7,
      max_tokens: 64,
    });

    elements.studentOutputBox.textContent = studentRes.response;
    elements.studentLatencyBadge.textContent = `${studentRes.latency_ms} ms`;
    elements.arenaStudentTitle.textContent = `⚡ Distilled ${studentRes.model_name}`;
    elements.arenaStudentParams.textContent = `${studentRes.total_parameters.toLocaleString()} Params`;

    // Run benchmark for single query to get Teacher comparison
    const comp = await apiPost('/api/benchmark', {
      model_name: modelName,
      queries: [query],
    });

    if (comp.comparisons && comp.comparisons.length > 0) {
      const match = comp.comparisons[0];
      elements.teacherOutputBox.textContent = match.teacher.response;
      elements.teacherLatencyBadge.textContent = `${match.teacher.latency_ms} ms`;
      elements.arenaSpeedupText.textContent = `${match.speedup}x Faster`;
    }
  } catch (err) {
    alert(`Arena error: ${err.message}`);
  } finally {
    elements.btnArenaSubmit.disabled = false;
  }
});

// Benchmark Suite
elements.btnRunBenchmark.addEventListener('click', async () => {
  const modelName = state.lastTrainedModel;
  if (!modelName) {
    alert('Please train a model first.');
    return;
  }

  elements.btnRunBenchmark.disabled = true;
  elements.btnRunBenchmark.textContent = 'Running Benchmark...';

  const testQueries = [
    elements.arenaQueryInput.value || "My account is locked, how can I access it?",
    "I was double charged on my card yesterday.",
    "Can you export all transactions to a CSV file?",
  ];

  try {
    const bench = await apiPost('/api/benchmark', {
      model_name: modelName,
      queries: testQueries,
    });

    elements.benchmarkBox.style.display = 'block';
    elements.benchmarkContainer.innerHTML = `
      <div class="summary-item mt-2">
        <span class="item-label">Average Speedup:</span>
        <strong class="text-emerald">${bench.overall_speedup}</strong>
      </div>
      <div class="summary-item">
        <span class="item-label">Teacher Avg Latency:</span>
        <span class="font-mono">${bench.average_teacher_latency_ms} ms</span>
      </div>
      <div class="summary-item">
        <span class="item-label">Student Avg Latency:</span>
        <span class="font-mono text-emerald">${bench.average_student_latency_ms} ms</span>
      </div>
    `;
  } catch (err) {
    alert(`Benchmark failed: ${err.message}`);
  } finally {
    elements.btnRunBenchmark.disabled = false;
    elements.btnRunBenchmark.textContent = '⚡ Run Multi-Query Benchmark';
  }
});

// --- Export & Packaging ---
async function triggerExport() {
  const modelName = state.lastTrainedModel;
  if (!modelName) {
    alert('Please train a model first.');
    return;
  }

  try {
    const res = await apiPost('/api/export', { model_name: modelName });
    elements.exportPathDisplay.textContent = res.export_path;

    elements.exportSnippetCode.textContent = `# 1. Enter the exported standalone folder
cd "${res.export_path}"

# 2. Run instant CLI prediction
python serve.py --prompt "Your test input"

# 3. Launch the dedicated REST API server
python serve.py --server`;

    switchTab('tab-export');
  } catch (err) {
    alert(`Export failed: ${err.message}`);
  }
}

elements.btnCopyCode.addEventListener('click', () => {
  navigator.clipboard.writeText(elements.exportSnippetCode.textContent);
  elements.btnCopyCode.textContent = 'Copied!';
  setTimeout(() => { elements.btnCopyCode.textContent = 'Copy'; }, 2000);
});

// --- Settings Modal ---
elements.btnOpenSettings.addEventListener('click', () => {
  elements.modal.style.display = 'flex';
  elements.modalStatusMsg.textContent = '';
});

function closeModal() {
  elements.modal.style.display = 'none';
}
elements.btnCloseModal.addEventListener('click', closeModal);
elements.btnCancelModal.addEventListener('click', closeModal);

elements.btnSaveKey.addEventListener('click', async () => {
  const key = elements.modalApiKey.value.trim();
  if (!key) {
    elements.modalStatusMsg.textContent = 'Please enter a valid key.';
    elements.modalStatusMsg.className = 'status-msg text-sm text-dim mt-2';
    return;
  }

  try {
    await apiPost('/api/set-key', { api_key: key });
    elements.modalStatusMsg.textContent = 'API key saved successfully!';
    elements.modalStatusMsg.className = 'status-msg text-sm text-emerald mt-2';
    elements.teacherStatusText.textContent = 'Teacher: Gemini Active';
    elements.teacherStatusPill.className = 'status-pill';
    setTimeout(closeModal, 1000);
  } catch (err) {
    elements.modalStatusMsg.textContent = `Error: ${err.message}`;
  }
});

// Start initialization
initSystem();
