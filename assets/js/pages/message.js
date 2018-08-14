import Template from 'art-template/lib/template-web';
import { Spinner } from '../components/Spinner';
import { MessageItem } from '../components/MessageItem';
import { MessageChat } from '../components/MessageChat';
import EventEmitter from '../eventEmitter';

import SendBirdAction from '../SendBirdAction';
import SendBirdConnection from '../SendBirdConnection';
import SendBirdEvent from '../SendBirdEvent';
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
const UPDATE_INTERVAL_TIME = 5 * 1000;

export default class Message extends EventEmitter {
	constructor(element) {
		super();

		this.options = {
			contentClass: '.content',
			listMessageClass: 'list-message',
			listItemClass: 'list-item'
		};

		this.init(element);
	}

	init(element) {
		const SendBird = new SendBirdAction();
		const {userId} = getUserInfo();

		this.MessageEl = createDom(Template.render(element, LANG));
		this.contentEl = this.MessageEl.querySelector(this.options.contentClass);

		setTimeout(() => {
			this.trigger('pageLoadStart', this.MessageEl);
		}, 0);

		// SendBird SDK 初始化
		Spinner.start(this.contentEl);
		SendBird.connect(userId).then(user => {
			this.getOpenChannelList(true);
			this.getGroupChannelList(true);

			this._init();
			Spinner.remove();
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

	// 获取开放频道列表
	getOpenChannelList(isInit = false) {
		SendBirdAction.getInstance()
			.getOpenChannelList(isInit)
			.then(openChannelList => {
				console.log(openChannelList);
				openChannelList.forEach(channel => {
					console.log(channel);
					const handler = () => {
						MessageChat.getInstance().render(channel.url);
					};
					const item = new MessageItem({
						channel,
						handler
					});
					// this.listMessageEl.appendChild(item.element);
					appendToFirst(this.listMessageEl, item.element);
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
				console.log(groupChannelList);
				groupChannelList.forEach(channel => {
					const handler = () => {
						MessageChat.getInstance().render(channel.url, false);
					};
					const Delete = () => {
						this.listMessageEl.removeChild(item.element);
					};
					const item = new MessageItem({
						channel,
						handler,
						Delete
					});

					if (channel.unreadMessageCount > 0) {
						appendToFirst(this.listMessageEl, item.element);
					}else {
						this.listMessageEl.appendChild(item.element);
					}
				});
			})
			.catch(error => {
				errorAlert(error.message);
			});
	}

	// // 注册ConnectionHandler以检测用户自身连接状态的变化
	// createConnectionHandler() {
	// 	const connectionManager = new SendBirdConnection();

	// 	connectionManager.onReconnectStarted = () => {
	// 		Spinner.start(body);
	// 		console.log('[SendBird JS SDK] Reconnect : Started');
	// 		connectionManager.channel = chat.channel;
	// 	};

	// 	connectionManager.onReconnectSucceeded = () => {
	// 		console.log('[SendBird JS SDK] Reconnect : Succeeded');
	// 		chatLeft.clear();
	// 		chatLeft.updateUserInfo(SendBirdAction.getInstance().getCurrentUser());
	// 		chatLeft.getGroupChannelList(true);
	// 		Spinner.start(body);
	// 		chat.refresh(connectionManager.channel);
	// 	};

	// 	connectionManager.onReconnectFailed = () => {
	// 		console.log('[SendBird JS SDK] Reconnect : Failed');
	// 		connectionManager.remove();
	// 		redirectToIndex('SendBird Reconnect Failed...');
	// 	};
	// }

	// // 注册ChannelHandler以在通道内发生事件时接收信息。
	// createChannelEvent() {
	// 	const channelEvent = new SendBirdEvent();

	// 	channelEvent.onChannelChanged = channel => {
	// 		chatLeft.updateItem(channel, true);
	// 	};

	// 	channelEvent.onUserEntered = (openChannel, user) => {
	// 		if (SendBirdAction.getInstance().isCurrentUser(user)) {
	// 			const handler = () => {
	// 				chat.render(openChannel.url);
	// 				ChatLeftMenu.getInstance().activeChannelItem(openChannel.url);
	// 			};
	// 			const item = new LeftListItem({
	// 				channel: openChannel,
	// 				handler
	// 			});
	// 			chatLeft.addOpenChannelItem(item.element);
	// 			chat.render(openChannel.url);
	// 		}
	// 	};

	// 	channelEvent.onUserJoined = (groupChannel, user) => {
	// 		const handler = () => {
	// 			chat.render(groupChannel.url, false);
	// 			ChatLeftMenu.getInstance().activeChannelItem(groupChannel.url);
	// 		};
	// 		const item = new LeftListItem({
	// 			channel: groupChannel,
	// 			handler
	// 		});
	// 		chatLeft.addGroupChannelItem(item.element);
	// 		chat.updateChatInfo(groupChannel);
	// 	};

	// 	channelEvent.onUserLeft = (groupChannel, user) => {
	// 		if (SendBirdAction.getInstance().isCurrentUser(user)) {
	// 			chatLeft.removeGroupChannelItem(groupChannel.url);
	// 		} else {
	// 			chatLeft.updateItem(groupChannel);
	// 		}
	// 		chat.updateChatInfo(groupChannel);
	// 	};

	// 	channelEvent.onChannelHidden = groupChannel => {
	// 		chatLeft.removeGroupChannelItem(groupChannel.url);
	// 	};
	// };

	// // 更新组频道时间
	// updateGroupChannelTime() {
	// 	setInterval(() => {
	// 		LeftListItem.updateLastMessageTime();
	// 	}, UPDATE_INTERVAL_TIME);
	// }

	static attachTo(element) {
		return new Message(element);
	}
}