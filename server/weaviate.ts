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

// Arabic text normalization utility
function normalizeArabic(text: string): string {
  if (!text) return '';
  
  // Remove all diacritics (tashkeel)
  let normalized = text.replace(/[\u064B-\u065F\u0670\u0640]/g, '');
  
  // Normalize different forms of the same letter
  normalized = normalized
    .replace(/[أإآ]/g, 'ا')  // Different alif forms to regular alif
    .replace(/[ؤ]/g, 'و')   // Hamza on waw to regular waw
    .replace(/[ئ]/g, 'ي')   // Hamza on ya to regular ya
    .replace(/[ة]/g, 'ه')   // Ta marbuta to ha
    .replace(/[ى]/g, 'ي');  // Alif maksura to ya
  
  // Remove extra spaces and trim
  normalized = normalized.replace(/\s+/g, ' ').trim();
  
  return normalized;
}

export async function searchWeaviateVocabulary(arabicWord: string): Promise<string> {
  try {
    // Skip translation for non-Arabic words (English, numbers, etc.)
    if (!/[\u0600-\u06FF]/.test(arabicWord)) {
      console.log('Skipping non-Arabic word:', arabicWord);
      return 'Translation not found';
    }
    
    const normalizedWord = normalizeArabic(arabicWord);
    console.log('Searching for:', arabicWord, '→ normalized:', normalizedWord);
    
    // First try exact match on normalized text
    const exactQuery = {
      query: `{
        Get {
          Vocabulary(where: {
            path: ["arabic_normalized"],
            operator: Equal,
            valueString: "${normalizedWord}"
          }) {
            german
            context
            arabic
          }
        }
      }`
    };
    
    let result = await weaviateRequest('/v1/graphql', 'POST', exactQuery);
    let vocabularyEntries = result.data?.Get?.Vocabulary || [];
    
    // If no exact match, try partial matches
    if (vocabularyEntries.length === 0) {
      const partialQuery = {
        query: `{
          Get {
            Vocabulary(where: {
              path: ["arabic_normalized"],
              operator: Like,
              valueString: "*${normalizedWord}*"
            }) {
              german
              context
              arabic
            }
          }
        }`
      };
      
      result = await weaviateRequest('/v1/graphql', 'POST', partialQuery);
      vocabularyEntries = result.data?.Get?.Vocabulary || [];
    }
    
    if (vocabularyEntries.length > 0) {
      const match = vocabularyEntries[0];
      console.log('Found translation:', match.german, 'for:', match.arabic);
      return match.german;
    }
    
    console.log('No translation found for normalized:', normalizedWord);
    return 'Translation not found';
  } catch (error) {
    console.error('Weaviate search error:', error);
    return 'Translation not found';
  }
}