import {
    getLangConfig
} from './lang';

const LANG = getLangConfig();

const REGEXP_SPACES = /\s+/;
const REGEXP_TOKENS = /(Y|M|D|H|m|s|S)\1+/g;
const REGEXP_HYPHEN = /([a-z\d])([A-Z])/g;
const toString = Object.prototype.toString;
const hasOwnProperty = Object.prototype.hasOwnProperty;

// 刷新页面
export function refreshURL() {
    return window.location.reload();
};

// 判断是否为手机号
export function isPoneAvailable(pone) {
    var myreg = /^[1][3,4,5,7,8][0-9]{9}$/;
    if (!myreg.test(pone)) {
        return false;
    } else {
        return true;
    }
};


// 倒计时60s
export function addCountdown(element, val) {
    if (val == 0) {
        element.removeClass('disabled');
        element.text(LANG.PUBLIC.Froms.Telephone.Verification);
        return false;
    } else {
        element.text(val + 's');
        val--;
        setTimeout(function() {
            addCountdown(element, val)
        }, 1000)
    }
};

//用于生成uuid
function S4() {
    return (((1 + Math.random()) * 0x10000) | 0).toString(16).substring(1);
}
export function getUuid() {
    return (S4() + "-" + S4() + "-" + S4() + S4());
}

// 保存
export function setLocalStorage(name, data) {
    return localStorage.setItem(name, JSON.stringify(data));
}

// 获取
export function getLocalStorage(name) {
    let data = localStorage.getItem(name);
    return JSON.parse(data);
}

// 删除
export function removeLocalStorage(name) {
    return localStorage.removeItem(name);
}

// 删除全部
export function clearLocalStorage(name) {
    return localStorage.clear();
}

/**
 * import html 导入
 * @param  {[type]}   param    [description]
 * @param  {Function} callback [description]
 * @return {[type]}            [description]
 */
export function importTemplate(param, callback) {
    let self = this;

    let link = document.createElement('link');
    let Tpl = {};
    link.rel = 'import';
    link.id = param.name;
    link.href = param.path;

    link.onload = function(e) {
        console.log('Loaded import: ' + e.target.href);
        let _target = e.target.import;

        if (typeof(_target.head) != 'undefined' && _target.head != '') {
            for (let i = 0; i < _target.head.children.length; i++) {
                callback(_target.head.children[i].id, replaceNote(_target.head.children[i].innerHTML));
            }
        }

        //加载完成后清除头部引用
        if (!link.readyState || 'link' === link.readyState || 'complete' === link.readyState) {
            link.onload = link.onreadystatechange = null;
            link.parentNode.removeChild(link);
        }
    };
    link.onerror = function(e) {
        console.error(MSG.errorsupport + e.target.href);
        return false;
    };
    document.head.appendChild(link);
}

/**
 * 解析FORM参数
 * @example  phoneCode=1&userPhone=123456
 * @return Object {phoneCode:1,userPhone:123456}
 * */
export function urlParse(data) {
    let obj = {};
    let arr = data.match(/[^?&]+=[^?&]+/g);
    if (arr) {
        arr.forEach((item) => {
            let tempArr = item.substring(0).split('=');
            let key = decodeURIComponent(tempArr[0]);
            let val = decodeURIComponent(tempArr[1]);
            obj[key] = val;
        });
    }
    return obj;
};

/**
 * 去注释以及style script 换行符 标签空格
 * @param  {[type]} str [description]
 * @return {[type]}     [description]
 */
export function replaceNote(str) {
    return str.replace(/(\n)/g, '')
        .replace(/(\t)/g, '')
        .replace(/(\r)/g, '')
        .replace(/<!--[\s\S]*?--\>/g, '')
        .replace(/<style[^>]*>[\s\S]*?<\/[^>]*style>/gi, '')
        //.replace(/<script[^>]*>[\s\S]*?<\/[^>]*script>/gi,'')
        .replace(/>\s*/g, '>')
        .replace(/\s*</g, '<')
        .replace(/&amp;/g, "&")
        .replace(/&lt;/g, '<')
        .replace(/&gt;/g, '>')
        .replace(/&nbsp;/g, ' ')
        .replace(/&#39;/g, "\'")
        .replace(/&quot;/g, "\"")
        .replace(/(^\s*)|(\s*$)/g, "");
};

export function compareVersion(a, b) {
    var as = a.split('.');
    var bs = b.split('.');
    if (a === b) return 0;

    for (var i = 0; i < as.length; i++) {
        var x = parseInt(as[i]);
        if (!bs[i]) return 1;
        var y = parseInt(bs[i]);
        if (x < y) return -1;
        if (x > y) return 1;
    }
    return -1;
};

export function getCurrentPage() {
    return $(".page-current")[0] || $(".page")[0] || document.body;
};

export function createDom(tpl) {
    let container = document.createElement('div');
    container.innerHTML = tpl;
    return container.childNodes[0];
};

export function addEvent(el, type, fn, capture) {
    el.addEventListener(type, fn, !!capture);
};

export function removeEvent(el, type, fn, capture) {
    el.removeEventListener(type, fn, !!capture);
};

export function typeOf(obj) {
    return toString.call(obj).slice(8, -1).toLowerCase();
}

export function isObject(obj) {
    return typeof obj === 'object' && obj !== null;
}

export function isFunction(fn) {
    return typeof fn === 'function';
}

export function isNumber(num) {
    return typeof num === 'number' && !isNaN(num);
}

export function isDate(date) {
    return typeOf(date) === 'date';
}

export function isValidDate(date) {
    return isDate(date) && date.toString() !== 'Invalid Date';
}

export function isLeapYear(year) {
    return (year % 4 === 0 && year % 100 !== 0) || year % 400 === 0;
}

export function isPlainObject(obj) {
    if (!isObject(obj)) {
        return false;
    }

    try {
        const constructor = obj.constructor;
        const prototype = constructor.prototype;

        return constructor && prototype && hasOwnProperty.call(prototype, 'isPrototypeOf');
    } catch (e) {
        return false;
    }
}

export function extend(obj, ...args) {
    const deep = obj === true;

    if (deep) {
        obj = args.shift();
    }

    if (isObject(obj) && args.length > 0) {
        args.forEach((arg) => {
            if (isObject(arg)) {
                Object.keys(arg).forEach((key) => {
                    if (deep && isObject(obj[key])) {
                        extend(true, obj[key], arg[key]);
                    } else {
                        obj[key] = arg[key];
                    }
                });
            }
        });
    }

    return obj;
}

export function hasClass(element, value) {
    return element.classList ?
        element.classList.contains(value) :
        element.className.indexOf(value) > -1;
}

export function addClass(element, value) {
    if (!value) {
        return;
    }

    if (element.classList) {
        element.classList.add(value);
        return;
    }

    const className = element.className.trim();

    if (!className) {
        element.className = value;
    } else if (className.indexOf(value) < 0) {
        element.className = `${className} ${value}`;
    }
}

export function removeClass(element, value) {
    if (!value) {
        return;
    }

    if (element.classList) {
        element.classList.remove(value);
        return;
    }

    const className = element.className;

    if (className.indexOf(value) > -1) {
        element.className = className.replace(value, '').trim();
    }
}

export function showHideDom(element, value) {
    if (!value) {
        return;
    }
    return element.style.display = value;
}

export function toggleClass(element, value, added) {
    if (!value) {
        return;
    }

    // IE10-11 doesn't support the second parameter of `classList.toggle`
    if (added) {
        addClass(element, value);
    } else {
        removeClass(element, value);
    }
}

export function toHyphenCase(str) {
    return str.replace(REGEXP_HYPHEN, '$1-$2').toLowerCase();
}

export function getData(element, name) {
    if (isObject(element[name])) {
        return element[name];
    } else if (element.dataset) {
        return element.dataset[name];
    }

    return element.getAttribute(`data-${toHyphenCase(name)}`);
}

export function setData(element, name, data) {
    if (isObject(data)) {
        element[name] = data;
    } else if (element.dataset) {
        element.dataset[name] = data;
    } else {
        element.setAttribute(`data-${toHyphenCase(name)}`, data);
    }
}

export function removeData(element, name) {
    if (isObject(element[name])) {
        delete element[name];
    } else if (element.dataset) {
        delete element.dataset[name];
    } else {
        element.removeAttribute(`data-${toHyphenCase(name)}`);
    }
}

export function removeListener(element, type, handler) {
    const types = type.trim().split(REGEXP_SPACES);

    if (types.length > 1) {
        types.forEach(t => removeListener(element, t, handler));
        return;
    }

    if (element.removeEventListener) {
        element.removeEventListener(type, handler, false);
    } else if (element.detachEvent) {
        element.detachEvent(`on${type}`, handler);
    }
}

export function addListener(element, type, handler, once) {
    const types = type.trim().split(REGEXP_SPACES);
    const originalHandler = handler;

    if (types.length > 1) {
        types.forEach(t => addListener(element, t, handler));
        return;
    }

    if (once) {
        handler = (...args) => {
            removeListener(element, type, handler);

            return originalHandler.apply(element, args);
        };
    }

    element.addEventListener(type, handler, false);
}

export function dispatchEvent(element, type, data) {
    let event;

    // Event and CustomEvent on IE9-11 are global objects, not constructors
    if (typeof Event === 'function' && typeof CustomEvent === 'function') {
        if (data === undefined) {
            event = new Event(type, {
                bubbles: true,
                cancelable: true,
            });
        } else {
            event = new CustomEvent(type, {
                detail: data,
                bubbles: true,
                cancelable: true,
            });
        }
    } else if (data === undefined) {
        event = document.createEvent('Event');
        event.initEvent(type, true, true);
    } else {
        event = document.createEvent('CustomEvent');
        event.initCustomEvent(type, true, true, data);
    }

    // IE9+
    return element.dispatchEvent(event);
}

export function empty(element) {
    while (element.firstChild) {
        element.removeChild(element.firstChild);
    }
}

export function getDaysInMonth(year, month) {
    return [31, (isLeapYear(year) ? 29 : 28), 31, 30, 31, 30, 31, 31, 30, 31, 30, 31][month];
}

export function addLeadingZero(value, length = 1) {
    const str = String(Math.abs(value));
    let i = str.length;
    let result = '';

    if (value < 0) {
        result += '-';
    }

    while (i++ < length) {
        result += '0';
    }

    return result + str;
}

export function tokenToType(token) {
    return {
        Y: 'year',
        M: 'month',
        D: 'day',
        H: 'hour',
        m: 'minute',
        s: 'second',
        S: 'millisecond',
    }[token.charAt(0)];
}

export function parseFormat(format) {
    const tokens = format.match(REGEXP_TOKENS);

    if (!tokens) {
        throw new Error('Invalid format');
    }

    const result = {
        tokens,
    };

    tokens.forEach((token) => {
        result[tokenToType(token)] = token;
    });

    return result;
}