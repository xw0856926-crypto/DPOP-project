const walkers = document.getElementById("walkers");
const path = document.getElementById("walkPath");

const pathLength = path.getTotalLength();

/*
  这几个值已经帮你预设过了
  先直接运行
*/
const walkersWidth = 820;

// 锚点：整张人物图里“中间偏下”的位置
// 这不是精确脚底，但够你先跑出效果
const anchorX = walkersWidth * 0.5;
const anchorY = 305;

// 只走路径中间这一段，避免跑到边缘太难看
const startRatio = 0.16;
const endRatio = 0.82;

// 速度
let t = 0;
const speed = 0.0018;

// 让运动更像走，而不是飘
function animate() {
  t += speed;
  if (t > 1) t = 0;

  // 在限定区间来回循环
  const progressRatio = startRatio + (endRatio - startRatio) * t;
  const distance = pathLength * progressRatio;

  const point = path.getPointAtLength(distance);
  const pointAhead = path.getPointAtLength(
    Math.min(distance + 2, pathLength)
  );

  // 路径方向角
  const dx = pointAhead.x - point.x;
  const dy = pointAhead.y - point.y;
  const pathAngle = Math.atan2(dy, dx) * 180 / Math.PI;

  // “踩踏”感：不是平滑漂浮，而是有节奏地上下一点
  const step = Math.sin(t * Math.PI * 10);
  const bobY = Math.abs(step) * -7;     // 向上抬一点
  const swayX = Math.sin(t * Math.PI * 10) * 1.6;
  const tilt = Math.sin(t * Math.PI * 10) * 0.8;

  // 沿路径摆放，减去锚点
  const x = point.x - anchorX;
  const y = point.y - anchorY + bobY;

  walkers.style.transform = `
    translate(${x + swayX}px, ${y}px)
    rotate(${pathAngle * 0.06 + tilt}deg)
  `;

  requestAnimationFrame(animate);
}

animate();