angular
    .module('myApp', ['ngMaterial', 'ngMessages', 'ui.router', 'angular-flexslider'])
    .controller('AppCtrl', function($scope, $timeout, $mdSidenav, $log, $http, $stateParams) {
        $scope.toggleLeft = buildDelayedToggler('left');
        $scope.filterLeft = buildToggler('filter-left');
        $scope.isOpen = false;
        $scope.isColOpen = false;

        function debounce(func, wait, context) {
            var timer;

            return function debounced() {
                var context = $scope,
                    args = Array.prototype.slice.call(arguments);
                $timeout.cancel(timer);
                timer = $timeout(function() {
                    timer = undefined;
                    func.apply(context, args);
                }, wait || 10);
            };
        }

        function buildDelayedToggler(navID) {
            return debounce(function() {
                // Component lookup should always be available since we are not using `ng-if`
                $mdSidenav(navID)
                    .toggle()
                    .then(function() {
                        $log.debug("toggle " + navID + " is done");
                    });
            }, 200);
        }

        function buildToggler(componentId) {
            return function() {
                $mdSidenav(componentId).toggle();
            };
        }

        $scope.toggle = function() {
            $scope.isOpen = !$scope.isOpen;
            console.log($scope.isOpen);
        }

        $scope.colToggle = function() {
            $scope.isColOpen = !$scope.isColOpen;
        }

        $scope.close = function() {
            $mdSidenav('left').close();
        }

        $scope.filter_option = [];

        $scope.selectAllCurCate = function(id) {
            var parent_sate = 0;
            var filter_state = 0;
            for (let index = 0; index < $scope.filter_option.length; index++) {
                if ($scope.filter_option[index].id == id) {
                    if ($scope.filter_option[index].state == 1) {
                        $scope.filter_option[index].state = 0;
                    } else {
                        $scope.filter_option[index].state = 1;
                    }
                    parent_sate = $scope.filter_option[index].state;
                    for (let idx = 0; idx < $scope.filter_option.length; idx++) {
                        if ($scope.filter_option[idx].parent == id) {
                            $scope.filter_option[idx].state = parent_sate;
                        }
                    }
                }
                filter_state += $scope.filter_option[index].state;
            }
            if (filter_state) {
                $scope.filterItems();
            } else {
                $scope.clearFilter();
            }
        }

        $scope.selectCurItem = function(id) {
            var parent_id = 0;
            var parent_state = 1;
            for (let index = 0; index < $scope.filter_option.length; index++) {
                if ($scope.filter_option[index].id == id) {
                    if ($scope.filter_option[index].state == 1) {
                        $scope.filter_option[index].state = 0;
                    } else {
                        $scope.filter_option[index].state = 1;
                    }
                    parent_state = parent_state * $scope.filter_option[index].state;
                    parent_id = $scope.filter_option[index].parent;
                    for (let idx = 0; idx < $scope.filter_option.length; idx++) {
                        if ($scope.filter_option[idx].parent == parent_id) {
                            parent_state = parent_state * $scope.filter_option[idx].state;
                        }
                    }
                }
            }
            var filter_state = 0;
            for (let index = 0; index < $scope.filter_option.length; index++) {
                if ($scope.filter_option[index].id == parent_id) {
                    $scope.filter_option[index].state = parent_state;
                }
                filter_state += $scope.filter_option[index].state;
            }
            if (filter_state) {
                $scope.filterItems();
            } else {
                $scope.clearFilter();
            }
        }

        $scope.checkedItem = function(id) {
            for (let index = 0; index < $scope.filter_option.length; index++) {
                if ($scope.filter_option[index].id == id && $scope.filter_option[index].state == 1) {
                    return true;
                }
            }
            return false;
        }

        $scope.clearFilter = function() {
            for (let index = 0; index < $scope.filter_option.length; index++) {
                $scope.filter_option[index].state = 0;
            }
            $scope.displayItem = Array();
            for (let index = 0; index < $scope.products.length; index++) {
                $scope.displayItem.push($scope.products[index]);
            }
        }

        $scope.filterItems = function() {

            $scope.displayItem = Array();
            for (let index = 0; index < $scope.products.length; index++) {
                var valid_flag = Array();
                for (let n = 0; n < $scope.filters.length; n++) {
                    valid_flag.push({ id: $scope.filters[n].id, valid_show: -1 });
                }
                for (var j = 0; j < $scope.filter_option.length; j++) {
                    for (let n = 0; n < valid_flag.length; n++) {
                        if (($scope.filter_option[j].state == 1) && ($scope.filter_option[j].parent == valid_flag[n].id) && (valid_flag[n].valid_show == -1)) {
                            valid_flag[n].valid_show = 0;
                        }
                    }
                }

                var tmp_cate = $scope.products[index].category.split(',');
                for (var i = 0; i < tmp_cate.length; i++) {
                    for (var j = 0; j < $scope.filter_option.length; j++) {
                        if (tmp_cate[i].trim() == $scope.filter_option[j].id) {
                            if ($scope.filter_option[j].state == 1) {
                                for (let n = 0; n < valid_flag.length; n++) {
                                    if ($scope.filter_option[j].parent == valid_flag[n].id) {
                                        valid_flag[n].valid_show = 1;
                                    }
                                }
                            }
                        }
                    }
                }
                var _valid_show = 1;
                for (let n = 0; n < valid_flag.length; n++) {
                    _valid_show = _valid_show * valid_flag[n].valid_show;
                }
                if (_valid_show == 1 || _valid_show == -1) {
                    $scope.displayItem.push($scope.products[index]);
                }
            }
        }

        $scope.Base64 = {
            _keyStr: "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=",
            encode: function(e) {
                var t = "";
                var n, r, i, s, o, u, a;
                var f = 0;
                e = Base64._utf8_encode(e);
                while (f < e.length) {
                    n = e.charCodeAt(f++);
                    r = e.charCodeAt(f++);
                    i = e.charCodeAt(f++);
                    s = n >> 2;
                    o = (n & 3) << 4 | r >> 4;
                    u = (r & 15) << 2 | i >> 6;
                    a = i & 63;
                    if (isNaN(r)) { u = a = 64 } else if (isNaN(i)) { a = 64 }
                    t = t + this._keyStr.charAt(s) + this._keyStr.charAt(o) + this._keyStr.charAt(u) + this._keyStr.charAt(a)
                }
                return t
            },
            decode: function(e) {
                var t = "";
                var n, r, i;
                var s, o, u, a;
                var f = 0;
                e = e.replace(/[^A-Za-z0-9+/=]/g, "");
                while (f < e.length) {
                    s = this._keyStr.indexOf(e.charAt(f++));
                    o = this._keyStr.indexOf(e.charAt(f++));
                    u = this._keyStr.indexOf(e.charAt(f++));
                    a = this._keyStr.indexOf(e.charAt(f++));
                    n = s << 2 | o >> 4;
                    r = (o & 15) << 4 | u >> 2;
                    i = (u & 3) << 6 | a;
                    t = t + String.fromCharCode(n);
                    if (u != 64) { t = t + String.fromCharCode(r) }
                    if (a != 64) { t = t + String.fromCharCode(i) }
                }
                t = Base64._utf8_decode(t);
                return t
            },
            _utf8_encode: function(e) {
                e = e.replace(/rn/g, "n");
                var t = "";
                for (var n = 0; n < e.length; n++) {
                    var r = e.charCodeAt(n);
                    if (r < 128) { t += String.fromCharCode(r) } else if (r > 127 && r < 2048) {
                        t += String.fromCharCode(r >> 6 | 192);
                        t += String.fromCharCode(r & 63 | 128)
                    } else {
                        t += String.fromCharCode(r >> 12 | 224);
                        t += String.fromCharCode(r >> 6 & 63 | 128);
                        t += String.fromCharCode(r & 63 | 128)
                    }
                }
                return t
            },
            _utf8_decode: function(e) {
                var t = "";
                var n = 0;
                var c1, c2, c3;
                var r = c1 = c2 = 0;
                while (n < e.length) {
                    r = e.charCodeAt(n);
                    if (r < 128) {
                        t += String.fromCharCode(r);
                        n++
                    } else if (r > 191 && r < 224) {
                        c2 = e.charCodeAt(n + 1);
                        t += String.fromCharCode((r & 31) << 6 | c2 & 63);
                        n += 2
                    } else {
                        c2 = e.charCodeAt(n + 1);
                        c3 = e.charCodeAt(n + 2);
                        t += String.fromCharCode((r & 15) << 12 | (c2 & 63) << 6 | c3 & 63);
                        n += 3
                    }
                }
                return t
            }
        }

        $scope.filters = [];
        $scope.products = [];
        $scope.displayItem = [];

        $timeout(function() {
            this.rowCollection = [];
            var api_url = "api/product.php";
            var fd = new FormData();
            fd.append('action', 'get');
            var _this = this;
            $http.post(api_url, fd, {
                transformRequest: angular.identity,
                headers: { 'Content-Type': undefined }
            }).success(function(data) {
                $scope.filters = data.filter;
                for (let index = 0; index < $scope.filters.length; index++) {
                    $scope.filter_option.push({ id: $scope.filters[index].id, parent: $scope.filters[index].parent, state: 0 });
                    for (let idx = 0; idx < $scope.filters[index].sub.length; idx++) {
                        $scope.filter_option.push({ id: $scope.filters[index].sub[idx].id, parent: $scope.filters[index].sub[idx].parent, state: 0 });
                    }
                }
                console.log($scope.filters);
                $scope.products = data.product;
                $scope.displayItem = $scope.products;
            }).error(function(err) {
                console.log(err);
            });

        }.bind(this), 100);

        $scope.showItem = false;
        $scope.curProduct = [];
        $scope.itemImages = [];
        $scope.viewItem = function(id) {
            console.log(id);
            $scope.showItem = true;
            var api_url = "api/getProductDetail.php";
            var fd = new FormData();
            fd.append('id', id);
            var _this = this;
            $http.post(api_url, fd, {
                transformRequest: angular.identity,
                headers: { 'Content-Type': undefined }
            }).success(function(data) {
                $scope.curProduct = data;
                if ($scope.curProduct['image'] != "undefined") {
                    $scope.itemImages = $scope.curProduct['image'].split(',');
                }
                console.log($scope.curProduct);
            }).error(function(err) {
                console.log(err);
            });
        }

        $scope.backToList = function() {
            $scope.showItem = false;
        }

        $scope.gotoMain = function() {
            $scope.backToList();
        }

        $scope.initJQuery = function() {
            $(function() {
                var limit_height = $(document).height() - 240;
                var limit_width = $(document).width() - 240;
                var hide_elem_list = document.getElementsByClassName('item_hide');
                $('.item').live('mouseover mouseout', function(event) {
                    var item_index = $('.item').index(this);
                    var hide_elem = hide_elem_list[item_index];
                    var offset = $(this).offset();
                    var top = offset.top - $(window).scrollTop();
                    var left = offset.left;
                    if (event.type == 'mouseover') {
                        hide_elem.classList.remove('display-none');
                        var off_top = top - 44;
                        if (off_top <= 0) {
                            off_top = 15;
                        }
                        if (off_top >= limit_height) {
                            off_top = limit_height - 15;
                        }
                        var off_left = left - 44;
                        if (off_left <= 0) {
                            off_left = 15;
                        }
                        if (off_left >= limit_width) {
                            off_left = limit_width - 15;
                        }
                        hide_elem.setAttribute('style', 'position: fixed; top: ' + off_top + 'px; left: ' + off_left + 'px; z-index: 9999;');
                        hide_elem.classList.add('zoom');
                        for (let index = 0; index < hide_elem_list.length; index++) {
                            if (index != item_index) {
                                hide_elem_list[index].classList.remove('zoom');
                                hide_elem_list[index].classList.remove('display-none');
                                hide_elem_list[index].classList.add('display-none');
                                document.getElementsByClassName('item')[index].removeAttribute("style");
                            }
                        }
                    }
                    if (event.type == 'mouseout') {
                        for (let index = 0; index < hide_elem_list.length; index++) {
                            if (index != item_index) {
                                hide_elem_list[index].classList.remove('zoom');
                                hide_elem_list[index].classList.remove('display-none');
                                hide_elem_list[index].classList.add('display-none');
                                document.getElementsByClassName('item')[index].removeAttribute("style");
                            }
                        }
                    }

                });

                $(".item_hide").live('mouseout', function(event) {
                    var item_index = $('.item_hide').index(this);
                    var hide_elem = hide_elem_list[item_index];
                    hide_elem.classList.remove('zoom');
                    hide_elem.classList.remove('display-none');
                    hide_elem.classList.add('display-none');
                    hide_elem.removeAttribute("style");
                });

                $(window).scroll(function() {
                    $(".item_hide").each(function() {
                        if (this.classList.value == 'item_hide zoom') {
                            this.classList.remove('zoom');
                            this.classList.remove('display-none');
                            this.classList.add('display-none');
                        }
                    })
                });

            });

        }

        $scope.initJQuery();

        // collections view
        $scope.col_nums = [];

        $timeout(function() {
            var api_url = "api/getCollectionNum.php";

            var fd = new FormData();
            fd.append('action', 'get');
            $http.get(api_url, fd, {
                transformRequest: angular.identity,
                headers: { 'Content-Type': undefined }
            }).success(function(data) {
                $scope.col_nums = data;
            }).error(function(err) {
                console.log(err);
            });

        }.bind(this), 100);

        $scope.collectionView = function(param) {
            $scope.collection = { imagePaths: [], description: '' };

            var api_url = "api/collection.php?col_num=" + param;

            var fd = new FormData();
            fd.append('action', 'get');
            $http.get(api_url, fd, {
                transformRequest: angular.identity,
                headers: { 'Content-Type': undefined }
            }).success(function(data) {
                $scope.collection.imagePaths = data[0].imagePaths;
                $scope.collection.description = data[0].description;
            }).error(function(err) {
                console.log(err);
            });
        }

        // contact us
        $scope.submitForm = function(isValid, form) {
            $scope.submitted = true;
            $scope.user = {}

            if ($scope.submitted && isValid) {
                $scope.user.firstName = form.firstName.$modelValue;
                $scope.user.lastName = form.lastName.$modelValue;
                $scope.user.email = form.email.$modelValue;
                $scope.user.subject = form.subject.$modelValue;
                $scope.user.message = form.message.$modelValue;

                var fd = new FormData();
                fd.append('first_name', $scope.user.firstName);
                fd.append('last_name', $scope.user.lastName);
                fd.append('email', $scope.user.email);
                fd.append('subject', $scope.user.subject);
                fd.append('message', $scope.user.message);

                $http.post('api/contact.php', fd, {
                    transformRequest: angular.identity,
                    headers: { 'Content-Type': undefined }
                }).success(function(data) {
                    console.log(data);
                }).error(function(err) {
                    console.log(err);
                });
            }
        }

    })
    .config(function($stateProvider) {

        var gridviewState = {
            name: 'gridview',
            url: '/gridview',
            templateUrl: 'pages/gridview.html'
        }

        var detailState = {
            name: 'detail',
            url: '/gridview/product/:itemId',
            templateUrl: 'pages/gridview-detail.html'
        }

        var collectionState = {
            name: 'collection',
            url: '/collection/:colNum',
            templateUrl: 'pages/collection.html'
        }

        var aboutState = {
            name: 'about',
            url: '/',
            templateUrl: 'pages/about.html'
        }

        var contactState = {
            name: 'contact',
            url: '/contact',
            templateUrl: 'pages/contact.html'
        }

        $stateProvider.state(gridviewState);
        $stateProvider.state(collectionState);
        $stateProvider.state(detailState);
        $stateProvider.state(aboutState);
        $stateProvider.state(contactState);
    })
    .config(["$locationProvider", function($locationProvider) {
        $locationProvider.html5Mode(true);
    }]);