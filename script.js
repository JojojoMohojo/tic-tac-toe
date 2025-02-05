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
        if (board[row][column].getValue() !== 0) return;
        board[row][column].addMarker(player);
    }

    const printBoard = () => {
      const boardWithCellValues = board.map((row) => row.map((cell) => cell.getValue()))
      console.log(boardWithCellValues);
    };

    return { getBoard, placeMarker, printBoard };
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
            marker: "1"
        },
        {
            name: playerTwoName,
            marker: "2"
        }
    ];

    let activePlayer = players[0];

    const getActivePlayer = () => activePlayer;
    const switchPlayerTurn = () => {
        activePlayer = activePlayer === players[0] ? players[1] : players[0];
    }

    const printNewRound = () => {
        board.printBoard();
        console.log(`${getActivePlayer().name}'s turn.`);
    };

    const playRound = (row, column) => {
        console.log(
            `Placing ${getActivePlayer().name}'s marker on space ${row}-${column}...`
        );
        board.placeMarker(row - 1, column - 1, getActivePlayer().marker);

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