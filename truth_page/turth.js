let selected = null;

// 点击选择文字
document.addEventListener("click", (e) => {
  if (e.target.tagName === "text") {
    selected = e.target;
    console.log("selected:", selected.id);
  }
});

// 方向键移动
window.addEventListener("keydown", (e) => {
  if (!selected) return;

  let step = 1;

  if (e.shiftKey) step = 10;
  if (e.altKey) step = 0.2;

  let x = parseFloat(selected.getAttribute("x"));
  let y = parseFloat(selected.getAttribute("y"));

  if (e.key === "ArrowUp") y -= step;
  if (e.key === "ArrowDown") y += step;
  if (e.key === "ArrowLeft") x -= step;
  if (e.key === "ArrowRight") x += step;

  selected.setAttribute("x", x);
  selected.setAttribute("y", y);
});

// turth.js
document.addEventListener("DOMContentLoaded", () => {
  // ====== 1) 按钮跳转 ======
  const nextBtn = document.getElementById("nextBtn");
  if (nextBtn) {
    nextBtn.addEventListener("click", () => {
      window.location.href = "../Scene2/scene2.html"; // 改成你的目标页
    });
  }

  // ====== 2) 曲线绘制动画 + 光点沿路径 ======
  function animatePathDraw(pathEl, durationMs, delayMs = 0) {
    const length = pathEl.getTotalLength();
    pathEl.style.strokeDasharray = length;
    pathEl.style.strokeDashoffset = length;
    pathEl.getBoundingClientRect();
    pathEl.style.transition = `stroke-dashoffset ${durationMs}ms linear ${delayMs}ms`;
    pathEl.style.strokeDashoffset = "0";
  }

  function animateDotAlongPath(pathEl, dotEl, durationMs, delayMs = 0) {
    const length = pathEl.getTotalLength();
    const start = performance.now() + delayMs;

    function frame(now) {
      const t = (now - start) / durationMs;
      if (t < 0) return requestAnimationFrame(frame);

      const clamped = Math.min(Math.max(t, 0), 1);
      const p = pathEl.getPointAtLength(length * clamped);

      dotEl.setAttribute("cx", p.x);
      dotEl.setAttribute("cy", p.y);

      if (clamped >= 1) {
        dotEl.style.transition = "opacity 400ms ease";
        dotEl.style.opacity = "0";
        return;
      }
      requestAnimationFrame(frame);
    }

    dotEl.style.opacity = "1";
    requestAnimationFrame(frame);
  }

  // 初始化（按你的 id）
  const lineTop = document.getElementById("lineTop");
  const dotTop = document.getElementById("dotTop");
  const lineBottom = document.getElementById("lineBottom");
  const dotBottom = document.getElementById("dotBottom");

  const duration = 2200;
  const delayTop = 200;
  const delayBottom = 200;

  if (lineTop && dotTop) {
    animatePathDraw(lineTop, duration, delayTop);
    animateDotAlongPath(lineTop, dotTop, duration, delayTop);
  }
  if (lineBottom && dotBottom) {
    animatePathDraw(lineBottom, duration, delayBottom);
    animateDotAlongPath(lineBottom, dotBottom, duration, delayBottom);
  }

  // ====== 3) 点击选中文字 + 方向键微调（如果你在用） ======
  let selected = null;
  const HUD = document.getElementById("hud");
  const svg = document.querySelector("svg.overlay");
  if (svg) svg.style.pointerEvents = "auto";
  document.querySelectorAll("svg text").forEach(t => (t.style.pointerEvents = "auto"));

  function getXY(el) {
    const x = parseFloat(el.getAttribute("x") || "0");
    const y = parseFloat(el.getAttribute("y") || "0");
    return { x, y };
  }
  function setXY(el, x, y) {
    el.setAttribute("x", x.toFixed(1));
    el.setAttribute("y", y.toFixed(1));
  }
  function highlight(el) {
    document.querySelectorAll("svg text").forEach(t => {
      t.style.stroke = "none";
      t.style.paintOrder = "";
      t.style.strokeWidth = "";
      t.style.opacity = "0.9";
      t.style.cursor = "pointer";
    });
    if (!el) return;
    el.style.opacity = "1";
    el.style.paintOrder = "stroke";
    el.style.stroke = "rgba(170,255,255,.95)";
    el.style.strokeWidth = "2px";
  }
  function updateHud() {
    if (!HUD || !selected) return;
    const { x, y } = getXY(selected);
    HUD.textContent = `Selected: #${selected.id || "(no id)"}  x=${x.toFixed(1)}  y=${y.toFixed(1)}
Click a text • Arrows move • Shift=fast • Alt=slow`;
  }

  document.addEventListener("click", (e) => {
    if (e.target?.tagName?.toLowerCase() === "text") {
      selected = e.target;
      highlight(selected);
      updateHud();
      window.focus();
    }
  });

  window.addEventListener("keydown", (e) => {
    if (!selected) return;
    if (!["ArrowUp","ArrowDown","ArrowLeft","ArrowRight"].includes(e.key)) return;

    e.preventDefault();

    let step = 1;
    if (e.shiftKey) step = 10;
    if (e.altKey) step = 0.2;

    const { x, y } = getXY(selected);
    let nx = x, ny = y;
    if (e.key === "ArrowUp") ny = y - step;
    if (e.key === "ArrowDown") ny = y + step;
    if (e.key === "ArrowLeft") nx = x - step;
    if (e.key === "ArrowRight") nx = x + step;

    setXY(selected, nx, ny);
    updateHud();
  });
});