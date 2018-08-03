import Template from 'art-template/lib/template-web';
import { Spinner } from '../components/Spinner';
import { MessageItem } from '../components/MessageItem';
import EventEmitter from '../eventEmitter';
import SendBirdAction from '../SendBirdAction';
import {
	getLangConfig
} from '../lang';
import {
    getUserInfo
} from '../api';
import {
    body
} from '../intro';
import {
	extend,
	addEvent,
	createDom,
	appendToFirst,
	isScrollBottom,
	createDivEl,
	errorAlert
} from '../util';

const LANG = getLangConfig();

export default class Message extends EventEmitter {
	constructor(element) {
		super();

		this.options = {
			listMessageClass: 'list-message',
			listItemClass: 'list-item'
		};

		this.init(element);
	}

	init(element) {
		const SendBird = new SendBirdAction();
		const {userId, userName} = getUserInfo();

		this.MessageEl = createDom(Template.render(element, LANG));

		setTimeout(() => {
			this.trigger('pageLoadStart', this.MessageEl);
		}, 0);

		// SendBird SDK 初始化
		Spinner.start(body);
		SendBird.connect(userId, userName).then(user => {
			// this.getOpenChannelList(true);
			this.getGroupChannelList(true);
			this.createChannelWithUserIds(14);
			Spinner.remove();
			this._init();
		}).catch(() => {
			redirectToIndex('SendBird connection failed.');
		});
	}

	_init() {
		this.listMessageEl = this.MessageEl.getElementsByClassName(this.options.listMessageClass)[0];

		this._bindEvent();
	}

	_bindEvent() {
		addEvent(this.listMessageEl, 'scroll', () => {
			if (isScrollBottom(this.listMessageEl)) {
				this.getGroupChannelList();
			}
		});
	}

	createChannelWithUserIds(userId) {
		SendBirdAction.getInstance()
			.createChannelWithUserIds(userId)
			.then(channel => {
				console.log(channel);
				const handler = () => {
					console.log(channel.url);
				};
				const Delete = () => {
					console.log('删除');
				};
				const item = new MessageItem({
					channel,
					handler,
					Delete
				});
				appendToFirst(this.listMessageEl, item.element);
			})
			.catch(error => {
				errorAlert(error.message);
			});
	}

	// 获取开放频道列表
	getOpenChannelList(isInit = false) {
		SendBirdAction.getInstance()
			.getOpenChannelList(isInit)
			.then(openChannelList => {
				console.log(openChannelList);
				openChannelList.forEach(channel => {
					console.log(channel);
					const handler = () => {
						console.log(channel.url);
					};
					const item = new MessageItem({
						channel,
						handler
					});
					this.listMessageEl.appendChild(item.element);
				});
			})
			.catch(error => {
				errorAlert(error.message);
			});
	}

	// 获取我的频道列表
	getGroupChannelList(isInit = false) {
		SendBirdAction.getInstance()
			.getGroupChannelList(isInit)
			.then(groupChannelList => {
				groupChannelList.forEach(channel => {
					const handler = () => {
						console.log(channel.url);
					};
					const item = new MessageItem({
						channel,
						handler
					});
					this.listMessageEl.appendChild(item.element);
				});
			})
			.catch(error => {
				errorAlert(error.message);
			});
	}

	static attachTo(element) {
		return new Message(element);
	}
}