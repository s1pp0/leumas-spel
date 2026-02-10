// ----------------- Stjärnhimmel -----------------
const starCanvas = document.getElementById("stars");
const sctx = starCanvas.getContext("2d");

function resizeStars() {
  starCanvas.width = window.innerWidth;
  starCanvas.height = window.innerHeight;
}
resizeStars();
window.addEventListener("resize", resizeStars);

const stars = Array.from({ length: 200 }, () => ({
  x: Math.random() * starCanvas.width,
  y: Math.random() * starCanvas.height,
  r: Math.random() * 1.5
}));

function drawStars() {
  sctx.clearRect(0, 0, starCanvas.width, starCanvas.height);
  sctx.fillStyle = "white";
  stars.forEach(s => {
    sctx.beginPath();
    sctx.arc(s.x, s.y, s.r, 0, Math.PI * 2);
    sctx.fill();
  });
  requestAnimationFrame(drawStars);
}
drawStars();

// ----------------- Snake-spel -----------------
const canvas = document.getElementById("game");
const ctx = canvas.getContext("2d");

const grid = 20;
let snake = [{ x: 200, y: 200 }];
let dir = { x: grid, y: 0 };
let heart = spawnHeart();
let score = 0;
let running = true;
let started = false;

// Ljudfiler
const snakeSound = document.getElementById("snakeSound"); // spel + quiz
const finalSound = document.getElementById("finalSound"); // final-fråga
const yesSound = document.getElementById("yesSound");     // Ja-knapp

document.addEventListener("keydown", e => {
  if (e.code === "Space" && !started) {
    started = true;
    snakeSound.loop = true; // loopar under spel + quiz
    snakeSound.play();
    return;
  }
  if (!started) return;

  if (e.key === "ArrowUp" && dir.y === 0) dir = { x: 0, y: -grid };
  if (e.key === "ArrowDown" && dir.y === 0) dir = { x: 0, y: grid };
  if (e.key === "ArrowLeft" && dir.x === 0) dir = { x: -grid, y: 0 };
  if (e.key === "ArrowRight" && dir.x === 0) dir = { x: grid, y: 0 };
});

function spawnHeart() {
  return {
    x: Math.floor(Math.random() * 20) * grid,
    y: Math.floor(Math.random() * 20) * grid
  };
}

function drawPixelHeart(x, y) {
  ctx.fillStyle = "#ff4d6d";
  const p = 4;
  const shape = [
    [1,0,1,0,1],
    [1,1,1,1,1],
    [1,1,1,1,1],
    [0,1,1,1,0],
    [0,0,1,0,0]
  ];
  shape.forEach((row, i) => {
    row.forEach((cell, j) => {
      if (cell) ctx.fillRect(x + j * p, y + i * p, p, p);
    });
  });
}

function updateGame() {
  if (!started || !running) return;

  const head = {
    x: snake[0].x + dir.x,
    y: snake[0].y + dir.y
  };

  if (
    head.x < 0 || head.y < 0 ||
    head.x >= canvas.width || head.y >= canvas.height
  ) {
    running = false;
  }

  snake.unshift(head);

  if (head.x === heart.x && head.y === heart.y) {
    score++;
    document.getElementById("info").textContent = `Poäng: ${score} / 10`;
    heart = spawnHeart();

    if (score >= 10) {
      running = false;

      // Visa Quiz-start-meddelande
      setTimeout(() => {
        document.getElementById("start").classList.add("hidden");
        document.getElementById("quizIntro").classList.remove("hidden");
      }, 500);
    }
  } else {
    snake.pop();
  }

  drawGame();
}

function drawGame() {
  ctx.clearRect(0,0,canvas.width,canvas.height);

  ctx.fillStyle = "#4cc9f0";
  snake.forEach(s => ctx.fillRect(s.x, s.y, grid, grid));

  drawPixelHeart(heart.x + 2, heart.y + 2);

  if (!started) {
    ctx.fillStyle = "white";
    ctx.fillText("Tryck mellanslag", 130, 200);
  }
}

setInterval(updateGame, 120);

// ----------------- Quiz -----------------
const quizData = [
  { q: "Vem blev kär först?", a: ["Sammi", "Märti", "Min big bombaclat"], correct: 0 },
  { q: "Vem av mina vänner träffade du först?", a: ["Ville", "Gabbe", "Daniela"], correct: 1 },
  { q: "Vem blev rizzad mest?", a: ["Sammi", "båda", "Märta"], correct: 2 },
  { q: "Hur många gånger har vi haft sex?", a: ["40", "150.333333 ...", "69"], correct: 1 },
  { q: "Hur skrivs antalet gånger vi haft sex i bråk? 150.333333 ...", a: ["451 / 3", "3594 / 32", "696969 / 67"], correct: 0 },
  { q: "Vad är Märtas favoritmat?", a: ["Lasagne", "Asian", "Italian dick"], correct: 2 },
  { q: "Hur lång är Sammi?", a: ["1.69", "1.80", "1.77 vilket ungefär är 1.80 vilket betyder rätt lång faktiskt"], correct: 2 },
  { q: "Hur LÅNG är Sammi?", a: ["0.10", "0.17 ≈ 0.20", "0.45"], correct: 1 },
  { q: "Vad är det mest pinsamma Sammi har gjort?", a: ["Inget", "fått en 4a på Chalmers", "Inget"], correct: 1 },
  { q: "Hur många ex har märta?", a: ["Tappat räkningen", "4", "25"], correct: 0 },

  { q: "Vad svarade märta på 'Går de bra för dig?' ", a: ["Yes burger", "Hatar denna föreläsning", "Nej asså jag vill ba ha dig nu"], correct: 1 },
  
  { q: "Vad svarade märta på 'Vill du föja med ut och äta med min familj?", a: ["Ja herreguddd va kuul", "Omg slay!", "Vill hem o spränga toan nu men har ej min nyckel och det är ganska aids"], correct: 2 },
  
  
  { q: "Varför är Märta underbar?", a: ["För att hon är otrolig vacker med fint hjärta", "För att hon 'make up för hennes längd'", "För att hon är ett programeringmonster!"], correct: 2 }

];

let qi = 0;

// ----------------- Quiz intro -----------------
function startQuiz() {
  document.getElementById("quizIntro").classList.add("hidden");
  document.getElementById("quiz").classList.remove("hidden");
  qi = 0;
  loadQuestion();
}

function loadQuestion() {
  const q = quizData[qi];
  document.getElementById("question").textContent = q.q;
  const answers = document.getElementById("answers");
  answers.innerHTML = "";

  q.a.forEach((text, i) => {
    const b = document.createElement("button");
    b.textContent = text;
    b.onclick = () => checkAnswer(i);
    answers.appendChild(b);
  });
}

function checkAnswer(selected) {
  const correct = quizData[qi].correct;
  if (selected === correct) {
    qi++;
    if (qi < quizData.length) loadQuestion();
    else {
      snakeSound.pause(); // stoppa snake-ljud när final visas
      snakeSound.currentTime = 0;
      finalSound.play(); // starta spännande final-ljud
      document.getElementById("quiz").classList.add("hidden");
      showFinal();
    }
  } else {
    alert("Fel svar! Quizet startar om från början.");
    qi = 0;
    loadQuestion();
  }
}

// ----------------- Final -----------------
let noClickCount = 0;
const finalText = document.getElementById("finalText");
const noBtn = document.getElementById("noBtn");
const yesBtn = document.getElementById("yesBtn");

function showFinal() {
  document.getElementById("final").classList.remove("hidden");
}

noBtn.addEventListener("click", () => {
  noClickCount++;
  finalText.textContent = "Detta svar stöds inte av systemet.";
  finalText.style.fontSize = `${16 + noClickCount * 4}px`;
});

yesBtn.addEventListener("click", () => {
  finalSound.pause();
  finalSound.currentTime = 0;
  yesSound.play();

  // Dölj frågan och knapparna
  document.getElementById("final-content").classList.add("hidden");
  
  // Visa bilden och texten
  document.getElementById("success-message").classList.remove("hidden");

  // Starta konfetti
  launchConfetti();
});

function launchConfetti() {
  const container = document.getElementById("confetti");

  for (let i = 0; i < 150; i++) {
    const piece = document.createElement("div");
    piece.className = "confetti-piece";
    piece.style.left = Math.random() * 100 + "vw";
    piece.style.animationDelay = Math.random() * 0.5 + "s";
    piece.style.setProperty("--hue", Math.random() * 360);
    container.appendChild(piece);

    setTimeout(() => piece.remove(), 3000);
  }
}
