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
    // Try Flash Latest first, then Pro with explicit models/ prefix
    let model;
    try {
      model = genAI.getGenerativeModel({ model: "models/gemini-1.5-flash-latest" });
    } catch (e) {
      model = genAI.getGenerativeModel({ model: "models/gemini-pro" });
    }
    
    // Combine history and current input into a single prompt
    const chatHistory = history.map(h => `${h.role === 'user' ? 'User' : 'Assistant'}: ${h.parts[0].text}`).join('\n');
    const fullPrompt = `${systemPrompt}\n\nRiwayat Percakapan:\n${chatHistory}\n\nUser: ${input}\n\nAssistant:`;

    if (imageBase64) {
      const match = imageBase64.match(/^data:(.*);base64,(.*)$/);
      if (!match) throw new Error("Invalid image format");
      
      const mimeType = match[1];
      const data = match[2];

      const imageParts = [{
        inlineData: {
          data: data,
          mimeType: mimeType
        }
      }];
      
      const result = await model.generateContent([fullPrompt, ...imageParts]);
      return result.response.text();
    }

    const result = await model.generateContent(fullPrompt);
    const response = await result.response;
    return response.text();
  } catch (error: any) {
    console.error("Gemini API Error Detail:", error);
    
    // Last ditch effort: try models/gemini-1.0-pro
    if (error.message?.includes('not found') || error.message?.includes('404')) {
       try {
         const lastResortModel = genAI.getGenerativeModel({ model: "models/gemini-1.0-pro" });
         const result = await lastResortModel.generateContent(input);
         return result.response.text();
       } catch (finalError) {
         throw new Error("Koneksi AI Gagal: Akses model ditolak atau API Key tidak memiliki izin untuk model ini.");
       }
    }
    throw new Error(error?.message || "Koneksi ke AI gagal");
  }
}
