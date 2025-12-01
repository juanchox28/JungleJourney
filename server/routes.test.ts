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
      .post("/api/naane/login")
      .send({ password: "wrongpassword" });
    expect(response.status).toBe(401);
  });

  it("should return 200 for correct password", async () => {
    process.env.ADMIN_PASSWORD = "admin123";
    const response = await request(app)
      .post("/api/naane/login")
      .send({ password: "admin123" });
    expect(response.status).toBe(200);
  });

  it("should allow access to protected routes after login", async () => {
    process.env.ADMIN_PASSWORD = "admin123";
    const agent = request.agent(app);
    await agent
      .post("/api/naane/login")
      .send({ password: "admin123" });
    const response = await agent.get("/api/naane/bookings");
    expect(response.status).toBe(200);
  });

  it("should not allow access to protected routes without login", async () => {
    const response = await request(app).get("/api/naane/bookings");
    expect(response.status).toBe(401);
  });

  it("should return 401 if ADMIN_PASSWORD is not set", async () => {
    const originalPassword = process.env.ADMIN_PASSWORD;
    delete process.env.ADMIN_PASSWORD;
    const response = await request(app)
      .post("/api/naane/login")
      .send({ password: "admin123" });
    expect(response.status).toBe(401);
    process.env.ADMIN_PASSWORD = originalPassword;
  });

  it("should return 401 if ADMIN_PASSWORD is not set and password is empty", async () => {
    const originalPassword = process.env.ADMIN_PASSWORD;
    delete process.env.ADMIN_PASSWORD;
    const response = await request(app)
      .post("/api/naane/login")
      .send({ password: "" });
    expect(response.status).toBe(401);
    process.env.ADMIN_PASSWORD = originalPassword;
  });

  it("should return 401 if ADMIN_PASSWORD is not set", async () => {
    const originalPassword = process.env.ADMIN_PASSWORD;
    delete process.env.ADMIN_PASSWORD;
    const response = await request(app)
      .post("/api/naane/login")
      .send({ password: "somepassword" });
    expect(response.status).toBe(401);
    process.env.ADMIN_PASSWORD = originalPassword;
  });
});

describe("Bookings CRUD", () => {
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

  it("should update a booking", async () => {
    process.env.ADMIN_PASSWORD = "admin123";
    const agent = request.agent(app);

    // Login
    await agent
      .post("/api/naane/login")
      .send({ password: "admin123" });

    // Create a booking
    const createResponse = await agent
      .post("/api/bookings")
      .send({
        guestName: "John Doe",
        guestEmail: "john.doe@example.com",
        guestCount: 2,
        checkInDate: "2024-01-01",
        checkOutDate: "2024-01-05",
        totalPrice: "400",
        status: "confirmed",
      });

    expect(createResponse.status).toBe(201);
    const bookingId = createResponse.body.id;

    // Update the booking
    const updateResponse = await agent
      .put(`/api/naane/bookings/${bookingId}`)
      .send({
        guestName: "Jane Doe",
        status: "cancelled",
      });

    expect(updateResponse.status).toBe(200);
    expect(updateResponse.body.guestName).toBe("Jane Doe");
    expect(updateResponse.body.status).toBe("cancelled");

    // Verify the update
    const getResponse = await agent.get("/api/naane/bookings");
    const updatedBooking = getResponse.body.find((b: any) => b.id === bookingId);
    expect(updatedBooking.guestName).toBe("Jane Doe");
    expect(updatedBooking.status).toBe("cancelled");
  });
});
