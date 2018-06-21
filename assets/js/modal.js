import Picker from './picker';
import EventEmitter from './eventEmitter';
import DateTimePicker from 'pickerjs';
import {
    getLangConfig,
    setLangConfig
} from './lang';
import {
    refreshURL
} from './util';

const LANG = getLangConfig();
const PUBLIC = LANG.PUBLIC;
const COUNTRY = LANG.COUNTRY;
const _modalTemplateTempDiv = document.createElement('div');

export default class Modal extends EventEmitter {
    constructor() {
        super();

        this.defaults = {
            modalStack: true,
            modalTitle: false,
            modalButtonOk: PUBLIC.ModalButtonOk,
            modalButtonCancel: PUBLIC.ModalButtonCancel,
            confirmButtonOk: PUBLIC.ConfirmButtonOk,
            confirmButtonCancel: PUBLIC.ConfirmButtonCancel,
            modalPreloaderTitle: PUBLIC.modalPreloaderTitle,
            modalContainer : document.body ? document.body : 'body'
        };

        this.modalStack = [];

        this._bindEvent();
    }

    _bindEvent() {
        let self = this;

        /**
         * 关闭函数handleClicks
         * @param  {[type]} e [description]
         * @return {[type]}   [description]
         */
        $(document).on('click', ' .modal-overlay, .popup-overlay, .close-popup, .open-popup, .close-picker', function(e) {
            let clicked = $(this);
            let url = clicked.attr('href');


            //Collect Clicked data- attributes
            let clickedData = clicked.dataset();

            // Popup
            let popup;
            if (clicked.hasClass('open-popup')) {
                if (clickedData.popup) {
                    popup = clickedData.popup;
                }
                else popup = '.popup';
                self.popup(popup);
            }
            if (clicked.hasClass('close-popup')) {
                if (clickedData.popup) {
                    popup = clickedData.popup;
                }
                else popup = '.popup.modal-in';
                self.closeModal(popup);
            }

            // Close Modal
            if (clicked.hasClass('modal-overlay')) {
                if ($('.modal.modal-in').length > 0 && self.defaults.modalCloseByOutside)
                    self.closeModal('.modal.modal-in');
                if ($('.actions-modal.modal-in').length > 0 && self.defaults.actionsCloseByOutside)
                    self.closeModal('.actions-modal.modal-in');

            }
            if (clicked.hasClass('popup-overlay')) {
                if ($('.popup.modal-in').length > 0 && self.defaults.popupCloseByOutside)
                    self.closeModal('.popup.modal-in');
            }
        })
    }

    /**
     * 模态堆栈清除队列
     * @return {[type]} [description]
     */
    _modalStackClearQueue() {
        if (this.modalStack.length) {
            (this.modalStack.shift())();
        }
    }

    _preloaderModal() {
        const self = this;

        return self.modal({
            title: title || self.defaults.modalPreloaderTitle,
            text: '<div class="preloader"></div>'
        });
    }

    showPreloader(title) {
        const self = this;

        self.hidePreloader();
        return self._preloaderModal();
    }

    hidePreloader() {
        const self = this;

        self._preloaderModal() && self.closeModal(self._preloaderModal());
    }

    showIndicator() {
        const self = this;

        if ($('.preloader-indicator-modal')[0]) return;
        $(self.defaults.modalContainer).append('<div class="preloader-indicator-overlay"></div><div class="preloader-indicator-modal"><span class="preloader preloader-white"></span></div>');
    }

    hideIndicator() {
        $('.preloader-indicator-overlay, .preloader-indicator-modal').remove();
    }

    /**
     * 打开弹框
     * @param  {[type]}   modal [description]
     * @param  {Function} cb    [description]
     * @return {[type]}         [description]
     */
    openModal(modal, cb) {
        const self = this;

        modal = $(modal);
        let isModal = modal.hasClass('modal'),
            isNotToast = !modal.hasClass('toast');
        if ($('.modal.modal-in:not(.modal-out)').length && self.defaults.modalStack && isModal && isNotToast) {
            $.modalStack.push(function () {
                $.openModal(modal, cb);
            });
            return;
        }
        let isPopup = modal.hasClass('popup');
        let isLoginScreen = modal.hasClass('login-screen');
        let isPickerModal = modal.hasClass('picker-modal');
        let isToast = modal.hasClass('toast');
        if (isModal) {
            modal.show();
            modal.css({
                marginTop: - Math.round(modal.outerHeight() / 2) + 'px'
            });
        }
        if (isToast) {
            modal.css({
                marginLeft: - Math.round(modal.outerWidth() / 2 / 1.185) + 'px' //1.185 是初始化时候的放大效果
            });
        }

        let overlay;
        if (!isLoginScreen && !isPickerModal && !isToast) {
            if ($('.modal-overlay').length === 0 && !isPopup) {
                $(self.defaults.modalContainer).append('<div class="modal-overlay"></div>');
            }
            if ($('.popup-overlay').length === 0 && isPopup) {
                $(self.defaults.modalContainer).append('<div class="popup-overlay"></div>');
            }
            overlay = isPopup ? $('.popup-overlay') : $('.modal-overlay');
        }

        //Make sure that styles are applied, trigger relayout;
        let clientLeft = modal[0].clientLeft;

        // Trugger open event
        modal.trigger('open');

        // Picker modal body class
        if (isPickerModal) {
            $(self.defaults.modalContainer).addClass('with-picker-modal');
        }

        // Classes for transition in
        if (!isLoginScreen && !isPickerModal && !isToast) overlay.addClass('modal-overlay-visible');
        modal.removeClass('modal-out').addClass('modal-in').transitionEnd(function (e) {
            if (modal.hasClass('modal-out')) modal.trigger('closed');
            else modal.trigger('opened');
        });
        // excute callback
        if (typeof cb === 'function') {
          cb.call(this);
        }
        return true;
    }

    /**
     * 关闭弹框
     * @param  {[type]} modal [description]
     * @return {[type]}       [description]
     */
    closeModal(modal) {
        const self = this;

        modal = $(modal || '.modal-in');
        if (typeof modal !== 'undefined' && modal.length === 0) {
            return;
        }
        let isModal = modal.hasClass('modal'),
            isPopup = modal.hasClass('popup'),
            isToast = modal.hasClass('toast'),
            isLoginScreen = modal.hasClass('login-screen'),
            isPickerModal = modal.hasClass('picker-modal'),
            removeOnClose = modal.hasClass('remove-on-close'),
            overlay = isPopup ? $('.popup-overlay') : $('.modal-overlay');
        if (isPopup){
            if (modal.length === $('.popup.modal-in').length) {
                overlay.removeClass('modal-overlay-visible');
            }
        }
        else if (!(isPickerModal || isToast)) {
            overlay.removeClass('modal-overlay-visible');
        }

        modal.trigger('close');

        // Picker modal body class
        if (isPickerModal) {
            $(self.defaults.modalContainer).removeClass('with-picker-modal');
            $(self.defaults.modalContainer).addClass('picker-modal-closing');
        }

        modal.removeClass('modal-in').addClass('modal-out').transitionEnd(function (e) {
            if (modal.hasClass('modal-out')) modal.trigger('closed');
            else modal.trigger('opened');

            if (isPickerModal) {
                $(self.defaults.modalContainer).removeClass('picker-modal-closing');
            }
            if (isPopup || isLoginScreen || isPickerModal) {
                modal.removeClass('modal-out').hide();
                if (removeOnClose && modal.length > 0) {
                    modal.remove();
                }
            }
            else {
                modal.remove();
            }
        });
        if (isModal &&  self.defaults.modalStack ) {
            self._modalStackClearQueue();
        }

        return true;
    }

    /**
     * 创建modal
     * @param  {[object]} params [description]
     * @return {[type]}        [description]
     */
    modal(params) {
        const self = this;

        params = params || {};
        let modalHTML = '';
        let buttonsHTML = '';
        if (params.buttons && params.buttons.length > 0) {
            for (let i = 0; i < params.buttons.length; i++) {
                buttonsHTML += '<span class="modal-button' + (params.buttons[i].fill ? ' modal-button-fill' : '') + '" data-ripple>' + params.buttons[i].text + '</span>';
            }
        }
        let extraClass = params.extraClass || '';
        let titleHTML = params.title ? '<div class="modal-title">' + params.title + '</div>' : '';
        let closeHTML = params.closeBtn ? '<a href="javascript: void(0)" class="modal-close"><i class="ion ion-md-close"></i></a>' : '';
        let textHTML = params.text ? '<div class="modal-text">' + params.text + '</div>' : '';
        let afterTextHTML = params.afterText ? params.afterText : '';
        let noButtons = !params.buttons || params.buttons.length === 0 ? 'modal-no-buttons' : '';
        let verticalButtons = params.verticalButtons ? 'modal-buttons-vertical' : '';
        modalHTML = '<div class="modal ' + extraClass + ' ' + noButtons + '"><div class="modal-header">' + (titleHTML + closeHTML) + '</div><div class="modal-inner">' + (textHTML + afterTextHTML) + '</div><div class="modal-buttons ' + verticalButtons + '">' + buttonsHTML + '</div></div>';

        _modalTemplateTempDiv.innerHTML = modalHTML;

        let modal = $(_modalTemplateTempDiv).children();

        $(defaults.modalContainer).append(modal[0]);

        let picker;
        if (typeof params.onEvent === 'function') {
            picker = params.onEvent(modal[0]);
        }

        // Add events on buttons
        modal.find('.modal-button').each(function (index, el) {
            $(el).on('click', function (e) {
                if (params.buttons[index].close !== false) self.closeModal(modal);
                if (params.buttons[index].onClick) params.buttons[index].onClick(modal, e);
                if (params.onClick) params.onClick(modal, index, picker);
            });
        });
        modal.find('.modal-close').on('click', function(e) {
            self.closeModal(modal);
        });
        self.openModal(modal);
        return modal[0];
    }

    /**
     * Modal.options()
     * 选择表
     * @param  {[object]} params [description]
     * @return {[type]}        [description]
     */
    options(params) {
        const self = this;

        params = params || {};
        let buttonsHTML = '';
        if (params.buttons && params.buttons.length > 0) {
            for (let i = 0; i < params.buttons.length; i++) {
                buttonsHTML += '<li class="list-item" data-value="'+ params.buttons[i].value +'" data-ripple>' + params.buttons[i].text + '</li>';
            }
        }
        let titleHTML = params.title ? '<div class="modal-title">' + params.title + '</div>' : '';
        let closeHTML = params.closeBtn ? '<a href="javascript: void(0)" class="modal-close"><i class="ion ion-md-close"></i></a>' : '';
        let headerHTML = titleHTML || closeHTML ? '<div class="modal-header">' + (titleHTML + closeHTML) + '</div>' : '';
        let modalHTML = '<div class="modal">' + headerHTML + '<ul class="list modal-list">' + buttonsHTML + '</ul></div>';

        _modalTemplateTempDiv.innerHTML = modalHTML;

        let modal = $(_modalTemplateTempDiv).children();

        $(self.defaults.modalContainer).append(modal[0]);

        // Add events on buttons
        modal.find('.list-item').each(function (index, el) {
            $(el).on('click', function (e) {
                if (params.buttons[index].close !== false) self.closeModal(modal);
                if (params.buttons[index].onClick) {
                    let _self = $(this);
                    let _value = _self.data('value');
                    let _text = _self.text();
                    params.buttons[index].onClick(_text, _value);
                };
            });
        });

        self.openModal(modal);
        return modal[0];
    }

    /**
     * Modal.alert()
     * 警告框
     * @param  {[string]} text       内容文字
     * @param  {[string]} title      标题文字
     * @param  {[function]} callbackOk 通过事件
     * @param  {[string]} button     提示按钮
     * @return {[object]}            params
     */
    alert(text, title, callbackOk, button) {
        const self = this;

        if (typeof title === 'function') {
            callbackOk = arguments[1];
            title = undefined;
        }
        return self.modal({
            text: text || '',
            title: typeof title === 'undefined' ? defaults.modalTitle : title,
            closeBtn: true,
            verticalButtons: true,
            buttons: [{
                text: typeof button === 'undefined' ? defaults.modalButtonOk : button,
                onClick: callbackOk
            }]
        });
    }

    /**
     * Modal.confirm()
     * 对话框
     * @param  {[string]} text           内容文字
     * @param  {[string]} title          标题文字
     * @param  {[function]} callbackOk     通过事件
     * @param  {[function]} callbackCancel 取消事件
     * @param  {[string]} prompt         提示按钮
     * @return {[object]}                params
     */
    confirm(text, title, callbackOk, callbackCancel, prompt) {
        const self = this;

        if (typeof title === 'function') {
            callbackCancel = arguments[2];
            callbackOk = arguments[1];
            title = undefined;
        }
        return self.modal({
            text: text || '',
            title: typeof title === 'undefined' ? defaults.modalTitle : title,
            closeBtn: true,
            buttons: [{
                text: typeof prompt === 'undefined' ? defaults.confirmButtonCancel : defaults.modalButtonCancel,
                fill: true,
                onClick: callbackCancel
            }, {
                text: typeof prompt === 'undefined' ? defaults.confirmButtonOk : defaults.modalButtonOk,
                onClick: callbackOk
            }]
        });
    }

    /**
     * Modal.prompt()
     * 可进行输入的对话框
     * @param  {[string]} text           内容文字
     * @param  {[string]} title          标题文字
     * @param  {[function]} callbackOk     通过事件
     * @param  {[function]} callbackCancel 取消事件
     * @param  {[string]} prompt         提示按钮
     * @return {[object]}                params
     */
    prompt(text, title, callbackOk, callbackCancel, prompt) {
        const self = this;

        if (typeof title === 'function') {
            callbackCancel = arguments[2];
            callbackOk = arguments[1];
            title = undefined;
        }
        return self.modal({
            title: typeof title === 'undefined' ? defaults.modalTitle : title,
            closeBtn: true,
            afterText: '<input type="text" class="modal-text-input" placeholder="'+ text +'">',
            buttons: [
                {
                    text: typeof prompt === 'undefined' ? defaults.confirmButtonCancel : defaults.modalButtonCancel,
                    fill: true
                },
                {
                    text: typeof prompt === 'undefined' ? defaults.confirmButtonOk : defaults.modalButtonOk
                }
            ],
            onClick: function (modal, index) {
                if (index === 0 && callbackCancel) callbackCancel($(modal).find('.modal-text-input').val());
                if (index === 1 && callbackOk) callbackOk($(modal).find('.modal-text-input').val());
            }
        });
    }

    /**
     * 操作表
     * @param  {[type]} params [description]
     * @return {[type]}        [description]
     */
    actions(modal, params) {
        const self = this;
        let titleHTML = params.title ? '<div class="modal-title">' + params.title + '</div>' : '';
        let closeHTML = params.closeBtn ? '<a href="javascript: void(0)" class="modal-close"><i class="ion ion-md-close"></i></a>' : '';
        let headerHTML = titleHTML || closeHTML ? '<div class="modal-header">' + (titleHTML + closeHTML) + '</div>' : '';
        let cancelHTML = params.cancelBtn ? '<a href="javascript: void(0)" class="button button-link actions-button-cancel" data-ripple>Cancel</a>' : '';
        let modalHTML = '<div class="actions-modal">' + (headerHTML + modal + cancelHTML) + '</div>';

        _modalTemplateTempDiv.innerHTML = modalHTML;

        let _modal = $(_modalTemplateTempDiv).children();

        $(self.defaults.modalContainer).append(_modal[0]);

        _modal.find('.modal-close').on('click', function (e) {
            self.closeModal(_modal);
        });
        // Add events on buttons
        // _modal.find('.modal-close').each(function (index, el) {
        //     $(el).on('click', function (e) {
        //         if (params.buttons[index].close !== false) $.closeModal(modal);
        //         // if (params.buttons[index].onClick) params.buttons[index].onClick(modal, e);
        //         // if (params.onClick) params.onClick(modal, index);
        //     });
        // });
        self.openModal(_modal);
        return modal[0];
    }

    /**
     * 弹出整页
     * @param  {[string]} modal         [description]
     * @param  {[function]} removeOnClose [description]
     * @return {[type]}               [description]
     */
    popup(modal, callbackOnClose) {
        const self = this;

        if (typeof modal === 'string' && modal.indexOf('<') >= 0) {
            let _modal = document.createElement('div');
            _modal.innerHTML = modal.trim();
            if (_modal.childNodes.length > 0) {
                modal = _modal.childNodes[0];
                $(self.defaults.modalContainer).append(modal);
            }
            else return false; //nothing found
        }
        modal = $(modal);
        if (modal.length === 0) return false;
        modal.show();
        // modal.find(".content").scroller("refresh");
        // if (modal.find('.' + self.defaults.viewClass).length > 0) {
        //     $.sizeNavbars(modal.find('.' + self.defaults.viewClass)[0]);
        // }
        if (typeof callbackOnClose === 'function') callbackOnClose(modal);

        self.openModal(modal);
        return modal[0];
    }

    /**
     * 弹框滑动选择
     * @param  {[array]} data           为二位数组，如[lists1, lists2, lists3]
     * @param  {[string]} title          标题文字
     * @param  {[function]} callbackOk     通过事件
     * @param  {[function]} callbackCancel 取消事件
     * @return {[type]}                [description]
     */
    pickerModal(data, title, callbackOk, callbackCancel) {
        const self = this;

        if (typeof title === 'function') {
            callbackCancel = arguments[2];
            callbackOk = arguments[1];
            title = false;
        }
        let picker = new Picker({
            data: [data],
            title: title,
            buttons: [{
                text: self.defaults.confirmButtonCancel,
                fill: true,
            }, {
                text: self.defaults.confirmButtonOk
            }]
        });

        picker.show();
        picker.on('picker.valuechange', function(selectedVal, selectedText, selectedIndex) {
            self.closeModal(picker.modalEl);
            callbackOk(selectedIndex, selectedText);
        });
        picker.on('picker.cancel', function() {
            self.closeModal(picker.modalEl);
        });

        self.openModal(picker.modalEl);
        return picker.modalEl;
    }

    /**
     * 日期时间选择器
     * @param  {[type]} title          标题文字
     * @param  {[type]} callbackOk     通过事件
     * @param  {[type]} callbackCancel 取消事件
     * @return {[type]}                [description]
     */
    dateTimePickerModal(title, callbackOk, callbackCancel) {
        const self = this;

        if (typeof title === 'function') {
            callbackOk = arguments[1];
            callbackCancel = arguments[2];
            title = undefined;
        }
        return self.modal({
            title: typeof title === 'undefined' ? self.defaults.modalTitle : title,
            closeBtn: true,
            afterText: '<div class="data-time-picker"></div>',
            buttons: [
                {
                    text: self.defaults.confirmButtonCancel,
                    fill: true
                },
                {
                    text: self.defaults.confirmButtonOk
                }
            ],
            onClick: function (modal, index, picker) {
                if (index === 0 && callbackCancel) callbackCancel(picker.getDate());
                if (index === 1 && callbackOk) callbackOk(picker.getDate());
            },
            onEvent: function (modal) {
                let _element = modal.querySelector('.data-time-picker');
                let picker = new DateTimePicker(_element, {
                    inline: true,
                    format: 'YYYY-MM-DD',
                    rows: 3,
                });
                return picker;
            }
        });
    }

    /**
     * 多选弹框
     * @param  {[type]} params     [description]
     * @param  {[type]} callbackOk 通过事件
     * @return {[type]}            [description]
     */
    checkboxModal(params, callbackOk) {
        const self = this;

        params = params || {};
        let modalHTML = '',
            listHTML = '';
        let titleHTML = params.title ? '<h1 class="title">'+ params.title +'</h1>' : '';
        let closeHTML = params.closeBtn ? '<div class="icon-btn close-popup" data-ripple><i class="icon icon-arrow-back"></i></div>' : '';
        let textHTML = params.text ? '<p class="popup-text">' + params.text + '</p>' : '';
        let selected = params.selected ? params.selected : 3;

        params.data.forEach((_data, index) => {
            listHTML += '<li class="list-item" data-val="'+ _data.value +'" data-ripple><span class="list-item-text">'+ _data.text +'</span><span class="icon user-checkbox list-item-meta"></span></li>';
        });
        modalHTML = '<div class="popup"><header class="bar bar-flex">'+ (closeHTML + titleHTML) +'</header><div class="content block">'+ textHTML + '<ul class="list list-user list-info popup-list">'+ listHTML +'</ul></div></div>';
        return self.popup(modalHTML, function(modal) {
            modal.find('.list-item').on('click', function() {
                let _self = $(this);
                let _item = modal.find('.list-item.active');

                if (_self.hasClass('active')) {
                    _self.removeClass('active');
                }else {
                    if (_item.length >= selected) {
                        return;
                    }
                    _self.addClass('active');
                }
            });
            modal.find('.close-popup').on('click', function(e) {
                let _item = modal.find('.list-item.active');
                let _Data = [];

                modal.find('.list-item.active').each(function (index, el) {
                    let _child = {};
                    _child.value = $(el).data('val');
                    _child.text = $(el).find('.list-item-text').text();
                    _Data.push(_child);
                });
                callbackOk(_Data);
            });
            $('[data-ripple]').ripple();
        });
    }

    /**
     * 国家语言选择
     * @return {[type]}            [description]
     */
    countryModal(lang) {
        const self = this;
        let params = COUNTRY;
        let modalHTML = '',
            listHTML = '';
        let titleHTML = params.Title ? '<h1 class="title">'+ params.Title +'</h1>' : '';
        let closeHTML = '<div class="icon-btn close-popup" data-ripple><i class="icon icon-arrow-back"></i></div>';

        params.Lists.forEach((_data, index) => {
            listHTML += '<li class="list-item '+ (lang == _data.lang ? 'active' : '') +'" data-lang="'+ _data.lang +'" data-ripple><span class="list-item-text">'+ _data.text +'</span><span class="icon user-checkbox list-item-meta"></span></li>';
        });
        modalHTML = '<div class="popup"><header class="bar bar-flex no-bg">'+ (closeHTML + titleHTML) +'</header><div class="content block"><ul class="list list-user list-info popup-list no-bg">'+ listHTML +'</ul></div></div>';
        return self.popup(modalHTML, function(modal) {
            modal.find('.list-item').on('click', function() {
                let _self = $(this);
                let _lang = _self.data('lang');
                setLangConfig(_lang);
                refreshURL();
            });
            $('[data-ripple]').ripple();
        });
    }

    /**
     * Modal.toast()
     * //显示一个消息，会在2秒钟后自动消失
     * @param  {[string]} msg        [description]
     * @param  {[type]} duration   [description]
     * @param  {[type]} extraclass [description]
     * @return {[type]}            [description]
     */
    toast(msg, duration, extraclass) {
        const self = this;
        let $toast = $('<div class="modal toast ' + (extraclass || '') + '">' + msg + '</div>').appendTo(document.body);

        self.openModal($toast, function(){
            setTimeout(function() {
                self.closeModal($toast);
            }, duration || 2000);
        });
    }

}
