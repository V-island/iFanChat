// import BScroll from 'better-scroll';
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

class UsersInfo {
    constructor({channel, handler, Delete}) {
        this.channel = channel;
        this.element = this._createElement(handler, Delete);
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

        return itemBox;
    }
}

export { UsersInfo };