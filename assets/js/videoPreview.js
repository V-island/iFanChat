import Template from 'art-template/lib/template-web';
import BScroll from 'better-scroll';
import EventEmitter from './eventEmitter';
import SignalingClient from './signalingClient';
import Client from './client';
import Modal from './modal';
import fcConfig from './intro';
import {
    getUserInfo,
    findAllgifts,
    follow
} from './api';
import {
    getLangConfig
} from './lang';
import {
    extend,
    addEvent,
    createDom,
    importTemplate,
    isNumber,
    getData,
    hasClass,
    addClass,
    removeClass
} from './util';

const LANG = getLangConfig();
const modal = new Modal();

export default class VideoPreview extends EventEmitter {
    constructor(options) {
        super();

        this.data = {};
        this.options = {
            btnLiveCloseClass: 'btn-close',
            btnAddAttentionClass: 'btn-add-attention',
            videoClass: 'video',
            iconAttentionClass: 'live-attention',
            iconAddAttentionClass: 'live-add-attention',
            btnNewsClass: 'btn-news',
            btnThumbsClass: 'btn-thumbs',
            btnShareClass: 'btn-share',
            btnGiftClass: 'btn-gift',
            showClass: 'active'
        };

        this.localInfo = getUserInfo();

        extend(this.data, LANG);
        extend(this.options, options);

        this.videoPreviewFile = fcConfig.publicFile.client_rtc;

        this.previewModalEl = modal.popup(this._videoPreviewTemplate(this.options));
        // this.videoEl = this.previewModalEl.getElementsByClassName(this.options.videoClass)[0];
        this.btnLiveCloseEl = this.previewModalEl.getElementsByClassName(this.options.btnLiveCloseClass)[0];
        this.btnAddAttentionEl = this.previewModalEl.getElementsByClassName(this.options.btnAddAttentionClass)[0];
        this.btnNewsEl = this.previewModalEl.getElementsByClassName(this.options.btnNewsClass)[0];
        this.btnThumbsEl = this.previewModalEl.getElementsByClassName(this.options.btnThumbsClass)[0];
        this.btnShareEl = this.previewModalEl.getElementsByClassName(this.options.btnShareClass)[0];
        this.btnGiftEl = this.previewModalEl.getElementsByClassName(this.options.btnGiftClass)[0];

        this._init();
    }

    _init() {
        this.tpl = {};

        let getAllgifts = findAllgifts();
        getAllgifts.then((data) => {
            this.data.GiftList = data;
            this.data.UserInfoList = this.localInfo;

            importTemplate(this.videoPreviewFile, (id, _template) => {
                this.tpl[id] = Template.render(_template, this.data);
            });

            this._bindEvent();
        });
    }

    _bindEvent() {
        // 关闭
        addEvent(this.btnLiveCloseEl, 'click', () => {
            modal.closeModal(this.previewModalEl);
        });

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

        // 留言
        addEvent(this.btnNewsEl, 'click', () => {
            let newsModalEl = modal.actions(this.tpl.live_comments, {
                title: LANG.LIVE_PREVIEW.Actions.Comment,
                closeBtn: true
            });
            let listCommentsEl = newsModalEl.getElementsByClassName('list-comments')[0];
            let textareaEl = newsModalEl.getElementsByClassName('news-input')[0];
            let btnNewsPhizEl = newsModalEl.getElementsByClassName('news-phiz')[0];
            let btnSendEl = newsModalEl.getElementsByClassName('btn-send')[0];

            addEvent(btnSendEl, 'click', () => {
                let _val = textareaEl.value;

                if (_val === null) {
                    return;
                }

                let itemEl = createDom(this._itemCommentsTemplate(_val));
                listCommentsEl.append(itemEl);
            });
        });

        // 点赞
        addEvent(this.btnThumbsEl, 'click', () => {
            removeClass(this.btnThumbsEl, this.options.showClass);
            addClass(this.btnThumbsEl, this.options.showClass);
        });

        // 分享
        addEvent(this.btnShareEl, 'click', () => {
            let shareModalEl = modal.actions(this.tpl.live_share, {
                title: LANG.LIVE_PREVIEW.Actions.ShareTo,
                closeBtn: true,
                cancelBtn: true
            });
            let shareLabelEl = shareModalEl.getElementsByClassName('share-label');

            for (let i = 0; i < shareLabelEl.length; i++) {
                console.log(shareLabelEl[i]);
            }
        });

        // 礼物
        addEvent(this.btnGiftEl, 'click', () => {
            let giftModalEl = modal.actions(this.tpl.live_gift, {
                title: LANG.LIVE_PREVIEW.Actions.Gift,
                closeBtn: true
            });
            let giftWrapperEl = giftModalEl.querySelector('.gift-wrapper');
            let giftContentEl = giftModalEl.getElementsByClassName('gift-content')[0];
            let giftItemEl = giftModalEl.getElementsByClassName('gift-item');

            let giftLabelEl = giftModalEl.getElementsByClassName('gift-label');
            let btnRechargeEl = giftModalEl.getElementsByClassName('btn-recharge')[0];
            let btnSendEl = giftModalEl.getElementsByClassName('btn-send')[0];
            let giftWidth = giftWrapperEl.offsetWidth;

            giftContentEl.style.width = giftWidth * 2 + 'px';
            for (let i = 0; i < giftItemEl.length; i++) {
                giftItemEl[i].style.width = giftWidth + 'px';
            }

            let giftWrapperScroll = new BScroll(giftWrapperEl, {
                startX: 0,
                scrollX: true,
                scrollY: false,
                momentum: false,
                tap: true,
                bounce: {
                    top: false,
                    bottom: false,
                    left: true,
                    right: true
                }
            });

            for (let i = 0; i < giftLabelEl.length; i++) {
                addEvent(giftLabelEl[i], 'tap', () => {
                    if (hasClass(giftLabelEl[i], 'active')) {
                        return;
                    }

                    for (let j = 0; j < giftLabelEl.length; j++) {
                        if (hasClass(giftLabelEl[j], 'active')) {
                            removeClass(giftLabelEl[j], 'active');
                        }
                    }
                    addClass(giftLabelEl[i], 'active');
                });
            }

            addEvent(btnSendEl, 'click', () => {
                let tagActiveEl = giftWrapperEl.getElementsByClassName('active')[0];
                console.log(tagActiveEl);
                let giftId = getData(tagActiveEl, 'id');
                console.log(giftId);

                modal.closeModal(giftModalEl);
            });

            // 充值
            addEvent(btnRechargeEl, 'click', () => {
                let rechargeModalEl = modal.actions(this.tpl.live_recharge, {
                    title: LANG.LIVE_PREVIEW.Actions.Recharge,
                    closeBtn: true
                });
            });
        });

    }

    _videoPreviewTemplate(options) {
        let html = '';

        html = '<div class="popup remove-on-close lives-wrapper"><div class="lives-video">';
        html += '<video id="video" class="'+ options.videoClass +'" controls autoplay="autoplay" preload="auto" poster="'+ options.img_url +'"><source src="'+ options.video_url +'" type="video/mp4"></video>';
        html += '</div><div class="lives-header"><div class="lives-attention"><div class="user-info across"><div class="user-img avatar-female">';
        html += options.user_head ? '<img src="'+ options.user_head +'">' : '';
        html += '</div><div class="across-body"><p class="user-name">'+ options.user_name +'</p><p class="user-txt">'+ options.support + ' ' + LANG.PUBLIC.Heat +'</p></div>';
        html += '</div><i class="icon live-attention '+ options.btnAddAttentionClass +'" data-id="'+ info.id +'"></i></div><div class="icon live-close '+ options.btnLiveCloseClass +'"></div></div>';
        html += '<div class="video-preview-content"><p class="preview-text">'+ options.video_description +'</p></div>';
        html += '<div class="video-preview-footer"><div class="lives-buttons">';
        html += '<div class="video-preview-item '+ options.btnNewsClass +'"><i class="icon live-news"></i><span>'+ options.support +'</span></div>';
        html += '<div class="video-preview-item '+ options.btnThumbsClass +'"><i class="icon live-thumbs-upion"></i><span>'+ options.watch_number +'</span></div>';
        html += '<div class="video-preview-item '+ options.btnShareClass +'"><i class="icon live-share"></i></div></div>';
        html += '<div class="'+ options.btnGiftClass +'"><i class="icon live-gift"></i></div>';
        html += '</div></div>';

        return html;
    }

    _itemCommentsTemplate(value) {
        let html = '';

        html = '<li class="list-item">';
        html += '<span class="list-item-graphic image" style="'+ (this.localInfo.userHead ? 'background-image: url('+ this.localInfo.userHead +');' : '') +'"></span>';
        html += '<span class="list-item-text">'+ this.localInfo.userName +'<span class="list-item-secondary">'+ value +'</span></span>';
        html += '</li>';

        return html;
    }
}