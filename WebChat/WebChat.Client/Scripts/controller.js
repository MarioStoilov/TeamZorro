/// <reference path="class.js" />
/// <reference path="persister.js" />
/// <reference path="jquery-2.0.3.js" />
/// <reference path="ui.js" />
var controllers = (function () {
    var updateTimer = null;

    var rootUrl = "http://zorochat.apphb.com/api/";
    var Controller = Class.create({
        init: function () {
            this.persister = persisters.get(rootUrl);
        },

        loadUI: function (selector) {
            if (this.persister.isUserLoggedIn()) {
                this.loadGameUI(selector);
            }
            else {
                this.loadLoginFormUI(selector);
            }
            this.attachUIEventHandlers(selector);
        },

        loadLoginFormUI: function (selector) {
            var loginFormHtml = ui.loginForm()
            $(selector).html(loginFormHtml);
        },

        loadGameUI: function (selector) {
            var self = this;
            var gameUIHtml =
            ui.gameUI(this.persister.nickname());
            $(selector).html(gameUIHtml);

            this.updateUI(selector);

            updateTimer = setInterval(function () {
                self.updateUI(selector);
            }, 15000);
        },

        attachUIEventHandlers: function (selector) {
            var wrapper = $(selector);
            var self = this;

            wrapper.on("click", "#btn-show-login", function () {
                wrapper.find(".button.selected").removeClass("selected");
                $(this).addClass("selected");
                wrapper.find("#login-form").show();
                wrapper.find("#register-form").hide();
            });

            wrapper.on("click", "#btn-show-register", function () {
                wrapper.find(".button.selected").removeClass("selected");
                $(this).addClass("selected");
                wrapper.find("#register-form").show();
                wrapper.find("#login-form").hide();
            });

            wrapper.on("click", "#btn-login", function () {
                var user = {
                    username: $(selector + " #tb-login-username").val(),
                    password: $(selector + " #tb-login-password").val()
                }

                self.persister.user.login(user, function () {
                    self.loadGameUI(selector);
                }, function (err) {
                    wrapper.find("#error-messages").text(err.responseJSON.Message);
                });
                return false;
            });

            wrapper.on("click", "#btn-register", function () {
                var user = {
                    username: $(selector).find("#tb-register-username").val(),
                    nickname: $(selector).find("#tb-register-nickname").val(),
                    password: $(selector + " #tb-register-password").val()
                }

                self.persister.user.register(user, function () {
                    self.loadGameUI(selector);
                }, function (err) {
                    //wrapper.find("#error-messages").text(err.responseJSON.Message);
                });
                return false;
            });

            wrapper.on("click", "#btn-logout", function () {
                self.persister.user.logout(function () {
                    self.loadLoginFormUI(selector);
                    clearInterval(updateTimer);
                }, function (err) {
                });
            });
        },

        updateUI: function (selector) {
            this.persister.game.open(function (games) {
                var list = ui.openGamesList(games);
                $(selector + " #open-games")
                .html(list);
            });
            this.persister.game.myActive(function (games) {
                var list = ui.activeGamesList(games);
                $(selector + " #active-games")
                .html(list);
            });
            this.persister.message.all(function (msg) {
                var msgList = ui.messagesList(msg);
                $(selector + " #messages-holder").html(msgList);
            });
        }
    });
    return {
        get: function () {
            return new Controller();
        }
    }
}());

$(function () {
    var controller = controllers.get();
    controller.loadUI("#content");
});