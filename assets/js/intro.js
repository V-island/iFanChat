// gages
import Login from './pages/login';
import Register from './pages/register';
import FindPassword from './pages/find_password';
import SetPassword from './pages/set_password';

import Home from './pages/home';
import Live from './pages/live';
import Favorite from './pages/favorite';
import Message from './pages/message';
import User from './pages/user';
import UserDetail from './pages/user_detail';

// 全局变量
const fcConfig = {
    autoInit: false, //自动初始化页面
    showPageLoadingIndicator: true, //push.js加载页面的时候显示一个加载提示
    router: true, //默认使用router
    agora: true, //默认使用Agora DSK
    swipePanel: "left", //滑动打开侧栏
    swipePanelOnlyClose: true, //只允许滑动关闭，不允许滑动打开侧栏
    importJs: '@webcomponents/webcomponentsjs/webcomponents-lite',
    publicFile: {
        tabs_lives: {
            name: 'tabs_lives',
            path: '../public/tabs_lives.html'
        },
        actions_lives: {
            name: 'actions_lives',
            path: '../public/actions_lives.html'
        }
    },
    pagesFile: [{
        name: 'login',
        path: '../pages/login.html',
        component: Login,
        init: 0,
        children: [{
            name: 'find',
            path: '../pages/find_password.html',
            component: FindPassword,
            init: 0
        }, {
            name: 'set',
            path: '../pages/set_password.html',
            component: SetPassword,
            init: 0
        }]
    }, {
        name: 'register',
        path: '../pages/register.html',
        component: Register,
        init: 0,
        children: [{
            name: 'terms',
            path: '../pages/terms_service.html',
            component: Register,
            init: 0
        }]
    }, {
        name: 'home',
        path: '../pages/home.html',
        component: Home,
        init: 1
    }, {
        name: 'live',
        path: '../pages/live.html',
        component: Live,
        init: 1
    }, {
        name: 'favorite',
        path: '../pages/favorite.html',
        component: Favorite,
        init: 1
    }, {
        name: 'message',
        path: '../pages/message.html',
        component: Message,
        init: 1
    }, {
        name: 'user',
        path: '../pages/user.html',
        component: User,
        init: 1,
        children: [{
            name: 'detail',
            path: '../pages/user_detail.html',
            component: UserDetail,
            init: 1
        }]
    }]
};

export default fcConfig;