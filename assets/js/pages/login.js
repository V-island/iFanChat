import Modal from '../modal';
import {
    getLangConfig
} from '../lang';
import {
    getLogin
} from '../api';

const LANG = getLangConfig();
const modal = new Modal();

let login = {
	init: function() {
		console.log('这里是登录js');
		this._bindEvent();
	},
	_bindEvent: function() {
		let Form = $('form.form-login');
		let Group = $('.form-group');

		// 选择国家
		Group.on('click', '.form-control.country', function() {
			let $self = $(this);
			let lang = $self.data('lang');
			modal.countryModal(lang);
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
		Form.submit(function(e) {
			let $self = $(this);
			// let $input = $(this).find('input.form-control');
			let _params = $self.serialize();

			getLogin(_params);
			e.preventDefault();
		});
	}
}
export default login;