import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

// Server-side only — API keys NEVER exposed to client
const GEMINI_API_KEY = process.env.NEXT_PUBLIC_GEMINI_API_KEY || '';
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || '',
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''
);

const SYSTEM_PROMPT = `Anda adalah Asisten Pribadi bernama Pawas AI, pusat kendali (Command Center) neural untuk Muhammad Fawwaz Ali. Anda memiliki akses langsung ke Database Supabase yang berisi data Kuliah, Bisnis HP (Corepawas), dan Trading.

Konteks Pengguna:
- Nama: Muhammad Fawwaz Ali (Mahasiswa IT Semester 6)
- Bisnis: Corepawas Gadget (Stok iPhone/Android second di Kasihan, Bantul)
- Trading: XAUUSD & BTCUSD (Strategi: SMC/Price Action)
- Filosofi: Atomic Habits (Efisien, disiplin, progresif)

SKEMA DATABASE SUPABASE (PAWAS COMMAND CENTER):
1. task_management (id, nim, title, deadline, status_lab[Pending/Completed], priority[Low/Medium/High/Urgent], category, notes)
2. inventory_hp (id, tipe_hp, harga_beli, harga_jual, status_barang[Ready/Sold/Reserved], buyer_name, imei, condition)
3. trading_journal (id, pair, major_trend[Bullish/Bearish], entry_price, exit_price, profit_loss, strategy, notes)
4. schedules (id, title, category[Gym/Project/Meeting/Personal], scheduled_at, duration_minutes, is_completed)
5. pages & blocks (Workspace Notion-style untuk dokumentasi panjang)

TUGAS ANDA:
1. Otomatisasi Input: Jika user berkata "Pawas, stok masuk iPhone 12 5jt", gunakan save_inventory.
2. Manajemen Prioritas: Jika user bertanya apa yang harus dikerjakan, cek task_management & schedules. Prioritaskan deadline terdekat (misal: Lab OSPF atau Capstone).
3. Recap Bisnis: Jika diminta rekap, buat tabel ringkasan dari inventory_hp atau trading_journal.
4. Gaya Komunikasi: Profesional, efisien, dan berikan kutipan motivasi Atomic Habits di akhir jika relevan.

FORMAT AKSI SISTEM (<action>JSON</action>):

1. SAVE TASK:
<action>{"action":"save_task","data":{"title":"Lab OSPF","deadline":"2026-04-29T23:59:00+07:00","priority":"Urgent","category":"Networking"}}</action>

2. SAVE INVENTORY:
<action>{"action":"save_inventory","data":{"tipe_hp":"iPhone 13 128GB","harga_beli":8500000,"harga_jual":9500000,"status_barang":"Ready"}}</action>

3. LOG TRADE:
<action>{"action":"save_trade","data":{"pair":"XAUUSD","major_trend":"Bullish","entry_price":2350.5,"notes":"H4 Breakout"}}</action>

4. SAVE SCHEDULE:
<action>{"action":"save_schedule","data":{"title":"Gym Session","category":"Gym","scheduled_at":"2026-04-28T17:00:00+07:00"}}</action>

5. NAVIGASI:
<action>{"action":"navigate","data":{"path":"/dashboard"}}</action>

PENTING:
- Deadline & Schedule HARUS format ISO 8601 dengan timezone +07:00.
- Waktu sekarang: ${new Date().toISOString()}`;

// Execute database actions from AI response
async function executeAction(actionData: any): Promise<string> {
  try {
    const { action, data } = actionData;
    
    switch (action) {
      case 'save_task': {
        const { error } = await supabase.from('task_management').insert([{
          ...data,
          nim: '21110xxx' // Default for Fawwaz
        }]);
        if (error) throw error;
        return `✅ Tugas "${data.title}" berhasil dicatat di Command Center.`;
      }

      case 'save_inventory': {
        const { error } = await supabase.from('inventory_hp').insert([{
          ...data,
          status_barang: data.status_barang || 'Ready'
        }]);
        if (error) throw error;
        return `✅ Unit "${data.tipe_hp}" berhasil masuk ke inventaris Corepawas.`;
      }

      case 'save_trade': {
        const { error } = await supabase.from('trading_journal').insert([data]);
        if (error) throw error;
        return `✅ Jurnal trading ${data.pair} berhasil diamankan.`;
      }

      case 'save_schedule': {
        const { error } = await supabase.from('schedules').insert([data]);
        if (error) throw error;
        return `✅ Jadwal "${data.title}" telah ditambahkan ke kalender.`;
      }

      case 'save_note': {
        const { error } = await supabase.from('notes').insert([data]);
        if (error) throw error;
        return `✅ Catatan berhasil disimpan.`;
      }

      case 'save_page': {
        const { data: pageData, error: pageError } = await supabase
          .from('pages')
          .insert([{ title: data.title, icon: data.icon || '📄' }])
          .select();
        if (pageError) throw pageError;
        if (pageData?.[0] && data.content) {
          await supabase.from('blocks').insert([{
            page_id: pageData[0].id,
            type: 'document',
            content: data.content,
            position_index: 0
          }]);
        }
        return `✅ Workspace Page "${data.title}" berhasil dibuat.`;
      }

      case 'navigate':
        return `🔗 Menuju ke ${data.path}...`;

      default:
        return `⚠️ Aksi tidak dikenal: ${action}`;
    }
  } catch (err: any) {
    console.error('Action execution error:', err);
    return `❌ Gagal menjalankan aksi: ${err.message}`;
  }
}

export async function POST(req: NextRequest) {
  try {
    const { message, history, imageBase64 } = await req.json();

    // Fetch database context for AI omniscience
    const [tasksRes, inventoryRes, tradingRes, schedulesRes] = await Promise.all([
      supabase.from('task_management').select('*').order('deadline', { ascending: true }).limit(20),
      supabase.from('inventory_hp').select('*').order('created_at', { ascending: false }).limit(20),
      supabase.from('trading_journal').select('*').order('created_at', { ascending: false }).limit(10),
      supabase.from('schedules').select('*').order('scheduled_at', { ascending: true }).limit(20),
    ]);

    const dbContext = {
      active_tasks: tasksRes.data || [],
      inventory: inventoryRes.data || [],
      trading_history: tradingRes.data || [],
      schedules: schedulesRes.data || [],
    };

    const chatHistory = (history || [])
      .map((h: any) => `${h.role === 'user' ? 'User' : 'Assistant'}: ${h.text}`)
      .slice(-10) // Last 10 messages for context
      .join('\n');

    const fullPrompt = `${SYSTEM_PROMPT}\n\n[DATABASE STATE - REALTIME]:\n${JSON.stringify(dbContext, null, 2)}\n\n[CHAT HISTORY]:\n${chatHistory}\n\n[USER COMMAND]: ${message}\n\nAssistant:`;

    // Try multiple Gemini models with fallback
    const modelsToTry = [
      'gemini-1.5-flash-latest',
      'gemini-1.5-pro-latest',
      'gemini-2.0-flash-exp',
    ];

    let aiResponse = '';
    let lastError = null;

    for (const modelName of modelsToTry) {
      const modelUrl = `https://generativelanguage.googleapis.com/v1beta/models/${modelName}:generateContent?key=${GEMINI_API_KEY}`;
      
      const contents: any[] = [{
        role: 'user',
        parts: [{ text: fullPrompt }]
      }];

      if (imageBase64) {
        const match = imageBase64.match(/^data:(.*);base64,(.*)$/);
        if (match) {
          contents[0].parts.push({
            inlineData: { mimeType: match[1], data: match[2] }
          });
        }
      }

      try {
        const response = await fetch(modelUrl, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ contents })
        });

        const data = await response.json();

        if (response.ok) {
          aiResponse = data.candidates?.[0]?.content?.parts?.[0]?.text || '';
          break;
        } else {
          lastError = data.error?.message || `HTTP ${response.status}`;
          if (response.status === 404 || response.status === 503) continue;
          throw new Error(lastError);
        }
      } catch (err: any) {
        lastError = err.message;
      }
    }

    if (!aiResponse) {
      return NextResponse.json({
        response: `Maaf, koneksi neural terganggu: ${lastError}`,
        actions: []
      }, { status: 500 });
    }

    // Extract and execute actions
    const actionResults: string[] = [];
    const actionMatches = aiResponse.matchAll(/<action>([\s\S]*?)<\/action>/gi);
    
    for (const match of actionMatches) {
      try {
        const cleanJson = match[1].replace(/```json/g, '').replace(/```/g, '').trim();
        const parsed = JSON.parse(cleanJson);
        const result = await executeAction(parsed);
        actionResults.push(result);
      } catch (e) {
        console.error('Failed to parse/execute action:', e);
      }
    }

    // Clean response text (remove action tags)
    const cleanText = aiResponse.replace(/<action>[\s\S]*?<\/action>/gi, '').trim();

    // Extract navigation if present
    let navigateTo = null;
    const navMatch = aiResponse.match(/<action>[\s\S]*?"action"\s*:\s*"navigate"[\s\S]*?"path"\s*:\s*"([^"]+)"[\s\S]*?<\/action>/);
    if (navMatch) navigateTo = navMatch[1];

    return NextResponse.json({
      response: cleanText || 'Data telah saya proses.',
      actions: actionResults,
      navigateTo,
    });
  } catch (error: any) {
    console.error('AI API Error:', error);
    return NextResponse.json({
      response: `Error: ${error.message}`,
      actions: []
    }, { status: 500 });
  }
}
