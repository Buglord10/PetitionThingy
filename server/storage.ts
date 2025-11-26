import type { Petition, PetitionsResponse, PetitionStatus, PetitionSort, SignatureRange, TrackedPetition, InsertTrackedPetition } from "@shared/schema";
import { drizzle } from "drizzle-orm/neon-serverless";
import { Pool, neonConfig } from "@neondatabase/serverless";
import { trackedPetitions } from "@shared/schema";
import { eq } from "drizzle-orm";
import ws from "ws";

neonConfig.webSocketConstructor = ws;

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const db = drizzle(pool);

export interface IStorage {
  fetchPetitions(params: { 
    status?: PetitionStatus; 
    sort?: PetitionSort; 
    signatureRange?: SignatureRange;
    search?: string;
    page?: number; 
  }): Promise<PetitionsResponse>;
  fetchPetitionById(id: string): Promise<Petition | null>;
  trackPetition(data: InsertTrackedPetition): Promise<TrackedPetition>;
  untrackPetition(petitionId: number): Promise<void>;
  getTrackedPetitions(): Promise<TrackedPetition[]>;
  isTracking(petitionId: number): Promise<boolean>;
}

export class UKGovPetitionStorage implements IStorage {
  private baseUrl = "https://petition.parliament.uk";
  private cache: Map<string, { data: any; timestamp: number }> = new Map();
  private cacheDuration = 30000; // 30 seconds

  private async fetchFromAPI(endpoint: string): Promise<any> {
    const cacheKey = endpoint;
    const cached = this.cache.get(cacheKey);
    
    if (cached && Date.now() - cached.timestamp < this.cacheDuration) {
      return cached.data;
    }

    const response = await fetch(`${this.baseUrl}${endpoint}`);
    if (!response.ok) {
      throw new Error(`API request failed: ${response.statusText}`);
    }

    const data = await response.json();
    this.cache.set(cacheKey, { data, timestamp: Date.now() });
    
    return data;
  }

  async fetchPetitions(params: { 
    status?: PetitionStatus; 
    sort?: PetitionSort; 
    signatureRange?: SignatureRange;
    search?: string;
    page?: number;
  }): Promise<PetitionsResponse> {
    const { status = "all", sort = "signature_count", signatureRange = "all", search = "", page = 1 } = params;
    
    // Build API endpoint
    let endpoint = "/petitions.json?";
    const queryParams: string[] = [];

    // Status filter
    if (status !== "all") {
      queryParams.push(`state=${status}`);
    }

    // Page
    queryParams.push(`page=${page}`);

    endpoint += queryParams.join("&");

    // Fetch from API
    let data = await this.fetchFromAPI(endpoint);

    // Apply search filter if provided
    if (search) {
      const searchLower = search.toLowerCase();
      data.data = data.data.filter((petition: Petition) => 
        petition.attributes.action.toLowerCase().includes(searchLower) ||
        petition.attributes.background?.toLowerCase().includes(searchLower) ||
        petition.attributes.additional_details?.toLowerCase().includes(searchLower)
      );
    }

    // Apply signature range filter
    if (signatureRange !== "all") {
      data.data = data.data.filter((petition: Petition) => {
        const count = petition.attributes.signature_count;
        switch (signatureRange) {
          case "under_10k":
            return count < 10000;
          case "10k_to_100k":
            return count >= 10000 && count < 100000;
          case "over_100k":
            return count >= 100000;
          default:
            return true;
        }
      });
    }

    // Apply sorting
    if (sort === "signature_count") {
      data.data.sort((a: Petition, b: Petition) => 
        b.attributes.signature_count - a.attributes.signature_count
      );
    } else if (sort === "created_at") {
      data.data.sort((a: Petition, b: Petition) => 
        new Date(b.attributes.created_at).getTime() - new Date(a.attributes.created_at).getTime()
      );
    } else if (sort === "closing_soon") {
      data.data.sort((a: Petition, b: Petition) => {
        const aDate = a.attributes.closed_at ? new Date(a.attributes.closed_at).getTime() : Infinity;
        const bDate = b.attributes.closed_at ? new Date(b.attributes.closed_at).getTime() : Infinity;
        return aDate - bDate;
      });
    }

    return data;
  }

  async fetchPetitionById(id: string): Promise<Petition | null> {
    try {
      const data = await this.fetchFromAPI(`/petitions/${id}.json`);
      return data.data || null;
    } catch (error) {
      console.error(`Error fetching petition ${id}:`, error);
      return null;
    }
  }

  async trackPetition(data: InsertTrackedPetition): Promise<TrackedPetition> {
    const [tracked] = await db.insert(trackedPetitions)
      .values(data)
      .onConflictDoNothing()
      .returning();
    return tracked;
  }

  async untrackPetition(petitionId: number): Promise<void> {
    await db.delete(trackedPetitions)
      .where(eq(trackedPetitions.petitionId, petitionId));
  }

  async getTrackedPetitions(): Promise<TrackedPetition[]> {
    return await db.select().from(trackedPetitions);
  }

  async isTracking(petitionId: number): Promise<boolean> {
    const result = await db.select()
      .from(trackedPetitions)
      .where(eq(trackedPetitions.petitionId, petitionId))
      .limit(1);
    return result.length > 0;
  }
}

export const storage = new UKGovPetitionStorage();
