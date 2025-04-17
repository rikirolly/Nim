import React from 'react';

const Pile = ({ stones, onRemove }) => {
    return (
        <div>
            <h3>Pile: {stones}</h3>
            <button onClick={() => onRemove(1)} disabled={stones <= 0}>Remove 1</button>
            <button onClick={() => onRemove(2)} disabled={stones <= 1}>Remove 2</button>
            <button onClick={() => onRemove(3)} disabled={stones <= 2}>Remove 3</button>
        </div>
    );
};

export default Pile;