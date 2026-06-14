'use client';
import { useMemo } from 'react';

function processEmbeds(html) {
  if (!html) return html;
  return html.replace(
    /<div data-embed-type="([^"]*)" data-embed-id="([^"]*)" class="embed-block"><\/div>/g,
    (_, type, id) => {
      const src = type === 'youtube'
        ? `https://www.youtube.com/embed/${id}?rel=0`
        : `https://drive.google.com/file/d/${id}/preview`;
      const label = type === 'youtube' ? '▶ YouTube' : '📁 Google Drive';
      return `<div class="embed-block"><iframe src="${src}" class="embed-iframe" allow="autoplay; fullscreen" allowfullscreen loading="lazy" title="${label}"></iframe></div>`;
    }
  );
}

export default function RichTextViewer({ html }) {
  if (!html) return null;
  const processed = useMemo(() => processEmbeds(html), [html]);
  return (
    <div
      className="rich-content"
      dangerouslySetInnerHTML={{ __html: processed }}
    />
  );
}
