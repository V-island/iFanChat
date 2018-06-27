import Template from 'art-template/lib/template-web';
import EventEmitter from './eventEmitter';
import Modal from './modal';
import fcConfig from './intro';
import {
    checkAuth,
    newDayRecord
} from './api';
import {
    getLangConfig
} from './lang';
import {
    extend,
    addEvent,
    importTemplate,
    createDom,
    hasClass,
    addClass,
    removeClass
} from './util';

const LANG = getLangConfig();
const MADAL = LANG.HOME.Madal;
const modal = new Modal();

export default class Record extends EventEmitter {
    constructor(options) {
        super();

        this.options = {
            config: {
                audio: true,
                video: true
            },
            localUpload: false;
            inRecordClass: 'record-in',
            outRecordClass: 'record-out',
            recordBtnClass: 'btn-record',
            buttonsClass: 'record-buttons',
            videoClass: 'video',
            closeClass: 'live-close',
            cutoverClass: 'live-cutover',
            cancelClass: 'live-cancel',
            confirmClass: 'live-confirm',
            localUploadClass: 'live-local-upload',
            startClass: 'record-start',
            endClass: 'record-end',
            showClass: 'active'
        };

        extend(this.options, options);

        this.boxEl = createDom(this._tabsTemplate(this.options));

        document.body.appendChild(this.boxEl);

        this.videoEl = this.boxEl.getElementsByClassName(this.options.videoClass)[0];
        this.recordEl = this.boxEl.getElementsByClassName(this.options.recordBtnClass)[0];
        this.buttonsEl = this.boxEl.getElementsByClassName(this.options.buttonsClass)[0];
        this.closeEl = this.boxEl.getElementsByClassName(this.options.closeClass)[0];
        this.cutoverEl = this.boxEl.getElementsByClassName(this.options.cutoverClass)[0];
        this.cancelEl = this.boxEl.getElementsByClassName(this.options.cancelClass)[0];
        this.confirmEl = this.boxEl.getElementsByClassName(this.options.confirmClass)[0];
        this.localUploadEl = this.boxEl.getElementsByClassName(this.options.localUploadClass)[0];
        this._init();
    }

    _init() {
        const self = this;
        self.buffers = [];

        if (navigator.mediaDevices.getUserMedia || navigator.getUserMedia || navigator.webkitGetUserMedia || navigator.mozGetUserMedia){
            // 获取媒体设备的媒体流
            self._getUserMedia(self.options.config, function(stream) {
                self.mediaRecoder = new MediaRecorder(stream);
                console.log(self.mediaRecoder);
                self.mediaRecoder.ondataavailable = function (event) {
                    self.buffers.push(event.data);
                    console.log(event.data);
                };

                self.mediaRecoder.onstart = function () {
                    self.video = document.createElement("video");
                    self.video.src = window.URL && window.URL.createObjectURL(stream) || stream;
                    self.videoEl.appendChild(self.video);
                    self.video.autoplay = true;
                    console.log(self.video.src);
                };

                // self.addEventListener();
            }, function(error) {
                console.log(error);
            });
        } else {
            console.log("你的浏览器不支持访问用户媒体设备");
        }

        self._bindEvent();
    }

    _bindEvent() {
        let self = this;

        // 开始录制/取消录制
        addEvent(self.recordEl, 'click', function() {
            if(hasClass(self.buttonsEl, self.options.showClass)){
                removeClass(self.buttonsEl, self.options.showClass);
                self._stopRecord();
                console.log('取消录制');
            }else {
                addClass(self.buttonsEl, self.options.showClass);
                self._startRecord();
                console.log('开始录制');
            }
        });

        // 关闭录制器
        addEvent(self.closeEl, 'click', function() {
            self.hide();
        });

        // 删除录制视频
        addEvent(self.cancelEl, 'click', function() {
            console.log(self.options.cancelClass);
        });
    }

    _tabsTemplate(options) {
        let html = '';

        html = '<div class="content record-wrapper">';
        html += '<div class="lives-video"><div id="video" class="'+ this.options.videoClass +'"></div></div>';
        html += '<div class="lives-header"><div class="icon '+ this.options.closeClass +'"></div><div class="icon '+ this.options.cutoverClass +'"></div></div>';
        html += '<div class="lives-buttons record-buttons"><div class="icon '+ (this.options.endClass+ " " +this.options.cancelClass) +'"></div><div class="'+ this.options.recordBtnClass +'"></div><div class="icon '+ (this.options.endClass+ " " +this.options.confirmClass) +'"></div><div class="icon '+ (this.options.startClass+ " " +this.options.localUploadClass) +'"></div></div>';
        html += '</div>';

        return html;
    }

    static attachTo(options) {
        return new Record(options);
    }

    // 访问用户媒体设备的兼容方法
    _getUserMedia(constrains,success,error){
        if(navigator.mediaDevices.getUserMedia){
            //最新标准API
            navigator.mediaDevices.getUserMedia(constrains).then(success).catch(error);
        } else if (navigator.webkitGetUserMedia){
            //webkit内核浏览器
            navigator.webkitGetUserMedia(constrains).then(success).catch(error);
        } else if (navigator.mozGetUserMedia){
            //Firefox浏览器
            navagator.mozGetUserMedia(constrains).then(success).catch(error);
        } else if (navigator.getUserMedia){
            //旧版API
            navigator.getUserMedia(constrains).then(success).catch(error);
        }
    }

    // 开始录制
    _startRecord() {
        console.log(this.mediaRecoder);
        if (this.mediaRecoder.state == "recording"){
            return;
        }else if(this.mediaRecoder.state == "paused"){
            this.mediaRecoder.resume();
        }else if(this.mediaRecoder.state == "inactive"){
            let tracks = this.mediaRecoder.stream.getTracks();
            tracks[0].start();
            tracks[1].start();
            this.mediaRecoder.start();
        }
        console.log(this.mediaRecoder.state);
    }

    // 结束录制
    _stopRecord() {
        if(this.mediaRecoder.state == "recording"){
            console.log('关闭');
            let tracks = this.mediaRecoder.stream.getTracks();
            // let tracksAudio = this.mediaRecoder.stream.getAudioTracks();
            // let tracksVideo = this.mediaRecoder.stream.getVideoTracks();
            console.log(tracks);
            // console.log(tracksAudio);
            // console.log(tracksVideo);
            tracks[0].stop();
            tracks[1].stop();
            this.mediaRecoder.stop();
        }
        console.log(this.mediaRecoder.state);
    }

    // 添加录制结束的事件监听，保存录制数据并提示下载
    _addEventListener() {
        var self = this;

        this.mediaRecoder.onstop = function () {
            self.blob = new Blob(self.buffers,{type:"video/mp4"});
            self.url = URL.createObjectURL(self.blob);
            var downloadButton = document.createElement("a");
            downloadButton.textContent = "保存到本地";
            downloadButton.href = self.url;
            downloadButton.download = self.url;
            document.body.appendChild(downloadButton);
            document.body.removeChild(self.video);
        };

    }

    /**
     * Record.show()
     * 显示录制器
     * @param  {Function} next 为录制器显示后执行的回调函数
     * @return {[type]}        [description]
     */
    show(next) {
        window.setTimeout(() => {
            this.trigger('record.open');
            addClass(this.boxEl, this.options.inRecordClass);
            next && next();
        }, 0);
    }

    /**
     * Record.hide()
     * 隐藏录制器，一般来说，录制器内部已经实现了隐藏逻辑，不必主动调用。
     * @return {[type]} [description]
     */
    hide() {
        removeClass(this.boxEl, this.options.inRecordClass);
        addClass(this.boxEl, this.options.outRecordClass);
        window.setTimeout(() => {
            this.trigger('record.close');
            document.body.removeChild(this.boxEl);
        }, 500);
    }
}