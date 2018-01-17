/******/ (function(modules) { // webpackBootstrap
/******/ 	// The module cache
/******/ 	var installedModules = {};
/******/
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/
/******/ 		// Check if module is in cache
/******/ 		if(installedModules[moduleId]) {
/******/ 			return installedModules[moduleId].exports;
/******/ 		}
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = installedModules[moduleId] = {
/******/ 			i: moduleId,
/******/ 			l: false,
/******/ 			exports: {}
/******/ 		};
/******/
/******/ 		// Execute the module function
/******/ 		modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);
/******/
/******/ 		// Flag the module as loaded
/******/ 		module.l = true;
/******/
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/
/******/
/******/ 	// expose the modules object (__webpack_modules__)
/******/ 	__webpack_require__.m = modules;
/******/
/******/ 	// expose the module cache
/******/ 	__webpack_require__.c = installedModules;
/******/
/******/ 	// define getter function for harmony exports
/******/ 	__webpack_require__.d = function(exports, name, getter) {
/******/ 		if(!__webpack_require__.o(exports, name)) {
/******/ 			Object.defineProperty(exports, name, {
/******/ 				configurable: false,
/******/ 				enumerable: true,
/******/ 				get: getter
/******/ 			});
/******/ 		}
/******/ 	};
/******/
/******/ 	// getDefaultExport function for compatibility with non-harmony modules
/******/ 	__webpack_require__.n = function(module) {
/******/ 		var getter = module && module.__esModule ?
/******/ 			function getDefault() { return module['default']; } :
/******/ 			function getModuleExports() { return module; };
/******/ 		__webpack_require__.d(getter, 'a', getter);
/******/ 		return getter;
/******/ 	};
/******/
/******/ 	// Object.prototype.hasOwnProperty.call
/******/ 	__webpack_require__.o = function(object, property) { return Object.prototype.hasOwnProperty.call(object, property); };
/******/
/******/ 	// __webpack_public_path__
/******/ 	__webpack_require__.p = "";
/******/
/******/ 	// Load entry module and return exports
/******/ 	return __webpack_require__(__webpack_require__.s = 1);
/******/ })
/************************************************************************/
/******/ ([
/* 0 */
/***/ (function(module, exports) {

function generateId() {
  var text = "";
  var possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz";

  for (var i = 0; i < 5; i++)
    text += possible.charAt(Math.floor(Math.random() * possible.length));

  return text;
}

var CORE = (function() {
    const version = "0.9.6";
    const update_date = "2017/08/08";
    const defaultUA = "netdisk;5.3.4.5;PC;PC-Windows;5.1.2600;WindowsBaiduYunGuanJia";
    const defaultreferer = "http://pan.baidu.com/disk/home";
    const elmId = { exportMenu: generateId() };
    var cookies = null;
    return {
        elmId: elmId,
        init: function() {
            this.startListen();
            if (typeof browser != "undefined") {
                chrome = browser;

                if (!chrome.storage.sync)
                    chrome.storage.sync = chrome.storage.local;
            }
            chrome.storage.sync.get(null, function(items) {
                for (var key in items) {
                    localStorage.setItem(key, items[key]);
                    //console.log(key + items[key]);
                }
            });
        },
        // 将文件名用单引号包裹，并且反转义文件名中所有单引号，确保按照文件名保存
        escapeString: function(str) {
            if (navigator.platform.indexOf("Win") != -1) {
                return str;
            }

            var result = "'" + str.replace("'", "'\\''") + "'";
            return result;
        },
        //调整元素的位置使元素居中
        setCenter: function(obj) {
            var screenWidth = $(window).width(),
                screenHeight = $(window).height();
            var scrolltop = $(document).scrollTop();
            var objLeft = (screenWidth - obj.width()) / 2;
            var objTop = (screenHeight - obj.height()) / 2 + scrolltop;
            obj.css({ left: objLeft + "px", top: objTop + "px" });
        },
        startListen: function() {
            function saveSyncData(data, value) {
                var obj = new Object();
                obj[data] = value;
                chrome.storage.sync.set(obj, function() {
                    // console.log(data + ' saved');
                });
            }
            window.addEventListener("message", function(event) {
                if (event.source != window)
                    return;
                if (event.data.type && (event.data.type == "config_data")) {
                    for (var key in event.data.data) {
                        localStorage.setItem(key, event.data.data[key]);
                        if (event.data.data["rpc_sync"] === true) {
                            saveSyncData(key, event.data.data[key]);
                        } else {
                            chrome.storage.sync.clear();
                        }
                    }
                }
                if (event.data.type && (event.data.type == "clear_data")) {
                    chrome.storage.sync.clear();
                } 
            }, false);
        },
        sendToBackground: function(method, data, callback) {
            chrome.runtime.sendMessage({
                method: method,
                data: data
            }, callback);
        },
        showToast: function(message, type) {
            window.postMessage({ type: "show_toast", data: { message: message, type: type } }, "*");
        },
        //获取aria2c的版本号用来测试通信
        getVersion: function() {
            var data = {
                "jsonrpc": "2.0",
                "method": "aria2.getVersion",
                "id": 1,
                "params": []
            };
            var rpc_path = $("#rpc_url_1").val();
            var paths = this.parseAuth(rpc_path);
            if (paths[0] && paths[0].startsWith("token")) {
                data.params.unshift(paths[0]);
            }
            var parameter = { url: paths[1], dataType: "json", type: "POST", data: JSON.stringify(data) };
            if (paths[0] && paths[0].startsWith("Basic")) {
                parameter["headers"] = { "Authorization": paths[0] };
            }
            this.sendToBackground("rpc_version", parameter, function(version) {
                if (version)
                    $("#send_test").html("ARIA2\u7248\u672c\u4e3a\uff1a\u0020" + version.result.version);
                else
                    $("#send_test").html("错误,请查看是否开启Aria2");
            });
        },
        //解析 RPC地址 返回验证数据 和地址
        parseAuth: function(url) {
            var parseURL = new URL(url);
            var auth_str = (parseURL.username != "") ? (parseURL.username + ":" + decodeURI(parseURL.password)) : null;
            var options = [];
            if (auth_str) {
                if (auth_str.indexOf("token:") != 0) {
                    auth_str = "Basic " + btoa(auth_str);
                }
            }
            var hash = parseURL.hash.substr(1);
            if (hash) {
                hash.split("&").forEach(function(item) {
                    item = item.split("=");
                    if (item[0].length > 1) {
                        options.push([item[0], item.length == 2 ? item[1] : "enabled"]);
                    }
                });
            }

            var path = parseURL.origin + parseURL.pathname;
            return [auth_str, path, options];
        },
        //导出菜单
        addMenu: {
            init: function(type) {
                if ($("#" + elmId.exportMenu).length != 0) {
                    return $("#" + elmId.exportMenu);
                }
                var aria2_btn = $("<span>").attr("id", elmId.exportMenu);
                var list = $("<div>").addClass("menu").attr("id", "aria2_list").hide().appendTo(aria2_btn);
                $("<a>").text("导出下载").addClass("g-button-menu").attr("id", "aria2_download").appendTo(list);
                var config = $("<a>").text("设置").addClass("g-button-menu").appendTo(list);
                if (type == "home") {
                    aria2_btn.addClass("g-dropdown-button").prepend($("<a>").addClass("g-button").append($("<span>").addClass("g-button-right").append($("<em>").addClass("icon icon-download"), $("<span>").addClass("text").text("导出下载"))));
                    $(".g-dropdown-button").eq(3).after(aria2_btn);
                } else if (type == "share") {
                    // aria2_btn.addClass("save-button").append('<em class="global-icon-download"></em><b>导出下载</b>');
                    $(".bar").css("position", "absolute");
                    aria2_btn.addClass("g-dropdown-button").prepend($("<a>").addClass("g-button").append($("<span>").addClass("g-button-right").append($("<em>").addClass("icon icon-download"), $("<span>").addClass("text").text("导出下载"))));
                    $('a[data-button-id="b3"]').parent().prepend(aria2_btn);
                } else if (type == "album") {
                    aria2_btn.addClass("save-button").append('<em class="global-icon-download"></em><b>导出下载</b>');
                    $("#albumFileSaveKey, #emphsizeButton").parent().prepend(aria2_btn);
                }
                aria2_btn.mouseenter(function() {
                    aria2_btn.toggleClass("button-open");
                    list.show();
                });
                aria2_btn.mouseleave(function() {
                    aria2_btn.toggleClass("button-open");
                    list.hide();
                });
                config.click(function() {
                    if ($("#setting_div").length == 0) {
                        CORE.setting.init();
                    }
                    $("#setting_divtopmsg").html("");
                    $("#setting_div").show();
                });
                this.update();
                return aria2_btn;
            },
            //根据设置更新按钮
            update: function() {
                $(".rpc_export_list").remove();
                var rpc_list = JSON.parse(localStorage.getItem("rpc_list") || '[{"name":"ARIA2 RPC","url":"http://localhost:6800/jsonrpc"}]');
                while (rpc_list.length > 0) {
                    var rpcObj = rpc_list.pop();
                    $("<a class='rpc_export_list'>").addClass("g-button-menu").attr("data-id", rpcObj.url).text(rpcObj.name).prependTo($("#aria2_list"));
                }
            }
        },
        //设置界面
        setting: {
            init: function() {
                var self = this;
                var setting_div = document.createElement("div");
                setting_div.id = "setting_div";
                if ($("#setting_div").length != 0) {
                    return setting_div.id;
                }
                var html_ = [
                    '<div class="top"><div title="关闭" id="setting_div_close" class="close"></div><h3>导出设置</h3></div>',
                    '<div style=" margin: 20px 10px 10px 10px; ">',
                    '<div id="setting_divtopmsg" style="position:absolute; margin-top: -18px; margin-left: 10px; color: #E15F00;"></div>',
                    '<table id="setting_div_table" >',
                    "<tbody>",
                    '<tr><td><label>开启配置同步:</label></td><td><input id="rpc_sync" type="checkbox"></td></tr>',
                    '<tr><td><label>我是SVIP会员:</label></td><td><input id="svip" type="checkbox"></td></tr>',
                    '<tr><td><label>开启校验md5:</label></td><td><input id="md5_checksum" type="checkbox"></td></tr>',
                    '<tr><td><label>文件夹结构层数：</label></td><td><input type="text" id="rpc_fold" class="input-small">(默认0表示不保留,-1表示保留完整路径)</td></tr>',
                    '<tr><td><label>递归下载延迟：</label></td><td><input type="text" id="rpc_delay" class="input-small">(单位:毫秒)<div style="position:absolute; margin-top: -20px; right: 20px;"><a id="send_test" type="0" href="javascript:;" >测试连接，成功显示版本号。</a></div></td></tr>',
                    '<tr><td><label>下载路径:</label></td><td><input type="text" placeholder="只能设置为绝对路径" id="setting_aria2_dir" class="input-large"></td></tr>',
                    '<tr><td><label>User-Agent :</label></td><td><input type="text" id="setting_aria2_useragent_input" class="input-large"></td></tr>',
                    '<tr><td><label>Referer ：</label></td><td><input type="text" id="setting_aria2_referer_input" class="input-large"></td></tr>',
                    '<tr><td colspan="2"><div style="color: #656565;">Headers<label style="margin-left: 65px;">※使用回车分隔每个headers。</label></div><li class="b-list-item separator-1"></li></td></tr>',
                    '<tr><td><label>headers ：</label></td><td><textarea id="setting_aria2_headers" ></textarea></td></tr>',
                    "</tbody>",
                    "</table>",
                    '<div style="margin-top:10px;">',
                    '<div id="copyright">© Copyright <a href="https://github.com/acgotaku/BaiduExporter">雪月秋水 </a><br/> Version:' + version + " 更新日期: " + update_date + " </div>",
                    '<div style="margin-left:50px; display:inline-block"><a href="javascript:;" id="apply" class="button button-blue">应用</a><a href="javascript:;" id="reset" class="button">重置</a></div>',
                    "</div>",
                    "</div>"
                ];
                setting_div.innerHTML = html_.join("");
                document.body.appendChild(setting_div);
                $("#setting_divtopmsg").html("");
                self.update();
                $("#setting_div").on("click", function(event) {
                    switch (event.target.id) {
                        case "setting_div_close":
                            $("#setting_div").hide();
                            break;
                        case "apply":
                            self.save();
                            setTimeout(function() {
                                CORE.addMenu.update();
                            }, 60);
                            $("#setting_divtopmsg").html("设置已保存.");
                            break;
                        case "reset":
                            localStorage.clear();
                            window.postMessage({ type: "clear_data" }, "*");
                            $("#setting_divtopmsg").html("设置已重置.");
                            self.update();
                            break;
                        case "send_test":
                            CORE.getVersion();
                            break;
                        case "add_rpc":
                            var num = $(".rpc_list").length + 1;
                            var row = '<tr class="rpc_list"><td><input id="rpc_name_' + num + '" type="text" value="ARIA2 RPC ' + num + '" class="input-medium">：</td><td><input id="rpc_url_' + num + '" type="text" class="input-large"></td></tr>';
                            $(row).insertAfter($(".rpc_list").eq(num - 2));
                            break;
                        default:
                            //console.log(event);

                    }
                });
                CORE.setCenter($("#setting_div"));
                return setting_div.id;
            },
            //保存配置数据
            save: function() {
                var config_data = {};
                config_data["UA"] = document.getElementById("setting_aria2_useragent_input").value;
                config_data["rpc_delay"] = $("#rpc_delay").val();
                config_data["referer"] = $("#setting_aria2_referer_input").val();
                config_data["rpc_dir"] = $("#setting_aria2_dir").val();
                config_data["rpc_fold"] = $("#rpc_fold").val();
                config_data["rpc_headers"] = $("#setting_aria2_headers").val();
                config_data["rpc_sync"] = $("#rpc_sync").prop("checked");
                config_data["svip"] =$("#svip").prop("checked");
                config_data["md5_checksum"] =$("#md5_checksum").prop("checked");
                var rpc_list = [];
                for (var i = 0; i < $(".rpc_list").length; i++) {
                    var num = i + 1;
                    if ($("#rpc_url_" + num).val() != "" && $("#rpc_name_" + num).val() != "") {
                        rpc_list.push({ "name": $("#rpc_name_" + num).val(), "url": $("#rpc_url_" + num).val() });
                    }
                }
                config_data["rpc_list"] = JSON.stringify(rpc_list);
                CORE.sendToBackground("config_data", config_data);
                window.postMessage({ type: "config_data", data: config_data }, "*");
            },
            //根据配置数据 更新 设置菜单
            update: function() {
                $("#rpc_delay").val((localStorage.getItem("rpc_delay") || "300"));
                $("#rpc_fold").val((localStorage.getItem("rpc_fold") || "0"));
                var rpc_sync = localStorage.getItem("rpc_sync");
                if (rpc_sync == "false") {
                    $("#rpc_sync").prop("checked", false);
                } else {
                    $("#rpc_sync").prop("checked", true);
                }
                var svip =localStorage.getItem("svip");
                if (svip == null){
                    svip = (yunData.is_svip == 0) ? "false" : "true";
                }
                if (svip == "true"){
                    $("#svip").prop("checked", true);
                } else {
                    $("#svip").prop("checked", false);
                }
                var md5_checksum = localStorage.getItem("md5_checksum") || "false";
                if (md5_checksum == "false") {
                    $("#md5_checksum").prop("checked", false);
                } else {
                    $("#md5_checksum").prop("checked", true);
                }
                $("#setting_aria2_dir").val(localStorage.getItem("rpc_dir"));
                $("#setting_aria2_useragent_input").val(localStorage.getItem("UA") || defaultUA);
                $("#setting_aria2_referer_input").val(localStorage.getItem("referer") || defaultreferer);
                $("#setting_aria2_headers").val(localStorage.getItem("rpc_headers"));
                var rpc_list = JSON.parse(localStorage.getItem("rpc_list") || '[{"name":"ARIA2 RPC","url":"http://localhost:6800/jsonrpc"}]');
                $(".rpc_list").remove();
                for (var i in rpc_list) {
                    var num = (+i) + 1;
                    var addBtn = 1 == num ? '<a id="add_rpc" href="javascript:;" >ADD RPC</a>' : "";
                    var row = '<tr class="rpc_list"><td><input id="rpc_name_' + num + '" type="text" value="' + rpc_list[i]["name"] + '" class="input-medium">：</td><td><input id="rpc_url_' + num + '" type="text" class="input-large" value="' + rpc_list[i]["url"] + '">' + addBtn + "</td></tr>";
                    if ($(".rpc_list").length > 0) {
                        $(row).insertAfter($(".rpc_list").eq(num - 2));
                    } else {
                        $(row).prependTo($("#setting_div_table>tbody"));
                    }
                }
            }
        },
        copyText: function(text) {
            var input = document.createElement("textarea");
            document.body.appendChild(input);
            input.style.position = "fixed";
            input.style.left = "0";
            input.style.top = "0";
            input.value = text;
            input.focus();
            input.select();
            var result = document.execCommand("copy");
            input.remove();
            console.log(result);
            if (result)
                this.showToast("拷贝成功~", "MODE_SUCCESS");
            else
                this.showToast("拷贝失败 QAQ", "MODE_FAILURE");
        },
        // names format  [{"url": "http://pan.baidu.com/", "name": "BDUSS"},{"url": "http://pcs.baidu.com/", "name": "pcsett"}]
        requestCookies: function(names) {
            this.sendToBackground("get_cookies", names, function(value) { cookies = value });
        },
        //获取 http header信息
        getHeader: function(type) {
            var addheader = [];
            var UA = localStorage.getItem("UA") || defaultUA;
            var headers = localStorage.getItem("headers");
            var referer = localStorage.getItem("referer") || defaultreferer;
            addheader.push("User-Agent: " + UA);
            addheader.push("Referer: " + referer);
            if (headers) {
                var text = headers.split("\n");
                for (var i = 0; i < text.length; i++) {
                    addheader.push(text[i]);
                }
            }
            if (cookies) {
                var format_cookies = [];
                for (var key in cookies) {
                    format_cookies.push(key + "=" + cookies[key]);
                }
                addheader.push("Cookie: " + format_cookies.join("; "));
            }

            var header = "";
            if (type == "aria2c_line") {
                for (i = 0; i < addheader.length; i++) {
                    header += " --header " + JSON.stringify(addheader[i]);
                }
                return header;
            } else if (type == "aria2c_txt") {
                for (i = 0; i < addheader.length; i++) {
                    header += " header=" + (addheader[i]) + " \n";
                }
                return header;
            } else if (type == "idm_txt") {
                for (i = 0; i < addheader.length; i++) {
                    if (addheader[i].indexOf("Referer") != 0) {
                        header += (addheader[i].split(": ")[0].toLowerCase() + ": " + addheader[i].split(": ")[1]) + "\n";
                    }
                }

                return header.replace(/\n$/, "");
            } else {
                return addheader;
            }

        },
        //把要下载的link和name作为数组对象传过来
        aria2Data: function(file_list, token, options) {
            var rpc_list = [];
            var self = this;
            if (file_list.length > 0) {
                var length = file_list.length;
                for (var i = 0; i < length; i++) {
                    var rpc_data = {
                        "jsonrpc": "2.0",
                        "method": "aria2.addUri",
                        "id": new Date().getTime(),
                        "params": [
                            [file_list[i].link], {
                                "out": file_list[i].name,
                                "dir": localStorage.getItem("rpc_dir") || null,
                                "header": self.getHeader()
                            }
                        ]
                    };

                    if (localStorage.getItem("md5_checksum") == "true") {
                        var params = rpc_data.params[rpc_data.params.length - 1];
                        params["checksum"] = "md5=" + file_list[i].md5;
                    }
                    if (options.length > 0) {
                        var params = rpc_data.params[rpc_data.params.length - 1];
                        options.forEach(function(item) {
                            params[item[0]] = item[1];
                        });
                    }
                    if (token && token.indexOf("token:") == 0) {
                        rpc_data.params.unshift(token);
                    }

                    rpc_list.push(rpc_data);
                    console.log(rpc_data);
                }
            }
            return rpc_list;
        },
        //文本模式的导出数据框
        dataBox: {
            init: function(type) {
                if ($("#download_ui").length != 0)
                    return this;
                var download_ui = $("<div>").attr("id", "download_ui").append('<div class="top"><a href="javascript:;" title="关闭" id="aria2_download_close" class="close"></a><h3><em></em>ARIA2导出</h3></div>');
                var content_ui = $("<div>").addClass("content").attr("id", "content_ui").appendTo(download_ui);
                download_ui.hide().appendTo($("body"));
                content_ui.empty();
                var download_menu = $("<div>").css({ "margin-bottom": "10px" }).appendTo(content_ui);
                $("<a>").attr("id", "aria2c_btn").attr({ "download": "aria2c.down", "target": "_blank" }).addClass("save-button ").html('<em class="global-icon-download"></em><b>存为aria2文件</b>').appendTo(download_menu);
                $("<a>").attr("id", "idm_btn").attr({ "download": "idm.ef2", "target": "_blank" }).addClass("save-button ").html('<em class="global-icon-download"></em><b>存为IDM文件</b>').appendTo(download_menu);
                $("<a>").attr("id", "download_txt_btn").attr({ "download": "download_link.txt", "target": "_blank" }).addClass("save-button ").html('<em class="global-icon-download"></em><b>保存下载链接</b>').appendTo(download_menu);
                $("<a>").attr("id", "copy_txt_btn").attr({ "href": "javascript:void(0);", "data": "" }).addClass("save-button ").html('<em class="global-icon-download"></em><b>拷贝下载链接</b>').appendTo(download_menu);
                // Disable spellcheck and resize for textarea.
                $("<textarea>").attr({ "id": "download_link", "wrap": "off", "spellcheck": false }).css({ "width": "100%", "overflow": "scroll", "height": "180px", "resize": "none" }).appendTo(content_ui);
                CORE.setCenter($("#download_ui"));
                $("#download_ui").on("click", "#aria2_download_close", function() {
                    // Clean up when closing download dialog.
                    if (navigator.msSaveBlob)
                        $("#aria2c_btn, #idm_btn, #download_txt_btn").data("href", "")
                    else
                        $("#aria2c_btn, #idm_btn, #download_txt_btn").attr("href", "data:text/plain;charset=utf-8,");

                    $("#copy_txt_btn").attr("data", "");
                    $("#download_link").val("");

                    download_ui.hide();
                });
                $("#download_ui").on("click", "#copy_txt_btn", function() {
                    CORE.copyText($("#copy_txt_btn").attr("data"));
                });

                // Edge does support `a[download]`, but it ignores the file name, so use `msSaveBlob()` instead
                if (navigator.msSaveBlob) {
                    $("#aria2c_btn, #idm_btn, #download_txt_btn").data("href", "").click(function(e) {
                        var $this = $(this);

                        var s = document.createElement("script");
                        s.textContent = 'navigator.msSaveBlob(new Blob(["' + $this.data("href").replace(/\r/g, "\\r").replace(/\n/g, "\\n") + '"]), "' + $this.attr("download") + '")';
                        document.body.appendChild(s);
                    });
                } else {
                    $("#aria2c_btn, #idm_btn, #download_txt_btn").attr("href", "data:text/plain;charset=utf-8,");
                }
            },
            show: function() {
                $("#download_ui").show();
            },
            onClose: function(callback) {
                $("#download_ui").on("click", "#aria2_download_close", callback);
            },
            //在数据框里面填充数据
            fillData: function(file_list) {
                var files = [];
                var aria2c_txt = [];
                var idm_txt = [];
                var down_txt = [];
                if (file_list.length > 0) {
                    var length = file_list.length;
                    for (var i = 0; i < length; i++) {
                        var filename = (navigator.platform.indexOf("Win") != -1) ? JSON.stringify(file_list[i].name) : CORE.escapeString(file_list[i].name);
                        var cmd_line = "aria2c -c -s10 -k1M -x16 --enable-rpc=false -o " + filename + CORE.getHeader("aria2c_line") + " " + JSON.stringify(file_list[i].link);
                        aria2c_txt_item = [
                            file_list[i].link,
                            CORE.getHeader("aria2c_txt"),
                            " out=" + file_list[i].name,
                            " continue=true",
                            " max-connection-per-server=10",
                            " split=10",
                            " min-split-size=1M"
                        ];
                        if (localStorage.getItem("md5_checksum") == "true") {
                            cmd_line += " --checksum=md5=" + file_list[i].md5;
                            aria2c_txt_item.push(" checksum=md5=" + file_list[i].md5);
                        }
                        cmd_line += "\n";
                        aria2c_txt_item.push("\n");
                        files.push(cmd_line);
                        aria2c_txt.push(aria2c_txt_item.join("\n"));
                        idm_txt.push([
                            "<",
                            file_list[i].link,
                            CORE.getHeader("idm_txt"),
                            "out=" + file_list[i].name,
                            ">\r\n"
                        ].join("\r\n"));
                        down_txt.push(file_list[i].link + "\n");
                    }

                    if (navigator.msSaveBlob) {
                        $("#aria2c_btn").data("href", $("#aria2c_btn").data("href") + aria2c_txt.join(""));
                        $("#idm_btn").data("href", $("#idm_btn").data("href") + idm_txt.join(""));
                        $("#download_txt_btn").data("href", $("#download_txt_btn").data("href") + down_txt.join(""));
                    } else {
                        $("#aria2c_btn").attr("href", $("#aria2c_btn").attr("href") + encodeURIComponent(aria2c_txt.join("")));
                        $("#idm_btn").attr("href", $("#idm_btn").attr("href") + encodeURIComponent(idm_txt.join("")));
                        $("#download_txt_btn").attr("href", $("#download_txt_btn").attr("href") + encodeURIComponent(down_txt.join("")));
                    }
                    $("#copy_txt_btn").attr("data", $("#copy_txt_btn").attr("data") + down_txt.join(""));
                    $("#download_link").val($("#download_link").val() + files.join(""));
                }
            }
        }
    };
})();
module.exports = CORE;


/***/ }),
/* 1 */
/***/ (function(module, exports, __webpack_require__) {

(function() {
    //网盘主页导出
    /*
     基本步骤是首先设定导出模式,文本模式的话
     只需要初始化文本框即可,RPC模式要设置好 RPC地址
     然后开始分析选中的文件 获取当前文件夹的所以文件id
     然后进行比较,如果是文件 直接进行下载 如果是文件夹则递归查找
     遇到文件就下载 遇到文件夹继续获取文件夹里面的内容

     */
    //两种导出模式 RPC模式 和 TXT模式
    var MODE = "RPC";
    var RPC_PATH = "http://localhost:6800/jsonrpc";

    function getHashParameter(name) {
        var hash = window.location.hash;
        hash = hash.substr(1).split("&");
        for (var i = 0; i < hash.length; i++) {
            var pair = hash[i];
            var arr = pair.split("=");
            if (arr[0] == name)
                return decodeURIComponent(decodeURIComponent(arr[1]));
        }
    }

    var Downloader = (function() {
        var delay;

        var currentTaskId = 0;
        // Paths of folders to be processed.
        var folders = [];
        // { id: path } of files to be processed.
        var files = {};
        var completedCount = 0;

        function getNextFile(taskId) {
            if (taskId != currentTaskId)
                return;

            if (folders.length != 0) {
                completedCount++;
                CORE.showToast("正在获取文件列表... " + completedCount + "/" + (completedCount + folders.length - 1), "MODE_SUCCESS");

                var path = folders.pop();
                $.getJSON(window.location.origin + "/api/list", {
                    "dir": path,
                    "bdstoken": yunData.MYBDSTOKEN,
                    "channel": "chunlei",
                    "clienttype": 0,
                    "web": 1
                }).done(function(json) {
                    setTimeout(function() { getNextFile(taskId) }, delay);

                    if (json.errno != 0) {
                        CORE.showToast("未知错误", "MODE_FAILURE");
                        console.log(json);
                        return;
                    }

                    for (var i = 0; i < json.list.length; i++) {
                        var item = json.list[i];
                        if (item.isdir)
                            folders.push(item.path);
                        else
                            files[item.fs_id] = item;
                    }
                }).fail(function(xhr) {
                    CORE.showToast("网络请求失败", "MODE_FAILURE");
                    console.log(xhr);

                    setTimeout(function() { getNextFile(taskId) }, delay);
                });
            } else if (files.length != 0) {
                CORE.showToast("正在获取下载地址... ", "MODE_SUCCESS");
                
                var counter = 0;
                var tmp_files = {};
                for (var fs_id in files) {
                    tmp_files[fs_id] = files[fs_id];
                    counter++;
                    if (counter == 100) {
                        setFileData(tmp_files);
                        // Reset files and counters
                        tmp_files = {};
                        counter = 0;
                    }
                }
                setFileData(tmp_files);

                downloader.reset();
            } else {
                CORE.showToast("一个文件都没有哦", "MODE_CAUTION");
                downloader.reset();
            }
        }

        var downloader = {};

        downloader.addFolder = function(path) {
            folders.push(path);
        };

        downloader.addFile = function(item) {
            files[item.fs_id] = item;
        };

        downloader.start = function() {
            delay = parseInt(localStorage.getItem("rpc_delay")) || 300;
            currentTaskId = new Date().getTime();
            getNextFile(currentTaskId);
        }

        downloader.reset = function() {
            currentTaskId = 0;
            folders = [];
            files = {};
            completedCount = 0;
        };

        return downloader;
    })();

    var sign = btoa(new Function("return " + yunData.sign2)()(yunData.sign3, yunData.sign1));

    function setFileData(files) {
        if (localStorage.getItem("svip") == "true"){
            $.get(window.location.origin + "/api/download", {
                "type": "dlink",
                "bdstoken": yunData.MYBDSTOKEN,
                "fidlist": JSON.stringify(Object.keys(files)),
                "timestamp": yunData.timestamp,
                "sign": sign, 
                "channel": "chunlei",
                "clienttype": 0,
                "web": 1,
                "app_id": 250528
            }, null, "json").done(function(json) {
                var file_list = [];
                if (json.errno != 0) {
                    CORE.showToast("未知错误", "MODE_FAILURE");
                    console.log(json);
                    return;
                }
                for (var i = 0; i < json.dlink.length; i++) {
                    var item = json.dlink[i];
                    var path = files[item.fs_id].path;
                    var md5 = files[item.fs_id].md5;
                    file_list.push({
                        name: path.substr(pathPrefixLength),
                        link: item.dlink,
                        md5: md5 });
                }

                if (MODE == "TXT") {
                    CORE.dataBox.show();
                    CORE.dataBox.fillData(file_list);
                } else {
                    var paths = CORE.parseAuth(RPC_PATH);
                    var rpc_list = CORE.aria2Data(file_list, paths[0], paths[2]);
                    generateParameter(rpc_list);
                }
            }).fail(function(xhr) {
                CORE.showToast("网络请求失败", "MODE_FAILURE");
                console.log(JSON.stringify(xhr));
            });
        } else {
            var file_list = [];
            var restAPIUrl = location.protocol + "//pcs.baidu.com/rest/2.0/pcs/";
            for (var key in files) {
                var path = files[key].path;
                var md5 = files[key].md5;
                var dlink = restAPIUrl + 'file?method=download&app_id=250528&path=' + encodeURIComponent(path);
                file_list.push({ name: path.substr(pathPrefixLength), link: dlink, md5: md5 });
            }
            if (MODE == "TXT") {
                CORE.dataBox.show();
                CORE.dataBox.fillData(file_list);
            } else {
                var paths = CORE.parseAuth(RPC_PATH);
                var rpc_list = CORE.aria2Data(file_list, paths[0], paths[2]);
                generateParameter(rpc_list);
            }
        }

    }

    window.addEventListener("message", function(event) {
        if (event.source != window)
            return;

        if (event.data.type == "selected") {
            Downloader.reset();

            var selectedFile = event.data.data;
            if (selectedFile.length == 0) {
                CORE.showToast("请选择一下你要保存的文件哦", "failure");
                return;
            }

            for (var i = 0; i < selectedFile.length; i++) {
                var item = selectedFile[i];
                if (item.isdir)
                    Downloader.addFolder(item.path);
                else
                    Downloader.addFile(item);
            }

            Downloader.start();
        }
    });

    var pathPrefixLength;

    function getSelected() {
        var path = getHashParameter("path");
        var level = parseInt(localStorage.getItem("rpc_fold")) || 0;

        if (path == undefined || path == "/" || level == -1) {
            pathPrefixLength = 1;
        } else if (level == 0) {
            pathPrefixLength = path.length + 1;
        }

        window.postMessage({ "type": "get_selected" }, "*");
    }
    //生成请求参数 发送给后台 进行 http请求
    function generateParameter(rpc_list) {
        var paths = CORE.parseAuth(RPC_PATH);
        for (var i = 0; i < rpc_list.length; i++) {
            var parameter = { url: paths[1], dataType: "json", type: "POST", data: JSON.stringify(rpc_list[i]), headers: { Authorization: paths[0] } };
            CORE.sendToBackground("rpc_data", parameter, function(success) {
                if (success)
                    CORE.showToast("下载成功!赶紧去看看吧~", "MODE_SUCCESS");
                else
                    CORE.showToast("下载失败!是不是没有开启aria2?", "MODE_FAILURE");
            });
        }
    }

    // Init
    var CORE = __webpack_require__(0);
    CORE.init();
    CORE.requestCookies([{ url: "http://pan.baidu.com/", name: "BDUSS" }, { url: "http://pcs.baidu.com/", name: "pcsett" }]);

    var menu = CORE.addMenu.init("home");
    menu.on("click", ".rpc_export_list", function() {
        MODE = "RPC";
        RPC_PATH = $(this).data("id");
        getSelected();
    });
    menu.on("click", "#aria2_download", function() {
        MODE = "TXT";
        CORE.dataBox.init("home");
        // When closing download dialog, cancel all delay feteching.
        CORE.dataBox.onClose(Downloader.reset);
        getSelected();
    });
    CORE.showToast("初始化成功!", "success");
})();

/***/ })
/******/ ]);