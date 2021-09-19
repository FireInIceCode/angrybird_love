/*!
 * xengine
 * Copyright 2012 xiangfeng
 * Released under the MIT license
 * Please contact to xiangfenglf@163.com if you hava any question 
 * ��Ϸϵͳ��
 */
(function(win) {
    //��Ϸ״̬��
    var _FState = win.FrameState = {
        //���֡��?
        maxFrame: 0,
        //��С֡��
        minFrame: 9999,
        //��ʱ֡��
        currFrame: 0,
        //��ǰʱ��
        currTime: 0,
        //ÿ֡���ŵ�ʱ��
        elapseTime: 0,
        //����ͳ��ÿ�뿪ʼʱ��
        _sTime: 0,
        //ͳ��ÿ����֡��
        _sTFrame: 0,
        //����֡״̬�����?
        start: function() {
            this.currTime = this._sTime = new Date();
        },
        //ÿ֡����Ϸѭ��ǰ���ô˷��������ºͼ���֡��
        update: function() {
            var fTime = new Date();
            if (fTime - this._sTime >= 1000) {
                this.currFrame = this._sTFrame;
                this.maxFrame = (this.currFrame > this.maxFrame) ? this.currFrame : this.maxFrame;
                this.minFrame = (this.currFrame < this.minFrame) ? this.currFrame : this.minFrame;
                this._sTFrame = 0;
                this._sTime = fTime;
            } else {
                ++this._sTFrame;
            }
            this.elapseTime = fTime - this.currTime;
            this.currTime = fTime;
        }
    };
    //��ϷIO
    //�����?
    win.Mouse = (function() {
        var _M = {
            x: 0,
            y: 0,
            ox: 0,
            oy: 0,
            w: 0, //����м���������?
            bs: [0, 0, 0], //���״�?,
            target: null,
            isMoveCacheEnable: false, //�Ƿ����ü�¼�ƶ��㻺��
            cache: [], //��¼����ƶ��㻺��?
            dlgEvent: { "up": null, "down": null, "click": null, "dbclick": null, "move": null, "wheel": null } //�����¼�����
        };
        //Ĭ�ϼ�¼30����Ļ���?
        var _MAX_POINT_CACHE = 60;
        var eWeelDelta = 120;
        //����Ŀ��
        function setTarget(e) {
            _M.target = e.target;
        }
        //�������λ��?
        function setMPos(e) {
            _M.x = e.pageX;
            _M.y = e.pageY;
        }
        //������갴��״�?
        function setMBtnState(e, flag) {
            _M.bs[e.button] = flag;
        }
        //���ӵ㵽Cache��
        function addToMPCache(x, y) {
            if (_M.cache.length > _MAX_POINT_CACHE) {
                _M.cache.shift();
                _M.cache.shift();
            }
            _M.cache.push(x);
            _M.cache.push(y);
        }
        //��ȡ����������ǰ�����꣬����ģʽ����
        function get() {
            var x = _M.cache.shift(),
                y = _M.cache.shift();
            return [x, y];
        }
        //������л���?
        function clearCache() {
            _M.cache = [];
        }
        //�����¼�����
        function setDelegatedEvent(eName, fn) {
            _M.dlgEvent[eName] = fn;
        }
        //ɾ���¼�����
        function delDelegatedEvent(eName) {
            _M.dlgEvent[eName] = null;
        }
        //�����Ƿ����?
        function setEnabled(flag) {
            if (flag) {
                document.oncontextmenu = function() { return false };
                document.onmousemove = doMove;
                document.onmousedown = doDown;
                document.onmouseup = doUp;
                document.onclick = doClick;
                document.ondblick = doDBClick;
                document.onmousewheel = doWheel;
            } else {
                document.onmousemove = null;
                document.onmousedown = null;
                document.onmouseup = null;
                document.onclick = null;
                document.ondblick = null;
                document.onmousewheel = null;
            }
        }

        function doMove(e) {
            e.preventDefault();
            setMPos(e);
            setTarget(e);
            if (_M.isMoveCacheEnable) {
                addToMPCache(_M.x, _M.y);
            }
            _M.dlgEvent.move && _M.dlgEvent.move(e);
        }

        function doDown(e) {
            //e.preventDefault();
            setMBtnState(e, 1);
            setTarget(e);
            _M.ox = e.pageX;
            _M.oy = e.pageY;
            _M.dlgEvent.down && _M.dlgEvent.down(e);
        }

        function doUp(e) {
            setMBtnState(e, 0);
            setTarget(e);
            _M.dlgEvent.up && _M.dlgEvent.up(e);
        }

        function doClick(e) {
            _M.dlgEvent.click && _M.dlgEvent.click(e);
        }

        function doDBClick(e) {
            _M.dlgEvent.dbclick && _M.dlgEvent.dbclick(e);
        }

        function doWheel(e) {
            this.w += (e.wheelDelta >= eWeelDelta) ? 1 : -1;
            _M.dlgEvent.doWheel && _M.dlgEvent.doWheel(e);
        }
        //��ʼ��
        setEnabled(true);
        return {
            gTarget: function() { return _M.target; },
            gPos: function(v3) {
                v3.x = _M.x;
                v3.y = _M.y;
                v3.z = _M.w
            },
            gX: function() { return _M.x },
            gY: function() { return _M.y },
            gW: function() { return _M.w },
            gBtnState: function(btn) { return _M.bs[btn]; },
            gXOff: function() { return _M.x - _M.ox },
            gYOff: function() { return _M.y - _M.oy },
            gCPT: function() { return get(); },
            cCHE: function() { clearCache(); },
            sDLG: function(eName, fn) { setDelegatedEvent(eName, fn); },
            dDLG: function(eName) { delDelegatedEvent(eName); },
            sMode: function(mode) { _M.isMoveCacheEnable = (mode === 1); } //0:����ģʽ��1:����ģʽ
        };
    }());



    //������
    win.Key = (function() {
        var _K = {
                A: 65,
                B: 66,
                C: 67,
                D: 68,
                E: 69,
                F: 70,
                G: 71,
                H: 72,
                I: 73,
                J: 74,
                K: 75,
                L: 76,
                M: 77,
                N: 78,
                O: 79,
                P: 80,
                Q: 81,
                R: 82,
                S: 83,
                T: 84,
                U: 85,
                V: 86,
                W: 87,
                X: 88,
                Y: 89,
                Z: 90,
                N0: 48,
                N1: 49,
                N2: 50,
                N3: 51,
                N4: 52,
                N5: 53,
                N6: 54,
                N7: 55,
                N8: 56,
                N9: 57,
                LEFT: 37,
                RIGHT: 39,
                UP: 38,
                DOWN: 40,
                ENTER: 13,
                SPACE: 32,
                TAB: 9,
                SHIFT: 16,
                ALT: 18,
                CTRL: 17,
                //��¼���̻��������?
                MAX_KEY_CACHE: 20,
                //��¼����״̬
                states: new Array(255),
                cache: [],
                //�¼���������
                dlgEvent: { "up": null, "down": null },
                isEnableCache: false,
                //�����¼�����
                setDLG: function(eName, fn) {
                    this.dlgEvent[eName] = fn;
                },
                //ɾ���¼�����
                delDLG: function(eName) {
                    this.dlgEvent[eName] = null;
                },
                //�����Ƿ����?
                setEnabled: function(flag) {
                    var self = this;
                    if (flag) {
                        var st = this.states;
                        this.clearKeyStates();
                        this.sMode(0);
                        document.onkeydown = function(e) {
                            st[event.keyCode] = 1;
                            if (self.isEnableCache) {
                                if (self.cache.length > MAX_KEY_CACHE) {
                                    self.cache.shift();
                                }
                                self.cache.push(e.keyCode);
                            }
                            self.dlgEvent.down && self.dlgEvent.down(e);
                        };
                        document.onkeyup = function(e) {
                            st[e.keyCode] = 0;
                            self.dlgEvent.up && self.dlgEvent.up(e);
                        }
                    } else {
                        document.onkeydown = null;
                        document.onkeyup = null;
                    }
                },
                //�ж��Ƿ񰴼�
                pressed: function(key) {
                    return this.states[key];
                },
                //��ȡ����������ǰ�İ���
                get: function() {
                    return this.cache.shift();
                },
                //����keys�������κμ�
                pAny: function(keys) {
                    var result = false;
                    for (var i = 0; i < keys.length; i++) {
                        if (this.states[keys[i]]) {
                            result = true;
                            break;
                        }
                    }
                    return result;
                },
                //�������м�,state 1:down 0:up
                pAll: function(keys, state) {
                    var result = true;
                    for (var i = 0; i < keys.length; i++) {
                        if (this.states[keys[i]] == !state) {
                            result = false;
                            break;
                        }
                    }
                    return result;
                },
                clearKeyStates: function() {
                    for (var i = 0; i < 255; i++) {
                        this.states[i] = 0;
                    }
                },
                clearCache: function() {
                    this.cache = [];
                },
                sMode: function(mode) {
                    this.isEnableCache = (mode === 1);
                }
            }
            //��ʼ��
        _K.setEnabled(true);
        return _K;
    }());
}(window))