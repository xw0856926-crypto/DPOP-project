const stage = document.getElementById("stage");
const trigger = document.getElementById("cameraTrigger");
const video = document.getElementById("cameraVideo");
const bg1 = document.getElementById("bg1");
const bg2 = document.getElementById("bg2");
const bg3 = document.getElementById("bg3");
const bg4 = document.getElementById("bg4");
const flashOverlay = document.getElementById("flashOverlay");
const overlay = document.getElementById("videoOverlay");
const scanLine = document.getElementById("scanLine");
const detectText = document.getElementById("detectText");
const frame = document.getElementById("frameOverlay");
const whoInputWrap = document.getElementById("whoInputWrap");
const whoInputText = document.getElementById("whoInputText");
const whoCaret = document.getElementById("whoCaret");
const glitchVideo1 = document.getElementById("glitchVideo1");
const glitchVideo2 = document.getElementById("glitchVideo2");
const glitchVideo3 = document.getElementById("glitchVideo3");

const warningSound = new Audio("./sound/warning.mp3");
warningSound.loop = true;
warningSound.volume = 0.6;

const wrongSound = new Audio("../Reminiscence/sound/wrong.mp3");
wrongSound.volume = 0.7;
wrongSound.loop = false;

const correctSound = new Audio("./sound/creepy-dark.mp3");
correctSound.volume = 1.0;
correctSound.loop = true;

let streamRef = null;
let enabled = false;
let switched = false;
let warningPlaying = false;
let audioUnlocked = false;
let stage3Active = false;
let inputBuffer = "";
let inputLocked = false;

function unlockAudio() {
  if (audioUnlocked) return;
  audioUnlocked = true;

  const sounds = [warningSound, wrongSound, correctSound];

  sounds.forEach((sound) => {
    sound.play()
      .then(() => {
        sound.pause();
        sound.currentTime = 0;
      })
      .catch((err) => {
        console.log("Audio unlock failed:", err);
      });
  });
}

function startWarningSound() {
  if (warningPlaying) return;
  warningPlaying = true;

  warningSound.pause();
  warningSound.currentTime = 0;
  warningSound.volume = 0;

  warningSound.play().catch((err) => {
    console.log("Warning sound play failed:", err);
  });

  let v = 0;
  const fade = setInterval(() => {
    v += 0.05;
    if (v >= 0.6) {
      v = 0.6;
      clearInterval(fade);
    }
    warningSound.volume = v;
  }, 100);
}

function stopWarningSound() {
  warningPlaying = false;
  warningSound.pause();
  warningSound.currentTime = 0;
}

function setDetectText(text, isRed = false) {
  detectText.textContent = text;
  detectText.classList.add("active");

  if (isRed) {
    detectText.classList.remove("status-white");
    detectText.classList.add("status-red", "flash-red");
  } else {
    detectText.classList.remove("status-red", "flash-red");
    detectText.classList.add("status-white");
  }

  // 👉 触发放大动画
  detectText.classList.remove("pop"); // 重置
  void detectText.offsetWidth;        // 强制刷新（关键！）
  detectText.classList.add("pop");
}

function startDetectionTextSequence() {
  setDetectText("Information detection is in progress", false);

  setTimeout(() => {
    setDetectText("Machine temperature reaches the standard", true);
    startWarningSound();
  }, 3000);

  setTimeout(() => {
    setDetectText("Emotional fluctuations meet the standard", true);
  }, 6000);

  setTimeout(() => {
    setDetectText("Signs of biological abnormalities appear", true);

    setTimeout(() => {
      goToStage3();
    }, 3000);

  }, 9000);
}

async function enableCamera() {
  if (enabled) return;

  unlockAudio();

  try {
    const stream = await navigator.mediaDevices.getUserMedia({
      video: true,
      audio: false
    });

    streamRef = stream;
    video.srcObject = stream;
    video.classList.add("active");
    enabled = true;

    trigger.style.pointerEvents = "none";
    trigger.blur();
    trigger.style.display = "none";

    setTimeout(() => {
      goToStage2();
    }, 3000);

  } catch (err) {
    console.error("Camera error:", err);
    alert("Unable to access the camera.");
  }
}

function goToStage2() {
  if (switched) return;
  switched = true;

  flashOverlay.classList.add("flash");
  stage.classList.add("glitch");

  setTimeout(() => {
    bg1.classList.remove("active");
    bg2.classList.add("active");

    video.classList.remove("stage1-video");
    video.classList.add("stage2-video");

    overlay.classList.add("active");
    frame.classList.add("active");
    scanLine.classList.add("active");

    startDetectionTextSequence();
  }, 140);

  setTimeout(() => {
    stage.classList.remove("glitch");
    flashOverlay.classList.remove("flash");
  }, 700);
}

trigger.addEventListener("click", enableCamera);

window.addEventListener("beforeunload", () => {
  if (streamRef) {
    streamRef.getTracks().forEach((track) => track.stop());
  }

  stopWarningSound();
  stopWrongSound();
  stopCorrectSound();
});

function goToStage3() {
  const frame = document.getElementById("frameOverlay");
  const errorOverlay = document.getElementById("errorOverlay");
  const glitchBars = document.getElementById("glitchBars");

  trigger.blur();
  trigger.style.display = "none";

  stopWarningSound();

  flashOverlay.classList.add("flash");
  stage.classList.add("glitch");
  stage.classList.add("system-error");
  errorOverlay.classList.add("active");
  glitchBars.classList.add("active");

  setTimeout(() => {
    bg2.classList.remove("active");
    bg3.classList.add("active");

    video.classList.remove("active");
    overlay.classList.remove("active");
    frame.classList.remove("active");
    scanLine.classList.remove("active");
    detectText.classList.remove("active", "status-white", "status-red", "flash-red", "pop");
  }, 180);

  setTimeout(() => {
    flashOverlay.classList.remove("flash");
    stage.classList.remove("glitch");
    stage.classList.remove("system-error");
    errorOverlay.classList.remove("active");
    glitchBars.classList.remove("active");

    activateWhoInput();
  }, 900);
}

function activateWhoInput() {
  stage3Active = true;
  inputLocked = false;
  inputBuffer = "";

  whoInputText.textContent = "";
  whoInputWrap.classList.remove("error");
  whoInputWrap.classList.add("active");

  document.body.focus();
}

function handleWrongInput() {
  whoInputWrap.classList.add("error");

  setTimeout(() => {
    if (!inputLocked) {
      whoInputWrap.classList.remove("error");
      inputBuffer = "";
      whoInputText.textContent = "";
    }
  }, 1400);
}

function handleCorrectInput() {
  inputLocked = true;
  stage3Active = false;

  whoInputWrap.classList.remove("error");

  // 停掉错误或警报音
  stopWrongSound();
  stopWarningSound();

  // 播放正确后的持续音效
  playCorrectSound();

  flashOverlay.classList.add("flash");
  stage.classList.add("glitch");

  setTimeout(() => {
    bg3.classList.remove("active");

    if (bg4) {
      bg4.classList.add("active");
    }

    whoInputWrap.classList.remove("active");

    // 如果有全屏摄像头残留，也顺手关掉显示
    video.classList.remove("fullscreen-video");
    video.classList.remove("active");

    glitchVideo1.classList.remove("active", "tearing");
    glitchVideo2.classList.remove("active", "tearing");
    glitchVideo3.classList.remove("active", "tearing");
  }, 180);

  setTimeout(() => {
    flashOverlay.classList.remove("flash");
    stage.classList.remove("glitch");
  }, 700);

  // 在 THE MEMORY HAS RETURNED 页面停留一会儿再故障跳转
  setTimeout(() => {
    goToScene3WithGlitch();
  }, 2600);
}

window.addEventListener("keydown", (e) => {
  if (!stage3Active || inputLocked) return;

  if (e.key === "Backspace") {
    inputBuffer = inputBuffer.slice(0, -1);
    whoInputText.textContent = inputBuffer;
    whoInputWrap.classList.remove("error");
    return;
  }

  if (e.key === "Enter") {
    const value = inputBuffer
      .replace(/\s+/g, " ")
      .trim()
      .toUpperCase();

    if (value === "CITY 04") {
      handleCity04Error();
      return;
    }

    if (value.length > 0) {
      handleCorrectInput();
      return;
    }

    return;
  }

  if (/^[a-zA-Z0-9 ]$/.test(e.key)) {
    if (inputBuffer.length >= 18) return;

    inputBuffer += e.key.toUpperCase();
    whoInputText.textContent = inputBuffer;
    whoInputWrap.classList.remove("error");
  }
});

function playWrongSound() {
  wrongSound.currentTime = 0;
  wrongSound.play().catch(() => {});
}

function stopWrongSound() {
  wrongSound.pause();
  wrongSound.currentTime = 0;
}

function handleCity04Error() {
  const errorOverlay = document.getElementById("errorOverlay");
  const glitchBars = document.getElementById("glitchBars");
  const frame = document.getElementById("frameOverlay");

  inputLocked = true;
  stage3Active = false;

  // 先让输入区报错
  whoInputWrap.classList.add("error");
  playWrongSound();

  setTimeout(() => {
    stopWrongSound();
    flashOverlay.classList.add("flash");
    stage.classList.add("glitch");
    stage.classList.add("system-error");
    errorOverlay.classList.add("active");
    glitchBars.classList.add("active");

    // 隐藏 WHO ARE YOU
    bg3.classList.remove("active");
    whoInputWrap.classList.remove("active");

    // 清掉第二阶段 UI
    overlay.classList.remove("active");
    scanLine.classList.remove("active");
    detectText.classList.remove("active", "status-white", "status-red", "flash-red", "pop");
    if (frame) frame.classList.remove("active");

    // 主摄像头全屏
    video.classList.add("active");
    video.classList.remove("stage1-video", "stage2-video");
    video.classList.add("fullscreen-video");

    restoreCameraForFullscreenError().then(() => {
      // 横向撕裂条出现
      glitchVideo1.classList.add("active", "tearing");
      glitchVideo2.classList.add("active", "tearing");
      glitchVideo3.classList.add("active", "tearing");
    });
  }, 700);

  // 2 秒后再次 glitch，准备切回
  setTimeout(() => {
    flashOverlay.classList.add("flash");
    stage.classList.add("glitch");
    stage.classList.add("system-error");
  }, 2400);

  // 回到 WHO ARE YOU
  setTimeout(() => {
    bg3.classList.add("active");

    video.classList.remove("fullscreen-video");
    video.classList.remove("active");

    glitchVideo1.classList.remove("active", "tearing");
    glitchVideo2.classList.remove("active", "tearing");
    glitchVideo3.classList.remove("active", "tearing");

    inputBuffer = "";
    whoInputText.textContent = "";

    whoInputWrap.classList.remove("error");
    whoInputWrap.classList.add("active");
  }, 2600);

  // 清理状态
  setTimeout(() => {
    flashOverlay.classList.remove("flash");
    stage.classList.remove("glitch");
    stage.classList.remove("system-error");
    errorOverlay.classList.remove("active");
    glitchBars.classList.remove("active");

    inputLocked = false;
    stage3Active = true;
  }, 3300);
}

async function restoreCameraForFullscreenError() {
  try {
    if (streamRef && streamRef.active) {
      video.srcObject = streamRef;
      syncGlitchVideosStream();
      return;
    }

    const stream = await navigator.mediaDevices.getUserMedia({
      video: true,
      audio: false
    });

    streamRef = stream;
    video.srcObject = stream;
    syncGlitchVideosStream();
  } catch (err) {
    console.error("Restore fullscreen camera failed:", err);
  }
}

function syncGlitchVideosStream() {
  if (!streamRef) return;

  glitchVideo1.srcObject = streamRef;
  glitchVideo2.srcObject = streamRef;
  glitchVideo3.srcObject = streamRef;
}

function playCorrectSound() {
  correctSound.currentTime = 0;
  correctSound.play().catch((err) => {
    console.log("Correct sound play failed:", err);
  });
}

function stopCorrectSound() {
  correctSound.pause();
  correctSound.currentTime = 0;
}

function goToScene3WithGlitch() {
  const errorOverlay = document.getElementById("errorOverlay");
  const glitchBars = document.getElementById("glitchBars");

  glitchVideo1.classList.remove("active", "tearing");
  glitchVideo2.classList.remove("active", "tearing");
  glitchVideo3.classList.remove("active", "tearing");

  stage.classList.add("glitch");

  setTimeout(() => {
    flashOverlay.classList.add("flash");
    stage.classList.add("system-error");
    errorOverlay.classList.add("active");
    glitchBars.classList.add("active");
  }, 400);

  setTimeout(() => {
    document.body.style.background = "#000";
  }, 900);

  setTimeout(() => {
    window.location.href = "../../Scene3/Scene3.html";
  }, 1100);
}