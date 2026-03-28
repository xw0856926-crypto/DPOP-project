const stage = document.getElementById("stage");
const coreGlow = document.getElementById("coreGlow");
const mapFill = document.getElementById("mapFill");
const mapOutline = document.getElementById("mapOutline");
const mapText = document.getElementById("mapText");
const memoryPanel = document.getElementById("memoryPanel");

const mapHotspot = document.getElementById("mapHotspot");
const memoryOverlay = document.getElementById("memoryOverlay");
const memoryLine1 = document.getElementById("memoryLine1");
const memoryLine2 = document.getElementById("memoryLine2");
const memoryLine3 = document.getElementById("memoryLine3");

const glitchOverlay = document.getElementById("glitchOverlay");

const bgm = document.getElementById("bgm");

// 初始音量为0（关键！）
bgm.volume = 0;

// 播放（浏览器可能需要用户交互触发）
bgm.play().catch(() => {
  console.log("Autoplay 被拦截，等待用户交互");
});

// 淡入函数
function fadeInAudio(audio, duration = 3000, targetVolume = 0.2) {
  const step = 0.02;
  const interval = duration / (targetVolume / step);

  const fade = setInterval(() => {
    if (audio.volume < targetVolume) {
      audio.volume = Math.min(audio.volume + step, targetVolume);
    } else {
      clearInterval(fade);
    }
  }, interval);
}

bgm.play().catch(() => {
  console.log("Autoplay 被拦截");
});

fadeInAudio(bgm, 5000, 0.18); // 👈 关键改这里

const STAGE_WIDTH = 1440;
const STAGE_HEIGHT = 1024;

function fitStage() {
  const windowWidth = window.innerWidth;
  const windowHeight = window.innerHeight;

  const scaleX = windowWidth / STAGE_WIDTH;
  const scaleY = windowHeight / STAGE_HEIGHT;
  const scale = Math.min(scaleX, scaleY);

  stage.style.transform = `scale(${scale})`;
}

function wait(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

function animateProgressAsync(fillEl, numEl, duration = 1000) {
  return new Promise(resolve => {
    const start = performance.now();

    const trackEl = fillEl.parentElement;
    const trackWidth = trackEl.offsetWidth;

    function update(now) {
      const elapsed = now - start;
      const progress = Math.min(elapsed / duration, 1);
      const percent = Math.floor(progress * 100);

      // 进度条增长
      fillEl.style.width = percent + "%";

      // 数字变化
      numEl.textContent = percent + "%";

      const numWidth = numEl.offsetWidth;
      const endOffset = 1; // 数字最终停在进度条右边多远，可改 6 / 8 / 10 / 12

      const gap = 1; // 和进度条始终保持的固定距离
      const x = progress * trackWidth + gap;
      const clampedX = Math.max(0, Math.min(x, trackWidth + endOffset));

      numEl.style.transform = `translateX(${clampedX}px)`;

      if (progress < 1) {
        requestAnimationFrame(update);
      } else {
        fillEl.style.width = "100%";
        numEl.textContent = "100%";
        numEl.style.transform = `translateX(${trackWidth + endOffset}px)`;
        resolve();
      }
    }

    requestAnimationFrame(update);
  });
}

async function playMemoryBlock(blockId, progressFillId, progressNumId) {
  const block = document.getElementById(blockId);
  if (!block) return;

  const checks = block.querySelectorAll(".check");
  const progressFill = document.getElementById(progressFillId);
  const progressNum = document.getElementById(progressNumId);

  if (!progressFill || !progressNum) return;

  checks.forEach(check => check.classList.remove("active"));
  progressFill.style.width = "0%";
  progressNum.textContent = "0%";

  for (let i = 0; i < checks.length; i++) {
    checks[i].classList.add("active");
    await wait(320);
  }

  await wait(120);
  await animateProgressAsync(progressFill, progressNum, 1000);
}

async function playAllMemoryBlocks() {
  await playMemoryBlock("voiceBlock", "voiceProgressFill", "voiceProgressNum");
  await wait(250);

  await playMemoryBlock("imageBlock", "imageProgressFill", "imageProgressNum");
  await wait(250);

  await playMemoryBlock("totalBlock", "totalProgressFill", "totalProgressNum");
  await wait(250);

  enableMapInteraction();
}

window.addEventListener("load", () => {
  fitStage();

  setTimeout(() => {
    if (mapText) {
      mapText.classList.add("show");
   }
 }, 2350);

  setTimeout(() => {
    coreGlow.style.opacity = "1";
    coreGlow.style.transform = "scale(1)";
    coreGlow.style.filter = "blur(18px)";
  }, 300);

  setTimeout(() => {
    coreGlow.style.transform = "scale(2.6)";
    coreGlow.style.filter = "blur(36px)";
    coreGlow.style.opacity = "0.85";

    mapFill.style.opacity = "0.72";
    mapFill.style.transform = "scale(1.03)";
    mapFill.style.filter = "blur(8px)";
  }, 1000);

  setTimeout(() => {
    mapFill.style.opacity = "1";
    mapFill.style.transform = "scale(1)";
    mapFill.style.filter = "blur(0px)";

    coreGlow.style.opacity = "0";
  }, 1800);

  setTimeout(() => {
    mapOutline.style.opacity = "1";
    mapOutline.style.filter = "blur(0px)";
  }, 2200);

  setTimeout(() => {
    playAllMemoryBlocks();
  }, 2700);

  if (mapHotspot) {
    mapHotspot.addEventListener("click", () => {
     mapHotspot.classList.remove("active");
     mapFill.classList.remove("clickable");
     showMemoryOverlay();
   });
 }
});

window.addEventListener("resize", fitStage);

function enableMapInteraction() {
  if (mapFill) {
    mapFill.classList.add("clickable");
  }

  if (mapHotspot) {
    mapHotspot.classList.add("active");
  }
}

function showMemoryOverlay() {
  memoryOverlay.classList.add("show");

  setTimeout(() => {
    memoryLine1?.classList.add("show");
  }, 250);

  setTimeout(() => {
    memoryLine2?.classList.add("show");
  }, 700);

  setTimeout(() => {
    memoryLine3?.classList.add("show");
  }, 1150);

  // ⭐ 在最后触发故障跳转
  setTimeout(() => {
    triggerGlitchAndJump();
  }, 2000);
}

function triggerGlitchAndJump() {
  if (!glitchOverlay) return;

  glitchOverlay.classList.add("active");

  // 0.4s 故障 → 再等一点进入下一页
  setTimeout(() => {
    window.location.href = "./email/email.html";
  }, 600);
}