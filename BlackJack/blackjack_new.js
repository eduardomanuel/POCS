var blackJack = {

    //--------------------------------
    // model represents all objects necessary to represent the game

    model: {
        player: function () {
            return {};
        },

        card: function () {
            return {};
        },

        cardDeck: function () {
            return {};
        }
    },


    //----------------------------
    // deals with visualizing the game

    view: {
        showGreeting: function() {
            console.log("Welcome to my BlackJack game!");
        }
    },


    //----------------------------
    // this is the logic (brains) for the game 

    controller: {
        play : function() {
            view.showGreeting();
        }
        
    }
};