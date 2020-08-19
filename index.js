const { Engine, Render, Runner, World, Bodies, Body, Events} = Matter;

const width = window.innerWidth; //how big we want the world to be in px
const height = window.innerHeight;
const cellsHorizontal = 14;
const cellsVertical = 10;

const unitLengthX = width/cellsHorizontal;
const unitLengthY = height/cellsVertical;

const engine = Engine.create(); // creates an engine which includes a world
engine.world.gravity.y = 0; //turns off gravity
const {world} = engine; // destructure the world from the engine
const render = Render.create({
    element: document.body, //where we want to show the drawing
    engine: engine,
    options: {
        wireframes: false,
        width,
        height
    }
});
Render.run(render);
Runner.run(Runner.create(), engine);




//Walls - first two numbers are center position of shape
// numbers three and four are width then height
const walls = [
    Bodies.rectangle(width/2, 0, width, 2, { isStatic: true}),
    Bodies.rectangle(width/2, height, width, 2, { isStatic: true}),
    Bodies.rectangle(0, height/2, 2, height, { isStatic: true}),
    Bodies.rectangle(width, height/2, 2, height, { isStatic: true}),
];
World.add(world, walls);

// Shuffle function
const shuffle = (arr) => {
    let counter = arr.length;

    while (counter > 0) {
        const index = Math.floor(Math.random() * counter);
        counter--;

        const temp = arr[counter];
        arr[counter] = arr[index];
        arr[index] = temp;
    }

    return arr;
};

//Grid generation
const grid = Array(cellsVertical).fill(null) //creates the outer array with three empty rows
.map(() => Array(cellsHorizontal).fill(false)); // fills the rows with information to create columns


// grid walls
const verticals = Array(cellsVertical).fill(null).map(() => Array(cellsHorizontal -1).fill(false));
const horizontals = Array(cellsVertical -1).fill(null).map(() => Array(cellsHorizontal).fill(false));

const startRow = Math.floor(Math.random() * cellsVertical);
const startColumn = Math.floor(Math.random() * cellsHorizontal);

const stepThroughCell = (row, column) => {
if (grid[row][column]) {
    return;
}
grid[row][column] = true; //Assign first cell randomly

// Assign neighbour coordinates
const neighbours = shuffle([
    [row - 1, column, "up"],
    [row, column - 1, "left"],
    [row + 1, column, "down"],
    [row, column + 1, "right"]
]);
for (let neighbour of neighbours){
    const [nextRow, nextColumn, direction] = neighbour;

    if (nextRow < 0 || nextRow >= cellsVertical || 
        nextColumn < 0 || nextColumn >= cellsHorizontal){
        continue;
    }

    if (grid[nextRow][nextColumn]) {
        continue;
    }

    if (direction === "left") {
        verticals[row][column -1] = true;
    } else if (direction === "right") {
        verticals[row][column] = true;
    } else if (direction === "up") {
        horizontals[row - 1][column] = true;
    } else if (direction === "down") {
        horizontals[row][column] = true;
    }

    stepThroughCell(nextRow, nextColumn);
}


};

stepThroughCell(startRow, startColumn);

horizontals.forEach((row, rowIndex) => {
    row.forEach((open, columnIndex) => {
        if (open) {
            return;
        } 

        const wall = Bodies.rectangle(
            columnIndex * unitLengthX + unitLengthX / 2, 
            rowIndex * unitLengthY + unitLengthY,
            unitLengthX,
            5,
            { isStatic: true,
            label: "wall",
            render: {
                fillStyle: "red"
            }}
        );
        World.add(world, wall);
    });
});

verticals.forEach((row, rowIndex) => {
    row.forEach((open, columnIndex) => {
        if (open) {
            return;
        } 

        const wall = Bodies.rectangle(
            
            columnIndex * unitLengthX + unitLengthX, 
            rowIndex * unitLengthY + unitLengthY / 2,
            5,
            unitLengthY,
            { isStatic: true,
            label: "wall",
            render: {
                fillStyle: "red"
            }}
        );
        World.add(world, wall);
    });
});

//Goal
const goal = Bodies.rectangle(
width - unitLengthX/2,
height - unitLengthY/2,
unitLengthX * 0.7,
unitLengthY * 0.7,
{isStatic: true,
label: "goal",
render: {
    fillStyle: "green"
}}
);

World.add(world, goal);

//Ball
const radius = Math.min(unitLengthX, unitLengthY) / 4;
const ball = Bodies.circle(
    unitLengthX/2,
    unitLengthY/2,
    radius, 
    {label: "ball",
    render: {
        fillStyle: "blue"
    }}
);
World.add(world, ball);


//Moving the ball
document.addEventListener("keydown", event => {
    const {x, y} = ball.velocity;
    
    if (event.keyCode === 87){
        Body.setVelocity(ball, {x, y: y - 5});
    }
    if (event.keyCode === 68){
        Body.setVelocity(ball, {x: x + 5, y});
    }
    if (event.keyCode === 83){
        Body.setVelocity(ball, {x, y: y + 5});
    }
    if (event.keyCode === 65){
        Body.setVelocity(ball, {x: x - 5, y});
    }
});

//Win condition animation
Events.on(engine, "collisionStart", event => {
    event.pairs.forEach(collision => {
        const labels = ["ball", "goal"];
        if (labels.includes(collision.bodyA.label) && (labels.includes(collision.bodyB.label))) {
            document.querySelector(".winner").classList.remove("hidden");
            world.gravity.y = 1;
            world.bodies.forEach(body => {
                if (body.label === "wall") {
                    Body.setStatic(body, false);
                }
            });
        }
    });
});
