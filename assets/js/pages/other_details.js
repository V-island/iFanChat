// import BScroll from 'better-scroll';
import Template from 'art-template/lib/template-web';
import EventEmitter from '../eventEmitter';

import {
    getLangConfig
} from '../lang';

import {
    personInfo
} from '../api';

import {
    extend,
    createDom,
    addEvent,
    getVariableFromUrl
} from '../util';

const LANG = getLangConfig();

export default class OtherDetails extends EventEmitter {
	constructor(element, options) {
	    super();

	    this.data = {};
	    this.options = {
	    	btnAddAttentionClass: 'btn-add-attention',
	    	iconAttentionClass: 'live-attention',
            iconAddAttentionClass: 'live-add-attention'
        };

	    extend(this.options, options);
	    extend(this.data, LANG);

	    this.init(element);

	}

	init(element) {
		const { userid } = getVariableFromUrl();
		console.log(`这个用户ID为${userid}`);

		let getPersonInfo = personInfo();

		Promise.all([getPersonInfo]).then((data) => {
			this.data.UserInfo = data[0] ? data[0] : false;

			this.OtherDetailsEl = createDom(Template.render(element, this.data));
			this.trigger('pageLoadStart', this.OtherDetailsEl);
			this._init();
		});
	}

	_init() {
		// this.listItemEl = this.OtherDetailsEl.getElementsByClassName(this.options.listItemClass);
		// this.btnAddAttentionEl = this.OtherDetailsEl.getElementsByClassName(this.options.btnAddAttentionClass)[0];
		// this._bindEvent();
	}

	_bindEvent() {
		// 加关注
		addEvent(this.btnAddAttentionEl, 'click', () => {
		    let index = getData(this.btnAddAttentionEl, 'id'),
		        status;

		    if (hasClass(this.btnAddAttentionEl, this.options.iconAttentionClass)) {
		        removeClass(this.btnAddAttentionEl, this.options.iconAttentionClass);
		        addClass(this.btnAddAttentionEl, this.options.iconAddAttentionClass);
		        status = 1;
		    }else {
		        removeClass(this.btnAddAttentionEl, this.options.iconAddAttentionClass);
		        addClass(this.btnAddAttentionEl, this.options.iconAttentionClass);
		        status = 2;
		    }
		    follow(index, status);
		});
	}

	static attachTo(element, options) {
	    return new OtherDetails(element, options);
	}
}