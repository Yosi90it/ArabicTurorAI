import weaviate from "weaviate-client";

let weaviateClient: any = null;

export function initWeaviateClient() {
  if (!weaviateClient) {
    const WEAVIATE_URL = process.env.WEAVIATE_URL;
    const WEAVIATE_APIKEY = process.env.WEAVIATE_APIKEY;
    
    if (WEAVIATE_URL && WEAVIATE_APIKEY) {
      try {
        weaviateClient = weaviate.client({
          scheme: "https",
          host: WEAVIATE_URL.replace(/^https?:\/\//, ""),
          apiKey: new weaviate.ApiKey(WEAVIATE_APIKEY),
        });
        console.log("Weaviate client initialized successfully");
      } catch (error) {
        console.error("Failed to initialize Weaviate client:", error);
      }
    } else {
      console.warn("Weaviate credentials not found in environment variables");
    }
  }
  return weaviateClient;
}

export async function searchWeaviateVocabulary(arabicWord: string): Promise<string> {
  const client = initWeaviateClient();
  if (!client) {
    throw new Error("Weaviate client not available");
  }

  try {
    const result = await client.graphql
      .get()
      .withClassName("Vocabulary")
      .withFields("german")
      .withWhere({
        path: ["arabic"],
        operator: "Equal",
        valueString: arabicWord
      })
      .do();
    
    return result.data.Get.Vocabulary?.[0]?.german || "Translation not found";
  } catch (error) {
    console.error("Weaviate query error:", error);
    throw new Error("Failed to query Weaviate");
  }
}