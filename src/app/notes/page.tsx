'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useEditor, EditorContent, FloatingMenu, BubbleMenu } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Placeholder from '@tiptap/extension-placeholder';
import TaskList from '@tiptap/extension-task-list';
import TaskItem from '@tiptap/extension-task-item';
import Image from '@tiptap/extension-image';
import { Plus, MoreHorizontal, FileText, ChevronRight, Hash, Type, List, CheckSquare, Image as ImageIcon, Sparkles, Trash2, ArrowLeft, Save, Loader2 } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { motion, AnimatePresence } from 'framer-motion';

// Helper to debounce auto-save
function useDebounce(callback: Function, delay: number) {
  const timeoutRef = React.useRef<NodeJS.Timeout | null>(null);
  return useCallback((...args: any[]) => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    timeoutRef.current = setTimeout(() => callback(...args), delay);
  }, [callback, delay]);
}

export default function AppFlowyWorkspace() {
  const [pages, setPages] = useState<any[]>([]);
  const [activePage, setActivePage] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchPages();
  }, []);

  const fetchPages = async () => {
    setLoading(true);
    // Fetch from the new 'pages' table
    const { data, error } = await supabase.from('pages').select('*').order('updated_at', { ascending: false });
    if (data) {
      setPages(data);
    } else {
      console.error(error);
    }
    setLoading(false);
  };

  const createNewPage = async () => {
    const { data: userData } = await supabase.auth.getUser();
    const newPage = {
      title: '',
      icon: '📄',
      user_id: userData?.user?.id || null, // Will use authenticated user if RLS is on
    };
    
    // Fallback if auth isn't strict yet
    const { data, error } = await supabase.from('pages').insert([newPage]).select();
    if (data && data[0]) {
      setPages([data[0], ...pages]);
      openPage(data[0]);
    } else {
      console.error("Failed to create page:", error);
      // Mock for UI preview if DB fails due to RLS
      const mockPage = { id: Date.now().toString(), title: '', icon: '📄', content: null };
      setPages([mockPage, ...pages]);
      openPage(mockPage);
    }
  };

  const openPage = async (page: any) => {
    setLoading(true);
    // Fetch blocks for this page
    const { data: blocks } = await supabase.from('blocks').select('*').eq('page_id', page.id).order('position_index', { ascending: true });
    
    let contentHtml = '';
    if (blocks && blocks.length > 0) {
      // Reconstruct HTML from blocks if stored that way, or we can just store the full JSON in the first block for simplicity
      // To mimic AppFlowy reliably, let's assume the entire document JSON is stored in the 'content' of a single block for now, 
      // or we construct it.
      if (blocks[0] && blocks[0].content) {
        contentHtml = typeof blocks[0].content === 'string' ? blocks[0].content : JSON.stringify(blocks[0].content);
      }
    }
    
    setActivePage({ ...page, content: contentHtml });
    setLoading(false);
  };

  const deletePage = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (confirm('Delete this page permanently?')) {
      await supabase.from('pages').delete().eq('id', id);
      setPages(pages.filter(p => p.id !== id));
      if (activePage?.id === id) setActivePage(null);
    }
  };

  const updatePageTitle = async (title: string) => {
    if (!activePage) return;
    setActivePage({ ...activePage, title });
    setPages(pages.map(p => p.id === activePage.id ? { ...p, title } : p));
    await supabase.from('pages').update({ title, updated_at: new Date().toISOString() }).eq('id', activePage.id);
  };

  const saveContent = async (htmlContent: string, jsonContent: any) => {
    if (!activePage) return;
    setSaving(true);
    
    // In a true block editor, we'd sync individual rows to `blocks`. 
    // For this AppFlowy clone, we will serialize the document into the `blocks` table as a single root block to ensure perfect state retention,
    // or store it in `pages` if we added a column. Since we only have `blocks`, we'll upsert block index 0.
    
    const { data: existingBlocks } = await supabase.from('blocks').select('id').eq('page_id', activePage.id).eq('position_index', 0);
    
    const blockData = {
      page_id: activePage.id,
      type: 'document',
      content: jsonContent, // Storing TipTap JSON directly in JSONB
      position_index: 0
    };

    if (existingBlocks && existingBlocks.length > 0) {
      await supabase.from('blocks').update(blockData).eq('id', existingBlocks[0].id);
    } else {
      await supabase.from('blocks').insert([blockData]);
    }
    
    await supabase.from('pages').update({ updated_at: new Date().toISOString() }).eq('id', activePage.id);
    setSaving(false);
  };

  const debouncedSave = useDebounce(saveContent, 1000);

  return (
    <div className="flex h-[calc(100vh-8rem)] bg-[#0A0A0A] border border-white/5 rounded-2xl overflow-hidden shadow-2xl font-inter">
      {/* Inner Sidebar - AppFlowy Style */}
      <div className={`w-64 bg-[#111111] border-r border-white/5 flex flex-col transition-all ${activePage ? 'hidden md:flex' : 'flex'}`}>
        <div className="p-4 flex items-center justify-between border-b border-white/5">
          <span className="text-xs font-bold text-zinc-400 uppercase tracking-widest">Workspace</span>
          <button onClick={createNewPage} className="p-1.5 text-zinc-400 hover:text-white hover:bg-white/10 rounded-lg transition-colors">
            <Plus size={16} />
          </button>
        </div>
        
        <div className="flex-1 overflow-y-auto p-2 space-y-1 custom-scrollbar">
          {loading && pages.length === 0 ? (
            <div className="flex justify-center p-4"><Loader2 className="animate-spin text-zinc-600" size={20} /></div>
          ) : pages.length === 0 ? (
            <div className="text-center p-4 text-xs text-zinc-600">No pages yet. Create one!</div>
          ) : (
            pages.map(page => (
              <div 
                key={page.id} 
                onClick={() => openPage(page)}
                className={`group flex items-center justify-between p-2 rounded-xl cursor-pointer transition-all ${activePage?.id === page.id ? 'bg-white/10 text-white' : 'text-zinc-400 hover:bg-white/5 hover:text-zinc-200'}`}
              >
                <div className="flex items-center gap-3 overflow-hidden">
                  <span className="text-lg leading-none">{page.icon || '📄'}</span>
                  <span className="text-sm font-medium truncate">{page.title || 'Untitled'}</span>
                </div>
                <button onClick={(e) => deletePage(page.id, e)} className="opacity-0 group-hover:opacity-100 p-1 hover:bg-red-500/20 hover:text-red-400 rounded transition-all">
                  <Trash2 size={14} />
                </button>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Editor Main Area */}
      <div className="flex-1 flex flex-col bg-[#0A0A0A] relative overflow-hidden">
        {activePage ? (
          <>
            <div className="h-14 border-b border-white/5 flex items-center justify-between px-4 sm:px-8 bg-[#0A0A0A]/80 backdrop-blur-md z-10 sticky top-0">
              <div className="flex items-center gap-2">
                <button onClick={() => setActivePage(null)} className="md:hidden p-2 text-zinc-400 hover:text-white">
                  <ArrowLeft size={18} />
                </button>
                <div className="text-xs text-zinc-500 font-medium flex items-center gap-2">
                  <span>Workspace</span> <ChevronRight size={12} /> <span className="text-zinc-300">{activePage.title || 'Untitled'}</span>
                </div>
              </div>
              <div className="flex items-center gap-4 text-xs text-zinc-500">
                {saving ? (
                  <span className="flex items-center gap-2"><Loader2 size={12} className="animate-spin" /> Saving...</span>
                ) : (
                  <span className="flex items-center gap-2"><Save size={12} /> Saved to Database</span>
                )}
                <button className="p-2 hover:bg-white/10 rounded-lg transition-colors"><MoreHorizontal size={16} /></button>
              </div>
            </div>
            
            <div className="flex-1 overflow-y-auto custom-scrollbar relative">
              <div className="max-w-3xl mx-auto px-6 py-12 md:py-20">
                {/* Page Icon & Title */}
                <div className="group relative mb-8">
                  <div className="text-6xl mb-4 cursor-pointer hover:opacity-80 transition-opacity w-fit relative">
                    {activePage.icon || '📄'}
                  </div>
                  <input
                    type="text"
                    value={activePage.title}
                    onChange={(e) => updatePageTitle(e.target.value)}
                    placeholder="Untitled"
                    className="w-full bg-transparent border-none outline-none text-4xl md:text-5xl font-black text-white font-outfit placeholder:text-zinc-700 resize-none"
                  />
                </div>

                {/* Tiptap Editor */}
                <TiptapEditor 
                  initialContent={activePage.content} 
                  onChange={(html, json) => debouncedSave(html, json)} 
                />
              </div>
            </div>
          </>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center text-center p-8">
            <div className="w-20 h-20 bg-white/5 rounded-3xl flex items-center justify-center mb-6 border border-white/10 shadow-2xl">
              <FileText size={32} className="text-zinc-600" />
            </div>
            <h2 className="text-xl font-bold text-white font-outfit mb-2">Neural Workspace</h2>
            <p className="text-sm text-zinc-500 max-w-sm mb-8">Create a new page to start documenting your thoughts, algorithms, and business plans in a truly professional environment.</p>
            <button onClick={createNewPage} className="flex items-center gap-2 px-6 py-3 bg-white text-black rounded-xl text-sm font-bold hover:bg-zinc-200 transition-all shadow-xl shadow-white/10">
              <Plus size={18} /> Create New Page
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

// Sub-component for the Editor to keep it clean
function TiptapEditor({ initialContent, onChange }: { initialContent: any, onChange: (html: string, json: any) => void }) {
  const editor = useEditor({
    extensions: [
      StarterKit,
      Placeholder.configure({
        placeholder: "Type '/' for commands",
        emptyEditorClass: 'is-editor-empty',
      }),
      TaskList,
      TaskItem.configure({ nested: true }),
      Image,
    ],
    content: initialContent && typeof initialContent === 'object' ? initialContent : (initialContent || ''),
    editorProps: {
      attributes: {
        class: 'prose prose-invert prose-p:my-2 prose-p:leading-relaxed prose-headings:my-4 prose-h1:text-3xl prose-h1:font-bold prose-h2:text-2xl prose-h2:font-bold prose-h3:text-xl prose-li:my-1 focus:outline-none min-h-[400px] w-full max-w-none text-zinc-300',
      },
    },
    onUpdate: ({ editor }) => {
      onChange(editor.getHTML(), editor.getJSON());
    },
  });

  if (!editor) return null;

  return (
    <div className="relative">
      {/* Floating Menu (appears on empty lines) */}
      <FloatingMenu editor={editor} tippyOptions={{ duration: 100 }} className="flex gap-1 bg-[#1A1A1A] border border-white/10 p-1 rounded-xl shadow-2xl">
        <button onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()} className="p-2 text-zinc-400 hover:text-white hover:bg-white/10 rounded-lg"><Hash size={16}/></button>
        <button onClick={() => editor.chain().focus().toggleTaskList().run()} className="p-2 text-zinc-400 hover:text-white hover:bg-white/10 rounded-lg"><CheckSquare size={16}/></button>
        <button onClick={() => editor.chain().focus().toggleBulletList().run()} className="p-2 text-zinc-400 hover:text-white hover:bg-white/10 rounded-lg"><List size={16}/></button>
        <div className="w-px h-6 bg-white/10 mx-1 self-center" />
        <button onClick={() => {
          const url = window.prompt('Image URL (e.g. https://...)');
          if (url) editor.chain().focus().setImage({ src: url }).run();
        }} className="p-2 text-zinc-400 hover:text-white hover:bg-white/10 rounded-lg"><ImageIcon size={16}/></button>
      </FloatingMenu>

      {/* Bubble Menu (appears on selection) */}
      <BubbleMenu editor={editor} tippyOptions={{ duration: 100 }} className="flex overflow-hidden bg-[#1A1A1A] border border-white/10 rounded-xl shadow-2xl">
        <button onClick={() => editor.chain().focus().toggleBold().run()} className={`px-3 py-2 text-sm font-bold hover:bg-white/10 ${editor.isActive('bold') ? 'bg-white/20 text-white' : 'text-zinc-400'}`}>B</button>
        <button onClick={() => editor.chain().focus().toggleItalic().run()} className={`px-3 py-2 text-sm italic hover:bg-white/10 ${editor.isActive('italic') ? 'bg-white/20 text-white' : 'text-zinc-400'}`}>I</button>
        <button onClick={() => editor.chain().focus().toggleStrike().run()} className={`px-3 py-2 text-sm line-through hover:bg-white/10 ${editor.isActive('strike') ? 'bg-white/20 text-white' : 'text-zinc-400'}`}>S</button>
        <div className="w-px bg-white/10" />
        <button onClick={() => editor.chain().focus().setParagraph().run()} className="px-3 py-2 text-zinc-400 hover:text-white hover:bg-white/10"><Type size={14}/></button>
        <button onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()} className="px-3 py-2 text-zinc-400 hover:text-white hover:bg-white/10 font-bold">H2</button>
      </BubbleMenu>

      <EditorContent editor={editor} />
      
      {/* Tiptap specific styling */}
      <style dangerouslySetInnerHTML={{__html: `
        .is-editor-empty:first-child::before {
          color: #52525b;
          content: attr(data-placeholder);
          float: left;
          height: 0;
          pointer-events: none;
        }
        ul[data-type="taskList"] {
          list-style: none;
          padding: 0;
        }
        ul[data-type="taskList"] li {
          display: flex;
          align-items: flex-start;
          gap: 0.5rem;
        }
        ul[data-type="taskList"] li > label {
          margin-top: 0.2rem;
          user-select: none;
        }
        ul[data-type="taskList"] li > div {
          flex: 1;
        }
      `}} />
    </div>
  );
}
