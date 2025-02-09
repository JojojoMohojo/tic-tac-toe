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
    
    return { getBoard, placeMarker, checkForWin, checkForDraw, checkRowWin, checkColumnWin, checkDiagonalWin, resetBoard };
})();

function Cell() {
  let value = 0;

  const addMarker = (player) => {
    value = player;
  };

  const getValue = () => value;

  return { addMarker, getValue };
}


function GameController() {
    const board = GameBoard;
    const domController = DOMController;

    const players = [
        {
            name: "",
            marker: 1
        },
        {
            name: "",
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

    const updatePlayerNames = (playerOne, playerTwo) => {
        players[0].name = playerOne;
        players[1].name = playerTwo;
    }
    
    const switchPlayerTurn = () => {
        activePlayer = activePlayer === players[0] ? players[1] : players[0];
        domController.updateActivePlayer();
        domController.updateDisplay(`${getActivePlayer().name}'s turn.`)
    };  

    const handleWin = () => {
        domController.updateDisplay(`${getActivePlayer().name} wins!`);
        gameActive = false;
        domController.updateButtonState();
    }

    const handleDraw = () => {
        domController.updateDisplay("Draw!");
        gameActive = false;
        domController.updateButtonState();
    }

    const resetGame = () => {
        board.resetBoard();
        domController.resetBoard();
        const { valid, playerOneName, playerTwoName } = domController.getPlayers();
        if (valid) {
            updatePlayerNames(playerOneName, playerTwoName);
            domController.showPlayers();
        } else {
            domController.updateDisplay("Please enter player names.");
            return;
        }
        gameActive = true;
        activePlayer = players[pickRandomPlayer()];
        domController.updateActivePlayer();
        domController.updateDisplay(`${getActivePlayer().name}'s turn.`);
        domController.updateButtonState();
    };

    const playRound = (row, column) => {
        const validMove = board.placeMarker(row - 1, column - 1, getActivePlayer().marker);
        if (validMove) {
            domController.renderBoard(board.getBoard());
            if (board.checkForWin()) {
                handleWin();
                return;
            } else if (board.checkForDraw()){
                handleDraw();
                return;
            }
            switchPlayerTurn();
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


const DOMController = (() => {
    const spaces = document.querySelectorAll(".board-space");
    const newGame = document.querySelector(".new-game-button");
    const display = document.querySelector(".text-display");
    const playerOneInput = document.querySelector(".p1-input");
    const playerTwoInput = document.querySelector(".p2-input");
    const playerOneName = document.querySelector(".p1-name");
    const playerTwoName = document.querySelector(".p2-name");
    const playerOneTitle = document.querySelector(".p1");
    const playerTwoTitle = document.querySelector(".p2");

    const fetchSVG = (path) => {
        return fetch(path)
            .then(response => response.text())
            .then(svg => svg)
            .catch(error => {
                console.error("Error loading SVG:", error);
                return '';
            });
    };
      
    const renderBoard = (board) => {
        for (let i = 0; i < 3; i++) {
            for (let j = 0; j < 3; j++) {
                const index = i * 3 + j;
                if (board[i][j].getValue() === 1) {
                    fetchSVG("icons/close.svg").then(svg => spaces[index].innerHTML = svg);
                } else if (board[i][j].getValue() === 2) {
                    fetchSVG("icons/circle.svg").then(svg => spaces[index].innerHTML = svg);
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

    const updateButtonState = () => {
        newGame.disabled = game.getGameActive();
    }

    const getPlayers = () => {
        const playerOneName = playerOneInput.value.trim();
        const playerTwoName = playerTwoInput.value.trim();
        const valid = playerOneName !== "" && playerTwoName !== "";
        return { valid, playerOneName, playerTwoName };
    };

    const showPlayers = () => {
        playerOneName.innerHTML = playerOneInput.value;
        playerTwoName.innerHTML = playerTwoInput.value;
        playerOneInput.style.display = "none";
        playerTwoInput.style.display = "none";
        playerOneName.style.display = "block";
        playerTwoName.style.display = "block";
    };

    const updateActivePlayer = () => {
        if (game.getActivePlayer().name === playerOneName.innerHTML) {
            playerOneTitle.classList.add("active-player");
            playerTwoTitle.classList.remove("active-player");
        } else {
            playerTwoTitle.classList.add("active-player");
            playerOneTitle.classList.remove("active-player");
        }
    }
    
    const init = () => {
        spaces.forEach(space => space.addEventListener("click", handleSpaceClick));
        newGame.addEventListener("click", () => game.resetGame());
        playerOneName.style.display = "none";
        playerTwoName.style.display = "none";
    };

    return { 
        renderBoard, 
        resetBoard, 
        updateDisplay, 
        updateButtonState, 
        getPlayers, 
        showPlayers, 
        updateActivePlayer, 
        init };
})();

const game = GameController();