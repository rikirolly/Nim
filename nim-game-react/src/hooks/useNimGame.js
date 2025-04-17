import { useState, useEffect } from 'react';

const useNimGame = () => {
    const [piles, setPiles] = useState([3, 5, 7]); // Initial piles of stones
    const [currentPlayer, setCurrentPlayer] = useState('Player'); // Player or AI
    const [gameOver, setGameOver] = useState(false);

    const isGameOver = (piles) => piles.every(pile => pile === 0);

    const aiMove = () => {
        // AI logic to always win
        const totalStones = piles.reduce((acc, pile) => acc + pile, 0);
        let move = 0;

        for (let pile of piles) {
            if (pile > 0) {
                const newTotal = totalStones - pile;
                if ((newTotal % 2) === 0) {
                    move = pile;
                    break;
                }
            }
        }

        if (move === 0) {
            // If no winning move, take one stone from the first non-empty pile
            move = piles.find(pile => pile > 0);
        }

        return move;
    };

    const playerMove = (pileIndex, stones) => {
        if (piles[pileIndex] >= stones) {
            const newPiles = [...piles];
            newPiles[pileIndex] -= stones;
            setPiles(newPiles);
            setCurrentPlayer('AI');
        }
    };

    useEffect(() => {
        if (currentPlayer === 'AI' && !gameOver) {
            const move = aiMove();
            const pileIndex = piles.findIndex(pile => pile >= move);
            const newPiles = [...piles];
            newPiles[pileIndex] -= move;
            setPiles(newPiles);
            setCurrentPlayer('Player');
        }

        if (isGameOver(piles)) {
            setGameOver(true);
        }
    }, [currentPlayer, piles]);

    const resetGame = () => {
        setPiles([3, 5, 7]);
        setCurrentPlayer('Player');
        setGameOver(false);
    };

    return {
        piles,
        currentPlayer,
        gameOver,
        playerMove,
        resetGame,
    };
};

export default useNimGame;