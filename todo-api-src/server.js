const express = require("express");

const app = express();
app.use(express.json());

let todos = [
  { id: 1, title: "Préparer le projet GitOps", completed: true },
  { id: 2, title: "Déployer avec Argo CD", completed: true },
  { id: 3, title: "Tester le canary rollout", completed: false }
];

app.get("/health", (req, res) => {
  res.status(200).json({ status: "ok" });
});

app.get("/todos", (req, res) => {
  res.json(todos);
});

app.post("/todos", (req, res) => {
  const { title } = req.body;

  if (!title) {
    return res.status(400).json({ error: "title is required" });
  }

  const todo = {
    id: todos.length ? Math.max(...todos.map(t => t.id)) + 1 : 1,
    title,
    completed: false
  };

  todos.push(todo);
  res.status(201).json(todo);
});

app.delete("/todos/:id", (req, res) => {
  const id = Number(req.params.id);
  const initialLength = todos.length;

  todos = todos.filter(todo => todo.id !== id);

  if (todos.length === initialLength) {
    return res.status(404).json({ error: "todo not found" });
  }

  res.status(204).send();
});

if (require.main === module) {
  const port = process.env.PORT || 3000;
  app.listen(port, () => {
    console.log(`Todo API listening on port ${port}`);
  });
}

module.exports = app;
