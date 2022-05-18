//Canvas dimensions
const canvas=
{
    w: 800,
    h: 600,
    tileSize: 8,
    html: document.getElementById("canvas")
};
const CTX = canvas.html.getContext("2d");

//input handler array
let keysDown = {};

addEventListener("keydown", function(event)
{
    keysDown[event.key] = true;
});
addEventListener("keyup", function(event)
{
    delete keysDown[event.key];
});
addEventListener("mousedown", function(event)
{
    keysDown[event.type] = true;
});
addEventListener("mouseup", function(event)
{
    delete keysDown["mousedown"];
});

class Vector
{
    constructor(curvature, distance)
    {
        //0 = straight
        this.curvature = curvature;

        //units...
        this.distance = distance;
    }
};

const track = [];

//Timing/FPS
var lastFrame = 0;
var fpsTime = 0;
var frameCount = 0;
var fps = 0;
var delta = 0;

var gameSpeed = 10;

var car =
{
    acc: 50,
    currSpd: 0,
    maxSpd: 250,
    friction: 1.5
}

var distanceDriven = 0;
var trackDistance = 0;
var curvature = 0;
var targetCurvature;
var trackCurvature;
var currSegment;
var offset = 0;
var trackSection = 0;
 
//This gets the loop started
window.onload = init();

function init()
{
    //Assign the width and height to the canvas
    canvas.html.setAttribute("width", canvas.w);
    canvas.html.setAttribute("height", canvas.h);
    createTrack();
    //start the loop
    loop(0);
}

function loop(time)
{
    calcFPS(time);
    update(delta);
    draw();
    requestAnimationFrame(loop);
}


function update(time)
{
    handleInput(time);
    calcTrackStuff(time);
}

function handleInput(time)
{
    if(keysDown)
    {
        car.currSpd += car.acc;
    }
    if(car.currSpd > 0)
    {
        car.currSpd -= car.friction;
    }
    if(Math.abs(car.currSpd) < car.friction)
    {
        car.currSpd = 0;
    }    

    if(car.currSpd >= car.maxSpd)
    {
        car.currSpd = car.maxSpd;
    }

    distanceDriven += car.currSpd  * time;
}

function calcFPS(time)
{
    delta = (time - lastFrame) / 1000;
    lastFrame = time;

    if(fpsTime > .25)
    {
        fps = Math.round(frameCount / fpsTime);
        fpsTime = 0;
        frameCount = 0;
    }

    fpsTime += delta;
    frameCount++;
}

function draw()
{
    clearCanvas();
    drawCanvasBG("#565656");
    drawSky();
    drawBG();
    drawRoad();
    drawCar();

    drawFPS();
    drawDistance();
    drawSection();
}

function clearCanvas()
{
    CTX.clearRect(0,0, canvas.w, canvas.h);
}

function drawCanvasBG(fill)
{
    CTX.fillStyle = fill;
    CTX.fillRect(0, 0, canvas.w, canvas.h);
}

function drawFPS()
{
    CTX.fillStyle = "black";
    CTX.font = "15px Arial";
    CTX.fillText("FPS: " + fps, 30, 20);
    CTX.closePath();
}

function drawDistance()
{
    CTX.fillStyle = "black";
    CTX.font = "15px Arial";
    CTX.fillText("Distance: " + Math.floor(distanceDriven) + " / " + trackDistance, 30, 40);
    CTX.closePath();
}

function drawSection()
{
    CTX.fillStyle = "black";
    CTX.font = "15px Arial";
    CTX.fillText("Current Segment: " + currSegment, 30, 60);
    CTX.closePath();
}

function drawRoad()
{
    for(let y = 0; y < canvas.h/2; y+=canvas.tileSize)
    {
        for(let x = 0; x < canvas.w; x+=canvas.tileSize)
        {
            var row = y + canvas.h/2;
            var col = x;
            var perspective = y / (canvas.h/2);

            var roadWidth = (canvas.tileSize * 9) + perspective * .85 * canvas.w ;
            var candyWidth = roadWidth * .15;

            var middlePoint = canvas.w/2 + ((curvature) * Math.pow((1 - perspective), 3));

            var leftGrass = middlePoint - roadWidth/2 - candyWidth;
            var leftCandy = middlePoint - roadWidth/2;
            var rightCandy = middlePoint + roadWidth/2;
            var rightGrass = middlePoint + roadWidth/2 + candyWidth;

            var grassColor = Math.sin(20 * Math.pow(1 - perspective, 3) + distanceDriven * .1) > 0 ? "#037d50" : "#003333"; 
            var candyColor = Math.sin(80 * Math.pow(1 - perspective, 2) + distanceDriven) > 0 ? "red" : "white"; 

            if((col >= 0 && col < leftGrass) || (col >= rightGrass && col < canvas.w))
            {
                CTX.fillStyle = grassColor;
                CTX.fillRect(col, row, canvas.tileSize, canvas.tileSize);
            }
            if((col > leftGrass && col < leftCandy) || (col > rightCandy && col < rightGrass))
            {
                CTX.fillStyle = candyColor;
                CTX.fillRect(col, row, canvas.tileSize, canvas.tileSize);
            }
            if(col > leftCandy && col < rightCandy)
            {
                CTX.fillStyle = "black";
                CTX.fillRect(col, row, canvas.tileSize, canvas.tileSize);
            }
        }
    }
}

function drawSky()
{
    for(let y = 0; y < canvas.h/2; y+=canvas.tileSize)
    {
        for(let x = 0; x < canvas.w; x+=canvas.tileSize)
        {
            CTX.fillStyle = "skyblue";
            CTX.fillRect(x, y, canvas.tileSize, canvas.tileSize);
        }
    }
}

function drawBG()
{
    for(let x = 0; x < canvas.w; x++)
    {
        var hill = Math.abs(Math.sin(x * .01 + curvature) * 32);
        for(let y = (canvas.h/2) - hill * 2; y < canvas.h/2; y+=canvas.tileSize)
        {
            CTX.fillStyle = "brown";
            CTX.fillRect(x, y, canvas.tileSize, canvas.tileSize);
        }
    }
}

function drawCar()
{
    CTX.fillStyle = "skyblue";
    CTX.fillRect(canvas.w/2 - canvas.w * .1, canvas.h - canvas.h * .2, (canvas.w * .1) * 2, canvas.h * .0625);
    CTX.fillStyle = "orange";
    CTX.fillRect(canvas.w/2 - canvas.w * .1, canvas.h - canvas.h * .2, (canvas.w * .1) * .5, canvas.h * .1);
    CTX.fillRect(canvas.w/2 + canvas.w * .05, canvas.h - canvas.h * .2, (canvas.w * .1) * .5, canvas.h * .1);
    CTX.fillRect(canvas.w/2 - canvas.w * .1, canvas.h - canvas.h * .1, (canvas.w * .1) * 2, canvas.h * .0625);
}

function drawRect(x, y, w, h, fill)
{
    CTX.drawRect(x, y, w, h, fill);
}

function createTrack()
{
    newSegment = new Vector(0, 500); //start/finish
    track.push(newSegment);
    newSegment = new Vector(-100, 1000); //straight section
    track.push(newSegment);
    newSegment = new Vector(-50, 500); //straight section
    track.push(newSegment);
    newSegment = new Vector(0, 500);
    track.push(newSegment);
    newSegment = new Vector(100, 100); //straight section
    track.push(newSegment);
    newSegment = new Vector(-200, 200);
    track.push(newSegment);
    newSegment = new Vector(600, 200);
    track.push(newSegment);

    calcTrackDistance();
}

function calcTrackDistance()
{
    track.forEach(t =>
        {
            trackDistance += t.distance;
        });
}

function calcTrackStuff(time)
{

    if(distanceDriven >= trackDistance)
    {
        distanceDriven -= trackDistance;
        offset = 0;
        trackSection = 0;
    }

    while(trackSection < track.length && offset <= distanceDriven)
    {
        offset += track[trackSection].distance;
        trackSection++;
        currSegment = trackSection;
    }

    
    var targetCurvature = track[trackSection - 1].curvature;
    var trackCurveDifference = (targetCurvature - curvature) * time;

    curvature += trackCurveDifference;
    trackCurvature += curvature * time * distanceDriven;
}