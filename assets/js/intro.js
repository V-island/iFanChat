// gages
import Login from './pages/login';
import Register from './pages/register';
import FindPassword from './pages/find_password';
import SetPassword from './pages/set_password';

import Home from './pages/home';
import Favorite from './pages/favorite';
import Message from './pages/message';
import User from './pages/user';

// 用户中心
import UserDetail from './pages/user_detail';
import UserVideo from './pages/user_video';
import UserWatch from './pages/user_watch';

import UserPrice from './pages/user_price';
import UserAccount from './pages/user_account';
import UserScore from './pages/user_score';

import UserProof from './pages/user_proof';
import UserInvite from './pages/user_invite';

import UserBlacklist from './pages/user_blacklist';
import UserSetting from './pages/user_setting';

// 全局变量
const fcConfig = {
    autoInit: false, //自动初始化页面
    showPageLoadingIndicator: true, //push.js加载页面的时候显示一个加载提示
    router: true, //默认使用router
    agora: true, //默认使用Agora DSK
    agoraAppId: '130106827c954803a398814859761e19',
    swipePanel: "left", //滑动打开侧栏
    swipePanelOnlyClose: true, //只允许滑动关闭，不允许滑动打开侧栏
    importJs: '@webcomponents/webcomponentsjs/webcomponents-lite',
    publicFile: {
        home_items: {
            name: 'home_items',
            path: '../public/home_items.html'
        },
        bar_tabs: {
            name: 'bar_tabs',
            path: '../public/bar_tabs.html'
        },
        live_preview: {
            name: 'live_preview',
            path: '../public/live_preview.html'
        },
        client_rtc: {
            name: 'client_rtc',
            path: '../public/client_rtc.html'
        },
        client_call: {
            name: 'client_call',
            path: '../public/client_call.html'
        }
    },
    pagesFile: [{
        name: 'login',
        path: '../pages/login.html',
        component: Login,
        init: 1,
        children: [{
            name: 'find',
            path: '../pages/find_password.html',
            component: FindPassword,
            init: 1
        }, {
            name: 'set',
            path: '../pages/set_password.html',
            component: SetPassword,
            init: 1
        }]
    }, {
        name: 'register',
        path: '../pages/register.html',
        component: Register,
        init: 1,
        children: [{
            name: 'terms',
            path: '../pages/terms_service.html',
            component: Register,
            init: 1
        }]
    }, {
        name: 'home',
        path: '../pages/home.html',
        component: Home,
        navTabs: 1
    }, {
        name: 'favorite',
        path: '../pages/favorite.html',
        component: Favorite,
        navTabs: 1
    }, {
        name: 'message',
        path: '../pages/message.html',
        component: Message,
        navTabs: 1
    }, {
        name: 'user',
        path: '../pages/user.html',
        component: User,
        navTabs: 1,
        children: [{
            name: 'detail',
            path: '../pages/user_detail.html',
            component: UserDetail
        }, {
            name: 'video',
            path: '../pages/user_video.html',
            component: UserVideo
        }, {
            name: 'watch',
            path: '../pages/user_watch.html',
            component: UserWatch
        }, {
            name: 'price',
            path: '../pages/user_price.html',
            component: UserPrice
        }, {
            name: 'account',
            path: '../pages/user_account.html',
            component: UserAccount
        }, {
            name: 'score',
            path: '../pages/user_score.html',
            component: UserScore
        }, {
            name: 'proof',
            path: '../pages/user_proof.html',
            component: UserProof
        }, {
            name: 'invite',
            path: '../pages/user_invite.html',
            component: UserInvite
        }, {
            name: 'blacklist',
            path: '../pages/user_blacklist.html',
            component: UserBlacklist
        }, {
            name: 'setting',
            path: '../pages/user_setting.html',
            component: UserSetting
        }]
    }]
};

export default fcConfig;