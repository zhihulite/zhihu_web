// src/utils/url.js
// 知乎链接解析：把各类知乎 URL 归一化为 { type, id }，跳转由 core/navigation 处理。
import $http from '@/services/http.js';

async function fetchVideoUrl(videoId) {
    try {
        const res = await $http.get(`https://lens.zhihu.com/api/v4/videos/${videoId}`);
        let videoLink = res.playlist?.SD?.play_url
            || res.playlist?.LD?.play_url
            || res.playlist?.HD?.play_url;

        if (videoLink) {
            return { type: 'browser', id: videoLink };
        } else {
            return { type: 'error', message: '无法获取视频链接' };
        }
    } catch {
        return { type: 'error', message: '网络请求失败' };
    }
}

export async function parseZhihuUrl(url) {
    try {
        const u = new URL(url);
        const { protocol, hostname, pathname, search, searchParams } = u;

        if (
            protocol !== 'zhihu:' &&
            !/^(?:http|https):$/.test(protocol)
        ) {
            return { type: 'browser', id: url };
        }

        if (/^(http|https):$/.test(protocol) && !/^(www\.)?zhihu\.com$/.test(hostname) && !/^(zhuanlan\.)?zhihu\.com$/.test(hostname)) {
            return { type: 'browser', id: url };
        }

        // zhihu:// 深链：非特殊协议下首段落在 hostname（pathname 里没有它），
        // 归一为 https 后与网页链接走同一套匹配；段尾的 s 是接口复数形式（answers → answer）
        if (protocol === 'zhihu:') {
            const head = hostname.endsWith('s') ? hostname.slice(0, -1) : hostname;
            const rest = `${pathname}${search}`;
            return await parseZhihuUrl(head ? `https://www.zhihu.com/${head}${rest}` : `https://www.zhihu.com${rest}`);
        }

        let match;

        // Question + Answer → answer（深链归一后可能出现 answers 复数形式）
        if ((match = pathname.match(/^\/question\/(\d+)\/answers?\/(\d+)$/))) {
            return { type: 'answer', id: match[2] };
        }

        // Standalone Answer → answer
        if ((match = pathname.match(/^\/answer\/(\d+)$/))) {
            return { type: 'answer', id: match[1] };
        }

        // Question → question
        if ((match = pathname.match(/^\/question\/(\d+)$/))) {
            return { type: 'question', id: match[1] };
        }

        // Article (专栏文章) → article
        if (
            (match = pathname.match(/^\/p\/(\d+)$/)) ||
            (match = pathname.match(/^\/appview\/p\/(\d+)$/)) ||
            (match = pathname.match(/^\/article\/(\d+)$/))
        ) {
            return { type: 'article', id: match[1] };
        }

        // Pin (想法) → pin
        if ((match = pathname.match(/^\/pin\/(\d+)$/))) {
            return { type: 'pin', id: match[1] };
        }

        // Old Video → 异步解析
        if ((match = pathname.match(/^\/video\/(\d+)$/))) {
            return await fetchVideoUrl(match[1]);
        }

        // ZVideo → zvideo（与 core/navigation resolveCardRoute 的类型约定一致）
        if ((match = pathname.match(/^\/zvideo\/(\d+)$/))) {
            return { type: 'zvideo', id: match[1] };
        }

        // People / Org → people
        if (
            (match = pathname.match(/^\/people\/([^\/]+)$/)) ||
            (match = pathname.match(/^\/org\/([^\/]+)$/))
        ) {
            return { type: 'people', id: match[1] };
        }

        // Topic → topic
        if (
            (match = pathname.match(/^\/topics\/(\d+)$/)) ||
            (match = pathname.match(/^\/topic\/(\d+)$/))
        ) {
            return { type: 'topic', id: match[1] };
        }

        // Column → column（专栏标识是 c_ 开头的长号，也可能是自定义字母串）
        if ((match = pathname.match(/^\/column\/([^\/]+)$/))) {
            return { type: 'column', id: match[1] };
        }

        // Roundtable → roundtable
        if ((match = pathname.match(/^\/roundtable\/(\d+)$/))) {
            return { type: 'roundtable', id: match[1] };
        }

        // Special → special
        if ((match = pathname.match(/^\/special\/(\d+)$/))) {
            return { type: 'special', id: match[1] };
        }

        // Theater (直播短剧)：带 drama_id 归一为 drama 类型
        if (pathname === '/theater') {
            const dramaId = searchParams.get('drama_id');
            if (dramaId) return { type: 'drama', id: dramaId };
            return { type: 'browser', id: url };
        }

        // /oia/ 是站外分享中转路径，剥掉这一段后按原链接重试（保留原 host）
        if (pathname.startsWith('/oia/')) {
            return await parseZhihuUrl(`${protocol}//${hostname}${pathname.replace('/oia/', '/')}${search}`);
        }

        // 登录回跳链接：交回站内登录流程
        if (pathname.startsWith('/signin')) {
            return { type: 'login', id: searchParams.get('next') || '' };
        }

        // 未匹配
        return { type: 'error', message: '暂不支持的链接: ' + url };
    } catch {
        return { type: 'error', message: '无效链接: ' + url };
    }
}