import Modal from './modal';
import {
	getLangConfig
} from './lang';

const LANG = getLangConfig();
const modal = new Modal();

const baseURL = 'http://10.30.11.112:8080/live-app/';
const Type = 'GET';

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
	        401: function() {toastr.error('401');localStorage.removeItem('token');session.jumpPage('session/#/login');},
	        403: function() {toastr.error('403 用户没有对应操作权限')},
	        404: function() {toastr.error('404')},
	        405: function() {toastr.error('405');localStorage.removeItem('token');session.jumpPage('session/#/login');}
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
	var post = Promise.resolve($.ajax(ajaxOpt));
	return post;
}

/**
 * 发送验证码
 * @param  {[string]} _phone 	   手机号
 * @param  {[type]} callbackOk     通过事件
 * @return {[type]} [description]
 */
export function sendVerificationCode(_phone, callbackOk) {
	getPost('/sendAuthCode', {
		phone: _phone
	}).then(function(response) {
		callbackOk();
	}).catch(function(error) {
		console.log(error);
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
	getPost('/insRegister', {
		phone: _phone
	}).then(function(response) {
		callbackOk();
	}).catch(function(error) {
		console.log(error);
	});
};