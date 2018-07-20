import Template from 'art-template/lib/template-web';
import EventEmitter from '../eventEmitter';

import {
    getLangConfig
} from '../lang';

import {
    findWatchHistory,
    playVideo
} from '../api';

import {
    extend,
    createDom,
    addEvent
} from '../util';

const LANG = getLangConfig();

export default class UserWatch extends EventEmitter {
	constructor(element, options) {
	    super();

	    this.data = {};
	    this.options = {
	    	videoCloseClass: 'card-video'
        };

	    extend(this.options, options);
	    extend(this.data, LANG);

	    this.init(element);

	}

	init(element) {
		let getWatchHistory = findWatchHistory();

		getWatchHistory.then((data) => {
			this.data.WatchHistory = data;

			this.UserWatchEl = createDom(Template.render(element, this.data));
			this.trigger('pageLoadStart', this.UserWatchEl);
			this._init();
		});
	}

	_init() {
		this.videoEl = this.UserWatchEl.getElementsByClassName(this.options.videoCloseClass);
		this._bindEvent();
	}

	_bindEvent() {
		for (let i = 0; i < this.videoEl.length; i++) {
			addEvent(this.videoEl[i], 'click', () => {
				let videoId = getData(this.videoEl[i], 'id');
				let getPlayVideo = playVideo(videoId);

				getPlayVideo.then((videoUrl) => {
					console.log(videoUrl);
				});
	        });
		}
	}

	static attachTo(element, options) {
	    return new UserWatch(element, options);
	}
}