const allCards = document.querySelectorAll(".memory-card");

/* 打字音效 */
const typingSound = new Audio("./sound/virtualzero-keyboard-typing-fast-371229.mp3");
typingSound.loop = true;
typingSound.preload = "auto";

allCards.forEach((card) => {
  const input = card.querySelector(".date-input");
  const questionState = card.querySelector(".question-state");
  const diaryState = card.querySelector(".diary-state");
  const diaryText = card.querySelector(".diary-text");
  const template = diaryText.dataset.template;

  let typingTimer = null;
  let hasSubmitted = false;

  // 自动格式化为 DD/MM
  input.addEventListener("input", (e) => {
    let value = e.target.value.replace(/[^\d]/g, "");

    if (value.length > 4) {
      value = value.slice(0, 4);
    }

    if (value.length >= 3) {
      value = value.slice(0, 2) + "/" + value.slice(2);
    }

    e.target.value = value;
  });

  // 聚焦时隐藏 placeholder
  input.addEventListener("focus", () => {
    input.setAttribute("data-placeholder", input.placeholder);
    input.placeholder = "";
  });

  // 失焦时如果没输入就恢复 placeholder
  input.addEventListener("blur", () => {
    if (input.value.trim() === "") {
      input.placeholder = input.getAttribute("data-placeholder") || "xx/xx";
    } else {
      submitCard();
    }
  });

  // 回车提交
  input.addEventListener("keydown", (e) => {
    if (e.key === "Enter") {
      submitCard();
    }
  });

  function submitCard() {
    if (hasSubmitted) return;

    const value = input.value.trim();
    const isValid = /^\d{2}\/\d{2}$/.test(value);

    if (!isValid) return;

    hasSubmitted = true;

    const finalText = template.replace("xx/xx", value);

    questionState.classList.add("hidden");
    diaryState.classList.remove("hidden");

    startTypewriter(diaryText, finalText, 28);
  }

  function startTypewriter(element, text, speed = 30) {
    if (typingTimer) {
      clearInterval(typingTimer);
      typingTimer = null;
    }

    element.textContent = "";

    playTypingSound();

    let index = 0;

    typingTimer = setInterval(() => {
      element.textContent += text.charAt(index);
      index++;

      if (index >= text.length) {
        clearInterval(typingTimer);
        typingTimer = null;
        stopTypingSound();
      }
    }, speed);
  }
});

function playTypingSound() {
  typingSound.currentTime = 0;
  typingSound.play().catch((err) => {
    console.log("Typing sound playback failed:", err);
  });
}

function stopTypingSound() {
  typingSound.pause();
  typingSound.currentTime = 0;
}

/* 固定舞台尺寸，只整体缩放 */
const stage = document.getElementById("stage");
const STAGE_WIDTH = 1440;
const STAGE_HEIGHT = 1024;

function scaleStage() {
  const ww = window.innerWidth;
  const wh = window.innerHeight;
  const scale = Math.min(ww / STAGE_WIDTH, wh / STAGE_HEIGHT);

  stage.style.transform = `translate(-50%, -50%) scale(${scale})`;
}

scaleStage();
window.addEventListener("resize", scaleStage);