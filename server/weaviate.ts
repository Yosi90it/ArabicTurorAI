const WEAVIATE_URL = process.env.WEAVIATE_URL;
const WEAVIATE_APIKEY = process.env.WEAVIATE_APIKEY;

// Function to make authenticated requests to Weaviate
async function weaviateRequest(endpoint: string, method = 'GET', body: any = null) {
  if (!WEAVIATE_URL || !WEAVIATE_APIKEY) {
    throw new Error("Weaviate credentials not configured");
  }

  const url = `${WEAVIATE_URL}${endpoint}`;
  const options: RequestInit = {
    method,
    headers: {
      'Authorization': `Bearer ${WEAVIATE_APIKEY}`,
      'Content-Type': 'application/json'
    }
  };
  
  if (body) {
    options.body = JSON.stringify(body);
  }
  
  const response = await fetch(url, options);
  
  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Weaviate request failed: ${response.status} - ${errorText}`);
  }
  
  return response.json();
}

export function initWeaviateClient() {
  if (WEAVIATE_URL && WEAVIATE_APIKEY) {
    console.log("Weaviate client configured successfully");
    return true;
  } else {
    console.warn("Weaviate credentials not found in environment variables");
    return false;
  }
}

export async function searchWeaviateVocabulary(arabicWord: string): Promise<string> {
  try {
    // Use GraphQL query to search for exact match
    const query = {
      query: `{
        Get {
          Vocabulary(where: {
            path: ["arabic"],
            operator: Equal,
            valueString: "${arabicWord}"
          }) {
            german
          }
        }
      }`
    };

    const result = await weaviateRequest('/v1/graphql', 'POST', query);
    
    const vocabularyEntries = result.data?.Get?.Vocabulary;
    if (vocabularyEntries && vocabularyEntries.length > 0) {
      return vocabularyEntries[0].german;
    }
    
    return "Translation not found";
  } catch (error) {
    console.error("Weaviate query error:", error);
    throw new Error("Failed to query Weaviate");
  }
}