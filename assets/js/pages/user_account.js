import Template from 'art-template/lib/template-web';
import EventEmitter from '../eventEmitter';
import Swiper from 'swiper';

import {
    getLangConfig
} from '../lang';

import {
    personCenter,
    getAdvertisement
} from '../api';

import {
    extend,
    createDom,
    addEvent
} from '../util';

const LANG = getLangConfig();

export default class UserAccount extends EventEmitter {
	constructor(element, options) {
	    super();

	    this.data = {};
	    this.options = {
	    	bannerWrapper: '.banner',
	    	bannerContent: 'banner-box',
	    	bannerItem: 'banner-item',
	    	bannerPagination: '.banner-pagination',
	    	showClass: 'active'
        };

	    extend(this.options, options);
	    extend(this.data, LANG);

	    this.init(element);

	}

	init(element) {
		let getUserInfo = personCenter();
		let getUserAdvertisement = getAdvertisement();

		Promise.all([getUserInfo, getUserAdvertisement]).then((data) => {
			this.data.UserInfo = data[0] ? data[0] : false;
			this.data.AdvertisementList = data[1] ? data[1] : false;
			this.UserAccountEl = createDom(Template.render(element, this.data));
			this.trigger('pageLoadStart', this.UserAccountEl);
			this._init();
		});
	}

	_init() {
		// this.listItemEl = this.UserAccountEl.getElementsByClassName(this.options.listItemClass);

		this._bannerSwiper();
		this._bindEvent();
	}

	_bindEvent() {

	}

	// banner 模块
	_bannerSwiper() {
		let bannerSwiper = new Swiper(this.options.bannerWrapper, {
			wrapperClass: this.options.bannerContent,
			slideClass: this.options.bannerItem,
			slideActiveClass: this.options.showClass,
			loop: true,
			pagination: false
		})
	}

	static attachTo(element, options) {
	    return new UserAccount(element, options);
	}
}