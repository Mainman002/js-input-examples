function Line(_ctx, _pos_start, _pos_end, offset, _thickness, _color) {
    _ctx.strokeStyle = _color;
    _ctx.lineWidth = _thickness;
  
    if ( !offset ) { 
      offset = {w: offset.w, h: offset.h};
    }
  
    // draw a red line
    _ctx.beginPath();
    _ctx.moveTo(_pos_end.x+offset.w*0.5, _pos_end.y+offset.h*0.5);
    _ctx.lineTo(_pos_start.x+offset.w*0.5, _pos_start.y+offset.h*0.5);
    _ctx.stroke();
  }

function Rect(_ctx, _pos, _size, _color, _a){
    _ctx.globalAlpha = _a;
    _ctx.fillStyle = _color;
    _ctx.fillRect(_pos.x, _pos.y, _size.w, _size.h);
    _ctx.globalAlpha = 1;
}

function Screen_Init(_main, _canvas){
    _canvas.width = _main.window_size.w;
    _canvas.height = _main.window_size.h;
    _canvas.style.width = `${_main.window_size.w}px`;
    _canvas.style.height = `${_main.window_size.h}px`;
}


function Screen_Resize(_main, _ctx, _canvas) {
    const border = 8;
    
    const aspectList = {
        box:{w:5, h:4.5},
        wide:{w:6.5, h:4}
    }

    const aspect = aspectList.wide;

    const img_smooth = false;
    let w = window.innerWidth;
    let h = w * (aspect.h / aspect.w);
    
    if (h < window.innerHeight){
        // Check window width
        w = window.innerWidth;
        h = w * (aspect.h / aspect.w);
    } else {
        // Check window height
        h = window.innerHeight;
        w = h * (aspect.w / aspect.h);
    }
    
    if (_main.debug) console.log("Resized", "W", Math.floor(w), "H", Math.floor(h));
    
    _canvas.style.width = `${w - border}px`;
    _canvas.style.height = `${h - border}px`;
    
    // Graphic sharpness
    _ctx.mozImageSmoothingEnabled = img_smooth;
    _ctx.msImageSmoothingEnabled = img_smooth;
    _ctx.imageSmoothingEnabled = img_smooth;
}


function resize( _main ) {
    Screen_Resize(_main, _main.ctx, canvas)
}


function init_input(main) {
    // handle touch input
    oncontextmenu = function(event) {
        event.preventDefault();
        event.stopPropagation();
        return false;
    };

    addEventListener('touchstart', (e) => {
    get_touch_pos(main, e);

        if (!main.isTouching) {
            main.isTouching = true;
        }
    });

    addEventListener('touchmove', (e) => {
    get_touch_pos(main, e);

        if (!main.isTouching) {
            main.isTouching = true;
        }
    });

    addEventListener('touchend', (e) => {
        if (main.isTouching) {
            main.isTouching = false;
        }
    });

    addEventListener('touchcancel', (e) => {
        if (main.isTouching) {
            main.isTouching = false;
        }
    });

    // handle gamepad input
    addEventListener('gamepadconnected', (e) => {
        if (!main.gamepads[e.gamepad.index]) {
            main.gamepads[e.gamepad.index] = {};
            main.gamepads[e.gamepad.index].id = e.gamepad.index;
        }
    });

    addEventListener('gamepaddisconnected', (e) => {
        if (main.gamepads[e.gamepad.index]) {
            delete main.gamepads[e.gamepad.index];
        }
    });
}

class Player {
    constructor( main, pos, size, color ) {
        this.main = main;
        this.pos = pos;
        this.size = size;
        this.color = color;
        this.dir = {x: 0, y: 0};
        this.speed = 300;
    }

    init() {

    }

    draw() {

        if (this.main.isTouching) {
            Rect(this.main.ctx, this.pos, this.size, "Red", 1);
        } else {
            Rect(this.main.ctx, this.pos, this.size, "Teal", 1);
        }
    }

    update(dt) {

        // Bounds check
        if ( this.pos.x < 0 - this.size.w) {
            this.pos.x = canvas.width;
        } else if ( this.pos.x > canvas.width ) {
            this.pos.x = 0 - this.size.w;
        }

        // touch
        if (this.main.isTouching) {
            if (this.pos.x > (this.main.touch[0].pos.x + 2) - (this.size.w * 0.5) ) {
            this.pos.x = Math.floor(this.pos.x - this.speed * dt);
            }
    
            if (this.pos.x < (this.main.touch[0].pos.x - 2) - (this.size.w * 0.5) ) {
            this.pos.x = Math.floor(this.pos.x + this.speed * dt);
            }
    
            if (this.pos.y > (this.main.touch[0].pos.y + 2) - (this.size.h * 0.5) ) {
            this.pos.y = Math.floor(this.pos.y - this.speed * dt);
            }
    
            if (this.pos.y < (this.main.touch[0].pos.y - 2) - (this.size.h * 0.5) ) {
            this.pos.y = Math.floor(this.pos.y + this.speed * dt);
            }
        }

        // Gamepad
        if (this.main.gamepads) {
            if (this.main.input.gamepadLeft) {
            this.pos.x = Math.floor(this.pos.x - this.speed * dt);
            }
    
            if (this.main.input.gamepadRight) {
            this.pos.x = Math.floor(this.pos.x + this.speed * dt);
            }
    
            if (this.main.input.gamepadUp) {
            this.pos.y = Math.floor(this.pos.y - this.speed * dt);
            }
    
            if (this.main.input.gamepadDown) {
            this.pos.y = Math.floor(this.pos.y + this.speed * dt);
            }
        }
    }
}


function get_touch_pos(main, e) {
    let bounds = canvas.getBoundingClientRect();

    for (let id in e.touches) {
        if (!main.touch[id]) {
            main.touch[id] = {pos:{x:0,y:0}};
        }

        // get the mouse coordinates, subtract the canvas top left and any scrolling
        main.touch[id].pos.x = e.touches[id].pageX - bounds.left - scrollX;
        main.touch[id].pos.y = e.touches[id].pageY - bounds.top - scrollY;

        // first normalize the mouse coordinates from 0 to 1 (0,0) top left
        // off canvas and (1,1) bottom right by dividing by the bounds width and height
        main.touch[id].pos.x /= bounds.width; 
        main.touch[id].pos.y /= bounds.height; 

        // then scale to canvas coordinates by multiplying the normalized coords with the canvas resolution
        main.touch[id].pos.x *= canvas.width;
        main.touch[id].pos.y *= canvas.height;

        // Floor position values to whole numbers
        main.touch[id].pos.x = Math.floor(main.touch[id].pos.x);
        main.touch[id].pos.y = Math.floor(main.touch[id].pos.y);
    }
}


class Main {
    constructor() {
        this.ctx = canvas.getContext('2d');

        this.window_size = {w: 480, h: 256};
        this.game_state = "MainMenu";
        this.start_btn = false;
        this.players = [];
        this.blocks = [];
        this.lasers = [];
        this.blockLimits = {min_x: 1, max_x: 7, min_y: 2, max_y: 10};
        this.colors = ["Red", "Orange", "Yellow", "Green", "Teal", "White"];

        this.pos = { x: canvas.width*0.5, y: canvas.height*0.5}

        this.touch = {};

        this.isTouching = false;

        this.gamepads = {};  
        this.gamepadId = 0;
        this.input = {
            gamepadUp: undefined,
            gamepadDown: undefined,
            gamepadLeft: undefined,
            gamepadRight: undefined,}

        this.images = {
            // player_sprites: Image_Loader_Load('img/Players.png'),
        }
    }

    init() {
        this.players.push( new Player(this, {x: canvas.width*0.5 - 32, y: canvas.height*0.5 - 32}, {w: 64, h: 64}, "red" ) );
    }

    draw() {
        this.players.forEach(ob => ob.draw());

        if (this.touch[0] && this.touch[1]) {
            Line(this.ctx, {x: this.touch[0].pos.x, y: this.touch[0].pos.y}, {x: this.touch[1].pos.x, y: this.touch[1].pos.y}, {w: 0, h: 0}, 3, "Teal");
        }
        if (this.touch[1] && this.touch[2]) {
            Line(this.ctx, {x: this.touch[1].pos.x, y: this.touch[1].pos.y}, {x: this.touch[2].pos.x, y: this.touch[2].pos.y}, {w: 0, h: 0}, 3, "Teal");
        }
    }

    update(dt) {

        // handle gamepad input
        const gamepad = navigator.getGamepads();

        if (gamepad) {
            for (let gamepadIndex in this.gamepads) {
                this.gamepadId = this.gamepads[gamepadIndex].id;

                this.input.gamepadUp =  gamepad[this.gamepadId].buttons[12].pressed || gamepad[this.gamepadId].axes[1] === -1;
                this.input.gamepadDown = gamepad[this.gamepadId].buttons[13].pressed || gamepad[this.gamepadId].axes[1] === 1;
                this.input.gamepadLeft = gamepad[this.gamepadId].buttons[14].pressed || gamepad[this.gamepadId].axes[0] === -1;
                this.input.gamepadRight = gamepad[this.gamepadId].buttons[15].pressed || gamepad[this.gamepadId].axes[0] === 1;
            }
        }

        this.players.forEach(ob => ob.update(dt));
    }
}


addEventListener('load', (e) => {
    
    const main = new(Main);
    resize( main );
    main.init();

    init_input(main)

    addEventListener('resize', (e) => {
        resize( main );
    });

    const deltaTime = 1/60;
    let accumulatedTime = 0;
    let lastTime = 0;

    function update(time) {
        accumulatedTime += (time - lastTime) / 1000;

        while (accumulatedTime > deltaTime) {
            main.ctx.clearRect(0, 0, canvas.width, canvas.height);

            main.update(deltaTime);
            main.draw();

            accumulatedTime -= deltaTime;
        }
        requestAnimationFrame(update);
        // setTimeout(update, 1000/60, performance.now());
        lastTime = time;
    }
    update(0);
});



