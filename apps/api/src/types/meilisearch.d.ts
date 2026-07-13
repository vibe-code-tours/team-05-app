declare module "meilisearch" {
  export class MeiliSearch {
    constructor(config: { host: string; apiKey?: string });
    index(uid: string): Index;
  }

  export interface Index {
    search(query: string, options?: SearchOptions): Promise<SearchResult>;
    addDocuments(documents: Record<string, unknown>[]): Promise<Task>;
    deleteDocument(documentId: string): Promise<Task>;
    getStats(): Promise<IndexStats>;
  }

  export interface SearchOptions {
    limit?: number;
    offset?: number;
    filter?: string;
    sort?: string[];
    attributesToHighlight?: string[];
    attributesToCrop?: string[];
    attributesToRetrieve?: string[];
  }

  export interface SearchResult {
    hits: Record<string, unknown>[];
    estimatedTotalHits?: number;
    nbHits?: number;
    processingTimeMs: number;
    query: string;
  }

  export interface Task {
    taskUid: number;
  }

  export interface IndexStats {
    numberOfDocuments: number;
    isIndexing: boolean;
  }
}
