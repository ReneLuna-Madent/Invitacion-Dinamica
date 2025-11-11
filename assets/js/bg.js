// Fondo liviano: estrellas + meteoros arcoíris (sin nubes)
(function () {
  const canvas = document.getElementById("bgCanvas");
  if (!canvas) return;
  const ctx = canvas.getContext("2d");

  // ===== Controles rápidos =====
  let QUALITY = 1; // 1 = normal, 0.75 = más ligero si baja el FPS
  const DPR = Math.max(1, Math.min(2, window.devicePixelRatio || 1));
  const STAR_BASE = 110;                 // se escala con pantalla
  const METEOR_MOBILE = 4, METEOR_DESKTOP = 7;

  let stars = [];
  let meteors = [];
  let reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;

  // ===== Canvas
  function size() {
    const w = Math.floor(innerWidth), h = Math.floor(innerHeight);
    canvas.style.width = w + "px"; canvas.style.height = h + "px";
    canvas.width = Math.floor(w * DPR); canvas.height = Math.floor(h * DPR);
    ctx.setTransform(DPR, 0, 0, DPR, 0, 0);
  }
  size();
  let rez;
  addEventListener("resize", () => { clearTimeout(rez); rez = setTimeout(() => { size(); initStars(); }, 120); });

  // ===== Stars
  function initStars() {
    stars = [];
    const density = Math.min(1.5, Math.max(0.8, (innerWidth * innerHeight) / (1280 * 720)));
    const count = Math.floor(STAR_BASE * density * QUALITY);
    const pal = ["#fff1b8", "#ffe6fa", "#d9faff", "#ffc9e6", "#f5ffe1"];
    for (let i = 0; i < count; i++) {
      stars.push({
        x: Math.random() * innerWidth,
        y: Math.random() * innerHeight,
        r: Math.random() * 2 + 0.5,
        tw: Math.random() * Math.PI * 2,
        color: pal[(Math.random() * pal.length) | 0]
      });
    }
  }
  initStars();

  // ===== Meteors
  function addMeteor() {
    const sx = Math.random() * innerWidth * 0.35 - innerWidth * 0.15;
    const sy = Math.random() * innerHeight * 0.35 - 120;
    const v = 4 + Math.random() * 3.5;
    const ang = Math.PI / 4 + (Math.random() * 0.3 - 0.15);
    meteors.push({
      x: sx, y: sy,
      vx: Math.cos(ang) * v, vy: Math.sin(ang) * v,
      len: 120 + Math.random() * 100,
      life: 0, max: 1 + Math.random() * 1.5,
      hue: Math.random() * 360
    });
  }
  function initMeteors() {
    meteors = [];
    const n = innerWidth < 480 ? METEOR_MOBILE : METEOR_DESKTOP;
    for (let i = 0; i < n; i++) addMeteor();
  }
  initMeteors();

  // ===== Fondo y estrellas
  function drawBG() {
    const g = ctx.createLinearGradient(0, 0, 0, innerHeight);
    g.addColorStop(0, "#ffe8ff");
    g.addColorStop(1, "#cde7ff");
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, innerWidth, innerHeight);
  }
  function drawStars() {
    const t = performance.now() / 800;
    for (const s of stars) {
      const a = 0.55 + 0.4 * Math.sin(t + s.tw);
      ctx.beginPath(); ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2);
      ctx.globalAlpha = a; ctx.fillStyle = s.color; ctx.fill();
    }
    ctx.globalAlpha = 1;
  }

  // ===== Meteors render
  function drawMeteors() {
    for (let i = meteors.length - 1; i >= 0; i--) {
      const m = meteors[i];
      m.x += m.vx; m.y += m.vy; m.life += 0.012;

      const mag = Math.hypot(m.vx, m.vy);
      const tail = m.len;
      const tx = m.x - (m.vx / mag) * tail;
      const ty = m.y - (m.vy / mag) * tail;

      const hs = (performance.now() / 45) % 360;
      const gr = ctx.createLinearGradient(tx, ty, m.x, m.y);
      gr.addColorStop(0, `hsla(${(m.hue + hs) % 360}, 90%, 80%, 0)`);
      gr.addColorStop(0.35, `hsla(${(m.hue + 40 + hs) % 360}, 90%, 75%, .35)`);
      gr.addColorStop(0.7, `hsla(${(m.hue + 90 + hs) % 360}, 90%, 70%, .75)`);
      gr.addColorStop(1, `hsla(${(m.hue + 140 + hs) % 360}, 95%, 92%, 1)`);

      ctx.strokeStyle = gr;
      ctx.lineWidth = 4;
      ctx.lineCap = "round";
      ctx.beginPath(); ctx.moveTo(tx, ty); ctx.lineTo(m.x, m.y); ctx.stroke();

      if (m.x > innerWidth + 220 || m.y > innerHeight + 220 || m.life > m.max) {
        meteors.splice(i, 1); addMeteor();
      }
    }
  }

  // ===== Auto-escala por rendimiento (simple)
  let last = performance.now(), frameCount = 0, lastFpsCheck = last;
  function loop(now) {
    const dt = Math.min(0.05, (now - last) / 1000); // dt no usado, pero útil si expandes
    last = now;

    drawBG();
    drawStars();
    if (!reduce) drawMeteors();

    // cada 2s revisa FPS y baja calidad si hace falta
    frameCount++;
    if (now - lastFpsCheck > 2000) {
      const fps = (frameCount * 1000) / (now - lastFpsCheck);
      frameCount = 0; lastFpsCheck = now;
      if (fps < 45 && QUALITY > 0.75) {        // baja densidad de estrellas
        QUALITY = 0.75; initStars();
      }
    }

    requestAnimationFrame(loop);
  }

  console.info("[BG] Simple mode activo (sin nubes). reduce-motion:", reduce);
  requestAnimationFrame(loop);
})();
