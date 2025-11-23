import request from "supertest";
import { User } from "../../models/user.model.js";
import { app } from "../../server.js";
import testSequelize from "../../config/testDb.js";

// Re-create tables and add data
beforeEach(async () => {
  await testSequelize.sync({ force: true });

  await User.create({
    id: "d854dd15-b02a-4cf2-872a-da0e9a8f0d50",
    username: "carp",
    email: "carp@g.com",
    password: "$2b$10$0MmFaH.0wKBLIa8VY3tuc.zmPMcnnhJXLbT22b9sAs0BoLTzRLUO2",
  });
});

afterAll(async () => {
  await testSequelize.close();
});

describe("GET /api/user/:id", () => {
  test("HTTP code is 200 when user exists", async () => {
    const response = await request(app).get(
      "/api/user/d854dd15-b02a-4cf2-872a-da0e9a8f0d50"
    );
    console.log(response.body.user);
    expect(response.status).toBe(200);
    expect(response.body.user).toEqual({
      userId: "d854dd15-b02a-4cf2-872a-da0e9a8f0d50",
      username: "carp",
      email: "carp@g.com",
    });
  });
});
