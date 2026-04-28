import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

// Server-side only — API keys NEVER exposed to client
const GEMINI_API_KEY = process.env.NEXT_PUBLIC_GEMINI_API_KEY || '';
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || '',
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''
);

const SYSTEM_PROMPT = `Anda adalah Pawas.ai, asisten neural otonom yang terhubung ke seluruh sistem workspace Muhammad Fawwaz Ali. Anda bertindak sebagai AI Agent yang bisa mengontrol data secara langsung.

Konteks Pengguna:
- Mahasiswa IT UMY Semester 6 (Fokus: Full-stack, Blockchain, Network Security)
- Pebisnis Gadget (Brand: Core Pawas). Website: https://corepawas-hp.vercel.app
- Trader XAUUSD & BTCUSD (Strategi: Market Structure & SMC)
- Lokasi: Kasihan, Bantul, Yogyakarta

SKEMA DATABASE SUPABASE YANG TERSEDIA:
1. tasks (id, title, matkul, deadline, status[pending/completed], created_at)
2. notes (id, title, content, category, icon, created_at)  
3. pages (id, title, icon, user_id, created_at, updated_at)
4. blocks (id, page_id, type, content, position_index)
5. trades (id, pair, entry, result, notes, created_at)
6. inventory (id, unit, buy_price, sell_price, status[ready/sold])

ATURAN WAJIB AKSI SISTEM:
Jika user meminta untuk melakukan aksi apapun, Anda HARUS menyertakan blok JSON di akhir respons dalam tag <action>.

FORMAT AKSI YANG DIDUKUNG:

1. MEMBUAT TASK/DEADLINE:
<action>{"action":"save_task","data":{"title":"Nama Tugas","matkul":"Kategori","deadline":"2026-04-29T12:00:00+07:00"}}</action>

2. MEMBUAT CATATAN:
<action>{"action":"save_note","data":{"title":"Judul","category":"Kategori","content":"Isi markdown..."}}</action>

3. MEMBUAT HALAMAN WORKSPACE:
<action>{"action":"save_page","data":{"title":"Judul Halaman","icon":"📄","content":"Isi halaman..."}}</action>

4. LOG TRADING:
<action>{"action":"save_trade","data":{"pair":"XAUUSD","entry":2340.5,"result":"TP +50 pips","notes":"Breakout structure H4"}}</action>

5. INVENTORY:
<action>{"action":"save_inventory","data":{"unit":"iPhone 15 Pro 256GB","buy_price":15000000,"sell_price":16500000}}</action>

6. HAPUS TASK:
<action>{"action":"delete_task","data":{"id":123}}</action>

7. UPDATE STATUS TASK:
<action>{"action":"update_task","data":{"id":123,"status":"completed"}}</action>

8. NAVIGASI:
<action>{"action":"navigate","data":{"path":"/tasks"}}</action>

CATATAN PENTING:
- Deadline HARUS format ISO 8601 dengan timezone +07:00 (WIB)
- Waktu sekarang: ${new Date().toISOString()}
- Selalu berikan konfirmasi profesional di luar tag <action>
- Respons harus terstruktur rapi menggunakan markdown
- Anda bisa membaca data yang diberikan dalam context untuk memberikan analisis`;

// Execute database actions from AI response
async function executeAction(actionData: any): Promise<string> {
  try {
    const { action, data } = actionData;
    
    switch (action) {
      case 'save_task':
      case 'add_task': {
        const { error } = await supabase.from('tasks').insert([{
          ...data,
          status: data.status || 'pending'
        }]);
        if (error) throw error;
        return `✅ Task "${data.title}" berhasil dibuat`;
      }

      case 'save_note':
      case 'update_notes': {
        const { error } = await supabase.from('notes').insert([{
          title: data.title || 'AI Generated Note',
          category: data.category || 'Personal',
          content: data.content || '',
          icon: data.icon || '🧠'
        }]);
        if (error) throw error;
        return `✅ Note "${data.title}" berhasil disimpan`;
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
        return `✅ Page "${data.title}" berhasil dibuat di Workspace`;
      }

      case 'save_trade':
      case 'log_trade': {
        const { error } = await supabase.from('trades').insert([data]);
        if (error) throw error;
        return `✅ Trade log untuk ${data.pair} berhasil disimpan`;
      }

      case 'save_inventory':
      case 'add_inventory': {
        const { error } = await supabase.from('inventory').insert([{
          ...data,
          status: 'ready'
        }]);
        if (error) throw error;
        return `✅ Inventory "${data.unit}" berhasil ditambahkan`;
      }

      case 'delete_task': {
        const { error } = await supabase.from('tasks').delete().eq('id', data.id);
        if (error) throw error;
        return `✅ Task berhasil dihapus`;
      }

      case 'update_task': {
        const { error } = await supabase.from('tasks').update({ status: data.status }).eq('id', data.id);
        if (error) throw error;
        return `✅ Task status berhasil diupdate ke ${data.status}`;
      }

      case 'navigate':
        return `🔗 Navigate to ${data.path}`;

      default:
        return `⚠️ Unknown action: ${action}`;
    }
  } catch (err: any) {
    console.error('Action execution error:', err);
    return `❌ Gagal: ${err.message}`;
  }
}

export async function POST(req: NextRequest) {
  try {
    const { message, history, imageBase64 } = await req.json();

    // Fetch database context for AI omniscience
    const [tasksRes, notesRes, tradesRes, inventoryRes] = await Promise.all([
      supabase.from('tasks').select('*').order('deadline', { ascending: true }).limit(20),
      supabase.from('notes').select('id, title, category, created_at').order('created_at', { ascending: false }).limit(20),
      supabase.from('trades').select('*').order('id', { ascending: false }).limit(10),
      supabase.from('inventory').select('*').limit(20),
    ]);

    const dbContext = {
      active_tasks: tasksRes.data || [],
      notes_summary: notesRes.data || [],
      recent_trades: tradesRes.data || [],
      inventory: inventoryRes.data || [],
    };

    const chatHistory = (history || [])
      .map((h: any) => `${h.role === 'user' ? 'User' : 'Assistant'}: ${h.text}`)
      .slice(-10) // Last 10 messages for context
      .join('\n');

    const fullPrompt = `${SYSTEM_PROMPT}\n\n[DATABASE STATE - REALTIME]:\n${JSON.stringify(dbContext, null, 2)}\n\n[CHAT HISTORY]:\n${chatHistory}\n\n[USER COMMAND]: ${message}\n\nAssistant:`;

    // Try multiple Gemini models with fallback
    const modelsToTry = [
      'gemini-2.0-flash',
      'gemini-1.5-flash',
      'gemini-1.5-pro',
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
    const navMatch = aiResponse.match(/<action>.*?"action"\s*:\s*"navigate".*?"path"\s*:\s*"([^"]+)".*?<\/action>/s);
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
