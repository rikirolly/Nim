import React from 'react';
import NimPiece from './NimPiece';

function NimRow({ rowIndex, piecesCount, selectedCount, aiRemovingIndices = [], onPieceClick }) {
  const pieces = [];
  for (let i = 0; i < piecesCount; i++) {
    const pieceIndex = i;
    // A piece is considered selected if its index is >= (total pieces - selected count)
    const isSelected = pieceIndex >= piecesCount - selectedCount;
    const isAiRemoving = aiRemovingIndices.includes(pieceIndex);

    pieces.push(
      <NimPiece
        key={pieceIndex}
        isSelected={isSelected}
        isAiRemoving={isAiRemoving}
        onClick={() => onPieceClick(rowIndex, pieceIndex)}
      />
    );
  }

  return <div className="nim-row">{pieces}</div>;
}

export default NimRow;
