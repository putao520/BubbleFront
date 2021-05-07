bubbleFrame.register('columnController', function ($scope, bubble, $timeout) {
    var localMessage = JSON.parse(localStorage.getItem("ngStorage-logininfo"));
    $scope.ugid = JSON.parse(localMessage).ugid;
    $scope.datas = bubble.JsonArray.eq("userId", $scope.ugid).getJsonArray()
    var currentColumn = null;
    $scope.columnPar = { id: 123 }
    $scope.callback = {};
    $scope.siteconfig = {
        title: "栏目关联",
        type: "column",
        multiple: true,
        items: [],
        //组件会注入其方法至该对象
        method: {},
        onConfirm: function (v) {
            v.forEach(function (x) {
                delete x.$$hashKey;
            });
            currentColumn.connColumn = JSON.stringify(v);
            currentColumn = JSON.parse(JSON.stringify(currentColumn));
            delete currentColumn.children;
            bubble._call("column.update", currentColumn._id, currentColumn).success(function (v) {

            });
        }
    }
    $scope.btn = [
        {
            name: "新建根栏目",
            onClick: function () {
                bubble.customModal("columnCreate.html", "columnCreateController", "lg", { value: { fatherid: 0, sort: 1, type: "1", wbid: window.localStorage.siteid, contentType: "0", timediff: 86400000, isreview: "0", slevel: "0" }, thumb: $scope.columnThumb }, function (rs) {
                    rs && $scope.callback.addRoot(rs);
                });
            }

        }
    ];
    $scope.itembtn = [
        {
            name: "新建子栏目",
            onClick: function (v) {
                bubble.customModal("columnCreate.html", "columnCreateController", "lg", { value: { fatherid: v._id, sort: 1, type: "1", wbid: window.localStorage.siteid, contentType: "0", timediff: 86400000, isreview: "0", slevel: "0" }, thumb: $scope.columnThumb }, function (rs) {
                    rs && $scope.callback.addItem(rs);
                });
            }
        },
        {
            name: "编辑",
            onClick: function (v) {
                v.isreview == undefined && (v.isreview = "0");
                v.slevel == undefined && (v.slevel = "0");
                v.slevel += "";
                v.Contant = false;
                bubble.customModal("columnCreate.html", "columnEditController", "lg", { value: v, thumb: $scope.columnThumb }, function (rs) {
                    rs && $scope.callback.update(rs, v);
                });
            }
        },
        {
            name: function (v) {
                return v.linkOgid && v.linkOgid != "" && v.linkOgid != "0" ? "<span class='text-info'>更该绑定</span>" : "绑定本站栏目";
            },
            onClick: function (v, BtnTextChange) {
                bubble.customModal("columnBind.html", "columnBindController", "lg", { list: $scope.gropuList, curr: v }, function (rs) {
                    v.linkOgid = rs.ids;
                    v.MixMode = rs.mode;
                    $scope.callback.update(v);
                    BtnTextChange();
                });
            }
        },
        {
            name: "批量文章移动",
            onClick: function (v, BtnTextChange) {
                bubble.customModal("articleBind.html", "articleBindController", "lg", { list: $scope.gropuList, curr: v }, function (rs) {

                });
            }
        },
        {
            name: function (v) {
                return v.userId && v.userId != "" ? "<span class='text-info'>更该管理员</span>" : "绑定管理员";
            },
            onClick: function (v, BtnTextChange) {
                bubble.customModal("administratorBind.html", "administratorController", "lg", v, function (rs) {
                    if (rs) {
                        v.userId = rs;
                        $scope.callback.update(v);
                        BtnTextChange();
                    }
                });
            }
        },
        {
            name: "删除",
            onClick: function (v) {
                swal({
                    title: "确定要删除该栏目吗?",
                    text: "栏目会被立即删除且子栏目也会一并删除",
                    icon: "warning",
                    buttons: {
                        cancel: "取消",
                        defeat: "删除",
                    },
                }).then(
                    function (s) {
                        if (s) {
                            bubble._call("column.delete", v._id).success(function (rs) {
                                if (!rs.errorcode) {
                                    swal("删除成功");
                                    $scope.callback.delete(v);
                                } else {
                                    swal("删除失败");
                                }
                            });
                        }
                    });
            }
        }
    ];

    // $scope.bubbleBatchAdd = function () {
    //     var wbids = [
    //         "5d3d4e68a713ab1be0ea6cbd",
    //         "5d3d4e71a713ab1be0ea6cc3",
    //         "5d3d4e7ba713ab1be0ea6cc9"
    //     ];
    //     var update = function (id, idx) {
    //         return new Promise((res, err) => {
    //             bubble._call("site.update", id, { fatherid: wbids[idx] }).success(function (v) {
    //                 if (v.errorcode == 0) {
    //                     console.log("成功");
    //                 }
    //                 res(v);
    //             });
    //         })
    //     }

    //     bubble._call("site.pageBy", 1, 1000, { fatherid: "59816b9ec6c204051c9b0c87" }).success(async function (v) {
    //         for (var i = 0; i < v.data.length; i++) {
    //             if (wbids.indexOf(v.data[i]._id) >= 0) {
    //                 continue;
    //             }
    //             if (v.data[i].title.indexOf("幼儿园") >= 0) {
    //                 await update(v.data[i]._id, 0);
    //                 continue;
    //             }
    //             if (v.data[i].title.indexOf("小学") >= 0) {
    //                 await update(v.data[i]._id, 1);
    //                 continue;
    //             }
    //             await update(v.data[i]._id, 2);
    //         }
    //     });
    // };

    // $scope.bubbleBatchAdd = function () {
    //     var wbids = [
    //         "5d3d52c9a713ab1be0ea6cd2",
    //         "5d3d52faa713ab1be0ea6cd8",
    //         "5d3d5329a713ab1be0ea6cde",
    //         "5d3d535ea713ab1be0ea6ce4",
    //         "5d3d537ea713ab1be0ea6cea",
    //         "5d3d53aba713ab1be0ea6cf0"
    //     ];
    //     var datas = [
    //         {
    //             "name": "党务公开",
    //             "children": [
    //                 {
    //                     "name": "全局工作",
    //                     "children": [
    //                         {
    //                             "name": "党组织班子成员及分工情况",
    //                         },
    //                         {
    //                             "name": "党组织年度工作计划",
    //                         },
    //                         {
    //                             "name": "党组织年度工作总结",
    //                         },
    //                         {
    //                             "name": "党风廉政建设情况",
    //                         }
    //                     ]
    //                 },
    //             ]
    //         }
    //     ];

    //     var add = function (name, fid, wbid) {
    //         var value = {
    //             "editor": "",
    //             "clickCount": 0,
    //             "isvisble": 0,
    //             "timediff": 86400000,
    //             "connColumn": "0",
    //             "sort": 0,
    //             "type": 0,
    //             "slevel": "1",
    //             "wbid": wbid,
    //             "ownid": "",
    //             "tempContent": "0",
    //             "fatherid": fid,
    //             "name": name,
    //             "contentType": "0",
    //             "tempList": "0",
    //             "editCount": 1,
    //             "isreview": "0",
    //             "TemplateList": "",
    //             "TemplateContent": "",
    //             "stisreviewate": "0"
    //         }

    //         bubble._call("column.add", value).success(function (v) {
    //             value;
    //             if (!v.errorcode) {
    //                 console.log("成功");
    //             } else {
    //                 console.log("失败," + wbid + "," + name);
    //             }
    //             ff[ff.length - 1].next(v._id);
    //         });
    //     }

    //     var fn = function* (idx, widx, data, pid) {
    //         pid = pid ? pid : "0";
    //         var cid = "";
    //         while (data[idx]) {
    //             cid = yield add(data[idx].name, pid, wbids[widx]);
    //             if (data[idx].children) {
    //                 ff.push(fn(0, widx, data[idx].children, cid));
    //                 yield ff[ff.length - 1].next(cid);
    //             }
    //             idx++;
    //             if (!data[idx] && ff.length == 1 && wbids[widx]) {
    //                 idx = 0;
    //                 widx += 1;
    //             }
    //         }
    //         ff.pop();
    //         ff[ff.length - 1].next();
    //     }

    //     var ff = [fn(0, 0, datas)];
    //     ff[ff.length - 1].next();
    // }

    $scope.columnThumb = function () {
        var key = "thumbnail";
        var currentData = "";
        $scope.modalVisible = false;
        $scope.thumbList = null;
        var uploader = null;
        $scope.modalConfirm = function () {
            $scope.modalVisible = false;
        }

        this.init = function (v) {
            currentData = JSON.parse(JSON.stringify(v));
            if (!currentData[key]) {
                currentData[key] = [];
            } else {
                currentData[key] = currentData[key].split(",");
            }
            return this;
        }

        this.getCurrentData = function () {
            return currentData[key];
        }

        this.getList = function () {
            if ($scope.thumbList) {
                return;
            }
            bubble._call("file.pageBy", 1, 1000, { isThumbnail: 1 }).success(function (v) {
                $scope.thumbList = v.data;
                for (var i = 0; i < v.data.length; i++) {
                    v.data[i].ThumbnailImage = bubble.getInterface("upload.visible") + v.data[i].ThumbnailImage;
                }
                $timeout(function () {
                    this.initUpload();
                }.bind(this));
            }.bind(this));
        }

        this.onclick = function (v) {
            var t = true;
            for (var i = 0; i < currentData[key].length; i++) {
                if (currentData[key][i] == bubble.getInterface("upload.visible") + v.filepath) {
                    t = i;
                }
            }
            if (t === true) {
                currentData[key].push(bubble.getInterface("upload.visible") + v.filepath);
                v.select = true;
            } else {
                this.remove(v, t);
            }
        }

        this.deleteThumb = function (item) {
            swal({
                title: "确定要删除吗?",
                text: "推送操作无法撤销",
                icon: "warning",
                buttons: {
                    cancel: "取消",
                    defeat: "删除",
                },
            }).then(
                function (s) {
                    if (s) {
                        bubble._call("file.batchDelete", [{ _id: item._id, size: parseInt(item.size) }]).success(function (v) {
                            if (!v.errorcode) {
                                swal("删除成功");
                                $scope.thumbList.splice($scope.thumbList.indexOf(item), 1);
                            } else {
                                swal("删除失败");
                            }
                        });
                    }
                });
        }

        this.show = function () {
            $scope.modalVisible = true;
            this.getList();
        }

        this.initUpload = function () {
            if (uploader) {
                return;
            }
            uploader = new WebUploader.Uploader({
                auto: true,
                swf: './js/modules/webuploader/Uploader.swf',
                server: bubble.getUploadServer() + "&isThumbnail=1",
                pick: '.item-uploader',
            });
            uploader.on("error", function (v, file) {
                if (v === "F_DUPLICATE") {
                    swal("该文件已上传过", file.name);
                }
            });
            uploader.on("uploadProgress", function (file, percentage) {
                $(".column-thumb-upload-process").width((percentage.toFixed(2) * 100) + "%");
            });
            uploader.on("uploadSuccess", function (file, v) {
                $scope.thumbList.unshift(v);
                v.ThumbnailImage = bubble.getInterface("upload.visible") + v.ThumbnailImage;
                $(".column-thumb-upload-process").width(0);
                bubble.updateScope($scope);
            });
        }

        this.remove = function (v, i) {
            currentData[key].splice(i, 1);
            v && (v.select = false);
        }
    };

    $scope.columnThumb = new $scope.columnThumb();
});

bubbleFrame.register("columnBindController", function (bubble, items, $scope, $modalInstance, $timeout) {
    var current = items.curr.linkOgid ? items.curr.linkOgid.split(",") : [];                       //选中栏目ID集合
    var currentId = items.curr._id;      //入口栏目ID
    $scope.isinlude = items.curr.MixMode && !isNaN(items.curr.MixMode) ? items.curr.MixMode + "" : "0";
    $timeout(function () {
        var box = $(".column-modal-tree-box");
        var initTree = function (v, l) {
            l = l ? l : 0;
            for (var i = 0; i < v.length; i++) {
                box.append('<div class="item' + (current.length && current.indexOf(v[i]._id) >= 0 ? " cur" : "") + '" style="margin-left:' + (20 * l) + 'px;" id="' + v[i]._id + '">' + v[i].name + '</div>');
                if (v[i]._id == currentId) {
                    box.find(".item:last").addClass("disabled");
                }
                if (v[i].children) {
                    initTree(v[i].children, l + 1);
                }
            }
            box.find(".item").unbind("click").click($scope.onSelect);
        }

        bubble._call("column.page", 1, 10000).success(function (v) {
            initTree(bubble.getTreeData(v.data, "_id"));
        })
    }, 20);

    $scope.onSelect = function (v) {
        if ($(this).hasClass("disabled")) {
            return;
        }
        var idx = current.indexOf(this.id);
        if (idx >= 0) {
            current.splice(idx, 1);
            $(this).removeClass("cur");
        } else {
            current.push(this.id);
            $(this).addClass("cur");
        }
    }
    $scope.tree = {};

    $scope.ok = function (e) {
        bubble.toggleModalBtnLoading(e, true);
        bubble._call("column.SetLinkOgid", currentId, current.join(","), parseInt($scope.isinlude)).success(function (v) {
            if (!v.errorcode) {
                $modalInstance.close({ ids: current.join(","), mode: parseInt($scope.isinlude) });
            } else {
                bubble.toggleModalBtnLoading(e, false);
                swal("新闻移动失败");
            }
        });
    }

    $scope.cancel = function (e) {
        $modalInstance.dismiss('cancel');
    }
});

bubbleFrame.register('articleBindController', function (bubble, items, $scope, $modalInstance, $timeout) {
    var current = items.curr.linkOgid ? items.curr.linkOgid.split(",") : '';                       //选中栏目ID集合
    var currentId = items.curr._id;      //入口栏目ID
    $scope.isinlude = items.curr.MixMode && !isNaN(items.curr.MixMode) ? items.curr.MixMode + "" : "0";
    var webId = window.localStorage.siteid;
    $timeout(function () {
        var box = $(".article-modal-tree-box");
        var initTree = function (v, l) {
            l = l ? l : 0;
            for (var i = 0; i < v.length; i++) {
                box.append('<div class="articleItem' + (current.length && current.indexOf(v[i]._id) >= 0 ? " curr" : "") + '" style="margin-left:' + (20 * l) + 'px;" id="' + v[i]._id + '">' + v[i].name + '</div>');
                if (v[i]._id == currentId) {
                    box.find(".articleItem:last").addClass("disabled");
                }
                if (v[i].children) {
                    initTree(v[i].children, l + 1);
                }
            }
            box.find(".articleItem").unbind("click").click($scope.onSelect);
        }

        $scope.onSelect = function (v) {
            if ($(this).hasClass("disabled")) {
                return;
            }
            if (current == this.id) {
                current = '';
                $(this).removeClass("curr");
            } else {

                $(this).addClass("curr");
                $($(this).siblings('.articleItem')).removeClass('curr');
                current = $('.curr')[0].id
            }
        }

        bubble._call("column.page", 1, 10000).success(function (v) {
            initTree(bubble.getTreeData(v.data, "_id"));
        })
    }, 20);
    $scope.cancel = function (e) {
        $modalInstance.dismiss('cancel');
    }
    $scope.ok = function (e) {
        if (current.length > 0) {
            bubble.toggleModalBtnLoading(e, true);
            bubble._call("content.contentBind", webId, currentId, current).success(function (v) {
                if (!v.errorcode) {
                    swal(v.message);
                    $modalInstance.close({ ids: current, mode: parseInt($scope.isinlude) });
                } else {
                    bubble.toggleModalBtnLoading(e, false);
                    swal("内容移动失败");
                }
            });
        } else {
            swal('请选择一个目标栏目');
            return;
        }
    }
})
bubbleFrame.register("columnEditController", function (bubble, items, $scope, $modalInstance, $timeout) {
    $scope.value = JSON.parse(JSON.stringify(items.value));
    delete $scope.value.children;
    $scope.value.timediffTemp = $scope.value.timediff ? $scope.value.timediff / 24 / 60 / 60 / 1000 : 0;
    $scope.value.ColumnProperty = !isNaN($scope.value.ColumnProperty) ? $scope.value.ColumnProperty + "" : "3";
    $scope.value.isCheck = !isNaN($scope.value.isCheck) ? $scope.value.isCheck + "" : "0";
    $scope.value.isvisble = !isNaN($scope.value.isvisble) ? $scope.value.isvisble + "" : "0";
    $scope.thumb = items.thumb.init($scope.value);

    $scope.ok = function (e) {
        bubble.toggleModalBtnLoading(e, true);
        $scope.value.timediff = $scope.value.timediffTemp * 24 * 60 * 60 * 1000;
        if ($scope.value.Contant) {
            $scope.value.Contant = 1;
        } else {
            delete $scope.value.Contant;
        }
        $scope.value.ColumnProperty = parseInt($scope.value.ColumnProperty);
        $scope.value.isCheck = parseInt($scope.value.isCheck);
        $scope.value.isvisble = parseInt($scope.value.isvisble);
        $scope.value.thumbnail = $scope.thumb.getCurrentData().join(",");
        bubble._call("template.page", 1, 1000).success(function (v) {
            for (var i = 0; i < v.data.length; i++) {
                if (v.data[i]._id == $scope.value.tempContent) {
                    $scope.value.TemplateContent = v.data[i].name;
                }
                if (v.data[i]._id == $scope.value.tempList) {
                    $scope.value.TemplateList = v.data[i].name;
                }
            }
            bubble._call("column.update", $scope.value._id, $scope.value).success(function (v) {
                if (!v.errorcode) {
                    $modalInstance.close($scope.value);
                } else {
                    bubble.toggleModalBtnLoading(e, false);
                    swal("修改失败");
                }
            });
        });
    }

    $scope.cancel = function (e) {
        $modalInstance.dismiss('cancel');
    }
});

bubbleFrame.register("columnCreateController", function (bubble, items, $scope, $modalInstance, $timeout) {
    items.value.timediff = 0;
    items.value.editCount = 1;
    items.value.ColumnProperty = "3";
    items.value.isCheck = "0";
    items.value.isvisble = "0";
    $scope.value = items.value;
    $scope.thumb = items.thumb.init($scope.value);

    $scope.ok = function (e) {
        bubble.toggleModalBtnLoading(e, true);
        $scope.value.timediff = 0;
        $scope.value.ColumnProperty = parseInt($scope.value.ColumnProperty);
        $scope.value.isCheck = parseInt($scope.value.isCheck);
        $scope.value.isvisble = parseInt($scope.value.isvisble);
        $scope.value.Contant = !!$scope.value.Contant ? 1 : 0;
        $scope.value.thumbnail = $scope.thumb.getCurrentData().join(",");
        bubble._call("column.add", $scope.value).success(function (v) {
            if (!v.errorcode) {
                $modalInstance.close(v);
            } else {
                bubble.toggleModalBtnLoading(e, false);
                swal("修改失败");
            }
        });
    }

    $scope.cancel = function (e) {
        $modalInstance.dismiss('cancel');
    }
});

bubbleFrame.register("administratorController", function (bubble, items, $scope, $modalInstance) {
    $scope.tableControl = {
        onColumnClick: function (key, v) {
            $scope.id = v._id;
            $scope.user = v.name;
        }
    }
    $scope.user = "加载中";
    bubble._call("user.find", window.localStorage.siteid, "5bd18576a713ab9ebcadd5bd").success(function (v) {
        $scope.user = v.name;
    });
    $scope.id = items.userId;
    $scope.ok = function (e) {
        if ($scope.id == items.userId) {
            $modalInstance.close("");
        }
        bubble.toggleModalBtnLoading(e, true);
        bubble._call("column.updateColumnManager", $scope.id, items._id).success(function (v) {
            $modalInstance.close($scope.id);
        });
    }

    $scope.cancel = function (e) {
        $modalInstance.dismiss('cancel');
    }
});