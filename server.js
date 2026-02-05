const express = require('express');
const cors = require('cors');
const app = express();

app.use(cors());
app.use(express.json());
app.use(express.static('public'));

const games = {};

// Create/join game
app.post('/api/game/:roomCode', (req, res) => {
    const { roomCode } = req.params;
    const { playerName } = req.body;
    
    if (!games[roomCode]) {
        games[roomCode] = {
            playerX: playerName,
            playerO: null,
            currentPlayer: 'X',
            board: Array(9).fill(''),
            gameActive: true,
            winsX: 0,
            winsO: 0
        };
        return res.json({ symbol: 'X', ...games[roomCode] });
    }
    
    const game = games[roomCode];
    if (game.playerO) {
        return res.status(400).json({ error: 'Room full' });
    }
    
    game.playerO = playerName;
    res.json({ symbol: 'O', ...game });
});

// Get game state
app.get('/api/game/:roomCode', (req, res) => {
    const game = games[req.params.roomCode];
    game ? res.json(game) : res.status(404).json({ error: 'Not found' });
});

// Make move
app.post('/api/game/:roomCode/move', (req, res) => {
    const game = games[req.params.roomCode];
    if (!game) return res.status(404).json({ error: 'Not found' });
    
    const { board, currentPlayer, gameActive, winsX, winsO } = req.body;
    games[req.params.roomCode] = { ...game, board, currentPlayer, gameActive, winsX, winsO };
    res.json(games[req.params.roomCode]);
});

// Reset game
app.post('/api/game/:roomCode/reset', (req, res) => {
    const game = games[req.params.roomCode];
    if (!game) return res.status(404).json({ error: 'Not found' });
    
    game.board = Array(9).fill('');
    game.currentPlayer = 'X';
    game.gameActive = true;
    res.json(game);
});

// Delete game
app.delete('/api/game/:roomCode', (req, res) => {
    delete games[req.params.roomCode];
    res.json({ ok: true });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on http://localhost:${PORT}`);
    console.log(`For GitHub Pages deployment, use deployment URL in tst.html`);
});
