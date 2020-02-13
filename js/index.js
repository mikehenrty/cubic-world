import Engine from './game/Engine.js';
// import { AsciiEffect } from './AsciiEffect.js';

const game = new Engine();
game.start();

/*
var effect = new AsciiEffect( renderer, ` .:-+*=%@#`, { invert: false } );
effect.setSize( WIDTH, HEIGHT );
effect.domElement.style.color = 'yellow';
effect.domElement.style.backgroundColor = 'red';
document.body.appendChild( effect.domElement );
*/
