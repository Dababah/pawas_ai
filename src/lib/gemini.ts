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
    // Try Flash first for vision/speed, fallback to Pro if not found
    let modelName = imageBase64 ? "gemini-1.5-flash" : "gemini-1.5-flash";
    let model;
    
    try {
      model = genAI.getGenerativeModel({ model: modelName });
    } catch (e) {
      model = genAI.getGenerativeModel({ model: "gemini-pro" });
    }
    
    if (imageBase64) {
      const match = imageBase64.match(/^data:(.*);base64,(.*)$/);
      if (!match) throw new Error("Invalid image format");
      
      const mimeType = match[1];
      const data = match[2];

      const prompt = `${systemPrompt}\n\nUser Input: ${input}\nAnalisis gambar yang dilampirkan.`;
      const imageParts = [{
        inlineData: {
          data: data,
          mimeType: mimeType
        }
      }];
      
      try {
        const result = await model.generateContent([prompt, ...imageParts]);
        return result.response.text();
      } catch (e) {
        // If flash fails with images, we can't really fallback to pro for vision easily in this SDK version
        // but we can try gemini-pro for text-only as last resort
        throw e;
      }
    }

    const chat = model.startChat({
      history: [
        { role: "user", parts: [{ text: systemPrompt }] },
        { role: "model", parts: [{ text: "Siap, saya Pawas.ai. Bagaimana saya bisa membantu Anda hari ini?" }] },
        ...history
      ],
    });

    try {
      const result = await chat.sendMessage(input);
      const response = await result.response;
      return response.text();
    } catch (e: any) {
      if (e.message?.includes('not found')) {
        // Fallback to gemini-pro for text
        const proModel = genAI.getGenerativeModel({ model: "gemini-pro" });
        const proChat = proModel.startChat({
          history: [
            { role: "user", parts: [{ text: systemPrompt }] },
            { role: "model", parts: [{ text: "Siap, saya Pawas.ai. Bagaimana saya bisa membantu Anda hari ini?" }] },
            ...history
          ],
        });
        const proResult = await proChat.sendMessage(input);
        return proResult.response.text();
      }
      throw e;
    }
  } catch (error: any) {
    console.error("Gemini API Error:", error);
    throw new Error(error?.message || "Koneksi ke AI gagal");
  }
}
