import Template from 'art-template/lib/template-web';
import EventEmitter from '../eventEmitter';
import Swiper from 'swiper';

import {
    getLangConfig
} from '../lang';

import {
	Pay,
    personCenter,
    selAllGoods,
    createOrder
} from '../api';

import {
    extend,
    createDom,
    addEvent,
    hasClass,
    addClass,
    removeClass,
    toggleClass,
    setData,
    getData
} from '../util';

const LANG = getLangConfig();

export default class UserAccount extends EventEmitter {
	constructor(element, options) {
	    super();

	    this.data = {};
	    this.options = {
	    	tagsClass: '.tag',
	    	tagLabelClass: 'recharge-label',
	    	listClass: '.list',
	    	listItemClass: 'list-item',
	    	btnConfirmClass: 'btn-confirm',
	    	dataIndex: 'id',
	    	showClass: 'active'
        };

	    extend(this.options, options);
	    extend(this.data, LANG);

	    this.init(element);

	}

	init(element) {
		this.goodsId = null;
		this.payType = null;

		let getUserInfo = personCenter();
		let getselAllGoods = selAllGoods();

		Promise.all([getUserInfo, getselAllGoods]).then((data) => {
			this.data.UserInfo = data[0] ? data[0] : false;
			this.data.AllGoodsList = data[1] ? data[1] : false;

			this.UserAccountEl = createDom(Template.render(element, this.data));
			this.trigger('pageLoadStart', this.UserAccountEl);
			this._init();
		});
	}

	_init() {
		this.tagsEl = this.UserAccountEl.querySelector(this.options.tagsClass);
		this.tagLabelEl = this.tagsEl.getElementsByClassName(this.options.tagLabelClass);

		this.listEl = this.UserAccountEl.querySelector(this.options.listClass);
		this.listItemEl = this.listEl.getElementsByClassName(this.options.listItemClass);

		this.btnConfirmEl = this.UserAccountEl.getElementsByClassName(this.options.btnConfirmClass)[0];

		this._bindEvent();
	}

	_bindEvent() {
		Array.prototype.slice.call(this.tagLabelEl).forEach(labelEl => {
			addEvent(labelEl, 'click', () => {
				if (hasClass(labelEl, this.options.showClass)) return false;

				const activeLabelEl = this.tagsEl.getElementsByClassName(this.options.showClass)[0];

				if (activeLabelEl) {
					removeClass(activeLabelEl, this.options.showClass);
				}
				this.goodsId = parseInt(getData(labelEl, this.options.dataIndex));
				addClass(labelEl, this.options.showClass);
	        });
		});

		Array.prototype.slice.call(this.listItemEl).forEach(itemEl => {
			addEvent(itemEl, 'click', () => {
				if (hasClass(itemEl, this.options.showClass)) return false;

				const activeitemEl = this.listEl.getElementsByClassName(this.options.showClass)[0];

				if (activeitemEl) {
					removeClass(activeitemEl, this.options.showClass);
				}
				this.payType = parseInt(getData(itemEl, this.options.dataIndex));
				addClass(itemEl, this.options.showClass);
	        });
		});

		addEvent(this.btnConfirmEl, 'click', () => {
			if (this.goodsId === null && this.payType === null) return false;

			createOrder(this.goodsId, this.payType).then((data) => {
				console.log(data);
			});
        });
	}

	static attachTo(element, options) {
	    return new UserAccount(element, options);
	}
}