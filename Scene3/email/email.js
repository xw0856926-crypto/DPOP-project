const acceptBtn = document.querySelector(".accept-btn");
const rejectBtn = document.querySelector(".reject-btn");
const btnGroup = document.getElementById("btnGroup");
const playerNameSlot = document.getElementById("playerNameSlot");
const flash = document.getElementById("flashOverlay");
const blackOverlay = document.getElementById("blackOverlay");
const stage = document.getElementById("stage");
const emailPanel = document.getElementById("emailPanel");

const savedName = localStorage.getItem("playerName") || "XXX";

if (playerNameSlot) {
  playerNameSlot.textContent = savedName;
}

if (acceptBtn) {
  acceptBtn.addEventListener("click", () => {
    acceptBtn.style.pointerEvents = "none";
    if (rejectBtn) rejectBtn.style.pointerEvents = "none";

    // 1. 邮件内容先淡出
    if (emailPanel) {
      emailPanel.classList.add("fade-out");
    }

    // 2. 稍后黑屏出现
    setTimeout(() => {
      if (blackOverlay) {
        blackOverlay.classList.add("active");
      }
    }, 650);

    // 3. 黑屏上做一次白闪
    setTimeout(() => {
      if (flash) {
        flash.classList.remove("active");
        void flash.offsetWidth;
        flash.classList.add("active");
      }
    }, 760);

    // 4. 黑屏轻微闪动 / glitch
    setTimeout(() => {
      if (blackOverlay) {
        blackOverlay.classList.add("glitch");
      }
    }, 850);

    // 5. 跳转
    setTimeout(() => {
      window.location.href = "../microphone/microphone.html";
    }, 1700);
  });
}

if (rejectBtn) {
  rejectBtn.addEventListener("click", () => {
    console.log("REJECT clicked");
  });
}

// 按钮组出现后 2 秒让 REJECT 消失
if (btnGroup && rejectBtn) {
  btnGroup.addEventListener("animationend", (e) => {
    if (e.animationName === "btnFadeIn") {
      setTimeout(() => {
        rejectBtn.classList.add("fade-out");
      }, 2000);
    }
  });
}