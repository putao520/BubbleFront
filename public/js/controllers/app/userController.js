bubbleFrame.register('userController', function ($scope, $timeout, bubble, $http, $modal) {
    var currentUser = null;
    $scope.users = [];
    $scope.visible = ["name", "mobphone"];
    $scope.data = [];
    $scope.isajax = false;
    $scope.userId = '';
    $scope.tableControl = {
        title: [{ name: "选择站点", key: "sl", width: 90 }],
        html: ['<a class="btn btn-sm m-t-n-xs"><i class="fa fa-navicon"></i></a>'],
        onClick: function (key, v) {
            window.Site.show("choice");
            currentUser = v;
        },
        onColumnClick: function (key, v) {
            // userId=v.ugid;
            // if (key == "id") {
            //     bubble.customModal("columnAuthModal.html", "columnAuthController", "lg", {
            //         id: v.id
            //     }, function (v) {
            //         $scope.tableControl.reload();
            //     });
            // }
        }
    }

    window.siteChoiceConfirm = function (t) {
        bubble._call("user.update", currentUser._id, {wbid: t.wbid}).success(function (v) {
            v.errorcode ? swal(v.message) : swal("修改成功");
        });
        window.Site.hide();
        return true;
    }

    $scope.currentUsergroup = "all";
    $scope.update = true;
    $scope.usergroup = undefined;
    $scope.search = undefined;

    $scope.groupchange = function () {
        $scope.update = false;
        $timeout(function () {
            if ($("#usergroup").val() == "all") {
                $scope.search = undefined;
            } else {
                $scope.search = [{ field: "ugid", logic: "=", value: $("#usergroup").val() }];
            }
            $scope.tableControl.reload();
            $timeout(function () {
                $scope.update = true;
            });
        });
    }

    bubble._call("userGroup.page", 1, 1000).success(function (v) {
        $scope.usergroup = v.data;
        $scope.usergroup.unshift({ name: "全部用户", _id: "all" });
    });

    $scope.closeInfo = function () {
        info.hide();
    }

    $scope.control = {

    }

    var Info = function () {
        var _this = this;
        var box = $(".user-record-wrap");
        var listbox = box.find(".item-wrap");

        this.init = function () {
            this.initEvent();
            return this;
        }

        this.initEvent = function () {
            box.unbind("click").click(function (e) {
                if (e.target === e.currentTarget) {
                    box.fadeOut(200);
                }
            });
        }

        this.show = function (v) {
            this.getData(v);
            box.fadeIn(200);
        }

        this.hide = function () {
            box.fadeOut(200);
        }

        this.getData = function (v) {
            $scope.isajax = true;
            var count = 0;
            bubble._call("count.group", "undefined", "VisitRecord_13", [{ "field": "uid", "logic": "==", "value": v }], "uid", "count", "oid", "0").success(function (v) {
                $scope.data = v.record.data;
                $scope.data.forEach(function (x, i) {
                    bubble._call("content.page", 1, 10, [{ "field": "_id", "logic": "==", "value": x._id }]).success(function (rs) {
                        $scope.data[i].content = rs.data[0] ? rs.data[0] : "";
                        if (++count == $scope.data.length) {
                            $scope.isajax = false;
                        }
                    })
                });
            });
        }
    }
    var info = new Info().init();
});

//文章移动栏目控制器
bubbleFrame.register("columnAuthController", function (bubble, items, $scope, $modalInstance, $timeout) {
    var current = "";
    //阻止展开收起触发select
    var stop = function () {
        $timeout(function () {
            $(".tree-icon").length ? $(".tree-icon").click(function (e) {
                e.stopPropagation();
            }) : stop();
        }, 20);
    };
    stop();

    $scope.data = [];
    $scope.initlist = "59cb1d103342d91c406a11a3,59cf17eead2c0814dc662f5a";

    var selectList = [];

    $scope.onSelect = function (v) {
        selectList = v;
    };
    $scope.tree = {};

    $scope.ok = function (e) {
        // var rs = selectList.map(function (v) { return v}).join(",");
        // var obj=new Object();
        // obj.data=selectList;
        var array = [];
        selectList.map(((item, index) => { array.push(Object.assign({}, item, { "userId": userId })) }))
        console.log(array)
        array = JSON.stringify(array);
        console.log(array)
        bubble.toggleModalBtnLoading(e, true);
        $modalInstance.close();
        bubble._call("userPermissions.permissions", array).success(function (v) {
            if (!v.errorcode) {
                $modalInstance.close();
            } else {
                bubble.toggleModalBtnLoading(e, false);
                // swal("调用失败");
            }
        });
    };
    $scope.cancel = function (e) {
        $modalInstance.dismiss('cancel');
    }

    bubble._call("column.page", 1, 5000).success(function (v) {
        $scope.data = bubble.getTreeData(v.data, "_id", false, function (v) {
            v.label = v.name;
        });
    });
});
