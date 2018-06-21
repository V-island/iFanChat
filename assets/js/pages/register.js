import Modal from '../modal';
import {
    getLangConfig
} from '../lang';
import {
    sendVerificationCode,
    getRegister
} from '../api';
import {
    isPoneAvailable,
    addCountdown
} from '../util';

const LANG = getLangConfig();
const modal = new Modal();

let login = {
	init: function() {
		console.log('这里是注册js');
		this.event();
	},
	event: function() {
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
			let $btnVer = $group.find('.btn-verification');

			$group.addClass('active');
			if ($btnVer.length > 0) {
				$btnVer.removeClass('disabled');
			}
		});

		// 发送验证码
		Group.on('click', '.btn-verification', function(e) {
			let $self = $(this);

			if ($self.hasClass('disabled')) {
				return e.preventDefault();
			}

			let $input = $self.siblings('input.form-control');
			let _value = $input.val();

			if (isPoneAvailable(_value)) {
				sendVerificationCode(_value, function() {
					$self.addClass('disabled');
					addCountdown($self, 60);
				});
			}
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
	}
}
export default login;