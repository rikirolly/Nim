import React from 'react';

const Controls = ({ onTakeStones }) => {
    const handleTakeStones = (pileIndex, stones) => {
        onTakeStones(pileIndex, stones);
    };

    return (
        <div>
            <h2>Controls</h2>
            <button onClick={() => handleTakeStones(0, 1)}>Take 1 from Pile 1</button>
            <button onClick={() => handleTakeStones(0, 2)}>Take 2 from Pile 1</button>
            <button onClick={() => handleTakeStones(1, 1)}>Take 1 from Pile 2</button>
            <button onClick={() => handleTakeStones(1, 2)}>Take 2 from Pile 2</button>
            <button onClick={() => handleTakeStones(2, 1)}>Take 1 from Pile 3</button>
            <button onClick={() => handleTakeStones(2, 2)}>Take 2 from Pile 3</button>
        </div>
    );
};

export default Controls;