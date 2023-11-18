const express = require("express");
const { open } = require("sqlite");
const sqlite3 = require("sqlite3");
const path = require("path");
const dbPath = path.join(__dirname, "cricketMatchDetails.db");
const app = express();
app.use(express.json());
let db = null;
const initializeDbAndServer = async () => {
  try {
    db = await open({
      filename: dbPath,
      driver: sqlite3.Database,
    });
    app.listen(3000, () => {
      console.log("server is running at http://localhost:3000/");
    });
  } catch (e) {
    console.log(`DB Error:${e.message}`);
    process.exit(1);
  }
};
initializeDbAndServer();

app.get("/players/", async (request, response) => {
  const getBooksQuery = `SELECT * FROM player_details;`;
  const booksArray = await db.all(getBooksQuery);
  response.send(booksArray);
});

app.get("/players/:playerId/", async (request, response) => {
  const { playerId } = request.params;
  const getABookQuery = `SELECT * FROM player_details WHERE player_id=${playerId};`;
  const book = await db.get(getABookQuery);
  response.send(book);
});

app.post("/players/:playerId/", async (request, response) => {
  const { playerId } = request.params;
  const bookDetails = request.body;
  const { playerName } = bookDetails;
  const addPlayerQuery = `INSERT INTO 
                                player_details(player_name) 
                            VALUES
                                ('${playerName}');`;
  await db.run(addPlayerQuery);
  response.send("Player Details Updated");
});

app.get("/matches/:matchId/", async (request, response) => {
  const { matchId } = request.params;
  const getMatchId = `SELECT * FROM match_details WHERE match_id=${matchId};`;
  const responseOne = await db.get(getMatchId);
  response.send(responseOne);
});

app.get("/players/:playerId/matches/", async (request, response) => {
  const { playerId } = request.params;
  const getPlayerId = `SELECT * FROM match_details;`;
  const responseTwo = await db.all(getPlayerId);
  response.send(responseTwo);
});

app.get("/matches/:matchId/players/", async (request, response) => {
  const { matchId } = request.params;
  const getMatchId = `SELECT 
                            player_details.player_id as playerId,
                            player_details.player_name as playerName  
                        FROM 
                            player_match_score NATURAL JOIN player_details  
                        WHERE 
                            match_id=${matchId};`;
  const responseThree = await db.get(getMatchId);
  response.send(responseThree);
});

app.get("/players/:playerId/playerScores/", async (request, response) => {
  const { playerId } = request.params;
  const getPlayerDetails = `SELECT 
                                    player_details.player_id as playerId,
                                    player_details.player_name as playerName,
                                    SUM(player_match_score.score) as score,
                                    SUM(player_match_score+
                                        -.fours) as fours,
                                    SUM(player_match_score.sixes) as sixes,
                                FROM 
                                    player_details INNER JOIN player_match_score ON
                                    player_details.player_id=player_match_score.player_id
                                WHERE 
                                    player_details.player_id=${playerId};`;
  const result = await db.get(getPlayerDetails);
  response.send(result);
});
