/**
 * Interactive Arabic Learning EPUB JavaScript
 * Provides interlinear translation, audio playback, and vocabulary management
 */

// Global state management
const AppState = {
  interlinearEnabled: true,
  tashkeelEnabled: true,
  selectedWords: new Set(),
  audioEnabled: true,
  currentPage: 1,
  totalPages: 1,
  vocabulary: new Map(),
  translations: new Map()
};

// Weaviate API configuration (same as your main app)
const WEAVIATE_CONFIG = {
  baseUrl: 'https://your-weaviate-instance.weaviate.network',
  apiKey: 'your-weaviate-api-key',
  className: 'Vocabulary'
};

/**
 * Initialize the application
 */
document.addEventListener('DOMContentLoaded', function() {
  console.log('Arabic Learning EPUB initialized');
  
  // Initialize interlinear functionality
  initializeInterlinear();
  
  // Initialize audio system
  initializeAudio();
  
  // Initialize word interaction
  initializeWordInteraction();
  
  // Initialize controls
  initializeControls();
  
  // Load any saved preferences
  loadUserPreferences();
});

/**
 * Initialize interlinear translation system
 */
function initializeInterlinear() {
  const arabicText = document.querySelector('.arabic-text');
  if (!arabicText) return;
  
  // Create interlinear container
  const interlinearContainer = document.createElement('div');
  interlinearContainer.className = 'interlinear-container';
  
  // Create toggle control
  const toggleControl = createInterlinearToggle();
  interlinearContainer.appendChild(toggleControl);
  
  // Process Arabic text for interlinear display
  const processedText = processArabicTextForInterlinear(arabicText.textContent);
  interlinearContainer.appendChild(processedText);
  
  // Replace original text with interlinear version
  arabicText.parentNode.insertBefore(interlinearContainer, arabicText);
  arabicText.style.display = 'none';
}

/**
 * Create interlinear toggle control
 */
function createInterlinearToggle() {
  const toggleDiv = document.createElement('div');
  toggleDiv.className = 'interlinear-toggle';
  
  toggleDiv.innerHTML = `
    <span>Interlinear Translation:</span>
    <div class="toggle-switch ${AppState.interlinearEnabled ? 'active' : ''}" onclick="toggleInterlinear()">
    </div>
    <span>${AppState.interlinearEnabled ? 'An' : 'Aus'}</span>
  `;
  
  return toggleDiv;
}

/**
 * Process Arabic text for interlinear display
 */
function processArabicTextForInterlinear(arabicText) {
  const container = document.createElement('div');
  container.className = 'interlinear-text-container';
  
  // Split text into words (handle Arabic word boundaries)
  const words = arabicText.trim().split(/\s+/);
  
  words.forEach((word, index) => {
    if (word.trim()) {
      const wordElement = createInterlinearWord(word, index);
      container.appendChild(wordElement);
    }
  });
  
  return container;
}

/**
 * Create an interlinear word element
 */
function createInterlinearWord(arabicWord, index) {
  const wordDiv = document.createElement('div');
  wordDiv.className = 'interlinear-word clickable-word';
  wordDiv.setAttribute('data-word', arabicWord);
  wordDiv.setAttribute('data-index', index);
  
  // Arabic word element
  const arabicSpan = document.createElement('span');
  arabicSpan.className = 'arabic-word';
  arabicSpan.textContent = AppState.tashkeelEnabled ? arabicWord : removeTashkeel(arabicWord);
  arabicSpan.onclick = () => handleWordClick(arabicWord, wordDiv);
  
  // German translation element (initially empty, loaded on demand)
  const translationSpan = document.createElement('span');
  translationSpan.className = 'german-translation';
  translationSpan.textContent = '...';
  
  wordDiv.appendChild(arabicSpan);
  wordDiv.appendChild(translationSpan);
  
  // Load translation asynchronously
  loadWordTranslation(arabicWord, translationSpan);
  
  return wordDiv;
}

/**
 * Load word translation from Weaviate or local cache
 */
async function loadWordTranslation(arabicWord, translationElement) {
  try {
    // Check cache first
    if (AppState.translations.has(arabicWord)) {
      translationElement.textContent = AppState.translations.get(arabicWord);
      return;
    }
    
    // Simulate API call (replace with actual Weaviate API call)
    const translation = await fetchWordTranslation(arabicWord);
    
    if (translation) {
      AppState.translations.set(arabicWord, translation);
      translationElement.textContent = translation;
    } else {
      translationElement.textContent = '?';
    }
  } catch (error) {
    console.error('Translation error:', error);
    translationElement.textContent = '?';
  }
}

/**
 * Fetch word translation (implement with your Weaviate API)
 */
async function fetchWordTranslation(arabicWord) {
  // This would connect to your Weaviate API
  // For now, return a placeholder
  const normalizedWord = removeTashkeel(arabicWord);
  
  // Mock translations (replace with actual API call)
  const mockTranslations = {
    'في': 'in',
    'من': 'von',
    'إلى': 'zu',
    'هذا': 'dies',
    'ذلك': 'das',
    'كتاب': 'Buch',
    'بيت': 'Haus',
    'مدرسة': 'Schule'
  };
  
  return mockTranslations[normalizedWord] || null;
}

/**
 * Remove Arabic diacritics (tashkeel)
 */
function removeTashkeel(text) {
  return text.replace(/[\u064B-\u0652\u0670\u0640]/g, '');
}

/**
 * Toggle interlinear translation display
 */
function toggleInterlinear() {
  AppState.interlinearEnabled = !AppState.interlinearEnabled;
  
  const toggle = document.querySelector('.toggle-switch');
  const container = document.querySelector('.interlinear-text-container');
  
  if (toggle) {
    toggle.classList.toggle('active', AppState.interlinearEnabled);
  }
  
  if (container) {
    container.classList.toggle('translation-hidden', !AppState.interlinearEnabled);
  }
  
  // Update toggle text
  const toggleText = document.querySelector('.interlinear-toggle span:last-child');
  if (toggleText) {
    toggleText.textContent = AppState.interlinearEnabled ? 'An' : 'Aus';
  }
  
  saveUserPreferences();
}

/**
 * Toggle tashkeel (diacritics) display
 */
function toggleTashkeel() {
  AppState.tashkeelEnabled = !AppState.tashkeelEnabled;
  
  // Update all Arabic words
  const arabicWords = document.querySelectorAll('.arabic-word');
  arabicWords.forEach(wordElement => {
    const originalWord = wordElement.parentElement.getAttribute('data-word');
    wordElement.textContent = AppState.tashkeelEnabled ? originalWord : removeTashkeel(originalWord);
  });
  
  saveUserPreferences();
}

/**
 * Handle word click for detailed information
 */
function handleWordClick(arabicWord, wordElement) {
  // Toggle selection
  if (AppState.selectedWords.has(arabicWord)) {
    AppState.selectedWords.delete(arabicWord);
    wordElement.classList.remove('selected');
  } else {
    AppState.selectedWords.add(arabicWord);
    wordElement.classList.add('selected');
  }
  
  // Show word details
  showWordDetails(arabicWord, wordElement);
}

/**
 * Show detailed word information
 */
function showWordDetails(arabicWord, wordElement) {
  // Remove any existing tooltips
  const existingTooltip = document.querySelector('.word-tooltip');
  if (existingTooltip) {
    existingTooltip.remove();
  }
  
  // Create tooltip
  const tooltip = document.createElement('div');
  tooltip.className = 'word-tooltip show';
  
  const translation = AppState.translations.get(arabicWord) || 'Übersetzung wird geladen...';
  
  tooltip.innerHTML = `
    <div class="tooltip-word">${arabicWord}</div>
    <div class="tooltip-translation">${translation}</div>
    <div class="tooltip-grammar">Wortart: Substantiv</div>
    <button class="btn btn-vocab" onclick="addToFlashcards('${arabicWord}', '${translation}')">
      📚 Zu Flashcards hinzufügen
    </button>
  `;
  
  // Position tooltip
  const rect = wordElement.getBoundingClientRect();
  tooltip.style.position = 'fixed';
  tooltip.style.top = (rect.bottom + 10) + 'px';
  tooltip.style.left = rect.left + 'px';
  
  document.body.appendChild(tooltip);
  
  // Remove tooltip when clicking outside
  setTimeout(() => {
    document.addEventListener('click', function removeTooltip(e) {
      if (!tooltip.contains(e.target) && e.target !== wordElement) {
        tooltip.remove();
        document.removeEventListener('click', removeTooltip);
      }
    });
  }, 100);
}

/**
 * Initialize audio system
 */
function initializeAudio() {
  // Check for Web Speech API support
  if ('speechSynthesis' in window) {
    AppState.audioEnabled = true;
  } else {
    console.warn('Speech synthesis not supported');
    AppState.audioEnabled = false;
  }
}

/**
 * Play audio for Arabic text
 */
function playAudio() {
  if (!AppState.audioEnabled) {
    alert('Audio wird von diesem Browser nicht unterstützt');
    return;
  }
  
  const arabicText = document.querySelector('.arabic-text');
  if (!arabicText) return;
  
  const text = arabicText.textContent;
  
  if ('speechSynthesis' in window) {
    // Cancel any ongoing speech
    speechSynthesis.cancel();
    
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = 'ar-SA'; // Arabic (Saudi Arabia)
    utterance.rate = 0.8; // Slower for learning
    utterance.pitch = 1;
    utterance.volume = 1;
    
    // Visual feedback
    const audioBtn = document.querySelector('.btn-audio');
    if (audioBtn) {
      audioBtn.textContent = '⏸️ Audio wird abgespielt...';
      audioBtn.disabled = true;
    }
    
    utterance.onend = () => {
      if (audioBtn) {
        audioBtn.textContent = '🔊 Audio abspielen';
        audioBtn.disabled = false;
      }
    };
    
    utterance.onerror = (error) => {
      console.error('Speech synthesis error:', error);
      if (audioBtn) {
        audioBtn.textContent = '🔊 Audio abspielen';
        audioBtn.disabled = false;
      }
    };
    
    speechSynthesis.speak(utterance);
  }
}

/**
 * Toggle translation display
 */
function toggleTranslation() {
  toggleInterlinear();
}

/**
 * Add word to flashcards
 */
function addToFlashcards(arabicWord = '', translation = '') {
  // If no word provided, add all selected words
  if (!arabicWord && AppState.selectedWords.size > 0) {
    AppState.selectedWords.forEach(word => {
      const wordTranslation = AppState.translations.get(word) || 'Übersetzung unbekannt';
      addSingleWordToFlashcards(word, wordTranslation);
    });
    
    // Clear selection
    AppState.selectedWords.clear();
    document.querySelectorAll('.clickable-word.selected').forEach(el => {
      el.classList.remove('selected');
    });
    
    showNotification(`${AppState.selectedWords.size} Wörter zu Flashcards hinzugefügt!`);
  } else if (arabicWord) {
    addSingleWordToFlashcards(arabicWord, translation);
    showNotification(`"${arabicWord}" zu Flashcards hinzugefügt!`);
  } else {
    showNotification('Bitte wählen Sie zuerst Wörter aus', 'warning');
  }
}

/**
 * Add a single word to flashcards
 */
function addSingleWordToFlashcards(arabicWord, translation) {
  // Store in vocabulary
  AppState.vocabulary.set(arabicWord, {
    translation,
    dateAdded: new Date().toISOString(),
    category: 'EPUB Import',
    grammar: 'Unknown'
  });
  
  // Save to localStorage (would integrate with your app's storage)
  saveVocabulary();
  
  console.log('Added to flashcards:', arabicWord, translation);
}

/**
 * Initialize control buttons
 */
function initializeControls() {
  // Create tashkeel toggle button if it doesn't exist
  const controls = document.querySelector('.interaction-controls');
  if (controls && !document.querySelector('.btn-tashkeel')) {
    const tashkeelBtn = document.createElement('button');
    tashkeelBtn.className = 'btn btn-tashkeel';
    tashkeelBtn.innerHTML = '📝 Tashkeel umschalten';
    tashkeelBtn.onclick = toggleTashkeel;
    controls.appendChild(tashkeelBtn);
  }
}

/**
 * Initialize word interaction
 */
function initializeWordInteraction() {
  // Add click handlers to any existing clickable words
  document.querySelectorAll('.clickable-word').forEach(wordElement => {
    const arabicWord = wordElement.getAttribute('data-word');
    if (arabicWord) {
      wordElement.onclick = (e) => {
        e.stopPropagation();
        handleWordClick(arabicWord, wordElement);
      };
    }
  });
}

/**
 * Show notification
 */
function showNotification(message, type = 'success') {
  // Remove existing notifications
  const existing = document.querySelector('.notification');
  if (existing) existing.remove();
  
  const notification = document.createElement('div');
  notification.className = `notification notification-${type}`;
  notification.textContent = message;
  notification.style.cssText = `
    position: fixed;
    top: 20px;
    right: 20px;
    padding: 1rem 1.5rem;
    background: ${type === 'success' ? 'var(--success-color)' : 'var(--warning-color)'};
    color: white;
    border-radius: 8px;
    box-shadow: 0 4px 12px rgba(0,0,0,0.15);
    z-index: 1000;
    font-weight: 600;
    animation: slideIn 0.3s ease;
  `;
  
  document.body.appendChild(notification);
  
  // Auto remove after 3 seconds
  setTimeout(() => {
    notification.style.animation = 'slideOut 0.3s ease';
    setTimeout(() => notification.remove(), 300);
  }, 3000);
}

/**
 * Save user preferences
 */
function saveUserPreferences() {
  const preferences = {
    interlinearEnabled: AppState.interlinearEnabled,
    tashkeelEnabled: AppState.tashkeelEnabled,
    audioEnabled: AppState.audioEnabled
  };
  
  localStorage.setItem('arabic_epub_preferences', JSON.stringify(preferences));
}

/**
 * Load user preferences
 */
function loadUserPreferences() {
  try {
    const saved = localStorage.getItem('arabic_epub_preferences');
    if (saved) {
      const preferences = JSON.parse(saved);
      AppState.interlinearEnabled = preferences.interlinearEnabled ?? true;
      AppState.tashkeelEnabled = preferences.tashkeelEnabled ?? true;
      AppState.audioEnabled = preferences.audioEnabled ?? true;
    }
  } catch (error) {
    console.error('Error loading preferences:', error);
  }
}

/**
 * Save vocabulary to localStorage
 */
function saveVocabulary() {
  try {
    const vocabularyArray = Array.from(AppState.vocabulary.entries());
    localStorage.setItem('arabic_epub_vocabulary', JSON.stringify(vocabularyArray));
  } catch (error) {
    console.error('Error saving vocabulary:', error);
  }
}

/**
 * Load vocabulary from localStorage
 */
function loadVocabulary() {
  try {
    const saved = localStorage.getItem('arabic_epub_vocabulary');
    if (saved) {
      const vocabularyArray = JSON.parse(saved);
      AppState.vocabulary = new Map(vocabularyArray);
    }
  } catch (error) {
    console.error('Error loading vocabulary:', error);
  }
}

// CSS animations
const style = document.createElement('style');
style.textContent = `
  @keyframes slideIn {
    from { transform: translateX(100%); opacity: 0; }
    to { transform: translateX(0); opacity: 1; }
  }
  
  @keyframes slideOut {
    from { transform: translateX(0); opacity: 1; }
    to { transform: translateX(100%); opacity: 0; }
  }
`;
document.head.appendChild(style);

// Initialize when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initializeAudio);
} else {
  initializeAudio();
}