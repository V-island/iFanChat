import Template from 'art-template/lib/template-web';
import EventEmitter from '../eventEmitter';
import RecordVideo from '../record-video';
import VideoPreview from '../videoPreview';
import {
    getLangConfig
} from '../lang';

import {
    findMyVideo,
    deleteVideo
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
	    	videoClass: 'card-video'
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
		this.videoEl = this.UserVideoEl.getElementsByClassName(this.options.videoClass);
		this._bindEvent();
	}

	_bindEvent() {

		// 删除视频
		for (let i = 0; i < this.videoCloseEl.length; i++) {
			addEvent(this.videoCloseEl[i], 'click', () => {
				let videoId = getData(this.videoEl[i], 'id');
				let getDeleteVideo = deleteVideo(videoId);

				getDeleteVideo.then((data) => {
					if (!data) return;

					this.UserVideoEl.removeChild(this.videoCloseEl[i]);
				});
	        });
		}

		// 上传
		addEvent(this.videoAddEl, 'click', () => {
			let record = new RecordVideo({
    		    editVideoInfo: true
    		});

			record.show();
        });

		// 浏览视频
		for (let i = 0; i < this.videoEl.length; i++) {
			if (!this.videoEl[0]) {
				addEvent(this.videoEl[i], 'click', () => {
					let videoUrl = getData(this.videoEl[i], 'url');
					console.log(videoUrl);
					let _videoPreview = new VideoPreview(info);
		        });
			}
		}
	}

	static attachTo(element, options) {
	    return new UserVideo(element, options);
	}
}