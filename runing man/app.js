(

    function () {

        var view = {


            clearSrcn: function () {
                // gameModel.drawingContext.clearRect(0, 0, gameModel.gameCanvas.width, gameModel.gameCanvas.height);
            },

            drawRunner: function () {

                // console.log(gameModel.runner.position);


                var img = document.createElement("img");

                img.setAttribute("src", gameModel.runner.sprites.running.src[gameModel.runner.sprites.running.currentSprite]);
                img.setAttribute("widh", 100);
                img.setAttribute('height', 100);
                // img.addEventListener("onload", function() {console.log("image has been loaded"); gameModel.drawingContext.drawImage(img, 20,20);});

                img.onload = function () {
                    //    gameModel.drawingContext.clearRect(gameModel.runner.position.x - 4, gameModel.runner.position.y, gameModel.runner.size.width + 10, gameModel.runner.size.height);
                    view.clearSrcn();


                    var localX = gameModel.runner.position.x;
                    var localY = gameModel.runner.position.y;

                    if (gameController.runnerBeyondSideMotionWindowLeft()) {
                        localX = gameModel.runner.startingPosition.x - (gameModel.runner.size.width * gameModel.runner.sideMotionWindow / 2);

                        console.log("beyond left..", localX);
                    }
                    if (gameController.runnerBeyondSideMotionWindowRight()) {
                        localX = gameModel.runner.startingPosition.x + gameModel.runner.size.width * gameModel.runner.sideMotionWindow / 2;

                        console.log("beyond right..", localX);
                    }

                    gameModel.drawingContext.drawImage(img, localX, localY, gameModel.runner.size.width, gameModel.runner.size.height);
                }
                //  document.body.appendChild(img);

            },



            drawProp: function (prop) {
                var img = document.createElement("img");

                img.setAttribute("src", prop.sprites[0]);
                img.setAttribute("widh", prop.size.width);
                img.setAttribute('height', prop.size.height);


                img.onload = function () {


                    gameModel.drawingContext.drawImage(img, prop.position.x, prop.position.y, prop.size.width, prop.size.height);
                }
                //  document.body.appendChild(img);
            },

            drawAnimatedProp: function (prop) {
                var frameRateToMS = (1 / prop.animations[0].frameRate) * 1000;
                var timeSinceLastFrame = (Date.now() - prop.animations[0].lastFrameTime);

                if (timeSinceLastFrame >= frameRateToMS) {
                    if (prop.animations[0].lastFrameShown >= prop.animations[0].frames.length) {
                        prop.animations[0].lastFrameShown = 0;
                    }
                    prop.animations[0].lastFrameTime = Date.now();
                    gameModel.drawingContext.drawImage(prop.animations[0].frames[prop.animations[0].lastFrameShown], prop.position.x, prop.position.y, prop.size.width, prop.size.height);
                    prop.animations[0].lastFrameShown++;
                    
                   // console.log("drawed frame",prop.animations[0].frames[prop.animations[0].lastFrameShown] );
                }
                else {
                    // console.log("skiping frame...");
                }

            },


            orderPropsByLayer: function (props) {


                return props.sort(function (a, b) {
                    return b.layer - a.layer;
                });
            },

            drawPlatformProps: function () {
                var props = view.orderPropsByLayer(gameModel.gameMap.currentLevel().currentPlaform().staticProps);

                for (var i = 0; i < props.length; i++) {
                    var p = props[i];
                    if (gameController.propVisible(p)) {
                        view.drawProp(p);
                    } else {
                        if (i == 0) {
                            console.log("not visible", p.position);
                            console.log("runner", gameModel.runner.position);

                        }
                    }
                }
            },

            drawAnimatedProps: function () {
                var props = view.orderPropsByLayer(gameModel.gameMap.currentLevel().currentPlaform().animatedProps);

                for (var i = 0; i < props.length; i++) {
                    var p = props[i];
                    view.drawAnimatedProp(p);
                }
            }

        };




        var gameModel = {



            newPlatform: function () {
                return {
                    platformName: "",
                    platformId: "",
                    dimentions: {
                        width: 0,
                        height: 0
                    },
                    staticProps: [{
                        sprites: [],
                        size: {
                            width: 100,
                            height: 100
                        },
                        position: {
                            x: 0,
                            y: 0
                        },
                        layer: 0
                    }]
                }
            },

            newLevel: function () {
                return {
                    currentPlaform: function () {
                        return gameModel.gameMap.currentLevel.platforms[0];
                    },
                    levelName: "",
                    levelId: "",
                    platforms: []
                }
            },

            gameMap: {
                layerRatio: 2,
                currentLevel: function () {
                    return gameModel.gameMap.levels[0];
                },
                levels: []
            },

            gameCanvas: document.getElementById("gameDrawingPort"),
            drawingContext: null,
            gameOn: true,
            animationFrameID: "",
            elapsedTime: 0,

            runner: {
                isMoving: false,
                isJumping: false,
                jumpHeight: 3,
                movingStep: 3,
                sideMotionWindow: 1,
                startingPosition: {
                    x: 0,
                    y: 0
                },
                position: {
                    y: 0,
                    y: 0
                },
                size: {
                    width: 30,
                    height: 60
                },
                sprites: {
                    running: {
                        currentSprite: 0,
                        totalSprites: 2,
                        src: ["sprites/walker/walker00.png", "sprites/walker/walker01.png"]
                    }
                }
            }
        };




        var gameController = {


            propVisible: function (prop) {

                var runnerPosition = gameModel.runner.position;

                var viewableLeft = runnerPosition.x - ((gameModel.gameCanvas.width / 2) * gameModel.gameMap.layerRatio * prop.layer);
                var viewableRight = runnerPosition.x + ((gameModel.gameCanvas.width / 2) * gameModel.gameMap.layerRatio * prop.layer);

                return true; // (prop.position.x < viewableRight && prop.position.x + prop.size.width > viewableLeft);                
            },

            runnerBeyondSideMotionWindowLeft: function () {

                return (gameModel.runner.position.x < (gameModel.runner.startingPosition.x - (gameModel.runner.sideMotionWindow / 2) * gameModel.runner.size.width));
            },

            runnerBeyondSideMotionWindowRight: function () {

                return (gameModel.runner.position.x > gameModel.runner.startingPosition.x + (gameModel.runner.sideMotionWindow / 2) * gameModel.runner.size.width);
            },



            runnerReachedRightBoundary: function () {

                return gameModel.runner.position.x + gameModel.runner.size.width + gameModel.runner.movingStep > gameModel.gameMap.currentLevel().currentPlaform().dimentions.width;
            },

            runnerReachedLeftBoundary: function () {
                return gameModel.runner.position.x - gameModel.runner.movingStep < 0
            },




            adjustPropPosition: function (moveDelta) {

                var prop = null;

                for (var i = 0; i < gameModel.gameMap.currentLevel().currentPlaform().staticProps.length; i++) {
                    prop = gameModel.gameMap.currentLevel().currentPlaform().staticProps[i];
                    prop.position.x += moveDelta.x / (prop.layer * gameModel.gameMap.layerRatio);
                    prop.position.y += moveDelta.y / (prop.layer * gameModel.gameMap.layerRatio);
                }

            },

            moveRunnerRight: function () {
                if (gameModel.runner.isMoving == "left") {
                    gameModel.runner.isMoving = false;
                } else {

                    if (!gameController.runnerReachedRightBoundary()) {
                        gameModel.runner.isMoving = "right";
                        // gameModel.runner.position.x += gameModel.runner.movingStep;
                        gameController.adjustPropPosition({
                            x: -gameModel.runner.movingStep,
                            y: 0
                        });
                    } else {
                        console.log("Runner reached right limit");
                    }


                }
            },

            moveRunnerLeft: function () {

                if (gameModel.runner.isMoving == "right") {
                    gameModel.runner.isMoving = false;
                } else {

                    if (!gameController.runnerReachedLeftBoundary()) {
                        gameModel.runner.isMoving = "left";
                        // gameModel.runner.position.x -= gameModel.runner.movingStep;
                        gameController.adjustPropPosition({
                            x: gameModel.runner.movingStep,
                            y: 0
                        });
                    } else {
                        console.log("Runner reached left limit");
                    }
                }

            },

            moveRunnerUp: function () {
                gameModel.runner.position.y -= gameModel.runner.movingStep;
            },

            moveRunnerDown: function () {
                gameModel.runner.position.y += gameModel.runner.movingStep;
            },

            runnerJump: function () {
                gameModel.runner.isMoving = false;
                gameModel.runner.isJumping = "up";
            },

            handleUserInput: function (e) {

                switch (e.key) {
                    case "Escape":
                        gameModel.gameOn = false;
                        break;

                    case "ArrowRight":
                        gameController.moveRunnerRight();
                        break;

                    case "ArrowLeft":
                        gameController.moveRunnerLeft();
                        break;

                    case "ArrowUp":
                        gameController.runnerJump();
                        break;


                    default:
                        console.log(e);
                }
            },

            setRunnerSprite: function () {
                if (gameModel.runner.sprites.running.currentSprite < gameModel.runner.sprites.running.totalSprites - 1) {
                    gameModel.runner.sprites.running.currentSprite++;

                } else {
                    gameModel.runner.sprites.running.currentSprite = 0;
                }
            },

            updateRunnerSideMovements: function () {
                if (gameModel.runner.isMoving) {
                    gameController.setRunnerSprite();
                    switch (gameModel.runner.isMoving) {
                        case "right":
                            gameController.moveRunnerRight();
                            break;

                        case "left":
                            gameController.moveRunnerLeft();
                            break;
                    }
                }
            },

            runnerReachedJumpHeight: function () {
                return (gameModel.runner.position.y <= (gameModel.gameCanvas.height - gameModel.runner.size.height * gameModel.runner.jumpHeight));
            },

            runnerLanded: function () {
                return (gameModel.runner.position.y >= gameModel.gameCanvas.height - gameModel.runner.size.height);
            },



            updateRunnerJump: function () {
                if (gameModel.runner.isJumping) {
                    switch (gameModel.runner.isJumping) {
                        case "up":
                            if (gameController.runnerReachedJumpHeight())
                                gameModel.runner.isJumping = "down";
                            else
                                gameController.moveRunnerUp();
                            break;


                        case "down":
                            if (gameController.runnerLanded())
                                gameModel.runner.isJumping = false;
                            else
                                gameController.moveRunnerDown();
                            break;

                    }
                }
            },

            updateRunner: function () {
                gameController.updateRunnerSideMovements();
                gameController.updateRunnerJump();
            },

            loop: function (timestamp) {

                if (gameModel.elapsedTime == 0) {
                    gameModel.elapsedTime = timestamp;
                } else if ((timestamp - gameModel.elapsedTime) >= 10) {
                    // console.log("...doing something..", timestamp);
                    gameModel.elapsedTime = 0;
                    gameController.updateRunner();


                    view.drawRunner();
                    view.drawPlatformProps();
                    view.drawAnimatedProps();

                }

                gameModel.animationFrameID = window.requestAnimationFrame(gameController.loop);
                try {
                    if (!gameModel.gameOn) {
                        window.cancelAnimationFrame(gameModel.animationFrameID);
                        gameController.endGame();
                        return;
                    }
                } catch (err) {
                    console.log("something went wrong!", err);
                    return;
                }


            },

            loadAnimations: function () {
                var currentProp = null;
                var currentAnimation = null;


                for (var i = 0; i < gameModel.gameMap.currentLevel().currentPlaform().animatedProps.length; i++) {
                    currentProp =  gameModel.gameMap.currentLevel().currentPlaform().animatedProps[i];
                    for (var j = 0; j < currentProp.animations.length; j++) {
                        currentAnimation = currentProp.animations[j];
                        for (var k = 0; k < currentAnimation.spritesPaths.length; k++) {
                            var img = document.createElement("img");
                            
                            img.setAttribute("src", currentAnimation.spritesPaths[k]);
                            img.setAttribute("widh", currentProp.size.width);
                            img.setAttribute('height', currentProp.size.height);                            
                            currentAnimation.frames.push(img);   
                            
                        }
                    }
                }
            },

            initMap: function () {

                var samplePlatform = gameModel.newPlatform();




                var sampleLevel = {
                    levelName: "sample",
                    levelId: 0,
                    currentPlaform: function () {
                        return gameModel.gameMap.currentLevel().platforms[0];
                    },
                    platforms: [{
                        platformName: "plat 1",
                        platformId: 0,
                        dimentions: {
                            width: gameModel.gameCanvas.width * 5,
                            height: gameModel.gameCanvas.height
                        },

                        animatedProps: [
                            {
                                layer: 6,
                                position: {
                                    x: 100,
                                    y: 300
                                },
                                size: {
                                    width: 100,
                                    height: 100
                                },
                                animations: [
                                    {
                                        frameRate: 1,
                                        lastFrameTime: 0,
                                        lastFrameShown: 0,
                                        spritesPaths: ["sprites/background/animated sprites/neko/neko00.png", "sprites/background/animated sprites/neko/neko01.png", "sprites/background/animated sprites/neko/neko02.png"],
                                        frames: []
                                    }
                                ]
                            },
                            {
                                layer: 6,
                                position: {
                                    x: 460,
                                    y: 300
                                },
                                size: {
                                    width: 100,
                                    height: 100
                                },
                                animations: [
                                    {
                                        frameRate: 4,
                                        lastFrameTime: 0,
                                        lastFrameShown: 0,
                                        spritesPaths: ["sprites/background/animated sprites/space runner/spacerunner00.png","sprites/background/animated sprites/space runner/spacerunner01.png","sprites/background/animated sprites/space runner/spacerunner02.png","sprites/background/animated sprites/space runner/spacerunner03.png","sprites/background/animated sprites/space runner/spacerunner04.png","sprites/background/animated sprites/space runner/spacerunner05.png"],
                                        frames: []
                                    }
                                ]
                            },
                            {
                                layer: 6,
                                position: {
                                    x: 60,
                                    y: 350
                                },
                                size: {
                                    width: 50,
                                    height: 50
                                },
                                animations: [
                                    {
                                        frameRate: 50,
                                        lastFrameTime: 0,
                                        lastFrameShown: 0,
                                        spritesPaths: ["sprites/background/animated sprites/space runner/spacerunner00.png","sprites/background/animated sprites/space runner/spacerunner01.png","sprites/background/animated sprites/space runner/spacerunner02.png","sprites/background/animated sprites/space runner/spacerunner03.png","sprites/background/animated sprites/space runner/spacerunner04.png","sprites/background/animated sprites/space runner/spacerunner05.png"],
                                        frames: []
                                    }
                                ]
                            }
                        ],

                        staticProps: [{
                                layer: 8,
                                sprites: ["sprites/background/cottage/mountain00.jpg"],
                                size: {
                                    width: 1200,
                                    height: 300
                                },
                                position: {
                                    x: 0,
                                    y: 0
                                }
                            },
                            {
                                layer: 3,
                                sprites: ["sprites/background/cottage/cottage01.jpeg"],
                                size: {
                                    width: 100,
                                    height: 100
                                },
                                position: {
                                    x: 500,
                                    y: 110
                                }
                            },
                            {
                                layer: 2,
                                sprites: ["sprites/background/cottage/cottage02.jpeg"],
                                size: {
                                    width: 100,
                                    height: 100
                                },
                                position: {
                                    x: gameModel.gameCanvas.width + 2,
                                    y: 120
                                }
                            },

                            {
                                layer: 1,
                                sprites: ["sprites/background/cottage/dog.jpeg"],
                                size: {
                                    width: 50,
                                    height: 100
                                },
                                position: {
                                    x: gameModel.gameCanvas.width * 2,
                                    y: 140
                                }
                            }
                        ]
                    }]
                };





                gameModel.gameMap.levels.push(sampleLevel);
                gameController.loadAnimations();

            },

            initRunner: function () {
                gameModel.runner.position.x = (gameModel.gameCanvas.width / 2) - gameModel.runner.size.width;
                gameModel.runner.position.y = (gameModel.gameCanvas.height ? gameModel.gameCanvas.height - gameModel.runner.size.height : 100);
                gameModel.runner.startingPosition.x = gameModel.runner.position.x;
                gameModel.runner.startingPosition.y = gameModel.runner.position.y;
            },

            init: function () {

                document.addEventListener("keydown", this.handleUserInput);
                gameModel.drawingContext = gameModel.gameCanvas.getContext("2d");
                gameController.initRunner();
                gameController.initMap();
            },


            endGame: function () {
                console.log("game is ending.. wrapping up...");
            }

        };

        gameController.init();
        gameModel.animationFrameID = window.requestAnimationFrame(gameController.loop);


    })();
