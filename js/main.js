// =============================================================================
// sprites
// =============================================================================

//
// hero sprite
//
function Hero(game, x, y) {
    Phaser.Sprite.call(this, game, x, y, 'hero');
    this.anchor.set(0.5, 0.5);

    // physic properties
    this.game.physics.enable(this);
    this.body.collideWorldBounds = true;

    this.animations.add('stop', [0]);
    this.animations.add('run', [1, 2], 8, true); // 8fps looped
    this.animations.add('jump', [3]);
    this.animations.add('fall', [4]);
}

// inherit from Phaser.Sprite
Hero.prototype = Object.create(Phaser.Sprite.prototype);
Hero.prototype.constructor = Hero;

Hero.prototype.move = function (direction) {
    const SPEED = 200;
    this.body.velocity.x = direction * SPEED;

    // update image flipping & animations
    if (this.body.velocity.x < 0) {
        this.scale.x = -1;
    }
    else if (this.body.velocity.x > 0) {
        this.scale.x = 1;
    }
};

Hero.prototype.jump = function () {
    const JUMP_SPEED = 550;
    var canJump = this.body.touching.down;

    if (canJump) {
        this.body.velocity.y = -JUMP_SPEED;
    }

    return canJump;
};

Hero.prototype.bounce = function () {
    const BOUNCE_SPEED = 200;
    this.body.velocity.y = -BOUNCE_SPEED;
};

Hero.prototype.bounce2 = function () {
    const BOUNCE_SPEED = 500;
    this.body.velocity.y = -BOUNCE_SPEED;
};

Hero.prototype.update = function () {
    // update sprite animation, if it needs changing
    var animationName = this._getAnimationName();
    if (this.animations.name !== animationName) {
        this.animations.play(animationName);
    }
};

Hero.prototype._getAnimationName = function () {
    var name = 'stop'; // default animation

    // jumping
    if (this.body.velocity.y < 0) {
        name = 'jump';
    }
    // falling
    else if (this.body.velocity.y >= 0 && !this.body.touching.down) {
        name = 'fall';
    }
    else if (this.body.velocity.x !== 0 && this.body.touching.down) {
        name = 'run';
    }

    return name;
};

//
// Spider (enemy)
//
function Spider(game, x, y) {
    Phaser.Sprite.call(this, game, x, y, 'spider');

    // anchor
    this.anchor.set(0.5);
    // animation
    this.animations.add('crawl', [0, 1, 2], 8, true); // 8fps, looped
    this.animations.add('die', [0, 4, 0, 4, 0, 4, 3, 3, 3, 3, 3, 3], 12);
    this.animations.play('crawl');

    // physic properties
    this.game.physics.enable(this);
    this.body.collideWorldBounds = true;
    this.body.velocity.x = Spider.SPEED;
}

Spider.SPEED = 100;

// inherit from Phaser.Sprite
Spider.prototype = Object.create(Phaser.Sprite.prototype);
Spider.prototype.constructor = Spider;

Spider.prototype.update = function () {
    // check against walls and reverse direction if necessary
    if (this.body.touching.right || this.body.blocked.right) {
        this.body.velocity.x = -Spider.SPEED; // turn left
    }
    else if (this.body.touching.left || this.body.blocked.left) {
        this.body.velocity.x = Spider.SPEED; // turn right
    }
};

Spider.prototype.die = function () {
    this.body.enable = false;

    this.animations.play('die').onComplete.addOnce(function () {
        this.kill();
    }, this);
};

function SpiderBoss(game, x, y) {
    Phaser.Sprite.call(this, game, x, y, 'spider_boss');

    // anchor
    this.anchor.set(0.5);
    // animation
    this.animations.add('crawl', [0, 1, 2], 8, true); // 8fps, looped
    this.animations.add('die', [0, 4, 0, 4, 0, 4, 3, 3, 3, 3, 3, 3], 12);
    this.animations.play('crawl');

    // physic properties
    this.game.physics.enable(this);
    this.body.collideWorldBounds = true;
    this.body.velocity.x = SpiderBoss.SPEED;
    
    this.health = 5;
}

SpiderBoss.SPEED = 200;

// inherit from Phaser.Sprite
SpiderBoss.prototype = Object.create(Phaser.Sprite.prototype);
SpiderBoss.prototype.constructor = SpiderBoss;

SpiderBoss.prototype.update = function () {
    // check against walls and reverse direction if necessary
    if (this.body.touching.right || this.body.blocked.right) {
        this.body.velocity.x = -SpiderBoss.SPEED; // turn left
    }
    else if (this.body.touching.left || this.body.blocked.left) {
        this.body.velocity.x = SpiderBoss.SPEED; // turn right
    }
};

SpiderBoss.prototype.die = function () {
    this.body.enable = false;

    this.animations.play('die').onComplete.addOnce(function () {
        this.kill();
    }, this);
};


// =============================================================================
// game states
// =============================================================================

PlayState = {};

const LEVEL_COUNT = 6;

PlayState.init = function (data) {
    this.game.renderer.renderSession.roundPixels = true;

    this.keys = this.game.input.keyboard.addKeys({
        left: Phaser.KeyCode.LEFT,
        right: Phaser.KeyCode.RIGHT,
        up: Phaser.KeyCode.UP,
        spacebar: Phaser.KeyCode.SPACEBAR,
        escape: Phaser.KeyCode.ESC
    });

    this.coinPickupCount = 0;
    this.hasKey = false;
    if(data.level !== 5){
        this.level = (data.level || 0) % LEVEL_COUNT;
    }
    else{
        music1.stop();
        this.state.start('fin', true, false);
    }
    
};

PlayState.preload = function () {
    this.game.load.json('level:0', 'data/level00.json');
    this.game.load.json('level:1', 'data/level01.json');
    this.game.load.json('level:2', 'data/level02.json');
    this.game.load.json('level:3', 'data/level03.json');
    this.game.load.json('level:4', 'data/level04.json');

    this.game.load.image('font:numbers', 'images/numbers.png');

    this.game.load.image('background', 'images/background.png');
    this.game.load.image('pause-menu', 'images/pause_menu.png');
    this.game.load.image('continue-button', 'images/continue_button.png');
    this.game.load.image('restart-button', 'images/restart_button.png');
    this.game.load.image('menu-button', 'images/menu_button.png');
    this.game.load.image('ground', 'images/ground.png');
    this.game.load.image('grass:8x1', 'images/grass_8x1.png');
    this.game.load.image('grass:6x1', 'images/grass_6x1.png');
    this.game.load.image('grass:4x1', 'images/grass_4x1.png');
    this.game.load.image('grass:2x1', 'images/grass_2x1.png');
    this.game.load.image('grass:1x1', 'images/grass_1x1.png');
    this.game.load.image('invisible-wall', 'images/invisible_wall.png');
    this.game.load.image('icon:coin', 'images/coin_icon.png');
    this.game.load.image('key', 'images/key.png');
    this.game.load.image('bullet', 'images/bullet.png');

    this.game.load.spritesheet('coin', 'images/coin_animated.png', 22, 22);
    this.game.load.spritesheet('spider', 'images/spider.png', 42, 32);
    this.game.load.spritesheet('spider_boss', 'images/spider_boss.png', 42, 32);
    this.game.load.spritesheet('hero', 'images/hero.png', 36, 42);
    this.game.load.spritesheet('door', 'images/door.png', 42, 66);
    this.game.load.spritesheet('icon:key', 'images/key_icon.png', 34, 30);

    this.game.load.audio('sfx:jump', 'audio/jump.wav');
    this.game.load.audio('sfx:coin', 'audio/coin.wav');
    this.game.load.audio('sfx:stomp', 'audio/stomp.wav');
    this.game.load.audio('sfx:key', 'audio/key.wav');
    this.game.load.audio('sfx:door', 'audio/door.wav');
    this.game.load.audio('about-music', 'audio/Shiroi Tori.mp3');
};

PlayState.create = function () {
    // create sound entities
    this.sfx = {
        jump: this.game.add.audio('sfx:jump'),
        coin: this.game.add.audio('sfx:coin'),
        stomp: this.game.add.audio('sfx:stomp'),
        key: this.game.add.audio('sfx:key'),
        door: this.game.add.audio('sfx:door')
    };

    // create level
    this.game.add.image(0, 0, 'background');
    this._loadLevel(this.game.cache.getJSON(`level:${this.level}`));

    // crete hud with scoreboards)
    this._createHud();

    this.keys.escape.onDown.add(function () {
        //this.game.paused = true;
        this.hero.body.moves = false;

        pauseMenu = this.game.add.image(this.game.world.centerX, this.game.world.centerY, 'pause-menu');
        pauseMenu.anchor.set(0.5, 0.5);

        continueMenu = this.game.add.button(this.game.world.centerX, this.game.world.centerY - 50, 'continue-button', function() {
            pauseMenu.destroy();
            restartMenu.destroy();
            backToMenu.destroy();
            continueMenu.destroy();
            this.hero.body.moves = true;
            //this.game.paused = false;
        }, this, 2, 1, 0);
        continueMenu.anchor.set(0.5, 0.5);

        restartMenu = this.game.add.button(this.game.world.centerX, this.game.world.centerY + 35, 'restart-button', function() {
            this.game.state.restart(true, false, {level: this.level});
        }, this, 2, 1, 0);
        restartMenu.anchor.set(0.5, 0.5);

        backToMenu = this.game.add.button(this.game.world.centerX, this.game.world.centerY + 120, 'menu-button', function() {
            this.game.state.start('menu', false, false);
        }, this, 2, 1, 0);
        backToMenu.anchor.set(0.5, 0.5);
    }, this);
};

PlayState.update = function () {
    this._handleCollisions();
    this._handleInput();
    this._handleCollisionWithBottomWorld();

    this.coinFont.text = `x${this.coinPickupCount}`;
    this.keyIcon.frame = this.hasKey ? 1 : 0;
};

PlayState._handleCollisions = function () {
    this.game.physics.arcade.collide(this.spiders, this.platforms);
    this.game.physics.arcade.collide(this.spiders, this.enemyWalls);
    this.game.physics.arcade.collide(this.spiderBoss, this.platforms);
    this.game.physics.arcade.collide(this.spiderBoss, this.enemyWalls);
    this.game.physics.arcade.collide(this.hero, this.platforms);

    this.game.physics.arcade.overlap(this.hero, this.coins, this._onHeroVsCoin,
        null, this);
    this.game.physics.arcade.overlap(this.hero, this.spiders,
        this._onHeroVsEnemy, null, this);
    this.game.physics.arcade.overlap(this.hero, this.spiderBoss,
        this._onHeroVsEnemyBoss, null, this);
    this.game.physics.arcade.overlap(this.hero, this.key, this._onHeroVsKey,
        null, this);
    this.game.physics.arcade.overlap(this.hero, this.door, this._onHeroVsDoor,
        // ignore if there is no key or the player is on air
        function (hero, door) {
            return this.hasKey && hero.body.touching.down;
        }, this);
};

PlayState._handleInput = function () {
    if (this.keys.left.isDown) { // move hero left
        this.hero.move(-1);
    }
    else if (this.keys.right.isDown) { // move hero right
        this.hero.move(1);
    }
    else { // stop
        this.hero.move(0);
    }

    this.keys.up.onDown.add(function () {
        var didJump = this.hero.jump();
        if (didJump) {
            this.sfx.jump.play();
        }
    }, this);
};

PlayState._handleCollisionWithBottomWorld = function () {
    if(this.hero.body.blocked.down){
        this.hero.kill();
        this.game.state.restart(true, false, {level: this.level});
    }
};

PlayState._loadLevel = function (data) {
    // create all the groups/layers that we need
    this.platforms = this.game.add.group();
    this.bgDecoration = this.game.add.group();
    this.coins = this.game.add.group();
    this.spiders = this.game.add.group();
    this.spiderBoss = this.game.add.group();
    this.enemyWalls = this.game.add.group();
    this.enemyWalls.visible = false;

    // spawn all platforms
    data.platforms.forEach(this._spawnPlatform, this);
    // spawn hero and enemies
    this._spawnCharacters({hero: data.hero, spiders: data.spiders, spiderBoss: data.spiderBoss});
    // spawn important objects
    data.coins.forEach(this._spawnCoin, this);
    this._spawnDoor(data.door.x, data.door.y);
    this._spawnKey(data.key.x, data.key.y);       

    // enable gravity
    const GRAVITY = 1200;
    this.game.physics.arcade.gravity.y = GRAVITY;
};

PlayState._spawnPlatform = function (platform) {
    var sprite = this.platforms.create(
        platform.x, platform.y, platform.image);

    this.game.physics.enable(sprite);
    sprite.body.allowGravity = false;
    sprite.body.immovable = true;

    this._spawnEnemyWall(platform.x, platform.y, 'left');
    this._spawnEnemyWall(platform.x + sprite.width, platform.y, 'right');
};

PlayState._spawnEnemyWall = function (x, y, side) {
    var sprite = this.enemyWalls.create(x, y, 'invisible-wall');
    // anchor and y displacement
    sprite.anchor.set(side === 'left' ? 1 : 0, 1);
    // physic properties
    this.game.physics.enable(sprite);
    sprite.body.immovable = true;
    sprite.body.allowGravity = false;
};

PlayState._spawnCharacters = function (data) {
    // spawn spiders
    data.spiders.forEach(function (spider) {
        var sprite = new Spider(this.game, spider.x, spider.y);
        this.spiders.add(sprite);
    }, this);

    data.spiderBoss.forEach(function (spider_boss) {
        var sprite = new SpiderBoss(this.game, spider_boss.x, spider_boss.y);
        this.spiderBoss.add(sprite);
    }, this);

    // spawn hero
    this.hero = new Hero(this.game, data.hero.x, data.hero.y);
    this.game.add.existing(this.hero);
};

PlayState._spawnCoin = function (coin) {
    var sprite = this.coins.create(coin.x, coin.y, 'coin');
    sprite.anchor.set(0.5, 0.5);

    this.game.physics.enable(sprite);
    sprite.body.allowGravity = false;

    sprite.animations.add('rotate', [0, 1, 2, 1], 6, true); // 6fps, looped
    sprite.animations.play('rotate');
};

PlayState._spawnDoor = function (x, y) {
    this.door = this.bgDecoration.create(x, y, 'door');
    this.door.anchor.setTo(0.5, 1);
    this.game.physics.enable(this.door);
    this.door.body.allowGravity = false;
};

PlayState._spawnKey = function (x, y) {
    this.key = this.bgDecoration.create(x, y, 'key');
    this.key.anchor.set(0.5, 0.5);
    // enable physics to detect collisions, so the hero can pick the key up
    this.game.physics.enable(this.key);
    this.key.body.allowGravity = false;
    // add a small 'up & down' animation via a tween
    this.key.y -= 3;
    this.game.add.tween(this.key)
        .to({y: this.key.y + 6}, 800, Phaser.Easing.Sinusoidal.InOut)
        .yoyo(true)
        .loop()
        .start();
};


PlayState._onHeroVsCoin = function (hero, coin) {
    this.sfx.coin.play();
    coin.kill();
    this.coinPickupCount++;
};

PlayState._onHeroVsEnemy = function (hero, enemy) {
    if (hero.body.velocity.y > 0) { // kill enemies when hero is falling
        hero.bounce();
        enemy.die();
        this.sfx.stomp.play();
    }
    else { // game over -> restart the game
        this.sfx.stomp.play();
        this.game.state.restart(true, false, {level: this.level});
    }
};

PlayState._onHeroVsEnemyBoss = function (hero, enemy) {
    if (hero.body.velocity.y > 0) { // kill enemies when hero is falling
        hero.bounce2();
        enemy.health -=1;
        this.sfx.stomp.play();
        if (enemy.health == 0){
            enemy.die();
        }
    }
    else { // game over -> restart the game
        this.sfx.stomp.play();
        this.game.state.restart(true, false, {level: this.level});
    }
};

PlayState._onHeroVsKey = function (hero, key) {
    this.sfx.key.play();
    key.kill();
    this.hasKey = true;
};

PlayState._onHeroVsDoor = function (hero, door) {
    this.sfx.door.play();
    this.game.state.restart(true, false, {level: this.level+1});
};

PlayState._createHud = function () {
    const NUMBERS_STR = '0123456789X ';
    this.coinFont = this.game.add.retroFont('font:numbers', 20, 26,
        NUMBERS_STR);

    this.keyIcon = this.game.make.image(0, 19, 'icon:key');
    this.keyIcon.anchor.set(0, 0.5);

    var coinIcon = this.game.make.image(this.keyIcon.width + 7, 0, 'icon:coin');
    var coinScoreImg = this.game.make.image(coinIcon.x + coinIcon.width,
        coinIcon.height / 2, this.coinFont);
    coinScoreImg.anchor.set(0, 0.5);

    this.hud = this.game.add.group();
    this.hud.add(coinIcon);
    this.hud.add(coinScoreImg);
    this.hud.add(this.keyIcon);
    this.hud.position.set(10, 10);
};

MainMenu = function(game) {};

MainMenu.prototype = {
    preload:function (game) {
        this.game.load.image('background', 'images/menu_background.png');
        this.game.load.image('titlescreen', 'images/titlescreen.png');
        this.game.load.image('button', 'images/button.png');

        this.game.load.audio('menu-song', 'audio/DDRKirbyISQ - Love Everlasting.mp3');
        this.game.load.audio('song1', 'audio/DDRKirbyISQ - Play With Me Mabe Village.mp3');
        
    },

    create:function (game) {
        background = game.add.image(480, 300, 'background');
        background.anchor.set(0.5, 0.5);    

        music = game.add.audio('menu-song');
        music.loop = true;
        music.mute = false;
        music.play();
            
        this.createButton (game, 'Play', game.world.centerX, game.world.centerY + 32, 170, 75, function (){
            this.state.start('play', true, false, {level: 0});
            music.stop();
            music1 = this.game.add.audio('song1');
            music1.loop = true;
            music1.mute = false;
            music1.play();
        });

        this.createButton (game, 'Mute', game.world.centerX + 410, 30, 100, 35, function () {
            music.mute = !music.mute;
        });

        this.createButton (game, 'About', game.world.centerX, game.world.centerY + 140, 170, 75, function (){
            this.state.start('about', true, false);
            music.stop();
        });

        titlescreen = game.add.sprite(game.world.centerX, game.world.centerY - 152, 'titlescreen');
        titlescreen.anchor.set(0.5, 0.5);


    },

    update: function (game) {},
    
    createButton: function (game, string, x, y, w, h, callback){
        var button1 = game.add.button(x, y, 'button', callback, this, 2, 1, 0);

        button1.anchor.set(0.5, 0.6);
        button1.width = w;
        button1.height = h;

        if (string === 'Mute'){
            var txt = game.add.text(button1.x, button1.y, string, {font: "20px Press Start 2P", fill: "#000", algin: "center"});
        }
        else
            var txt = game.add.text(button1.x, button1.y, string, {font: "30px Press Start 2P", fill: "#000", align: "center"});

        txt.anchor.set(0.5, 0.5);
    }
};

About = function(game) {};

About.prototype = {
    preload:function(game) {
        this.game.load.image('background', 'images/menu_background.png');
        this.game.load.image('menu-button', 'images/menu_button.png');

        this.game.load.audio('about-music', 'audio/Shiroi Tori.mp3');
    },

    create:function(game) {
        background = this.game.add.image(480, 300, 'background');
        background.anchor.set(0.5, 0.5);

        music = this.game.add.audio('about-music');
        music.loop = true;
        music.play();

        this.game.add.button(game.world.centerX + 300, 30, 'menu-button',function() {
            this.game.state.start('menu', true, false);
            music.stop();
        })
    },

    update:function(game) {

    }
};

Finish = function(game) {};

Finish.prototype = {
    preload: function(game) {
        this.game.load.image('background', 'images/menu_background.png');

        this.game.load.audio('music', 'audio/Shiroi Tori.mp3');
    },

    create: function(game) {
        background = this.game.add.image(480, 300, 'background');
        background.anchor.set(0.5, 0.5);

        text = this.game.add.text(game.world.centerX, game.world.centerY, 'THANK YOU!', {font: '72px Press Start 2P', fill: '#00CCFF', align: 'center'});
        text.anchor.set(0.5, 0.5);

        musicEnd = this.game.add.audio('music');
        musicEnd.play();
    },

    update: function(game){

    }
};

// =============================================================================
// entry point
// =============================================================================

window.onload = function () {
    var game = new Phaser.Game(960, 600, Phaser.AUTO, 'content');
    game.state.add('play', PlayState);
    game.state.add('menu', MainMenu);
    game.state.add('about', About);
    game.state.add('fin', Finish);
    game.state.start('menu', true, true);
};
