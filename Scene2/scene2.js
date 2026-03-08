const stage = document.getElementById("stage");
const taskScene = document.getElementById("task1");
const outcomeScene = document.getElementById("outcome1");
const timerPanelImg = document.getElementById("timerPanelImg");
const alarmSound = document.getElementById("alarmSound");
const task2Trigger = document.getElementById("task2Trigger");
const popupOverlay = document.getElementById("popupOverlay");
const glitchPopup = document.getElementById("glitchPopup");
const task2Scene = document.getElementById("task2");

let flickerTimer = null;
let shakeFrame = null;

/* 让 1440x1024 舞台始终完整显示，不出现滚动 */
function fitStage() {
  const baseWidth = 1440;
  const baseHeight = 1024;

  const scaleX = window.innerWidth / baseWidth;
  const scaleY = window.innerHeight / baseHeight;
  const scale = Math.min(scaleX, scaleY);

  stage.style.transform = `translate(-50%, -50%) scale(${scale})`;
}

window.addEventListener("resize", fitStage);
fitStage();

/* TIME LEFT 闪烁 */
function flicker() {
  const r = Math.random();

  if (r < 0.15) {
    timerPanelImg.style.opacity = "0.35";
    timerPanelImg.style.filter =
      "brightness(0.6) drop-shadow(0 0 6px rgba(160,255,255,.35)) drop-shadow(0 0 12px rgba(160,255,255,.18))";
  } else if (r < 0.3) {
    timerPanelImg.style.opacity = "0.6";
    timerPanelImg.style.filter =
      "brightness(0.8) drop-shadow(0 0 6px rgba(160,255,255,.35)) drop-shadow(0 0 12px rgba(160,255,255,.18))";
  } else {
    timerPanelImg.style.opacity = "1";
    timerPanelImg.style.filter =
      "brightness(1) drop-shadow(0 0 6px rgba(160,255,255,.35)) drop-shadow(0 0 12px rgba(160,255,255,.18))";
  }

  flickerTimer = setTimeout(flicker, Math.random() * 180 + 80);
}

/* TIME LEFT 轻微震动 */
function shake() {
  const x = (Math.random() - 0.5) * 1.2;
  const y = (Math.random() - 0.5) * 1.2;

  timerPanelImg.style.transform = `translate(${x}px, ${y}px)`;
  shakeFrame = requestAnimationFrame(shake);
}

function startTimerEffects() {
  stopTimerEffects();
  flicker();
  shake();
}

function stopTimerEffects() {
  if (flickerTimer) {
    clearTimeout(flickerTimer);
    flickerTimer = null;
  }

  if (shakeFrame) {
    cancelAnimationFrame(shakeFrame);
    shakeFrame = null;
  }

  timerPanelImg.style.opacity = "1";
  timerPanelImg.style.transform = "translate(0, 0)";
  timerPanelImg.style.filter =
    "brightness(1) drop-shadow(0 0 6px rgba(160,255,255,.35)) drop-shadow(0 0 12px rgba(160,255,255,.18))";
}

startTimerEffects();

/* 15秒后切到 outcome1 */
setTimeout(() => {

taskScene.classList.remove("active");
outcomeScene.classList.add("active");

stopTimerEffects();

alarmSound.currentTime = 0;
alarmSound.play();

},15000);

let popupTimer = null;
let closingTimer = null;
let popupSeen = false;

function openPopup() {
  clearTimeout(popupTimer);
  clearTimeout(closingTimer);

  popupOverlay.classList.add("show");

  glitchPopup.classList.remove("is-closing");
  glitchPopup.classList.remove("is-glitching");
  void glitchPopup.offsetWidth;
  glitchPopup.classList.add("is-glitching");

  popupTimer = setTimeout(() => {
    closePopup();
  }, 2000);
}

function closePopup() {
  clearTimeout(popupTimer);
  clearTimeout(closingTimer);

  if (!popupOverlay.classList.contains("show")) return;

  glitchPopup.classList.remove("is-glitching");
  glitchPopup.classList.remove("is-closing");
  void glitchPopup.offsetWidth;
  glitchPopup.classList.add("is-closing");

  closingTimer = setTimeout(() => {
    popupOverlay.classList.remove("show");
    glitchPopup.classList.remove("is-closing");
  }, 320);
}

task2Trigger.addEventListener("click", () => {
  if (!popupSeen) {
    openPopup();
    popupSeen = true;
  } else {
    /* 停止 outcome1 警报音 */
    alarmSound.pause();
    alarmSound.currentTime = 0;

    /* 进入 task2 */
    outcomeScene.classList.remove("active");
    task2Scene.classList.add("active");
  }
});

popupOverlay.addEventListener("click", (e) => {
  if (e.target === popupOverlay) {
    closePopup();
  }
});

document.addEventListener("keydown", (e) => {
  if (e.key === "Escape") {
    closePopup();
  }
});

