// UI: Gate del sobre, confeti, countdown y música de fondo (botón en el hero)
(function () {
  // ---------- Referencias ----------
  const gate = document.getElementById("gate");
  const invite = document.getElementById("invite");
  const openBtn = document.getElementById("openGateBtn");
  const envelope = document.getElementById("gateEnvelope");
  const confettiWrap = gate ? gate.querySelector(".confetti") : null;

  const countdownEl = document.getElementById("countdown");
  // Ajusta la fecha/hora local del evento
  const EVENT_DATE = new Date("2025-11-28T15:00:00");

  // Audio (botón dentro del hero)
  const bgMusic = document.getElementById("bgMusic");
  const audioToggle = document.getElementById("audioToggleHero");
  let fadeTimer = null;

  // ---------- Confeti ----------
  function launchConfetti(container) {
    if (!container) return;
    const colors = ["#ffd1fb", "#ffe9a9", "#c7f0ff", "#ffd6e8", "#e9ffd1"];
    const N = 90;
    const W = container.clientWidth || 360;

    for (let i = 0; i < N; i++) {
      const piece = document.createElement("i");
      piece.style.position = "absolute";
      piece.style.left = Math.random() * W + "px";
      piece.style.top = "-20px";
      piece.style.width = "8px";
      piece.style.height = "14px";
      piece.style.borderRadius = "2px";
      piece.style.background = colors[i % colors.length];
      piece.style.opacity = "0.95";
      piece.style.animation = `fall ${1.2 + Math.random() * 1.6}s linear forwards`;
      piece.style.animationDelay = (Math.random() * 0.4) + "s";
      piece.style.transform = `translateY(0) rotate(${Math.random() * 180}deg)`;
      container.appendChild(piece);
      piece.addEventListener("animationend", () => piece.remove());
    }
  }

  // ---------- Gate: abrir sobre y revelar invitación ----------
  function revealInvite() {
    if (!gate || !invite) return;
    gate.classList.add("is-hidden");
    invite.classList.remove("is-hidden");
  }

  async function openGate() {
    if (!envelope) return;
    // animación del sobre y confeti
    envelope.classList.add("open");
    launchConfetti(confettiWrap);

    // música: si es primera vez, sugerimos ON
    if (localStorage.getItem("invite_music_on") === null) {
      localStorage.setItem("invite_music_on", "1");
    }

    // tras la animación del flap/letter, mostrar invitación
    setTimeout(() => {
      revealInvite();
      // intenta reproducir música si está activada
      const shouldPlay = localStorage.getItem("invite_music_on") === "1";
      if (shouldPlay) playMusic();
      setToggleUI();
    }, 900);
  }

  // Eventos del gate
  openBtn && openBtn.addEventListener("click", openGate);
  envelope && envelope.addEventListener("click", openGate);
  envelope && envelope.addEventListener("keydown", (e) => {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      openGate();
    }
  });

  // ---------- Countdown ----------
  function updateCountdown() {
    if (!countdownEl) return;
    const now = new Date();
    const diff = EVENT_DATE - now;

    if (diff <= 0) {
      countdownEl.textContent = "¡Hoy! 🎉";
      return;
    }
    const d = Math.floor(diff / (1000 * 60 * 60 * 24));
    const h = Math.floor((diff / (1000 * 60 * 60)) % 24);
    const m = Math.floor((diff / (1000 * 60)) % 60);
    countdownEl.textContent = `${d}d ${h}h ${m}m`;
    setTimeout(updateCountdown, 1000);
  }
  updateCountdown();

  // ---------- Audio: control y persistencia ----------
  // Estado guardado: "1" encendido, "0" apagado, null = primera vez
  const savedMusic = localStorage.getItem("invite_music_on");
  let musicOn = savedMusic === "1";

  function setToggleUI() {
    if (!audioToggle) return;
    musicOn = localStorage.getItem("invite_music_on") === "1";
    audioToggle.setAttribute("aria-pressed", musicOn ? "true" : "false");
    audioToggle.title = musicOn ? "Pausar música" : "Reproducir música";
  }
  setToggleUI();

  function fadeTo(targetVol = 1, ms = 600) {
    if (!bgMusic) return;
    clearInterval(fadeTimer);
    const steps = 24;
    const stepTime = Math.max(16, Math.floor(ms / steps));
    const start = bgMusic.volume ?? 0;
    const delta = targetVol - start;
    let i = 0;
    fadeTimer = setInterval(() => {
      i++;
      const v = start + delta * (i / steps);
      bgMusic.volume = Math.max(0, Math.min(1, v));
      if (i >= steps) clearInterval(fadeTimer);
    }, stepTime);
  }

  async function playMusic() {
    if (!bgMusic) return;
    try {
      bgMusic.volume = 0;
      if (bgMusic.paused) await bgMusic.play();
      fadeTo(0.6, 500);
      localStorage.setItem("invite_music_on", "1");
      setToggleUI();
    } catch (e) {
      // si el navegador lo bloquea, el usuario puede tocar el botón del hero
    }
  }

  function pauseMusic() {
    if (!bgMusic) return;
    fadeTo(0, 250);
    setTimeout(() => bgMusic.pause(), 280);
    localStorage.setItem("invite_music_on", "0");
    setToggleUI();
  }

  // Control del botón dentro del hero
  if (audioToggle) {
    audioToggle.addEventListener("click", () => {
      if (!bgMusic) return;
      if (bgMusic.paused) playMusic();
      else pauseMusic();
    });
  }

  // ---------- Accesibilidad de cortesía ----------
  window.addEventListener("keydown", (e) => {
    if (e.key === "Escape") {
      // no hay modal en esta versión; hook listo por si se agrega
    }
  });
})();
