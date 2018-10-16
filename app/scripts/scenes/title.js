export default class Title extends Phaser.Scene {
  /**
   *  My custom scene.
   *
   *  @extends Phaser.Scene
   */
  constructor() {
    super({key: 'Title'});
  }

  /**
   *  Called when this scene is initialized.
   *
   *  @protected
   *  @param {object} [data={}] - Initialization parameters.
   */
  init(/* data */) {
  }

  /**
   *  Used to declare game assets to be loaded using the loader plugin API.
   *
   *  @protected
   */
  preload() {
  }

  /**
   *  Responsible for setting up game objects on the screen.
   *
   *  @protected
   *  @param {object} [data={}] - Initialization parameters.
   */
  create(/* data */) {

    const x = this.cameras.main.width / 2;
    
    // Scale the game for full screen.
    window.addEventListener('resize', resize);
    resize();

    // Load Shapes.
    let shapes = this.cache.json.get('shapes');
    
    //  Set background.
    this.background = this.add.tileSprite(0, 0, this.cameras.main.width, this.cameras.main.height, 'earth');
    this.background.setOrigin(0, 0);
    
    // Add Rover
    let rover = this.matter.add.sprite(300, 300, 'sheet', 'rover.png', {shape: shapes.rover});
    rover.angle = 45;
    
    //  Add a text label.
    const label = this.add.text(x, 300, 'Mars Explorer', {
      font: '40px Lucida Console',
      color: 'white',
      stroke: 'black',
      strokeThickness: 6
    });
    
    label
      .setOrigin(0.5, 0.5);
    
    //  Add a text label.
    const label2 = this.add.text(x, 350, 'Use the arrows on your keyboard to move the rover', {
      font: '16px Lucida Console',
      color: 'white',
      stroke: 'black',
      strokeThickness: 3
    });
    
    label2
      .setOrigin(0.5, 0.5);
    
    //  Add a text label.
    const label3 = this.add.text(x, 400, 'START', {
      font: '20px Lucida Console',
      color: 'green',
      stroke: 'black',
      strokeThickness: 4
    });

    //  Move the origin point to the center, make the label interactive.
    label3
      .setOrigin(0.5, 0.5)
      .setInteractive();

    //  When this label is clicked, move on to the next game scene.
    label3.on('pointerup', () => this.scene.start('Game'));

  }

  /**
   *  Handles updates to game logic, physics and game objects.
   *
   *  @protected
   *  @param {number} t - Current internal clock time.
   *  @param {number} dt - Time elapsed since last update.
   */
  update(/* t, dt */) {
    //this.logo.update();
  }

  /**
   *  Called after a scene is rendered. Handles rendenring post processing.
   *
   *  @protected
   */
  render() {
  }

  /**
   *  Called when a scene is about to shut down.
   *
   *  @protected
   */
  shutdown() {
  }

  /**
   *  Called when a scene is about to be destroyed (i.e.: removed from scene
   *  manager). All allocated resources that need clean up should be freed up
   *  here.
   *
   *  @protected
   */
  destroy() {
  }
}

// Resizes the game canvas to fit the browser window.
function resize() {
  let canvas = document.querySelector('canvas'), width = window.innerWidth, height = window.innerHeight;
  let wratio = width / height, ratio = canvas.width / canvas.height;
 
  if (wratio < ratio) {
    canvas.style.width = width + 'px';
    canvas.style.height = (width / ratio) + 'px';
  } else {
    canvas.style.width = (height * ratio) + 'px';
    canvas.style.height = height + 'px';
  }
}
