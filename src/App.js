import React, {useState, useEffect} from 'react';
import classnames from 'classnames';

import './App.css';

const App = () => {
  
  const [selectedTeamId, setSelectedTeamId] = useState(null)
  const [selectedTeam, setSelectedTeam] = useState(null)
  const [schedule, setSchedule] = useState(null)

  useEffect(() => {
    fetch("http://localhost:2200/schedule")
      .then((response) => { return response.json() })
      .then((data) => { setSchedule(data.results) })
  },[])

  const selectTeam = function(teamId) {
    setSelectedTeamId(teamId)
  }

  useEffect(() => {
    if ( selectedTeamId !== null ) {
      fetch("http://localhost:2200/team/" + selectedTeamId + "/info")
        .then((response) => { return response.json() })
        .then((data) => { setSelectedTeam(data.results) })
    }
  }, [selectedTeamId])

  return (  
    <div id="app">
      <GameList games={schedule} selectedTeam={selectedTeam} onTeamClick={selectTeam}/>
      <Team team={selectedTeam} />
    </div>
  )
}

const GameList = ({games, selectedTeam, onTeamClick}) => {
  if ( games ) {
    return (
      <table className="games">
        <thead>
          <tr className="header">
            <th className="time">Time</th>
            <th className="team-1">Team 1</th> 
            <th>vs</th>
            <th className="team-2">Team 2</th>
          </tr>
        </thead>
        <tbody>
          { games.map(g => <Game key={g.id} game={g} selectedTeam={selectedTeam} onTeamClick={onTeamClick} /> ) }
        </tbody>
      </table>
    )
  } else {
    return (
      <p>Loading...</p>
    )
  }
}

const Game = ({game, selectedTeam, onTeamClick}) => 
  <tr className={ classnames("game", {"game-over": game.game_over}) }>
    <td className="time">{game.start_time}</td>
    <td 
      className={ 
        classnames("team team-1", 
        {"won": game.team1.id === game.winning_team_id}, 
        {"selected": selectedTeam && game.team1.id === selectedTeam.id}) 
      } 
      onClick={() => onTeamClick(game.team1.id)}>
        {game.team1.name}
    </td> 
    <td>vs</td>
    <td 
      className={ classnames(
        "team team-2", 
        {"won": game.team2.id === game.winning_team_id}, 
        {"selected": selectedTeam && game.team2.id === selectedTeam.id})
      } 
      onClick={() => onTeamClick(game.team2.id)}>
        {game.team2.name}
    </td>
  </tr>

const Team = ({team}) => {
  if ( team ) {
    return (
    <div className="team">
      <h2>{team.name}</h2>
      <h3 className="record">Record: {team.wins}W {team.losses}L</h3>
      <div className="players">
        { team.players.map(p => <div key={p.id} className="player">{`${p.fname} ${p.lname}`}</div>) }
      </div>
    </div>
    )
  } else {
    return null
  }
}

export default App;
