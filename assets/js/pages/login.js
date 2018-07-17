import Template from 'art-template/lib/template-web';
import EventEmitter from '../eventEmitter';
import Modal from '../modal';

import {
    getLangConfig
} from '../lang';

import {
    getLogin,
    checkCountry,
    findAllCountry
} from '../api';

import {
    extend,
    createDom
} from '../util';

const LANG = getLangConfig();
const modal = new Modal();

export default class Login extends EventEmitter {
	constructor(element, options) {
	    super();

	    this.options = {
    		data: []
        };

	    extend(this.options, options);

	    this._init(element);
	}

	_init(element) {
		console.log('这里是登录js');
		this.LoginEl = createDom(Template.render(element, LANG));
		setTimeout(() => {
			this.trigger('pageLoadStart', this.LoginEl);
		}, 0);
		this._bindEvent();
	}

	_bindEvent() {
		let FormLogin = $('form.form-login', this.LoginEl);
		let Group = $('.form-group', this.LoginEl);

		// 选择国家
		Group.on('click', '.form-control.country', function() {
			let $self = $(this);
			let lang = $self.data('lang');
			let getCountry = checkCountry();

			if (getCountry) {
				modal.countryModal(lang, getCountry);
			}else {
				let getAllCountry = findAllCountry();
				getAllCountry.then((data) => {
				    modal.countryModal(lang, data);
				});
			}
		});

		// 输入状态
		Group.on('blur', '.form-control', function() {
			let $self = $(this);
			let $group = $self.parent();
			$group.removeClass('active');
		}).on('focus', '.form-control', function() {
			let $self = $(this);
			let $group = $self.parent();
			$group.addClass('active');
		});

		// 明密文
		Group.on('click', 'i.btn-bright', function() {
			let $self = $(this);
			let $input = $self.siblings('input.form-control');

			if ($self.hasClass('icon-eye-black')) {
				$self.removeClass('icon-eye-black').addClass('icon-eye'); //密码可见
				$input.prop('type', 'text');
			} else {
				$self.removeClass('icon-eye').addClass('icon-eye-black'); //密码不可见
				$input.prop('type', 'password');
			};
		});

		// 表单提交
		FormLogin.submit(function(e) {
			let $self = $(this);
			// let $input = $(this).find('input.form-control');
			let _params = $self.serialize();

			getLogin(_params);
			e.preventDefault();
		});
	}

	static attachTo(element, options) {
	    return new Login(element, options);
	}
}