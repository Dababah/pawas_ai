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
  const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
  
  if (imageBase64) {
    const prompt = `${systemPrompt}\n\nUser Input: ${input}\nAnalisis gambar yang dilampirkan.`;
    const imageParts = [{
      inlineData: {
        data: imageBase64.split(',')[1],
        mimeType: "image/jpeg"
      }
    }];
    
    const result = await model.generateContent([prompt, ...imageParts]);
    return result.response.text();
  }

  const chat = model.startChat({
    history: [
      { role: "user", parts: [{ text: systemPrompt }] },
      { role: "model", parts: [{ text: "Siap, saya Pawas.ai. Bagaimana saya bisa membantu Anda hari ini?" }] },
      ...history
    ],
  });

  const result = await chat.sendMessage(input);
  const response = await result.response;
  return response.text();
}
