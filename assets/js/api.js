import Modal from './modal';
import fcConfig from './intro';
import {
	getLangConfig
} from './lang';
import {
	extend,
	typeOf,
	isObject,
	isFunction,
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

const NEW_List_DATA = [{
	user_id: 1,
	live_url: "https://media.html5media.info/video.mp4",
	everyday_img: "http://www.opixer.com/var/thumb/a4430993ef8cfca015e83a1e5680edc5-1280-900.jpg",
	heat: 9999,
	live_price: 10,
	status: 1,
	user_head: "http://www.opixer.com/var/thumb/a4430993ef8cfca015e83a1e5680edc5-1280-900.jpg",
	user_name: "LIVE"
}, {
	user_id: 2,
	live_url: "https://media.html5media.info/video.mp4",
	everyday_img: "http://www.opixer.com/var/thumb/a4430993ef8cfca015e83a1e5680edc5-1280-900.jpg",
	heat: 889,
	live_price: 10,
	status: 3,
	user_head: "http://www.opixer.com/var/thumb/a4430993ef8cfca015e83a1e5680edc5-1280-900.jpg",
	user_name: "COME"
}];

const HOT_List_DATA = [{
	user_id: 1,
	live_url: "https://media.html5media.info/video.mp4",
	everyday_img: "http://www.opixer.com/var/thumb/a4430993ef8cfca015e83a1e5680edc5-1280-900.jpg",
	heat: 9999,
	live_price: 10,
	status: 1,
	user_head: "http://www.opixer.com/var/thumb/a4430993ef8cfca015e83a1e5680edc5-1280-900.jpg",
	user_name: "LIVE"
}, {
	user_id: 2,
	live_url: "https://media.html5media.info/video.mp4",
	everyday_img: "http://www.opixer.com/var/thumb/a4430993ef8cfca015e83a1e5680edc5-1280-900.jpg",
	heat: 889,
	live_price: 10,
	status: 3,
	user_head: "http://www.opixer.com/var/thumb/a4430993ef8cfca015e83a1e5680edc5-1280-900.jpg",
	user_name: "COME"
}];

const VIDEO_List_DATA = [{
	user_id: 1,
	id: 199,
	video_img: "http://www.opixer.com/var/thumb/a4430993ef8cfca015e83a1e5680edc5-1280-900.jpg",
	video_new_name: "Do you like me",
	support: 9999,
	watch_number: 999,
	price: 10,
	user_head: "http://www.opixer.com/var/thumb/a4430993ef8cfca015e83a1e5680edc5-1280-900.jpg",
	user_name: "LIVE"
}, {
	user_id: 2,
	id: 456,
	video_img: "http://www.opixer.com/var/thumb/a4430993ef8cfca015e83a1e5680edc5-1280-900.jpg",
	video_new_name: "Do you not come to see such",
	support: 685,
	watch_number: 9999,
	price: 10,
	user_head: "http://www.opixer.com/var/thumb/a4430993ef8cfca015e83a1e5680edc5-1280-900.jpg",
	user_name: "COME"
}];

const ADVERTISEMENT_DATA = [{
	id: 199,
	show_url: "http://www.opixer.com/var/thumb/50f1591d615e5ad388ec310aac4207d9-1280-900.jpg",
	save_url: "http://www.opixer.com/var/thumb/50f1591d615e5ad388ec310aac4207d9-1280-900.jpg",
	img_title: "Do you like me",
	description: "LIVE",
	status: 1
}, {
	id: 456,
	show_url: "http://www.opixer.com/var/thumb/4183a3a24cf2d2650c294a337d9c4288-1280-900.jpg",
	save_url: "http://www.opixer.com/var/thumb/4183a3a24cf2d2650c294a337d9c4288-1280-900.jpg",
	img_title: "Do you like me",
	description: "LIVE",
	status: 1
}, {
	id: 456,
	show_url: "http://www.opixer.com/var/thumb/10b0e941baa19b6049cf9c677eff2f09-1280-900.jpg",
	save_url: "http://www.opixer.com/var/thumb/10b0e941baa19b6049cf9c677eff2f09-1280-900.jpg",
	img_title: "Do you like me",
	description: "LIVE",
	status: 1
}];

const VIDEO_TYPE_DATA = [{
	id: 1,
	video_type: 'Dance',
	status: 1
}, {
	id: 2,
	video_type: 'Singing',
	status: 1
}, {
	id: 3,
	video_type: 'Emotion',
	status: 1
}, {
	id: 4,
	video_type: 'Art',
	status: 1
}];

function getPost(_url, param, callback, callbackCancel, onProgress, _type, _header, async) {
	if (isObject(_url)) {
		onProgress = arguments[2];
	    callback = arguments[1];
	    param = _url;
	    async = true;
	}

	let token = localStorage.getItem('token');
		_type = _type == undefined ? Type : _type;
		// _baseURL = _url.indexOf('https')>-1 ? _url : baseURL;
		async = async != undefined ? async : '';
		_header = _header != undefined ? _header : '';
		param = param != undefined ? param : '';

	if (!isObject(_url)) {
		param.keyword = _url.indexOf('/') > -1 ? _url.slice(1) : _url;
	}

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

	if (isObject(_url)) {
		ajaxOpt.processData = false;
		ajaxOpt.contentType = false;
		ajaxOpt.mimeType = "multipart/form-data";
		ajaxOpt.xhr = function() {
			var xhr = $.ajaxSettings.xhr();
			if (xhr.upload) {
				xhr.upload.onprogress = function(progress) {
					if (progress.lengthComputable) {
						onProgress(progress.loaded / progress.total * 100);
					}
				};
		　　　 }
			return xhr;
		};
	}
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
		console.log(response);
		if (!isObject(response)) {
			response = JSON.parse(response);
			console.log(response);
		}
		if (response.code === 1000) {
			return callback(response);
		}
		if (isFunction(callbackCancel)) {
			return callbackCancel(response);
		}
		modal.alert(response.message, function(_modal) {
			modal.closeModal(_modal);
		});
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

	return _auth.auth === 2 ? true : false;
}

// 验证登录状态
export function checkLogin() {
	return getLocalStorage(UER_NAME) === null ? true : false;
}

//------------------------------------------------------------------------------------------------------
//-----注册、登入模块
//------------------------------------------------------------------------------------------------------

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



//------------------------------------------------------------------------------------------------------
//-----个人中心模块
//------------------------------------------------------------------------------------------------------

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



//------------------------------------------------------------------------------------------------------
//-----直播模块
//------------------------------------------------------------------------------------------------------

/**
 * 主播创建直播间并加入
 * @param  {[type]} callbackOk     通过事件
 * @param  {[type]} callbackCancel 取消事件
 * @return {[type]} [description]
 */
export function createChannel(callbackOk, callbackCancel) {
	let _info = getLocalStorage(UER_NAME);
	let _params = {
		userId: _info.userId,
		token: getLocalStorage(TOKEN_NAME),
		loginMode: LofinMode,
		mac: getMac()
	}
	getPost('/createChannel', _params, function(response) {
		callbackOk(response.data);
	},function(response) {
		callbackCancel();
	});
};

/**
 * 直播状态--开播或下播
 * @param  {[int]}  _status 	   状态 1.上播（直播等待中） 2.下播 3.直播中 4.禁播
 * @param  {[type]} callbackOk     通过事件
 * @param  {[type]} callbackCancel 取消事件
 * @return {[type]} [description]
 */
export function liveStatus(_status, callbackOk, callbackCancel) {
	let _info = getLocalStorage(UER_NAME);
	let _params = {
		userId: _info.userId,
		status: _status
	}
	getPost('/liveStatus', _params, function(response) {
		callbackOk(true);
	},function(response) {
		callbackCancel(false);
	});
};

/**
 * 每日一录--开播前查询是否需要重新录制小视频
 * @param  {[type]} callbackOk     通过事件
 * @param  {[type]} callbackCancel 取消事件
 * @return {[type]} [description]
 */
export function newDayRecord(callbackOk, callbackCancel) {
	let _info = getLocalStorage(UER_NAME);
	let _params = {
		userId: _info.userId,
		token: getLocalStorage(TOKEN_NAME),
		loginMode: LofinMode,
		mac: getMac()
	}
	getPost('/selEverdayVideo', _params, function(response) {
		callbackOk(true);
	},function(response) {
		callbackCancel(false);
	});
};

/**
 * 获取广告
 * @return {[type]} [description]
 */
export function getAdvertisement() {

	return new Promise((resolve) => {
		getPost('/getAdvertisement', {}, function(response) {
			resolve(response.data);
		}, function(response) {
			resolve(ADVERTISEMENT_DATA);
		});
	});
};


/**
 * 新人列表
 * @param  {[String]} _page 	   当前页
 * @param  {[String]} _number 	   条数
 * @return {[type]} [description]
 */
export function newVideo(_page = 1, _number = 10) {

	return new Promise((resolve) => {
		getPost('/newVideo', {
			page: _page,
			number: _number
		}, function(response) {
			resolve(response.data);
		}, function(response) {
			resolve(NEW_List_DATA);
		});
	});
};

/**
 * 热门列表
 * @param  {[String]} _page 	   当前页
 * @param  {[String]} _number 	   条数
 * @return {[type]} [description]
 */
export function hotVideo(_page = 1, _number = 10) {

	return new Promise((resolve) => {
		getPost('/hotVideo', {
			page: _page,
			number: _number
		}, function(response) {
			resolve(response.data);
		}, function(response) {
			resolve(HOT_List_DATA);
		});
	});
};

/**
 * 显示视频
 * @param  {[String]} _page 	   当前页
 * @param  {[String]} _number 	   条数
 * @param  {[String]} _type 	   类别 1.免费 2.收费
 * @return {[type]} [description]
 */
export function videoClips(_page, _number, _type) {

	return new Promise((resolve) => {
		getPost('/videoClips', {
			page: _page,
			number: _number,
			type: _type
		}, function(response) {
			resolve(response.data);
		}, function(response) {
			resolve(VIDEO_List_DATA);
		});
	});
};

/**
 * 获取视频标签
 * @return {[type]} [description]
 */
export function videoType() {

	return new Promise((resolve) => {
		getPost('/getVideoType', {}, function(response) {
			resolve(response.data);
		}, function(response) {
			resolve(VIDEO_TYPE_DATA);
		});
	});
};


//------------------------------------------------------------------------------------------------------
//-----视频模块
//------------------------------------------------------------------------------------------------------

/**
 * 用户上传视频
 * @param  {[object]} params 	   [description]
 * @param  {[type]} callback     	回调事件
 * @param  {[type]} onProgress     	进度事件
 * @return {[type]} [description]
 */
export function uploadVideo(_file, _type, callback, onProgress) {
	let _info = getLocalStorage(UER_NAME);
	let formData = new FormData();

	formData.append("userId", _info.userId);
	formData.append("type", _type);
	formData.append("token", getLocalStorage(TOKEN_NAME));
	formData.append("loginMode", LofinMode);
	formData.append("mac", getMac());
	formData.append("keyword", 'upload');
	formData.append("file", _file);

	getPost(formData, function(response) {
		callback(response);
	}, function(progress) {
		onProgress(progress);
	});
};