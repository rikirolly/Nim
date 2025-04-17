import React from 'react';

function NimPiece({ isSelected, isAiRemoving, onClick }) {
  let className = 'nim-piece';
  if (isSelected) {
    className += ' selected';
  }
  if (isAiRemoving) {
    className += ' ai-removing';
  }

  return <div className={className} onClick={onClick}></div>;
}

export default NimPiece;
