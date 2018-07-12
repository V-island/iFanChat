import Template from 'art-template/lib/template-web';
import EventEmitter from './eventEmitter';
// import RTCClient from './rtcClient'
import Modal from './modal';
import fcConfig from './intro';
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

export default class Client extends EventEmitter {
    constructor(sclient, localAccount) {
        super();

        this.data = {};
        this.signal = sclient;
        this.localAccount = localAccount;
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
        	console.log('接收到点对点消息');
        	let info = JSON.parse(msg);

        	if (info.callStatus == 'invite') {
        		this._onReceiveCall(account, info);
        	}
            if (info.callStatus == 'refuse') {
        		this._onRefuseCall(account);
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
    	    console.log('接受邀请');
    	    modal.closeModal(this.calledModalEl);
    	});

    	// 拒绝邀请
    	addEvent(btnRefuseEl, 'click', () => {
    	    console.log('拒绝邀请');
    	    modal.closeModal(this.calledModalEl);
    	    console.log(account);
    	    this.signal.sendMessage(account, JSON.stringify({
    	    	callStatus: 'refuse'
    	    }));
    	});
    }

    _onRefuseCall(account) {
    	console.log('被拒绝了');
    }

    /**
     * 呼叫主播
     * @param  {[type]} info      主播用户信息
     * @param  {[type]} localInfo 本地用户信息
     * @return {[type]}           [description]
     */
    invite(info, localInfo) {
	    this.callerModalEl = modal.popup(this._calledCallerTemplate(info, true));
	    let btnCancelEl = this.callerModalEl.getElementsByClassName('btn-cancel')[0];

	    localInfo.callStatus = 'invite';
	    this.signal.sendMessage(info.user_id, JSON.stringify(localInfo));

	    addEvent(btnCancelEl, 'click', () => {
	        console.log('取消呼叫');
	    });
    }

    _calledCallerTemplate(info, type) {
    	let html = '';
    	let caller = '<div class="buttons buttons-block"><div class="button button-danger btn-cancel" data-ripple>'+ LANG.LIVE_PREVIEW.Called_Caller.Buttons_Cancel +'</div></div>';
    	let called = '<div class="buttons"><div class="button button-danger btn-refuse" data-ripple>'+ LANG.LIVE_PREVIEW.Called_Caller.Buttons_Refuse +'</div><div class="button button-success btn-accept" data-ripple>'+ LANG.LIVE_PREVIEW.Called_Caller.Buttons_Accept +'</div></div>';

    	html = '<div class="popup popup-call"><div class="content-block"><div class="popup-box"><div class="popup-header"><div class="user-info">';
    	html += info.sex == 1 ? '<div class="user-img avatar-male">' : '<div class="user-img avatar-female">';
    	html += info.user_head ? '<img src="'+ info.user_head +'">' : '';
    	html += '</div><p class="user-name">'+ info.user_name +' <i class="icon icon-female"></i></p></div></div>';
    	html += '<div class="popup-content calling-box"><i class="calling-sprite"></i>'+ LANG.LIVE_PREVIEW.Called_Caller.Title +'</div>';
    	html += type ? caller : called;
    	html += '</div></div></div>';

    	return html;
    }
}