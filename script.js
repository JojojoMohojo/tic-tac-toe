function GameBoard() {
    const rows = 3;
    const columns = 3;
    const board = [];

    for (let i = 0; i < rows; i++) {
        board[i] = [];
        for (let j = 0; j < columns; j++) {
            board[i].push(Cell());
        }
    }

    const getBoard = () => board;

    const placeMarker = (row, column, player) => {
        if (row < 0 || row >= rows || column < 0 || column >= columns) {
            console.error("Invalid move: out-of-bounds indices");
            return;
        }
        if (board[row][column].getValue() !== 0) return;
        board[row][column].addMarker(player);
    }

    const printBoard = () => {
      const boardWithCellValues = board.map(
                                    (row) => row.map(
                                        (cell) => cell.getValue()))
      console.log(boardWithCellValues);
    };

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
        // Check top-left to bottom-right diagonal
        const firstCellMain = board[0][0].getValue();
        if (firstCellMain !== 0 && board.every((row, index) => row[index].getValue() === firstCellMain)) {
            return true;
        }

        // Check top-right to bottom-left diagonal
        const firstCellAnti = board[0][columns - 1].getValue();
        if (firstCellAnti !== 0 && board.every((row, index) => row[columns - 1 - index].getValue() === firstCellAnti)) {
            return true;
        }

        return false;
    };
    
    return { getBoard, placeMarker, printBoard, checkRowWin, checkColumnWin, checkDiagonalWin };
}

function Cell() {
  let value = 0;

  // Accept a player's token to change the value of the cell
  const addMarker = (player) => {
    value = player;
  };

  // How we will retrieve the current value of this cell through closure
  const getValue = () => value;

  return { addMarker, getValue };
}

function GameController(
    playerOneName = "Player One",
    playerTwoName = "Player Two"
) {
    const board = GameBoard();

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

    let activePlayer = players[0];

    const getActivePlayer = () => activePlayer;
    const switchPlayerTurn = () => {
        [players[0], players[1]] = [players[1], players[0]];
        activePlayer = players[0];
    }

    const printNewRound = () => {
        board.printBoard();
        console.log(`${getActivePlayer().name}'s turn.`);
    };
    
    const displayWinScreen = (player) => {
        board.printBoard();
        console.log(`${getActivePlayer().name} wins!`);
    }

    const checkForWin = () => {
        return board.checkRowWin() || board.checkColumnWin() || board.checkDiagonalWin();
    }

    const playRound = (row, column) => {
        board.placeMarker(row - 1, column - 1, getActivePlayer().marker);
        console.log(
            `Placing ${getActivePlayer().name}'s marker on space ${row}-${column}...`
        );
        if (checkForWin()) {
            displayWinScreen(getActivePlayer());
            return;
        }
        switchPlayerTurn();
        printNewRound();
    }

    printNewRound();

    return {
        playRound,
        getActivePlayer
    };
}

function DisplayController () {

}

const game = GameController();