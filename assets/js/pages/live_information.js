import Template from 'art-template/lib/template-web';
import EventEmitter from '../eventEmitter';

import {
    getLangConfig
} from '../lang';

import {
    uploadVideo
} from '../api';

import {
    extend,
    createDom
} from '../util';

const LANG = getLangConfig();

export default class LiveInformation extends EventEmitter {
	constructor(element, options) {
	    super();

	    this.options = {
    		navsWrapper: '.navs-wrapper',
        };

	    extend(this.options, options);
	    extend(this.data, LANG);

	    this._init(element);

	}

	_init(element) {
		this.LiveInformationEl = createDom(Template.render(element, LANG));
		setTimeout(() => {
			this.trigger('pageLoadStart', this.LiveInformationEl);
		}, 0);
	}

	static attachTo(element, options) {
	    return new LiveInformation(element, options);
	}
}