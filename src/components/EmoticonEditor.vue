<script setup>
// src/components/EmoticonEditor.vue
// 评论输入区：contenteditable 把 [名称] 占位符就地画成表情图，把 @昵称 / 链接标题画成整块蓝色标记，
// 对外的值仍是纯文本字面量。DOM 规范成「文本节点 + 表情图 + 标记 + <br>」一层，每次输入后按纯文本重建，
// 光标一律用纯文本偏移换算，故换行/表情/选人的落点不受浏览器改出什么结构影响。
// 根节点另挂 textarea 同名的 value / selectionStart / setSelectionRange 面，
// 让只认 textarea 的调用方（评论富文本记账）不必区分两种输入控件。
import { ref, watch, onMounted } from 'vue';
import { tokenizeEmoticons, emoticonMap } from '@/services/emoticon.js';

const props = defineProps({
    modelValue: { type: String, default: '' },
    placeholder: { type: String, default: '' },
    // [{ text:'@昵称 ', kind:'mention' | 'link' }]：账本里的字面量，各按出现顺序消耗一次
    tokens: { type: Array, default: () => [] },
});

const emit = defineEmits(['update:modelValue', 'input', 'at']);

const editorRef = ref(null);
const isEmpty = ref(true);

// 输入法组合期间不重建 DOM：换字会打断候选与上屏
let composing = false;
// 最近一次对外同步的文本，用于分辨「自身回写」与「外部改动」
let synced = '';
// 失焦前的光标位：点表情面板/选人时选区已不在编辑区内，按它落点
let savedCaret = 0;

const leafKind = (child) => {
    if (child.nodeType === Node.TEXT_NODE) return 'text';
    if (child.nodeName === 'IMG') return 'img';
    if (child.nodeName === 'BR') return 'br';
    if (child.classList?.contains('editor-token')) return 'token';
    return 'block';
};

const leafLength = (child) => {
    const kind = leafKind(child);
    if (kind === 'text') return child.nodeValue.length;
    if (kind === 'img') return (child.dataset.token || '').length;
    if (kind === 'token') return child.textContent.length;
    return 1;
};

/**
 * 深度遍历，回调 (child, index, parent, start)：start 是该节点起始处的纯文本偏移。
 * 末尾的 <br> 若紧跟换行或整区为空，只是给光标占一行，不计入文本；
 * 浏览器塞进行容器的节点（自动填充、拖放）按换行摊平，内容不丢。
 */
const walkLeaves = (root, visit) => {
    let pos = 0;
    let afterBreak = false;

    const step = (node) => {
        const kids = node.childNodes;
        for (let i = 0; i < kids.length; i += 1) {
            const child = kids[i];
            const kind = leafKind(child);

            if (kind === 'block') {
                if (pos && !afterBreak) { pos += 1; afterBreak = true; }
                if (step(child) === false) return false;
                continue;
            }
            if (kind === 'br' && i === kids.length - 1 && (pos === 0 || afterBreak)) continue;

            const len = leafLength(child);
            if (visit(child, i, node, pos) === false) return false;
            pos += len;
            afterBreak = kind === 'br' || (kind === 'text' && child.nodeValue.endsWith('\n'));
        }
        return undefined;
    };

    step(root);
};

const serialize = (root) => {
    let out = '';
    walkLeaves(root, (child) => {
        const kind = leafKind(child);
        if (kind === 'text') out += child.nodeValue;
        else if (kind === 'img') out += child.dataset.token || '';
        else if (kind === 'token') out += child.textContent;
        else out += '\n';
    });
    return out;
};

/** 纯文本 → 规范节点序列 */
const buildFragment = (text) => {
    const frag = document.createDocumentFragment();
    const counters = props.tokens.map((t) => ({ ...t, count: 1, used: 0 }));
    const pushText = (chunk) => {
        chunk.split('\n').forEach((piece, i) => {
            if (i) frag.appendChild(document.createElement('br'));
            if (piece) frag.appendChild(document.createTextNode(piece));
        });
    };
    tokenizeEmoticons(text, emoticonMap.value, counters).forEach((part) => {
        if (part.type === 'emoticon') {
            const img = document.createElement('img');
            img.className = 'emoticon-img';
            img.src = part.url;
            img.alt = part.name;
            img.dataset.token = part.name;
            img.setAttribute('contenteditable', 'false');
            frag.appendChild(img);
            return;
        }
        if (part.type === 'token') {
            const span = document.createElement('span');
            span.className = 'editor-token';
            span.dataset.kind = part.kind;
            span.textContent = part.value;
            span.setAttribute('contenteditable', 'false');
            frag.appendChild(span);
            return;
        }
        pushText(part.value);
    });
    if (text.endsWith('\n')) frag.appendChild(document.createElement('br'));
    return frag;
};

const render = (text) => {
    const root = editorRef.value;
    if (!root) return;
    root.textContent = '';
    if (text) root.appendChild(buildFragment(text));
};

const pointAt = (root, offset) => {
    let hit = null;
    walkLeaves(root, (child, index, parent, start) => {
        const len = leafLength(child);
        if (start + len < offset) return undefined;
        hit = child.nodeType === Node.TEXT_NODE
            ? { container: child, offset: offset - start }
            : { container: parent, offset: index + (start + len === offset ? 1 : 0) };
        return false;
    });
    return hit || { container: root, offset: root.childNodes.length };
};

const offsetAt = (root, container, containerOffset) => {
    let hit = null;
    walkLeaves(root, (child, index, parent, start) => {
        if (child === container) {
            hit = container.nodeType === Node.TEXT_NODE
                ? start + containerOffset
                : start + [...container.childNodes].slice(0, containerOffset)
                    .reduce((s, c) => s + (c.textContent || '').length, 0);
            return false;
        }
        if (parent === container && index === containerOffset) {
            hit = start;
            return false;
        }
        return undefined;
    });
    return hit === null ? serialize(root).length : hit;
};

const liveCaret = () => {
    const root = editorRef.value;
    const sel = window.getSelection();
    if (!root || !sel || sel.rangeCount === 0) return null;
    const { startContainer, startOffset } = sel.getRangeAt(0);
    if (!root.contains(startContainer)) return null;
    return offsetAt(root, startContainer, startOffset);
};

const setRange = (from, to) => {
    const root = editorRef.value;
    if (!root) return;
    const range = document.createRange();
    range.setStart(from.container, from.offset);
    if (to) range.setEnd(to.container, to.offset);
    else range.collapse(true);
    const sel = window.getSelection();
    sel.removeAllRanges();
    sel.addRange(range);
};

const setCaret = (offset) => {
    const root = editorRef.value;
    if (!root) return;
    setRange(pointAt(root, offset));
    savedCaret = offset;
};

const selectRange = (start, end) => {
    const root = editorRef.value;
    if (!root) return;
    setRange(pointAt(root, start), end > start ? pointAt(root, end) : null);
};

/** 用 Range 落字：绕开 execCommand，改完由 applyEdit 重建结构并把光标定回纯文本偏移 */
const insertPlain = (text) => {
    const sel = window.getSelection();
    const range = sel.rangeCount ? sel.getRangeAt(0) : null;
    if (!range) return false;
    range.deleteContents();
    const created = document.createTextNode(text);
    range.insertNode(created);
    sel.setBaseAndExtent(created, text.length, created, text.length);
    return true;
};

const applyEdit = (text, caret) => {
    synced = text;
    isEmpty.value = !text;
    savedCaret = caret;
    if (text !== props.modelValue) emit('update:modelValue', text);
    // 光标紧跟 @ 即进入选人，面板选中后由 @昵称 顶替这个 @
    if (text[caret - 1] === '@' && !composing) emit('at', caret - 1);
    if (!composing) {
        render(text);
        setCaret(caret);
    }
    emit('input');
};

const onInput = () => {
    const root = editorRef.value;
    if (!root) return;
    const caret = liveCaret();
    applyEdit(serialize(root), caret === null ? savedCaret : caret);
};

const onCompositionEnd = () => {
    composing = false;
    onInput();
};

const onKeydown = (e) => {
    if (e.key !== 'Enter' || e.isComposing) return;
    e.preventDefault();
    insertText('\n');
};

const onPaste = (e) => {
    e.preventDefault();
    insertText(e.clipboardData?.getData('text/plain') || '');
};

const onBlur = () => {
    const caret = liveCaret();
    if (caret !== null) savedCaret = caret;
};

/** 在光标处写入文本 */
const insertText = (text) => {
    const root = editorRef.value;
    if (!root || !text) return;
    // 先读光标再 focus：选区已随点面板移出编辑区时，focus 会把光标甩到开头
    const at = liveCaret() ?? savedCaret;
    root.focus();
    setCaret(at);
    const before = serialize(root);
    if (!insertPlain(text)) return;
    applyEdit(before.slice(0, at) + text + before.slice(at), at + text.length);
};

/** 用 text 替换纯文本区间 [start,end)，光标停在替换结果末尾 */
const replaceRange = (start, end, text) => {
    const root = editorRef.value;
    if (!root) return;
    root.focus();
    selectRange(start, end);
    const before = serialize(root);
    if (!insertPlain(text)) return;
    applyEdit(before.slice(0, start) + text + before.slice(end), start + text.length);
};

const caretOffset = () => liveCaret() ?? savedCaret;

const focus = () => {
    const root = editorRef.value;
    if (!root) return;
    const at = liveCaret() ?? savedCaret;
    root.focus();
    setCaret(Math.min(at, serialize(root).length));
};

watch(() => props.modelValue, (value) => {
    const next = value == null ? '' : String(value);
    if (next === synced) return;
    applyEdit(next, next.length);
});

// 账本变化（选人/链接解析回来）要把已有的字面量重新画成标记，光标留在原处
watch(() => props.tokens, () => {
    const root = editorRef.value;
    if (!root || composing) return;
    const text = serialize(root);
    const caret = liveCaret() ?? savedCaret;
    synced = text;
    render(text);
    setCaret(caret);
});

onMounted(() => {
    const root = editorRef.value;
    synced = props.modelValue || '';
    isEmpty.value = !synced;
    render(synced);

    Object.defineProperties(root, {
        value: {
            configurable: true,
            get: () => serialize(root),
            set: (next) => emit('update:modelValue', String(next ?? '')),
        },
        selectionStart: { configurable: true, get: () => liveCaret() ?? savedCaret },
        selectionEnd: { configurable: true, get: () => liveCaret() ?? savedCaret },
        setSelectionRange: {
            configurable: true,
            value: (start, end) => selectRange(start, end ?? start),
        },
    });
});

defineExpose({
    insertText,
    replaceRange,
    caretOffset,
    focus,
    text: () => (editorRef.value ? serialize(editorRef.value) : ''),
});
</script>

<template>
    <div ref="editorRef" class="emoticon-editor" :class="{ 'is-empty': isEmpty }" contenteditable="true"
        spellcheck="false" role="textbox" :aria-multiline="true" :data-placeholder="placeholder" @input="onInput"
        @keydown="onKeydown" @paste="onPaste" @blur="onBlur" @compositionstart="composing = true"
        @compositionend="onCompositionEnd"></div>
</template>

<style>
/* 与 .messagebar textarea 同一套自定义属性，保证与原生输入框外观一致 */
.emoticon-editor {
    background-color: var(--f7-messagebar-textarea-bg-color);
    border: var(--f7-messagebar-textarea-border);
    border-radius: var(--f7-messagebar-textarea-border-radius);
    box-sizing: border-box;
    color: var(--f7-messagebar-textarea-text-color);
    font-size: var(--f7-messagebar-textarea-font-size);
    line-height: var(--f7-messagebar-textarea-line-height);
    padding: var(--f7-messagebar-textarea-padding);
    min-height: var(--f7-messagebar-textarea-height);
    max-height: 120px;
    overflow-y: auto;
    width: 100%;
    outline: none;
    white-space: pre-wrap;
    overflow-wrap: break-word;
}

.emoticon-editor.is-empty::before {
    content: attr(data-placeholder);
    color: var(--f7-messagebar-textarea-placeholder-color);
    pointer-events: none;
}

/* @昵称 与链接标题：整块着色且不可拆开编辑（contenteditable=false 由浏览器保证整体删除） */
.emoticon-editor .editor-token {
    color: var(--f7-theme-color);
    -webkit-user-select: none;
    user-select: none;
}
</style>
