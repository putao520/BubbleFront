bubbleFrame.register('appController', function ($scope, bubble, $modal, $http, $stateParams) {
    
});
var initAjaxState = {
    menu: false,
    count: false,
};

var swithMainLoading = function (v) {
    initAjaxState[v] = true;
    for (var tmp in initAjaxState) {
        if (!initAjaxState[tmp]) {
            return;
        }
    }
    $(".main-loading-box").fadeOut(200);
}
//左侧菜单控制器
bubbleFrame.register('navController', function ($scope, bubble, $rootScope, $timeout, $state) {
        swithMainLoading("menu");
        // var list = {};
        // for (var i = 0; i < v.length; i++) {
        //     var t = v[i];
        //     list[t.sname] = t;
        // }
        // $scope.menuList = list;
        // $scope.include = function (v) {
        //     return $state.includes(v);
        // }
        $timeout(function () {
            $("ul.nav.pos-rlt>li").mouseenter(function (e) {
                var t = $(e.currentTarget);
                if (!$scope.app.settings.asideFolded || t.find("ul").length > 0) {
                    return;
                }
                var text = t.find("span").html();
                $("ul.nav").find(".poptext").html(text).css("top", t.offset().top).show();
            });
            $("ul.nav.pos-rlt>li").mouseleave(function (e) {
                $("ul.nav.pos-rlt").find(".poptext").hide();
            });
        });
})
//右上角齿轮任务控制器
bubbleFrame.register('taskPopUpController', function ($scope, bubble) {
    $scope.tasks = [];
    $scope.colors = ["alert-danger", "alert-info", "alert-success"]
    bubble._call("task.page", 1, 100).success(function (v) {
        $scope.tasks = v.data;
    });
});
//头部工具栏控制器
bubbleFrame.register('headerController', function ($scope, bubble, $rootScope, $state, $localStorage, $timeout, $filter) {
    $scope.name = $rootScope.logininfo ? $rootScope.logininfo.name : "用户";
    window.logininfo = $rootScope.logininfo;
    $scope.changesite = window.logininfo.webinfo.length > 1;
    var sites = $scope.sites = window.logininfo.webinfo;
    $scope.logout = function () {
        bubble._call("user.logout", $rootScope.logininfo._id).success(function (v) {
            delete $localStorage.logininfo;
            $state.go("access.login");
        })
    }

    $scope.changepwd = function () {
        bubble.customModal("changePWDModal.html", "changePWDController", "lg", {}, function (v) {
            v == "密码修改成功！" && $scope.logout();
        });
    }

    $scope.changeUserInfo = function () {
        bubble.customModal("changeUserInfoModal.html", "changeUserInfoController", "lg", {}, function (v) {
            if (v === true) {
                $scope.name = $rootScope.logininfo.name;
            }
        });
    }

    $scope.sitename = window.localStorage.sitename;

    var Site = function () {
        this.colors = ["bg-danger", "bg-info", "bg-success"];
        var _this = this;
        var box = $(".site-change-wrap");
        var site = bubble.getTreeData($scope.sites, "wbid", undefined, undefined, true);
        this.nav = site.length > 1 ? [{ list: site, name: site[0].wbname }] : [];
        this.nav = site.length == 1 && site[0].children ? [{ list: site[0].children, name: site[0].wbname }] : [{ list: site, name: "首页" }];
        this.searchKey = "";
        this.icon = site.length > 1 || (site[0] && site[0].children);

        this.searchChange = function () {
            _this.searchList = $filter("filter")(_this.tmpsearchList, _this.searchKey, undefined, "wbname");
        }

        var initChildren = function (v) {
            _this.currentList = [];
            _this.searchList = [];
            for (var i = 0; i < v.length; i++) {
                var e = v[i];
                if (e.children) {
                    _this.currentList.push(e);
                }
                _this.searchList.push(e);
            }
            !_this.currentList.length && _this.currentList.push({ wbname: "返回上一级" });
            _this.tmpsearchList = _this.searchList;
        }

        this.levelChange = function (v) {
            if (v.wbid) {
                _this.nav.push({ list: v.children, name: v.wbname });
                v.children && initChildren(v.children);
            } else {
                _this.navClick(_this.nav.length - 2);
            }
        }

        this.navClick = function (i) {
            _this.nav.splice(i + 1, _this.nav.length);
            initChildren(_this.nav[_this.nav.length - 1].list);
        }

        this.changeSite = function (t) {
            if (t.wbid == window.localStorage.siteid) {
                swal("请选择非当前站点");
                return;
            }
            bubble._call("site.switch", t.wbid).success(function (rs) {
                window.localStorage.sitename = t.wbname;
                window.localStorage.siteid = t.wbid;
                window.localStorage.sitewbgid = t.wbgid;
                window.location.reload();
            });
        }

        this.show = function () {
            if (_this.icon) {
                box.fadeIn(200);
            }
        }

        this.hide = function () {
            box.fadeOut(200);
        }

        box.click(function (e) {
            if (e.target === e.currentTarget) {
                _this.hide();
            }
        });

        $scope.changesite && initChildren(site);
    }

    var initSite = function () {
        $timeout(function () {
            if ($(".site-change-wrap").length) {
                $scope.Site = new Site();
            } else {
                setTimeout(initSite, 500);
            }
        })
    }
    initSite();
});

//更改用户信息
bubbleFrame.register('changeUserInfoController', function ($scope, bubble, $modalInstance, $localStorage, $rootScope) {
    var info = $rootScope.logininfo;
    $scope.value = {
        name: info.name,
        mobphone: info.mobphone,
    }
    $scope.ok = function (e) {
        if ($scope.value.name == info.name && $scope.value.mobphone == info.mobphone) {
            $modalInstance.dismiss('cancel');
            return;
        }
        $(e.currentTarget).addClass("data-loading");
        bubble._call("user.update", info._id, $scope.value).success(function (v) {
            $(e.currentTarget).removeClass("data-loading");
            if (!v.errorcode) {
                swal("修改成功");
                info.name = $scope.value.name;
                info.mobphone = $scope.value.mobphone;
                $localStorage.logininfo = JSON.stringify(info);
                $modalInstance.close(true);
                return;
            } else {
                swal(v.message);
                return;
            }
        });
    }

    $scope.cancel = function (e) {
        $modalInstance.dismiss('cancel');
    }
});

//更改密码控制器
bubbleFrame.register('changePWDController', function ($scope, bubble, $modalInstance, $localStorage, $rootScope) {
    $scope.name = $rootScope.logininfo.id;
    $scope.ok = function (e) {
        if (!($scope.pwd && $scope.pwd1 && $scope.pwd2)) {
            swal("密码不可为空");
            return;
        }
        if ($scope.pwd1 != $scope.pwd2) {
            swal("两次密码输入不一致");
            return;
        }
        $(e.currentTarget).addClass("data-loading");
        bubble._call("user.changePW", $scope.name, $scope.pwd, $scope.pwd1).success(function (v) {
            $(e.currentTarget).removeClass("data-loading");
            if (!v.errorcode) {
                swal("修改成功");
                $modalInstance.close(v);
                return;
            } else {
                swal(v.message);
                return;
            }
        })
    }

    $scope.cancel = function (e) {
        $modalInstance.dismiss('cancel');
    }
});

//更改密码控制器
bubbleFrame.register('siteChangeController', function ($scope, bubble, $modalInstance, $localStorage, $rootScope) {
    $scope.ok = function (e) {

    }

    $scope.cancel = function (e) {
        $modalInstance.dismiss('cancel');
    }
});

//App全局控制器
bubbleFrame.register('AppCtrl', function ($scope, $localStorage, $window, $rootScope, $state, bubble, $timeout) {
    // add 'ie' classes to html
    $rootScope.reportCount = "";
    var hasCanvasInit = false;
    var isIE = !!navigator.userAgent.match(/MSIE/i);
    isIE && angular.element($window.document.body).addClass('ie');
    isSmartDevice($window) && angular.element($window.document.body).addClass('smart');
    var anitimer = 0;

    $scope.$on('$stateChangeSuccess', function (event, toState, toParams, fromState) {
        $scope.app.settings.full = false;
        $scope.app.settings.asideFolded = false;
        $scope.app.settings.popupReportSlideBox = true;
        if ($localStorage.logininfo) {
            var tmp = JSON.parse($localStorage.logininfo);
            $rootScope.logininfo = tmp;
            window.logininfo = $rootScope.logininfo;
            !$rootScope.reportCount && window.logininfo && bubble._call("report.count").success(function (v) {
                swithMainLoading("count");
                $rootScope.reportCount = !v || v.errorcode ? "0" : v;
            });
        } else {
            toState.name.indexOf("access") >= 0 || $state.go("access.login");
        };
    });
    // config
    $scope.app = {
        name: '葡萄云',
        version: '1.3.3',
        // for chart colors
        color: {
            primary: '#7266ba',
            info: '#23b7e5',
            success: '#27c24c',
            warning: '#fad733',
            danger: '#f05050',
            light: '#e8eff0',
            dark: '#3a3f51',
            black: '#1c2b36'
        },
        settings: {
            themeID: 1,
            navbarHeaderColor: 'bg-black',
            navbarCollapseColor: 'bg-white-only',
            asideColor: 'bg-black',
            headerFixed: true,
            asideFixed: true,
            asideFolded: false,
            asideDock: false,
            container: false,
            full: false,
            popupReportSlideBox: true
        }
    }

    // save settings to local storage
    // if (angular.isDefined($localStorage.settings)) {
    //     $scope.app.settings = $localStorage.settings;
    // } else {
    //     $localStorage.settings = $scope.app.settings;
    // }
    $scope.$watch('app.settings', function () {
        if ($scope.app.settings.asideDock && $scope.app.settings.asideFixed) {
            // aside dock and fixed must set the header fixed.
            $scope.app.settings.headerFixed = true;
        }
        // save to local storage
        $localStorage.settings = $scope.app.settings;
    }, true);



    function isSmartDevice($window) {
        // Adapted from http://www.detectmobilebrowsers.com
        var ua = $window['navigator']['userAgent'] || $window['navigator']['vendor'] || $window['opera'];
        // Checks for iOs, Android, Blackberry, Opera Mini, and Windows mobile devices
        return (/iPhone|iPod|iPad|Silk|Android|BlackBerry|Opera Mini|IEMobile/).test(ua);
    }
});



