import { Express } from "express";
import { Server } from "http";
import request from "supertest";
import { describe, it, expect, beforeEach, afterEach } from "vitest";

describe("Admin Routes", () => {
  let app: Express;
  let server: Server;

  beforeEach(async () => {
    const express = require("express");
    const session = require("express-session");
    app = express();
    app.use(express.json());
    app.use(session({
      secret: 'test-secret',
      resave: false,
      saveUninitialized: true,
    }));
    const { registerRoutes } = await import("./routes");
    server = await registerRoutes(app);
  });

  afterEach(() => {
    server.close();
  });

  it("should return 401 for incorrect password", async () => {
    const response = await request(app)
      .post("/api/admin/login")
      .send({ password: "wrongpassword" });
    expect(response.status).toBe(401);
  });

  it("should return 200 for correct password", async () => {
    process.env.ADMIN_PASSWORD = "admin123";
    const response = await request(app)
      .post("/api/admin/login")
      .send({ password: "admin123" });
    expect(response.status).toBe(200);
  });
});
