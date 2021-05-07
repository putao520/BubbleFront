bubbleFrame.register('dashboardController', function ($scope, bubble, $state) {
    var weekCh = { Monday: "星期一", Tuesday: "星期二", Wednesday: "星期三", Thursday: "星期四", Friday: "星期五", Saturday: "星期六", Sunday: "星期日" };
    $scope.report = 0;
    $scope.suggest = 0;
    $scope.column = 0;
    $scope.logs = [];

    $scope.isShowPublish = window.localStorage.getItem('siteid') === '59301f751a4769cbf5b0a113'

    $scope.content_count = 1; //文章总数
    $scope.content_checked = 5; //已审核
    $scope.content_checking = 20;//待审核

    $scope.task = [];
    $scope.task = $scope.check;
    $scope.colors = ["warning", "info", "primary", "light"];

    //栏目更新
    bubble._call("task.difft", 1, 1000).success(function (v) {
        $scope.column = v.data.length;
        $scope.columnData = v.data;
        for (var i = 0; i < v.data.length; i++) {
            v.data[i].time = "请" + (v.data[i].restTime ? "于" + new Date(parseInt(v.data[i].restTime)).Format("dd天hh小时mm分钟ss秒") + "内更新" : "立即更新");
        }
    });

    //错链死链
    //全站错链死链
    bubble._call('content.getAllErrorLinks', localStorage.getItem('siteid')).success(function (v) {
        console.log(v);
        $scope.allDeadLink = v.data
    })


    //公开公示错死链
    bubble._call('content.getChannelErrorLinks', localStorage.getItem('siteid'), '59cb193e3342d919a057a507').success(function (v) {
        console.log(v);
        $scope.pubDeadLink = v.data
    })

    //公开公示错死链
    bubble._call('logs.page', 1, 5).success(function (v) {
        $scope.logs = v.data;
        for (var i = 0; i < $scope.logs.length; i++) {
            $scope.logs[i].time = new Date($scope.logs[i].time).Format("yyyy-MM-dd hh:mm");
        }
    })

    /*    bubble._call("task.check", 1, 1000).success(function (v) {
            $scope.check = v.data;
        });*/

    //待回复留言
    // bubble._call("count.group", undefined, "message_13", [{ field: "replynum", logic: ">", value: 0 }], "messageId", "count", "messageContent", "0").success(function (v) {
    //     var data = v.record.data;
    //     var count = 0;
    //     for (var i = 0; i < data.length; i++) {
    //         count += data[i].count;
    //     }
    //     $scope.message = count;
    // });

    //待处理咨询
    // bubble._call("count.group", undefined, "suggest_13", "[]", "content", "count", "name", "0").success(function (v) {
    //     var data = v.record.data;
    //     var count = 0;
    //     for (var i = 0; i < data.length; i++) {
    //         count += data[i].count;
    //     }
    //     $scope.suggest = count;
    // });
    bubble._call("suggest.count").success(function (v) {
        $scope.suggest = v.message;
    });

    //待处理举报
    // bubble._call("count.group", undefined, "reportInfo_13", "[]", "refusetime", "count", "time", "0").success(function (v) {
    //     var data = v.record.data;
    //     var count = 0;
    //     for (var i = 0; i < data.length; i++) {
    //         count += data[i].count;
    //     }
    //     $scope.report = count;
    // });
    bubble._call("report.reportCount").success(function (v) {
        $scope.report = v.message;
    })

    var getByTime = function (s, e) {
        bubble._call("content.totaltime", window.localStorage.siteid, s, e).success(function (v) {
            var data = v[window.localStorage.siteid];
            data.count ? $scope.content_count = data.count : '';
            data.checked ? $scope.content_checked = data.checked : '';
            data.checking ? $scope.content_checking = data.checking : '';

        });
    };
    //一天时间段
    var s = new Date().setHours(0, 0, 0, 0);
    var e = new Date().setHours(24, 0, 0, 0);

    getByTime(s, e);

    //模拟数据
    $scope.content = [[1, 10], [2, 20], [3, 30], [4, 40], [5, 20], [6, 10], [7, 15]];
    $scope.register = [[1, 2], [2, 10], [3, 20], [4, 5], [5, 20], [6, 3], [7, 9]];
    $scope.message = [[1, 5], [2, 20], [3, 10], [4, 20], [5, 30], [6, 0], [7, 15]];
    //控制是否跳转
    $scope.goLink = function (who, num) {
        switch (who) {
            case 'update':
                if (num) {
                    $state.go("app.content", { type: 1 });
                }
                break;
            case 'deal':
                if (num) {
                    $state.go("app.consult", { type: 1 });
                }
                break;
            case 'report':
                if (num) {
                    $state.go("app.content", { type: 0 });
                }
                break;

        }

    };

    $scope.week = [];

    $scope.publishCount = [[1, 10], [2, 20], [3, 30], [4, 40], [5, 20], [6, 10], [7, 15]];
    $scope.messageCount = [[1, 10], [2, 20], [3, 30], [4, 40], [5, 20], [6, 10], [7, 15]];
    $scope.contentCount = [[1, 10], [2, 20], [3, 30], [4, 40], [5, 20], [6, 10], [7, 15]];

    var messageLoopnum = 7;
    var contentLoopnum = 7;

    for (var i = 0; i < 7; i++) {
        $scope.week.push([i + 1, weekCh[moment().subtract(7 - i, 'day').format('dddd')]]);
        (function (i) {
            bubble._call("message.count", [{ field: "time", logic: "<", value: moment().subtract(i, 'day').valueOf() }, { field: "time", logic: ">", value: moment().subtract(i + 1, 'day').valueOf() }]).success(function (v) {
                $scope.messageCount[i][1] = v.message;
                if (--messageLoopnum == 0) {
                    $scope.messageReady = true;
                }
            });
            bubble._call("content.count", [{ field: "time", logic: "<", value: moment().subtract(i, 'day').valueOf() }, { field: "time", logic: ">", value: moment().subtract(i + 1, 'day').valueOf() }]).success(function (v) {
                $scope.contentCount[i][1] = v.message;
                if (--contentLoopnum == 0) {
                    $scope.contentReady = true;
                }
            });
        })(i)
    }



});
