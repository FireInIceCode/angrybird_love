/*
 * Block��
 */
(function() {
    //�������Sprite�̳�
    Block = B2Sprite.extend({
            init: function(bType) {
                this.sCtx = new StateContext(this);
                this.regState();
                this.bType = bType;
                this._super();
                this.hp = 40;
                this.score = 1000;
                this.sCtx.changeState("idle");
            },
            //ע��״̬��
            regState: function() {
                this.sCtx.regState(new IdleState("idle", this.sCtx));
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
            addToB2Word: function(t) {
                //�����������,Ĭ����ľͷ
                var density = 1,
                    friction = 0.8,
                    restitution = 0.3;
                switch (this.bType) {
                    case "glass":
                        density = 0.5;
                        break;
                    case "stone":
                        density = 4;
                        restitution = 0.01;
                        break;
                }
                body = B2Util.createRectBody(this.x, this.y, this.w * 0.5, this.h * 0.5, this.deg, density, friction, restitution);
                this.bindB2Obj(body);
            },
            //����block��ײЧ��
            effColl: function() {
                var boomName, mNum;
                switch (this.bType) {
                    case "glass":
                        boomName = "boom2";
                        mNum = 6;
                        break;
                    default:
                        boomName = "boom3";
                        mNum = 12;
                }
                var emit = new Emit({
                    "lifeRange": [200, 600],
                    "sSize": 1,
                    "eSize": 0.2,
                    "maxNum": mNum,
                    "pos": [this.x, this.y],
                    "angRange": 180,
                    "v": [-1.2, 1],
                    "vRange": [1, 1],
                    "a": [0.01, -0.01],
                    "aRange": [0.01, -0.01]
                }, this.owner, BoomParticle.ClassName, [boomName]);
                emit.jet();
            },
            //��д��������  
            dead: function() {
                this._super();
                this.effColl();
                //��ʾ����
                TGame.createScore(this.x, this.y, { "txt": this.score, 'col': 'orange' });
            }
        })
        //ע��Block���๤��
    Block.ClassName = "Block";
    var IdleState = State.extend({
        change: function() {
            var bk = this.ctx.owner;
        },
        update: function() {
            var bk = this.ctx.owner;
            bk.syncToB2();
        }
    });
    ClassFactory.regClass(Block.ClassName, Block);
}())