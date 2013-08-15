/// <reference path="validation-controler.js" />
/// <reference path="Class.js" />
/// <reference path="../jquery-2.0.2.js" />
/// <reference path="persister.js" />
/// <reference path="ui.js" />

$(document).ready(function () {
    var myMainPersister = persister.mainPersister('http://localhost:47655/api');//47655

    // Check is user logged in
    if (localStorage.getItem('authCode') == '' || localStorage.getItem('authCode') == null || localStorage.getItem('authCode') == undefined) {
        $('#login-container').html(ui.drawLogIn());
    }
    else {
        $('#login-container').html(ui.drawLoggedIn());
        $('#main-chat-container').html(ui.drawUserInteraction());
        $('#left-side-bar').html(ui.drawSidebars(myMainPersister));
    }

    var int = self.setInterval(function () {
        if (localStorage.getItem('authCode') != '') {
        }
        else {
            window.clearInterval(int);
        }
    }, 5000);

    var eventControler = (function () {
        function addElementsEvents(persister) {
            // Logout
            $('#wrapper').on('click', '#user-loged-in #button-logout', function () {
                $('#login-container').empty();
                $('#left-side-bar').empty();
                $('#right-side-bar').empty();
                $('#main-chat-container').empty();
                $('#current-chat-state').empty();
                $('#main-chat-container').append($('<div />').attr('id', 'error-messages'));
                $('#main-chat-container').append($('<div />').attr('id', 'messages'));
                $('#login-container').html(ui.drawLogIn());

                persister.user.logout();
            });

            // Log in
            $('#wrapper').on('click', '#button-log-in', function () {
                var username = $('#login-user-nickname').val();
                var password = $('#login-user-password').val();

                ui.clearErrorMessage();
                persister.user.login(username, password, ui.showErrorMessage);
                setTimeout(function () {
                    if (localStorage.getItem('authCode') != '' && localStorage.getItem('authCode') != undefined) {
                        ui.clearErrorMessage();
                        $('#login-container').html(ui.drawLoggedIn());
                        $('#main-chat-container').html(ui.drawUserInteraction());
                        $('#left-side-bar').html(ui.drawSidebars(myMainPersister));
                    }
                }, 500);
            });

            // Register now
            $('#wrapper').on('click', '#register-now', function () {
                $('#login-container').html(ui.drawRegister());
            });

            // Register back
            $('#wrapper').on('click', '#back-to-homepage', function () {
                $('#login-container').html(ui.drawLogIn());
            });

            // Send register request
            $('#wrapper').on('click', '#button-register', function () {
                var username = $('#register-user-nickname').val();
                var nickname = $('#register-user-nickname').val();
                var password = $('#register-user-password').val();
                var passwordRe = $('#register-user-password-re').val();

                var isUsernameValid = validationControler.isUsernameCorrect(username);
                var isPasswordValid = validationControler.isPasswordCorrect(password);
                var isPasswordsEqual = password === passwordRe;

                if (isUsernameValid && isPasswordValid && isPasswordsEqual) {
                    persister.user.register(username, nickname, password, ui.showErrorMessage);
                    setTimeout(function () {
                        $('#login-container').html(ui.drawLoggedIn());
                        ui.clearErrorMessage();
                    }, 500);
                }
                else {
                    ui.showAppErrorMessage('Invalid username or password! Check your account information and try again.');
                }
            });

            // Create new chat
            $('#wrapper').on('click', '#users-user-list li a', function () {
                var userID = $(this).parent('li').attr('data-user-id');
                persister.chat.create(userID, function () {
                    $('#left-side-bar').html(ui.drawSidebars(myMainPersister));
                },
                ui.showErrorMessage);
            });

            // Open chat window
            $('#wrapper').on('click', '#chats-active-list li a', function () {
                var chatID = $(this).parent('li').attr('data-chat-id');
                var channelID = $(this).parent('li').attr('data-chat-channel');

                $('#current-chat-container').html(ui.drawSendMessageMenu());

                persister.messages.all(chatID,
                    function (data) {
                        ui.drawMessages(data);
                    })
            });

            // Create new game confirm
            $('#wrapper').on('click', '#confirm-create-game', function () {
                var gameName = $('#create-game-name').val();
                var gamePassword = $('#create-game-password').val();
                $('#game-user-create').remove();
                $('#login-container').html(ui.drawLoggedIn());

                ui.clearErrorMessage();
                ui.showMessage('Game created');
                persister.game.create(gameName, gamePassword, ui.clearErrorMessage, ui.showErrorMessage);
            });

            // Show or hide list of my games
            $('#wrapper').on('click', '#games-active', function () {
                ui.showOrHideElements('#games-active');
            });

            $('#wrapper').on('click', '#games-open', function () {
                ui.showOrHideElements('#games-open');
            });

            $('#wrapper').on('click', '#games-messages', function () {
                ui.showOrHideElements('#games-messages');
            });

            // Confirm join in game
            $('#wrapper').on('click', '.button-join', function () {
                var gameID = $(this).parent('li').attr('data-game-id');
                var gamePassword;
                persister.game.join(gameID, gamePassword, function () {
                    ui.clearErrorMessage;
                    $('#left-side-bar').html(ui.drawSidebars(myMainPersister));
                }, ui.showErrorMessage);

                ui.showMessage('You joined in game.');
            });

            // Start game new version
            $('#wrapper').on('click', '.button-start', function () {
                var gameID = $(this).parent('li').attr('data-game-id');
                //var gameNumber = $('#player-guess-text').val();
                //drawSidebars(persister);
                persister.game.start(gameID, function () {
                    ui.clearErrorMessage;
                    $('#left-side-bar').html(ui.drawSidebars(myMainPersister));
                }, ui.showErrorMessage);
                ui.showMessage('Game is started.');
            });

            // View current game state
            $('#wrapper').on('click', '.button-view-state', function () {
                var gameID = $(this).parent('li').attr('data-game-id');
                //var gameNumber = $('#player-guess-text').val();
                persister.game.field(gameID, function (data) {
                    ui.clearErrorMessage();
                    $('#current-chat-container').empty();
                    $('#current-chat-container').load('game-field.html', function () {
                        ui.drawCurrentGameState(data);
                    });
                }, ui.showErrorMessage);
            });
        }

        return {
            addEvents: addElementsEvents
        }
    }());

    eventControler.addEvents(myMainPersister);
});