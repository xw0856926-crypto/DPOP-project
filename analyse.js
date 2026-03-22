const slots = document.querySelectorAll(".voice-slot");
const dropZone = document.getElementById("dropZone");
const dropDisplay = document.getElementById("dropDisplay");
const scanLine = document.getElementById("scanLine");
const analyseStatus = document.getElementById("analyseStatus");
const outcomeBox = document.getElementById("outcomeBox");
const outcomeText = document.getElementById("outcomeText");


const voiceAudio = {
  1: new Audio("assets/audio/voice_clue_1.wav"),
  2: new Audio("assets/audio/voice_clue_2.wav"),
  3: new Audio("assets/audio/voice_clue_3.wav")
};

const outcomeMap = {
  1: "“The current labor costs are too low for the company's profit. I hope you can understand this decision.”",
  2: "“Was this your former company? And it has now gone public.”",
  3: "“If all of you have been laid off, then who is currently working in the office?”"
};

const finishedVoices = new Set();
let hasRedirected = false;

// ✅ 正确路径：因为 truth.html 在 truth_page 文件夹里
const NEXT_PAGE = "truth_page/truth.html";

let currentVoice = null;

slots.forEach(slot=>{
  const img = slot.querySelector("img");
  const voiceId = slot.dataset.voice;

  img.addEventListener("dragstart", (e)=>{
    // ✅ 统一：都用 text/plain
    e.dataTransfer.setData("text/plain", voiceId);
    e.dataTransfer.effectAllowed = "move";

    // 拖拽开始：变 active
    img.src = `assets/image/analyse/voice${voiceId}_active.png`;
  });
});

dropZone.addEventListener("dragover", e=>{
  e.preventDefault();
});

dropZone.addEventListener("drop", (e) => {
  e.preventDefault();

  // ✅ 统一：都用 text/plain
  const voiceId = e.dataTransfer.getData("text/plain");
  if (!voiceId) return;

  // ✅ 左侧立刻变凹槽
  const slotImg = document.querySelector(`.voice-slot[data-voice='${voiceId}'] img`);
  if (slotImg) slotImg.src = "assets/image/analyse/voice_slot.png";

  // ✅ 开始分析（放大、波浪线、音效都在这里触发）
  startAnalysis(Number(voiceId));
});

const dropHint = document.getElementById("dropHint");
const rightSlot = document.getElementById("rightSlot");


function showDropCard(src){
  dropDisplay.src = src;
  dropDisplay.classList.add("is-on");

  // ✅ 分析开始：右侧凹槽 + 文字隐藏
  if (rightSlot) rightSlot.style.display = "none";
  if (dropHint) dropHint.style.display = "none";
}

function clearDropCard(){
  dropDisplay.src = "";
  dropDisplay.classList.remove("is-on");

  // ✅ 分析结束：右侧凹槽 + 文字出现
  if (rightSlot) rightSlot.style.display = "block";
  if (dropHint) dropHint.style.display = "block";
}

function startAnalysis(voiceId){
  const audio = voiceAudio[voiceId];
  audio.currentTime = 0;

  if (outcomeBox) outcomeBox.classList.remove("is-on");
  if (outcomeText) outcomeText.textContent = "";

  // 右侧显示 drop 图（开始分析）
  showDropCard(`assets/image/analyse/voice${voiceId}_drop.png`);

  if (analyseStatus) {
  analyseStatus.textContent = "ANALYSING";
  analyseStatus.classList.add("active");
}
  if (scanLine) scanLine.classList.add("active");
  waveSvg.classList.add("active");
  startWave();

  audio.play().catch((e)=>console.warn("audio play failed:", e));

  audio.onended = () => {
  // 停止波浪线
  if (analyseStatus) {
  analyseStatus.textContent = "OUTCOME";
  analyseStatus.classList.add("active"); // 保持显示
}
  // ✅ 显示 outcome 文本（不同 voice 不同结果）
  if (outcomeText) outcomeText.textContent = outcomeMap[voiceId] || "";
  if (outcomeBox) outcomeBox.classList.add("is-on");
  if (scanLine) scanLine.classList.remove("active");
  waveSvg.classList.remove("active");
  stopWave();

  // ✅ 左侧立刻变成 finished（归位）
  const slotImg = document.querySelector(`.voice-slot[data-voice='${voiceId}'] img`);
  if (slotImg) {
    slotImg.src = `assets/image/analyse/voice${voiceId}_finished.png`;
    slotImg.draggable = false;      // 已完成就不让再拖（如果你要可重复可删）
    slotImg.style.cursor = "default";
  }

  // ✅ 记录完成的 voice
  finishedVoices.add(Number(voiceId));

  // ✅ 三个都完成后自动跳转（只触发一次）
  if (!hasRedirected && finishedVoices.size === 3) {
  hasRedirected = true;

   // 想让用户看到 OUTCOME 一下再跳就保留 800ms
   setTimeout(() => {
     startAnalyseToTruthTransition();
   }, 800);
  }
  // ✅ 右侧立刻清空（不展示 finished 停留）
  clearDropCard();
};
}

// ===========================
// ✅ Dynamic Wave (Figma SVG) - single RAF
// ===========================
const waveSvg = document.getElementById("wave");
const wave1 = document.getElementById("wave1");
const wave2 = document.getElementById("wave2");
const wave3 = document.getElementById("wave3");
console.log("waveSvg:", waveSvg, "wave1:", wave1, "wave2:", wave2, "wave3:", wave3);

let waveRAF = null;
let t = 0;

const baseAmp = 15;     // 峰值强度：越大越夸张（建议 16~30）
const samples = 600;    // 越大越平滑（建议 120~180）
const waveStore = new Map(); // pathEl -> base pts

function sampleBase(pathEl) {
  const len = pathEl.getTotalLength();
  const pts = [];
  for (let i = 0; i <= samples; i++) {
    const p = pathEl.getPointAtLength((len * i) / samples);
    pts.push({ x: p.x, y: p.y });
  }
  return pts;
}

// Catmull-Rom -> Bezier：平滑曲线（避免“折线断裂感”）
function buildLineD(pts) {
  let d = `M ${pts[0].x.toFixed(3)} ${pts[0].y.toFixed(3)}`;
  for (let i = 1; i < pts.length; i++) {
    d += ` L ${pts[i].x.toFixed(3)} ${pts[i].y.toFixed(3)}`;
  }
  return d;
}

function peakEnvelope(nx, time, phase) {
  const p1 = Math.exp(-Math.pow((nx - (0.28 + 0.10 * Math.sin(time * 0.8 + phase))) / 0.12, 2));
  const p2 = Math.exp(-Math.pow((nx - (0.68 + 0.08 * Math.sin(time * 0.9 + phase * 1.7))) / 0.13, 2));
  return 0.30 + 1.25 * (p1 + 0.9 * p2);
}

function deform(pathEl, amp, phase, speed, f1, f2) {
  const base = waveStore.get(pathEl);
  if (!base) return;

  const clamp = amp * 1.2; // ✅ 收紧一点，避免过冲乱飞

  const out = base.map((p, i) => {
    const nx = i / samples;
    const env = peakEnvelope(nx, t, phase);

    const raw =
      (amp * env) *
      (Math.sin(nx * Math.PI * 2 * f1 + t * speed + phase) +
        0.55 * Math.sin(nx * Math.PI * 2 * f2 + t * (speed * 0.73) + phase * 1.4));

    const off = Math.max(-clamp, Math.min(clamp, raw));

    return { x: p.x, y: p.y + off }; // ✅ 只改 y
  });

  pathEl.setAttribute("d", buildLineD(out));
}

function waveLoop() {
  t += 0.016;

  deform(wave1, baseAmp * 0.70, 0.6, 3.4, 1.7, 3.0);
  deform(wave2, baseAmp * 1.00, 1.9, 4.0, 2.2, 4.2);
  deform(wave3, baseAmp * 0.85, 3.2, 3.7, 2.0, 3.6);

  waveRAF = requestAnimationFrame(waveLoop);
}

function startWave() {
  if (waveRAF) return;

  // 第一次启动时采样“原始曲线”
  if (!waveStore.size) {
    waveStore.set(wave1, sampleBase(wave1));
    waveStore.set(wave2, sampleBase(wave2));
    waveStore.set(wave3, sampleBase(wave3));
  }

  waveRAF = requestAnimationFrame(waveLoop);
}

function stopWave() {
  if (waveRAF) cancelAnimationFrame(waveRAF);
  waveRAF = null;
}

function startAnalyseToTruthTransition() {
  document.body.classList.add("scene-tear-transition");

  const tearOverlay = document.createElement("div");
  tearOverlay.className = "tear-overlay";

  let currentTop = 0;

  while (currentTop < 100) {
    const slice = document.createElement("div");
    slice.className = "tear-slice";

    let height;
    const rand = Math.random();

    if (rand < 0.5) {
      height = 2 + Math.random() * 3;
    } else if (rand < 0.8) {
      height = 4 + Math.random() * 6;
    } else {
      height = 8 + Math.random() * 10;
    }

    const gap = Math.random() < 0.7
      ? Math.random() * 2
      : Math.random() * 6;

    const top = currentTop + Math.random() * 1.5;

    const shift = -80 + Math.random() * 160;

    const delay = Math.random() * 0.2;
    const duration = 0.06 + Math.random() * 0.18;

    slice.style.top = `${top}%`;
    slice.style.height = `${height}%`;

    let finalShift = shift;

    // ✅ 反方向撕裂
    if (Math.random() < 0.35) {
      finalShift = -shift;
    }

    if (Math.random() < 0.12) {
      finalShift *= 1.3;
    }

    slice.style.setProperty("--tear-shift", `${finalShift}px`);
    slice.style.setProperty("--tear-delay", `${delay}s`);
    slice.style.setProperty("--tear-duration", `${duration}s`);

    if (Math.random() < 0.25) {
      slice.style.opacity = 0.4 + Math.random() * 0.6;
    }

    tearOverlay.appendChild(slice);

    currentTop += height + gap;
  }

  document.body.appendChild(tearOverlay);

  // ✅ 黑闪 + 白噪点
  setTimeout(() => {
    const blackout = document.createElement("div");
    blackout.className = "scene-blackout-flash";

    const noise = document.createElement("div");
    noise.className = "scene-noise-flash";

    blackout.appendChild(noise);
    document.body.appendChild(blackout);
  }, 700);

  // ✅ 跳转
  setTimeout(() => {
    window.location.href = NEXT_PAGE;
  }, 900);
}