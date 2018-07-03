import Template from 'art-template/lib/template-web';
import EventEmitter from './eventEmitter';
import Modal from './modal';
import Record from './record';
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

export default class Tabs extends EventEmitter {
    constructor(options) {
        super();

        this.options = {
            itemClass: 'bar-item',
            startLiveClass: 'btn-live',
            liveBtnClass: 'modals-live',
            videoBtnClass: 'modals-video',
            showClass: 'active'
        };
        this.tabFile = fcConfig.publicFile.bar_tabs;

        extend(this.options, options);

        this.tabsEl = createDom(this._tabsTemplate(LANG.BAR));

        document.body.appendChild(this.tabsEl);

        this.itemEl = this.tabsEl.getElementsByClassName(this.options.itemClass);
        this.modallLiveEl = this.tabsEl.getElementsByClassName(this.options.startLiveClass)[0];
        this.init();
    }

    init() {
        const self = this;
        self.tpl = {};

        importTemplate(self.tabFile, function(id, _template) {
            self.tpl[id] = Template.render(_template, LANG);
        });

        this._bindEvent();
    }

    _bindEvent() {
        let self = this;

        // 页面切换
        for (let i = 0; i < self.itemEl.length; i++) {
            addEvent(self.itemEl[i], 'click', function() {
                let itemActive = self.tabsEl.getElementsByClassName(self.options.showClass)[0];

                if (hasClass(self.itemEl[i], self.options.showClass)) {
                    return false;
                }

                removeClass(itemActive, self.options.showClass);
                addClass(self.itemEl[i], self.options.showClass);
            });
        }

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
        let self = this;
        let liveEl = modalEl.getElementsByClassName(this.options.liveBtnClass)[0];
        let videoEl = modalEl.getElementsByClassName(this.options.videoBtnClass)[0];

        // 直播
        addEvent(liveEl, 'click', function() {
            modal.closeModal(modalEl);

            if (!checkAuth()) {
                let _dataIncomplete = MADAL.DataIncomplete;

                modal.alert(_dataIncomplete.Text, _dataIncomplete.Title, function() {
                    location.href = '#/user';
                }, _dataIncomplete.ButtonsText);
            }

            newDayRecord(function() {
                let _newDay = MADAL.NewDay;
                modal.confirm(_newDay.Text, function() {
                    let _record = new Record({
                        maxTimes: 5,
                        newDayVideo: true
                    });
                    _record.show();
                    _record.on('record.upload.success', function() {
                        self.liveWaiting();
                    });
                }, function() {
                    self.liveWaiting();
                }, true);
            }, function() {
                self.liveWaiting();
            });

        });

        // 小视频
        addEvent(videoEl, 'click', function() {
            modal.closeModal(modalEl);

            console.log('video');
        });
    }

    _tabsTemplate(options) {
        let html = '';
        let hash = location.hash;
        html = '<nav class="bar bar-tab">';
        html += '<a class="bar-item tab-item '+ (hash == '#/home' ? 'active' : '') +'" href="#/home" data-ripple><span class="icon icon-home"></span><span class="tab-label">'+ options.Home +'</span></a>';
        html += '<a class="bar-item tab-item '+ (hash == '#/favorite' ? 'active' : '') +'" href="#/favorite" data-ripple><span class="icon icon-favorite"></span><span class="tab-label">'+ options.Favorite +'</span></a>';
        html += '<a class="tab-item icons" href="javascript:void(0);"><span class="icon icon-live btn-live" data-ripple></span></a>';
        html += '<a class="bar-item tab-item '+ (hash == '#/message' ? 'active' : '') +'" href="#/message" data-ripple><span class="icon icon-message"></span><span class="tab-label">'+ options.Message +'</span></a>';
        html += '<a class="bar-item tab-item '+ (hash == '#/user' ? 'active' : '') +'" href="#/user" data-ripple><span class="icon icon-me"></span><span class="tab-label">'+ options.Me +'</span></a>';
        html += '</nav>';

        return html;
    }

    static attachTo(options) {
        return new Tabs(options);
    }

    static remove(tabsEl) {
        return document.body.removeChild(tabsEl);
    }

    // 直播等待
    liveWaiting(){
        let html = '<div class="tab-live-box"><div class="user-img avatar-female"></div></div>';
    }

}