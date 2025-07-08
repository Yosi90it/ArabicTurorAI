import re
import os
from openai import OpenAI

# Deinen API-Key als Umgebungsvariable in Replit anlegen: OPENAI_API_KEY
client = OpenAI(api_key=os.environ["OPENAI_API_KEY"])

# Hier den Dateinamen anpassen, falls dein Buch z.B. qiraatu al rashida.md heißt
with open("books/qiraatu al rashida.md", encoding="utf-8") as f:
    text = f.read()

# Alle arabischen Wörter extrahieren, Duplikate rausfiltern
words = re.findall(r"[\u0600-\u06FF]+", text)
unique = list(dict.fromkeys(words))

# Deutsche Übersetzungen abfragen und als Markdown bauen
entries = []
for w in unique:
    resp = client.chat.completions.create(
        model="gpt-4o-mini",
        messages=[{"role":"user","content":f"Übersetze dieses arabische Wort ins Deutsche: «{w}»"}]
    )
    de = resp.choices[0].message.content.strip()
    entries.append((w, de))

# Ergebnis in vocab.md speichern
with open("vocab.md", "w", encoding="utf-8") as out:
    for ar, de in entries:
        out.write(f"{ar}\n{de}\n\n")

print(f"✅ {len(entries)} Vokabeln in vocab.md geschrieben.")
