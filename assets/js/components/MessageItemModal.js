import {
    getLangConfig
} from '../lang';
import {
    addEvent,
    createDivEl,
    protectFromXSS,
    timestampFromNow,
    toggleClass,
    addClass,
    removeClass
} from '../util';

const LANG = getLangConfig();
const MESSAGE_REQ_ID = 'reqId';

class MessageItemSystem {
    constructor({channel, handler, Delete}) {
        this.channel = channel;
        this.element = this._createElement(handler, Delete);
    }

    get channelUrl() {
        return this.channel.url;
    }

    get profileUrl() {
        return this.channel.isOpenChannel() ? `# ${this.channel.coverUrl}` : protectFromXSS(this.channel.members[0].profileUrl);
    }

    get title() {
        return this.channel.isOpenChannel() ? `# ${this.channel.name}` : protectFromXSS(this.channel.members[0].nickname);
    }

    get lastMessagetime() {
        if (this.channel.isOpenChannel() || !this.channel.lastMessage) {
            return 0;
        } else {
            return this.channel.lastMessage.createdAt;
        }
    }

    get lastMessageTimeText() {
        if (this.channel.isOpenChannel() || !this.channel.lastMessage) {
            return 0;
        } else {
            return LeftListItem.getTimeFromNow(this.channel.lastMessage.createdAt);
        }
    }

    get lastMessageText() {
        if (this.channel.isOpenChannel() || !this.channel.lastMessage) {
            return '';
        } else {
            return this.channel.lastMessage.isFileMessage() ?
                protectFromXSS(this.channel.lastMessage.name) :
                protectFromXSS(this.channel.lastMessage.message);
        }
    }

    get unreadMessageCount() {
      const count = this.channel.unreadMessageCount > 99 ? '+99' : this.channel.unreadMessageCount.toString();
      return this.channel.isOpenChannel() ? 0 : count;
    }

    _createElement(handler, Delete) {
        const itemBox = createDivEl({className: 'list-item-box', id: this.channelUrl});
        const item = createDivEl({className: 'list-item'});
        let startX;

        const itemGraphic = createDivEl({element: 'span', className: ['icon', 'list-item-graphic', 'image'], background: this.profileUrl});
        item.appendChild(itemGraphic);

        const itemText = createDivEl({element: 'span', className: 'list-item-text', content: this.title});
        const itemSecondary = createDivEl({element: 'span', className: 'list-item-secondary', content: this.lastMessageText});
        itemText.appendChild(itemSecondary);
        item.appendChild(itemText);

        const lastMessageText = createDivEl({element: 'span', className: 'list-item-meta-txt', content: this.lastMessageTimeText});
        item.appendChild(lastMessageText);

        const unreadMessage = createDivEl({element: 'span', className: 'list-item-meta', content: this.unreadMessageCount > 0 ? this.unreadMessageCount : ''});
        item.appendChild(unreadMessage);
        itemBox.appendChild(item);

        const btnDelete = createDivEl({className: 'btn-delete', content: LANG.MESSAGE.Delete});
        itemBox.appendChild(btnDelete);

        addEvent(item, 'click', () => {
            if (handler) handler();
        });

        addEvent(btnDelete, 'click', () => {
            if (Delete) Delete();
        });

        addEvent(itemBox, 'touchstart', (e) => {
            startX = e.changedTouches[0].pageX;
        });

        addEvent(itemBox, 'touchend', (e) => {
            let moveX = e.changedTouches[0].pageX;

            if (startX === moveX) return false;

            if (startX > moveX) {
                addClass(itemBox, 'active');
            }else {
                removeClass(itemBox, 'active');
            }
        });

        return itemBox;
    }
}

class MessageItemModal {
    constructor(element, channel) {
        this.channel = channel;
        this.element = element;
    }

    scrollToBottom() {
      this.element.scrollTop = this.element.scrollHeight - this.element.offsetHeight;
    }

    _getItem(messageId, isRequestId = false) {
        const items = this.element.childNodes;
        for (let i = 0; i < items.length; i++) {
            const elementId = isRequestId ? getDataInElement(items[i], MESSAGE_REQ_ID) : items[i].id;
            if (elementId === messageId.toString()) {
                return items[i];
            }
        }
        return null;
    }

    renderMessages(messageList, goToBottom = true, isPastMessage = false) {
        messageList.forEach(message => {
            console.log(message);
        });
        if (goToBottom) this.scrollToBottom();
    }

    removeMessage(messageId, isRequestId = false) {
        const removeElement = this._getItem(messageId, isRequestId);
        if (removeElement) {
            this.element.removeChild(removeElement);
        }
    }

    updateReadReceipt() {
        this.readReceiptManageList.forEach(message => {
            if (message.messageId.toString() !== '0') {
                const className = Message.getReadReceiptElementClassName();
                const messageItem = this._getItem(message.messageId, false);
                if (messageItem) {
                    let readItem = null;
                    try {
                        readItem = messageItem.getElementsByClassName(className)[0];
                    } catch (e) {
                        readItem = null;
                    }
                    const latestCount = SendBirdAction.getInstance().getReadReceipt(this.channel, message);
                    if (readItem && latestCount.toString() !== readItem.textContent.toString()) {
                        readItem.innerHTML = latestCount;
                        if (latestCount.toString() === '0') {
                            removeClass(readItem, className);
                        }
                    }
                }
            }
        });
    }

    updateTyping(memberList) {
        // this.input.updateTyping(memberList);
    }

    repositionScroll(imageOffsetHeight) {
      this.element.scrollTop += imageOffsetHeight;
    }

    updateBlockedList(user, isBlock) {
        if (this.list) {
            if (isBlock) {
                const blockedItem = new ChatUserItem({
                    user,
                    hasEvent: true
                });
                appendToFirst(this.list, blockedItem.element);
            } else {
                const items = this.list.childNodes;
                for (let i = 0; i < items.length; i++) {
                    if (items[0].id === user.userId) {
                        this.list.removeChild(items[0]);
                        break;
                    }
                }
            }
        }
    }
}

export { MessageItemSystem, MessageItemModal };