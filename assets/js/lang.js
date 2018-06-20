// lang
import en from './lang/EN';
import zh_cn from './lang/ZH-CN';

const ITEM = 'Lang';
const COUNTRY = 'Country_code';
const DEFAULT = {
	lang: en
};
const LANG = {
	'en': en,
	'zh_cn': zh_cn
};

/**
 * 获取localStorage语言包
 * @return {[type]} [description]
 */
export function getLangConfig() {
    let lang = localStorage.getItem(ITEM);

    if (lang) {
		return JSON.parse(lang);
    }else {
    	localStorage.setItem(ITEM, JSON.stringify(DEFAULT.lang));
    	return en;
    }
};

/**
 * 切换localStorage语言包
 * @return {[type]} [description]
 */
export function setLangConfig(lang) {
    const _lang = LANG[lang] || en;
    console.log(_lang);
    localStorage.setItem(ITEM, JSON.stringify(_lang));
};