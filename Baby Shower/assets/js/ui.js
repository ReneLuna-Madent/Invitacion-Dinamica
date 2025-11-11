// UI: Gate del sobre, confeti y countdown
(function(){
  // GATE
  const gate = document.getElementById("gate");
  const invite = document.getElementById("invite");
  const openBtn = document.getElementById("openGateBtn");
  const envelope = document.getElementById("gateEnvelope");
  const confettiWrap = gate?.querySelector(".confetti");

  function launchConfetti(container){
    const wrap = container;
    if (!wrap) return;
    const colors = ["#ffd1fb","#ffe9a9","#c7f0ff","#ffd6e8","#e9ffd1"];
    const N = 90;
    const W = wrap.clientWidth || 360;

    for (let i=0;i<N;i++){
      const piece = document.createElement("i");
      piece.style.left = Math.random()*W + "px";
      piece.style.top = "-20px";
      piece.style.background = colors[i % colors.length];
      piece.style.animationDuration = (1.2 + Math.random()*1.6) + "s";
      piece.style.animationDelay = (Math.random()*0.4) + "s";
      piece.style.transform = `translateY(0) rotate(${Math.random()*180}deg)`;
      wrap.appendChild(piece);
      piece.addEventListener("animationend", ()=> piece.remove());
    }
  }

  function openGate(){
    if (!gate || !invite || !envelope) return;
    // animar sobre
    envelope.classList.add("open");
    launchConfetti(confettiWrap);
    // tras la animación, revelar invitación
    setTimeout(()=>{
      gate.classList.add("is-hidden");
      invite.classList.remove("is-hidden");
    }, 900); // un poco más que flap/letter-pop
  }

  openBtn?.addEventListener("click", openGate);
  envelope?.addEventListener("click", openGate);
  envelope?.addEventListener("keydown", e=>{
    if (e.key === "Enter" || e.key === " ") { e.preventDefault(); openGate(); }
  });

  // COUNTDOWN
  const countdownEl = document.getElementById("countdown");
  const eventDate = new Date("2025-11-28T15:00:00"); // 3:00 pm local
  function updateCountdown(){
    if (!countdownEl) return;
    const now = new Date();
    const diff = eventDate - now;
    if (diff <= 0){
      countdownEl.textContent = "¡Hoy! 🎉";
      return;
    }
    const d = Math.floor(diff / (1000*60*60*24));
    const h = Math.floor((diff / (1000*60*60)) % 24);
    const m = Math.floor((diff / (1000*60)) % 60);
    countdownEl.textContent = `${d}d ${h}h ${m}m`;
    setTimeout(updateCountdown, 1000);
  }
  updateCountdown();
})();
