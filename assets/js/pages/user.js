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

export default class User extends EventEmitter {
	constructor(element, options) {
	    super();

	    this.options = {
    		data: []
        };

	    extend(this.options, options);

	    this._init(element);

	}

	_init(element) {
		this.UserEl = createDom(Template.render(element, LANG));
		setTimeout(() => {
			this.trigger('pageLoadStart', this.UserEl);
		}, 0);
	}

	static attachTo(element, options) {
	    return new User(element, options);
	}
}