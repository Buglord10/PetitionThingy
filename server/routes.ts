import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { petitionStatusSchema, petitionSortSchema } from "@shared/schema";

export async function registerRoutes(app: Express): Promise<Server> {
  // Get petitions with filters
  app.get("/api/petitions", async (req, res) => {
    try {
      const { status, sort, search, page } = req.query;

      // Validate and parse query parameters
      const parsedStatus = status 
        ? petitionStatusSchema.parse(status) 
        : "all";
      
      const parsedSort = sort 
        ? petitionSortSchema.parse(sort) 
        : "signature_count";

      const parsedSearch = typeof search === "string" ? search : "";
      const parsedPage = page ? parseInt(page as string, 10) : 1;

      const petitions = await storage.fetchPetitions({
        status: parsedStatus,
        sort: parsedSort,
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

  const httpServer = createServer(app);

  return httpServer;
}
