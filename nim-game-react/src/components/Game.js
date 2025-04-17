import React, { useState, useEffect } from 'react';
import NimRow from './NimRow';

const INITIAL_PILES = [9, 7, 5, 3]; // Configurazione iniziale delle pile aggiornata
const PLAYER_HUMAN = 'human';
const PLAYER_AI = 'ai';
const AI_DELAY = 1500; // Ritardo per la mossa dell'AI in ms

// Funzione helper per calcolare il Nim-sum
const calculateNimSum = (piles) => piles.reduce((xorSum, count) => xorSum ^ count, 0);

// Funzione helper per calcolare le mosse vincenti suggerite (per Debug - Standard Nim)
const calculateWinningMoves = (piles) => {
  const winningMoves = [];
  const currentNimSum = calculateNimSum(piles);

  if (currentNimSum === 0) {
    // Se il Nim-sum è già 0, qualsiasi mossa porta a un Nim-sum non zero (N-position).
    return [];
  }

  // Trova tutte le mosse che portano a Nim-sum 0 (P-position)
  for (let i = 0; i < piles.length; i++) {
    if (piles[i] === 0) continue;
    const targetSize = piles[i] ^ currentNimSum;
    if (targetSize < piles[i]) {
      const removeCount = piles[i] - targetSize;
      winningMoves.push({ rowIndex: i, removeCount: removeCount });
    }
  }
  return winningMoves;
};


function Game() {
  const [piles, setPiles] = useState(INITIAL_PILES);
  const [currentPlayer, setCurrentPlayer] = useState(PLAYER_HUMAN);
  const [selectedRow, setSelectedRow] = useState(null);
  const [selectedCount, setSelectedCount] = useState(0);
  const [aiRemoving, setAiRemoving] = useState({}); // { rowIndex: [pieceIndex1, pieceIndex2...] }
  const [gameOver, setGameOver] = useState(false);
  const [winner, setWinner] = useState(null);
  const [isDebugMode, setIsDebugMode] = useState(false); // Stato per la modalità debug

  // Funzione per gestire il click su un pezzo
  const handlePieceClick = (rowIndex, pieceIndex) => {
    if (currentPlayer !== PLAYER_HUMAN || gameOver) return;

    const currentPileCount = piles[rowIndex];
    // Se si clicca su una riga diversa o si deseleziona cliccando sul primo pezzo non selezionato
    if (selectedRow !== null && selectedRow !== rowIndex) {
        // Non permettere selezione da righe multiple
        console.log("Seleziona pezzi solo da una riga alla volta.");
        return;
    }

    // Calcola quanti pezzi sono stati selezionati cliccando su questo indice
    const count = currentPileCount - pieceIndex;

    if (selectedRow === rowIndex && count === selectedCount) {
        // Deseleziona tutto se si clicca sullo stesso pezzo che definisce la selezione corrente
        setSelectedRow(null);
        setSelectedCount(0);
    } else {
        // Seleziona i pezzi
        setSelectedRow(rowIndex);
        setSelectedCount(count);
    }
  };

  // Funzione per confermare la mossa dell'utente (Standard Nim)
  const handleTakeTurn = () => {
    if (selectedRow === null || selectedCount === 0 || gameOver) return;

    const newPiles = [...piles];
    newPiles[selectedRow] -= selectedCount;
    setPiles(newPiles);
    setSelectedRow(null);
    setSelectedCount(0);

    // Standard Play: Chi prende l'ultimo pezzo vince
    if (checkGameOver(newPiles)) {
        setGameOver(true);
        setWinner(PLAYER_HUMAN); // L'umano vince perché ha preso l'ultimo pezzo
    } else {
        setCurrentPlayer(PLAYER_AI);
    }
  };

  // Funzione per la mossa dell'AI con strategia Nim-sum (Standard Nim)
  const performAiMove = () => {
    setAiRemoving({}); // Resetta evidenziazione

    const currentNimSum = calculateNimSum(piles);
    let bestMove = null; // { rowIndex: number, removeCount: number }

    if (currentNimSum !== 0) {
      // Posizione vincente (N-position): trova una mossa per portare Nim-sum a 0 (P-position)
      for (let i = 0; i < piles.length; i++) {
        if (piles[i] === 0) continue;
        const targetSize = piles[i] ^ currentNimSum;
        if (targetSize < piles[i]) {
          const removeCount = piles[i] - targetSize;
          bestMove = { rowIndex: i, removeCount: removeCount };
          break; // Trovata la mossa ottimale
        }
      }
    }

    if (bestMove === null) {
      // Posizione perdente (P-position, Nim-sum è 0) o fallback:
      // Fai una mossa qualsiasi, di solito rimuovere 1 pezzo dalla pila più grande.
      let largestPileIndex = -1;
      let maxPieces = 0;
      for (let i = 0; i < piles.length; i++) {
        if (piles[i] > maxPieces) {
          maxPieces = piles[i];
          largestPileIndex = i;
        }
      }
      if (largestPileIndex !== -1) {
        bestMove = { rowIndex: largestPileIndex, removeCount: 1 };
      } else {
         console.error("AI non può muovere!");
         return;
      }
    }

    // Esegui la mossa scelta
    const { rowIndex: aiRowIndex, removeCount: aiRemoveCount } = bestMove;
    const newPiles = [...piles];
    newPiles[aiRowIndex] -= aiRemoveCount;

    // Evidenzia i pezzi
    const removingIndices = [];
    const startPieceIndex = piles[aiRowIndex] - aiRemoveCount;
    for (let i = 0; i < aiRemoveCount; i++) {
      removingIndices.push(startPieceIndex + i);
    }
    setAiRemoving({ [aiRowIndex]: removingIndices });

    // Applica la mossa dopo un ritardo
    setTimeout(() => {
      setPiles(newPiles);
      setAiRemoving({}); // Rimuovi evidenziazione

      // Standard Play: Chi prende l'ultimo pezzo vince
      if (checkGameOver(newPiles)) {
        setGameOver(true);
        setWinner(PLAYER_AI); // L'AI vince perché ha preso l'ultimo pezzo
      } else {
        setCurrentPlayer(PLAYER_HUMAN);
      }
    }, AI_DELAY);
  };

  // Controlla se il gioco è finito
  const checkGameOver = (currentPiles) => {
    return currentPiles.every(count => count === 0);
  };

  // Effetto per triggerare la mossa dell'AI quando è il suo turno
  useEffect(() => {
    if (currentPlayer === PLAYER_AI && !gameOver) {
      // Aggiungi un ritardo per far vedere la mossa dell'AI
      const timer = setTimeout(performAiMove, AI_DELAY / 2); // Inizia la logica un po' prima
      return () => clearTimeout(timer);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentPlayer, gameOver, piles]); // Aggiunto piles per rieseguire se le pile cambiano esternamente

  // Funzione per attivare/disattivare la modalità debug
  const toggleDebugMode = () => {
    setIsDebugMode(prevMode => !prevMode);
  };

  // Funzione per ricominciare il gioco
  const restartGame = () => {
    setPiles(INITIAL_PILES);
    setCurrentPlayer(PLAYER_HUMAN);
    setSelectedRow(null);
    setSelectedCount(0);
    setAiRemoving({});
    setGameOver(false);
    setWinner(null);
    // Opzionale: potresti voler disattivare il debug al riavvio
    // setIsDebugMode(false);
  };

  // Determina lo stato del gioco da visualizzare (Standard Nim)
  let status;
  if (gameOver) {
    status = winner === PLAYER_HUMAN ? 'Hai vinto!' : 'L\'AI ha vinto!';
  } else {
    status = currentPlayer === PLAYER_HUMAN ? 'Il tuo turno' : 'Turno dell\'AI...';
  }

  // Calcola Nim-sum e mosse suggerite per il debug
  const currentNimSum = calculateNimSum(piles);
  const suggestedMoves = isDebugMode ? calculateWinningMoves(piles) : [];

  return (
    <div className="game-container">
      <div className="game-status">{status}</div>

      {/* Visualizzazione Debug */}
      {isDebugMode && (
        <div className="debug-info">
          <div>Nim-Sum (XOR): {currentNimSum} ({currentNimSum.toString(2)})</div>
          <div>Mosse suggerite (per Nim-Sum = 0):</div>
          {suggestedMoves.length > 0 ? (
            <ul>
              {suggestedMoves.map((move, index) => (
                <li key={index}>
                  Rimuovi {move.removeCount} da Pila {move.rowIndex + 1} (indice {move.rowIndex})
                </li>
              ))}
            </ul>
          ) : (
            <div>{currentNimSum === 0 ? "Nessuna mossa porta a Nim-Sum 0 (sei in P-position)." : "Errore nel calcolo mosse?"}</div>
          )}
        </div>
      )}

      <div className="nim-rows">
        {piles.map((count, index) => (
          <NimRow
            key={index}
            rowIndex={index}
            piecesCount={count}
            selectedCount={selectedRow === index ? selectedCount : 0}
            aiRemovingIndices={aiRemoving[index] || []}
            onPieceClick={handlePieceClick}
          />
        ))}
      </div>

      {/* Pulsanti Azione */}
      <div className="action-buttons">
        {currentPlayer === PLAYER_HUMAN && !gameOver && (
          <button onClick={handleTakeTurn} disabled={selectedCount === 0}>
            Conferma Mossa
          </button>
        )}
        {/* Pulsante Debug */}
        <button onClick={toggleDebugMode} className="debug-button">
          {isDebugMode ? 'Nascondi Debug' : 'Mostra Debug'}
        </button>
        {/* Pulsante Ricomincia */}
        <button onClick={restartGame} className="restart-button">
          Ricomincia
        </button>
      </div>
    </div>
  );
}

export default Game;