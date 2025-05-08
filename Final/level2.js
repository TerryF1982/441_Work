class Level2 extends Phaser.Scene {
  constructor() {
    super('Level2');
  }

  preload() {
    this.load.image('background2', 'images/background2.png');
    this.load.image('tesla', 'images/tesla.png');
    this.load.image('bullet', 'images/bullet.png');
    this.load.audio('laser', 'audio/laser.mp3');
    this.load.audio('bgmusic', 'audio/bgmusic.mp3');
    this.load.audio('collectSound', 'audio/collect.mp3');
    this.load.audio('enemyDeathSound', 'audio/die.mp3');
    this.load.spritesheet('playerTrump', 'images/playerTrump.png', { frameWidth: 256, frameHeight: 512 });
    this.load.image('enemy', 'images/enemy.png');
  }

  create() {
    const { width, height } = this.scale;

    this.background = this.add.image(0, 0, 'background2')
      .setOrigin(0, 0)
      .setDisplaySize(width, height);
    this.scale.on('resize', this.resize, this);

    this.isGameStarted = false;

    this.titleText = this.add.text(width / 2, height * 0.12, 'OPERATION: DOMESTIC RESCUE', {
      fontSize: '48px',
      fontFamily: 'Black Ops One',
      fill: '#ff0000',
      stroke: '#000000',
      strokeThickness: 5
    }).setOrigin(0.5);

    const boxWidth = 600;
    const boxHeight = 420;

    this.instructionBox = this.add.graphics();
    this.instructionBox.fillStyle(0x000000, 0.7);
    this.instructionBox.fillRoundedRect(width / 2 - boxWidth / 2, height * 0.5 - boxHeight / 2, boxWidth, boxHeight, 20);
    this.instructionBox.lineStyle(3, 0xffd700, 1);
    this.instructionBox.strokeRoundedRect(width / 2 - boxWidth / 2, height * 0.5 - boxHeight / 2, boxWidth, boxHeight, 20);

    const missionText =
      "A wave of domestic terrorism has erupted across the homeland.\n\n" +
      "These acts are not spontaneous — they have been organized,\n" +
      "amplified, and encouraged by radical elements of the liberal left.\n\n" +
      "You are deployed behind enemy lines.\n" +
      "Rescue the captured Teslas. Eliminate the threat.\n\n" +
      "Truth and liberty depend on you.";

    this.instructionText = this.add.text(width / 2, height * 0.5, missionText, {
      fontSize: '18px',
      fontFamily: 'Georgia, serif',
      fill: '#ffffff',
      stroke: '#000000',
      strokeThickness: 2,
      align: 'center',
      lineSpacing: 8,
      wordWrap: { width: 540 }
    }).setOrigin(0.5);

    this.mottoText = this.add.text(width / 2, height * 0.84, 'THE RESCUE MISSION BEGINS NOW', {
      fontSize: '32px',
      fontFamily: 'Black Ops One',
      fill: '#ff0000',
      stroke: '#000000',
      strokeThickness: 4
    }).setOrigin(0.5);

    this.startButton = this.add.text(width / 2, height * 0.92, 'LEVEL 2', {
      fontSize: '28px',
      fill: '#ffffff',
      backgroundColor: '#ff0000',
      fontFamily: 'Georgia, serif',
      padding: { x: 20, y: 10 },
      stroke: '#000000',
      strokeThickness: 3
    })
      .setOrigin(0.5)
      .setInteractive({ useHandCursor: true })
      .on('pointerdown', () => this.startLevel());

    this.cursors = this.input.keyboard.createCursorKeys();
    this.spacebar = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);
  }

  resize(gameSize) {
    const width = gameSize.width;
    if (this.background && !this.isGameStarted) {
      this.background.setDisplaySize(width, gameSize.height);
    }
    if (this.scoreGroup) {
      this.scoreGroup.setX(width / 2);
    }
  }

  startLevel() {
    this.isGameStarted = true;

    this.instructionText.destroy();
    this.instructionBox.destroy();
    this.startButton.destroy();
    this.titleText.destroy();
    this.mottoText.destroy();
    this.background.destroy();

    const { height, width } = this.scale;
    const levelWidth = 6000;

    this.background = this.add.image(0, 0, 'background2')
      .setOrigin(0, 0)
      .setDisplaySize(levelWidth, height)
      .setScrollFactor(1);

    this.physics.world.setBounds(0, 0, levelWidth, height);
    this.cameras.main.setBounds(0, 0, levelWidth, height);

    this.bgmusic = this.sound.add('bgmusic', { loop: true, volume: 0.6 });
    this.bgmusic.play();

    this.collectSound = this.sound.add('collectSound');
    this.enemyDeathSound = this.sound.add('enemyDeathSound');

    this.player = this.physics.add.sprite(100, height - 100, 'playerTrump')
      .setScale(0.5)
      .setCollideWorldBounds(true);

    this.anims.create({
      key: 'walk',
      frames: this.anims.generateFrameNumbers('playerTrump', { start: 0, end: 3 }),
      frameRate: 8,
      repeat: -1
    });

    this.anims.create({
      key: 'aim',
      frames: this.anims.generateFrameNumbers('playerTrump', { start: 4, end: 6 }),
      frameRate: 6,
      repeat: -1
    });

    this.anims.create({
      key: 'shoot',
      frames: [{ key: 'playerTrump', frame: 7 }],
      frameRate: 1,
      repeat: -1
    });

    this.player.anims.play('aim');
    this.cameras.main.startFollow(this.player, true, 0.1, 0.1);

    this.teslasCollected = 0;
    this.enemiesKilled = 0;

    this.scoreText = this.add.text(width / 2, 20, 'TESLAS SAVED: 0\nTERRORISTS KILLED: 0', {
      fontSize: '20px',
      fontFamily: 'Georgia, serif',
      fill: '#ffffff',
      stroke: '#000000',
      strokeThickness: 3,
      align: 'center'
    }).setOrigin(0.5, 0).setScrollFactor(0);

    this.teslaPositions = [];
    for (let i = 0; i < 10; i++) {
      this.teslaPositions.push(1000 + i * 500);
    }

    this.currentTeslaIndex = 0;
    this.tesla = this.physics.add.sprite(this.teslaPositions[0], height - 100, 'tesla')
      .setScale(1);
    this.physics.add.overlap(this.player, this.tesla, this.collectTesla, null, this);

    this.enemies = this.physics.add.group();
    this.teslaPositions.forEach((posX) => {
      const enemy = this.enemies.create(posX - 120, height - 40, 'enemy')
        .setOrigin(0.5, 1)
        .setScale(0.33)
        .setDepth(10);
      enemy.health = 2;
    });

    this.bullets = this.physics.add.group({ runChildUpdate: true });
    this.laserSound = this.sound.add('laser');
    this.lastFired = 0;
    this.facing = 'right';

    this.physics.add.overlap(this.bullets, this.enemies, this.hitEnemy, null, this);

    this.physics.world.on('worldbounds', (body) => {
      if (body.gameObject && this.bullets.contains(body.gameObject)) {
        body.gameObject.destroy();
      }
    });
  }

  collectTesla(player, tesla) {
    this.physics.world.disable(tesla);
    this.collectSound.play();

    this.add.particles('bullet', {
      x: tesla.x,
      y: tesla.y,
      speed: { min: -150, max: 150 },
      angle: { min: 0, max: 360 },
      scale: { start: 0.3, end: 0 },
      lifespan: 400,
      quantity: 12
    });

    this.teslasCollected++;
    this.enemiesKilled += 0; // placeholder
    this.scoreText.setText(`TESLAS SAVED: ${this.teslasCollected}\nTERRORISTS KILLED: ${this.enemiesKilled}`);
    this.currentTeslaIndex++;

    if (this.currentTeslaIndex < this.teslaPositions.length) {
      this.tesla.setPosition(this.teslaPositions[this.currentTeslaIndex], this.scale.height - 100);
      this.physics.world.enable(this.tesla);
    } else {
      this.tesla.destroy();
      this.add.text(this.player.x, this.player.y - 50, 'ALL TESLAS RESCUED!', {
        fontSize: '32px',
        fill: '#00ff00',
        stroke: '#000000',
        strokeThickness: 4
      }).setOrigin(0.5).setScrollFactor(0);
      this.showVictoryMessage();
    }
  }

  hitEnemy(bullet, enemy) {
    bullet.destroy();
    enemy.health--;
    if (enemy.health <= 0) {
      this.enemyDeathSound.play();
      enemy.destroy();
      this.enemiesKilled++;
      this.scoreText.setText(`TESLAS SAVED: ${this.teslasCollected}\nTERRORISTS KILLED: ${this.enemiesKilled}`);
    }
  }

  showVictoryMessage() {
    const { width, height } = this.scale;

    const finalText =
      "The use of media manipulation, deceit, and distortion of truth\n" +
      "to control the narrative...\n\n" +
      "The abuse of the justice system to override the will of the people\n" +
      "expressed through votes...\n\n" +
      "These are not acts of leadership — they are tactics of authoritarianism.\n" +
      "They threaten the very foundations of democracy.\n\n" +
      "What the radical left is doing to this country is not progress —\n" +
      "It is dangerous.\n" +
      "It is treacherous.\n" +
      "And history will remember it as a shameful betrayal of the American spirit.";

    const bg = this.add.rectangle(0, 0, width, height, 0x000000, 1)
      .setOrigin(0, 0)
      .setScrollFactor(0);

    const border = this.add.graphics().setScrollFactor(0);
    border.lineStyle(6, 0xff0000, 1);
    border.strokeRect(20, 20, width - 40, height - 40);

    const title = this.add.text(width / 2, 80, 'MISSION COMPLETE', {
      fontSize: '48px',
      fontFamily: 'Black Ops One',
      fill: '#ffd700',
      stroke: '#ff0000',
      strokeThickness: 6,
      shadow: { offsetX: 2, offsetY: 2, color: '#000000', blur: 6, stroke: true, fill: true }
    }).setOrigin(0.5).setScrollFactor(0);

    const message = this.add.text(width / 2, height / 2, finalText, {
      fontSize: '20px',
      fontFamily: 'Georgia, serif',
      fill: '#ffffff',
      stroke: '#000000',
      strokeThickness: 2,
      align: 'center',
      lineSpacing: 10,
      wordWrap: { width: width - 160 }
    }).setOrigin(0.5).setScrollFactor(0);

    const endButton = this.add.text(width / 2, height - 80, 'EXIT', {
      fontSize: '26px',
      fill: '#ffffff',
      backgroundColor: '#ff0000',
      fontFamily: 'Georgia, serif',
      padding: { x: 24, y: 12 },
      stroke: '#000000',
      strokeThickness: 4
    }).setOrigin(0.5).setInteractive({ useHandCursor: true }).setScrollFactor(0);

    endButton.on('pointerdown', () => {
      this.scene.start('TitleScene');
    });
  }

  update(time) {
    if (!this.isGameStarted) return;

    const speed = 250;
    this.player.setVelocityX(0);

    if (this.cursors.left.isDown) {
      this.player.setVelocityX(-speed);
      this.player.anims.play('walk', true);
      this.facing = 'left';
    } else if (this.cursors.right.isDown) {
      this.player.setVelocityX(speed);
      this.player.anims.play('walk', true);
      this.facing = 'right';
    } else {
      this.player.anims.play('aim', true);
    }

    if (Phaser.Input.Keyboard.JustDown(this.spacebar) && time > this.lastFired + 250) {
      this.player.anims.play('shoot');
      this.fireBullet();
      this.lastFired = time;
    }
  }

  fireBullet() {
    const offset = this.facing === 'right' ? 30 : -30;
    const bullet = this.bullets.create(this.player.x + offset, this.player.y, 'bullet');
    bullet.setScale(0.075);
    bullet.setVelocityX(this.facing === 'right' ? 600 : -600);
    bullet.setActive(true);
    bullet.setVisible(true);
    bullet.body.allowGravity = false;
    bullet.body.checkWorldBounds = true;
    bullet.body.onWorldBounds = true;
    this.laserSound.play({ volume: 0.4 });
  }
}

window.Level2 = Level2;
