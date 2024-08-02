# Escape Room for AI Agents

This project provides a platform for creating AI agent-based escape room experiences. It addresses the challenge of prompt engineering in LLM games by securing puzzle contexts and solutions behind API endpoints. This ensures that users cannot bypass puzzles through prompt engineering, as the AI agents do not have direct access to the solutions.

## Requirements

- **Node.js**: The backend is built with Node.js, so you'll need it installed on your system to run the server.
- **Local Redis**: This project uses Redis for data storage, requiring a local Redis server running.

## Limitations

- **Account System**: The project uses a simple account system based on agent names and secret keys. There is no functionality for password recovery or account management beyond creation and login.
- **Data Length Restrictions**: There are restrictions on the length of data that can be stored for puzzles, hints, and solutions. These are primarily limited by the UI and database schema design.
- **Guess Checking Logic**: The logic for checking puzzle guesses is very basic, relying on simple string and number matching. Some attempts are made to fit guesses - everything is made lowercase, punctuation is removed, and spaces are removed, all before string comparison is done, but this will not be suitable for more complex puzzles requiring nuanced or varied answers.

## API Endpoints

Upon creating an agent and puzzles, the system automatically generates API endpoints for each puzzle associated with that agent. These endpoints can be used to integrate puzzles into AI agents as tools or actions.

### Generated Endpoints

- **Get Puzzle**: `GET /:agentName/:puzzleId`
  - Retrieves the puzzle specified by the agent name and puzzle ID.
  - Puzzle IDs are 1-based indexed, e.g. the first puzzle you make is puzzle ID 1.
- **Check Solution**: `POST /checkSolution`
  - Checks if the provided guess for a puzzle is correct.

### Example Requests

**Get Puzzle**
```json
GET /bob/1
Content-Type: application/json
{
    "success": true,
    "puzzle": {
        "number": 1,
        "description": "The first room",
        "hints": [
            "The first letter of the primary colors used by a computer screen"
        ]
    },
    "message": "Puzzle retrieved successfully."
}

**Check Solution**
```json
POST /checkSolution
Content-Type: application/json

{
  "agentName": "bob",
  "puzzleId": "1",
  "guess": "RGB"
}

reply

{
    "success": true,
    "message": "Correct solution."
}
```

## Getting Started

1. **Install Node.js**: Ensure Node.js is installed on your system.
2. **Clone the Repository**: Clone this project to your local machine.
3. **Install Dependencies**: Navigate to the project directory and run `npm install` to install required dependencies.
4. **Start Redis Server**: Ensure your local Redis server is running.
5. **Configure Environment Variables**: Copy `.env.example` to `.env` and configure your environment variables, including the Redis connection and any other necessary settings. *IMPORTANT* change the salt from the default.
6. **Start the Server**: Run `npm start` to start the server. The application will be available at `http://localhost:3000` by default.

## Contributing

This project is an experimental solution to a specific problem in LLM games. Contributions, suggestions, and feedback are welcome to improve the project and address its limitations.

## Hosted
A version of this service is hosted at https://www.generativestorytelling.com/escaperoom/

## Misc
This is the second project in a set of projects experimenting with how LLMs can aid with storytelling. If you enjoy this sort of thing check out [Arcadia](https://github.com/devlinb/arcadia).