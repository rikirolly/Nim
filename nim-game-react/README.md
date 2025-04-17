# Nim Game in React

This project is a simple implementation of the classic game of Nim, where a player competes against an AI that always wins. The game consists of several piles of stones, and players take turns removing stones from the piles. The player who cannot make a move loses the game.

## Project Structure

- `public/index.html`: The main HTML file that serves the React application.
- `src/components/Game.js`: Manages the game state and logic.
- `src/components/Pile.js`: Represents a single pile of stones.
- `src/components/Controls.js`: Provides buttons for player actions.
- `src/hooks/useNimGame.js`: Custom hook that encapsulates the game logic.
- `src/App.js`: Main application component.
- `src/index.js`: Entry point of the React application.
- `package.json`: Configuration file for npm.

## Getting Started

To run the application locally, follow these steps:

1. Clone the repository:
   ```
   git clone <repository-url>
   ```

2. Navigate to the project directory:
   ```
   cd nim-game-react
   ```

3. Install the dependencies:
   ```
   npm install
   ```

4. Start the development server:
   ```
   npm start
   ```

5. Open your browser and go to `http://localhost:3000` to play the game.

## How to Play

1. You will see several piles of stones.
2. On your turn, select a pile and remove any number of stones from it.
3. The AI will then make its move.
4. The game continues until one player cannot make a move.

## AI Strategy

The AI is designed to always win by using optimal strategies based on the current state of the game. It will analyze the piles and make moves that ensure it remains in a winning position.

## License

This project is open-source and available under the MIT License.