# extract_vocab.py
import re

# Pfad zu deinem Buch
BOOK_PATH = "books/qiraatu al rashida.md"

with open(BOOK_PATH, encoding="utf-8") as f:
    text = f.read()

# Alle arabischen Wörter extrahieren, Duplikate rausfiltern und sortieren
words = re.findall(r"[\u0600-\u06FF]+", text)
unique = sorted(set(words))

# In unique_words.txt speichern
with open("unique_words.txt", "w", encoding="utf-8") as out:
    for w in unique:
        out.write(w + "\n")

print(f"✅ {len(unique)} Wörter in unique_words.txt")
