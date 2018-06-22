import Modal from './modal';
import {
	getLangConfig
} from './lang';
import {
	isObject,
	getUuid,
	urlParse,
	getLocalStorage,
	setLocalStorage,
	removeLocalStorage
} from './util';

const LANG = getLangConfig();
const modal = new Modal();

const baseURL = 'http://10.30.11.112:8080/live-app';
const Type = 'POST';

// localStorage KEY
const TOKEN_NAME = 'TOKEN';
const UER_NAME = 'USE_INFO';
const UUID = 'UUID';

function getPost(_url,param,_type,_header,async) {
	let token = localStorage.getItem('token');
		_type = _type == undefined ? Type : _type;
		_url = _url.indexOf('http')>-1 ? _url : baseURL + _url;
		async = async != undefined ? async : '';
		_header = _header != undefined ? _header : '';
		param = param != undefined ? param : '';



	if(token !== null && _header == ''){
		_header = {
			"Authorization":"Bearer "+token
		}
	}
	let ajaxOpt ={
		type: _type,
		url: _url,
		cache: false,
	    statusCode: {
	        200: function() {console.log(200)},
	        400: function() {toastr.error('400 用户不存在或者密码错误，登录失败')},
	        401: function() {toastr.error('401');removeLocalStorage(TOKEN_NAME);session.jumpPage('session/#/login');},
	        403: function() {toastr.error('403 用户没有对应操作权限')},
	        404: function() {toastr.error('404')},
	        405: function() {toastr.error('405');removeLocalStorage(TOKEN_NAME);session.jumpPage('session/#/login');}
	    }
	};


	if(_header !== ''){
		ajaxOpt.headers = _header;
	}
	if(param !== ''){
		ajaxOpt.data = param;
	}
	if(async !== ''){
		ajaxOpt.async = async;
	}
	console.log(ajaxOpt);
	let post = Promise.resolve($.ajax(ajaxOpt));
	return post;
}

function getMac() {
	let uuid = getLocalStorage(UUID);
	if (uuid) {
		return uuid;
	}
	uuid = getUuid();
	setLocalStorage(UUID, uuid);
	return uuid;
}

// 验证登录状态
export function checkLogin() {
	return getLocalStorage(UER_NAME) === null ? true : false;
}

/**
 * 发送验证码
 * @param  {[string]} _phone 	   手机号
 * @param  {[type]} callbackOk     通过事件
 * @return {[type]} [description]
 */
export function sendVerificationCode(_phone, callbackOk, callbackCancel) {
	getPost('/sendAuthCode', {
		phone: _phone
	}).then(function(response) {
		callbackOk();
	});
};

/**
 * 注册
 * @param  {[object]} params 	   [description]
 * @param  {[type]} callbackOk     通过事件
 * @param  {[type]} callbackCancel 取消事件
 * @return {[type]} [description]
 */
export function getRegister(params, callbackOk, callbackCancel) {
	let _params = isObject(params) ? params : urlParse(params);
	console.log(_params);
	getPost('/insRegister', _params)
	.then(function(response) {
		switch(response.code) {
			case 1:
				if (response.data) {
					getLogin({
						phoneCode: _params.phoneCode,
						userPhone: _params.userPhone,
						userPassword: _params.userPassword
					});
				}
				break;
			default:
				modal.alert(response.message, function(_modal) {
					modal.closeModal(_modal);
				});
		}
	});
};

/**
 * 登录
 * @param  {[object]} params 	   [description]
 * @param  {[type]} callbackOk     通过事件
 * @param  {[type]} callbackCancel 取消事件
 * @return {[type]} [description]
 */
export function getLogin(params, callbackOk, callbackCancel) {
	let _params = isObject(params) ? params : urlParse(params);
	_params.mac = getMac();
	_params.macType = 1;
	_params.phoneType = null;
	_params.loginMode = 2;
	_params.status = 1;
	getPost('/appLogin', _params)
	.then(function(response) {
		switch(response.code) {
			case 1:
				modal.toast(response.message);
				if (response.data) {
					setLocalStorage(TOKEN_NAME, response.data.token);
					setLocalStorage(UER_NAME, {
						userId: response.data.userId,
						phoneCode: response.data.phoneCode,
						userPhone: response.data.userPhone,
						userPassword: _params.userPassword
					});
					location.href = '#/home';
				}
				break;
			default:
				modal.alert(response.message, function(_modal) {
					modal.closeModal(_modal);
				});
		}
	});
};

/**
 * 找回密码
 * @param  {[object]} params 	   [description]
 * @param  {[type]} callbackOk     通过事件
 * @param  {[type]} callbackCancel 取消事件
 * @return {[type]} [description]
 */
export function getFindPassword(params, callbackOk, callbackCancel) {
	let _params = isObject(params) ? params : urlParse(params);
	getPost('/findPassword', _params)
	.then(function(response) {
		switch(response.code) {
			case 1:
				setLocalStorage(UER_NAME, {
					phoneCode: _params.phoneCode,
					userPhone: _params.userPhone
				});
				callbackOk();
				break;
			default:
				modal.alert(response.message, function(_modal) {
					modal.closeModal(_modal);
				});
		}
	});
};

/**
 * 更新密码
 * @param  {[object]} params 	   [description]
 * @param  {[type]} callbackOk     通过事件
 * @param  {[type]} callbackCancel 取消事件
 * @return {[type]} [description]
 */
export function getUpdatePassword(params, callbackOk, callbackCancel) {
	let _params = isObject(params) ? params : urlParse(params);
	let _info = getLocalStorage(UER_NAME);
	console.log(_info);
	_params.phoneCode = _info.phoneCode;
	_params.userPhone = _info.userPhone;
	console.log(_params);
	getPost('/updatePassword', _params)
	.then(function(response) {
		switch(response.code) {
			case 1:
				modal.toast(response.message);
				callbackOk();
				break;
			default:
				modal.alert(response.message, function(_modal) {
					modal.closeModal(_modal);
				});
		}
	});
};

/**
 * 登出
 * @param  {[type]} callbackOk     通过事件
 * @param  {[type]} callbackCancel 取消事件
 * @return {[type]} [description]
 */
export function loginOut(callbackOk, callbackCancel) {
	let _info = getLocalStorage(UER_NAME);
	let _params = {
		userId: _info.userId,
		token: getLocalStorage(TOKEN_NAME),
		status: 2
	}
	console.log(_params);
	getPost('/updatePassword', _params)
	.then(function(response) {
		switch(response.code) {
			case 1:
				modal.toast(response.message);
				callbackOk();
				break;
			default:
				modal.alert(response.message, function(_modal) {
					modal.closeModal(_modal);
				});
		}
	});
};