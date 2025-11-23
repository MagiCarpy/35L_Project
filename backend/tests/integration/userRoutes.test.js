import request from "supertest";
import { User } from "../../models/user.model.js";
import { app } from "../../server.js";
import testSequelize from "../../config/testDb.js";

// Re-create tables and add data
beforeEach(async () => {
  await testSequelize.sync({ force: true });

  await User.create({
    id: "d854dd15-b02a-4cf2-872a-da0e9a8f0d51",
    username: "test",
    email: "test@g.com",
    password: "password",
  });
});

afterAll(async () => {
  await testSequelize.close();
});

describe("POST /api/user/register", () => {
  test("HTTP 200 when valid signup.", async () => {
    const user = {
      username: "newTest",
      email: "newTest@g.com",
      password: "password",
    };
    const res = await request(app)
      .post("/api/user/register")
      .send(user)
      .set("Accept", "application/json");

    expect(res.status).toBe(200);
    expect(res.body.user).toMatchObject({
      username: "newTest",
      email: "newTest@g.com",
    });
  });
});

describe("POST /api/user/login", () => {
  test("HTTP 200 and session set for valid login.", async () => {
    const res = await request(app).post("/api/user/login").send({
      email: "test@g.com",
      password: "password",
    });

    expect(res.status).toBe(200);
    expect(res.headers["set-cookie"]).toBeDefined();
  });
});

describe("GET /api/user/profile (session_auth)", () => {
  test("HTTP 200 and user data.", async () => {
    // login user to set session
    const loginRes = await request(app).post("/api/user/login").send({
      email: "test@g.com",
      password: "password",
    });

    // try profile route with login cookies
    const cookie = loginRes.headers["set-cookie"];

    const res = await request(app)
      .get("/api/user/profile")
      .set("Cookie", cookie) // ← this is the key!
      .set("Accept", "application/json");

    expect(res.status).toBe(200);
    expect(res.body.user).toMatchObject({
      userId: "d854dd15-b02a-4cf2-872a-da0e9a8f0d51",
      username: "test",
      email: "test@g.com",
    });
  });
});

describe("GET /api/user/:id", () => {
  test("HTTP 200 when user exists.", async () => {
    const res = await request(app).get(
      "/api/user/d854dd15-b02a-4cf2-872a-da0e9a8f0d51"
    );

    expect(res.status).toBe(200);
    expect(res.body.user).toMatchObject({
      userId: "d854dd15-b02a-4cf2-872a-da0e9a8f0d51",
      username: "test",
      email: "test@g.com",
    });
  });
});
