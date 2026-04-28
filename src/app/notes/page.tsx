'use client';

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Placeholder from '@tiptap/extension-placeholder';
import TaskList from '@tiptap/extension-task-list';
import TaskItem from '@tiptap/extension-task-item';
import Image from '@tiptap/extension-image';
import { Plus, MoreHorizontal, FileText, ChevronRight, Hash, Type, List, CheckSquare, Image as ImageIcon, Trash2, ArrowLeft, Save, Loader2, Bold, Italic, Strikethrough } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { motion, AnimatePresence } from 'framer-motion';

// ─── Debounce Hook ─────────────────────────────────────────────────
function useDebounce(callback: Function, delay: number) {
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  return useCallback((...args: any[]) => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    timeoutRef.current = setTimeout(() => callback(...args), delay);
  }, [callback, delay]);
}

// ─── Main Page Component ───────────────────────────────────────────
export default function AppFlowyWorkspace() {
  const [pages, setPages] = useState<any[]>([]);
  const [activePage, setActivePage] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => { fetchPages(); }, []);

  const fetchPages = async () => {
    setLoading(true);
    const { data, error } = await supabase.from('pages').select('*').order('updated_at', { ascending: false });
    if (data) setPages(data);
    else console.error(error);
    setLoading(false);
  };

  const createNewPage = async () => {
    const { data: userData } = await supabase.auth.getUser();
    const newPage = { title: '', icon: '📄', user_id: userData?.user?.id || null };
    const { data, error } = await supabase.from('pages').insert([newPage]).select();
    if (data && data[0]) {
      setPages([data[0], ...pages]);
      openPage(data[0]);
    } else {
      console.error("Failed to create page:", error);
      const mockPage = { id: `mock-${Date.now()}`, title: '', icon: '📄', content: null };
      setPages([mockPage, ...pages]);
      openPage(mockPage);
    }
  };

  const openPage = async (page: any) => {
    setLoading(true);
    const { data: blocks } = await supabase
      .from('blocks')
      .select('*')
      .eq('page_id', page.id)
      .order('position_index', { ascending: true });

    let content: any = '';
    if (blocks && blocks.length > 0 && blocks[0]?.content) {
      const c = blocks[0].content;
      // content stored as TipTap JSON in JSONB column
      content = typeof c === 'string' ? c : c;
    }
    setActivePage({ ...page, content });
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
    await supabase.from('pages').update({ title }).eq('id', activePage.id);
  };

  const saveContent = async (htmlContent: string, jsonContent: any) => {
    if (!activePage) return;
    setSaving(true);

    const { data: existingBlocks } = await supabase
      .from('blocks')
      .select('id')
      .eq('page_id', activePage.id)
      .eq('position_index', 0);

    const blockData = {
      page_id: activePage.id,
      type: 'document',
      content: jsonContent,
      position_index: 0,
    };

    if (existingBlocks && existingBlocks.length > 0) {
      await supabase.from('blocks').update(blockData).eq('id', existingBlocks[0].id);
    } else {
      await supabase.from('blocks').insert([blockData]);
    }
    setSaving(false);
  };

  const debouncedSave = useDebounce(saveContent, 1200);

  return (
    <div className="flex h-[calc(100vh-8rem)] bg-[#0A0A0A] border border-white/5 rounded-2xl overflow-hidden shadow-2xl font-inter">
      {/* ── Left Panel: Page List ──────────────────────────────── */}
      <aside className={`w-64 shrink-0 bg-[#111111] border-r border-white/5 flex flex-col transition-all ${activePage ? 'hidden md:flex' : 'flex w-full md:w-64'}`}>
        <div className="p-4 flex items-center justify-between border-b border-white/5">
          <span className="text-xs font-bold text-zinc-400 uppercase tracking-widest">Workspace</span>
          <button onClick={createNewPage} className="p-1.5 text-zinc-400 hover:text-white hover:bg-white/10 rounded-lg transition-colors" title="New page">
            <Plus size={16} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-2 space-y-1 custom-scrollbar">
          {loading && pages.length === 0 ? (
            <div className="flex justify-center p-8"><Loader2 className="animate-spin text-zinc-600" size={20} /></div>
          ) : pages.length === 0 ? (
            <div className="text-center py-12 px-4">
              <FileText className="mx-auto mb-3 text-zinc-700" size={28} />
              <p className="text-xs text-zinc-600">No pages yet. Create one!</p>
            </div>
          ) : (
            pages.map(page => (
              <div
                key={page.id}
                onClick={() => openPage(page)}
                className={`group flex items-center justify-between p-2.5 rounded-xl cursor-pointer transition-all ${activePage?.id === page.id ? 'bg-white/10 text-white' : 'text-zinc-400 hover:bg-white/5 hover:text-zinc-200'}`}
              >
                <div className="flex items-center gap-3 overflow-hidden min-w-0">
                  <span className="text-base leading-none shrink-0">{page.icon || '📄'}</span>
                  <span className="text-sm font-medium truncate">{page.title || 'Untitled'}</span>
                </div>
                <button onClick={(e) => deletePage(page.id, e)} className="opacity-0 group-hover:opacity-100 p-1 hover:bg-red-500/20 hover:text-red-400 rounded transition-all shrink-0">
                  <Trash2 size={14} />
                </button>
              </div>
            ))
          )}
        </div>
      </aside>

      {/* ── Right Panel: Editor ────────────────────────────────── */}
      <div className={`flex-1 flex flex-col bg-[#0A0A0A] relative overflow-hidden ${!activePage ? 'hidden md:flex' : 'flex'}`}>
        {activePage ? (
          <>
            {/* Breadcrumb Header */}
            <div className="h-12 border-b border-white/5 flex items-center justify-between px-4 sm:px-6 bg-[#0A0A0A]/80 backdrop-blur-md z-10 shrink-0">
              <div className="flex items-center gap-2 min-w-0">
                <button onClick={() => setActivePage(null)} className="md:hidden p-1.5 text-zinc-400 hover:text-white shrink-0">
                  <ArrowLeft size={16} />
                </button>
                <div className="text-xs text-zinc-500 font-medium flex items-center gap-1.5 truncate">
                  <span>Workspace</span>
                  <ChevronRight size={10} className="shrink-0" />
                  <span className="text-zinc-300 truncate">{activePage.title || 'Untitled'}</span>
                </div>
              </div>
              <div className="flex items-center gap-3 text-xs text-zinc-500 shrink-0">
                {saving ? (
                  <span className="flex items-center gap-1.5"><Loader2 size={11} className="animate-spin" /> Saving...</span>
                ) : (
                  <span className="flex items-center gap-1.5 text-zinc-600"><Save size={11} /> Saved</span>
                )}
              </div>
            </div>

            {/* Editor Canvas */}
            <div className="flex-1 overflow-y-auto custom-scrollbar">
              <div className="max-w-3xl mx-auto px-6 py-12 md:py-16">
                {/* Page Icon */}
                <div className="text-5xl mb-3 cursor-pointer hover:opacity-80 transition-opacity w-fit">
                  {activePage.icon || '📄'}
                </div>

                {/* Page Title */}
                <input
                  type="text"
                  value={activePage.title}
                  onChange={(e) => updatePageTitle(e.target.value)}
                  placeholder="Untitled"
                  className="w-full bg-transparent border-none outline-none text-4xl md:text-[2.75rem] font-black text-white font-outfit placeholder:text-zinc-700 mb-8 leading-tight"
                />

                {/* TipTap Editor */}
                <TiptapEditor
                  initialContent={activePage.content}
                  onChange={(html, json) => debouncedSave(html, json)}
                />
              </div>
            </div>
          </>
        ) : (
          /* Empty State */
          <div className="flex-1 flex flex-col items-center justify-center text-center p-8">
            <div className="w-16 h-16 bg-white/5 rounded-2xl flex items-center justify-center mb-5 border border-white/10">
              <FileText size={28} className="text-zinc-600" />
            </div>
            <h2 className="text-lg font-bold text-white font-outfit mb-2">Neural Workspace</h2>
            <p className="text-sm text-zinc-500 max-w-xs mb-6">Create a new page to start documenting your thoughts.</p>
            <button onClick={createNewPage} className="flex items-center gap-2 px-5 py-2.5 bg-white text-black rounded-xl text-sm font-bold hover:bg-zinc-200 transition-all shadow-xl shadow-white/10">
              <Plus size={16} /> New Page
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Slash Command Menu Data ───────────────────────────────────────
const SLASH_COMMANDS = [
  { label: 'Text', description: 'Just start writing', icon: <Type size={16} />, command: 'paragraph' },
  { label: 'Heading 1', description: 'Big section heading', icon: <Hash size={18} />, command: 'h1' },
  { label: 'Heading 2', description: 'Medium heading', icon: <Hash size={15} />, command: 'h2' },
  { label: 'Heading 3', description: 'Small heading', icon: <Hash size={13} />, command: 'h3' },
  { label: 'Bullet List', description: 'Simple bullet list', icon: <List size={16} />, command: 'bulletList' },
  { label: 'To-do List', description: 'Track tasks with checkboxes', icon: <CheckSquare size={16} />, command: 'taskList' },
  { label: 'Image', description: 'Embed an image from URL', icon: <ImageIcon size={16} />, command: 'image' },
  { label: 'Divider', description: 'Visual separator', icon: <MoreHorizontal size={16} />, command: 'divider' },
];

// ─── TipTap Editor Sub-component ───────────────────────────────────
function TiptapEditor({ initialContent, onChange }: { initialContent: any; onChange: (html: string, json: any) => void }) {
  const [slashMenu, setSlashMenu] = useState<{ show: boolean; x: number; y: number; filter: string }>({ show: false, x: 0, y: 0, filter: '' });
  const [selectionMenu, setSelectionMenu] = useState<{ show: boolean; x: number; y: number }>({ show: false, x: 0, y: 0 });
  const slashRef = useRef<HTMLDivElement>(null);

  const editor = useEditor({
    extensions: [
      StarterKit,
      Placeholder.configure({
        placeholder: "Type '/' for commands, or just start writing...",
        emptyEditorClass: 'is-editor-empty',
      }),
      TaskList,
      TaskItem.configure({ nested: true }),
      Image,
    ],
    content: initialContent && typeof initialContent === 'object' ? initialContent : (initialContent || ''),
    editorProps: {
      attributes: {
        class: 'prose prose-invert prose-p:my-2 prose-p:leading-relaxed prose-headings:my-4 prose-h1:text-3xl prose-h1:font-bold prose-h2:text-2xl prose-h2:font-semibold prose-h3:text-xl prose-li:my-1 prose-hr:border-white/10 focus:outline-none min-h-[400px] w-full max-w-none text-zinc-300',
      },
      handleKeyDown: (view, event) => {
        if (event.key === '/' && !slashMenu.show) {
          // Show slash menu at cursor position after a tiny delay
          setTimeout(() => {
            const { from } = view.state.selection;
            const coords = view.coordsAtPos(from);
            setSlashMenu({ show: true, x: coords.left, y: coords.bottom + 8, filter: '' });
          }, 10);
        }
        if (event.key === 'Escape') {
          setSlashMenu(s => ({ ...s, show: false }));
          setSelectionMenu(s => ({ ...s, show: false }));
        }
        return false;
      },
    },
    onUpdate: ({ editor }) => {
      onChange(editor.getHTML(), editor.getJSON());
    },
    onSelectionUpdate: ({ editor }) => {
      const { from, to } = editor.state.selection;
      if (to - from > 0) {
        // Text is selected — show formatting bar
        const coords = editor.view.coordsAtPos(from);
        setSelectionMenu({ show: true, x: coords.left, y: coords.top - 48 });
      } else {
        setSelectionMenu(s => ({ ...s, show: false }));
      }
    },
  });

  // Close slash menu on click outside
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (slashRef.current && !slashRef.current.contains(e.target as Node)) {
        setSlashMenu(s => ({ ...s, show: false }));
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const executeSlashCommand = (cmd: string) => {
    if (!editor) return;

    // Delete the '/' character that was typed
    const { from } = editor.state.selection;
    editor.chain().focus().deleteRange({ from: from - 1, to: from }).run();

    switch (cmd) {
      case 'paragraph': editor.chain().focus().setParagraph().run(); break;
      case 'h1': editor.chain().focus().toggleHeading({ level: 1 }).run(); break;
      case 'h2': editor.chain().focus().toggleHeading({ level: 2 }).run(); break;
      case 'h3': editor.chain().focus().toggleHeading({ level: 3 }).run(); break;
      case 'bulletList': editor.chain().focus().toggleBulletList().run(); break;
      case 'taskList': editor.chain().focus().toggleTaskList().run(); break;
      case 'divider': editor.chain().focus().setHorizontalRule().run(); break;
      case 'image': {
        const url = window.prompt('Image URL');
        if (url) editor.chain().focus().setImage({ src: url }).run();
        break;
      }
    }
    setSlashMenu(s => ({ ...s, show: false }));
  };

  if (!editor) return null;

  const filteredCommands = SLASH_COMMANDS.filter(c => c.label.toLowerCase().includes(slashMenu.filter.toLowerCase()));

  return (
    <div className="relative">
      <EditorContent editor={editor} />

      {/* ── Slash Command Menu ────────────────────────────── */}
      <AnimatePresence>
        {slashMenu.show && (
          <motion.div
            ref={slashRef}
            initial={{ opacity: 0, y: 4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 4 }}
            transition={{ duration: 0.12 }}
            className="fixed z-50 w-64 bg-[#161616] border border-white/10 rounded-xl shadow-2xl shadow-black/60 overflow-hidden"
            style={{ top: slashMenu.y, left: Math.min(slashMenu.x, window.innerWidth - 280) }}
          >
            <div className="p-2 border-b border-white/5">
              <p className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest px-2">Blocks</p>
            </div>
            <div className="p-1 max-h-64 overflow-y-auto custom-scrollbar">
              {filteredCommands.map((item, idx) => (
                <button
                  key={idx}
                  onClick={() => executeSlashCommand(item.command)}
                  className="w-full flex items-center gap-3 p-2.5 hover:bg-white/5 rounded-lg text-left transition-colors"
                >
                  <div className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center text-zinc-400 shrink-0">
                    {item.icon}
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-zinc-200">{item.label}</p>
                    <p className="text-[10px] text-zinc-600 truncate">{item.description}</p>
                  </div>
                </button>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Selection Formatting Toolbar ──────────────────── */}
      <AnimatePresence>
        {selectionMenu.show && (
          <motion.div
            initial={{ opacity: 0, y: 4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 4 }}
            transition={{ duration: 0.1 }}
            className="fixed z-50 flex bg-[#1A1A1A] border border-white/10 rounded-xl shadow-2xl shadow-black/60 overflow-hidden"
            style={{ top: Math.max(selectionMenu.y, 8), left: selectionMenu.x }}
          >
            <button onClick={() => editor.chain().focus().toggleBold().run()} className={`px-3 py-2 hover:bg-white/10 transition-colors ${editor.isActive('bold') ? 'bg-white/15 text-white' : 'text-zinc-400'}`} title="Bold">
              <Bold size={14} />
            </button>
            <button onClick={() => editor.chain().focus().toggleItalic().run()} className={`px-3 py-2 hover:bg-white/10 transition-colors ${editor.isActive('italic') ? 'bg-white/15 text-white' : 'text-zinc-400'}`} title="Italic">
              <Italic size={14} />
            </button>
            <button onClick={() => editor.chain().focus().toggleStrike().run()} className={`px-3 py-2 hover:bg-white/10 transition-colors ${editor.isActive('strike') ? 'bg-white/15 text-white' : 'text-zinc-400'}`} title="Strikethrough">
              <Strikethrough size={14} />
            </button>
            <div className="w-px bg-white/10 my-1" />
            <button onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()} className={`px-3 py-2 text-xs font-bold hover:bg-white/10 transition-colors ${editor.isActive('heading', { level: 2 }) ? 'bg-white/15 text-white' : 'text-zinc-400'}`} title="Heading 2">
              H2
            </button>
            <button onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()} className={`px-3 py-2 text-xs font-bold hover:bg-white/10 transition-colors ${editor.isActive('heading', { level: 3 }) ? 'bg-white/15 text-white' : 'text-zinc-400'}`} title="Heading 3">
              H3
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Editor Styles ────────────────────────────────── */}
      <style dangerouslySetInnerHTML={{__html: `
        .is-editor-empty:first-child::before {
          color: #3f3f46;
          content: attr(data-placeholder);
          float: left;
          height: 0;
          pointer-events: none;
        }
        .ProseMirror ul[data-type="taskList"] {
          list-style: none;
          padding: 0;
        }
        .ProseMirror ul[data-type="taskList"] li {
          display: flex;
          align-items: flex-start;
          gap: 0.5rem;
          margin: 0.25rem 0;
        }
        .ProseMirror ul[data-type="taskList"] li > label {
          margin-top: 0.25rem;
          user-select: none;
        }
        .ProseMirror ul[data-type="taskList"] li > label input[type="checkbox"] {
          appearance: none;
          width: 1rem;
          height: 1rem;
          border: 2px solid #52525b;
          border-radius: 4px;
          cursor: pointer;
          transition: all 0.15s;
        }
        .ProseMirror ul[data-type="taskList"] li > label input[type="checkbox"]:checked {
          background: #8c7851;
          border-color: #8c7851;
        }
        .ProseMirror ul[data-type="taskList"] li > div {
          flex: 1;
        }
        .ProseMirror img {
          border-radius: 12px;
          margin: 1rem 0;
          max-width: 100%;
        }
        .ProseMirror hr {
          border-color: rgba(255,255,255,0.08);
          margin: 1.5rem 0;
        }
      `}} />
    </div>
  );
}
