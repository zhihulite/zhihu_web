// src/utils/markdown.js
// structured_content.segments → Markdown。正文本来就是分段结构，按段直接生成，
// 不必从渲染后的 DOM 反解 HTML。

/** 行内标记 → Markdown：按 start/end 边界切片，每片套上覆盖它的全部标记（与 RenderStyledText 同一切分口径） */
function inlineToMarkdown(text, marks) {
    if (!text) return '';
    if (!marks?.length) return text;

    const points = new Set([0, text.length]);
    for (const m of marks) {
        if (m.start_index >= 0 && m.start_index <= text.length) points.add(m.start_index);
        if (m.end_index >= 0 && m.end_index <= text.length) points.add(m.end_index);
    }
    const sorted = [...points].sort((a, b) => a - b);

    let out = '';
    for (let i = 0; i < sorted.length - 1; i++) {
        const start = sorted[i];
        const end = sorted[i + 1];
        if (start === end) continue;
        const active = marks.filter((m) => m.start_index <= start && m.end_index >= end);
        out += wrapMarks(text.substring(start, end), active);
    }
    return out;
}

function wrapMarks(slice, marks) {
    const types = new Set(marks.map((m) => m.type));
    let text = slice;
    if (types.has('code')) text = `\`${text}\``;
    if (types.has('bold')) text = `**${text}**`;
    if (types.has('italic')) text = `*${text}*`;
    const href = marks.find((m) => m.type === 'link')?.link?.href
        || marks.find((m) => m.type === 'entity_word')?.entity_word?.url;
    return href ? `[${text}](${href})` : text;
}

function cardLink(card) {
    const title = card?.title || '';
    let url = '';
    try {
        url = card?.extra_info ? JSON.parse(card.extra_info).url || '' : '';
    } catch {
        url = '';
    }
    return url ? `[${title}](${url})` : title;
}

function segmentToMarkdown(seg) {
    switch (seg.type) {
        case 'paragraph':
            return inlineToMarkdown(seg.paragraph?.text, seg.paragraph?.marks);
        case 'heading': {
            const level = Math.min(Math.max(Number(seg.heading?.level) || 2, 1), 6);
            return `${'#'.repeat(level)} ${seg.heading?.text || ''}`;
        }
        case 'blockquote':
            return inlineToMarkdown(seg.blockquote?.text, seg.blockquote?.marks)
                .split('\n')
                .map((line) => `> ${line}`)
                .join('\n');
        case 'code_block':
            return `\`\`\`\n${seg.code_block?.content || ''}\n\`\`\``;
        case 'list_node': {
            const items = seg.list_node?.items || [];
            const ordered = seg.list_node?.ordered;
            return items
                .map((item, i) => `${ordered ? `${i + 1}.` : '-'} ${inlineToMarkdown(item.text, item.marks)}`)
                .join('\n');
        }
        case 'image': {
            const url = seg.image?.urls?.[0] || '';
            // svg data URI 多是占位图，不算正文
            if (!url || url.startsWith('data:image/svg')) return '';
            return `![](${url})`;
        }
        case 'card':
            return cardLink(seg.card);
        case 'video':
            return seg.video?.id ? `[视频](https://www.zhihu.com/zvideo/${seg.video.id})` : '';
        case 'hr':
            return '---';
        default:
            // myapptip 等装饰段（关系提示、发布时间/IP 归属）不属于正文
            return '';
    }
}

export function segmentsToMarkdown(segments) {
    if (!Array.isArray(segments)) return '';
    return segments.map(segmentToMarkdown).filter(Boolean).join('\n\n').trim();
}
