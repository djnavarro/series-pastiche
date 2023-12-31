
// nodejs libraries
const {createCanvas, loadImage} = require('canvas')
const seedrandom = require('seedrandom') 
const fs = require('fs')

// generate an image using the seed
function drawImage(seed) {

    // message
    console.log("seed: " + seed)

    // constants 
    const pixels = 2000 // pixels in the image
    const border = 0    // pixels comprising the border
    const grain = 10    // rows and columns in the grid
    const iter = 100    // iterations to add to image

    // create a canvas
    // https://github.com/Automattic/node-canvas
    const canvas = createCanvas(pixels, pixels)
    let ctx = canvas.getContext('2d')

    // create a seeded random number generator
    // https://github.com/davidbau/seedrandom
    let rng = seedrandom.alea(seed)

    // function to sample an item from an array
    function sampleArray(items) {
        return(items[Math.floor(rng.double()*items.length)]);
    }

    // function to wrap coords
    function wrap(x) {
        if (x < 0) return (pixels - x)
        if (x > 0) return (x - pixels)
        return x 
    }

    // sample a palette
    const palettes = [
        ["#de9151", "#f34213", "#2e2e3a", "#bc5d2e", "#bbb8b2"],
        ["#a63446", "#fbfef9", "#0c6291", "#000004", "#7e1946"],
        ["#ffffff", "#ffcad4", "#b0d0d3", "#c08497", "#f7af9d"],
        ["#aa8f66", "#ed9b40", "#ffeedb", "#61c9a8", "#ba3b46"],
        ["#241023", "#6b0504", "#a3320b", "#d5e68d", "#47a025"],
        ["#64113f", "#de4d86", "#f29ca3", "#f7cacd", "#84e6f8"],
        ["#660000", "#990033", "#5f021f", "#8c001a", "#ff9000"],
        ["#c9cba3", "#ffe1a8", "#e26d5c", "#723d46", "#472d30"],
        ["#0e7c7b", "#17bebb", "#d4f4dd", "#d62246", "#4b1d3f"],
        ["#0a0908", "#49111c", "#f2f4f3", "#a9927d", "#5e503f"],
        ["#020202", "#0d324d", "#7f5a83", "#a188a6", "#9da2ab"],
        ["#c2c1c2", "#42213d", "#683257", "#bd4089", "#f51aa4"],
        ["#820263", "#d90368", "#eadeda", "#2e294e", "#ffd400"],
        ["#f4e409", "#eeba0b", "#c36f09", "#a63c06", "#710000"],
        ["#d9d0de", "#bc8da0", "#a04668", "#ab4967", "#0c1713"],
        ["#012622", "#003b36", "#ece5f0", "#e98a15", "#59114d"],
        ["#3c1518", "#69140e", "#a44200", "#d58936", "#fffb46"],
        ["#6e0d25", "#ffffb3", "#dcab6b", "#774e24", "#6a381f"],
        ["#bcabae", "#0f0f0f", "#2d2e2e", "#716969", "#fbfbfb"],
        ["#2b4162", "#385f71", "#f5f0f6", "#d7b377", "#8f754f"]
    ]
    const palette = sampleArray(palettes)

    // set background colour
    ctx.fillStyle = sampleArray(palette);
    ctx.fillRect(0, 0, pixels, pixels);

    // define a discrete set of permissible grid locations
    let grid = []
    let k = 0
    for (let i = 0; i < (grain - 1); i++) {
        for (let j = 0; j < (grain - 1); j++) {
            grid[k] = {
                id: k,
                col: i,
                row: j,
                size: ((pixels - border * 2) / grain),
                x: ((pixels - border * 2) / grain) * (i + 1) + border,
                y: ((pixels - border * 2) / grain) * (j + 1) + border,
                valid: true,
                shade: sampleArray(palette),
                vertical: rng.double() < .5,
                exponent: .9
            }
            k++
        }
    }

    function drawCircle(x, y, shade, size) {
        ctx.fillStyle = shade
        ctx.strokeStyle = shade
        ctx.lineWidth = 5
        ctx.beginPath()
        let arc1 = Math.PI * 2 * rng.double()
        let arc2 = Math.PI * 2 * rng.double()
        ctx.arc(x, y, size, arc1, arc2)
        ctx.fill()
        ctx.stroke()
        ctx.closePath();
    }

    // render the circle defined by the cell
    function drawCell(cell) {

        // draw base circle
        drawCircle(cell.x, cell.y, cell.shade, cell.size)

        // boundaries to consider for wrapping
        let xover  = (cell.x + cell.size) > pixels      
        let yover  = (cell.y + cell.size) > pixels
        let xunder = (cell.x - cell.size) < 0
        let yunder = (cell.y - cell.size) < 0
        
        // cases where we wrap around one boundary
        if (xover)  drawCircle(cell.x - pixels, cell.y, cell.shade, cell.size)
        if (yover)  drawCircle(cell.x, cell.y - pixels, cell.shade, cell.size)
        if (xunder) drawCircle(pixels - cell.x, cell.y, cell.shade, cell.size)
        if (yunder) drawCircle(cell.x, pixels - cell.y, cell.shade, cell.size)

        // cases where we wrap around both boundaries
        if (xover & yover)   drawCircle(cell.x - pixels, cell.y - pixels, cell.shade, cell.size)
        if (xover & yunder)  drawCircle(cell.x - pixels, pixels - cell.y, cell.shade, cell.size)
        if (xunder & yover)  drawCircle(pixels - cell.x, cell.y - pixels, cell.shade, cell.size)
        if (xunder & yunder) drawCircle(pixels - cell.x, pixels - cell.y, cell.shade, cell.size)
    }

    // update the cell per its own rules
    function updateCell(cell) {
        //if (rng.double() < .1) cell.shade = sampleArray(palette)
        if (cell.vertical) {
            cell.y = wrap(cell.y + (pixels / grain) * rng.double())
        } else {
            cell.x = wrap(cell.x + (pixels / grain) * rng.double())
        }
        cell.size = cell.size * cell.exponent
    }

    // create the image
    for (let z = 0; z < iter; z++) {
        grid.map(cell => {
            drawCell(cell)
            updateCell(cell)
        })
    }

    // write the image to file
    const out = fs.createWriteStream('../output/09/advent_09_' + seed + '.png')
    const stream = canvas.createPNGStream()
    stream.pipe(out)
}

// generate all the images
for (seed = 1000; seed < 1010; seed++) {
    drawImage(seed)
}
