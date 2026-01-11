
import $http from '../api/http.js';

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


// 直接使用$handleCardClick处理知乎链接
export async function handleZhihuUrl(f7router, url) {
    const result = await parseZhihuUrl(url);
    if (result.type !== 'error') {
        if (typeof window !== 'undefined' && window.$handleCardClick) {
            window.$handleCardClick(f7router, result);
        }
    }
    return result;
}

export async function parseZhihuUrl(url) {
    try {
        const u = new URL(url);
        const { protocol, hostname, pathname, searchParams } = u;

        if (
            protocol !== 'zhihu:' &&
            !/^(?:http|https):$/.test(protocol)
        ) {
            return { type: 'browser', id: url };
        }

        if (/^(http|https):$/.test(protocol) && !/^(www\.)?zhihu\.com$/.test(hostname) && !/^(zhuanlan\.)?zhihu\.com$/.test(hostname)) {
            return { type: 'browser', id: url };
        }

        let match;

        // Question + Answer → answer
        if ((match = pathname.match(/^\/question\/(\d+)\/answer\/(\d+)$/))) {
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
            (match = pathname.match(/^\/appview\/p\/(\d+)$/))
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

        // ZVideo → zvideo
        if ((match = pathname.match(/^\/zvideo\/(\d+)$/))) {
            return { type: 'video', id: match[1] };
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

        // Column → column
        if ((match = pathname.match(/^\/column\/(\d+)$/))) {
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

        // Theater (直播)
        if (pathname === '/theater') {
            // TODO 处理 drama_id
            const dramaId = searchParams.get('drama_id');
            return { type: 'browser', id: url };
        }

        if (pathname.startsWith('/oia/')) {
            const cleanPath = pathname.replace('/oia/', '/');
            return await parseZhihuUrl(`zhihu://${cleanPath}${u.search}`);
        }

        if (protocol === 'zhihu:') {
            if ((match = pathname.match(/\/answers\/(\d+)|\/answer\/(\d+)/))) {
                return { type: 'answer', id: match[1] || match[2] };
            }
            if ((match = pathname.match(/\/questions\/(\d+)|\/question\/(\d+)/))) {
                return { type: 'question', id: match[1] || match[2] };
            }
        }

        // 未匹配
        return { type: 'error', message: '暂不支持的链接: ' + url };
    } catch {
        return { type: 'error', message: '无效链接: ' + url };
    }
}