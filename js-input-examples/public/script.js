// alert('simple static server started');

// const ctx = canvas.getContext("2d");

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
    
    // canvas.width = window.innerWidth;
    // canvas.height = window.innerHeight;

    // canvas.style.width = `${canvas.width}px`;
    // canvas.style.height = `${canvas.height}px`;
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
        this.speed = 250;
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
            if (this.pos.x > (this.main.touch.pos.x + 2) - (this.size.w * 0.5) ) {
            this.pos.x = Math.floor(this.pos.x - this.speed * dt);
            }
    
            if (this.pos.x < (this.main.touch.pos.x - 2) - (this.size.w * 0.5) ) {
            this.pos.x = Math.floor(this.pos.x + this.speed * dt);
            }
    
            if (this.pos.y > (this.main.touch.pos.y + 2) - (this.size.h * 0.5) ) {
            this.pos.y = Math.floor(this.pos.y - this.speed * dt);
            }
    
            if (this.pos.y < (this.main.touch.pos.y - 2) - (this.size.h * 0.5) ) {
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

    // get the mouse coordinates, subtract the canvas top left and any scrolling
    main.touch.pos.x = e.touches[0].pageX - bounds.left - scrollX;
    main.touch.pos.y = e.touches[0].pageY - bounds.top - scrollY;

    // first normalize the mouse coordinates from 0 to 1 (0,0) top left
    // off canvas and (1,1) bottom right by dividing by the bounds width and height
    main.touch.pos.x /= bounds.width; 
    main.touch.pos.y /= bounds.height; 

    // then scale to canvas coordinates by multiplying the normalized coords with the canvas resolution
    main.touch.pos.x *= canvas.width;
    main.touch.pos.y *= canvas.height;

    // Floor position values to whole numbers
    main.touch.pos.x = Math.floor(main.touch.pos.x);
    main.touch.pos.y = Math.floor(main.touch.pos.y);
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

        this.touch = {
            pos: { x: undefined, y: undefined },
            size: { w: 0.02, h: 0.02 },
        }
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
            // console.log(this.input);
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



