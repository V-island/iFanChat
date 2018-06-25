import Template from 'art-template/lib/template-web';
import EventEmitter from './eventEmitter';
import Modal from './modal';
import fcConfig from './intro';
import {
    getLangConfig
} from './lang';
import {
    extend,
    addEvent,
    importTemplate,
    createDom,
    addClass,
    removeClass
} from './util';

const LANG = getLangConfig();
const modal = new Modal();

export default class Tabs extends EventEmitter {
    constructor(element, options) {
        super();

        this.element = element;
        this.options = {
            selectedIndex: null,
            startLiveClass: 'btn-live',
            liveBtnClass: 'modals-live',
            videoBtnClass: 'modals-video',
            showClass: 'active'
        };

        extend(this.options, options);

        this.modalFile = fcConfig.publicFile.tabs_lives;
        this.modallLiveEl = this.element.getElementsByClassName(this.options.startLiveClass)[0];
        this.init();
    }

    init() {
        const self = this;
        this.tpl = {};

        importTemplate(this.modalFile, function(id, _template) {
            self.tpl[id] = Template.render(_template, LANG);;
        });
        this._bindEvent();
    }

    _bindEvent() {
        let self = this;

        // 直播开始按钮
        addEvent(self.modallLiveEl, 'click', function() {
            let _modal = modal.actions(self.tpl.start_lives, {
                theme: 'theme-black',
                cancelBtn: true,
                cancelIcon: true
            });
            self._LivesEvent(_modal);
        });
    }

    _LivesEvent(modalEl) {
        let liveEl = modalEl.getElementsByClassName(this.options.liveBtnClass)[0];
        let videoEl = modalEl.getElementsByClassName(this.options.videoBtnClass)[0];

        // 直播
        addEvent(liveEl, 'click', function() {
            console.log('live');
        });

        // 小视频
        addEvent(videoEl, 'click', function() {
            console.log('video');
        });
    }

    static attachTo(element, options) {
        return new Tabs(element, options);
    }
}
