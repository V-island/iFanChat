import Template from 'art-template/lib/template-web';
import EventEmitter from '../eventEmitter';
import Record from '../record';
import {
    getLangConfig
} from '../lang';

import {
    findMyVideo
} from '../api';

import {
    extend,
    createDom,
    addEvent,
    getData
} from '../util';

const LANG = getLangConfig();

export default class UserVideo extends EventEmitter {
	constructor(element, options) {
	    super();

	    this.data = {};
	    this.options = {
	    	videoAddClass: 'video-add-card',
	    	videoCloseClass: 'btn-close-video',
	    	videoCloseClass: 'card-video'
        };

	    extend(this.options, options);
	    extend(this.data, LANG);

	    this.init(element);

	}

	init(element) {
		let getMyVideo = findMyVideo();

		getMyVideo.then((data) => {
			this.data.MyVideo = data;

			this.UserVideoEl = createDom(Template.render(element, this.data));
			this.trigger('pageLoadStart', this.UserVideoEl);
			this._init();
		});
	}

	_init() {
		this.videoAddEl = this.UserVideoEl.getElementsByClassName(this.options.videoAddClass)[0];
		this.videoCloseEl = this.UserVideoEl.getElementsByClassName(this.options.videoCloseClass);
		this.videoEl = this.UserVideoEl.getElementsByClassName(this.options.videoCloseClass);
		this._bindEvent();
	}

	_bindEvent() {

		for (let i = 0; i < this.videoCloseEl.length; i++) {
			addEvent(this.videoCloseEl[i], 'click', () => {
				this.UserVideoEl.removeChild(this.videoCloseEl[i]);
	        });
		}

		for (let i = 0; i < this.videoEl.length; i++) {
			addEvent(this.videoEl[i], 'click', () => {
				let videoUrl = getData(this.videoEl[i], 'url');
				console.log(videoUrl);
	        });
		}

		addEvent(this.videoAddEl, 'click', () => {
			let record = new Record({
    		    notUpload: true
    		});

			record.show();
			record.on('record.success', (file, imgURL) => {
			});
        });
	}

	static attachTo(element, options) {
	    return new UserVideo(element, options);
	}
}