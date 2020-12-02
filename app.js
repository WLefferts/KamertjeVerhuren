// maak een spelbord
// voeg spelers toe aan het bord
// wijs een beurt aan de eerste speler
// laat een speler een muur klikken
// markeer de muur en kijk of de kamer afgemaakt is

var events = require('events')

class Game {
    rooms = []
    players = []
    currentPlayer = 0

    constructor(size) {
        // Create 2d array of rooms
        for (let i = 0; i < size; i++) {
            // i = column index
            let column = []
            let columnSharedWalls = []
            // Create the shared walls for this column
            for (let j = 0; j < size - 1; j++) {
                columnSharedWalls.push(new Wall())
            }
            for (let k = 0; k < size; k++) {
                // k = room index
                if (i == 0) {
                    // if k 0 bottom
                    // if k n top bottom (n-1)
                    //if k last top
                    // wallTop, wallRight, wallBottom, wallLeft
                    if (k == 0) {
                        column.push(
                            new Room(
                                new Wall(),
                                new Wall(),
                                columnSharedWalls[k],
                                new Wall(),
                            ),
                        )
                    } else if (k == size - 1) {
                        column.push(
                            new Room(
                                columnSharedWalls[k - 1],
                                new Wall(),
                                new Wall(),
                                new Wall(),
                            ),
                        )
                    } else {
                        column.push(
                            new Room(
                                columnSharedWalls[k - 1],
                                new Wall(),
                                columnSharedWalls[k],
                                new Wall(),
                            ),
                        )
                    }
                    // console.log("Created room");
                } else {
                    const col = this.rooms[i - 1]
                    const room = col[k]
                    const wall = room.getWall(1)
                    if (k == 0) {
                        column.push(
                            new Room(
                                new Wall(),
                                new Wall(),
                                columnSharedWalls[k],
                                wall,
                            ),
                        )
                    } else if (k == size - 1) {
                        column.push(
                            new Room(
                                columnSharedWalls[k - 1],
                                new Wall(),
                                new Wall(),
                                wall,
                            ),
                        )
                    } else {
                        column.push(
                            new Room(
                                columnSharedWalls[k - 1],
                                new Wall(),
                                columnSharedWalls[k],
                                wall,
                            ),
                        )
                    }
                }
            }
            this.rooms.push(column)
            // console.log(column);
            // console.log("Created column");
        }
        // console.log(this.rooms);
    }

    addPlayer(player) {
        this.players.push(player)
    }

    start() {
        this.render()
    }

    render() {
        let nameDiv = document.getElementById('name')
        nameDiv.innerHTML = this.players[this.currentPlayer].name

        // every turn the gameboard gets refreshed
        let gameboard = document.getElementById('gameboard')
        gameboard.innerHTML = ''

        let gameboardHtml = ''
        // loop through the rows of the gameboard
        for (let i = 0; i < this.rooms.length; i++) {
            gameboardHtml += "<div class='row'>"
            // loop throught the elements of the rows and create buttons for each element
            for (let j = 0; j < this.rooms.length; j++) {
                gameboardHtml += "<div class='room'>"
                gameboardHtml +=
                    "<button class='wall' data-pos='0' data-row='" +
                    i +
                    "' data-col='" +
                    j +
                    "'> Top </button>"
                gameboardHtml +=
                    "<button class='wall' data-pos='1' data-row='" +
                    i +
                    "' data-col='" +
                    j +
                    "'> Right </button>"
                gameboardHtml +=
                    "<button class='wall' data-pos='2' data-row='" +
                    i +
                    "' data-col='" +
                    j +
                    "'> Bottom </button>"
                gameboardHtml +=
                    "<button class='wall' data-pos='3' data-row='" +
                    i +
                    "' data-col='" +
                    j +
                    "'> Left </button>"
                gameboardHtml += '</div>'
            }
            gameboardHtml += '</div>'
        }
        gameboard.innerHTML = gameboardHtml

        // get all the buttons
        let buttons = document.querySelectorAll('.wall')
        for (let i = 0; i < buttons.length; i++) {
            // add click listener to each button
            buttons[i].addEventListener('click', () => {
                console.log(buttons[i].dataset.pos + ' clicked')
                try {
                    this.makeMove(
                        parseInt(buttons[i].dataset.row),
                        parseInt(buttons[i].dataset.col),
                        parseInt(buttons[i].dataset.pos),
                    )
                } catch (e) {
                    console.log(e.message)
                }
            })
        }
    }

    makeMove(row, col, pos) {
        console.log(row, col, this.rooms)
        let room = this.rooms[row][col]

        room.makeMove(pos, this.players[this.currentPlayer])
        // check if player has won
        if (this.gameIsFinished()) {
            // Show in screen
            console.log('Game has finished!')

            // todo: check winner by sum of owned rooms per players
        } else {
            this.nextTurn()
        }
    }

    gameIsFinished() {
        let rows = []

        for (let i = 0; i < this.rooms.length; i++) {
            let roomsInRow = this.rooms[i]
            rows.push(roomsInRow.every((room) => room.isComplete()))
        }

        return rows.every((row) => row == true)
    }

    nextTurn() {
        // check if last player has done it's turn
        if (this.currentPlayer == this.players.length - 1) {
            this.currentPlayer = 0
        } else {
            this.currentPlayer++
        }

        this.render()
    }
}

class Player {
    name = ''

    constructor(name) {
        this.name = name
    }
}

class Wall {
    clicked = false
    eventEmitter = null

    constructor() {
        this.clicked = false
        eventEmitter = new events.EventEmitter()
    }

    click() {
        if (this.clicked == true) {
            throw new Error('This wall has already been taken')
        }
        this.clicked = true
    }

    getClicked() {
        return this.clicked
    }
}

class Room {
    owner = null
    walls = []

    // Each room has 4 walls: top right bottom left
    constructor(wallTop, wallRight, wallBottom, wallLeft) {
        this.walls = [wallTop, wallRight, wallBottom, wallLeft]
    }

    getWall(pos) {
        return this.walls[pos]
    }

    makeMove(pos, player) {
        // pos 0 = top, 1 = right, 2 = bottom, 3 = left
        this.walls[pos].click()

        if (this.isComplete()) {
            this.owner = player
        }
    }

    // every checks every element in the array
    // check if all walls are true
    isComplete() {
        return this.walls.every((wall) => wall.getClicked == true)
    }
}

window.onload = () => {
    let game = new Game(6)

    game.addPlayer(new Player('Emile'))
    game.addPlayer(new Player('Willem'))

    game.start()
    //   let r = new Room();
    //   r.makeMove(0);r.makeMove(1);r.makeMove(2);
    //   console.log(r.isComplete())
}

// walls als class maken
// event emitters
