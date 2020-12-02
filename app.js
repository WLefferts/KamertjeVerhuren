// maak een spelbord
// voeg spelers toe aan het bord
// wijs een beurt aan de eerste speler
// laat een speler een muur klikken
// markeer de muur en kijk of de kamer afgemaakt is

class Game {
    rooms = [];
    players = [];
    currentPlayer = 0;

    constructor(size) {
        // Create 2d array of rooms
        for(let i = 0; i < size; i++){
            let row = []

            for(let j = 0; j < size; j++){
                row.push(new Room());
            }

            this.rooms.push(row);
        }

        console.log(this.rooms);
    }

    addPlayer(player){
        this.players.push(player)
    }

    start(){
        this.render()
    }

    render(){
        let nameDiv = document.getElementById("name");
        nameDiv.innerHTML = this.players[this.currentPlayer].name;

        // every turn the gameboard gets refreshed
        let gameboard = document.getElementById("gameboard");
        gameboard.innerHTML = '';

        let gameboardHtml = '';
        // loop through the rows of the gameboard
        for(let i = 0; i < this.rooms.length; i++){
            gameboardHtml += "<div class='row'>"

            for(let j = 0; j < this.rooms.length; j++) {
                // loop throught the elements of the rows and create buttons for each element
                gameboardHtml += "<div class='room'>";
                gameboardHtml += "<button class='wall' data-pos='0' data-row='"+i+"' data-col='"+j+"'> Top </button>";
                gameboardHtml += "<button class='wall' data-pos='1' data-row='"+i+"' data-col='"+j+"'> Right </button>";
                gameboardHtml += "<button class='wall' data-pos='2' data-row='"+i+"' data-col='"+j+"'> Bottom </button>";
                gameboardHtml += "<button class='wall' data-pos='3' data-row='"+i+"' data-col='"+j+"'> Left </button>";
                gameboardHtml += "</div>";
            }

            gameboardHtml += "</div>";
        }
        gameboard.innerHTML = gameboardHtml;

        // get all the buttons
        let buttons = document.querySelectorAll(".wall");
        for(let i = 0; i < buttons.length; i++){
            // add click listener to each button
            buttons[i].addEventListener('click', ()=>{
                console.log(buttons[i].dataset.pos + " clicked");
                try{
                    this.makeMove(parseInt(buttons[i].dataset.row), parseInt(buttons[i].dataset.col), parseInt(buttons[i].dataset.pos));
                } catch(e){
                    console.log(e.message)
                }
            });
        }
    }

    makeMove(row, col, pos){
        console.log(row, col, this.rooms)
        let room = this.rooms[row][col];

        // Todo: take overlap into acccount

        room.makeMove(pos, this.players[this.currentPlayer])
        // check if player has won
        if(this.gameIsFinished()){
            // Show in screen
            console.log("Game has finished!");

            // todo: check winner by sum of owned rooms per players
        } else {
            this.nextTurn();
        }
    }

    gameIsFinished(){
        let rows = [];

        for(let i = 0; i < this.rooms.length; i++){
            let roomsInRow = this.rooms[i];
            rows.push(roomsInRow.every(room => room.isComplete()));
        }
        
        return rows.every(row => row == true)
    }

    nextTurn(){
        // check if last player has done it's turn
        if(this.currentPlayer == this.players.length - 1){
            this.currentPlayer = 0;
        } else {
            this.currentPlayer++;
        }

        this.render();
    }
}

class Player {
    name = '';

    constructor(name){
        this.name = name;
    }
}

class Wall {
    boolean
    fucntion() {
        return boolean
    }
}

class Room {
    owner = null

    // Each room has 4 walls: top right bottom left
    walls = [new Wall(), new Wall(), new Wall(), new Wall()]

    makeMove(pos, player){
        // pos 0 = top, 1 = right, 2 = bottom, 3 = left
        if(this.walls[pos] == true){
            throw new Error("This wall has already been taken");
        }        

        this.walls[pos] = true;
       
        if(this.isComplete()){
            this.owner = player;
        }
    }
    
    // every checks every element in the array
    // check if all walls are true
    isComplete(){
        return this.walls.every(wall => wall == true);
    }
}

window.onload = () => {
  let game = new Game(3);

  game.addPlayer(new Player("Emile"));
  game.addPlayer(new Player("Willem"));

  game.start()
//   let r = new Room();
//   r.makeMove(0);r.makeMove(1);r.makeMove(2);
//   console.log(r.isComplete())
};


// Walls als class maken
// event emitters
