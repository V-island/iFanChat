import Modal from '../modal';
import {
    getLangConfig
} from '../lang';
import {
    getUpdatePassword
} from '../api';

const LANG = getLangConfig();
const modal = new Modal();

let SetPassWord = {
	init: function() {
		this.event();
	},
	event: function() {
		let FormSetPassword = $('form.form-set-password');
		let Group = $('.form-group');

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
		FormSetPassword.submit(function(e) {
			let $self = $(this);
			// let $input = $(this).find('input.form-control');
			let _params = $self.serialize();
			console.log(_params);
			getUpdatePassword(_params, function() {
				location.href = '#/login';
			});
			e.preventDefault();
		});
	}
}
export default SetPassWord;