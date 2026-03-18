const allCards = document.querySelectorAll(".memory-card");

allCards.forEach((card) => {
  const input = card.querySelector(".date-input");
  const questionState = card.querySelector(".question-state");
  const diaryState = card.querySelector(".diary-state");
  const diaryText = card.querySelector(".diary-text");
  const template = diaryText.dataset.template;

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

  input.addEventListener("keydown", (e) => {
    if (e.key === "Enter") {
      submitCard();
    }
  });

  input.addEventListener("blur", () => {
    if (input.value.trim() !== "") {
      submitCard();
    }
  });

  function submitCard() {
    const value = input.value.trim();
    const isValid = /^\d{2}\/\d{2}$/.test(value);

    if (!isValid) return;

    diaryText.textContent = template.replace("xx/xx", value);
    questionState.classList.add("hidden");
    diaryState.classList.remove("hidden");
  }
});

/* ===== 固定舞台尺寸，只整体缩放 ===== */
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