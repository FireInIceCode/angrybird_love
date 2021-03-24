/*
 * bird��
 */
(function() {
    //�������Sprite�̳�
    Bird = B2Sprite.extend({
            init: function(r) {
                this.r = r;
                this.sCtx = new StateContext(this);
                this.regState();
                this.isGoFly = false;
                this._super();
                //����birdѪ�� 
                this.hp = 45;
                //�켣����
                this.track = null;
                this.sCtx.changeState("idle");
            },
            //ע��״̬��
            regState: function() {
                this.sCtx.regState(new IdleState("idle", this.sCtx));
                this.sCtx.regState(new GoReadyState("goReady", this.sCtx));
                this.sCtx.regState(new GoFlyState("goFly", this.sCtx));
                this.sCtx.regState(new FlyState("fly", this.sCtx));
                this.sCtx.regState(new DeadState("dead", this.sCtx));
            },
            //����״̬����
            update: function() {
                this.sCtx.update();
            },
            //��ȡ��ǰ״̬
            getState: function() {
                return this.sCtx.currState.type;
            },
            //���ӵ�b2world������
            addToB2Word: function() {
                var body = B2Util.createRoundBody(this.r, this.x, this.y, 1.5, 0.1, 0.6);
                this.bindB2Obj(body);
            },
            //�����ȥ
            shooter: function() {
                //���嵯������        
                var c = TGame.getShootCenter();
                //����С�񵽵�����������
                var vx = c[0] - this.x,
                    vy = c[1] - this.y;
                var len = Math.sqrt(vx * vx + vy * vy);
                vx /= len;
                vy /= len;
                var force = TGame.power;
                //���嵯���80,���20;
                var tLen = 80;
                force *= (len / tLen);
                this.b2Obj.ApplyImpulse(new b2Vec2(vx * force, vy * force), this.b2Obj.GetWorldCenter());
                return force;
            },
            //����С����ײЧ��
            effColl: function() {
                var emit = new Emit({
                    "lifeRange": [600, 900],
                    "sSize": 1.2,
                    "eSize": 0.1,
                    "maxNum": 5,
                    "pos": [this.x, this.y],
                    "angRange": 90,
                    "v": [-1, -1],
                    "vRange": [1, 1],
                    "a": [0.01, 0.01],
                    "aRange": [0.01, 0.01]
                }, this.owner, BoomParticle.ClassName, ["boom1", "def"]);
                emit.jet();
            },
            //��д��������  
            dead: function() {
                var self = this;
                this._super();
                TGame.createBoom(this.x, this.y, function() {
                    self.effColl();
                })
            }
        })
        //ע��Bird���๤��
    Bird.ClassName = "Bird";
    //bird״̬��   
    var IdleState = State.extend({});
    //����Bird��ʼ״̬��
    var GoReadyState = State.extend({
        enter: function() {
            var bird = this.ctx.owner;
            //���������Ϊ���㣬С���ʼλ�ù���������
            var sc = TGame.getShootCenter();
            this.b = bird.x - sc[0];
            this.c = TGame.skyLineY - sc[1];
            this.a = -this.c / (this.b * this.b);
            //�趨time�������ƶ���������
            //ÿ֡���ĵ�ʱ��
            var tPerFrame = 1000 / TGame.frames;
            var time = 600;
            //����timeʱ�����ƶ���������ˮƽ����
            var steps = time / tPerFrame;
            //����dx
            bird.dx = -this.b / steps;
            //����ÿ֡��ת�ĽǶ�
            this.sDeg = 360 / steps;
        },
        change: function() {
            var bird = this.ctx.owner;
            if (bird.isGoFly) {
                //׼����
                this.ctx.changeState("goFly");
            }
        },
        update: function() {
            var bird = this.ctx.owner;
            var sc = TGame.getShootCenter();
            bird.deg += this.sDeg;
            //���������λ��
            bird.x += bird.dx;
            //������Ե�����x����
            var bx = bird.x - sc[0];
            //����������y����
            var by = this.a * bx * bx + this.c;
            bird.y = TGame.skyLineY - by;
            //����պõ��ﵯ��������׼���ÿ��Է���С��
            if (bx <= 0) {
                bird.isGoFly = true;
            }
        }
    });
    //׼����״̬
    var GoFlyState = State.extend({
        enter: function() {
            //��ʼ������
            TGame.initContactLtn();
            this.reset = false;
        },
        change: function() {
            var bird = this.ctx.owner;
            //�ͷ����
            if (this.drag && Mouse.gBtnState(0) == 0) {
                this.drag = false;
                //����̫�̣��ָ�ԭ״
                if (this.reset) {
                    bird.moveTo(this.ox, this.oy);
                } else {
                    //����
                    this.ctx.changeState("fly");
                }
            }
        },
        update: function() {
            var bird = this.ctx.owner;
            var sshort = TGame.sshort;
            if (!this.drag && Mouse.gBtnState(0) == 1 && bird.isMouseIn()) {
                this.drag = true;
                this.ox = bird.x;
                this.oy = bird.y;
            }
            //�ƶ�
            if (this.drag) {
                var nx = this.ox + Mouse.gXOff(),
                    ny = this.oy + Mouse.gYOff();
                var c = TGame.getShootCenter();
                var sx = c[0] - nx;
                var sy = c[1] - ny;
                var len = sx * sx + sy * sy;
                //�����϶��ĳ��Ȳ�����80
                if (len < 6400) {
                    bird.moveTo(nx, ny);
                }
                //�����϶��ĳ���С��20��ԭ
                this.reset = (len < 400) ? true : false;
            }
        }
    });
    //�������״̬
    var FlyState = State.extend({
        enter: function() {
            var bird = this.ctx.owner;
            //���ӵ�box2d�����ռ��� 
            bird.addToB2Word();
            var f = bird.shooter();
            //��¼�켣����
            this.step = MathUtil.lerp(6, 1, (f - TGame.power * 0.2) / (TGame.power * 0.8)) | 0;
            this.tCount = this.step;
        },
        change: function() {
            var bird = this.ctx.owner;
            var v = bird.b2Obj.GetLinearVelocity();
            //�ٶ�Ϊ0���߳�����Ļ��Χ,��ת��������
            if (bird.x < -bird.r || bird.x > bird.owner.w + bird.r || (Math.abs(v.x) < 0.1 && Math.abs(v.y) < 0.1)) {
                this.ctx.changeState("dead");
            }
        },
        update: function() {
            var bird = this.ctx.owner;
            bird.syncToB2();
            //���û����ײ��
            if (!bird.isColled) {
                if (++this.tCount > this.step) {
                    this.tCount = 0;
                    bird.track.tracks.push(bird.x, bird.y);
                }
            }
        }
    });
    //����״̬
    var DeadState = State.extend({
        update: function() {
            var bird = this.ctx.owner;
            bird.dead();
        }
    });
    ClassFactory.regClass(Bird.ClassName, Bird);
    ClassFactory.regClass(BoomParticle.ClassName, BoomParticle);
}());
// document.addEventListener('touchstart', (e) => {
//     // alert(3);
//     // e.touches[0].preventDefault();
//     var me = {}
//     me.button = 0;
//     me.pageX = e.touches[0].pageX;
//     me.pageY = e.touches[0].pageY;
//     me.target = e.touches[0].target;
//     document.onmousedown(me)
// });
// document.addEventListener('touchend', (e) => {
//     // e.touches[0].preventDefault();
//     var me = {}
//     me.button = 0;
//     me.pageX = e.touches[0].pageX;
//     me.pageY = e.touches[0].pageY;
//     me.target = e.touches[0].target;
//     document.onmouseup(me)
// });
// document.addEventListener('touchmove', (e) => {
//     // e.touches[0].preventDefault();
//     var me = {}
//     me.button = 0;
//     me.pageX = e.touches[0].pageX;
//     me.pageY = e.touches[0].pageY;
//     me.target = e.touches[0].target;
//     document.onmousemove(me)
// });
function touchHandler(event) {

    var touches = event.changedTouches,

        first = touches[0],

        type = "";

    switch (event.type) {

        case "touchstart":
            type = "mousedown";
            break;

        case "touchmove":
            type = "mousemove";
            break;

        case "touchend":
            type = "mouseup";
            break;

        default:
            return;

    }



    // initMouseEvent(type, canBubble, cancelable, view, clickCount, 

    //                screenX, screenY, clientX, clientY, ctrlKey, 

    //                altKey, shiftKey, metaKey, button, relatedTarget);



    var simulatedEvent = document.createEvent("MouseEvent");

    simulatedEvent.initMouseEvent(type, true, true, window, 1,

        first.screenX, first.screenY,

        first.clientX, first.clientY, false,

        false, false, false, 0 /*left*/ , null);


    console.log(simulatedEvent);
    // first.target.dispatchEvent(simulatedEvent);
    document.dispatchEvent(simulatedEvent)

    event.preventDefault();

}



function init() {

    document.addEventListener("touchstart", touchHandler, true);

    document.addEventListener("touchmove", touchHandler, true);

    document.addEventListener("touchend", touchHandler, true);

    document.addEventListener("touchcancel", touchHandler, true);

}

init();