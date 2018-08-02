import Template from 'art-template/lib/template-web';
import EventEmitter from '../eventEmitter';
import SendBirdAction from '../SendBirdAction';
import { Spinner } from '../components/Spinner';
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
		const userInfo = getUserInfo();

		SendBird.connect(userInfo.userId, userInfo.userName).then(user => {
			this.MessageEl = createDom(Template.render(element, LANG));
			this.trigger('pageLoadStart', this.MessageEl);

			this._getUserList();
			// this._createChannel();
			this.getGroupChannelList(true);

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

	_getUserList(isInit = false) {
		SendBirdAction.getInstance()
			.getUserList(isInit)
			.then(userList => {
				console.log(userList);
			})
			.catch(error => {
				errorAlert(error.message);
			});
	}

	_createChannel() {
		SendBirdAction.getInstance()
			.createGroupChannel('15')
			.then(channel => {
				console.log(channel);
			})
			.catch(error => {
				errorAlert(error.message);
			});
	}

	/**
	 * Group Channel
	 */
	getGroupChannelList(isInit = false) {
		Spinner.start(body);
		SendBirdAction.getInstance()
			.getGroupChannelList(isInit)
			.then(groupChannelList => {
				console.log(groupChannelList);
				// this.toggleGroupChannelDefaultItem(groupChannelList);
				// groupChannelList.forEach(channel => {
				// 	const handler = () => {
				// 		Chat.getInstance().render(channel.url, false);
				// 		ChatLeftMenu.getInstance().activeChannelItem(channel.url);
				// 	};
				// 	const item = new LeftListItem({
				// 		channel,
				// 		handler
				// 	});
				// 	this.groupChannelList.appendChild(item.element);
				// 	LeftListItem.updateUnreadCount();
				// });
				Spinner.remove();
			})
			.catch(error => {
				errorAlert(error.message);
			});
	}

	static attachTo(element) {
		return new Message(element);
	}
}