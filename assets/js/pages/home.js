import Swiper from 'swiper';
import BScroll from 'better-scroll';
import Template from 'art-template/lib/template-web';
import EventEmitter from '../eventEmitter';
import Modal from '../modal';
import fcConfig from '../intro';

import {
    getLangConfig
} from '../lang';

import {
    newVideo,
    hotVideo,
    videoClips,
    getAdvertisement,
    videoType
} from '../api';

import {
    extend,
    addEvent,
    createDom,
    getData,
    setData,
    hasClass,
    addClass,
    removeClass,
    importTemplate
} from '../util';

const LANG = getLangConfig();
const MADAL = LANG.HOME.Madal;
const modal = new Modal();

const INIT_INDEX = 2;

export default class Home extends EventEmitter {
	constructor(element, options) {
	    super();
	    this.data = {};
	    this.options = {
    		navsWrapper: '.navs-wrapper',
    		navsContent: 'navs-content',
    		navsItem: 'navs-item',
    		navsItemLine: 'navs-line',
    		navsDataIndex: 'index',
            slideWrapper: '.slide-wrapper',
            slideContent: 'slide-content',
            slideItem: 'slide-item',
            bannerWrapper: '.banner',
            bannerContent: 'banner-box',
            bannerItem: 'banner-item',
            bannerPagination: '.banner-pagination',
            bannerPaginationBullet: 'item',
            pagesNewClass: '.pages-new',
            pagesHotClass: '.pages-hot',
            pagesVideoClass: '.pages-video',
            boxCardsClass: 'box-cards',
            pulldownClass: 'pulldown-wrapper',
            pullupClass: 'pullup-wrapper',
            cardsPageIndex: 'page',
            showClass: 'active'
        };

	    extend(this.options, options);
	    extend(this.data, LANG);

	    this.tabFile = fcConfig.publicFile.home_items;
	    this.init(element);
	}

	init(element) {
		let _page = 1;
		let _number = 10;
		let getNewVideo = newVideo(_page, _number);
		let getHotVideo = hotVideo(_page, _number);
		let getFreeVideoClips = videoClips(_page, _number, 1);
		let getVideoClips = videoClips(_page, _number, 2);
		let getNewAdvertisement = getAdvertisement();
		let getHotAdvertisement = getAdvertisement();
		let getvideoType = videoType();

		Promise.all([getNewVideo, getHotVideo, getFreeVideoClips, getVideoClips, getNewAdvertisement, getHotAdvertisement, getvideoType]).then((data) => {
			this.data.NewList = data[0] ? data[0] : false;
			this.data.HotList = data[1] ? data[1] : false;
			this.data.FreeVideoList = data[2] ? data[2] : false;
			this.data.VideoList = data[3] ? data[3] : false;
			this.data.NewAdList = data[4] ? data[4] : false;
			this.data.HotAdList = data[5] ? data[5] : false;
			this.data.VideoType = data[6] ? data[6] : false;
			this.HomeEl = createDom(Template.render(element, this.data));
			this.trigger('pageLoadStart', this.HomeEl);
			this._init();
		});

		this.tpl = {};

		importTemplate(self.tabFile, (id, _template) => {
		    this.tpl[id] = _template;
		});
	}

	_init() {
		// nav
		this.navsWrapperEl = this.HomeEl.querySelector(this.options.navsWrapper);
		this.navsContentEl = this.navsWrapperEl.getElementsByClassName(this.options.navsContent)[0];
		this.navsItemEl = this.navsWrapperEl.getElementsByClassName(this.options.navsItem);
		this.navsItemLineEl = this.navsWrapperEl.getElementsByClassName(this.options.navsItemLine)[0];

		// slide
		this.slideWrapperEl = this.HomeEl.querySelector(this.options.slideWrapper);
		this.slideContentEl = this.slideWrapperEl.getElementsByClassName(this.options.slideContent)[0];
		this.slideItemEl = this.slideWrapperEl.getElementsByClassName(this.options.slideItem);

		// pages
		this.pagesNewEl = this.HomeEl.querySelector(this.options.pagesNewClass);
		this.cardsNewEl = this.pagesNewEl.getElementsByClassName(this.options.boxCardsClass)[0];

		this.pagesHotEl = this.HomeEl.querySelector(this.options.pagesHotClass);
		this.cardsHotEl = this.pagesHotEl.getElementsByClassName(this.options.boxCardsClass)[0];

		this.pagesVideoEl = this.HomeEl.querySelector(this.options.pagesVideoClass);
		this.cardsVideoEl = this.pagesVideoEl.getElementsByClassName(this.options.boxCardsClass)[0];

		this._setSlideWidth();
		this._slideSwiper();
		this._navSwiper();
		this._bannerSwiper();
		this._pagesNew();
		this._bindEvent();
	}

	_bindEvent() {

		$('.card-content','.card-list').on('click', function() {
			let _notCoins = MADAL.NotCoins;

			modal.alert(_notCoins.Text, _notCoins.Title, function() {
				location.href = '#/live';
			}, _notCoins.ButtonsText);
		});
	}

	static attachTo(element, options) {
	    return new Home(element, options);
	}

	api() {
		// body...
	}

	// 滑块初始化
	_setSlideWidth() {
		let width = 0;
		let slideWidth = this.slideWrapperEl.clientWidth;
		let navItemWidth = this.navsItemEl[INIT_INDEX].clientWidth;
		let navItemLeft = this.navsItemEl[INIT_INDEX].offsetLeft;

		for (let i = 0; i < this.slideItemEl.length; i++) {
			this.slideItemEl[i].style.width = slideWidth + 'px';
			width += slideWidth;
		}
		this.slideContentEl.style.width = width + 'px';
		this.navsItemLineEl.style.width = navItemWidth + 'px';
		this.navsItemLineEl.style.transform = 'translateX(' + navItemLeft + 'px)';
		this.navsItemLineEl.style.WebkitTransform = 'translateX(' + navItemLeft + 'px)';
		this.navsItemLineEl.style.msTransform = 'translateX(' + navItemLeft + 'px)';
	}

	// nav 滑块
	_navSwiper() {
		let self = this;

		this.navSwiper = new BScroll(this.options.navsWrapper, {
			startX: 2,
			scrollX: true,
			scrollY: false,
			momentum: false,
			probeType: 2,
			tap: true,
			bounce: false
		});

		for (let i = 0; i < self.navsItemEl.length; i++) {
			addEvent(self.navsItemEl[i], 'tap', function() {
				let index = getData(this, self.options.navsDataIndex);

	            for (let j = 0; j < self.navsItemEl.length; j++) {
	            	if (hasClass(self.navsItemEl[j], self.options.showClass)) {
	            		removeClass(self.navsItemEl[j], self.options.showClass);
	            	}
	            }
	            addClass(this, self.options.showClass);
	            self.slideSwiper.goToPage(index, 0);
	        });
		}
	}

	// slide 滑块
	_slideSwiper() {
		this.slideSwiper = new BScroll(this.options.slideWrapper, {
			startX: 2,
			scrollX: true,
			scrollY: false,
			momentum: false,
			probeType: 2,
			snap: {
				loop: false,
				threshold: 0.3,
				easing:{
					style: 'cubic-bezier(0.25, 0.46, 0.45, 0.94)',
					fn: function(t) {
						return t * (2 - t)
					}
				}
			},
			bounce: false
		});

		this.slideSwiper.on('scrollEnd', (pos) => {
			let slideIndex = this.slideSwiper.getCurrentPage().pageX;
			let navItemWidth = this.navsItemEl[INIT_INDEX].clientWidth;

			for (let i = 0; i < this.navsItemEl.length; i++) {
				if (hasClass(this.navsItemEl[i], this.options.showClass)) {
					removeClass(this.navsItemEl[i], this.options.showClass);
				}
			}
			addClass(this.navsItemEl[slideIndex], this.options.showClass);

			this.navsItemLineEl.style.transform = 'translateX(' + (slideIndex * navItemWidth) + 'px)';
			this.navsItemLineEl.style.WebkitTransform = 'translateX(' + (slideIndex * navItemWidth) + 'px)';
			this.navsItemLineEl.style.msTransform = 'translateX(' + (slideIndex * navItemWidth) + 'px)';
		});

		this.slideSwiper.goToPage(INIT_INDEX, 0);
	}

	// banner 模块
	_bannerSwiper() {
		let bannerSwiper = new Swiper(this.options.bannerWrapper, {
			wrapperClass: this.options.bannerContent,
			slideClass: this.options.bannerItem,
			slideActiveClass: this.options.showClass,
			loop: true,
			pagination: {
				el: this.options.bannerPagination,
				type: 'bullets',
				bulletClass : this.options.bannerPaginationBullet,
				bulletActiveClass: this.options.showClass,
			}
		})
	}

	// New 模块
	_pagesNew() {
		this.pagesNewSwiper = new BScroll(this.options.pagesNewClass, {
			startY: 0,
			scrollY: true,
			scrollX: false,
			probeType: 3,
			click: true,
			scrollbar: {
				fade: true,
				interactive: false
			},
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
		this.pagesNewSwiper.on('pullingDown', () => {
			console.log('下拉刷新');
			newVideo().then((data) => {
				this.pagesNewSwiper.finishPullDown();
				this.pagesNewSwiper.refresh();
			});
		});

		// 上拉加载
		this.pagesNewSwiper.on('pullingUp', () => {
			console.log('上拉加载');
			let _page = getData(this.cardsNewEl, this.options.cardsPageIndex) + 1;
			newVideo(_page, _number).then((data) => {
				this._cardsItemElement(this.cardsNewEl, data, _page);
				this.pagesNewSwiper.finishPullUp();
				this.pagesNewSwiper.refresh();
			});
		});
	}

	_cardsItemElement(element, data, page) {
	}
}