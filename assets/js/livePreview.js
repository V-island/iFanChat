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

export default class LivePreview extends EventEmitter {
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
            iconAddAttentionClass: 'live-add-attention',
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
        html += '<video id="video" class="video" autoplay="autoplay" preload="auto" poster="'+ info.everyday_img +'"><source src="'+ info.live_url +'" type="video/mp4"></video>';
        html += '</div><div class="lives-header"><div class="lives-attention"><div class="user-info across"><div class="user-img avatar-female">';
        html += info.user_head ? '<img src="'+ info.user_head +'">' : '';
        html += '</div><div class="across-body"><p class="user-name">'+ info.user_name +'</p><p class="user-txt">'+ info.heat + ' ' + LANG.PUBLIC.Heat +'</p></div>';
        html += '</div><i class="icon live-attention btn-add-attention"></i></div><div class="icon live-close btn-close"></div></div></div>';

        return html;
    }

    // 在线状态
    _livePreviewOnline() {
        const Appid = fcConfig.agoraAppId || '', Appcert = fcConfig.agoraCertificateId || '';

        let videoModalEl = modal.actions(this.tpl.live_preview_online_modal);
        let buttonCallEl = videoModalEl.getElementsByClassName(this.options.btnCallClass)[0];
        let btnLiveCloseEl = videoModalEl.getElementsByClassName(this.options.btnLiveCloseClass)[0];

        addEvent(buttonCallEl, 'click', () => {
            console.log('呼叫');
            modal.closeModal(videoModalEl);
            modal.closeModal(this.previewModalEl);

            let localInfo = getUserInfo();
            this.signal = new SignalingClient(Appid, Appcert);

            this.signal.login(localInfo.userId).then((uid) => {
                console.log(uid);
                let client = new Client(this.signal, localInfo.userId);
                client.invite(this.info, localInfo);
            });
        });

        addEvent(btnLiveCloseEl, 'click', () => {
            modal.closeModal(videoModalEl);
        });
    }

    // 不在线状态
    _livePreviewNotOnline() {
        let videoModalEl = modal.actions(this.tpl.live_preview_not_online_modal);
        let buttonDetailsEl = videoModalEl.getElementsByClassName(this.options.btnDetailsClass)[0];
        let btnLiveCloseEl = videoModalEl.getElementsByClassName(this.options.btnLiveCloseClass)[0];

        addEvent(buttonDetailsEl, 'click', () => {
            console.log('详细');
            return location.href = '#/details';
        });

        addEvent(btnLiveCloseEl, 'click', () => {
            modal.closeModal(videoModalEl);
        });
    }
}