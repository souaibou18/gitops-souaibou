const request = require("supertest");
const app = require("../server");

describe("Jump Dash API", () => {
  test("GET /health returns ok", async () => {
    const res = await request(app).get("/health");
    expect(res.statusCode).toBe(200);
    expect(res.body.status).toBe("ok");
    expect(res.body.app).toBe("jump-dash");
  });

  test("GET /scores returns scores", async () => {
    const res = await request(app).get("/scores");
    expect(res.statusCode).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
  });

  test("POST /scores creates a score", async () => {
    const res = await request(app)
      .post("/scores")
      .send({ player: "Tester", score: 42 });

    expect(res.statusCode).toBe(201);
    expect(res.body.player).toBe("Tester");
    expect(res.body.score).toBe(42);
  });

  test("GET / returns the game page", async () => {
    const res = await request(app).get("/");
    expect(res.statusCode).toBe(200);
    expect(res.text).toContain("Jump Dash");
  });
});
