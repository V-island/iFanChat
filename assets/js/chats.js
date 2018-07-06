import EventEmitter from './eventEmitter';
import RTCClient from './rtcClient';
import {
    extend,
    createDom,
    addClass,
    removeClass
} from './util';

export default class Chats extends EventEmitter {
    constructor(sclient, localAccount) {
        super();

        this.options = {
            selectedIndex: null,
            closeBtn: true,
            wrapperClass: 'wheels-wrapper',
            pickerClass: 'wheels',
            confirmClass: 'btn-confirm',
            closeClass: 'btn-close',
            iconCloseClass: 'modal-close',
            scrollClass: 'wheels-scroll',
            itemClass: 'wheels-item',
            showClass: 'active'
        };
        this.signal = sclient;
        this.localAccount = localAccount;

        extend(this.options, options);
        this.modalEl = createDom(this._pickerTemplate(this.options));

        document.body.append(this.modalEl);

        this.pickerEl = this.modalEl.getElementsByClassName(this.options.pickerClass);
        this.confirmEl = this.modalEl.getElementsByClassName(this.options.confirmClass)[0];
        this.cancelEl = this.modalEl.getElementsByClassName(this.options.closeClass)[0];
        this.closeEl = this.modalEl.getElementsByClassName(this.options.iconCloseClass)[0];
        this.scrollEl = this.modalEl.getElementsByClassName(this.options.itemClass);

        this._init();
    }

    _init() {

        this._bindEvent();
    }

    _bindEvent() {
        let self = this;
    }
}