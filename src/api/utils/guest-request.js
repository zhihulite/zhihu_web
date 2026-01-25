import { tokenManager } from '../auth.js'
import { getLAESInstance } from './laes_utils.js'
import CryptoJS from 'crypto-js'

const appVersion = '10.12.0'
const apiVersion = '101_1_1.0'
const appBuild = '21210'
const appBundle = 'com.zhihu.android'
const appID = '1355'
const platformId = '12'
const unifiedFetch = window.unifiedFetch

const x_app_za = `OS=Android&Release=15&Model=Pixel&VersionName=${appVersion}&VersionCode=${appBuild}&Product=${appBundle}&Installer=Google+Play&DeviceType=AndroidPhone`
const user_agent = `${appBundle}/Futureve/${appVersion} Mozilla/5.0 (Linux; Android; wv) AppleWebKit/537.36 (KHTML, like Gecko) Version/4.0 Chrome/57.0.1000.10 Mobile Safari/537.36`

function randInt(min, max) { return Math.floor(Math.random() * (max - min + 1)) + min }
function generateRandomHex(length) { return Array.from({ length }, () => Math.floor(Math.random() * 16).toString(16)).join('').toUpperCase() }

function generateZhihuFormdata() {
  const fr_mem = generateRandomNumber(100, 500); // 剩余内存100-500MB
  const tt_mem = generateRandomNumber(400, 800); // 总内存400-800MB
  const storage = generateRandomNumber(50, 200); // 存储空间50-200GB
  const fr_st = storage * 1000; // 转换为MB单位
  const tt_st = (storage + generateRandomNumber(20, 100)) * 1000; // 总存储稍大

  const params = new URLSearchParams({
    app_build: appBuild,
    app_ticket: 'fetch empty',
    app_version: appVersion,
    bt_ck: '1',
    bundle_id: appBundle,
    cp_ct: '8',
    cp_fq: '3000000',
    cp_tp: '0',
    cp_us: '35',
    d_n: 'Pixel9',
    fr_mem: String(fr_mem),
    fr_st: String(fr_st),
    latitude: '0',
    longitude: '0',
    mcc: 'cn',
    nt_st: '1',
    oaid: generateRandomHex(32),
    ph_br: 'Google',
    ph_md: 'Pixel 9',
    ph_os: 'Android 15',
    ph_sn: 'unknown',
    pre_install: 'undefined',
    pvd_nm: '中国移动',
    tt_mem: String(tt_mem),
    tt_st: String(tt_st),
    tz_of: '28800',
    zx_expired: '0'
  })
  return params.toString()
}

function hmacSha1Hex(key, message) {
  return CryptoJS.HmacSHA1(message, key).toString(CryptoJS.enc.Hex)
}

function generateZhihuSignature(apiVersion, udid, backupDeviceId, deviceInfo, clientId, timestamp, secretKey) {
  let signatureBase
  if (!udid) {
    signatureBase = !backupDeviceId
      ? `${clientId}${apiVersion}${deviceInfo}${timestamp}`
      : `${clientId}${backupDeviceId}${deviceInfo}${timestamp}`
  } else {
    signatureBase = `${clientId}${apiVersion}${deviceInfo}${udid}${timestamp}`
  }
  signatureBase = '13552app_build=21210&app_ticket=fetch+empty&app_version=10.12.0&bt_ck=1&bundle_id=com.zhihu.android&cp_ct=8&cp_fq=3000000&cp_tp=0&cp_us=35&d_n=Pixel9&fr_mem=154&fr_st=57000&latitude=0&longitude=0&mcc=cn&nt_st=1&oaid=228BACA61B39B3F2949C3E2A065FAD46&ph_br=Google&ph_md=Pixel+9&ph_os=Android+15&ph_sn=unknown&pre_install=undefined&pvd_nm=%E4%B8%AD%E5%9B%BD%E7%A7%BB%E5%8A%A8&tt_mem=507&tt_st=124000&tz_of=28800&zx_expired=01769316411'
  const hash = CryptoJS.HmacSHA1(signatureBase, secretKey)
  return hash.toString(CryptoJS.enc.Hex)
}

function base64UrlSafe(input, lineLength = 76) {
  let result = input.replace(/\+/g, '-').replace(/\//g, '_')
  if (lineLength > 0) {
    result = result.replace(new RegExp(`(.{${lineLength}})`, 'g'), '$1\n')
    if (!result.endsWith('\n')) result += '\n'
  }
  return result
}

function b64(text) {
  const s = unescape(encodeURIComponent(text))
  return btoa(s)
}

function aesCbcNoPaddingEncryptToB64(inputLatin1, keyStr, ivStr) {
  const key = CryptoJS.enc.Utf8.parse(keyStr)
  const iv = CryptoJS.enc.Utf8.parse(ivStr)
  const data = CryptoJS.enc.Latin1.parse(inputLatin1)
  const encrypted = CryptoJS.AES.encrypt(data, key, { iv, padding: CryptoJS.pad.NoPadding, mode: CryptoJS.mode.CBC }).ciphertext
  return CryptoJS.enc.Base64.stringify(encrypted)
}

async function getZstInternal(laesDecryptZst, authorization, udid = '', zst82 = '', zst81 = '') {
  function makeGuid() {
    const a = new Uint8Array(16)
    crypto.getRandomValues(a)
    return Array.from(a, b => b.toString(16).padStart(2, '0')).join('')
  }

  const timestamp = Date.now().toString()
  const storage = randInt(50, 200)
  const fr_st = storage * 1000
  const tt_st = (storage + randInt(20, 100)) * 1000

  const postjson = {
    app_version: appVersion,
    icid: '0',
    timezone: '28800',
    api_version: '3.0.93',
    free_storage: String(fr_st),
    device_name: 'Pixel 9',
    app_build: appBuild,
    'MSA-OAID': generateRandomHex(32),
    noti_settings: '0',
    platform_id: platformId,
    guid: makeGuid(),
    action: zst82 ? 'ZST_AROUSE' : 'ZST_LAUNCH',
    total_storage: String(tt_st),
    is_dbg: 'false',
    cpu_usage: 'Infinity',
    app_id: appID,
    phone_sn: 'unknown'
  }

  const base64Data = base64UrlSafe(b64(JSON.stringify(postjson)))
  const remainder = base64Data.length % 16
  const padded = remainder === 0 ? base64Data : base64Data + '='.repeat(16 - remainder)
  const enc = base64UrlSafe(aesCbcNoPaddingEncryptToB64(padded, '8pf7FMb1hwkFj9ue7kqwnm84azWd5rE6', '8pf7FMb1hwkFj9ue'))

  const signature = hmacSha1Hex(
    'F1LiufZpstUlhDjSGu8PrgRQWyLd1d9E',
    appID + platformId + timestamp + enc + udid + zst82
  )

  const headers = {
    'X-REQ-TS': timestamp,
    'X-APP-ID': appID,
    'X-PLATFORM-ID': platformId,
    'X-REQ-SIGNATURE': signature,
    'X-Zse-93': apiVersion,
    'User-Agent': user_agent,
    'x-app-version': appVersion,
    'x-app-za': x_app_za,
    'Authorization': authorization,
    ...(udid && { 'x-udid': udid }),
    ...(zst82 && { 'X-ZST-82': zst82 }),
    ...(zst81 && { 'X-ZST-81': zst81 }),
    'Content-Type': 'application/x-www-form-urlencoded'
  }

  const json = await unifiedFetch.post('https://api.zhihu.com/zst/events/s', enc, {
    headers
  })
  const [r82, r81] = laesDecryptZst(json.st_ruid).split('|')
  if (!zst82) return getZstInternal(laesDecryptZst, authorization, udid, r82, r81)
  return [r82, r81]
}

export async function requestGuestCredential() {
  const laes = getLAESInstance()
  const LAESEncrypt = laes.createEncryptor(
    '541a3a5896fbefd351917c8251328a236a7efbf27d0fad8283ef59ef07aa386dbb2b1fcbba167135d575877ba0205a02f0aac2d31957bc7f028ed5888d4bbe69ed6768efc15ab703dc0f406b301845a0a64cf3c427c82870053bd7ba6721649c3a9aca8c3c31710a6be5ce71e4686842732d9314d6898cc3fdca075db46d1ccf3a7f9b20615f4a303c5235bd02c5cdc791eb123b9d9f7e72e954de3bcbf7d314064a1eced78d13679d040dd4080640d18c37bbde',
    [102, 48, 53, 53, 49, 56, 53, 54, 97, 97, 53, 55, 53, 102, 97, 97]
  )
  const LAESDecryptZst = laes.createDecryptor(
    '77e8887a0ac9d3cf70842988a86ac2ad1d3548f611e6f04901114f9016bb16703c4d9409ab4faea557ea2620be0260192300dda0bf2ce816955aa8731ebc8f3075f8776071db7903b58e4a9ce0cecb61701c04790229e39139a03e66f3a94b0f593b3635671a3744a4403f0e5a90fd90336bb4151fbdcd81cab5e44f0779516df90de17ad5c9e1089a9dd63534cc40280dd77733884e71dec6ebcaa4e4376f2473ed6393c3dff6cdf1613d7047b42223e5d552a1',
    '18df3016faf4869c'
  )
  const deviceInfo = generateZhihuFormdata()

  const timestamp = Math.floor(Date.now() / 1000).toString()
  const signature = generateZhihuSignature(
    "2",
    null,
    null,
    deviceInfo,
    appID,
    timestamp,
    'dd49a835-56e7-4a0f-95b5-efd51ea5397f'
  )

  const postdata = LAESEncrypt(signature)

  const headers = {
    'X-REQ-TS': timestamp,
    'x-app-id': appID,
    'x-sign-version': '2',
    'x-req-signature': signature,
    'X-Zse-93': apiVersion,
    'User-Agent': user_agent,
    'x-api-version': '3.0.93',
    'x-app-version': appVersion,
    'x-app-za': x_app_za,
    'Content-Type': 'application/x-www-form-urlencoded',
    'Authorization': 'oauth 8d5227e0aaaa4797a763ac64e0c3b8',
    'Cookie': ' '
  }

  const data = await unifiedFetch.post('https://api.zhihu.com/api/account/prod/init/udid_guest', postdata, {
    headers
  })

  const authorization = 'Bearer ' + data.guest.access_token
  const zsts = await getZstInternal(LAESDecryptZst, authorization, data.udid)

  localStorage.setItem('zhihu_udid', data.udid)
  localStorage.setItem('zhihu_zsts', JSON.stringify(zsts))
  tokenManager.saveTokens(data.guest.access_token, null, 86400, true, data)

  const current = tokenManager.getLoginData()
  return current
}

export async function ensureGuestCredential() {
  const current = tokenManager.getLoginData()
  if (current) return current
  return await requestGuestCredential()
}
