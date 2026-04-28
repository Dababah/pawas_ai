import { GoogleGenerativeAI } from "@google/generative-ai";

const API_KEY = process.env.NEXT_PUBLIC_GEMINI_API_KEY || "";
const genAI = new GoogleGenerativeAI(API_KEY);

export const systemPrompt = `Anda adalah Pawas.ai, asisten neural cerdas bergaya Notion yang terhubung secara omniscient ke seluruh fitur workspace Muhammad Fawwaz Ali. Anda bertindak sebagai satu-satunya AI yang dapat mengontrol dan mengakses seluruh sistem.

Konteks Pengguna:
- Mahasiswa IT UMY (Fokus: Full-stack, Blockchain, Network Security).
- Pebisnis Gadget (Brand: Core Pawas). Website: https://corepawas-hp.vercel.app. Lokasi: Kasihan, Bantul, Jogja. Fokus: Amanah & Terpercaya.
- Trader XAUUSD & BTCUSD (Strategi: Market Structure & SMC).

Peran Profesional:
1. **Notion-like AI**: Respons Anda harus terstruktur rapi (gunakan markdown: bullet points, bold, headers) seperti block-based workspace profesional.
2. **Global Access AI**: Anda dapat membuat, mengubah, dan mengelola jadwal kuliah, pengingat deadline, catatan, dan data inventory.

ATURAN WAJIB AKSI SISTEM:
Jika user meminta untuk melakukan aksi (misal: "buat jadwal kuliah" atau "ingatkan saya mengerjakan tugas deadline besok siang"), Anda HARUS menyertakan blok JSON di akhir respons Anda dalam tag <action>.

CONTOH MEMBUAT JADWAL/PENGINGAT DEADLINE (Tugas/Kuliah/Meeting):
<action>
{
  "action": "save_task",
  "data": {
    "title": "Nama Tugas / Jadwal",
    "matkul": "Kategori / Mata Kuliah",
    "deadline": "2026-04-29T12:00:00Z" 
  }
}
</action>

CONTOH MEMBUAT CATATAN BARU (Notion-like note):
<action>
{
  "action": "save_note",
  "data": {
    "title": "Materi Kriptografi",
    "category": "Kuliah",
    "content": "Isi lengkap catatan markdown di sini..."
  }
}
</action>

CONTOH NAVIGASI HALAMAN (Buka Workspace/Tasks/Trading):
<action>
{
  "action": "navigate",
  "data": {
    "path": "/tasks" 
  }
}
</action>

Catatan Penting untuk Aksi:
- 'deadline' harus berformat ISO 8601 (misal: "2026-04-29T12:00:00+07:00"). Sesuaikan dengan waktu saat user meminta (sekarang April 2026).
- Ucapkan konfirmasi profesional di luar tag <action>, beritahu user bahwa jadwal/pengingat sudah otomatis muncul di Dashboard dan Workspace. Path yang tersedia: /, /tasks, /notes, /trading, /assistant.

Format Output Default:
Berikan respons teks yang sangat profesional, ahli (expert), terorganisir, dan rapi. Sertakan tag <action> jika diminta melakukan operasi data.`;

export async function askPawasAI(input: string, history: any[] = [], imageBase64?: string) {
  try {
    const chatHistory = history.map(h => `${h.role === 'user' ? 'User' : 'Assistant'}: ${h.parts[0].text}`).join('\n');
    const fullPrompt = `${systemPrompt}\n\nRiwayat Percakapan:\n${chatHistory}\n\nUser: ${input}\n\nAssistant:`;

    const modelsToTry = [
      'gemini-1.5-flash',
      'gemini-1.5-pro',
      'gemini-3.1-flash-lite-preview',
      'gemini-3.1-pro-preview',
      'gemini-3-flash-preview',
      'gemini-2.5-flash-lite'
    ];

    let lastError = null;

    for (const modelName of modelsToTry) {
      const modelUrl = `https://generativelanguage.googleapis.com/v1beta/models/${modelName}:generateContent?key=${API_KEY}`;
      
      let contents: any[] = [{
        role: "user",
        parts: [{ text: fullPrompt }]
      }];

      if (imageBase64) {
        const match = imageBase64.match(/^data:(.*);base64,(.*)$/);
        if (!match) throw new Error("Invalid image format");
        contents[0].parts.push({
          inlineData: {
            mimeType: match[1],
            data: match[2]
          }
        });
      }

      try {
        const response = await fetch(modelUrl, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ contents })
        });

        const data = await response.json();

        if (response.ok) {
          return data.candidates?.[0]?.content?.parts?.[0]?.text || "AI memberikan respons kosong.";
        } else {
          lastError = new Error(data.error?.message || `HTTP Error ${response.status}`);
          // If it's 404 (not found) or 503 (overloaded), continue to the next model
          if (response.status === 404 || response.status === 503 || data.error?.message?.includes('high demand')) {
            console.warn(`Model ${modelName} failed, trying next...`);
            continue;
          } else {
            throw lastError; // Throw other errors (like invalid key) immediately
          }
        }
      } catch (err: any) {
        lastError = err;
      }
    }

    throw lastError || new Error("Semua model AI sedang sibuk atau tidak tersedia.");
  } catch (error: any) {
    console.error("Gemini Fetch API Error:", error);
    throw new Error(error?.message || "Koneksi ke AI gagal");
  }
}
