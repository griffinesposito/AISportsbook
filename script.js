// Application setup
let app = new PIXI.Application({ 
    width: window.innerWidth, 
    height: window.innerHeight,
    transparent: true 
});
document.body.appendChild(app.view);

window.addEventListener('resize', () => {
    app.renderer.resize(window.innerWidth, window.innerHeight);
});

// Neuron style settings
const neuronColor = 0x79a7d3; // Light blue color
const neuronSize = 5; // Radius of the neuron circles

// Create a container for neurons
let neuronContainer = new PIXI.Container();
app.stage.addChild(neuronContainer);

// Create neuron graphics function
function createNeuron(x, y) {
    let neuron = new PIXI.Graphics();
    neuron.beginFill(neuronColor);
    neuron.drawCircle(0, 0, neuronSize); // Draw circle at (0,0) in local neuron coordinates
    neuron.endFill();
    neuron.x = x;
    neuron.y = y;
    neuronContainer.addChild(neuron);
    return neuron;
}

// Populate the screen with neurons
let numberOfNeurons = 100; // Adjust the number as needed
for (let i = 0; i < numberOfNeurons; i++) {
    createNeuron(Math.random() * app.screen.width, Math.random() * app.screen.height);
}

// Animation loop for the firing effect
app.ticker.add((delta) => {
    neuronContainer.children.forEach(neuron => {
        // Add pulsing effect
        if (Math.random() < 0.05) { // Adjust the probability as needed
            neuron.scale.x = neuron.scale.y = 1 + Math.sin(app.ticker.lastTime / 100) * 0.2;
        }
    });
});

// Start the PixiJS ticker
app.ticker.start();
