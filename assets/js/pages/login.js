import Modal from '../modal';
import {
    getLangConfig
} from '../lang';

const LANG = getLangConfig();
const modal = new Modal();

let login = {
	init: function() {
		console.log('这里是登录js');
		this.event();
	},
	event: function() {
		let Group = $('.form-group');

		// 选择国家
		Group.on('click', '.form-control.country', function() {
			modal.countryModal();
		});

		// 输入状态
		Group.on('blur', '.form-control', function() {
			console.log('onblur');
			let $self = $(this);
			let $group = $self.parent();
			$group.removeClass('active');
		}).on('focus', '.form-control', function() {
			console.log('onfocus');
			let $self = $(this);
			let $group = $self.parent();
			$group.addClass('active');
		});

		// 明密文
		Group.on('click', 'i.btn-bright', function() {
			console.log('进入米明文');
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