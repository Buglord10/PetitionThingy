import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { petitionStatusSchema, petitionSortSchema, signatureRangeSchema, insertTrackedPetitionSchema } from "@shared/schema";

export async function registerRoutes(app: Express): Promise<Server> {
  // Get petitions with filters
  app.get("/api/petitions", async (req, res) => {
    try {
      const { status, sort, signatureRange, search, page } = req.query;

      // Validate and parse query parameters
      const parsedStatus = status 
        ? petitionStatusSchema.parse(status) 
        : "all";
      
      const parsedSort = sort 
        ? petitionSortSchema.parse(sort) 
        : "signature_count";

      const parsedSignatureRange = signatureRange
        ? signatureRangeSchema.parse(signatureRange)
        : "all";

      const parsedSearch = typeof search === "string" ? search : "";
      const parsedPage = page ? parseInt(page as string, 10) : 1;

      const petitions = await storage.fetchPetitions({
        status: parsedStatus,
        sort: parsedSort,
        signatureRange: parsedSignatureRange,
        search: parsedSearch,
        page: parsedPage,
      });

      res.json(petitions);
    } catch (error) {
      console.error("Error fetching petitions:", error);
      res.status(500).json({ 
        error: "Failed to fetch petitions",
        message: error instanceof Error ? error.message : "Unknown error"
      });
    }
  });

  // Get petition by ID
  app.get("/api/petitions/:id", async (req, res) => {
    try {
      const { id } = req.params;
      const petition = await storage.fetchPetitionById(id);

      if (!petition) {
        return res.status(404).json({ error: "Petition not found" });
      }

      res.json(petition);
    } catch (error) {
      console.error("Error fetching petition:", error);
      res.status(500).json({ 
        error: "Failed to fetch petition",
        message: error instanceof Error ? error.message : "Unknown error"
      });
    }
  });

  // Track a petition
  app.post("/api/track", async (req, res) => {
    try {
      const data = insertTrackedPetitionSchema.parse(req.body);
      const tracked = await storage.trackPetition(data);
      res.json(tracked);
    } catch (error) {
      console.error("Error tracking petition:", error);
      res.status(500).json({ 
        error: "Failed to track petition",
        message: error instanceof Error ? error.message : "Unknown error"
      });
    }
  });

  // Untrack a petition
  app.delete("/api/track/:petitionId", async (req, res) => {
    try {
      const petitionId = parseInt(req.params.petitionId, 10);
      await storage.untrackPetition(petitionId);
      res.json({ success: true });
    } catch (error) {
      console.error("Error untracking petition:", error);
      res.status(500).json({ 
        error: "Failed to untrack petition",
        message: error instanceof Error ? error.message : "Unknown error"
      });
    }
  });

  // Get all tracked petitions
  app.get("/api/tracked", async (req, res) => {
    try {
      const tracked = await storage.getTrackedPetitions();
      res.json(tracked);
    } catch (error) {
      console.error("Error fetching tracked petitions:", error);
      res.status(500).json({ 
        error: "Failed to fetch tracked petitions",
        message: error instanceof Error ? error.message : "Unknown error"
      });
    }
  });

  // Check if petition is being tracked
  app.get("/api/track/:petitionId/status", async (req, res) => {
    try {
      const petitionId = parseInt(req.params.petitionId, 10);
      const isTracking = await storage.isTracking(petitionId);
      res.json({ isTracking });
    } catch (error) {
      console.error("Error checking tracking status:", error);
      res.status(500).json({ 
        error: "Failed to check tracking status",
        message: error instanceof Error ? error.message : "Unknown error"
      });
    }
  });

  const httpServer = createServer(app);

  return httpServer;
}
