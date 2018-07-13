import Template from 'art-template/lib/template-web';
import EventEmitter from './eventEmitter';
import AgoraRTC from './components/AgoraRTCSDK-2.3.0';
import Modal from './modal';
import fcConfig from './intro';

import {
    createChannel,
    loginChannel,
    closeChannel,
    userEvaluate
} from './api';

import {
    getLangConfig
} from './lang';

import {
    extend,
    addEvent,
    isNumber,
    importTemplate
} from './util';

const LANG = getLangConfig();
const modal = new Modal();

const LoginMode = 'web';
const MSG = {
    // browser is no support webRTC
    errorWebRTC: '浏览器不支持webRTC',
    // AgoraRTC client initialized
    successInit: '初始化 AgoraRTC 成功',
    // AgoraRTC client init failed
    errorInit: '初始化 AgoraRTC 失败',
    // User %s join channel successfully
    successJoin: '用户%s成功加入频道',
    // Join channel failed
    errorJoin: '加入频道失败',
    // The user has granted access to the camera and mic.
    accessAllowed: '用户已授权访问摄像头和麦克风',
    // The user has denied access to the camera and mic.
    accessDenied: '用户拒绝访问相机和麦克风',
    // getUserMedia successfully
    successGetUserMedia: '成功获取用户媒体',
    // getUserMedia failed
    errorGetUserMedia: '获取用户媒体失败',
    // Publish local stream error
    errorPublishStream: '发布本地流错误:',
    // Publish local stream successfully
    successPublishStream: '发布本地流成功',
    // Renew channel key successfully
    successRenewChannelKey: '成功更新频道密钥',
    // Renew channel key failed:
    errorRenewChannelKey: '更新频道密钥失败:',
    // Subscribe stream failed:
    errorSubscribe: '订阅流失败'
}

export default class RtcClient extends EventEmitter {
    constructor(options) {
        super();

        this.data = {};
        this.options = {
            type: true,
            liveWindowId: 'video',
            userLiveWindowId: 'video-us',
            livesCommentsClass: 'lives-comments',
            iconAttentionClass: 'live-attention',
            iconAddAttentionClass: 'live-add-attention',
            btnLiveCloseClass: 'btn-close',
            btnAddAttentionClass: 'btn-add-attention',
            btnNewsClass: 'btn-news',
            btnShareClass: 'btn-share',
            btnGiftClass: 'btn-gift'
        };

        // this.channelKey = options.channelKey;
        this.channelKey = null;
        this.channel = options.channel + '';
        this.uId = options.userId;
        this.type = options.type;
        this.info = options.info;

        extend(this.data, LANG);
        extend(this.options, options);

        console.log(this.options);
        console.log(this.channelKey);
        console.log(this.channel);
        console.log(this.uId);
        this.rtcClientFile = fcConfig.publicFile.client_rtc;

        this.clientModalEl = modal.popup(this._clientRtcTemplate(this.info));

        this.livesCommentsEl = this.clientModalEl.getElementsByClassName(this.options.livesCommentsClass)[0];
        this.btnLiveCloseEl = this.clientModalEl.getElementsByClassName(this.options.btnLiveCloseClass)[0];
        this.btnAddAttentionEl = this.clientModalEl.getElementsByClassName(this.options.btnAddAttentionClass)[0];
        this.btnNewsEl = this.clientModalEl.getElementsByClassName(this.options.btnNewsClass)[0];
        this.btnShareEl = this.clientModalEl.getElementsByClassName(this.options.btnShareClass)[0];
        this.btnGiftEl = this.clientModalEl.getElementsByClassName(this.options.btnGiftClass)[0];

        this._init();
    }

    _init() {
        this.tpl = {};

        importTemplate(this.rtcClientFile, (id, _template) => {
            this.tpl[id] = _template;
        });

        this._createClient();
        this._bindEvent();
        this._subscribeEvents();
    }

    _bindEvent() {

        // 关闭
        addEvent(this.btnLiveCloseEl, 'click', () => {

            this.client.leave(() => {
                console.log("Leavel channel successfully");
                modal.closeModal(this.clientModalEl);

            }, (err) => {
                console.log("Leave channel failed");
            });
        });

        // 加关注
        addEvent(this.btnAddAttentionEl, 'click', () => {
            removeClass(this.btnAddAttentionEl, this.options.iconAttentionClass);
            addClass(this.btnAddAttentionEl, this.options.iconAddAttentionClass);
        });

        // 评论
        addEvent(this.btnNewsEl, 'click', () => {
            modal.actions(this.tpl.live_news, {
                title: false,
                closeBtn: false
            });
        });

        // 分享
        addEvent(this.btnShareEl, 'click', () => {
            modal.actions(this.tpl.live_share, {
                title: 'Share to',
                closeBtn: true
            });
        });

        // 礼物
        if (typeof this.btnGiftEl !== 'undefined') {
            addEvent(this.btnGiftEl, 'click', () => {
                modal.actions(this.tpl.live_gift, {
                    title: 'Gift',
                    closeBtn: true
                });
            });
        }
    }

    // 订阅事件
    _subscribeEvents() {
        // 该回调通知应用程序远程音视频流已添加
        /**
         * client.on
         * @param: listen to stream event
         * @param: callback listener callback
         * @return: null
         * @event: stream-added when new stream added to channel
         */
        this.client.on('stream-added', (evt) => {
            let stream = evt.stream;
            console.log("New stream added: " + stream.getId());
            console.log("Timestamp: " + Date.now());
            console.log("Subscribe ", stream);

            // 在有新的流加入后订阅远端流
            /**
             * client.subscribe
             * @param: stream stream to subscribe
             * @param: callback failing callback
             * @return: null
             */
            this.client.subscribe(stream, (err) => {
                console.log(MSG.errorSubscribe, err);
            });
        });

        // 该回调通知应用程序已接收远程音视频流。
        /**
         * @event: stream-subscribed when a stream is successfully subscribed
         */
        this.client.on('stream-subscribed', (evt) => {
            let stream = evt.stream;
            console.log("Got stream-subscribed event");
            console.log("Timestamp: " + Date.now());
            console.log("Subscribe remote stream successfully: " + stream.getId());
            console.log(evt);
            console.log('获取的远程流');
            stream.play(this.options.liveWindowId);

            // 获取连接状态
            stream.getStats((stats) => {
                console.log('获取subscribe 流连接状态');
                console.log(stats);
            });
        });

        // 该回调通知应用程序已删除远程音视频流，即对方调用了 unpublish stream。
        /**
         * @event: stream-removed when a stream is removed
         */
        this.client.on("stream-removed", (evt) => {
            let stream = evt.stream;
            console.log("Stream removed: " + evt.stream.getId());
            console.log("Timestamp: " + Date.now());
            console.log(evt);
            // stream.stop();
        });

        // 该回调通知应用程序对方用户已离开频道，即对方调用了 client.leave()。
        /**
         * @event: peer-leave when existing stream left the channel
         */
        this.client.on('peer-leave', (evt) => {
            console.log("Peer has left: " + evt.uid);
            console.log("Timestamp: " + Date.now());
            console.log(evt);

            this.client.leave(() => {
                console.log("Leavel channel successfully");
                modal.closeModal(this.clientModalEl);
                this.trigger('rtcClient.leave');
            }, (err) => {
                console.log("Leave channel failed");
            });
        });

        // 该回调通知应用程序有出错信息，需要进行处理。
        /**
         * @event: error Application has error information
         */
        this.client.on('error', (err) => {
            console.log("Got error msg:", err.reason);
            if (err.reason === 'DYNAMIC_KEY_TIMEOUT') {

                /**
                 * client.renewChannelKey
                 * @param: key - channel key
                 * @param: callback - success callback
                 * @param: callback - error callback
                 * return: null
                 */
                this.client.renewChannelKey(this.channelKey, () => {
                    console.log(MSG.successRenewChannelKey);
                }, (err) => {
                    console.log(MSG.errorRenewChannelKey, err);
                });
            }
        });
    }

    // 创建 Client 对象
    _createClient() {
        const Appid = fcConfig.agoraAppId || '';

        // 用户可选关闭Agora DSK功能
        if (!fcConfig.agora) {
            return;
        }

        // check support webRTC
        if (!AgoraRTC.checkSystemRequirements()) {
            console.log(MSG.errorWebRTC);
        }

        AgoraRTC.getDevices((devices) => {
            console.log(devices);
        });

        // 创建 Client 对象
        /**
         * RTC.createClient
         * @param: callback - success callback
         * @return: rtc client
         */
        this.client = AgoraRTC.createClient({
            mode: 'live',
            codec: 'vp8'
        });

        // 初始化 Client 对象
        /**
         * client.init
         * @param: appid - appid
         * @param: callback - success callback
         * return: null
         */
        this.client.init(Appid, () => {
            console.log(MSG.successInit);
            this._initClient();
        }, (err) => {
            console.log(MSG.errorInit, err);
        });
    }

    // 初始化 Client 对象
    _initClient() {
        // 加入频道，如果启用了channel key, 请将channel key作为第一个参数
        // 若有自己的用户ID系统, 可在第三个参数传参, 不然可传undefined, 则Agora会自动分配一个uid
        /**
         * client.join
         * @param: key - channel key
         * @param: channel - channel name
         * @param: uid - uid, undefined if random one
         * @param: callback - success callback
         * return: null
         */
        this.client.join(this.channelKey, this.channel, this.uId, (uid) => {
            console.log(MSG.successJoin.replace('%s', uid));
            this.trigger('rtcClient.join', this.options.userId, this.options.channel, );

            // 创建本地流, 修改对应的参数可以指定启用/禁用特定功能
            /**
             * RTC.createStream
             * @param: options
             * @param: options.streamId id of stream
             * @param: options.audio if audio is captured locally
             * @param: options.video if video is captured locally
             * @param: options.screen if this stream is for screen share
             * @param: options. extensionId the extension id of your chrome extension if share screen is enabled
             * return: created local stream
             */
            let localStream = AgoraRTC.createStream({
                streamID: uid,
                audio: true,
                video: true,
                screen: false
            });

            // 设置本地流视频属性
            /**
             * stream.setVideoProfile
             * @param: profile profile string
             */
            localStream.setVideoProfile('480P_2');

            // 回调通知应用程序用户已授权访问本地摄像头／麦克风使用权限
            /**
             * @event: accessAllowed User has authorized access to local camera/microphone
             */
            localStream.on("accessAllowed", () => {
                console.log(MSG.accessAllowed);
            });

            // 回调通知应用程序用户拒绝访问本地摄像头／麦克风使用权限
            /**
             * @event: accessDenied User denied access to local camera/microphone
             */
            localStream.on("accessDenied", () => {
                console.log(MSG.accessDenied);
            });

            // 初始化本地流, 并同时申请本地媒体采集权限
            /**
             * stream.init
             * @param: callback success callback
             */
            localStream.init(() => {
                console.log(MSG.successGetUserMedia);

                // 将本地流在id为agora-remote的dom中播放
                /**
                 * stream.play
                 * @param: tag the dom tag where you want to play the video
                 * @return: null
                 */
                localStream.play(this.options.userLiveWindowId);

                // 将本地音视频流发布至 SD-RTN
                // 发布本地流以使其可以被远端接收到
                /**
                 * client.publish
                 * @param: stream the stream to publish
                 * @param: callback failing callback
                 * @return: null
                 */
                this.client.publish(localStream, (err) => {
                    console.log(MSG.errorPublishStream + err);
                });

                // 回调通知应用程序本地音视频流已发布
                this.client.on('stream-published', (evt) => {
                    console.log(MSG.successPublishStream);
                    let stream = evt.stream;
                    // 获取连接状态
                    stream.getStats((stats) => {
                        console.log('获取publish 流连接状态');
                        console.log(stats);
                    });
                });

            }, (err) => {
                console.log(MSG.errorGetUserMedia, err);
            });

        }, (err) => {
            console.log(MSG.errorJoin, err);
        });
    }

    _clientRtcTemplate(info) {
        let html = '';

        html = '<div class="popup lives-wrapper">';
        html += '<div class="lives-video"><div id="'+ this.options.liveWindowId +'" class="video" ></div></div>';
        html += '<div class="lives-header"><div class="lives-attention"><div class="user-info across">';
        html += info.userSex == 1 ? '<div class="user-img avatar-male">' : '<div class="user-img avatar-female">';
        html += info.userHead ? '<img src="'+ info.userHead +'">' : '';
        html += '</div><div class="across-body"><p class="user-name">'+ info.userName +'</p><p class="user-txt">'+ info.userHeat + ' ' + LANG.PUBLIC.Heat +'</p></div></div>';
        html += '<i class="icon live-attention '+ this.options.btnAddAttentionClass +'"></i></div><div class="icon live-close '+ this.options.btnLiveCloseClass +'"></div></div>';
        html += '<div class="lives-footer"><div class="lives-comments"></div>';
        html += '<div class="lives-buttons rtc-buttons"><div class="icon live-news '+ this.options.btnNewsClass +'"></div><div class="icon live-share '+ this.options.btnShareClass +'"></div>';
        html += this.options.type ? '<div class="icon live-gift '+ this.options.btnGiftClass +'"></div>' : '';
        html += '</div><div class="lives-video lives-video-us"><div id="'+ this.options.userLiveWindowId +'" class="video" ></div></div></div></div></div></div>';

        return html;
    }
}
/**
 * rtcClient.join
 * 当加入到频道的时候，会派发 rtcClient.join 事件，同时会传递用户IDuserId，频道ID channel ，用户加入频道时间 startTime。
 */