import Template from 'art-template/lib/template-web';
import EventEmitter from './eventEmitter';
import SignalingClient from './signalingClient';
import Client from './client';
import Modal from './modal';
import fcConfig from './intro';
import {
    getUserInfo
} from './api';
import {
    getLangConfig
} from './lang';
import {
    extend,
    addEvent,
    importTemplate,
    addClass,
    removeClass
} from './util';

const LANG = getLangConfig();
const modal = new Modal();

export default class VideoPreview extends EventEmitter {
    constructor(info, options) {
        super();

        this.data = {};
        this.options = {
            btnLiveCloseClass: 'btn-close',
            btnAddAttentionClass: 'btn-add-attention',
            videoClass: 'video',
            btnCallClass: 'btn-call',
            btnDetailsClass: 'btn-details',
            iconAttentionClass: 'live-attention',
            iconAddAttentionClass: 'live-add-attention'
        };

        extend(this.data, LANG);
        extend(this.options, options);

        this.info = info;
        this.status = info.status;
        this.livePreviewFile = fcConfig.publicFile.live_preview;

        this.previewModalEl = modal.popup(this._livePreviewTemplate(info));
        this.btnLiveCloseEl = this.previewModalEl.getElementsByClassName(this.options.btnLiveCloseClass)[0];
        this.btnAddAttentionEl = this.previewModalEl.getElementsByClassName(this.options.btnAddAttentionClass)[0];
        this.videoEl = this.previewModalEl.getElementsByClassName(this.options.videoClass)[0];

        this._init();
    }

    _init() {
        this.tpl = {};

        importTemplate(this.livePreviewFile, (id, _template) => {
            this.tpl[id] = Template.render(_template, this.data);
        });

        this._bindEvent();
    }

    _bindEvent() {
        // 关闭
        addEvent(this.btnLiveCloseEl, 'click', () => {
            modal.closeModal(this.previewModalEl);
        });

        // 加关注
        addEvent(this.btnAddAttentionEl, 'click', () => {
            removeClass(this.btnAddAttentionEl, this.options.iconAttentionClass);
            addClass(this.btnAddAttentionEl, this.options.iconAddAttentionClass);
        });

        // 视频结束
        addEvent(this.videoEl, 'ended', () => {
            if (this.status == 1) {
                return this._livePreviewOnline();
            }

            this._livePreviewNotOnline();
        });
    }

    _livePreviewTemplate(info) {
        let html = '';

        html = '<div class="popup remove-on-close lives-wrapper"><div class="lives-video">';
        html += '<video id="video" class="'+ this.options.videoClass +'" controls autoplay="autoplay" preload="auto" poster="'+ info.everyday_img +'"><source src="'+ info.live_url +'" type="video/mp4"></video>';
        html += '</div><div class="lives-header"><div class="lives-attention"><div class="user-info across"><div class="user-img avatar-female">';
        html += info.user_head ? '<img src="'+ info.user_head +'">' : '';
        html += '</div><div class="across-body"><p class="user-name">'+ info.user_name +'</p><p class="user-txt">'+ info.heat + ' ' + LANG.PUBLIC.Heat +'</p></div>';
        html += '</div><i class="icon live-attention '+ this.options.btnAddAttentionClass +'"></i></div><div class="icon live-close '+ this.options.btnLiveCloseClass +'"></div></div></div>';

        return html;
    }
}