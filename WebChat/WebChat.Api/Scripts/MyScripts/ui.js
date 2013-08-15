/// <reference path="../jquery-2.0.2.js" />
/// <reference path="persister.js" />

var ui = (function () {
    function drawLogInForm() {
        return '<fieldset id="login-user-container">' +
                    '<legend>Log In</legend>' +
                    '<label for="login-user-nickname">Nickname</label>' +
                    '<input id="login-user-nickname" type="text" name="name" value="" placeholder="Enter your nickname" autofocus="true" />' +
                    '<label for="login-user-password">Password</label>' +
                    '<input id="login-user-password" type="password" name="name" value="" placeholder="Enter your password" />' +
                    '<button id="button-log-in">Log In</button>' +
                    '<a id="register-now" href="#">Register now</a>' +
                '</fieldset>';
    }

    function drawRegisterForm() {
        return '<fieldset id="register-user-container">' +
                    '<legend>Register</legend>' +
                    '<label for="register-user-name">Name</label>' +
                    '<input id="register-user-name" type="text" name="name" value="" placeholder="Enter your first and last name" autofocus="true" />' +
                    '<label for="register-user-nickname">Nickname</label>' +
                    '<input id="register-user-nickname" type="text" name="name" value="" placeholder="Enter your nickname" />' +
                    '<label for="register-user-password">Password</label>' +
                    '<input id="register-user-password" type="password" name="name" value="" placeholder="Enter your password" />' +
                    '<label for="register-user-password-re">Password</label>' +
                    '<input id="register-user-password-re" type="password" name="name" value="" placeholder="Confirm your password" />' +
                    '<a id="back-to-homepage" href="#" >Back</a>' +
                    '<button id="button-register">Register</button>' +
                '</fieldset>';
    }

    function drawLoggedInForm() {
        return '<div id="user-loged-in">' +
                    '<p id="greetings">Hello, ' + localStorage.getItem('userNickname') + '</p>' +
                    '<p>Let\'s chat ...</p>' +
                    '<button id="button-logout">Log out</button>' +
                '</div>';
    }

    function drawUserInteraction() {
        return '<div id="error-messages"></div>' +
               '<div id="messages"></div>' +
               '<div id="game-state-container"></div>';
    }

    function showAppErrorMessage(message) {
        $('#error-messages').text(message);

        setTimeout(function () {
            $('#error-messages').text('');
        }, 15000);
    }

    function showErrorMessage(err) {
        //$('#error-messages').text(err.responseJSON.errCode + ': ' + err.responseJSON.Message);
        $('#error-messages').text(err.responseJSON.Message);

        setTimeout(function () {
            $('#error-messages').text('');
        }, 15000);
    }

    function showMessage(message) {
        $('#messages').text(message);

        setTimeout(function () {
            $('#messages').text('');
        }, 15000);
    }

    function clearErrorMessage() {
        $('#error-messages').text('');
    }

    function showOrHideElements(elementID) {
        if ($(elementID + '-list').hasClass('show')) {
            $(elementID + '-list').hide(1500);
            $(elementID + '-list').removeClass('show');
        }
        else {
            $(elementID + '-list').show(1500);
            $(elementID + '-list').addClass('show');
        }

        return false;
    }

    function drawListOfChats(myActiveChats, container, conatinerTitle, type) {
        $(container)
            .append($('<h2 />').attr('id', 'chats-' + type).text(conatinerTitle))
            .append($('<ul />').attr({ 'id': 'chats-' + type + '-list', 'class': 'show' }));

        var elementsContainer = $(container + ' #' + 'chats-' + type + '-list');

        var currentUser = localStorage.getItem('userId');

        for (var i = 0; i < myActiveChats.length; i++) {
            var otherUser;

            if (myActiveChats[i].User1.Id != currentUser) {
                otherUser = myActiveChats[i].User1.Name;
            }
            else {
                otherUser = myActiveChats[i].User2.Name;
            }


            var currentLi = $('<li />').attr({ 'data-chat-id': myActiveChats[i].Id, 'data-chat-channel': myActiveChats[i].Channel })
                .append($('<a />').attr('href', '#').text(otherUser));

            elementsContainer.append(currentLi);
        }
    }

    function drawListOfUsers(users, container, conatinerTitle, type) {
        $(container)
            .append($('<h2 />').attr('id', 'users-' + type).text(conatinerTitle))
            .append($('<ul />').attr({ 'id': 'users-' + type + '-list', 'class': 'show' }));

        var elementsContainer = $(container + ' #' + 'users-' + type + '-list');

        for (var i = 0; i < users.length; i++) {
            elementsContainer
                .append($('<li />').attr('data-user-id', users[i].Id).append($('<a />').attr('href', '#').text(users[i].Name)));
        }
    }

    function drawCreateGameMenu() {
        return '<div id="chat-user">' +
                    '<input id="message-text" type="text" name="name" value="" placeholder="Message" />' +
                    '<button id="confirm-send">Send</button>' +
                '</div>';
    }

    function drawMessages(data) {
        var elementsContainer = $('#current-game-state').append($('<ul />'));

        console.log(elementsContainer);

        for (var i = 0; i < data.length; i++) {
            elementsContainer
                .append($('<li />').attr('data-owner-id', data[i].OwnerId).text(data[i].Content));

            console.log(data[i].Content);
            console.log(data[i].OwnerId);
        }



        //return '<div id="game-user-join">' +
        //            '<label for="join-game-number">Number </label>' +
        //            '<input id="join-game-number" type="text" name="name" value="" placeholder="Enter your number" />' +
        //            '<label for="join-game-password">Pasword </label>' +
        //            '<input id="join-game-password" type="password" name="name" value="" placeholder="Enter game password" />' +
        //            '<button id="confirm-join-game">OK</button>' +
        //        '</div>';
    }

    function drawSidebars(persister) {
        $('#left-side-bar').empty();
        $('#right-side-bar').empty();
        persister.chat.all(function (data) {
            drawListOfChats(data, '#left-side-bar', 'My active chats', 'active');
        });

        //persister.chat.open(function (data) {
        //    drawListOfChats(data, '#left-side-bar', 'Open games', 'open');
        //});

        persister.user.all(function (data) {
            drawListOfUsers(data, '#right-side-bar', 'Users', 'user');
        });
    }

    function drawCurrentGameState(currentState) {
        //$('#game-state-container').empty();
        var inTurn;
        var blueUser = currentState.blue.nickname;
        var redUser = currentState.red.nickname;

        if (currentState.inTurn == 'blue') {
            inTurn = 'In turn is: ' + blueUser;
        }
        else if (currentState.inTurn == 'red') {
            inTurn = 'In turn is: ' + redUser;
        }

        $('#game-state-container')
            .append($('<p />').attr('id', 'game-name').text(redUser + ' vs. ' + blueUser))
            .append($('<p />').attr('id', 'game-state-text').text(inTurn))
            .append($('<p />').attr('id', 'game-name').text('Game name: ' + currentState.title))
            .append($('<p />').attr('id', 'game-state-turn').text('Turn: ' + currentState.turn));

        $('#game-state-container table').attr('data-game-id', currentState.gameId);

        var i = 0;

        for (i = 0; i < currentState.red.units.length; i++) {
            var redPosX = currentState.red.units[i].position.x;
            var redPosY = currentState.red.units[i].position.y;
            var redUnitType = currentState.red.units[i].type;
            var redUnitID = currentState.red.units[i].id;

            if (redUnitType == 'warrior') {
                $('#game-state-container table tr td[data-pos-x=' + redPosX + '][data-pos-y=' + redPosY + ']').attr('data-unit-id', redUnitID).text('W');
            }
            else if (redUnitType == 'ranger') {
                $('#game-state-container table tr td[data-pos-x=' + redPosX + '][data-pos-y=' + redPosY + ']').attr('data-unit-id', redUnitID).text('R');
            }
            
        }

        for (i = 0; i < currentState.blue.units.length; i++) {
            var bluePosX = currentState.blue.units[i].position.x;
            var bluePosY = currentState.blue.units[i].position.y;
            var blueUnitType = currentState.blue.units[i].type;
            var blueUnitID = currentState.blue.units[i].id;

            if (blueUnitType == 'warrior') {
                $('#game-state-container table tr td[data-pos-x=' + bluePosX + '][data-pos-y=' + bluePosY + ']').attr('data-unit-id', blueUnitID).text('W');
            }
            else if (blueUnitType == 'ranger') {
                $('#game-state-container table tr td[data-pos-x=' + bluePosX + '][data-pos-y=' + bluePosY + ']').attr('data-unit-id', blueUnitID).text('R');
            }
        }
    }

    function drawChatArea() {

    }

    return {
        drawLogIn: drawLogInForm,
        drawRegister: drawRegisterForm,
        drawLoggedIn: drawLoggedInForm,
        drawUserInteraction: drawUserInteraction,
        showAppErrorMessage: showAppErrorMessage,
        showErrorMessage: showErrorMessage,
        showMessage: showMessage,
        clearErrorMessage: clearErrorMessage,
        drawListOfChats: drawListOfChats,
        drawListOfUsers: drawListOfUsers,
        drawCreateGameMenu: drawCreateGameMenu,
        drawMessages: drawMessages,
        drawSidebars: drawSidebars,
        drawCurrentGameState: drawCurrentGameState,
        showOrHideElements: showOrHideElements,
        drawChatArea:drawChatArea
    };
}());