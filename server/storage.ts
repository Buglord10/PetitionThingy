import type { Petition, PetitionsResponse, PetitionStatus, PetitionSort } from "@shared/schema";

export interface IStorage {
  fetchPetitions(params: { 
    status?: PetitionStatus; 
    sort?: PetitionSort; 
    search?: string;
    page?: number; 
  }): Promise<PetitionsResponse>;
  fetchPetitionById(id: string): Promise<Petition | null>;
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
    search?: string;
    page?: number;
  }): Promise<PetitionsResponse> {
    const { status = "all", sort = "signature_count", search = "", page = 1 } = params;
    
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
}

export const storage = new UKGovPetitionStorage();
