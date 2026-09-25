// src/services/upload.js
// 知乎图片上传：md5 → 申请上传许可 → 已存在则轮询取 src，否则签名直传阿里云 OSS → 通知服务器 → 轮询取 src。
import CryptoJS from 'crypto-js';
import $http from '@/services/http.js';
import { getZhihuInstance } from '@/services/zhihu/module.js';

const OSS_UPLOAD_URL = 'https://zhihu-pics-upload.zhimg.com';
const OSS_BUCKET = 'zhihu-pics';
const OSS_USER_AGENT = 'aliyun-sdk-js/6.8.0';
const MAX_POLL = 10;
// MD5 在主线程算，过大的图会把界面冻住数秒才失败
const MAX_IMAGE_BYTES = 20 * 1024 * 1024;

// OSS 要求 RFC1123 GMT 时间
const ossDate = () => new Date().toUTCString();

const ossSign = (accessKey, stringToSign) =>
    CryptoJS.enc.Base64.stringify(CryptoJS.HmacSHA1(stringToSign, accessKey));

// 轮询 /images/{id} 直到拿到 src
async function waitForImageSrc(imageId, onProgress, signal) {
    for (let i = 0; i < MAX_POLL; i++) {
        try {
            const res = await $http.get(`https://api.zhihu.com/images/${imageId}`, { signal });
            if (res?.original_hash) return `https://pic4.zhimg.com/${res.original_hash}`;
            if (res?.src) return res.src;
        } catch (e) {
            if (e?.name === 'AbortError') throw e;
            /* 未就绪，继续重试 */
        }
        onProgress?.((i + 1) / MAX_POLL);
        await new Promise((r) => setTimeout(r, 1000));
    }
    return null;
}

// 用签名头 PUT 到 OSS（跨域，不能用知乎请求栈的头/签名）
async function ossPutObject(objectKey, blob, contentType, token, signal) {
    const date = ossDate();
    const canonicalizedResource = `/${OSS_BUCKET}/${objectKey}`;
    const canonicalizedOSSHeaders =
        `x-oss-date:${date}\n` +
        `x-oss-security-token:${token.access_token}\n` +
        `x-oss-user-agent:${OSS_USER_AGENT}`;

    const stringToSign =
        `PUT\n\n${contentType}\n${date}\n${canonicalizedOSSHeaders}\n${canonicalizedResource}`;
    const signature = ossSign(token.access_key, stringToSign);

    const res = await fetch(`${OSS_UPLOAD_URL}/${objectKey}`, {
        method: 'PUT',
        headers: {
            'Content-Type': contentType,
            'Authorization': `OSS ${token.access_id}:${signature}`,
            'x-oss-date': date,
            'x-oss-security-token': token.access_token,
            'x-oss-user-agent': OSS_USER_AGENT,
        },
        body: blob,
        signal,
    });
    return res.ok;
}

/**
 * 上传图片，返回可用 URL。
 * @param {File} file
 * @param {(ratio:number)=>void} [onProgress]
 * @param {AbortSignal} [signal] 取消上传（关闭弹层等），中止时以 AbortError 抛出
 * @returns {Promise<{url:string, isGif:boolean}|null>}
 */
export async function uploadImage(file, onProgress, signal) {
    if (!file) return null;
    if (file.size > MAX_IMAGE_BYTES) throw new Error('图片超过 20MB，请压缩后再发送');
    const isGif = file.type === 'image/gif';

    // 1. md5（读取为 ArrayBuffer 后十六进制）
    const buffer = await file.arrayBuffer();
    const wordArray = CryptoJS.lib.WordArray.create(buffer);
    const imageHash = CryptoJS.MD5(wordArray).toString();

    const instance = getZhihuInstance();

    // 2. 申请上传许可
    const permit = await instance.post(
        'https://api.zhihu.com/images',
        JSON.stringify({ image_hash: imageHash, source: 'article' })
    );
    const uploadFile = permit?.upload_file;
    if (!uploadFile) return null;

    // 3. 已存在直接取 src
    if (uploadFile.state === 1 && uploadFile.image_id) {
        const url = await waitForImageSrc(uploadFile.image_id, onProgress, signal);
        return url ? { url, isGif } : null;
    }

    // 4. 不存在则直传 OSS
    const token = permit.upload_token;
    if (!token || !uploadFile.object_key || !uploadFile.image_id) return null;

    const contentType = file.type || 'image/jpeg';
    const ok = await ossPutObject(uploadFile.object_key, file, contentType, token, signal);
    if (!ok) return null;

    // 5. 通知服务器已上传
    await instance.put(
        `https://api.zhihu.com/images/${uploadFile.image_id}/uploading_status`,
        JSON.stringify({ upload_result: 'success' })
    );

    // 6. 轮询取 src
    const url = await waitForImageSrc(uploadFile.image_id, onProgress, signal);
    return url ? { url, isGif } : null;
}
