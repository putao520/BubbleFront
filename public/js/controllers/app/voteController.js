'use strict';
bubbleFrame.register('voteController', function ($scope, bubble) {
    $scope.tableControl = {
        title: [{ name: "投票详情", key: "vote", width: 90 }],
        html: [""],
        onClick: function (key, v) {
            bubble.customModal("voteInfoModal.html", "voteInfoController", "", v, function (v) {

            });
        },
        onRender: function (v, k) {
            // console.log(v, k);
            if (!(k.vote instanceof Array && k.vote.length)) {
                v[0] = '<b class="badge bg-success">0</b>';
                return v;
            }
            var c = 0;
            for (var i = 0; i < k.vote.length; i++) {
                c += parseInt(typeof k.vote[i] === 'string' ? JSON.parse(k.vote[i]).count : k.vote[i].count);
            }
            v[0] = '<b class="badge bg-success">' + c + '</b>';
            return v;
        }
    }
    $scope.$on('vote_add_success', function (e, data) {
        console.log(e);
        console.log(data);
    })
});

bubbleFrame.register('voteInfoController', function ($scope, bubble, $modalInstance, items) {
    $scope.data = typeof items.vote === 'string' ? JSON.parse(items.vote) : JSON.parse(JSON.stringify(items.vote));
    $scope.colors = ["info", "primary", "warning"];
    $scope.count = 0;
    for (var i = 0; i < $scope.data.length; i++) {
        var t = $scope.data[i] = typeof $scope.data[i] == 'string' ? JSON.parse($scope.data[i]) : $scope.data[i];
        $scope.count += parseInt(t.count);
    }

    for (var i = 0; i < $scope.data.length; i++) {
        var t = $scope.data[i] = typeof $scope.data[i] == 'string' ? JSON.parse($scope.data[i]) : $scope.data[i];
        t.precent = parseFloat($scope.count == 0 ? 0 : t.count / $scope.count * 100);
        t.precent = t.precent.toFixed(2);
    }

    $scope.cancel = function (e) {
        $modalInstance.dismiss('cancel');
    }
});

bubbleFrame.register('voteCreate', function ($scope, $modalInstance, items, bubble) {
    $scope.value = {
        starttime: new Date(),
        endtime: new Date()
    };
    for (var tmp in items.scope.selectPar) {
        $scope.value[tmp] = items.scope.selectPar[tmp];
    }

    $scope.value.ismulti = "0";
    $scope.value.vote = [{ itemName: "", count: "0", itemid: "" }];

    $scope.addItem = function () {
        $scope.value.vote.length < 5 && $scope.value.vote.push({ itemName: "", count: "0", itemid: "" });
    }

    $scope.removeItem = function (i) {
        $scope.value.vote.length > 1 && $scope.value.vote.splice(i, 1);
    }

    var check = function () {
        for (var i = 0; i < $scope.value.vote.length; i++) {
            var t = $scope.value.vote[i];
            if (t.itemName == "")
                return false;
        }
        return true;
    }

    $scope.ok = function (e) {
        $(e.currentTarget).addClass("data-loading");
        if (!check()) {
            swal("不允许空投票项");
            return;
        }
        if (!$scope.value.starttime) {
            swal('开始时间不能为空')
            return
        }
        if (!$scope.value.endtime) {
            swal('结束时间不能为空')
            return
        }
        // starttime
        var endtime = new Date($scope.value.endtime)

        var starttime = new Date($scope.value.starttime)

        $scope.value.endtime = endtime.getFullYear() + '-' + (endtime.getMonth() + 1) + '-' + endtime.getDate() + ' ' + endtime.getHours() + ':' + endtime.getMinutes()
        $scope.value.starttime = starttime.getFullYear() + '-' + (starttime.getMonth() + 1) + '-' + starttime.getDate() + ' ' + starttime.getHours() + ':' + starttime.getMinutes()
        $scope.value.vote.forEach(function (o, i) {
            o.itemid = i + 1
        })

        bubble._call("vote.add", $scope.value).success(function (v) {
            if (v.errorcode) {
                swal("添加失败");
                $modalInstance.dismiss('cancel');
            } else {
                // 修复添加后数据不显示的问题
                $modalInstance.close(v.message ? v.message : v);
            }
        })
    }

    $scope.cancel = function (e) {
        $modalInstance.dismiss('cancel');
    }
});
