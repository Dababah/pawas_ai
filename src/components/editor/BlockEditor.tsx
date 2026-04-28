'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Placeholder from '@tiptap/extension-placeholder';
import TaskList from '@tiptap/extension-task-list';
import TaskItem from '@tiptap/extension-task-item';
import Image from '@tiptap/extension-image';
import { Sparkles, Save, Type, CheckSquare, ImageIcon, Heading1, Heading2, Heading3 } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { GoogleGenerativeAI } from '@google/generative-ai';

// Basic Tiptap Editor Component
export default function BlockEditor({ pageId, initialContent = '' }: { pageId?: string, initialContent?: string }) {
  const [isSaving, setIsSaving] = useState(false);
  const [aiLoading, setAiLoading] = useState(false);

  const editor = useEditor({
    extensions: [
      StarterKit,
      Placeholder.configure({
        placeholder: "Press '/' for commands or start typing...",
      }),
      TaskList,
      TaskItem.configure({
        nested: true,
      }),
      Image,
    ],
    content: initialContent || '',
    editorProps: {
      attributes: {
        class: 'prose prose-invert prose-p:my-2 prose-headings:my-4 prose-h1:text-3xl prose-h2:text-2xl prose-h3:text-xl focus:outline-none min-h-[500px]',
      },
    },
    onUpdate: ({ editor }) => {
      // Auto-save logic can be triggered here (debounced)
      handleAutoSave(editor.getHTML());
    },
  });

  // Debounced save
  useEffect(() => {
    const timer = setTimeout(() => {
      if (editor) {
        saveContent(editor.getHTML());
      }
    }, 2000);
    return () => clearTimeout(timer);
  }, [editor?.getHTML()]);

  const handleAutoSave = useCallback((content: string) => {
    // Only visual indicator here, actual save is in useEffect debounce
    setIsSaving(true);
    setTimeout(() => setIsSaving(false), 1000);
  }, []);

  const saveContent = async (content: string) => {
    if (!pageId) return;
    setIsSaving(true);
    try {
      const { error } = await supabase
        .from('pages')
        .update({ content_html: content })
        .eq('id', pageId);
      
      if (error) console.error('Save error', error);
    } catch (e) {
      console.error(e);
    } finally {
      setIsSaving(false);
    }
  };

  const askAI = async () => {
    if (!editor) return;
    setAiLoading(true);
    try {
      // Call standard Gemini AI to summarize or enhance
      const text = editor.getText();
      if (!text) return;

      const genAI = new GoogleGenerativeAI(process.env.NEXT_PUBLIC_GEMINI_API_KEY || '');
      const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
      
      const prompt = `Please enhance or summarize the following text (if it's about college tasks, summarize it, if it's about trading, suggest a strategy based on it):\n\n${text}`;
      const result = await model.generateContent(prompt);
      const response = await result.response;
      const responseText = response.text();

      // Insert response at the end
      editor.chain().focus().insertContent(`\n\n**AI Assistant:**\n${responseText}`).run();

    } catch (error) {
      console.error('AI Error:', error);
      alert('Failed to connect to AI. Please check API Key.');
    } finally {
      setAiLoading(false);
    }
  };

  if (!editor) return null;

  return (
    <div className="w-full max-w-4xl mx-auto p-4 md:p-8 bg-[#000000] text-white min-h-screen font-inter">
      {/* Top Toolbar */}
      <div className="sticky top-0 z-10 flex flex-wrap gap-2 items-center justify-between bg-black/80 backdrop-blur-md p-3 border-b border-white/10 rounded-t-xl mb-4">
        <div className="flex gap-2">
          <button onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()} className={`p-2 rounded-lg hover:bg-white/10 transition-colors ${editor.isActive('heading', { level: 1 }) ? 'bg-white/20' : ''}`} title="Heading 1"><Heading1 size={18} /></button>
          <button onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()} className={`p-2 rounded-lg hover:bg-white/10 transition-colors ${editor.isActive('heading', { level: 2 }) ? 'bg-white/20' : ''}`} title="Heading 2"><Heading2 size={18} /></button>
          <button onClick={() => editor.chain().focus().toggleBold().run()} className={`p-2 font-bold rounded-lg hover:bg-white/10 transition-colors ${editor.isActive('bold') ? 'bg-white/20' : ''}`} title="Bold">B</button>
          <button onClick={() => editor.chain().focus().toggleItalic().run()} className={`p-2 italic rounded-lg hover:bg-white/10 transition-colors ${editor.isActive('italic') ? 'bg-white/20' : ''}`} title="Italic">I</button>
          <div className="w-px h-6 bg-white/20 mx-1 self-center" />
          <button onClick={() => editor.chain().focus().toggleTaskList().run()} className={`p-2 rounded-lg hover:bg-white/10 transition-colors ${editor.isActive('taskList') ? 'bg-white/20' : ''}`} title="Todo List"><CheckSquare size={18} /></button>
          <button onClick={() => {
            const url = window.prompt('Image URL');
            if (url) {
              editor.chain().focus().setImage({ src: url }).run();
            }
          }} className="p-2 rounded-lg hover:bg-white/10 transition-colors" title="Image"><ImageIcon size={18} /></button>
        </div>
        
        <div className="flex items-center gap-3">
          <span className="text-xs text-gray-400 flex items-center gap-1">
            <Save size={14} /> {isSaving ? 'Saving...' : 'Saved'}
          </span>
          <button 
            onClick={askAI}
            disabled={aiLoading}
            className="flex items-center gap-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white px-3 py-1.5 rounded-lg text-sm font-medium transition-all"
          >
            <Sparkles size={16} />
            {aiLoading ? 'Thinking...' : 'Ask AI'}
          </button>
        </div>
      </div>

      {/* Editor Canvas */}
      <div className="editor-canvas prose prose-invert max-w-none">
        <EditorContent editor={editor} />
      </div>
      
      <style dangerouslySetInnerHTML={{__html: `
        .ProseMirror p.is-editor-empty:first-child::before {
          color: #6b7280;
          content: attr(data-placeholder);
          float: left;
          height: 0;
          pointer-events: none;
        }
        .ProseMirror ul[data-type="taskList"] {
          list-style: none;
          padding: 0;
        }
        .ProseMirror ul[data-type="taskList"] p {
          margin: 0;
        }
        .ProseMirror ul[data-type="taskList"] li {
          display: flex;
        }
        .ProseMirror ul[data-type="taskList"] li > label {
          flex: 0 0 auto;
          margin-right: 0.5rem;
          user-select: none;
        }
        .ProseMirror ul[data-type="taskList"] li > div {
          flex: 1 1 auto;
        }
      `}} />
    </div>
  );
}
