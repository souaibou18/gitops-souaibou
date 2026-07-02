const express = require("express");

const app = express();
app.use(express.json());

let scores = [
  { id: 1, player: "Souaibou", score: 120 },
  { id: 2, player: "DevOpsBot", score: 90 },
  { id: 3, player: "ArgoRunner", score: 60 }
];

app.get("/health", (req, res) => {
  res.status(200).json({ status: "ok", app: "jump-dash" });
});

app.get("/scores", (req, res) => {
  const sortedScores = [...scores].sort((a, b) => b.score - a.score);
  res.json(sortedScores);
});

app.post("/scores", (req, res) => {
  const { player, score } = req.body;

  if (!player || typeof score !== "number") {
    return res.status(400).json({ error: "player and numeric score are required" });
  }

  const newScore = {
    id: scores.length ? Math.max(...scores.map(s => s.id)) + 1 : 1,
    player,
    score
  };

  scores.push(newScore);
  res.status(201).json(newScore);
});

app.delete("/scores", (req, res) => {
  scores = [];
  res.status(204).send();
});

app.get("/", (req, res) => {
  res.send(`<!DOCTYPE html>
<html lang="fr">
<head>
  <meta charset="UTF-8" />
  <title>Jump Dash</title>
  <style>
    body {
      margin: 0;
      background: #111827;
      color: white;
      font-family: Arial, sans-serif;
      text-align: center;
    }
    h1 {
      margin-top: 20px;
    }
    #game {
      width: 800px;
      height: 300px;
      background: linear-gradient(#1f2937, #374151);
      margin: 30px auto;
      position: relative;
      overflow: hidden;
      border: 3px solid #60a5fa;
      border-radius: 12px;
    }
    #player {
      width: 40px;
      height: 40px;
      background: #22c55e;
      position: absolute;
      bottom: 0;
      left: 80px;
      border-radius: 6px;
    }
    #obstacle {
      width: 35px;
      height: 50px;
      background: #ef4444;
      position: absolute;
      bottom: 0;
      right: 0;
      border-radius: 4px;
      animation: moveObstacle 1.4s linear infinite;
    }
    @keyframes moveObstacle {
      from { right: -40px; }
      to { right: 820px; }
    }
    .jump {
      animation: jump 0.55s ease-out;
    }
    @keyframes jump {
      0% { bottom: 0; }
      45% { bottom: 130px; }
      100% { bottom: 0; }
    }
    #score {
      font-size: 24px;
      margin-top: 10px;
    }
    button {
      padding: 10px 18px;
      border: none;
      border-radius: 8px;
      background: #2563eb;
      color: white;
      cursor: pointer;
      font-weight: bold;
      margin: 8px;
    }
    button:hover {
      background: #1d4ed8;
    }
    input {
      padding: 10px;
      border-radius: 8px;
      border: none;
      margin: 8px;
    }
    pre {
      text-align: left;
      background: #020617;
      color: #a7f3d0;
      padding: 15px;
      border-radius: 8px;
      width: 600px;
      margin: 20px auto;
      overflow: auto;
    }
  </style>
</head>
<body>
  <h1>Jump Dash</h1>
  <p>Appuie sur <strong>Espace</strong> ou clique sur Jump pour éviter l'obstacle.</p>

  <div id="game">
    <div id="player"></div>
    <div id="obstacle"></div>
  </div>

  <div id="score">Score : 0</div>

  <input id="playerName" placeholder="Nom du joueur" value="Souaibou" />
  <button onclick="jump()">Jump</button>
  <button onclick="saveScore()">Sauvegarder score</button>
  <button onclick="loadScores()">Voir classement</button>

  <pre id="leaderboard">Classement...</pre>

  <script>
    const player = document.getElementById("player");
    const obstacle = document.getElementById("obstacle");
    const scoreDisplay = document.getElementById("score");
    const leaderboard = document.getElementById("leaderboard");

    let score = 0;
    let alive = true;

    function jump() {
      if (!player.classList.contains("jump")) {
        player.classList.add("jump");
        setTimeout(() => player.classList.remove("jump"), 550);
      }
    }

    document.addEventListener("keydown", (event) => {
      if (event.code === "Space") {
        jump();
      }
    });

    setInterval(() => {
      if (alive) {
        score++;
        scoreDisplay.innerText = "Score : " + score;
      }
    }, 200);

    setInterval(() => {
      const playerBottom = parseInt(window.getComputedStyle(player).getPropertyValue("bottom"));
      const obstacleRight = parseInt(window.getComputedStyle(obstacle).getPropertyValue("right"));

      const obstacleLeft = 800 - obstacleRight - 35;
      const playerLeft = 80;
      const playerRight = 120;

      if (obstacleLeft < playerRight && obstacleLeft + 35 > playerLeft && playerBottom < 50) {
        alive = false;
        alert("Game Over ! Score : " + score);
        score = 0;
        alive = true;
      }
    }, 20);

    async function saveScore() {
      const playerName = document.getElementById("playerName").value || "anonymous";

      const res = await fetch("/scores", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ player: playerName, score })
      });

      const data = await res.json();
      leaderboard.innerText = JSON.stringify(data, null, 2);
      loadScores();
    }

    async function loadScores() {
      const res = await fetch("/scores");
      const data = await res.json();
      leaderboard.innerText = JSON.stringify(data, null, 2);
    }

    loadScores();
  </script>
</body>
</html>`);
});

if (require.main === module) {
  const port = process.env.PORT || 3000;
  app.listen(port, () => {
    console.log(`Jump Dash API listening on port ${port}`);
  });
}

module.exports = app;
