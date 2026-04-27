import { GoogleGenerativeAI } from "@google/generative-ai";

const API_KEY = process.env.NEXT_PUBLIC_GEMINI_API_KEY || "";
const genAI = new GoogleGenerativeAI(API_KEY);

export const systemPrompt = `Anda adalah Pawas.ai, asisten neural pribadi yang dibangun khusus untuk Muhammad Fawwaz Ali.

Konteks Pengguna:
- Mahasiswa IT UMY (Fokus: Full-stack, Blockchain, Network Security).
- Pebisnis Gadget (Brand: Core Pawas).
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

    const modelUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-3.1-flash-lite-preview:generateContent?key=${API_KEY}`;
    
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

    const response = await fetch(modelUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ contents })
    });

    const data = await response.json();

    if (!response.ok) {
      // Fallback to pro if flash fails
      if (response.status === 404) {
        const fallbackUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-3.1-pro-preview:generateContent?key=${API_KEY}`;
        const fallbackResponse = await fetch(fallbackUrl, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ contents: [{ role: "user", parts: [{ text: fullPrompt }] }] }) // No images for pro fallback
        });
        const fallbackData = await fallbackResponse.json();
        if (!fallbackResponse.ok) {
          throw new Error(fallbackData.error?.message || "Fallback model also failed.");
        }
        return fallbackData.candidates?.[0]?.content?.parts?.[0]?.text || "AI memberikan respons kosong.";
      }
      throw new Error(data.error?.message || `HTTP Error ${response.status}`);
    }

    return data.candidates?.[0]?.content?.parts?.[0]?.text || "AI memberikan respons kosong.";
  } catch (error: any) {
    console.error("Gemini Fetch API Error:", error);
    throw new Error(error?.message || "Koneksi ke AI gagal");
  }
}
