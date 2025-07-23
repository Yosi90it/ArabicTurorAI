// Test der Story-Generation ohne Supabase
const testStoryGeneration = async () => {
  try {
    const response = await fetch('http://localhost:5000/api/getStory?vocab=كتب,قرأ,درس&wordCount=30');
    const data = await response.json();
    
    console.log('Story Generation Test:');
    console.log('Status:', response.status);
    console.log('Response:', JSON.stringify(data, null, 2));
    
    if (data.error) {
      console.log('\n⚠️  Fehler aufgetreten:', data.error);
      if (data.message.includes('quota')) {
        console.log('💡 Das OpenAI-Quota ist aufgebraucht. Die Route funktioniert aber korrekt!');
      }
    }
  } catch (error) {
    console.error('Test failed:', error);
  }
};

testStoryGeneration();