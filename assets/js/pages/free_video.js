import Template from 'art-template/lib/template-web';
import BScroll from 'better-scroll';
import EventEmitter from '../eventEmitter';
import VideoPreview from '../videoPreview';
import fcConfig from '../intro';
import {
    getLangConfig
} from '../lang';

import {
    videoType,
    videoClips,
    playVideo
} from '../api';

import {
    extend,
    createDom,
    addEvent,
    importTemplate,
    getData
} from '../util';

const LANG = getLangConfig();

export default class FreeVideo extends EventEmitter {
	constructor(element, options) {
	    super();

	    this.data = {};
	    this.options = {
	    	pagesVideoClass: '.pages-video',
	    	videoCloseClass: 'card-video',
	    	pulldownClass: '.pulldown-wrapper',
	    	boxCardsClass: 'box-cards',
	    	cardsPageIndex: 'page',
	    	showClass: 'active'
        };

	    extend(this.options, options);
	    extend(this.data, LANG);

	    this.homeFile = fcConfig.publicFile.home_items;
	    this.init(element);
	}

	init(element) {
		this._page = 1;
		this._number = 10;
		this._type = 1;

		let getvideoType = videoType();
		let getVideoClips = videoClips(this._page, this._number, this._type);

		Promise.all([getvideoType, getVideoClips]).then((data) => {
			this.data.VideoType = data[0] ? data[0] : false;
			this.data.VideoList = data[1] ? data[1] : false;
			this.FreeVideoEl = createDom(Template.render(element, this.data));
			this.trigger('pageLoadStart', this.FreeVideoEl);
			this._init();
		});

		this.tpl = {};

		importTemplate(this.homeFile, (id, _template) => {
		    this.tpl[id] = _template;
		});
	}

	_init() {
		this.pagesVideoEl = this.HomeEl.querySelector(this.options.pagesVideoClass);
		this.cardsVideoEl = this.pagesVideoEl.getElementsByClassName(this.options.boxCardsClass)[0];
		this.cardVideoEl = this.FreeVideoEl.getElementsByClassName(this.options.videoCloseClass);
		this.pullDownEl = this.HomeEl.querySelector(this.options.pulldownClass);

		this._pagesVideo();
		this._bindEvent();
	}

	_bindEvent() {
		for (let i = 0; i < this.cardVideoEl.length; i++) {
			addEvent(this.cardVideoEl[i], 'click', () => {
				console.log('查看视频');
				let _id = JSON.parse(getData(this.cardVideoEl[i], 'id'));

				playVideo(_id).then((data) => {
					if (!data) return;

					let _videoPreview = new VideoPreview(data);
				});
	        });
		}
	}

	static attachTo(element, options) {
	    return new FreeVideo(element, options);
	}

	// Video 模块
	_pagesVideo() {
		let pullDownRefresh = false,
			pullDownInitTop = -50;

		this.pagesVideoSwiper = new BScroll(this.options.pagesVideoClass, {
			startY: 0,
			scrollY: true,
			scrollX: false,
			probeType: 3,
			click: true,
			pullDownRefresh: {
				threshold: 50,
				stop: 20
			},
			pullUpLoad: {
				threshold: -20
			},
			mouseWheel: true,
			bounce: true
		});

		// 下拉刷新
		this.pagesVideoSwiper.on('pullingDown', () => {
			pullDownRefresh = true;
			videoClips(this._page, this._number, this._type).then((data) => {
				if (!data && !_data) return;

				this.cardsVideoEl.innerHTML = '';

				this.cardsVideoEl.append(createDom(Template.render(this.tpl.free_videos_header, this.data)));

				data.forEach((itemData, index) => {
					this.data.VideosList = itemData;
					this.cardsVideoEl.append(createDom(Template.render(this.tpl.list_videos, this.data)));
				});

				setData(this.cardsVideoEl, this.options.cardsPageIndex, 1);
				pullDownRefresh = false;
				this.pullDownEl.style.top = '-1rem';
				this.pagesVideoSwiper.finishPullDown();
				this.pagesVideoSwiper.refresh();
				this._listEvent();
			});
		});

		// 上拉加载
		this.pagesVideoSwiper.on('pullingUp', () => {
			let _page = getData(this.cardsVideoEl, this.options.cardsPageIndex);
			_page = parseInt(_page) + 1;
			videoClips(_page, this._number, this._type).then((data) => {
				if (!data) return;

				data.forEach((itemData, index) => {
					this.data.VideosList = itemData;
					this.cardsVideoEl.append(createDom(Template.render(this.tpl.list_videos, this.data)));
				});
				setData(this.cardsVideoEl, this.options.cardsPageIndex, _page);
				this.pagesVideoSwiper.finishPullUp();
				this.pagesVideoSwiper.refresh();
				this._listEvent();
			});
		});

		this.pagesVideoSwiper.on('scroll', (pos) => {
			if (pullDownRefresh) {
				return;
			}
			this.pullDownEl.style.top = Math.min(pos.y + pullDownInitTop, 10)+ 'px';
		})
	}
}