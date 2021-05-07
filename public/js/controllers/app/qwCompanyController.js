(function () {
    var reload = function () { };
    bubbleFrame.register('qwCompanyController', function ($scope, bubble, $timeout, $localStorage, $rootScope) {
        /**
         * 站群编辑层级部分
         */
        $scope.control = {
            create: function (o, fn) {
                bubble.customModal("qwCreate.html", "qwCreateController", "lg", { wbgid: window.localStorage.sitewbgid, fatherid: o[0]._id }, function (rs) {
                    rs && fn(rs);
                    $timeout(function () {
                        $(".dd-handle").html("");
                    })
                });
            },
            createRoot: function (fn) {
                bubble.customModal("qwCreate.html", "qwCreateController", "lg", { wbgid: window.localStorage.sitewbgid }, function (rs) {
                    rs && fn(rs);
                    $timeout(function () {
                        $(".dd-handle").html("");
                    })
                });
            },
            edit: function (o, fn) {
                reload = function () {
                    fn();
                    $timeout(function () {
                        $(".dd-handle").html("");
                    })
                };
                bubble.customModal("companyCreate.html", "qwEditModalController", "lg", o[0], function (rs) {
                    // rs && fn(rs);
                });
            },
            move: function (list, fn) {
                if( window.localStorage.siteid == undefined){
                    return;
                }
                if( window.localStorage.siteid == list[0][1] ){
                    return;
                }
                $(".contentbatchMask").fadeIn(200);
                bubble._call("site.update", list[0][0]._id, { fatherid: list[0][1] }).success(function (rs) {
                    $(".contentbatchMask").fadeOut(200);
                    if (!rs.errorcode)
                        initData();
                    else
                        swal("修改失败");
                });
            },
            delete: function (ids, fn) {
                window.swal({
                    title: "确定要删除该项吗?",
                    text: "该项会被立即删除且无法撤销该操作",
                    icon: "warning",
                    buttons: {
                        cancel: "取消",
                        defeat: "删除",
                    },
                }).then(
                    function (s) {
                        if (s) {
                            bubble._call("site.batchDelete", ids).success(function (rs) {
                                fn(rs);
                                bubble._call("user.updateUserInfo", 0).success(function (v) {
                                    $localStorage.logininfo = JSON.stringify(v);
                                    window.logininfo = v;
                                    $rootScope.logininfo = v;
                                    window.localStorage.sitename = v.webinfo[0].wbname;
                                    window.localStorage.siteid = v.webinfo[0].wbid;
                                    window.localStorage.sitewbgid = v.webinfo[0].wbgid;
                                    window.Site.initChildren(bubble.getTreeData(window.logininfo.webinfo, "wbid", undefined, undefined, true));
                                });
                                $timeout(function () {
                                    $(".dd-handle").html("");
                                })
                            });
                        }
                    });
            },
        }

        $scope.treebtn = [
            {
                onClick: function (v) {

                },
                onRender: function (tpl, v) {
                    return v.vwState && v.vwState == 1 ? '<a title="虚站点"><i class="fa fa-link m-r-xs text-info"></i></a>' : '<a></a>';
                }
            },
            {
                onClick: function (v) {
                    bubble.customModal("siteDataMove.html", "siteDataMoveController", "lg", { list: $scope.gropuList, data: v[0], obj: $(".dd-item[data-sid='" + v[0]._id + "']") }, function (rs) {

                    });
                },
                onRender: function (tpl, v) {
                    return '<a title="数据迁移"><i class="fa fa-link m-r-xs text-info"></i></a>';
                }
            }
        ]

        var filterGroup = function(input){
            // 过滤已删除对象
            if( input.length > 0 ){
                for(var o in input){
                    var item = input[o];
                    if( item.hasOwnProperty("children") ){
                        filterGroup(item["children"]);
                    }
                    if( parseInt(item["isdelete"]) === 1 ){
                        item["title"] += "[已删除]";
                    }
                }
            }
        }

        var initData = function () {
            $scope.shower = false;
            bubble._call("site.pageBy", 1, 1000, { "wbgid": window.localStorage.sitewbgid }).success(function (v) {
                v = v.data;
                $scope.gropuList = v.length ? bubble.getTreeData(v, "_id", true, null, true) : [];
                filterGroup($scope.gropuList);
                $timeout(function () {
                    $scope.shower = true;
                    $timeout(function () {
                        $(".ng-pristine .panel-heading.font-bold button:eq(1)").hide();
                        $(".dd-handle").html("");
                    })
                });
            });
        }
        initData();
    });

    bubbleFrame.register("siteDataMoveController", function ($scope, $modalInstance, items, bubble, $timeout) {
        $scope.value = { type: "2", code: "" };
        var current = "";
        var getHtml = function (v, c) {
            var rs = "";
            for (var i = 0; i < v.length; i++) {
                if (v[i]._id == items.data._id) {
                    continue;
                } else {
                    rs += "<li id='" + v[i]._id + "'>" + v[i].title + "</li>" + (v[i].children ? getHtml(v[i].children, true) : "");
                }
            }

            return !c ? "<ul style='padding-left: 0;'><li>顶层网站</li><ul>" + rs + "</ul></ul>" : "<ul>" + rs + "</ul>";
        }

        $timeout(function () {
            $(".siteDataMoveBox").html(getHtml(items.list));
            $(".siteDataMoveBox li").click(function () {
                current = this.id ? this.id : "0";
                $(".siteDataMoveBox li").removeClass("cur");
                $(this).addClass("cur");
            });
        });

        $scope.ok = function (e) {
            if ($scope.value.type == "2" && current == "") {
                swal("请选择目标网站");
                return;
            }
            if ($scope.value.type == "1" && $scope.value.code == "") {
                swal("请输入授权码");
                return;
            }
            $(e.currentTarget).addClass("data-loading");
            if ($scope.value.type == "1") {
                bubble._call("site.transferWebSite", items.data._id, $scope.value.code).success(function (v) {
                    if (!v.errorcode) {
                        swal(v.message);
                        items.obj.remove();
                        $modalInstance.close(v);
                    } else {
                        swal("设置失败" + v.message);
                    }
                    $(e.currentTarget).removeClass("data-loading");
                });
            } else {
                bubble._call("site.update", items.data._id, { fatherid: current }).success(function (v) {
                    if (!v.errorcode) {
                        $modalInstance.close(v);
                    } else {
                        swal("设置失败");
                    }
                    $(e.currentTarget).removeClass("data-loading");
                });
            }
        };

        $scope.cancel = function () {
            $modalInstance.dismiss('cancel');
        };
    });

    bubbleFrame.register("qwEditModalController", function ($scope, $modalInstance, items, bubble) {
        $scope.value = items;
        $scope.ok = function (e) {
            $(e.currentTarget).addClass("data-loading");
            bubble._call("site.update", $scope.value._id, { title: $scope.value.title, desp: $scope.value.desp }).success(function (v) {
                if (!v.errorcode) {
                    $modalInstance.close(v);
                } else {
                    swal("添加失败");
                }
                $(e.currentTarget).removeClass("data-loading");
            });
        };

        $scope.cancel = function () {
            $modalInstance.dismiss('cancel');
        };
    })

    bubbleFrame.register("qwCreateController", function (bubble, items, $scope, $modalInstance, $localStorage, $rootScope) {
        $scope.value = items;
        var box = "";

        $scope.tree = {};

        var initSite = function () {
            bubble._call("site.getall", 1, 1000, window.localStorage.siteid).success(function (v) {
                $scope.column_tree_data = bubble.getTreeData(v.data, "_id", false, function (v) {
                    v.label = v.title;
                });
            });
        }

        $scope.treeSelect = function (v) {
            $scope.value.linkId = v._id;
            $scope.value.title = "";
            $scope.value.desp = "";
            // $(".qwCompany-loading").fadeIn(200);
            // bubble._call("site.add", $scope.value).success(function (v) {
            //     if (!v.errorcode) {
            //         $modalInstance.close(v);
            //     } else {
            //         swal("添加失败");
            //         $scope.value.type = "1";
            //         $(".qwCompany-loading").fadeOut(200);
            //     }
            // });
        }

        $scope.typeChange = function () {
            if ($scope.value.type == 1) {
                box = $(".qwCompany-sitebox")
                $(".qwCompany-infobox").hide();
                box.fadeIn(200);
                initSite();
            } else {
                $(".qwCompany-infobox").fadeIn(200);
                box.hide();
            }
        }

        var rs = undefined;
        $scope.code = "";
        $scope.codevisible = false;
        $scope.defaultUserinfo = "";

        $scope.ok = function (e) {
            if ($scope.value.type == 1) {
                return;
            }
            bubble.toggleModalBtnLoading(e, true);
            $scope.value.linkId = "0";
            bubble._call("site.add", $scope.value).success(function (v) {
                $(e.currentTarget).prev().html("关闭");
                $(e.currentTarget).removeClass("data-loading").hide();
                if (!v.errorcode) {
                    $scope.defaultUserinfo = v.record.message;
                    v.title = $scope.value.title;
                    rs = v.record.data;
                    bubble._call("site.getExportAccessCode", v.record.data._id).success(function (v) {
                        $scope.code = v.message;
                    });
                    bubble._call("user.updateUserInfo", 0).success(function (v) {
                        $localStorage.logininfo = JSON.stringify(v);
                        window.logininfo = v;
                        $rootScope.logininfo = v;
                        window.localStorage.sitename = v.webinfo[0].wbname;
                        window.localStorage.siteid = v.webinfo[0].wbid;
                        window.localStorage.sitewbgid = v.webinfo[0].wbgid;
                        window.Site.initChildren(bubble.getTreeData(window.logininfo.webinfo, "wbid", undefined, undefined, true));
                    });
                    swal("添加成功");
                } else {
                    bubble.toggleModalBtnLoading(e, false);
                    swal("添加失败");
                }
                reload();
            });
        }

        $scope.showcode = function () {
            $scope.codevisible = true;
        }

        $scope.cancel = function (e) {
            rs ? $modalInstance.close(rs) : $modalInstance.dismiss('cancel');
            $(e.currentTarget).html("取消").next().show();
        }
    });
})();
