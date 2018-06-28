import Modal from './modal';
import fcConfig from './intro';
import {
	getLangConfig
} from './lang';
import {
	extend,
	isObject,
	getUuid,
	urlParse,
	getLocalStorage,
	setLocalStorage,
	removeLocalStorage,
	clearLocalStorage
} from './util';

const LANG = getLangConfig();
const modal = new Modal();

// const baseURL = 'http://10.30.11.112:8080/live-app/open/gate';
const baseURL = 'https://10.30.11.112:8443/live-app/open/gate';
// const baseURL = 'https://10.30.11.112:8443/live-app/register';
const Type = 'POST';
const MacType = 1; // 设备类型 1.手机 2.PC
const PhoneType = null;
const LofinMode = 2; // 登入方式 1.APP 2.web 3.PC

// localStorage KEY
const TOKEN_NAME = 'TOKEN';
const UER_NAME = 'USE_INFO';
const UUID = 'UUID';

function getPost(_url, param, _type, _header, async, callback) {
	if (typeof _type === 'function') {
	    callback = arguments[2];
	    _type = undefined;
	    _header = undefined;
	    async = undefined;
	}

	let token = localStorage.getItem('token');
		_type = _type == undefined ? Type : _type;
		// _baseURL = _url.indexOf('https')>-1 ? _url : baseURL;
		async = async != undefined ? async : '';
		_header = _header != undefined ? _header : '';
		param = param != undefined ? param : '';

	param.keyword = _url.indexOf('/') > -1 ? _url.slice(1) : _url;

	let ajaxOpt ={
		type: _type,
		url: baseURL,
		cache: false,
	    statusCode: {
	        200: function() {console.log(200)},
	        400: function() {toastr.error('400 你已经在其它设备登入，请重新登入');clearLocalStorage();location.href = '#/login';},
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
	let post = Promise.resolve($.ajax(ajaxOpt)).then(function(response) {
		if (response.code === 1000) {
			return callback(response);
		}

		modal.alert(response.message, function(_modal) {
			modal.closeModal(_modal);
		});

	}, function(error) {
		console.log(error);
	});
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

// 获取用户信息
export function getUserInfo() {
	return getLocalStorage(UER_NAME);
}

// 判断是否是主播
export function checkAuth() {
	let _auth = getLocalStorage(UER_NAME);

	if (_auth.auth === 2) {
		return false;
	}
	return true;
}

// 验证登录状态
export function checkLogin() {
	return getLocalStorage(UER_NAME) === null ? true : false;
}

/**
 * 发送验证码
 * @param  {[string]} _phone 	   手机号
 * @param  {[type]} callback     回调事件
 * @return {[type]} [description]
 */
export function sendVerificationCode(_phone, callback) {
	getPost('/sendAuthCode', {
		phone: _phone
	}, function(response) {
		callback();
	});
};

/**
 * 注册
 * @param  {[object]} params 	   [description]
 * @param  {[type]} callback     回调事件
 * @return {[type]} [description]
 */
export function getRegister(params, callback) {
	let _params = isObject(params) ? params : urlParse(params);
	getPost('/insRegister', _params, function(response) {
		getLogin({
			phoneCode: _params.phoneCode,
			userPhone: _params.userPhone,
			userPassword: _params.userPassword
		});
	});
};

/**
 * 登录
 * @param  {[object]} params 	   [description]
 * @param  {[type]} callback     回调事件
 * @return {[type]} [description]
 */
export function getLogin(params, callback) {
	let _params = isObject(params) ? params : urlParse(params);
	let _mac = getMac();
	_params.mac = _mac;
	_params.macType = MacType;
	_params.phoneType = PhoneType;
	_params.loginMode = LofinMode;
	_params.status = 1;
	getPost('/appLogin', _params, function(response) {
		modal.toast(response.message);
		setLocalStorage(TOKEN_NAME, response.data.token);
		personCenter({
			userId: response.data.userId,
			phoneCode: response.data.phoneCode,
			userPhone: response.data.userPhone
		}, response.data.token, _mac);
	});
};

/**
 * 个人中心/个人信息
 * @return {[type]} [description]
 */
export function personCenter(params, token, mac) {
	let _info = isObject(params) ? params : getLocalStorage(UER_NAME);
	let _params = {
		userId: _info.userId,
		token: token,
		loginMode: LofinMode,
		mac: mac
	}
	getPost('/personCenter', _params, function(response) {
		modal.toast(response.message);
		_info.auth = response.data.user_authentication;
		setLocalStorage(UER_NAME, _info);
		location.href = '#/home';
	});
};

/**
 * 找回密码
 * @param  {[object]} params 	   [description]
 * @param  {[type]} callback     回调事件
 * @return {[type]} [description]
 */
export function getFindPassword(params, callback) {
	let _params = isObject(params) ? params : urlParse(params);
	getPost('/findPassword', _params, function(response) {
		setLocalStorage(UER_NAME, {
			phoneCode: _params.phoneCode,
			userPhone: _params.userPhone
		});
		callback();
	});
};

/**
 * 更新密码
 * @param  {[object]} params 	   [description]
 * @param  {[type]} callback       回调事件
 * @return {[type]} [description]
 */
export function getUpdatePassword(params, callback) {
	let _params = isObject(params) ? params : urlParse(params);
	let _info = getLocalStorage(UER_NAME);
	_params.phoneCode = _info.phoneCode;
	_params.userPhone = _info.userPhone;
	getPost('/updatePassword', _params, function(response) {
		modal.toast(response.message);
		callback();
	});
};

/**
 * 登出
 * @param  {[type]} callback     回调事件
 * @return {[type]} [description]
 */
export function loginOut(callback) {
	let _info = getLocalStorage(UER_NAME);
	let _params = {
		userId: _info.userId,
		token: getLocalStorage(TOKEN_NAME),
		status: 2
	}
	getPost('/updatePassword', _params, function(response) {
		modal.toast(response.message);
		callback();
	});
};

/**
 * 每日一录
 * @param  {[type]} callbackOk     通过事件
 * @param  {[type]} callbackCancel 取消事件
 * @return {[type]} [description]
 */
export function newDayRecord(callbackOk, callbackCancel) {
	let start = true;
	return start ? callbackOk() : callbackCancel();
};

/**
 * 用户上传视频
 * @param  {[object]} params 	   [description]
 * @param  {[type]} callback     	回调事件
 * @return {[type]} [description]
 */
export function uploadVideo(_file, _type, callback) {
	let _info = getLocalStorage(UER_NAME);
	let _params = {
		userId: _info.userId,
		file: _file,
		type: _type,
		token: getLocalStorage(TOKEN_NAME),
		loginMode: LofinMode,
		mac: getMac()
	}
	getPost('/uploadVideo', _params, function(response) {
		modal.toast(response.message);
		callback();
	});
};