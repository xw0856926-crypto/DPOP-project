const startBtn = document.getElementById("startBtn");
const screenIntro = document.getElementById("screenIntro");
const screenIntroduction = document.getElementById("screenIntroduction");
const introFrame = document.getElementById("introFrame");
const workBtn = document.getElementById("workBtn");
const startBgm = document.getElementById("startBgm");
const glitchSfx = document.getElementById("glitchSfx");
const introBgm = document.getElementById("introBgm");

const introBodyText = document.getElementById("introBodyText");

const introTextContent = `In the year 2333, it is a fully AI era. People are no longer
trapped by monotonous and boring work and can truly enjoy the
convenience brought by technology. However, in contrast, there is
a growing shortage of material resources and a deteriorating
natural environment.

You are an AI machine labeled CITY 04. You need to work on behalf
of humans, and your task is to make predictive decisions based on
questions and existing data. You are about to enter the work
page.`;

function typeWriter(element, text, speed = 28, onComplete) {
  element.textContent = "";
  element.style.opacity = "1";
  element.classList.add("typing");

  let index = 0;

  function typeNext() {
    if (index < text.length) {
      element.textContent += text.charAt(index);
      index++;
      setTimeout(typeNext, speed);
    } else {
      element.classList.remove("typing");
      if (typeof onComplete === "function") {
        onComplete();
      }
    }
  }

  typeNext();
}

startBtn.addEventListener("click", () => {
  glitchSfx.pause();
  glitchSfx.currentTime = 0;

  fadeOutAudio(startBgm, 800);

  introBgm.pause();
  introBgm.currentTime = 0;
  introBgm.volume = 1;
  introBgm.loop = true;

  document.querySelectorAll(".glitch-slice").forEach((el) => {
    el.style.animation = "none";
  });

  screenIntro.classList.add("hidden");
  screenIntroduction.classList.remove("hidden");

  introBgm.play().catch(() => {
    console.log("Introduction BGM autoplay was blocked.");
  });

  void introFrame.offsetWidth;
  introFrame.classList.add("rise-in");

  introBodyText.textContent = "";
  introBodyText.style.opacity = "0";

  workBtn.classList.add("hidden");
  workBtn.classList.remove("rise-in");

  setTimeout(() => {
    typeWriter(introBodyText, introTextContent, 22, () => {
      workBtn.classList.remove("hidden");
      void workBtn.offsetWidth;
      workBtn.classList.add("rise-in");
    });
  }, 900);
});

workBtn.addEventListener("click", () => {
  introBgm.pause();
  introBgm.currentTime = 0;
  
  window.location.href = "loading.html";
});

window.addEventListener("load", () => {
  startBgm.volume = 0.6;
  startBgm.loop = true;
  startBgm.play().catch(() => {
    console.log("Autoplay was blocked by the browser.");
  });

  glitchSfx.volume = 0.3;
  glitchSfx.loop = true;

  setTimeout(() => {
    glitchSfx.play().catch(() => {
      console.log("Glitch SFX autoplay was blocked.");
    });
  }, 2000);
});

function fadeOutAudio(audio, duration = 800) {
  const startVolume = audio.volume;
  const steps = 20;
  const stepTime = duration / steps;
  let currentStep = 0;

  const fade = setInterval(() => {
    currentStep++;
    const progress = currentStep / steps;

    audio.volume = startVolume * (1 - progress);

    if (currentStep >= steps) {
      clearInterval(fade);
      audio.pause();
      audio.currentTime = 0;
      audio.volume = startVolume; // 恢复音量，方便下次播放
    }
  }, stepTime);
}