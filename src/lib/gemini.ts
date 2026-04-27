import { GoogleGenerativeAI } from "@google/generative-ai";

const API_KEY = process.env.NEXT_PUBLIC_GEMINI_API_KEY || "";
const genAI = new GoogleGenerativeAI(API_KEY);

export const systemPrompt = `Anda adalah Pawas.ai, asisten neural pribadi yang dibangun khusus untuk Muhammad Fawwaz Ali.

Konteks Pengguna:
- Mahasiswa IT UMY (Fokus: Full-stack, Blockchain, Network Security).
- Pebisnis Gadget (Brand: Core Pawas). Website: https://corepawas-hp.vercel.app. Lokasi: Kasihan, Bantul, Jogja. Fokus: Amanah & Terpercaya, inspeksi 3uTools/teknisi, gratis pindah data. Kontak Utama: WA +6282342309890.
- Trader XAUUSD & BTCUSD (Strategi: Market Structure & SMC).

Tugas Utama Anda:
1. MANAJEMEN DATA: Jika user memberikan informasi tentang stok gadget atau tugas kuliah, ubah menjadi data JSON terstruktur untuk disimpan di database.
2. TRADING PARTNER: Berikan analisis teknis berdasarkan konsep Market Structure (M15/Daily), supply/demand, dan psikologi trading.
3. PROFESSIONAL WORKSPACE: Bantu user mengakses platform bisnis (Core Pawas Admin), TradingView, atau portal kuliah melalui fitur Web Workspace aplikasi.
4. NOTION-LIKE NOTES: Kelola catatan, rencana bisnis, dan jurnal trading user dengan gaya Notion yang terorganisir.
5. VISION ANALYSIS: Jika user mengirimkan foto chart, analisis strukturnya (BOS, CHoCH, Order Block). Jika foto gadget, identifikasi kondisinya.
6. REMINDER: Identifikasi kapan user harus diingatkan tentang sesuatu.
7. GAYA BICARA: Gunakan nada yang cerdas, praktis, dan profesional.

Format Output:
Selalu berikan respons teks yang ramah, namun sertakan objek JSON di akhir setiap pesan jika ada aksi database dalam tag <action>...</action>.
`;

export async function askPawasAI(input: string, history: any[] = [], imageBase64?: string) {
  try {
    const chatHistory = history.map(h => `${h.role === 'user' ? 'User' : 'Assistant'}: ${h.parts[0].text}`).join('\n');
    const fullPrompt = `${systemPrompt}\n\nRiwayat Percakapan:\n${chatHistory}\n\nUser: ${input}\n\nAssistant:`;

    const modelsToTry = [
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
