import React, { useState, useEffect } from 'react';
import NimRow from './NimRow';

const INITIAL_PILES = [9, 7, 5, 3]; // Configurazione iniziale delle pile aggiornata
const PLAYER_HUMAN = 'human';
const PLAYER_AI = 'ai';
const AI_DELAY = 1500; // Ritardo per la mossa dell'AI in ms

// Funzione helper per calcolare il Nim-sum
const calculateNimSum = (piles) => piles.reduce((xorSum, count) => xorSum ^ count, 0);

// Funzione helper per calcolare le mosse vincenti suggerite (per Debug)
const calculateWinningMoves = (piles) => {
  const winningMoves = [];
  const currentNimSum = calculateNimSum(piles);

  if (currentNimSum === 0) {
    // Se il Nim-sum è già 0, qualsiasi mossa porta a un Nim-sum non zero.
    // L'AI farà una mossa standard (es. rimuovere 1 dalla pila più grande).
    // Non ci sono mosse "vincenti" immediate in termini di Nim-sum.
    return [];
  }

  for (let i = 0; i < piles.length; i++) {
    if (piles[i] === 0) continue;

    const targetSize = piles[i] ^ currentNimSum;
    if (targetSize < piles[i]) {
      const removeCount = piles[i] - targetSize;

      // Simula lo stato dopo la mossa per controllare l'eccezione Misère
      const tempPiles = [...piles];
      tempPiles[i] = targetSize;
      const pilesGreaterThanOneAfter = tempPiles.filter(count => count > 1).length;
      const allPilesAreOneOrZeroAfter = pilesGreaterThanOneAfter === 0;

      let isLosingMisereMove = false;
      if (allPilesAreOneOrZeroAfter) {
          // Se dopo la mossa rimangono solo pile da 1 (o 0)
          const onesCountAfter = tempPiles.filter(count => count === 1).length;
          if (onesCountAfter % 2 === 0) {
              // Se il numero di pile da 1 è pari, questa mossa perde in Misère
              isLosingMisereMove = true;
          }
      }

      // Aggiungi la mossa solo se NON è una mossa perdente specifica di Misère
      if (!isLosingMisereMove) {
          winningMoves.push({ rowIndex: i, removeCount: removeCount });
      }
    }
  }

   // Se tutte le mosse che portano a Nim-sum 0 sono perdenti in Misère,
   // allora non ci sono mosse "vincenti" da suggerire secondo la strategia standard+Misère.
   // Tuttavia, per il debug, potremmo voler mostrare *tutte* le mosse che portano a Nim-sum 0,
   // anche quelle perdenti in Misère, per capire la logica dell'AI.
   // Decidiamo di mostrare tutte le mosse che portano a Nim-sum 0.
   // Ricalcoliamo senza il check Misère per il solo scopo di visualizzazione debug.
   const debugWinningMoves = [];
    for (let i = 0; i < piles.length; i++) {
        if (piles[i] === 0) continue;
        const targetSize = piles[i] ^ currentNimSum;
        if (targetSize < piles[i]) {
            const removeCount = piles[i] - targetSize;
            debugWinningMoves.push({ rowIndex: i, removeCount: removeCount });
        }
    }


  // Restituisce le mosse calcolate per il debug (senza filtro Misère complesso,
  // dato che l'AI lo gestirà internamente). Mostra le mosse che portano a Nim-Sum 0.
  return debugWinningMoves;
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

  // Funzione per confermare la mossa dell'utente
  const handleTakeTurn = () => {
    if (selectedRow === null || selectedCount === 0 || gameOver) return;

    const newPiles = [...piles];
    newPiles[selectedRow] -= selectedCount;
    setPiles(newPiles);
    setSelectedRow(null);
    setSelectedCount(0);

    // Misère Play: Chi svuota le pile perde
    if (checkGameOver(newPiles)) {
        setGameOver(true);
        setWinner(PLAYER_AI); // L'AI vince perché l'umano ha preso l'ultimo pezzo
    } else {
        setCurrentPlayer(PLAYER_AI);
    }
  };

  // Funzione per la mossa dell'AI con strategia Nim-sum (Misère)
  const performAiMove = () => {
    setAiRemoving({}); // Resetta evidenziazione

    const currentNimSum = calculateNimSum(piles);
    let bestMove = null; // { rowIndex: number, removeCount: number }

    // Controlla se il gioco è in una fase finale Misère
    const pilesGreaterThanOne = piles.filter(count => count > 1).length;
    const isMisereEndgame = pilesGreaterThanOne <= 1;

    if (currentNimSum !== 0) {
      // Posizione vincente (generalmente): trova una mossa per portare Nim-sum a 0
      for (let i = 0; i < piles.length; i++) {
        if (piles[i] === 0) continue;
        const targetSize = piles[i] ^ currentNimSum;
        if (targetSize < piles[i]) {
          const removeCount = piles[i] - targetSize;
          // Controlla l'eccezione Misère
          const isLosingMisereMove = isMisereEndgame && piles.every(count => count <= 1 || count === piles[i]) && piles.filter((count, idx) => (idx === i ? targetSize : count) === 1).length % 2 === 0;

          if (!isLosingMisereMove) {
            bestMove = { rowIndex: i, removeCount: removeCount };
            break; // Trovata la mossa vincente standard (o valida per Misère)
          } else {
            // La mossa standard perde in Misère. Dobbiamo fare una mossa diversa.
            // Prova a rimuovere 1 pezzo in meno o in più se possibile,
            // altrimenti questa è l'unica mossa possibile (anche se perdente).
            if (removeCount > 1) {
                 bestMove = { rowIndex: i, removeCount: removeCount - 1 };
                 // Non fare break, potremmo trovare una mossa migliore da un'altra pila
            } else if (piles[i] > removeCount) { // Possiamo rimuovere di più?
                 bestMove = { rowIndex: i, removeCount: removeCount + 1 };
                 // Non fare break
            } else {
                 // Siamo costretti a fare la mossa "perdente" standard
                 bestMove = { rowIndex: i, removeCount: removeCount };
                 // Non fare break, magari un'altra pila offre alternative
            }
             // Se abbiamo trovato una mossa alternativa, continuiamo a cercare
             // nel caso un'altra pila offra la mossa standard non problematica.
             // Se non ne troviamo altre, useremo questa alternativa.
             // Se troviamo la mossa standard non problematica da un'altra pila,
             // sovrascriverà questa mossa alternativa.
          }
        }
      }
       // Se dopo il ciclo non abbiamo trovato una mossa standard valida e
       // abbiamo solo mosse alternative o la mossa standard "perdente", usiamo quella trovata.
       // Se non abbiamo trovato NESSUNA mossa che porti a Nim-sum 0 (non dovrebbe accadere se Nim-sum != 0),
       // allora bestMove sarà ancora null qui.
       if (!bestMove) {
           // Fallback se la logica sopra fallisce o siamo costretti alla mossa perdente
           // e non abbiamo trovato alternative. Scegli la prima mossa valida trovata
           // che portava a Nim-sum 0, anche se era "perdente" in Misère.
            for (let i = 0; i < piles.length; i++) {
                if (piles[i] === 0) continue;
                const targetSize = piles[i] ^ currentNimSum;
                if (targetSize < piles[i]) {
                    bestMove = { rowIndex: i, removeCount: piles[i] - targetSize };
                    break;
                }
            }
       }

    }

    if (bestMove === null) {
      // Posizione perdente (Nim-sum è 0) o fallback:
      // Fai una mossa semplice, rimuovi 1 pezzo dalla pila più grande.
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
         // Non dovrebbe accadere se il gioco non è finito, ma per sicurezza...
         console.error("AI non può muovere!");
         return; // Nessuna mossa possibile
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

      // Misère Play: Chi svuota le pile perde
      if (checkGameOver(newPiles)) {
        setGameOver(true);
        setWinner(PLAYER_HUMAN); // L'umano vince perché l'AI ha preso l'ultimo pezzo
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

  // Determina lo stato del gioco da visualizzare
  let status;
  if (gameOver) {
    // Il messaggio di vittoria ora riflette la regola Misère
    status = winner === PLAYER_HUMAN ? 'Hai vinto! (L\'AI ha preso l\'ultimo pezzo)' : 'L\'AI ha vinto! (Hai preso l\'ultimo pezzo)';
  } else {
    status = currentPlayer === PLAYER_HUMAN ? 'Il tuo turno' : 'Turno dell\'AI...';
  }

  // Calcola il Nim-sum corrente per la visualizzazione debug
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
      </div>
    </div>
  );
}

export default Game;