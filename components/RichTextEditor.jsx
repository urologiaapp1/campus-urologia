'use client';
import { useEditor, EditorContent, NodeViewWrapper, ReactNodeViewRenderer } from '@tiptap/react';
import { Node, mergeAttributes } from '@tiptap/core';
import StarterKit from '@tiptap/starter-kit';
import { Underline } from '@tiptap/extension-underline';
import { TextStyle, FontSize } from '@tiptap/extension-text-style';
import { Color } from '@tiptap/extension-color';
import { Highlight } from '@tiptap/extension-highlight';
import { TextAlign } from '@tiptap/extension-text-align';
import { Link } from '@tiptap/extension-link';
import { useCallback, useRef, useState } from 'react';

/* ── Utilidades de URL ──────────────────────────────────────────── */
function parseEmbedUrl(raw) {
  const url = raw.trim();

  // YouTube: watch?v=, youtu.be/, /embed/
  const yt = url.match(/(?:youtube\.com\/(?:watch\?v=|embed\/)|youtu\.be\/)([a-zA-Z0-9_-]{11})/);
  if (yt) return { embedType: 'youtube', embedId: yt[1] };

  // Google Drive file
  const dr = url.match(/drive\.google\.com\/file\/d\/([a-zA-Z0-9_-]+)/);
  if (dr) return { embedType: 'drive', embedId: dr[1] };

  // Google Docs / Slides / Sheets
  const gdoc = url.match(/docs\.google\.com\/(?:document|presentation|spreadsheets)\/d\/([a-zA-Z0-9_-]+)/);
  if (gdoc) return { embedType: 'drive', embedId: gdoc[1] };

  return null;
}

function embedSrc({ embedType, embedId }) {
  if (embedType === 'youtube') return `https://www.youtube.com/embed/${embedId}?rel=0`;
  return `https://drive.google.com/file/d/${embedId}/preview`;
}

/* ── Extensión: imagen redimensionable ─────────────────────────── */
function ResizableImageView({ node, updateAttributes, selected }) {
  const containerRef = useRef(null);

  const startResize = (e) => {
    e.preventDefault();
    e.stopPropagation();
    const startX = e.clientX;
    const startW = containerRef.current?.offsetWidth || 400;

    const onMove = (ev) => {
      const next = Math.max(80, startW + ev.clientX - startX);
      updateAttributes({ width: next });
    };
    const onUp = () => {
      window.removeEventListener('mousemove', onMove);
      window.removeEventListener('mouseup', onUp);
    };
    window.addEventListener('mousemove', onMove);
    window.addEventListener('mouseup', onUp);
  };

  const w = node.attrs.width;
  const style = { display: 'block', margin: '1rem auto', position: 'relative', width: w ? `${w}px` : '100%', maxWidth: '100%' };

  return (
    <NodeViewWrapper style={style} ref={containerRef}>
      <img
        src={node.attrs.src}
        alt={node.attrs.alt || ''}
        style={{ width: '100%', display: 'block', borderRadius: 12 }}
        draggable={false}
      />
      {selected && (
        <>
          {/* Anillo de selección */}
          <div style={{ position: 'absolute', inset: 0, borderRadius: 12, boxShadow: '0 0 0 2px #0e7490', pointerEvents: 'none' }} />
          {/* Handle derecho */}
          <div
            onMouseDown={startResize}
            title="Arrastra para redimensionar"
            style={{
              position: 'absolute', right: -6, top: '50%', transform: 'translateY(-50%)',
              width: 12, height: 36, background: '#0e7490', borderRadius: 6,
              cursor: 'ew-resize', zIndex: 10, opacity: 0.9,
            }}
          />
          {/* Etiqueta de tamaño */}
          <div style={{
            position: 'absolute', bottom: 8, right: 10,
            background: 'rgba(0,0,0,0.55)', color: '#fff',
            fontSize: 11, padding: '2px 6px', borderRadius: 4, pointerEvents: 'none',
          }}>
            {w ? `${w}px` : '100%'}
          </div>
        </>
      )}
    </NodeViewWrapper>
  );
}

const ResizableImage = Node.create({
  name: 'resizableImage',
  group: 'block',
  atom: true,
  draggable: true,

  addAttributes() {
    return {
      src:   { default: null },
      alt:   { default: null },
      width: { default: null },
    };
  },

  parseHTML() {
    return [{ tag: 'img[src]', getAttrs: (el) => ({ src: el.getAttribute('src'), alt: el.getAttribute('alt'), width: el.getAttribute('width') ? parseInt(el.getAttribute('width')) : null }) }];
  },

  renderHTML({ HTMLAttributes }) {
    const attrs = { ...HTMLAttributes };
    if (attrs.width) attrs.style = `width:${attrs.width}px;max-width:100%;display:block;border-radius:12px;margin:1rem auto`;
    else attrs.style = 'max-width:100%;display:block;border-radius:12px;margin:1rem auto';
    delete attrs.width;
    return ['img', mergeAttributes(attrs)];
  },

  addNodeView() {
    return ReactNodeViewRenderer(ResizableImageView);
  },

  addCommands() {
    return {
      setResizableImage: (attrs) => ({ commands }) => commands.insertContent({ type: this.name, attrs }),
    };
  },
});

/* ── Extensión: embed de video / documento ─────────────────────── */
function EmbedBlockView({ node, selected }) {
  const src = embedSrc(node.attrs);
  const label = node.attrs.embedType === 'youtube' ? '▶ YouTube' : '📁 Google Drive';

  return (
    <NodeViewWrapper contentEditable={false} style={{ margin: '1.25rem 0', userSelect: 'none' }}>
      <div style={{
        position: 'relative', paddingBottom: '56.25%', height: 0,
        borderRadius: 12, overflow: 'hidden',
        border: selected ? '2px solid #0e7490' : '1px solid #e2e8f0',
      }}>
        <iframe
          src={src}
          style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', border: 'none' }}
          allow="autoplay; fullscreen"
          allowFullScreen
          title={label}
        />
      </div>
      <p style={{ textAlign: 'center', fontSize: 11, color: '#94a3b8', marginTop: 4 }}>{label}</p>
    </NodeViewWrapper>
  );
}

const EmbedBlock = Node.create({
  name: 'embedBlock',
  group: 'block',
  atom: true,
  draggable: true,

  addAttributes() {
    return {
      embedType: { default: 'youtube' },
      embedId:   { default: null },
    };
  },

  parseHTML() {
    return [{ tag: 'div[data-embed-type]', getAttrs: (el) => ({ embedType: el.getAttribute('data-embed-type'), embedId: el.getAttribute('data-embed-id') }) }];
  },

  renderHTML({ HTMLAttributes }) {
    return ['div', { 'data-embed-type': HTMLAttributes.embedType, 'data-embed-id': HTMLAttributes.embedId, class: 'embed-block' }];
  },

  addNodeView() {
    return ReactNodeViewRenderer(EmbedBlockView);
  },

  addCommands() {
    return {
      setEmbedBlock: (attrs) => ({ commands }) => commands.insertContent({ type: this.name, attrs }),
    };
  },
});

/* ── Modal de embed ─────────────────────────────────────────────── */
function EmbedModal({ onInsert, onClose }) {
  const [url, setUrl] = useState('');
  const [error, setError] = useState('');

  function submit() {
    const parsed = parseEmbedUrl(url);
    if (!parsed) { setError('URL no reconocida. Usa un link de YouTube o Google Drive.'); return; }
    onInsert(parsed);
    onClose();
  }

  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 9999, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center' }} onClick={onClose}>
      <div style={{ background: 'var(--surface)', borderRadius: 20, padding: 28, width: 440, maxWidth: '92vw', boxShadow: '0 24px 64px rgba(0,0,0,0.25)' }} onClick={(e) => e.stopPropagation()}>
        <h3 style={{ margin: 0, fontWeight: 800, fontSize: 16, color: 'var(--text-1)' }}>Insertar video o documento</h3>
        <p style={{ margin: '6px 0 16px', fontSize: 13, color: 'var(--text-2)', lineHeight: 1.5 }}>
          Pega la URL de YouTube o Google Drive (video, PDF, presentación, doc)
        </p>
        <input
          autoFocus
          value={url}
          onChange={(e) => { setUrl(e.target.value); setError(''); }}
          onKeyDown={(e) => e.key === 'Enter' && submit()}
          placeholder="https://youtube.com/watch?v=... o https://drive.google.com/file/d/..."
          style={{
            width: '100%', padding: '10px 14px', boxSizing: 'border-box',
            border: `1px solid ${error ? '#dc2626' : 'var(--border)'}`, borderRadius: 10,
            fontSize: 13, outline: 'none', background: 'var(--surface-2)', color: 'var(--text-1)',
          }}
        />
        {error && <p style={{ color: '#dc2626', fontSize: 12, margin: '6px 0 0' }}>{error}</p>}

        <div style={{ marginTop: 18, fontSize: 12, color: 'var(--text-3)', lineHeight: 1.6 }}>
          <strong style={{ color: 'var(--text-2)' }}>Ejemplos aceptados:</strong><br />
          youtube.com/watch?v=… · youtu.be/… · drive.google.com/file/d/… · docs.google.com/…
        </div>

        <div style={{ display: 'flex', gap: 8, marginTop: 20, justifyContent: 'flex-end' }}>
          <button onClick={onClose} className="btn-secondary">Cancelar</button>
          <button onClick={submit} className="btn-primary">Insertar</button>
        </div>
      </div>
    </div>
  );
}

/* ── Componentes de toolbar ─────────────────────────────────────── */
const COLORS = [
  '#1e293b', '#475569', '#94a3b8',
  '#0f172a', '#1d4ed8', '#0284c7',
  '#15803d', '#65a30d', '#ca8a04',
  '#dc2626', '#9333ea', '#db2777',
];

const FONTS = [
  { label: 'Normal', value: '' },
  { label: 'Grande', value: '1.25em' },
  { label: 'Título', value: '1.75em' },
  { label: 'Pequeño', value: '0.85em' },
];

function ToolbarBtn({ onClick, active, title, children }) {
  return (
    <button
      type="button"
      onMouseDown={(e) => { e.preventDefault(); onClick(); }}
      title={title}
      className={`rounded px-2 py-1 text-sm transition-colors ${active ? 'bg-brand-600 text-white' : 'text-slate-700 hover:bg-slate-100'}`}
    >
      {children}
    </button>
  );
}

function Divider() {
  return <div className="h-5 w-px bg-slate-200 mx-1" />;
}

/* ── Editor principal ───────────────────────────────────────────── */
export default function RichTextEditor({ content, onChange, placeholder }) {
  const fileRef = useRef(null);
  const [embedModal, setEmbedModal] = useState(false);

  const editor = useEditor({
    extensions: [
      StarterKit.configure({ heading: { levels: [1, 2, 3] } }),
      Underline,
      TextStyle,
      FontSize,
      Color,
      Highlight.configure({ multicolor: true }),
      TextAlign.configure({ types: ['heading', 'paragraph'] }),
      Link.configure({ openOnClick: false }),
      ResizableImage,
      EmbedBlock,
    ],
    content: content || '',
    editorProps: {
      attributes: { class: 'prose prose-slate max-w-none min-h-[300px] p-4 outline-none focus:outline-none' },
    },
    onUpdate: ({ editor }) => onChange?.(editor.getHTML()),
  });

  const uploadImage = useCallback(async (file) => {
    const fd = new FormData();
    fd.append('file', file);
    const res = await fetch('/api/upload/image', { method: 'POST', body: fd });
    if (!res.ok) { alert('Error al subir imagen'); return; }
    const { url } = await res.json();
    editor?.chain().focus().setResizableImage({ src: url }).run();
  }, [editor]);

  const handleFileChange = useCallback((e) => {
    const file = e.target.files?.[0];
    if (file) uploadImage(file);
    e.target.value = '';
  }, [uploadImage]);

  const handleEmbed = useCallback(({ embedType, embedId }) => {
    editor?.chain().focus().setEmbedBlock({ embedType, embedId }).run();
  }, [editor]);

  if (!editor) return null;

  const setFontSize = (size) => {
    if (!size) editor.chain().focus().unsetFontSize().run();
    else editor.chain().focus().setFontSize(size).run();
  };

  return (
    <>
      {embedModal && <EmbedModal onInsert={handleEmbed} onClose={() => setEmbedModal(false)} />}

      <div className="rounded-xl border border-slate-200 overflow-hidden">
        {/* Toolbar */}
        <div className="flex flex-wrap items-center gap-0.5 border-b border-slate-200 bg-slate-50 px-2 py-1.5">

          <select
            onChange={(e) => setFontSize(e.target.value)}
            className="rounded border border-slate-200 bg-white px-2 py-1 text-xs text-slate-700 focus:outline-none"
          >
            {FONTS.map((f) => <option key={f.label} value={f.value}>{f.label}</option>)}
          </select>

          <Divider />

          <ToolbarBtn onClick={() => editor.chain().focus().toggleBold().run()} active={editor.isActive('bold')} title="Negrita"><b>B</b></ToolbarBtn>
          <ToolbarBtn onClick={() => editor.chain().focus().toggleItalic().run()} active={editor.isActive('italic')} title="Cursiva"><i>I</i></ToolbarBtn>
          <ToolbarBtn onClick={() => editor.chain().focus().toggleUnderline().run()} active={editor.isActive('underline')} title="Subrayado"><u>U</u></ToolbarBtn>
          <ToolbarBtn onClick={() => editor.chain().focus().toggleStrike().run()} active={editor.isActive('strike')} title="Tachado"><s>S</s></ToolbarBtn>

          <Divider />

          <ToolbarBtn onClick={() => editor.chain().focus().setTextAlign('left').run()} active={editor.isActive({ textAlign: 'left' })} title="Izquierda">≡</ToolbarBtn>
          <ToolbarBtn onClick={() => editor.chain().focus().setTextAlign('center').run()} active={editor.isActive({ textAlign: 'center' })} title="Centrar">≣</ToolbarBtn>
          <ToolbarBtn onClick={() => editor.chain().focus().setTextAlign('right').run()} active={editor.isActive({ textAlign: 'right' })} title="Derecha">≡</ToolbarBtn>

          <Divider />

          <ToolbarBtn onClick={() => editor.chain().focus().toggleBulletList().run()} active={editor.isActive('bulletList')} title="Lista">•≡</ToolbarBtn>
          <ToolbarBtn onClick={() => editor.chain().focus().toggleOrderedList().run()} active={editor.isActive('orderedList')} title="Lista numerada">1≡</ToolbarBtn>

          <Divider />

          <ToolbarBtn onClick={() => editor.chain().focus().toggleBlockquote().run()} active={editor.isActive('blockquote')} title="Cita">"</ToolbarBtn>
          <ToolbarBtn onClick={() => editor.chain().focus().setHorizontalRule().run()} active={false} title="Separador">—</ToolbarBtn>

          <Divider />

          {/* Colores */}
          <div className="flex items-center gap-0.5">
            {COLORS.map((c) => (
              <button key={c} type="button" title={`Color ${c}`}
                onMouseDown={(e) => { e.preventDefault(); editor.chain().focus().setColor(c).run(); }}
                className="h-5 w-5 rounded-full border border-slate-300 hover:scale-110 transition-transform"
                style={{ backgroundColor: c }}
              />
            ))}
            <button type="button" title="Sin color"
              onMouseDown={(e) => { e.preventDefault(); editor.chain().focus().unsetColor().run(); }}
              className="ml-1 rounded px-1.5 py-0.5 text-xs text-slate-500 hover:bg-slate-100">
              ✕
            </button>
          </div>

          <Divider />

          <ToolbarBtn onClick={() => editor.chain().focus().toggleHighlight({ color: '#fef08a' }).run()} active={editor.isActive('highlight')} title="Resaltar">🖊</ToolbarBtn>

          <Divider />

          {/* Imagen */}
          <ToolbarBtn onClick={() => fileRef.current?.click()} active={false} title="Insertar imagen desde equipo">
            🖼
          </ToolbarBtn>
          <input ref={fileRef} type="file" accept="image/*" onChange={handleFileChange} className="hidden" />

          {/* Video / Documento */}
          <ToolbarBtn onClick={() => setEmbedModal(true)} active={false} title="Insertar video (YouTube / Drive) o documento">
            ▶ Embed
          </ToolbarBtn>
        </div>

        {/* Contenido editable */}
        <div className="bg-white">
          <EditorContent editor={editor} placeholder={placeholder} />
        </div>
      </div>
    </>
  );
}
