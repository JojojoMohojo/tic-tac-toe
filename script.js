const GameBoard = (() => {
    const rows = 3;
    const columns = 3;
    const board = [];

    const resetBoard = () => {
        if (board.length === 0) {
            for (let i = 0; i < rows; i++) {
                board[i] = [];
                for (let j = 0; j < columns; j++) {
                    board[i].push(Cell());
                }
            }
        } else { 
            for (let i = 0; i < rows; i++) {
                for (let j = 0; j < columns; j++) {
                    board[i][j] = Cell();
                }
            }
        }
    };

    const getBoard = () => board;

    const placeMarker = (row, column, player) => {
        const validMove = board[row][column].getValue() === 0;
        if (validMove) {
            board[row][column].addMarker(player);
        }        
        return validMove;
    }

    const printBoard = () => {
      const boardWithCellValues = board.map((row) => row.map((cell) => cell.getValue()))
      console.log(boardWithCellValues);
    };

    const checkForDraw = () => {
        const allCellsFilled = board.every(row => row.every(cell => cell.getValue() !== 0));
        return allCellsFilled;
    };
    

    const checkForWin = () => {
        return checkRowWin() || checkColumnWin() || checkDiagonalWin();
    }

    const checkRowWin = () => {
        for (let i = 0; i < rows; i++) {
            const firstCell = board[i][0].getValue();
            if (firstCell !== 0 && board[i].every(cell => cell.getValue() === firstCell)) {
                return true;
            }
        }
        return false;
    };

    const checkColumnWin = () => {
        for (let i = 0; i < columns; i++) {
            const firstCell = board[0][i].getValue();
            if (firstCell !== 0 && board.every(row => row[i].getValue() === firstCell)) {
                return true;
            }
        }
        return false;
    }

    const checkDiagonalWin = () => {
        const firstCellMain = board[0][0].getValue();
        if (firstCellMain !== 0 && board.every((row, index) => row[index].getValue() === firstCellMain)) {
            return true;
        }

        const firstCellAnti = board[0][columns - 1].getValue();
        if (firstCellAnti !== 0 && board.every((row, index) => row[columns - 1 - index].getValue() === firstCellAnti)) {
            return true;
        }

        return false;
    };
    
    return { getBoard, placeMarker, printBoard, checkForWin, checkForDraw, checkRowWin, checkColumnWin, checkDiagonalWin, resetBoard };
})();

function Cell() {
  let value = 0;

  const addMarker = (player) => {
    value = player;
  };

  const getValue = () => value;

  return { addMarker, getValue };
}

const DOMController = (() => {
    const spaces = document.querySelectorAll(".board-space");
    const newGame = document.querySelector(".new-game-button");
    const display = document.querySelector(".text-display");

    const renderBoard = (board) => {
        for (let i = 0; i < 3; i++) {
            for (let j = 0; j < 3; j++) {
                const index = i * 3 + j;
                if (board[i][j].getValue() === 1) {
                    spaces[index].innerHTML = "x";
                } else if (board[i][j].getValue() === 2) {
                    spaces[index].innerHTML = "o";
                } else {
                    spaces[index].innerHTML = "";
                }
            }
        }
    }

    const handleSpaceClick = (event) => {
        if (!game.getGameActive()) {
            return;
        }

        const index = Array.from(spaces).indexOf(event.target);
        const row = Math.floor(index / 3);
        const column = index % 3;

        game.playRound(row + 1, column + 1);
        renderBoard(GameBoard.getBoard());
    }

    const resetBoard = () => {
        spaces.forEach((space) => space.innerHTML = "");
    }

    const updateDisplay = (text) => {
        display.innerHTML = text;
    }

    const init = () => {
        spaces.forEach(space => space.addEventListener("click", handleSpaceClick));
        newGame.addEventListener("click", () => game.resetGame());
    };

    return { renderBoard, resetBoard, updateDisplay, init };
})();

function GameController(
    playerOneName = "Player One",
    playerTwoName = "Player Two"
) {
    const board = GameBoard;
    const domController = DOMController;

    const players = [
        {
            name: playerOneName,
            marker: 1
        },
        {
            name: playerTwoName,
            marker: 2
        }
    ];

    const pickRandomPlayer = () => {
        return Math.floor(Math.random() * 2);
    };

    let gameActive = false;
    let activePlayer = players[pickRandomPlayer()];

    const getActivePlayer = () => activePlayer;

    const getGameActive = () => gameActive;
    
    const switchPlayerTurn = () => {
        activePlayer = activePlayer === players[0] ? players[1] : players[0];
        domController.updateDisplay(`${activePlayer.name}'s turn.`)
    };

    const printNewRound = () => {
        board.printBoard();
        console.log(`${getActivePlayer().name}'s turn.`);
    };    

    const handleWin = (player) => {
        board.printBoard();
        console.log(`${getActivePlayer().name} wins!`);
        domController.updateDisplay(`${getActivePlayer().name} wins!`);
        gameActive = false;
    }

    const handleDraw = () => {
        board.printBoard();
        console.log(`Draw!`);
        domController.updateDisplay("Draw!");
        gameActive = false;
    }

    const resetGame = () => {
        activePlayer = players[pickRandomPlayer()];
        gameActive = true;
        board.resetBoard();
        domController.resetBoard();
        console.log("Game start!");
        console.log(`${getActivePlayer().name}'s turn.`);
        domController.updateDisplay(`${getActivePlayer().name}'s turn.`)
    }

    const playRound = (row, column) => {
        const validMove = board.placeMarker(row - 1, column - 1, getActivePlayer().marker);
        if (!validMove) {
            console.log("Invalid move: Space occupied");
        } else {
            console.log(`Placing ${getActivePlayer().name}'s marker on space ${row}-${column}...`);
            domController.renderBoard(board.getBoard());
            if (board.checkForWin()) {
                handleWin(getActivePlayer());
                return;
            } else if (board.checkForDraw()){
                handleDraw();
                return;
            }
            switchPlayerTurn();
            printNewRound();
        }
    }

    DOMController.init();

    return {
        playRound,
        getActivePlayer,
        getGameActive,
        resetGame,
    };
}

const game = GameController();