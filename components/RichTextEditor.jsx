'use client';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import { Underline } from '@tiptap/extension-underline';
import { TextStyle, FontSize } from '@tiptap/extension-text-style';
import { Color } from '@tiptap/extension-color';
import { Highlight } from '@tiptap/extension-highlight';
import { TextAlign } from '@tiptap/extension-text-align';
import { Image } from '@tiptap/extension-image';
import { Link } from '@tiptap/extension-link';
import { useCallback, useRef } from 'react';

const COLORS = [
  '#1e293b', '#475569', '#94a3b8', // grises
  '#0f172a', '#1d4ed8', '#0284c7', // azules
  '#15803d', '#65a30d', '#ca8a04', // verdes/amarillo
  '#dc2626', '#9333ea', '#db2777', // rojo/morado/rosa
];

const FONTS = [
  { label: 'Normal', value: '' },
  { label: 'Grande', value: '1.25em' },
  { label: 'Título', value: '1.75em' },
  { label: 'Pequeño', value: '0.85em' },
];

function ToolbarBtn({ onClick, active, title, children, className = '' }) {
  return (
    <button
      type="button"
      onMouseDown={(e) => { e.preventDefault(); onClick(); }}
      title={title}
      className={`rounded px-2 py-1 text-sm transition-colors ${
        active
          ? 'bg-brand-600 text-white'
          : 'text-slate-700 hover:bg-slate-100'
      } ${className}`}
    >
      {children}
    </button>
  );
}

function Divider() {
  return <div className="h-5 w-px bg-slate-200 mx-1" />;
}

export default function RichTextEditor({ content, onChange, placeholder }) {
  const fileRef = useRef(null);

  const editor = useEditor({
    extensions: [
      StarterKit.configure({ heading: { levels: [1, 2, 3] } }),
      Underline,
      TextStyle,
      FontSize,
      Color,
      Highlight.configure({ multicolor: true }),
      TextAlign.configure({ types: ['heading', 'paragraph'] }),
      Image.configure({ inline: false, allowBase64: false }),
      Link.configure({ openOnClick: false }),
    ],
    content: content || '',
    editorProps: {
      attributes: {
        class: 'prose prose-slate max-w-none min-h-[300px] p-4 outline-none focus:outline-none',
      },
    },
    onUpdate: ({ editor }) => onChange?.(editor.getHTML()),
  });

  const uploadImage = useCallback(async (file) => {
    const fd = new FormData();
    fd.append('file', file);
    const res = await fetch('/api/upload/image', { method: 'POST', body: fd });
    if (!res.ok) { alert('Error al subir imagen'); return; }
    const { url } = await res.json();
    editor?.chain().focus().setImage({ src: url }).run();
  }, [editor]);

  const handleFileChange = useCallback((e) => {
    const file = e.target.files?.[0];
    if (file) uploadImage(file);
    e.target.value = '';
  }, [uploadImage]);

  if (!editor) return null;

  const setFontSize = (size) => {
    if (!size) editor.chain().focus().unsetFontSize().run();
    else editor.chain().focus().setFontSize(size).run();
  };

  return (
    <div className="rounded-xl border border-slate-200 overflow-hidden">
      {/* Toolbar */}
      <div className="flex flex-wrap items-center gap-0.5 border-b border-slate-200 bg-slate-50 px-2 py-1.5">

        {/* Tamaño de texto */}
        <select
          onChange={(e) => setFontSize(e.target.value)}
          className="rounded border border-slate-200 bg-white px-2 py-1 text-xs text-slate-700 focus:outline-none"
        >
          {FONTS.map((f) => (
            <option key={f.label} value={f.value}>{f.label}</option>
          ))}
        </select>

        <Divider />

        {/* Formato básico */}
        <ToolbarBtn onClick={() => editor.chain().focus().toggleBold().run()} active={editor.isActive('bold')} title="Negrita">
          <b>B</b>
        </ToolbarBtn>
        <ToolbarBtn onClick={() => editor.chain().focus().toggleItalic().run()} active={editor.isActive('italic')} title="Cursiva">
          <i>I</i>
        </ToolbarBtn>
        <ToolbarBtn onClick={() => editor.chain().focus().toggleUnderline().run()} active={editor.isActive('underline')} title="Subrayado">
          <u>U</u>
        </ToolbarBtn>
        <ToolbarBtn onClick={() => editor.chain().focus().toggleStrike().run()} active={editor.isActive('strike')} title="Tachado">
          <s>S</s>
        </ToolbarBtn>

        <Divider />

        {/* Alineación */}
        <ToolbarBtn onClick={() => editor.chain().focus().setTextAlign('left').run()} active={editor.isActive({ textAlign: 'left' })} title="Izquierda">
          ≡
        </ToolbarBtn>
        <ToolbarBtn onClick={() => editor.chain().focus().setTextAlign('center').run()} active={editor.isActive({ textAlign: 'center' })} title="Centrar">
          ≣
        </ToolbarBtn>
        <ToolbarBtn onClick={() => editor.chain().focus().setTextAlign('right').run()} active={editor.isActive({ textAlign: 'right' })} title="Derecha">
          ≡
        </ToolbarBtn>

        <Divider />

        {/* Listas */}
        <ToolbarBtn onClick={() => editor.chain().focus().toggleBulletList().run()} active={editor.isActive('bulletList')} title="Lista">
          •≡
        </ToolbarBtn>
        <ToolbarBtn onClick={() => editor.chain().focus().toggleOrderedList().run()} active={editor.isActive('orderedList')} title="Lista numerada">
          1≡
        </ToolbarBtn>

        <Divider />

        {/* Bloques */}
        <ToolbarBtn onClick={() => editor.chain().focus().toggleBlockquote().run()} active={editor.isActive('blockquote')} title="Cita">
          "
        </ToolbarBtn>
        <ToolbarBtn onClick={() => editor.chain().focus().setHorizontalRule().run()} active={false} title="Separador">
          —
        </ToolbarBtn>

        <Divider />

        {/* Colores de texto */}
        <div className="flex items-center gap-0.5">
          {COLORS.map((c) => (
            <button
              key={c}
              type="button"
              title={`Color ${c}`}
              onMouseDown={(e) => { e.preventDefault(); editor.chain().focus().setColor(c).run(); }}
              className="h-5 w-5 rounded-full border border-slate-300 hover:scale-110 transition-transform"
              style={{ backgroundColor: c }}
            />
          ))}
          <button
            type="button"
            title="Sin color"
            onMouseDown={(e) => { e.preventDefault(); editor.chain().focus().unsetColor().run(); }}
            className="ml-1 rounded px-1.5 py-0.5 text-xs text-slate-500 hover:bg-slate-100"
          >
            ✕
          </button>
        </div>

        <Divider />

        {/* Resaltado */}
        <ToolbarBtn onClick={() => editor.chain().focus().toggleHighlight({ color: '#fef08a' }).run()} active={editor.isActive('highlight')} title="Resaltar">
          🖊
        </ToolbarBtn>

        <Divider />

        {/* Imagen */}
        <ToolbarBtn onClick={() => fileRef.current?.click()} active={false} title="Insertar imagen">
          🖼
        </ToolbarBtn>
        <input ref={fileRef} type="file" accept="image/*" onChange={handleFileChange} className="hidden" />
      </div>

      {/* Editor */}
      <div className="bg-white">
        <EditorContent editor={editor} placeholder={placeholder} />
      </div>
    </div>
  );
}
