// this is a test.....

//represents a single card
function card(cjacket, cvalue) {
	   this.jacket 		= cjacket;
	   this.card_value 	= cvalue;	   
}


// represents a dec of 52 cards
function cardDec() {
	this.cards = new Array();
	
	this.init = function() {
		var cardJackets = new Array("Spade","Diamond","Heart","Club");
	
		// this loop for the card value 1..13	
		for(var v=1; v <= 13; v++) {
			//this loop for the card jacket (spade, diamond, heart, club)
	   	for(var j=0; j <= 3; j++) {
				this.cards.push(new card(cardJackets[j],v));			
			}
		}
		
   };

	this.init();  // automatically initialize object when created
	
	this.deal = function deal(ncards) {		
	   // just return it, if there is only one card left
		if(this.cards.length == 1)
			return this.cards.splice(0,1);
		
		// pick ncards randome cards 
		var dealtcards  	= 0;
		var cardstodeal	= new Array();
		var nextcard;	
		var nextcardpos;
		while( dealtcards < ncards) {
			nextcardpos = Math.round(Math.random() * (this.cards.length - 1));					
		   nextcard = this.cards.splice(nextcardpos,1);			
			cardstodeal.push(nextcard[0]);					
			dealtcards++;									
		}		
		console.log("There are " + this.cards.length + " cards remaining");
		// this.showAllCards();
		return cardstodeal;
	};
	
	this.showAllCards = function() {
		var i;
		console.log("These are the cards in the dec"); 
		for(i=0; i < this.cards.length; i++) {
			console.log(this.cards[i]);
		}
	};
		
}

// represents a hand played
function playedhand() {	
	this.hand_cards = new Array();
	
	this.handvalue = function() {
		var hand_value = 0;
		var i;
		for(i=0; i < this.hand_cards.length; i++) {
			hand_value += +this.hand_cards[i].card_value;
		}
		return hand_value;	
	};
	
	this.displaycards = function() {
		for(var i=0; i < this.hand_cards.length; i++) {
			console.log(this.hand_cards[i]);
		}		
	};
}

// represents one of the players
function player(player_name) {
	this.player_name 	= player_name;
	this.score 			= 0;
	this.hands_played = new Array();
}


function blackJack() {
	this.number_of_players = prompt("please indicate number of players");
	this.players = new Array();
	
	this.init = function() {
		var i;
		for(i=0; i < this.number_of_players; i++) {
			this.players.push(new player(prompt("please enter the name for player " + i)));			
		}
	};
	
	this.play = function(card_dec) {
		while(card_dec.cards.length > 0 ) { //--> while there are still cards left to deal
			var current_player;			
			var current_play_hand; 
			var i;
			for(i=0; i < this.players.length; i++) {  // --> iterate through every player
				var play_more = true;
				current_play_hand= new playedhand();				
				current_player = this.players[i];
				console.log("%cPlayer " + i + " : [" + current_player.player_name + "] is now playing.", 
								"color: blue; font-size: large");  
				console.log(current_player.player_name + "'s Score: " + current_player.score);
				while(play_more) {	
					
					
					current_play_hand.hand_cards.push( card_dec.deal(1)[0] );
					console.log("A new card jas been dealt for " + current_player.player_name);
					console.log("These are your cards...");
					current_play_hand.displaycards();
					console.log("%cThe value of these cards is " + current_play_hand.handvalue(),
								  "color: purple; font-size: small");
										
					if(card_dec.cards.length <= 0) {	// no more cards, break out of all loops					
						i = +this.players.length + 1;
						console.log("All cards have been dealt!");
						break;
					}
					play_more = (prompt("Another card?(Y/N)").toUpperCase() == "Y");				
				}
				// end of player's turn
				console.log(current_player.player_name + " has retired for this turn...");
				current_player.hands_played.push(current_play_hand); // store all cards played by this player	
				
				if ( current_play_hand.handvalue() ==  21 ) { // avoid ending up with 1/0
					current_player.score += 20;  
				}
				else {
					current_player.score += Math.round((1 / Math.abs(current_play_hand.handvalue() - 21)) * 10);			
				}
				console.log("Switching to other player....");				
			}	
		   // end of round
			this.displayscores();
		}
		// end of game
		console.log("There are no more cards to play with.  The game has ended");
		this.displayscores();
	};
	
		
	this.displayscores	= function() {		
		var current_player;
		var i;
		console.log("%cPlayer's scores...", "color: green; font-size: large");
		for(i=0; i < this.players.length; i++) {
			current_player = this.players[i];
			console.log("%c" + current_player.player_name + " :" + current_player.score,
						   "color: green; font-size: medium");
			// console.log(current_player.hands_played);
		}
	};
	
	// initialize and start playing!
	 this.init();
	 this.play(new cardDec());
}
