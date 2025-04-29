const config = {
  type: Phaser.AUTO,
  width: window.innerWidth,
  height: window.innerHeight,
  physics: {
    default: 'arcade',
    arcade: {
      debug: false
    }
  },
  scene: [
    { key: 'Boot', preload: preload, create: create },
    Level1
  ]
};

const game = new Phaser.Game(config);

let backgroundImage, title, storyText;
let startButtonText, startButtonBackground, startButtonShadow;
let music;
let splashScreen, splashText;

function preload() {
  this.load.image('flag', 'images/flag.jpg');
  this.load.audio('introMusic', 'audio/intro.mp3');
}

function create() {
  this.cameras.main.setBackgroundColor('#000');
  showDisclaimer.call(this);
}

function showDisclaimer() {
  const disclaimerText = 
    "⚠️ DISCLAIMER ⚠️\n\n" +
    "This is a work of political satire.\n\n" +
    "If you are easily offended or overly sensitive,\n" +
    "you may wish to turn back now.\n\n";

  const disclaimer = this.add.text(config.width / 2, config.height / 2 - 100, disclaimerText, {
    fontSize: '28px',
    fill: '#ffffff',
    fontFamily: 'Georgia, serif',
    align: 'center',
    wordWrap: { width: config.width * 0.8 }
  }).setOrigin(0.5);

  const clickToBegin = this.add.text(config.width / 2, config.height / 2 + 150, 'Click to Begin', {
    fontSize: '32px',
    fill: '#00ff00',
    fontFamily: 'Georgia, serif',
    stroke: '#000000',
    strokeThickness: 3
  }).setOrigin(0.5);

  const disclaimerScreen = this.add.rectangle(config.width / 2, config.height / 2, config.width, config.height, 0x000000, 0)
    .setOrigin(0.5)
    .setInteractive();

  disclaimerScreen.on('pointerdown', () => {
    disclaimer.destroy();
    clickToBegin.destroy();
    disclaimerScreen.destroy();
    showIntro.call(this);
  });
}

function showIntro() {
  music = this.sound.add('introMusic', { loop: true, volume: 0.8 });
  music.play();

  backgroundImage = this.add.image(config.width / 2, config.height / 2, 'flag')
    .setDisplaySize(config.width, config.height)
    .setAlpha(0.4);

  createResponsiveTitle(this, config.width);

  const story =
    "⚠️ URGENT MISSION BRIEF ⚠️\n\n" +
    "The Republic is under siege.\n" +
    "A shadow cabal of power-hungry elites pulls the strings from behind the curtain—\n" +
    "hoarding wealth, silencing dissent, and rewriting truth.\n\n" +
    "They dominate the media, They twist facts into fiction.\n" +
    "And they drain the people's coffers to feed their empire of lies.\n\n" +
    "But hope is not lost.\n" +
    "You are 47—chosen by the people, forged in fire, and unbreakable in resolve.\n\n" +
    "This is your mission: Expose the corruption. Break the machine. Restore the Republic.\n\n" +
    "The people believe in you. Freedom rides on your shoulders.\n\n" +
    "Godspeed, 47. The time is now.";

  const storyY = config.height * 0.2;

  storyText = this.add.text(config.width / 2, storyY, story, {
    fontSize: '28px',
    fill: '#ffd700',
    stroke: '#000000',
    strokeThickness: 3,
    fontFamily: 'Georgia, serif',
    fontStyle: 'bold',
    align: 'center',
    wordWrap: { width: config.width * 0.8 }
  }).setOrigin(0.5, 0);

  this.time.delayedCall(100, () => {
    const buttonY = storyText.y + storyText.height + 40;
    const buttonWidth = 300;
    const buttonHeight = 70;
    const buttonX = config.width / 2;

    startButtonShadow = this.add.graphics();
    startButtonShadow.fillStyle(0x000000, 0.5);
    startButtonShadow.fillRoundedRect(
      buttonX - buttonWidth / 2 + 4,
      buttonY - buttonHeight / 2 + 4,
      buttonWidth,
      buttonHeight,
      20
    );

    startButtonBackground = this.add.graphics();
    startButtonBackground.fillStyle(0xff0000, 1);
    startButtonBackground.fillRoundedRect(
      buttonX - buttonWidth / 2,
      buttonY - buttonHeight / 2,
      buttonWidth,
      buttonHeight,
      20
    );

    startButtonText = this.add.text(buttonX, buttonY, 'START MISSION', {
      fontSize: '28px',
      fontFamily: 'Georgia, serif',
      fill: '#ffffff',
      stroke: '#000000',
      strokeThickness: 3
    }).setOrigin(0.5)
      .setInteractive({ useHandCursor: true });

    startButtonText.on('pointerdown', () => {
      music.stop();
      this.cameras.main.fadeOut(1000, 0, 0, 0);
      this.cameras.main.once('camerafadeoutcomplete', () => {
        this.scene.stop('Boot');
        this.scene.start('Level1');
      });
    });
  });
}

function createResponsiveTitle(scene, width) {
  const maxWidth = width * 0.9;
  let fontSize = Math.floor(width * 0.08);
  const text = "AMERICA'S LAST HOPE";

  if (title) title.destroy();

  title = scene.add.text(width / 2, 60, text, {
    fontSize: `${fontSize}px`,
    fill: '#ffd700',
    fontFamily: 'Georgia, serif',
    fontStyle: 'bold',
    stroke: '#000000',
    strokeThickness: 6,
    shadow: {
      offsetX: 3,
      offsetY: 3,
      color: '#000000',
      blur: 4,
      fill: true
    }
  }).setOrigin(0.5);

  while (title.width > maxWidth && fontSize > 10) {
    fontSize--;
    title.setFontSize(`${fontSize}px`);
  }
}
