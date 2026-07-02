const request = require("supertest");
const app = require("../server");

describe("Todo API", () => {
  test("GET /health returns ok", async () => {
    const res = await request(app).get("/health");
    expect(res.statusCode).toBe(200);
    expect(res.body.status).toBe("ok");
  });

  test("GET /todos returns todos", async () => {
    const res = await request(app).get("/todos");
    expect(res.statusCode).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
  });

  test("POST /todos creates a todo", async () => {
    const res = await request(app)
      .post("/todos")
      .send({ title: "Nouvelle tâche" });

    expect(res.statusCode).toBe(201);
    expect(res.body.title).toBe("Nouvelle tâche");
    expect(res.body.completed).toBe(false);
  });

  test("DELETE /todos/:id deletes a todo", async () => {
    const create = await request(app)
      .post("/todos")
      .send({ title: "Tâche à supprimer" });

    const res = await request(app).delete(`/todos/${create.body.id}`);
    expect(res.statusCode).toBe(204);
  });
});
