import Template from 'art-template/lib/template-web';
import RtcClient from './rtcClient'
import Modal from './modal';
import fcConfig from './intro';

import {
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
    createDom,
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

        	if (_info.status == 'invite') {
        		this._onReceiveCall(account, _info);
        	}
            if (_info.status == 'refuse') {
        		this._onRefuseCall(account);
        	}
        });

        // 收到呼叫邀请回调
        Signal.sessionEmitter.on('onInviteReceived', (call) => {
        	console.log(call);
        	let account = call.peer;
        	let channelID = call.channelName;
        	let _info = JSON.parse(call.extra);

        	console.log(_info);
        	this._onJoinChannel(account, {
	    		channelKey: _info.channelKey,
	    		channel: channelID,
	    		userId: this.localAccount,
	    		info: this.info
	    	});

	    	modal.closeModal(this.callerModalEl);
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

    	    	// 邀请加入直播频道
    	    	this.signal.invite(data.channel, account, JSON.stringify({
	    	    	channelKey: data.channelKey
	    	    }));

    	    	console.log(account);
    	    	this._createChannel(account, {
    	    		channelKey: data.channelKey,
		    		channel: data.channel,
		    		userId: data.userId,
		    		type: false,
		    		info: msg
    	    	});

    	    	modal.closeModal(this.calledModalEl);
    	    });
    	});

    	// 拒绝邀请
    	addEvent(btnRefuseEl, 'click', () => {
    	    modal.closeModal(this.calledModalEl);
    	    this.signal.sendMessage(account, JSON.stringify({
    	    	status: 'refuse'
    	    }));
    	});
    }

    /**
     * 主播拒绝呼叫
     * @param  {[type]} account 呼叫账号
     * @return {[type]}         [description]
     */
    _onRefuseCall(account) {
    	this.data.LiveInfo = this.info;
    	console.log(this.info);
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
    		this.info = info;
    		this.callerModalEl = modal.popup(this._calledCallerTemplate(info, true));
    	}

	    let btnCancelEl = this.callerModalEl.getElementsByClassName('btn-cancel')[0];

	    this.signal.sendMessageAll(info.userAccount, JSON.stringify({
	    	userAccount: this.localInfo.userId,
	    	userName: this.localInfo.userName,
	    	userHead: this.localInfo.userHead,
	    	userSex: this.localInfo.userSex,
	    	status: 'invite'
	    }));

	    addEvent(btnCancelEl, 'click', () => {
	        modal.closeModal(this.callerModalEl);
	    });
    }

    _calledCallerTemplate(info, type) {
    	let html = '';
    	let caller = '<div class="buttons buttons-block"><div class="button button-danger btn-cancel" data-ripple>'+ LANG.LIVE_PREVIEW.Called_Caller.Buttons_Cancel +'</div></div>';
    	let called = '<div class="buttons"><div class="button button-danger btn-refuse" data-ripple>'+ LANG.LIVE_PREVIEW.Called_Caller.Buttons_Refuse +'</div><div class="button button-success btn-accept" data-ripple>'+ LANG.LIVE_PREVIEW.Called_Caller.Buttons_Accept +'</div></div>';

    	html = '<div class="popup remove-on-close popup-call"><div class="content-block"><div class="popup-box"><div class="popup-header"><div class="user-info">';
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
    _createChannel(account, _info) {
    	this.retClient = new RtcClient(_info);

    	// 退出直播间
    	this.retClient.on('rtcClient.leave', (channel) => {
        	this._anchorTemplate(channel);
        });
    }

    /**
     * 用户加入直播间
     * @param  {[type]} account 主播账号
     * @param  {[type]} _info     主播用户信息
     * @return {[type]}         [description]
     */
    _onJoinChannel(account, _info) {
		this.localRetClient = new RtcClient(_info);

    	// 加入直播间
    	this.localRetClient.on('rtcClient.join', (channel, startTime) => {
        	let getLoginChannel = loginChannel(channel, startTime);
        	console.log(channel, startTime);
        	getLoginChannel.then((data) => {
        		if (!data) return;
        	});
        });

        // 退出直播间
    	this.localRetClient.on('rtcClient.leave', (channel, endTime) => {
    		console.log(channel, endTime);
        	let getCloseChannel = closeChannel(channel, endTime);
        	getCloseChannel.then((data) => {
        		if (!data) return;

        		this._assessTemplate(channel);
        	});
        });
    }

    /**
     * 评价
     * @param  {[type]} channel [description]
     * @return {[type]}         [description]
     */
    _assessTemplate(channel) {
    	this.data.LiveInfo = this.info;
    	console.log(this.info);

    	let endLiveUserHTML = createDom(Template.render(this.tpl.end_live_user, this.data));
    	let endLiveUserEl = modal.popup(endLiveUserHTML);

	    let btnSubmitEl = endLiveUserEl.getElementsByClassName('btn-submit')[0];
	    let btnMaybeEl = endLiveUserEl.getElementsByClassName('btn-maybe')[0];

	    addEvent(btnMaybeEl, 'click', () => {
	        modal.closeModal(endLiveUserEl);
	    });

	    addEvent(btnSubmitEl, 'click', () => {
	        modal.closeModal(endLiveUserEl);
	    });
    }

    /**
     * 直播统计
     * @param  {[type]} channel [description]
     * @return {[type]}         [description]
     */
    _anchorTemplate(channel) {
    	this.data.LiveInfo = this.info;
    	console.log(this.info);

    	let endLiveAnchorHTML = createDom(Template.render(this.tpl.end_live_anchor, this.data));
    	let endLiveAnchorEl = modal.popup(endLiveAnchorHTML);

	    let btnYesEl = endLiveAnchorEl.getElementsByClassName('btn-yes')[0];
	    let btnLiveAgainEl = endLiveAnchorEl.getElementsByClassName('btn-live-again')[0];

	    addEvent(btnYesEl, 'click', () => {
	        modal.closeModal(endLiveAnchorEl);
	    });

	    addEvent(btnLiveAgainEl, 'click', () => {
	        modal.closeModal(endLiveAnchorEl);
	    });
    }
}