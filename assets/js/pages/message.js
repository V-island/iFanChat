import Template from 'art-template/lib/template-web';
import EventEmitter from '../eventEmitter';

import {
    getLangConfig
} from '../lang';

import {
    extend,
    createDom
} from '../util';

const LANG = getLangConfig();

export default class Message extends EventEmitter {
	constructor(element, options) {
	    super();

	    this.options = {
    		data: []
        };

	    extend(this.options, options);

	    this._init(element);
	}

	_init(element) {
		console.log('这里是登录js');
		this.MessageEl = createDom(Template.render(element, LANG));
	    setTimeout(() => {
	    	this.trigger('pageLoadStart', this.MessageEl);
	    }, 0);
	}

	static attachTo(element, options) {
	    return new Message(element, options);
	}
}