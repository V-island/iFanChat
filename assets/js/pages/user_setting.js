import Template from 'art-template/lib/template-web';
import EventEmitter from '../eventEmitter';

import {
    getLangConfig
} from '../lang';

import {
    personCenter,
    appLoginOut
} from '../api';

import {
    extend,
    createDom,
    addEvent
} from '../util';

const LANG = getLangConfig();

export default class UserSetting extends EventEmitter {
	constructor(element, options) {
	    super();

	    this.data = {};
	    this.options = {
	    	itemSecurityClass: 'item-security',
	    	itemNotificationClass: 'item-notification',
	    	itemSoundClass: 'item-sound',
	    	itemShockClass: 'item-shock',
	    	itemHelpClass: 'item-help',
	    	itemSuggestionClass: 'item-suggestion',
	    	itemAboutMeClass: 'item-about-me',
	    	itemQuitClass: 'item-quit'
        };

	    extend(this.options, options);
	    extend(this.data, LANG);

	    this.init(element);

	}

	init(element) {
		let getUserInfo = personCenter();

		getUserInfo.then((data) => {
			this.data.UserInfo = data ? data : false;
			this.UserSettingEl = createDom(Template.render(element, this.data));
			this.trigger('pageLoadStart', this.UserSettingEl);
			this._init();
		});
	}

	_init() {
		this.itemSecurityEl = this.UserSettingEl.getElementsByClassName(this.options.itemSecurityClass)[0];
		this.itemNotificationEl = this.UserSettingEl.getElementsByClassName(this.options.itemNotificationClass)[0];
		this.itemSoundEl = this.UserSettingEl.getElementsByClassName(this.options.itemSoundClass)[0];
		this.itemShockEl = this.UserSettingEl.getElementsByClassName(this.options.itemShockClass)[0];
		this.itemHelpEl = this.UserSettingEl.getElementsByClassName(this.options.itemHelpClass)[0];
		this.itemSuggestionEl = this.UserSettingEl.getElementsByClassName(this.options.itemSuggestionClass)[0];
		this.itemAboutMeEl = this.UserSettingEl.getElementsByClassName(this.options.itemAboutMeClass)[0];
		this.itemQuitEl = this.UserSettingEl.getElementsByClassName(this.options.itemQuitClass)[0];

		this._bindEvent();
	}

	_bindEvent() {

		addEvent(this.itemSecurityEl, 'click', () => {
			
        });

		addEvent(this.itemNotificationEl, 'click', () => {
			
        });

        addEvent(this.itemSoundEl, 'click', () => {
			
        });

        addEvent(this.itemShockEl, 'click', () => {
			
        });

        addEvent(this.itemHelpEl, 'click', () => {
			
        });

        addEvent(this.itemSuggestionEl, 'click', () => {
			
        });

        addEvent(this.itemAboutMeEl, 'click', () => {
			
        });

        addEvent(this.itemQuitEl, 'click', () => {
			appLoginOut();
        });
	}

	static attachTo(element, options) {
	    return new UserSetting(element, options);
	}
}