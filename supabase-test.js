// Test der Supabase-Verbindung und Cache-System
import { createClient } from '@supabase/supabase-js';

async function testSupabaseConnection() {
  // Diese Werte sollten aus den Umgebungsvariablen kommen
  const supabaseUrl = process.env.SUPABASE_URL;
  const supabaseKey = process.env.SUPABASE_ANON_KEY;
  
  if (!supabaseUrl || !supabaseKey) {
    console.log('❌ Supabase-Umgebungsvariablen nicht gefunden');
    return;
  }
  
  console.log('✅ Supabase-Umgebungsvariablen gefunden');
  console.log('URL:', supabaseUrl.substring(0, 30) + '...');
  console.log('Key:', supabaseKey.substring(0, 30) + '...');
  
  const supabase = createClient(supabaseUrl, supabaseKey);
  
  try {
    // Test: Eine Demo-Geschichte einfügen
    const testStory = {
      vocab_key: 'كتب,قرأ,درس',
      vocab_list: ['كتب', 'قرأ', 'درس'],
      word_count: 30,
      story_text: 'قرأ أحمد كتابًا جميلاً في المكتبة. درس الطالب اللغة العربية بجد. كتب المعلم على السبورة.',
      created_at: new Date().toISOString()
    };
    
    const { data: insertData, error: insertError } = await supabase
      .from('stories')
      .insert([testStory])
      .select()
      .single();
    
    if (insertError) {
      console.log('❌ Fehler beim Einfügen:', insertError.message);
      return;
    }
    
    console.log('✅ Test-Geschichte erfolgreich eingefügt:', insertData.id);
    
    // Test: Geschichte wieder abrufen
    const { data: selectData, error: selectError } = await supabase
      .from('stories')
      .select('*')
      .eq('vocab_key', 'كتب,قرأ,درس')
      .eq('word_count', 30)
      .single();
    
    if (selectError) {
      console.log('❌ Fehler beim Abrufen:', selectError.message);
      return;
    }
    
    console.log('✅ Geschichte erfolgreich abgerufen aus Cache');
    console.log('Story:', selectData.story_text);
    
  } catch (error) {
    console.log('❌ Unerwarteter Fehler:', error.message);
  }
}

testSupabaseConnection();