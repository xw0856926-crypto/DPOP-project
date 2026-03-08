let currentStage = "task"; 
// task → result → outcome1
const screenEl = document.getElementById("screen");
const timerEl = document.getElementById("timer");
const warningEl = document.getElementById("warning");
const optA = document.getElementById("optA");
const optB = document.getElementById("optB");
const task2Btn = document.getElementById("task2Btn");
const task3Btn = document.getElementById("task3Btn");
const analyseBtn = document.getElementById("analyseBtn");

// 新增：audio 元素与解锁 overlay
const taskAudio = document.getElementById("taskAudio");
const resultAudio = document.getElementById("resultAudio");
const result2Audio = document.getElementById("result2Audio");
const result3Audio = document.getElementById("result3Audio");
const audioUnlock = document.getElementById("audioUnlock");

let remaining = 30;
let timerId = null;

function formatTime(seconds) {
  const m = String(Math.floor(seconds / 60)).padStart(2, "0");
  const s = String(seconds % 60).padStart(2, "0");
  return `${m} : ${s}`;
}

// 控制红色状态（10秒触发）
function setDanger(on) {
  if (on) {
    timerEl.classList.add("is-danger");
  } else {
    timerEl.classList.remove("is-danger");
  }
}

// 控制警告标识（5秒触发）
function setWarning(on) {
  if (on) {
    warningEl.classList.add("is-on");
  } else {
    warningEl.classList.remove("is-on");
  }
}

// 新增：开始/停止背景音（循环）
function startTaskAudio() {
  if (!taskAudio) return Promise.resolve();
  taskAudio.loop = true;
  taskAudio.volume = 0.6;
  taskAudio.currentTime = 0;
  // 返回 play() 的 promise 以便检测是否被浏览器拦截
  return taskAudio.play();
}

function stopTaskAudio() {
  if (!taskAudio) return;
  taskAudio.pause();
  taskAudio.currentTime = 0;
}

function playResultAudio(){
  if (!resultAudio) return;

  resultAudio.loop = false;     // 不循环
  resultAudio.currentTime = 0;  // 从头播放
  resultAudio.volume = 0.8;

  resultAudio.play().catch(() => {
    console.log("Result audio autoplay blocked.");
  });
}

function playResult2Audio(){
  if (!result2Audio) return Promise.resolve();

  // ✅ 保险：先停再播，避免上一次残留
  try {
    result2Audio.pause();
  } catch(e) {}

  result2Audio.loop = false;
  result2Audio.volume = 0.8;
  result2Audio.currentTime = 0;

  return result2Audio.play().catch((e) => {
    console.warn("Result2 audio play() failed:", e);
    throw e;
  });
}

function playResult3Audio(){
  if (!result3Audio) return Promise.resolve();

  try { result3Audio.pause(); } catch(e) {}

  result3Audio.loop = false;
  result3Audio.volume = 0.8;
  result3Audio.currentTime = 0;

  return result3Audio.play().catch((e) => {
    console.warn("Result3 audio play() failed:", e);
    throw e;
  });
}

function goToResult() {
   console.log("goToResult called, currentStage =", currentStage);
  // ====== Task 1 → result.png（你原来的逻辑）======
  if (currentStage === "task") {
    currentStage = "result";

    setDanger(false);
    setWarning(false);

    stopTaskAudio();

    screenEl.src = "assets/image/result.png";
    timerEl.style.display = "none";

    if (optA) optA.style.display = "none";
    if (optB) optB.style.display = "none";

    // 播放 result 音频（你已经做好的）
    playResultAudio();

    return;
  }

// ====== Task 2 → result2.png ======
if (currentStage === "task2") {
  currentStage = "result2";

  setDanger(false);
  setWarning(false);

  stopTaskAudio();

  if (timerId) {
    clearInterval(timerId);
    timerId = null;
  }

  screenEl.src = "assets/image/result2.png";
  timerEl.style.display = "none";

  if (optA) optA.style.display = "none";
  if (optB) optB.style.display = "none";

  // ✅ 关键：播放 result2 音效（一次）
  playResult2Audio().catch((e) => {
    console.log("Result2 audio blocked or failed:", e);
  });

  return;
}

  // ====== Task 3 → result3.png ======
if (analyseBtn) analyseBtn.style.display = "none";
  if (currentStage === "task3") {
  currentStage = "result3";

  setDanger(false);
  setWarning(false);

  stopTaskAudio();

  if (timerId) {
    clearInterval(timerId);
    timerId = null;
  }

  screenEl.src = "assets/image/result3.png";
  timerEl.style.display = "none";

  if (optA) optA.style.display = "none";
  if (optB) optB.style.display = "none";

  // ✅ 进入 result3 自动播放音效（一次）
  playResult3Audio().catch((e) => {
    console.log("Result3 audio blocked or failed:", e);
  });

  return;
}
}

function startCountdown(seconds) {
  remaining = seconds;
  timerEl.textContent = formatTime(remaining);
  setDanger(false);
  setWarning(false);

  // 启动音频（如果此前已经允许播放，则会顺利播放；如果被拦截，startTaskAudio() 返回的 promise 会 reject）
  startTaskAudio().catch(() => {
    // 如果被拦截，这里不会阻止倒计时启动 —— 倒计时仍然开始
    console.log("Audio autoplay blocked; waiting for user gesture to enable audio.");
    // 同时展示解锁覆盖层（提示用户点击开启声音）
    if (audioUnlock) {
      audioUnlock.classList.remove("hidden");
    }
  });

  if (timerId) clearInterval(timerId);

  timerId = setInterval(() => {
    remaining -= 1;
    timerEl.textContent = formatTime(remaining);

    // 10秒开始变红
    if (remaining <= 10 && remaining > 5) {
      setDanger(true);
      setWarning(false);
    }

    // 5秒开始出现警告
    if (remaining <= 5 && remaining > 0) {
      setDanger(true);
      setWarning(true);
    }

    // 时间到
    if (remaining <= 0) {
      clearInterval(timerId);
      timerId = null;
      goToResult();
    }

  }, 1000);
}
function goToTask2() {

  if (currentStage !== "outcome1") return;

  currentStage = "task2";

  screenEl.src = "assets/image/task2.png"; 

  if (task2Btn) task2Btn.style.display = "none";

  if (optA) optA.style.display = "block";
  if (optB) optB.style.display = "block";

  timerEl.style.display = "block";

  startCountdown(30);
}

function goToTask3() {
  if (currentStage !== "outcome2") return;

  currentStage = "task3";

  // 🔴 把这里换成你的 Task3 图片文件名
  screenEl.src = "assets/image/task3.png";

  // 隐藏 task3 按钮
  if (task3Btn) task3Btn.style.display = "none";

  // 显示 option + timer（如果 Task3 也要做选择+倒计时）
  if (optA) optA.style.display = "block";
  if (optB) optB.style.display = "block";
  timerEl.style.display = "block";

  startCountdown(30);
}

// 如果浏览器拦截了自动播放，audioUnlock 会显示；
// 用户点击 overlay 时，这个 handler 会尝试再次播放并隐藏 overlay，然后（如果倒计时还在）保持倒计时不中断。
if (audioUnlock) {
  audioUnlock.addEventListener("click", async () => {
    // 尝试播放并隐藏 overlay（如果播放成功）
    try {
      await startTaskAudio();
      audioUnlock.classList.add("hidden");
    } catch (e) {
      // 如果还失败，保持 overlay（用户可能需要到浏览器地址栏点击允许等）
      console.warn("Audio still blocked after user click:", e);
      // 你可以提示用户检查浏览器权限
      audioUnlock.querySelector(".unlock-sub").textContent = "Please allow audio in your browser settings";
    }
  });
}

// 入口：尽量先尝试自动启动（这会被浏览器拦截），无论是否成功都立刻开始倒计时
// 你现有代码是 DOMContentLoaded => startCountdown(30)，我保持这个行为：
window.addEventListener("DOMContentLoaded", () => {
  // ✅ Option A/B：点击进入 goToResult
  if (optA) optA.addEventListener("click", goToResult);
  if (optB) optB.addEventListener("click", goToResult);

  // ✅ Task2 / Task3：按钮点击进入对应任务（只绑定一次，避免重复叠加）
  if (task2Btn) {
    task2Btn.onclick = null;
    task2Btn.addEventListener("click", goToTask2);
  }
  if (task3Btn) {
    task3Btn.onclick = null;
    task3Btn.addEventListener("click", goToTask3);
  }
  if (analyseBtn) {
  analyseBtn.onclick = null;
  analyseBtn.addEventListener("click", () => {
    if (currentStage !== "outcome3") return;

     window.location.href = "analyse.html";

  });
}

  // ✅ 只在 task 阶段启动倒计时
  if (currentStage === "task") startCountdown(30);

  // ✅ result 音频播完 → 切到 outcome1，并显示 TASK2 按钮
  if (resultAudio) {
    resultAudio.onended = null;
    resultAudio.addEventListener("ended", () => {
      if (currentStage !== "result") return;

      currentStage = "outcome1";
      screenEl.src = "assets/image/outcome1.png";

      if (timerId) {
        clearInterval(timerId);
        timerId = null;
      }

      if (task2Btn) task2Btn.style.display = "block";
    });
  }

  // ✅ result2 音频播完 → 切到 outcome2，并显示 TASK THREE 按钮
  if (result2Audio) {
  result2Audio.onended = () => {
    if (currentStage !== "result2") return;

    currentStage = "outcome2";
    screenEl.src = "assets/image/outcome2.png";

    if (timerId) {
      clearInterval(timerId);
      timerId = null;
    }

    if (task3Btn) task3Btn.style.display = "block";
  };
}
if (result3Audio) {
  result3Audio.onended = () => {
    if (currentStage !== "result3") return;

    currentStage = "outcome3";
    screenEl.src = "assets/image/outcome3.png";

    // 保险：停止倒计时
    if (timerId) {
      clearInterval(timerId);
      timerId = null;
    }

    // 显示 ANALYSE 按钮
    if (analyseBtn) analyseBtn.style.display = "block";
  };
}
});