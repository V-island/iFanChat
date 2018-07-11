import Template from 'art-template/lib/template-web';
import EventEmitter from './eventEmitter';
// import RTCClient from './rtcClient'
import Modal from './modal';
import {
    getLangConfig
} from './lang';
import {
    extend,
    importTemplate,
    createDom,
    addClass,
    removeClass
} from './util';

const LANG = getLangConfig();
const modal = new Modal();

export default class Client extends EventEmitter {
    constructor(sclient, localAccount) {
        super();

        this.data = {};
        this.signal = sclient;
        this.localAccount = localAccount;
        this.current_conversation = null;
        this.current_msgs = null;

        extend(this.data, LANG);

        this.callFile = fcConfig.publicFile.client_call;

        this.init();
    }

    init() {
    	self.tpl = {};

        importTemplate(self.callFile, function(id, _template) {
            self.tpl[id] = _template;
        });

        this._subscribeEvents();
    }

    _subscribeEvents() {
        let Signal = this.signal;

        // 接收到点对点消息
        Signal.sessionEmitter.on('onMessageInstantReceive', (account, uid, msg) => {
            this._onReceiveCall(account, msg);
        });
    }

    /**
     * 接收到呼叫
     * @param  {[type]} account 呼叫账号
     * @param  {[type]} msg     呼叫消息
     * @return {[type]}         [description]
     */
    _onReceiveCall(account, msg) {
    	this.data.AccountInfo = msg;

    	let calledHTML = Template.render(this.tpl.client_called, this.data);
    	modal.popup(calledHTML);
    }

}