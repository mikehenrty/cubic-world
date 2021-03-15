import App from './App';

// Set up some global error handlers.
window.onerror = function(err) {
  console.error('GLOBAL ERR:::', err);
  const p = document.createElement('p');
  p.textConent = `${e.message}||${e.detail}\n\n${err.stack}`;
  document.body.appendChild(p);
};

/*
// Useful for mobile debugging.
const _consoleLog = window.console.log;
window.console.log = (...params) => {
    const p = document.createElement('p');
    p.textContent = params.join(', ');
    document.body.appendChild(p)
    _consoleLog.apply(window.console, params);
}
const _consoleError = window.console.error;
window.console.error = (...params) => {
    const p = document.createElement('p');
    p.textContent = params.join(', ');
    p.style.fontColor = 'red';
    document.body.appendChild(p)
    _consoleError.apply(window.console, params);
}
*/

const app = new App();
app.start();
