class Game {
    finished = false
    pieces = []
    rooms = []
    players = []
    currentPlayer = 0
    size = 0

    createGameBoard(size) {
        this.pieces = []
        this.rooms = []
        this.size = size
        for (let i = 0; i < size * 2 + 1; i++) {
            let row = []
            let numberOfWalls = i % 2 == 0 ? size : size + 1

            for (let j = 0; j < numberOfWalls; j++) {
                row.push(new Wall())
            }

            this.pieces.push(row)
        }

        console.log(this.pieces)

        for (let i = 0; i < size; i++) {
            let row = []

            for (let j = 0; j < size; j++) {
                row.push(
                    new Room(
                        this.pieces[i * 2][j], // top
                        this.pieces[i * 2 + 1][j + 1], // right
                        this.pieces[i * 2 + 2][j], // bottom
                        this.pieces[i * 2 + 1][j], // left,
                        this,
                    ),
                )
            }

            this.rooms.push(row)
        }

        console.log(this.rooms)
    }

    start() {
        if (this.players.length < 2) {
            throw new Error('A minimum of two players is required')
        }
        this.render()
    }

    render() {
        document.querySelector('#name').innerHTML = this.players[
            this.currentPlayer
        ].name
        let gameboard = document.querySelector('#gameboard')
        gameboard.innerHTML = ''
        const rowTemplate = document.querySelector('#row')
        const roomTemplate = document.querySelector('#room')

        for (let i = 0; i < this.rooms.length; i++) {
            let row = this.rooms[i]
            let rowInstance = rowTemplate.content.cloneNode(true)
            let rowElem = rowInstance.querySelector('.row')

            for (let j = 0; j < row.length; j++) {
                let room = this.rooms[i][j]
                let roomInstance = roomTemplate.content.cloneNode(true)
                let roomElem = roomInstance.querySelector('.room')

                roomElem.dataset.row = i
                roomElem.dataset.col = j

                for (let k = 0; k < room.getWalls().length; k++) {
                    let wallElem = roomElem.querySelector(`[data-pos='${k}']`)
                    if (room.getWall(k).getClicked()) {
                        wallElem.classList.add('active')
                    }
                }

                if (room.isComplete() && room.owner != null) {
                    roomElem.style.background = room.owner.color
                }

                if (room.isComplete() && room.owner == null) {
                    console.error('panic')
                    room.owner = this.players[this.currentPlayer]
                }

                rowElem.appendChild(roomInstance)
            }

            gameboard.appendChild(rowInstance)
        }

        this.initEventListeners()
    }

    initEventListeners() {
        if (this.finished) return

        // get all the buttons
        let buttons = document.querySelectorAll('.wall')
        for (let i = 0; i < buttons.length; i++) {
            // add click listener to each button
            buttons[i].addEventListener('click', () => {
                let data = buttons[i].parentElement.dataset
                let room = this.rooms[data.row][data.col]
                this.makeMove(room, parseInt(buttons[i].dataset.pos))
            })
        }
    }

    makeMove(room, pos) {
        try {
            room.makeMove(pos, this.players[this.currentPlayer])
            // check if player has won
            if (this.gameIsFinished()) {
                this.render()
                this.finished = true
                // Show in screen
                console.log('Game has finished!')
                let names = []
                let points = []
                for (let i = 0; i < this.players.length; i++) {
                    names.push(this.players[i].name)
                    points.push(this.players[i].points)
                    this.players[i].points = 0
                }
                alert(
                    'Final score: ' +
                        '\n' +
                        names[0] +
                        ': ' +
                        points[0] +
                        '\n' +
                        names[1] +
                        ': ' +
                        points[1],
                )
                this.createGameBoard(this.size)
                this.start()
            } else {
                this.nextTurn()
            }
        } catch (e) {
            console.error(e.message)
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

    addPlayer(player) {
        this.players.push(player)
    }

    getCurrentPlayer() {
        return this.players[this.currentPlayer]
    }
}

class Player {
    name = null
    color = 'red'
    points = 0

    constructor(name, color) {
        this.name = name
        this.color = color
        this.points = 0
    }

    addPoint() {
        this.points = this.points + 1
    }
}

class Wall extends EventTarget {
    clicked = false
    eventEmitter = null

    constructor() {
        super()
        this.clicked = false
        // eventEmitter = new events.EventEmitter()
    }

    click() {
        if (this.clicked == true) {
            throw new Error('This wall has already been taken')
        }

        this.clicked = true
        this.dispatchEvent(new Event('clicked'))
    }

    getClicked() {
        return this.clicked
    }
}

class Room {
    owner = null
    walls = []

    // Each room has 4 walls: top right bottom left
    constructor(wallTop, wallRight, wallBottom, wallLeft, game) {
        this.walls = [wallTop, wallRight, wallBottom, wallLeft]

        for (let i = 0; i < this.walls.length; i++) {
            this.walls[i].addEventListener('clicked', (e) => {
                if (this.isComplete()) {
                    this.owner = game.getCurrentPlayer()
                    this.owner.addPoint()
                    console.log(this.owner)
                }
            })
        }
    }

    getWall(pos) {
        return this.walls[pos]
    }

    getWalls() {
        return this.walls
    }

    makeMove(pos, player) {
        // pos 0 = top, 1 = right, 2 = bottom, 3 = left
        this.walls[pos].click()
    }

    // every checks every element in the array
    // check if all walls are true
    isComplete() {
        return this.walls.every((wall) => wall.getClicked() == true)
    }
}

window.onload = () => {
    let game = new Game()
    game.createGameBoard(3)
    game.addPlayer(new Player('Red', 'red'))
    game.addPlayer(new Player('Blue', 'blue'))
    game.start()
}
