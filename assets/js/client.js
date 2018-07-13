import Template from 'art-template/lib/template-web';
import RtcClient from './rtcClient'
import Modal from './modal';
import fcConfig from './intro';

import {
	getUserInfo,
    createChannel,
    loginChannel,
    closeChannel,
    userEvaluate
} from './api';

import {
    getLangConfig
} from './lang';

import {
    extend,
    addEvent,
    importTemplate
} from './util';

const LANG = getLangConfig();
const modal = new Modal();

export default class Client {
    constructor(sclient, localInfo) {

        this.data = {};
        this.signal = sclient;
        this.localInfo = localInfo; // 本地用户信息
        this.localAccount = localInfo.userId;

        extend(this.data, LANG);

        this.clientCallFile = fcConfig.publicFile.client_call;
        this._init();
    }

    _init() {
        this.tpl = {};

        importTemplate(this.clientCallFile, (id, _template) => {
            this.tpl[id] = _template;
        });

        this._subscribeEvents();
    }

    _subscribeEvents() {
        let Signal = this.signal;

        // 接收到点对点消息
        Signal.sessionEmitter.on('onMessageInstantReceive', (account, uid, msg) => {
        	let _info = JSON.parse(msg);

        	if (_info.callStatus == 'invite') {
        		this._onReceiveCall(account, _info.info);
        	}
            if (_info.callStatus == 'refuse') {
        		this._onRefuseCall(account, _info.info);
        	}
    	    if (_info.callStatus == 'accept') {
    			this._onJoinChannel(account, _info);
    		}
        });
    }

    /**
     * 接收到呼叫
     * @param  {[type]} account 呼叫账号
     * @param  {[type]} msg     呼叫消息
     * @return {[type]}         [description]
     */
    _onReceiveCall(account, msg) {
    	this.calledModalEl = modal.popup(this._calledCallerTemplate(msg, false));
    	let btnRefuseEl = this.calledModalEl.getElementsByClassName('btn-refuse')[0];
    	let btnAcceptEl = this.calledModalEl.getElementsByClassName('btn-accept')[0];

    	// 接受邀请
    	addEvent(btnAcceptEl, 'click', () => {

    	    let getChannelInfo = createChannel();
    	    getChannelInfo.then((data) => {
    	    	modal.closeModal(this.calledModalEl);

    	    	this.retClient = new RtcClient({
    	    		channelKey: data.channelKey,
    	    		channel: data.channel,
    	    		userId: data.userId,
    	    		type: false,
    	    		info: msg
    	    	});
    	    	this.signal.sendMessage(account, JSON.stringify({
    	    		info: this.localInfo,
    	    		channelKey: data.channelKey,
    	    		channel: data.channel,
    	    		callStatus: 'accept'
    	    	}));
    	    });
    	});

    	// 拒绝邀请
    	addEvent(btnRefuseEl, 'click', () => {
    	    modal.closeModal(this.calledModalEl);
    	    this.signal.sendMessage(account, JSON.stringify({
    	    	info: this.localInfo,
    	    	callStatus: 'refuse'
    	    }));
    	});
    }

    _onRefuseCall(account, info) {

    	this.data.LiveInfo = info;
    	let refuseEl = createDom(Template.render(this.tpl.refuse_call, this.data));
    	let contentBlockEl = this.callerModalEl.querySelector('.content-block');
    	contentBlockEl.innerHTML = refuseEl;

    	let btnCallAgainEl = this.callerModalEl.getElementsByClassName('btn-call-again')[0];
    	let btnMaybeEl = this.callerModalEl.getElementsByClassName('btn-maybe')[0];

    	addEvent(btnCallAgainEl, 'click', () => {
    		let callerEl = createDom(Template.render(this.tpl.client_caller, this.data));
    		contentBlockEl.innerHTML = callerEl;

	        this.invite();
	    });

	    addEvent(btnMaybeEl, 'click', () => {
	        modal.closeModal(this.callerModalEl);
	    });
    }

    /**
     * 呼叫主播
     * @param  {[type]} info      主播用户信息
     * @return {[type]}           [description]
     */
    invite(info) {
    	if (typeof info !== 'undefined') {
    		this.callerModalEl = modal.popup(this._calledCallerTemplate(info, true));
    	}

	    let btnCancelEl = this.callerModalEl.getElementsByClassName('btn-cancel')[0];

	    this.signal.sendMessage(info.userId, JSON.stringify({
	    	info: this.localInfo,
	    	callStatus: 'invite'
	    }));

	    addEvent(btnCancelEl, 'click', () => {
	        modal.closeModal(this.callerModalEl);
	    });
    }

    _calledCallerTemplate(info, type) {
    	let html = '';
    	let caller = '<div class="buttons buttons-block"><div class="button button-danger btn-cancel" data-ripple>'+ LANG.LIVE_PREVIEW.Called_Caller.Buttons_Cancel +'</div></div>';
    	let called = '<div class="buttons"><div class="button button-danger btn-refuse" data-ripple>'+ LANG.LIVE_PREVIEW.Called_Caller.Buttons_Refuse +'</div><div class="button button-success btn-accept" data-ripple>'+ LANG.LIVE_PREVIEW.Called_Caller.Buttons_Accept +'</div></div>';

    	html = '<div class="popup popup-call"><div class="content-block"><div class="popup-box"><div class="popup-header"><div class="user-info">';
    	html += info.userSex == 1 ? '<div class="user-img avatar-male">' : '<div class="user-img avatar-female">';
    	html += info.userHead ? '<img src="'+ info.userHead +'">' : '';
    	html += '</div><p class="user-name">'+ info.userName + (info.userSex == 1 ? '<i class="icon icon-male"></i>' : '<i class="icon icon-female"></i>') + '</p></div></div>';
    	html += '<div class="popup-content calling-box"><i class="calling-sprite"></i>'+ LANG.LIVE_PREVIEW.Called_Caller.Title +'</div>';
    	html += type ? caller : called;
    	html += '</div></div></div>';

    	return html;
    }

    /**
     * 主播创建直播间
     * @return {[type]} [description]
     */
    _createChannel() {

    }

    /**
     * 用户加入直播间
     * @param  {[type]} account 主播账号
     * @param  {[type]} _info     主播用户信息
     * @return {[type]}         [description]
     */
    _onJoinChannel(account, _info) {
    	modal.closeModal(this.callerModalEl);

		this.localRetClient = new RtcClient({
    		channelKey: _info.channelKey,
    		channel: _info.channel,
    		userId: this.localAccount,
    		info: _info.info
    	});

    	// let getLoginChannel = loginChannel();
    	// getLoginChannel.then((data) => {
    	// });
    }
}