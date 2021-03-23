/*!
 * xengine
 * Copyright 2012 xiangfeng
 * Released under the MIT license
 * Please contact to xiangfenglf@163.com if you hava any question 
 * xengine ������
 */
(function(win) {
    //�����������
    var _bUtil = win.BrowseUtil = {
        //��ȡ������ʺϵ�cssǰ׺
        getPrefix4CSS: function() {}
    };
    //JSON������
    var _jUtil = win.JSONUtil = {
            isEmpty: function(obj) {
                for (var i in obj) {
                    return false;
                }
                return true;
            }
        }
        //��Դ������
    var _rUtil = win.ResUtil = {
            loadFile: function(fileURL, type, fn, sync) {
                var ct = "text/xml;charset=UTF-8";
                var dt = type || "json";
                if (dt == "json") {
                    ct = "text/x-json;charset=UTF-8";
                }
                $.ajax({
                    url: fileURL,
                    async: (sync == null ? false : sync),
                    type: "GET",
                    dataType: dt,
                    contentType: ct,
                    error: function() {
                        console.log("Load File [" + fileURL + "] Error!");
                    },
                    success: function(data) {
                        console.log("Load File [" + fileURL + "] Successful!")
                        fn(data);
                    }
                });
            }
        }
        //������
    var _queue = win.Queue = function(cap) {
            var _MAXDEF = 9,
                capacity = cap + 1,
                head = 0,
                tail = 0,
                data = [];
            this.empty = function() { data.length = 0; }
            this.isEmpty = function() { return (head == tail); }
            this.isFull = function() { return ((tail + 1) % capacity == head); }
            this.add = function(val) {
                if (this.isFull()) {
                    return -1;
                }
                data[tail] = val;
                tail = (tail + 1) % capacity;
            };
            this.remove = function() {
                var result = null;
                if (!this.isEmpty()) {
                    result = data[head];
                    head = (head + 1) % capacity;
                }
                return result;
            };
        }
        //���鹤����
    var _arrUtil = win.ArrayUtil = {
            //�Ƴ�arr������Ϊidx����Ŀ
            removeByIdx: function(arr, idx) {
                arr && arr.splice(idx, 1);
            },
            removeFn: function(arr, fn) {
                var idx = -1;
                for (var aIdx = 0; aIdx < arr.length; aIdx++) {
                    if (fn(arr[aIdx])) {
                        idx = aIdx;
                        break;
                    }
                }
                if (idx != -1)
                    arr.splice(idx, 1);
            },
            insert: function(arr, pos, ele) {
                if ((arr.length === 0 && pos === 0) || (pos === arr.length)) {
                    this.push(ele);
                } else if (pos < 0 || pos > arr.length) {
                    return;
                } else {
                    var len = arr.length - pos;
                    arr.splice(pos, len, ele, arr.slice(pos));
                }
            },
            fillWith: function(arr, val) {
                for (var i = 0, len = arr.length; i < len; i++) {
                    arr[i] = val;
                }
            }
        }
        //��ѧ������
    var MathUtil = win.MathUtil = {
            deg2rad: function(angle) {
                return angle * 0.017453292;
            },
            rad2deg: function(rad) {
                return rad * 57.29578;
            },
            lerp: function(a, b, r) {
                return a * (1 - r) + b * r;
            },
            //return a num between -range to range;
            randRange: function(range) {
                return (Math.random() - 0.5) * range * 2;
            },
            //x>=min && x<max
            randInt: function(min, max) {
                max = max || 0;
                min = min || 0;
                var step = Math.abs(max - min);
                var st = (arguments.length < 2) ? 0 : min;
                var result;
                result = st + (Math.ceil(Math.random() * step)) - 1;
                return result;
            },
            dotV2: function(v1, v2) {
                return v1.x * v2.x + v1.y * v2.y;
            },
            lenV2: function(v) {
                return Math.sqrt(v.x * v.x + v.y * v.y);
            },
            normV2: function(v) {
                var len = MathUtil.lenV2(v),
                    rlen = 1 / len;
                return { "x": v.x * rlen, "y": v.y * rlen };
            },
            //�ж����������Ƿ��ཻ
            isInRect: function(x1, y1, x2, y2, x3, y3, x4, y4) {
                if (x1 > x4 || x2 < x3) return false;
                if (y1 > y4 || y2 < y3) return false;
                return true;
            },
            //��ȡ���������ཻ����
            getInRect: function(x1, y1, x2, y2, x3, y3, x4, y4) {
                return [Math.max(x1, x3), Math.max(y1, y3), Math.min(x2, x4), Math.min(y2, y4)];
            },
            //���Ƿ���Rect��
            pInRect: function(x1, y1, x2, y2, w, h) {
                return x1 >= x2 && x1 <= x2 + w && y1 >= y2 && y1 <= y2 + h;
            },
            //����Ļ�����Ͻ�Ϊԭ�㣬x1,y1Ϊ����ĵ�ת����ox,oyΪԭ�������
            mapSToCoord: function(x1, y1, ox, oy) {
                return [x1 - ox, y1 - oy];
            },
            //����polyArr��axis�ϵ�ͶӰ,polyArr��һϵ�е�����ļ���,�����ʾ
            calcProj: function(axis, polyArr) {
                var v = { "x": polyArr[0], "y": polyArr[1] };
                var d, min, max;
                min = max = MathUtil.dotV2(axis, v);
                for (var i = 2; i < polyArr.length - 1; i += 2) {
                    v.x = polyArr[i];
                    v.y = polyArr[i + 1];
                    d = MathUtil.dotV2(axis, v);
                    min = (d < min) ? d : min;
                    max = (d > max) ? d : max;
                }
                return [min, max];
            },
            //����ͬһ�������߶εľ���s1(min1,max1),s2(min2,max2),�������С��0���ʾ���߶����ཻ; 
            segDist: function(min1, max1, min2, max2) {
                if (min1 < min2) {
                    return min2 - max1;
                } else {
                    return min1 - max2;
                }
            },
            //�ж�����������Ƿ��ཻ��ײ,p1,p2���ڱ������ε������
            isCollide: function(p1, p2) {
                //���巨����
                var e = { "x": 0, "y": 0 };
                var p = p1,
                    idx = 0,
                    len1 = p1.length,
                    len2 = p2.length;
                for (var i = 0, len = len1 + len2; i < len - 1; i += 2) {
                    idx = i;
                    //�������������ÿ����
                    if (i > len1) {
                        p = p2;
                        idx = (i - len1);
                    }
                    if (i == p.length - 2) {
                        px = p[0] - p[idx];
                        py = p[1] - p[idx + 1];
                    } else {
                        px = p[idx + 2] - p[idx],
                            py = p[idx + 3] - p[idx + 1];
                    }
                    //�õ��ߵķ����� 
                    e.x = -py;
                    e.y = px;
                    //��������������ڷ������ϵ�ͶӰ
                    var pp1 = MathUtil.calcProj(e, p1);
                    var pp2 = MathUtil.calcProj(e, p2);
                    //���������߶��ڷ������Ͼ��룬�������0������˳�����ʾ���ཻ
                    if (MathUtil.segDist(pp1[0], pp1[1], pp2[0], pp2[1]) > 0) {
                        return false;
                    }
                }
                return true;
            }
        }
        //��ͼ����
    var _MapUtil = win.MapUtil = {
            //��������
            Point: function(x, y) {
                this.x = x;
                this.y = y;
                this.parent = null;
                this.f = 0;
                this.g = 0;
                this.h = 0;
                //��ǰ��״̬��0����ʾ��openlist 1:��ʾcloselist,-1��ʾ��û����
                this.state = -1;
                //flag�����õ��Ƿ��ͨ��
                this.flag = 0;
            },
            //��������Թ�
            primMaze: function(r, c) {
                //��ʼ������
                function init(r, c) {
                    var a = new Array(2 * r + 1);
                    //ȫ����1
                    for (var i = 0, len = a.length; i < len; i++) {
                        var cols = 2 * c + 1;
                        a[i] = new Array(cols);
                        ArrayUtil.fillWith(a[i], 1);
                    }
                    //�м����Ϊ0
                    for (var i = 0; i < r; i++)
                        for (var j = 0; j < c; j++) {
                            a[2 * i + 1][2 * j + 1] = 0;
                        }
                    return a;
                }
                //�������飬�������յ�����
                function process(arr) {
                    //acc����ѷ��ʶ��У�noacc���û�з��ʶ���
                    var acc = [],
                        noacc = [];
                    var r = arr.length >> 1,
                        c = arr[0].length >> 1;
                    var count = r * c;
                    for (var i = 0; i < count; i++) { noacc[i] = 0; }
                    //����յ�Ԫ��������ƫ��
                    var offs = [-c, c, -1, 1],
                        offR = [-1, 1, 0, 0],
                        offC = [0, 0, -1, 1];
                    //�����noaccȡ��һ��λ��
                    var pos = MathUtil.randInt(count);
                    noacc[pos] = 1;
                    acc.push(pos);
                    while (acc.length < count) {
                        var ls = -1,
                            offPos = -1;
                        offPos = -1;
                        //�ҳ�posλ���ڶ�ά�����е�����
                        var pr = pos / c | 0,
                            pc = pos % c,
                            co = 0,
                            o = 0;
                        //���ȡ���������ĸ���Ԫ
                        while (++co < 5) {
                            o = MathUtil.randInt(0, 5);
                            ls = offs[o] + pos;
                            var tpr = pr + offR[o];
                            var tpc = pc + offC[o];
                            if (tpr >= 0 && tpc >= 0 && tpr <= r - 1 && tpc <= c - 1 && noacc[ls] == 0) { offPos = o; break; }
                        }
                        if (offPos < 0) {

                            pos = acc[MathUtil.randInt(acc.length)];
                        } else {
                            pr = 2 * pr + 1;
                            pc = 2 * pc + 1;
                            //���ڿյ�Ԫ�м��λ����0
                            arr[pr + offR[offPos]][pc + offC[offPos]] = 0;
                            pos = ls;
                            noacc[pos] = 1;
                            acc.push(pos);
                        }
                    }
                }
                var a = init(r, c);
                process(a);
                return a;
            },
            //����ͨ��ά����(ȫ����1��0��ʾ)��ת����a*����Ҫ�ĵ�����
            convertArrToAS: function(arr) {
                var r = arr.length,
                    c = arr[0].length;
                var a = new Array(r);
                for (var i = 0; i < r; i++) {
                    a[i] = new Array(c);
                    for (var j = 0; j < c; j++) {
                        var pos = new MapUtil.Point(i, j);
                        pos.flag = arr[i][j];
                        a[i][j] = pos;
                    }
                }
                return a;
            },
            //A*�㷨,pathArr��ʾ��󷵻ص�·��
            findPathA: function(pathArr, start, end, row, col) {
                //�������ݵ�����������
                function addArrSort(descSortedArr, element, compare) {
                    var left = 0;
                    var right = descSortedArr.length - 1;
                    var idx = -1;
                    var mid = (left + right) >> 1;
                    while (left <= right) {
                        var mid = (left + right) >> 1;
                        if (compare(descSortedArr[mid], element) == 1) {
                            left = mid + 1;
                        } else if (compare(descSortedArr[mid], element) == -1) {
                            right = mid - 1;
                        } else {
                            break;
                        }
                    }
                    for (var i = descSortedArr.length - 1; i >= left; i--) {
                        descSortedArr[i + 1] = descSortedArr[i];
                    }
                    descSortedArr[left] = element;
                    return idx;
                }
                //�ж��������Ƿ���ͬ
                function pEqual(p1, p2) {
                    return p1.x == p2.x && p1.y == p2.y;
                }
                //��ȡ��������룬���������ٷ���
                function posDist(pos, pos1) {
                    return (Math.abs(pos1.x - pos.x) + Math.abs(pos1.y - pos.y));
                }

                function between(val, min, max) {
                    return (val >= min && val <= max)
                }
                //�Ƚ�������fֵ��С
                function compPointF(pt1, pt2) {
                    return pt1.f - pt2.f;
                }
                //������ǰ�ڵ�
                function processCurrpoint(arr, openList, row, col, currPoint, destPoint) {
                    //get up,down,left,right direct
                    var ltx = currPoint.x - 1;
                    var lty = currPoint.y - 1;
                    for (var i = 0; i < 3; i++)
                        for (var j = 0; j < 3; j++) {
                            var cx = ltx + i;
                            var cy = lty + j;
                            if ((cx == currPoint.x || cy == currPoint.y) && between(ltx, 0, row - 1) && between(lty, 0, col - 1)) {
                                var tp = arr[cx][cy];
                                if (tp.flag == 0 && tp.state != 1) {
                                    if (pEqual(tp, destPoint)) {
                                        tp.parent = currPoint;
                                        return true;
                                    }
                                    if (tp.state == -1) {
                                        tp.parent = currPoint;
                                        tp.g = 1 + currPoint.g;
                                        tp.h = posDist(tp, destPoint);
                                        tp.f = tp.h + tp.f;
                                        tp.state = 0
                                        addArrSort(openList, tp, compPointF);
                                    } else {
                                        var g = 1 + currPoint.g
                                        if (g < tp.g) {
                                            tp.parent = currPoint;
                                            tp.g = g;
                                            tp.f = tp.g + tp.h;
                                            openList.quickSort(compPointF);
                                        }
                                    }
                                }
                            }
                        }
                    return false;
                }
                //����openList
                var openList = [];
                //����closeList
                var closeList = [];
                start = pathArr[start[0]][start[1]];
                end = pathArr[end[0]][end[1]];
                //���ӿ�ʼ�ڵ㵽openList;
                addArrSort(openList, start, compPointF);
                var finded = false;
                var tcount = 0;
                while ((openList.length > 0)) {
                    var currPoint = openList.pop();
                    currPoint.state = 1;
                    closeList.push(currPoint);
                    finded = processCurrpoint(pathArr, openList, row, col, currPoint, end);
                    if (finded) {
                        break;
                    }
                }
                if (finded) {
                    var farr = [];
                    var tp = end.parent;
                    farr.push(end);
                    while (tp != null) {
                        farr.push(tp);
                        tp = tp.parent;
                    }
                    return farr;
                } else {
                    return null;
                }
            }
        }
        //��ɫ����
    var ColorUtil = win.ColorUtil = {
        //������ɫ����,r,g,bֵΪ0~255
        rgb: function(r, g, b) {
            var c = "#" + Number((r << 16) + (g << 8) + b).toString(16);
            return c;
        }
    }
    var PubUtil = win.PubUtil = {
        merge: function(o, n, override) {
            var o = o || {},
                n = n || {};
            for (p in n) {
                if (n.hasOwnProperty(p) && (!o.hasOwnProperty(p) || override))
                    o[p] = n[p];
            }
            return o;
        }
    }
}(window))