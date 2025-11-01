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

  it("should allow access to protected routes after login", async () => {
    process.env.ADMIN_PASSWORD = "admin123";
    const agent = request.agent(app);
    await agent
      .post("/api/admin/login")
      .send({ password: "admin123" });
    const response = await agent.get("/api/admin/bookings");
    expect(response.status).toBe(200);
  });

  it("should not allow access to protected routes without login", async () => {
    const response = await request(app).get("/api/admin/bookings");
    expect(response.status).toBe(401);
  });

  it("should return 401 if ADMIN_PASSWORD is not set", async () => {
    const originalPassword = process.env.ADMIN_PASSWORD;
    delete process.env.ADMIN_PASSWORD;
    const response = await request(app)
      .post("/api/admin/login")
      .send({ password: "admin123" });
    expect(response.status).toBe(401);
    process.env.ADMIN_PASSWORD = originalPassword;
  });

  it("should return 401 if ADMIN_PASSWORD is not set and password is empty", async () => {
    const originalPassword = process.env.ADMIN_PASSWORD;
    delete process.env.ADMIN_PASSWORD;
    const response = await request(app)
      .post("/api/admin/login")
      .send({ password: "" });
    expect(response.status).toBe(401);
    process.env.ADMIN_PASSWORD = originalPassword;
  });

  it("should return 401 if ADMIN_PASSWORD is not set", async () => {
    const originalPassword = process.env.ADMIN_PASSWORD;
    delete process.env.ADMIN_PASSWORD;
    const response = await request(app)
      .post("/api/admin/login")
      .send({ password: "somepassword" });
    expect(response.status).toBe(401);
    process.env.ADMIN_PASSWORD = originalPassword;
  });
});
