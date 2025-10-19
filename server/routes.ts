import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { readFileSync } from "fs";
import { execSync } from "child_process";
import path from "path";

export async function registerRoutes(app: Express): Promise<Server> {
  app.get("/api/tours", async (req, res) => {
    try {
      const { location, category } = req.query;
      const filters: { location?: string; category?: string } = {};
      
      if (location && typeof location === 'string') {
        filters.location = location;
      }
      
      if (category && typeof category === 'string') {
        filters.category = category;
      }
      
      const tours = await storage.getTours(filters);
      res.json(tours);
    } catch (error) {
      console.error('Error fetching tours:', error);
      res.status(500).json({ error: 'Failed to fetch tours' });
    }
  });

  app.get("/api/tours/:id", async (req, res) => {
    try {
      const { id } = req.params;
      const tour = await storage.getTour(id);

      if (!tour) {
        return res.status(404).json({ error: 'Tour not found' });
      }

      res.json(tour);
    } catch (error) {
      console.error('Error fetching tour:', error);
      res.status(500).json({ error: 'Failed to fetch tour' });
    }
  });

  app.get("/api/version", (req, res) => {
    try {
      const packageJson = JSON.parse(readFileSync(path.join(process.cwd(), 'package.json'), 'utf8'));
      const gitCommit = execSync('git rev-parse HEAD', { encoding: 'utf8' }).trim();
      const gitBranch = execSync('git rev-parse --abbrev-ref HEAD', { encoding: 'utf8' }).trim();

      res.json({
        version: packageJson.version,
        commit: gitCommit,
        branch: gitBranch,
        buildTime: new Date().toISOString(),
        environment: process.env.NODE_ENV || 'development'
      });
    } catch (error) {
      console.error('Error getting version info:', error);
      res.status(500).json({ error: 'Failed to get version info' });
    }
  });

  const httpServer = createServer(app);

  return httpServer;
}
