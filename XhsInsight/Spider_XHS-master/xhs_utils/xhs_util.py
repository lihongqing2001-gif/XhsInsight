# -*- coding: utf-8 -*-
import json
import math
import random
import execjs
import os
from xhs_utils.cookie_util import trans_cookies

# ================= 核心修复区域 =================
# 获取当前文件 (xhs_util.py) 的绝对路径
current_dir = os.path.dirname(os.path.abspath(__file__))
# 定位到 static 文件夹的绝对路径 (上一级目录的 static)
static_path = os.path.join(current_dir, '..', 'static')

# 1. 加载核心 JS (xhs_xs_xsc_56.js)
js_file_path = os.path.join(static_path, 'xhs_xs_xsc_56.js')
try:
    with open(js_file_path, 'r', encoding='utf-8') as f:
        js = execjs.compile(f.read())
except Exception as e:
    print(f"❌ 加载 JS 失败: {js_file_path}")
    raise e

# 2. 加载 Xray JS (xhs_xray.js) - 这里之前也会报错，一并修好
xray_file_path = os.path.join(static_path, 'xhs_xray.js')
try:
    with open(xray_file_path, 'r', encoding='utf-8') as f:
        xray_js = execjs.compile(f.read())
except Exception as e:
    print(f"❌ 加载 Xray JS 失败: {xray_file_path}")
    # 为了防止崩溃，如果没有 xray，给个空的 compiled 对象（虽然可能会影响部分功能）
    xray_js = None
# ==============================================

def generate_x_b3_traceid(len=16):
    x_b3_traceid = ""
    for t in range(len):
        x_b3_traceid += "abcdef0123456789"[math.floor(16 * random.random())]
    return x_b3_traceid

def generate_xs_xs_common(a1, api, data='', method='POST'):
    ret = js.call('get_request_headers_params', api, data, a1, method)
    xs, xt, xs_common = ret['xs'], ret['xt'], ret['xs_common']
    return xs, xt, xs_common

def generate_xs(a1, api, data=''):
    ret = js.call('get_xs', api, data, a1)
    xs, xt = ret['X-s'], ret['X-t']
    return xs, xt

def generate_xray_traceid():
    if xray_js:
        return xray_js.call('traceId')
    return ""

def get_common_headers():
    return {
        "authority": "www.xiaohongshu.com",
        "accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.7",
        "accept-language": "zh-CN,zh;q=0.9",
        "cache-control": "no-cache",
        "pragma": "no-cache",
        "referer": "https://www.xiaohongshu.com/",
        "sec-ch-ua": "\"Chromium\";v=\"122\", \"Not(A:Brand\";v=\"24\", \"Google Chrome\";v=\"122\"",
        "sec-ch-ua-mobile": "?0",
        "sec-ch-ua-platform": "\"Windows\"",
        "sec-fetch-dest": "document",
        "sec-fetch-mode": "navigate",
        "sec-fetch-site": "same-origin",
        "sec-fetch-user": "?1",
        "upgrade-insecure-requests": "1",
        "user-agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36"
    }

def get_request_headers_template():
    return {
        "authority": "edith.xiaohongshu.com",
        "accept": "application/json, text/plain, */*",
        "accept-language": "zh-CN,zh;q=0.9,en;q=0.8,en-GB;q=0.7,en-US;q=0.6",
        "cache-control": "no-cache",
        "content-type": "application/json;charset=UTF-8",
        "origin": "https://www.xiaohongshu.com",
        "pragma": "no-cache",
        "referer": "https://www.xiaohongshu.com/",
        "sec-ch-ua": "\"Not A(Brand\";v=\"99\", \"Microsoft Edge\";v=\"121\", \"Chromium\";v=\"121\"",
        "sec-ch-ua-mobile": "?0",
        "sec-ch-ua-platform": "\"Windows\"",
        "sec-fetch-dest": "empty",
        "sec-fetch-mode": "cors",
        "sec-fetch-site": "same-site",
        "user-agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/121.0.0.0 Safari/537.36 Edg/121.0.0.0",
        "x-b3-traceid": "",
        "x-mns": "unload",
        "x-s": "",
        "x-s-common": "",
        "x-t": "",
        "x-xray-traceid": generate_xray_traceid()
    }

def generate_headers(a1, api, data='', method='POST'):
    xs, xt, xs_common = generate_xs_xs_common(a1, api, data, method)
    x_b3_traceid = generate_x_b3_traceid()
    headers = get_request_headers_template()
    headers['x-s'] = xs
    headers['x-t'] = str(xt)
    headers['x-s-common'] = xs_common
    headers['x-b3-traceid'] = x_b3_traceid
    if data:
        data = json.dumps(data, separators=(',', ':'), ensure_ascii=False)
    return headers, data

def generate_request_params(cookies_str, api, data='', method='POST'):
    cookies = trans_cookies(cookies_str)
    a1 = cookies['a1']
    headers, data = generate_headers(a1, api, data, method)
    return headers, cookies, data

def splice_str(api, params):
    url = api + '?'
    for key, value in params.items():
        if value is None:
            value = ''
        url += key + '=' + value + '&'
    return url[:-1]
