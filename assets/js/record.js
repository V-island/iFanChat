import Template from 'art-template/lib/template-web';
import EventEmitter from './eventEmitter';
import Modal from './modal';
import fcConfig from './intro';
import {
    checkAuth,
    newDayRecord
} from './api';
import {
    getLangConfig
} from './lang';
import {
    extend,
    addEvent,
    importTemplate,
    createDom,
    hasClass,
    addClass,
    removeClass
} from './util';

const LANG = getLangConfig();
const MADAL = LANG.HOME.Madal;
const modal = new Modal();

export default class Record extends EventEmitter {
    constructor(options) {
        super();

        this.options = {
            selectedIndex: null,
            itemClass: 'bar-item',
            startLiveClass: 'btn-live',
            liveBtnClass: 'modals-live',
            videoBtnClass: 'modals-video',
            showClass: 'active'
        };

        extend(this.options, options);

        this.tabsEl = createDom(this._tabsTemplate(this.options));

        document.body.append(this.tabsEl);

        this.itemEl = this.tabsEl.getElementsByClassName(this.options.itemClass);
        this.init();
    }

    init() {
        const self = this;

        this._bindEvent();
    }

    _bindEvent() {
        let self = this;

    }

    _tabsTemplate(options) {
        let html = '';

        return html;
    }

    static attachTo(options) {
        return new Record(options);
    }
}