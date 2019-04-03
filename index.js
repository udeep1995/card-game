var gameOptions = {
  gameWidth: 800,
  gameHeight: 600,
  cardSheetWidth: 800,
  cardSheetHeight: 324,
  totalRounds: 10,
  flipSpeed: 200,
  flipZoom: 1.2,
  initialPot: 1000
};
const cardOfOneColor = 13;
const cardColors = 4;
const totalCards = 52;
const ROUND = "Round: ";
const $ = "$ ";
var game = new Phaser.Game(
  gameOptions.gameWidth,
  gameOptions.gameHeight,
  Phaser.AUTO,
  "card-game",
  {
    preload: preload,
    create: create,
    update: update
  }
);

function preload() {
  game.pot = gameOptions.initialPot;
  game.currRound = 1;
  game.deck = Phaser.ArrayUtils.numberArray(0, totalCards - 1);
  game.load.image("back_card", "assets/back_card.png");
  Phaser.ArrayUtils.shuffle(game.deck);
  game.load.spritesheet(
    "cards",
    "assets/cards.png",
    gameOptions.cardSheetWidth / cardOfOneColor,
    gameOptions.cardSheetHeight / cardColors,
    totalCards
  );
  game.load.spritesheet("coin", "assets/coin.png", 32, 32, 5);
}

function create() {
  game.backCard = game.add.sprite(600, 300, "back_card");
  game.backCard.anchor.setTo(0.5);
  game.backCard.scale.setTo(0.75, 0.7);

  var textStyle = {
    font: "Arial Black",
    fontSize: 40,
    fontWeight: "bold",
    stroke: "#000000",
    strokeThickness: 6,
    fill: "#43d637"
  };
  game.rounds = game.add.text(
    game.world.centerX,
    50,
    ROUND + game.currRound,
    textStyle
  );
  game.rounds.anchor.setTo(0.5);
  game.playerPot = game.add.text(100, 100, $ + game.pot, textStyle);
  game.playerPot.fontSize = 18;
  game.playerPot.anchor.setTo(0.5);

  var player = game.add.text(100, 150, "Player", textStyle);
  player.fontSize = 20;
  player.anchor.setTo(0.5);

  var dealer = game.add.text(600, 150, "Dealer", textStyle);
  dealer.fontSize = 20;
  dealer.anchor.setTo(0.5);

  game.betForGreater = game.add.text(250, 250, "Greater", textStyle);
  game.betForGreater.fontSize = 20;
  game.betForGreater.inputEnabled = true;
  game.betForGreater.id = 0;
  game.betForGreater.events.onInputUp.add(bet);

  game.betForLesser = game.add.text(400, 250, "Smaller", textStyle);
  game.betForLesser.fontSize = 20;
  game.betForLesser.inputEnabled = true;
  game.betForLesser.id = 1;
  game.betForLesser.events.onInputUp.add(bet);
  createBets();

  // coin shower animation
  game.coinShower = animationMaker(
    game.world.centerX - 50,
    game.world.centerY,
    1000,
    "coin",
    [0, 1, 2, 3, 4, 5]
  );
  game.coinShower.gravity = 250;

  startGame();
}

function animationMaker(x, y, quantity, key, frames) {
  let emitterInstance = game.add.emitter(x, y, quantity);
  emitterInstance = emitterInstance.makeParticles(
    key,
    frames,
    quantity,
    true,
    true
  );
  return emitterInstance;
}
/**
 * shows options for various bets
 * @param {*} event mouse events
 */
function bet(event) {
  const betId = event ? event.id : null;
  if (betId != null && (betId === 0 || betId === 1)) {
    game.betId = betId;
    game.betForGreater.visible = false;
    game.betForLesser.visible = false;
    game.bets.forEach(bet => {
      if (bet.worth <= game.pot) {
        bet.visible = true;
      }
    });
  }
}

/**
 * creates bet text
 * @param {*} x - x coordinate
 * @param {*} y - y coordinate
 * @param {*} betText - bet amount
 */
function createBetText(x, y, betText) {
  var text = game.add.text(x, y, "$ " + betText, {
    fontSize: 20,
    fill: "#43d637"
  });
  text.worth = betText;
  text.inputEnabled = true;
  text.anchor.setTo(0.5);
  text.visible = false;
  text.events.onInputUp.add(placeBet);
  return text;
}

/**
 * returns card object
 * @param {*} index - card index
 */
function showCard(index) {
  var card = game.add.sprite(0, 0, "cards");
  card.frame = index;
  card.anchor.setTo(0.5);
  card.scale.setTo(2);
  return card;
}

/**
 * places bet
 * @param {*} event
 */
function placeBet(event) {
  const bet = event ? event.worth : null;
  if (bet == null) {
    return;
  }
  game.bet = bet;
  game.bets.forEach(bet => {
    bet.visible = false;
  });
  game.placeBet = game.add.text(
    game.world.centerX,
    gameOptions.gameHeight - 100,
    "PLACE BET",
    { fontSize: 20, fill: "#FFF" }
  );
  game.placeBet.inputEnabled = true;
  game.placeBet.events.onInputUp.add(execute);
}

/**
 * executes the logic of game
 */
function execute() {
  game.backCard.visible = false;
  game.dealerCard = game.deck.splice(0, 1)[0];
  game.dCard = showCard(game.dealerCard);
  game.dCard.position.x = 600;
  game.dCard.position.y = 300;
  game.placeBet.visible = false;

  if (game.playerCard % cardOfOneColor === game.dealerCard % cardOfOneColor) {
    game.result = game.add.text(350, 300, "Player won $0", {
      fill: "#FFF"
    });
  } else {
    switch (game.betId) {
      case 0: {
        if (
          game.playerCard % cardOfOneColor >
          game.dealerCard % cardOfOneColor
        ) {
          game.result = game.add.text(350, 300, "Player lost $" + game.bet, {
            fill: "#FFF"
          });
          game.pot -= game.bet;
        } else {
          game.result = game.add.text(350, 300, "Player won $" + game.bet * 2, {
            fill: "#FFF"
          });
          game.pot += game.bet * 2;
          // coin shower start
          game.coinShower.start(true, Phaser.Timer.SECOND * 3, null, 100);
        }
        break;
      }
      case 1: {
        if (
          game.playerCard % cardOfOneColor >
          game.dealerCard % cardOfOneColor
        ) {
          game.result = game.add.text(350, 300, "Player won $" + game.bet * 2, {
            fill: "#FFF"
          });
          game.pot += game.bet * 2;
          // coin shower start
          game.coinShower.start(true, Phaser.Timer.SECOND * 3, null, 100);
        } else {
          game.result = game.add.text(350, 300, "Player lost $" + game.bet, {
            fill: "#FFF"
          });
          game.pot -= game.bet;
        }
        break;
      }
    }
  }
  game.playerPot.text = $ + game.pot;
  game.result.anchor.setTo(0.5);
  game.winTween = game.add
    .tween(game.result)
    .from({ alpha: 0 }, Phaser.Timer.SECOND * 1.5, "Linear", true);
  game.result.scale.setTo(0.2);
  game.winTween = game.add
    .tween(game.result.scale)
    .to({ x: 1, y: 1 }, Phaser.Timer.SECOND * 3, "Linear", true);

  if (game.pot <= 0 || game.currRound === gameOptions.totalRounds) {
    game.time.events.add(Phaser.Timer.SECOND * 5, endGame, null);
  } else {
    game.winTween.onComplete.add(function() {
      nextRound();
    });
  }
}

function startGame() {
  game.playerCard = game.deck.splice(0, 1)[0];
  game.card = showCard(game.playerCard);
  game.card.position.x = 100;
  game.card.position.y = 300;
}

/**
 * starts next round
 */
function nextRound() {
  // destroys coinshower of previous round
  fadeTween = fadeCards([game.card, game.dCard]);
  fadeTween.onComplete.add(function() {
    game.playerCard = game.deck.splice(0, 1)[0];
    game.card = showCard(game.playerCard);
    game.card.position.x = 100;
    game.card.position.y = 300;
    game.dCard.visible = false;
    game.result.visible = false;
    game.betForGreater.visible = true;
    game.betForLesser.visible = true;
    game.currRound += 1;
    game.rounds.text = ROUND + game.currRound;
    game.backCard.visible = true;
  }, null);
}

/**
 * utility function to generate bet values
 */
function createBets() {
  game.bets = [];
  game.bets[0] = createBetText(100, 450, 1);
  game.bets[1] = createBetText(200, 450, 2);
  game.bets[2] = createBetText(300, 450, 5);
  game.bets[3] = createBetText(400, 450, 10);
  game.bets[4] = createBetText(500, 450, 20);
  game.bets[5] = createBetText(600, 450, 50);
  game.bets[6] = createBetText(700, 450, 100);
  game.bets[7] = createBetText(100, 550, 200);
  game.bets[8] = createBetText(200, 550, 500);
  game.bets[9] = createBetText(300, 550, 1000);
}

/**
 * function executed when game is over
 */
function endGame() {
  game.world.removeAll();
  let endGame;
  if (gameOptions.initialPot - game.pot < 0) {
    endGame = game.add.text(
      game.world.centerX,
      game.world.centerY,
      "Game Ended.Player Won " + $ + (game.pot - gameOptions.initialPot),
      {
        fill: "#FFF"
      }
    );
  } else {
    endGame = game.add.text(
      game.world.centerX,
      game.world.centerY,
      "Game Ended.Player lost " + $ + (gameOptions.initialPot - game.pot),
      {
        fill: "#FFF"
      }
    );
  }
  endGame.anchor.setTo(0.5);
}

function update() {}

function fadeCards(cards) {
  for (var i = 0; i < cards.length; i++) {
    var fadeTween = game.add.tween(cards[i]).to(
      {
        alpha: 0
      },
      500,
      Phaser.Easing.Linear.None,
      true
    );
  }
  return fadeTween;
}
