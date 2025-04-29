class Level1 extends Phaser.Scene {
  constructor() {
    super('Level1');
  }

  preload() {
    this.load.image('background', 'images/background.png');
    this.load.spritesheet('player', 'images/player.png', {
      frameWidth: 257,
      frameHeight: 256
    });
    this.load.image('bullet', 'images/bullet.png');
    this.load.audio('laser', 'audio/laser.mp3');
    this.load.audio('hit', 'audio/hit.mp3');
  }

  create() {
    // Background that adjusts to the screen size
    this.background = this.add.image(0, 0, 'background')
      .setOrigin(0, 0)
      .setDisplaySize(this.scale.width, this.scale.height);

    // Listen for window resizing
    this.scale.on('resize', this.resize, this);

    this.isGameStarted = false;
    this.wordIndex = 0;

    this.words = [
      "Russia Russia Russia",
      "Maryland Man",
      "Going to take Social Security",
      "Its a Constitutional Crisis",
      "He is a Fascist"
    ];

    this.truths = [
      "The Russia narrative was heavily politicized and all claims were found to be outright lies.",
      "Maryland Man' was an El Salvadorian gang member and part of a designated FTO (proven in court not once but twice FACTS!!).",
      "No plan exists to eliminate Social Security; fear mongering distorts the truth and creates panic.",
      "A constitution crisis is the judicial branch trying to overstep the power of the elected administrative branch...but nice try on that one.",
      "Facism is going against what people voted for... sorry check your history books and the election results, your feelings don't count."
    ];

    const centerX = this.scale.width / 2;
    const centerY = this.scale.height / 2;

    const missionText =
      "Controls:\n" +
      "→ Arrow Keys: Move Left/Right\n" +
      "Spacebar: Shoot straight up\n\n" +
      "Mission:\n" +
      "47, shoot down the lies to save freedom!";

    this.instructionText = this.add.text(centerX, centerY - 100, missionText, {
      fontSize: '22px',
      fill: '#ffd700',
      fontFamily: 'Georgia, serif',
      align: 'center',
      stroke: '#000000',
      strokeThickness: 4,
      wordWrap: { width: this.scale.width * 0.85 },
      backgroundColor: 'rgba(0,0,0,0.5)'
    }).setOrigin(0.5);

    this.startButton = this.add.text(centerX, centerY + 160, 'START MISSION', {
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

    this.bullets = this.physics.add.group({
      classType: Phaser.Physics.Arcade.Image,
      runChildUpdate: true
    });
  }

  resize(gameSize) {
    const width = gameSize.width;
    const height = gameSize.height;

    if (this.background) {
      this.background.setDisplaySize(width, height);
    }
  }

  startLevel() {
    this.isGameStarted = true;
    this.instructionText.destroy();
    this.startButton.destroy();

    this.player = this.physics.add.sprite(
      this.scale.width / 2,
      this.scale.height - 64,
      'player'
    );
    this.player.setScale(0.8);
    this.player.setCollideWorldBounds(true);
    this.player.body.allowGravity = false;
    this.groundY = this.player.y;
    this.facing = 'idle';

    this.player.setDepth(1);

    this.anims.create({
      key: 'walk-right',
      frames: this.anims.generateFrameNumbers('player', { start: 8, end: 15 }),
      frameRate: 10,
      repeat: -1
    });

    this.anims.create({
      key: 'walk-left',
      frames: this.anims.generateFrameNumbers('player', { start: 24, end: 31 }),
      frameRate: 10,
      repeat: -1
    });

    this.anims.create({
      key: 'idle',
      frames: this.anims.generateFrameNumbers('player', { start: 0, end: 7 }),
      frameRate: 5,
      repeat: -1
    });

    this.player.anims.play('idle');

    this.spawnWord(this.words[this.wordIndex]);
  }

  spawnWord(word) {
    if (this.wordContainer) this.wordContainer.destroy();

    this.wordContainer = this.add.container(200, 100);
    this.letters = [];

    const spacing = 40;
    word.split('').forEach((c, i) => {
      if (c !== ' ') {
        const L = this.add.text(i * spacing, 0, c, {
          fontSize: '48px',
          fill: '#ff0000',
          fontFamily: 'Georgia, serif',
          stroke: '#000000',
          strokeThickness: 4
        }).setOrigin(0.5);
        this.wordContainer.add(L);
        this.letters.push(L);
      }
    });

    this.wordVX = Phaser.Math.Between(-100, 100);
    this.wordVY = Phaser.Math.Between(100, 150);
  }

  update() {
    if (!this.isGameStarted) return;

    const speed = 250;
    let moveLeft = this.cursors.left.isDown;
    let moveRight = this.cursors.right.isDown;
    if (moveLeft && moveRight) { moveLeft = moveRight = false; }

    this.player.setVelocityX(0);

    if (moveLeft) {
      this.player.setVelocityX(-speed);
      if (this.facing !== 'left') {
        this.player.anims.play('walk-left', true);
        this.facing = 'left';
      }
    } else if (moveRight) {
      this.player.setVelocityX(speed);
      if (this.facing !== 'right') {
        this.player.anims.play('walk-right', true);
        this.facing = 'right';
      }
    } else {
      if (this.facing !== 'idle') {
        this.player.anims.play('idle', true);
        this.facing = 'idle';
      }
    }

    this.player.y = this.groundY;

    if (Phaser.Input.Keyboard.JustDown(this.spacebar)) {
      this.fireBullet();
    }

    // Word movement and bouncing
    if (this.wordContainer) {
      this.wordContainer.x += this.wordVX / 60;
      this.wordContainer.y += this.wordVY / 60;

      let minX = Infinity, maxX = -Infinity, minY = Infinity, maxY = -Infinity;

      this.letters.forEach(L => {
        if (L) {
          const lx = this.wordContainer.x + L.x;
          const ly = this.wordContainer.y + L.y;
          if (lx < minX) minX = lx;
          if (lx > maxX) maxX = lx;
          if (ly < minY) minY = ly;
          if (ly > maxY) maxY = ly;
        }
      });

      if (minX < 0) {
        this.wordContainer.x += (0 - minX);
        this.wordVX = -this.wordVX;
      }
      if (maxX > this.scale.width) {
        this.wordContainer.x -= (maxX - this.scale.width);
        this.wordVX = -this.wordVX;
      }
      if (minY < 0) {
        this.wordContainer.y += (0 - minY);
        this.wordVY = -this.wordVY;
      }
      if (maxY > this.scale.height * 0.7) {
        this.wordContainer.y -= (maxY - this.scale.height * 0.7);
        this.wordVY = -this.wordVY;
      }
    }

    // Bullets
    this.bullets.children.iterate(b => {
      if (!b.active) return;
      if (b.y < 0 || b.x < 0 || b.x > this.scale.width) {
        b.disableBody(true, true);
      } else {
        this.letters.forEach((L, i) => {
          if (L && Phaser.Geom.Intersects.RectangleToRectangle(b.getBounds(), L.getBounds())) {
            this.sound.play('hit');
            b.disableBody(true, true);
            this.createExplosion(L.x + this.wordContainer.x, L.y + this.wordContainer.y);
            L.destroy();
            this.letters[i] = null;
          }
        });
      }
    });

    this.letters = this.letters.filter(l => l);

    if (this.letters.length === 0 && this.wordContainer) {
      this.wordIndex++;
      if (this.wordIndex < this.words.length) {
        this.spawnWord(this.words[this.wordIndex]);
      } else {
        this.showLevelCompleteScreen();
      }
    }
  }

  fireBullet() {
    let b = this.bullets.get();
    if (!b) {
      b = this.physics.add.image(this.player.x, this.player.y - 50, 'bullet');
      this.bullets.add(b);
    } else {
      b.setTexture('bullet');
      b.setPosition(this.player.x, this.player.y - 50);
      b.setActive(true).setVisible(true);
      b.body.enable = true;
    }
    b.body.allowGravity = false;

    b.setScale(0.1);
    b.setAngle(270);
    b.setVelocity(0, -500);

    this.sound.play('laser');
  }

  createExplosion(x, y) {
    const c = this.add.circle(x, y, 20, 0xffff00);
    this.time.delayedCall(200, () => c.destroy());
  }

  showLevelCompleteScreen() {
    this.isGameStarted = false;
    if (this.wordContainer) {
      this.wordContainer.destroy();
    }

    this.levelCompleteText = this.add.text(this.scale.width / 2, this.scale.height / 2 - 100,
      'MISSION COMPLETE!', {
        fontSize: '48px',
        fill: '#00ff00',
        fontFamily: 'Georgia, serif',
        stroke: '#000000',
        strokeThickness: 6
      }).setOrigin(0.5);

    this.continueButton = this.add.text(this.scale.width / 2, this.scale.height / 2 + 50,
      'CONTINUE', {
        fontSize: '32px',
        fill: '#ffffff',
        backgroundColor: '#0000ff',
        fontFamily: 'Georgia, serif',
        padding: { x: 20, y: 10 },
        stroke: '#000000',
        strokeThickness: 4
      })
      .setOrigin(0.5)
      .setInteractive({ useHandCursor: true })
      .on('pointerdown', () => this.showTruthScreen());
  }

  showTruthScreen() {
    this.levelCompleteText.destroy();
    this.continueButton.destroy();
    this.background.destroy();

    const bg = this.add.rectangle(0, 0, this.scale.width, this.scale.height, 0x000033)
      .setOrigin(0);

    const header = "⚠️ THE DANGER OF MEDIA LIES AND DISINFORMATION ⚠️\n\n" +
                   "False narratives have divided our country, create distrust, and manipulate public opinion.\nAlways seek the full truth.";

    this.add.text(this.scale.width / 2, 80, header, {
      fontSize: '36px',
      fill: '#ffd700',
      fontFamily: 'Georgia, serif',
      stroke: '#000000',
      strokeThickness: 6,
      align: 'center',
      wordWrap: { width: this.scale.width * 0.9 }
    }).setOrigin(0.5);

    let startY = 240;
    const lineSpacing = 100;

    this.words.forEach((lie, idx) => {
      this.add.text(this.scale.width / 2, startY, `❌ "${lie}"`, {
        fontSize: '24px',
        fill: '#ff4444',
        fontFamily: 'Georgia, serif',
        stroke: '#000000',
        strokeThickness: 3,
        align: 'center',
        wordWrap: { width: this.scale.width * 0.8 }
      }).setOrigin(0.5);

      this.add.text(this.scale.width / 2, startY + 40, `✅ ${this.truths[idx]}`, {
        fontSize: '22px',
        fill: '#44ff44',
        fontFamily: 'Georgia, serif',
        stroke: '#000000',
        strokeThickness: 3,
        align: 'center',
        wordWrap: { width: this.scale.width * 0.8 }
      }).setOrigin(0.5);

      startY += lineSpacing;
    });
  }
}

// Expose globally
window.Level1 = Level1;
