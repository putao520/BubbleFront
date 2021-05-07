bubbleFrame.register('statementController', function ($scope, bubble, $timeout, $compile) {
    var pickers = [];
    var Content = function () {
        $scope.stime1 = Date.parse(new Date()) - 30 * 24 * 60 * 60 * 1000;
        $scope.etime1 = Date.parse(new Date());
        $scope.type1 = "";
        $scope.changetype1 = function (v) {
            $scope.type1 = v;
            var time = getTime();
            $scope.stime1 = time[0];
            $scope.etime1 = time[1];
            getByTime(time[0], time[1]);
        }

        var getTime = function (type) {
            type = type !== undefined ? type : $scope.type1;
            switch (type) {
                case "month":
                    return [Date.parse(moment().format("YYYY-M-01 0:0:0")), moment(Date.parse(moment().format("YYYY-M-01 0:0:0"))).add(1, 'M').valueOf()];
                    break;
                case "day":
                    return [Date.parse(moment().format("YYYY-M-D 0:0:0")), moment(Date.parse(moment().format("YYYY-M-D 0:0:0"))).add(1, 'd').valueOf()];
                    break;
                case "year":
                    return [Date.parse(moment().format("YYYY-01-01 0:0:0")), moment(Date.parse(moment().format("YYYY-01-01 0:0:0"))).add(1, 'y').valueOf()];
                    break;
            }
        }

        $scope.searchContent = function () {
            $scope.type1 = "";
            var s = Date.parse(new Date($scope.stime1));
            var e = Date.parse(new Date($scope.etime1));
            if (!s) {
                swal("请选择开始时间");
                return;
            }
            if (!s) {
                swal("请选择结束时间");
                return;
            }
            if (s > e) {
                swal("开始时间不可大于结束时间");
                return;
            }
            getByTime(s, e);
        }
        var getByTime = function (s, e) {
            $(".contentbatchMask").fadeIn(200);
            bubble._call("content.outReport", s, e).success(function (v) {
                initCitem(v, true);
                $(".contentbatchMask").fadeOut(200);
            });
        }
        var box = $(".charts1");
        // box.height(box.width() / 2);
        // echarts.init(box[0]).setOption(option);
        // bubble._call("content.total", window.localStorage.siteid).success(function (v) {
        //     initCitem(v, true);
        // });

        var initCitemChildren = function (v, s, y, h) {
            for (var i = 0; i < v.length; i++) {
                if (!v[i].count) {
                    continue;
                }
                h += 2;
                y.unshift(v[i].name);
                s[0].data.unshift(v[i].count);
                s[1].data.unshift(v[i].checking);
                s[2].data.unshift(v[i].checked);
                s[3].data.unshift(v[i].uncheck);
                s[4].data.unshift(v[i].clickcount);
            }
            return h;
        }

        $scope.path = [];

        $scope.returnS = function () {
            initCitem($scope.path.pop(), true);
        }

        var getOption = function (v) {
            return {
                tooltip: {
                    trigger: 'axis',
                    axisPointer: {
                        type: 'shadow'
                    },
                    textStyle: {
                        fontSize: 16
                    }
                },
                legend: {
                    data: ['总计', '待审核', '审核通过', '审核拒绝', '阅读量'],
                    textStyle: {
                        fontSize: 18
                    },
                    x: 'center'
                },
                grid: {
                    left: '3%',
                    right: '4%',
                    bottom: '3%',
                    top: 60,
                    containLabel: true
                },
                xAxis: {
                    type: 'value',
                    boundaryGap: [0, 0.01]
                },
                yAxis: {
                    type: 'category',
                    data: v.yAxis,
                    axisLabel: {
                        textStyle: {
                            fontSize: 14,
                        }
                    }
                },
                series: v.series
            }
        }

        $scope.tabledata = [];

        var initCitem = function (v, s) {
            $scope.tabledata = [];
            var f = v;
            var tmpbox = box;
            var hcount = 0;
            var ccall = [];
            var series = [
                {
                    name: '文章发布量', type: 'bar', data: [], label: {
                        normal: {
                            position: 'inside',
                            show: true, formatter: function (data) {
                                return "发布量: " + data.data.value + "   最后更新时间:" + (v[v.length - data.dataIndex - 1].last_publish_time == 0 ? "暂无" : moment(v[v.length - data.dataIndex - 1].last_publish_time).format("YYYY-M-01"));
                            }, position: "right"
                        }
                    }
                }
            ];
            var yAxis = [];
            // v = v.children;

            if (!s) {
                renderCharts(tmpbox[0], 1, f);
            }
            var color = ["#409EFF", "#c23531"];

            for (var i = 0; i < v.length; i++) {
                $scope.tabledata.push(v[i]);
                v[i].last_publish_time = v[i].last_publish_time == 0 ? "暂无" : moment(v[i].last_publish_time).format("YYYY-M-D HH:mm:ss");
                series[0].data.push({ value: v[i].publish_total, itemStyle: { normal: { barBorderRadius: [0, 5, 5, 0], color: color[i % 2] } } });
            }
            return;

            tmpbox.height(3000);
            tmpbox.css("overflow", "hidden");
            renderCharts(tmpbox[0], 2, { series: series, yAxis: yAxis });
        }

        var renderCharts = function (o, type, v) {
            var rs = echarts.init(o);
            rs.off("click");
            rs.setOption(getOption(v));
            return rs;
        }

        bubble._call("content.outReport", getTime("month")[0], new Date().valueOf()).success(function (v) {
            initCitem(v, true);
        });

        // new Timepicker(box.parent());
    }

    var Report = function () {
        $scope.stime2 = Date.parse(new Date()) - 30 * 24 * 60 * 60 * 1000;
        $scope.etime2 = Date.parse(new Date());
        $scope.type2 = "";
        $scope.schange2 = function (v) {
            $scope.stime2
        }
        $scope.echange2 = function (v) {
            $scope.etime2
        }
        var box = $(".charts1");
        box.height(box.width() / 2);
        $scope.changetype2 = function (v) {
            $scope.type2 = v;
            $scope.stime2 = "";
            $scope.etime2 = "";
            switch (v) {
                case "month":
                    getDateByTime($scope.stime2 = Date.parse(moment().subtract(1, "months")), $scope.etime2 = Date.parse(new Date()));

                    break;
                case "week":
                    getDateByTime($scope.stime2 = Date.parse(moment().subtract(1, "weeks")), $scope.etime2 = Date.parse(new Date()));
                    break;
                case "day":
                    getDateByTime($scope.stime2 = Date.parse(moment().subtract(1, "days")), $scope.etime2 = Date.parse(new Date()));
                    break;
            }
        }

        $scope.searchRepoer = function () {
            $scope.type2 = "";
            var s = Date.parse(new Date($scope.stime2));
            var e = Date.parse(new Date($scope.etime2));
            if (!s) {
                swal("请选择开始时间");
                return;
            }
            if (!s) {
                swal("请选择结束时间");
                return;
            }
            if (s > e) {
                swal("开始时间不可大于结束时间");
                return;
            }
            getDateByTime(s, e);
        }

        // var getDate = function () {
        //     bubble._call("statistics.count", "undefined", "suggest_" + bubble.getAppId(), []).success(function (v) {
        //         $scope.suggest = v.record.totalSize;
        //     });
        //     bubble._call("statistics.count", "undefined", "reportInfo_" + bubble.getAppId(), []).success(function (v) {
        //         $scope.report = v.record.totalSize;
        //     });
        // }

        var getDateByTime = function (s, e) {
            $(".contentbatchMask").fadeIn(200);
            bubble._call("statistics.count", "undefined", "suggest_" + bubble.getAppId(), [{ field: "time", logic: ">=", value: s }, { field: "time", logic: "<=", value: e }]).success(function (v) {
                $(".contentbatchMask").fadeOut(200);
                $scope.suggest = v.record.totalSize;
            });
            bubble._call("statistics.count", "undefined", "reportInfo_" + bubble.getAppId(), [{ field: "time", logic: ">=", value: s }, { field: "time", logic: "<=", value: e }]).success(function (v) {
                $(".contentbatchMask").fadeOut(200);
                $scope.report = v.record.totalSize;
            });
        }

        // getDate();
    }

    // var Timepicker = function (obj) {
    //     $scope["timer" + pickers.length] = this;
    //     var tpl = '<div class="datebox"> <form class="form-inline"> <div class="form-group"> <datetimepicker type="text" value="timer' + pickers.length + '.svalue" ng-change="timer' + pickers.length + '.onchange(\'start\')" class="form-control" placeholder="开始时间"> </datetimepicker> </div> 至 <div class="form-group"> <datetimepicker type="text" value="timer' + pickers.length + '.evalue" ng-change="timer' + pickers.length + '.onchange(\'end\')" class="form-control" placeholder="结束时间"> </datetimepicker> </div> <button type="submit" class="btn btn-sm btn-primary">确定</button> </form> </div>';
    //     this.svalue = "";
    //     this.evalue = "";
    //     obj.prepend($compile(tpl)($scope));
    //     pickers.push($scope["timer" + pickers.length]);

    //     this.onchange = function (v) {

    //     }
    // }

    $timeout(function () {
        new Content();
        new Report();
    });
});