bubbleFrame.register('loginController', function ($timeout, $scope, bubble, $state, $rootScope, $localStorage) {
    var isAjax = false;
    $scope.user = {};
    if ($localStorage.logininfo) {
        var tmp = JSON.parse($localStorage.logininfo);
    }
    $scope.login = function () {
        if (isAjax) {
            return;
        }
        isAjax = true;
        if (!$scope.user.username || !$scope.user.password) {
            swal("用户名密码不可为空");
        }
        var p = { password: $scope.user.password };
        if (bubble.isEmail($scope.user.username)) {
            p.email = $scope.user.username;
            p.loginmode = 0;
        }
        if (bubble.isMobile($scope.user.username)) {
            p.mobphone = $scope.user.username;
            p.loginmode = 2;
        }
        if (p.mode === undefined) {
            p.id = $scope.user.username;
            p.loginmode = 0;
        }
        // if (bubbleFrame.getAppId() == 13) {
            // swal("欠费通知：因长期未收到项目款项，本系统后台暂时无法访问，并将于2019年6月6号关闭所有业务系统。至此公告发布起，本公司停止对该项目的一切运维服务。");
            // return;
        // }
        $("button[type='submit']").html("登陆中...");
        bubble._call("user.login", p).success(function (v) {
            if (v && !v.errorcode) {
                v.expiretime = Date.parse(new Date());
                $localStorage.logininfo = JSON.stringify(v);
                window.logininfo = v;
                $rootScope.logininfo = v;
                $state.go("app.dashboard");
                window.localStorage.sitename = v.webinfo[0].wbname;
                window.localStorage.siteid = v.webinfo[0].wbid;
                window.localStorage.sitewbgid = v.webinfo[0].wbgid;
                bubble._call("site.switch", v.webinfo[0].wbid).success(function (rs) {
                    if (rs.errorcode) {
                        $state.go("access.login");
                        swal("获取网站信息失败");
                        return;
                    }
                });
            } else {
                isAjax = false;
                swal(v && v.message ? v.message : "登录失败");
                $("button[type='submit']").html("登 陆");
            }
        });
    }
    bubble.clearCache();
});