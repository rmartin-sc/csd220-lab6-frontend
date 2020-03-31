import React, {useState, useEffect} from 'react';
import classnames from 'classnames';

import './App.css';

const App = () => {
  
  const [selectedTeamId, setSelectedTeamId] = useState(null)
  const [selectedTeam, setSelectedTeam] = useState(null)
  const [teamList, setTeamList] = useState(null)
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

  useEffect(() => {
    fetch("http://localhost:2200/teams")
      .then((response) => { return response.json() })
      .then((data) => { setTeamList(data.results) })
  }, [])

  function handleGameScheduled(newGame) {
    setSchedule(schedule.concat([newGame]))
  }

  return (  
    <div id="app">
      <GameList 
        games={schedule} 
        teams={teamList} 
        selectedTeam={selectedTeam} 
        onTeamClick={selectTeam}
        onGameScheduled={handleGameScheduled}/>
      <Team team={selectedTeam} />
    </div>
  )
}

const GameList = ({games, teams, selectedTeam, onTeamClick, onGameScheduled}) => {
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
        <tfoot>
          <NewGameInput teams={teams} onGameScheduled={onGameScheduled}/>
        </tfoot>
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

const NewGameInput = ({teams, onGameScheduled}) => {

  const [isSchedulable, setIsSchedulable] = useState(false)
  const [disabledTeam2, setDisabledTeam2] = useState("")
  const [team1Option, setTeam1Option] = useState(null)
  const [team2Option, setTeam2Option] = useState(null)
  const [date, setDate] = useState("")
  const [time, setTime] = useState("")

  function handleTeam1Change(e) {
    setDisabledTeam2(e.target.value)
    setTeam1Option(e.target.options[e.target.selectedIndex])
  }

  useEffect(() => {
    if ( team1Option && team2Option && date && time ) {
      setIsSchedulable(true)
    } else {
      setIsSchedulable(false)
    }
  }, [team1Option, team2Option, date, time])

  function scheduleGame() {
    const newGameData = { 
      start_time: date + " " + time, 
      game_over: false,
      winning_team_id: null,
      team1: {
        id: parseInt(team1Option.value),
        name: team1Option.text,
      },
      team2: {
        id: parseInt(team2Option.value),
        name: team2Option.text,
      }
    }
    fetch("http://localhost:2200/game", { 
        method: "POST", 
        body: JSON.stringify(newGameData)
      })
      .then((response) => response.json())
      .then((data) => {
        newGameData.id = data.results.id
        onGameScheduled(newGameData)
      })
  }

  if ( teams ) {
    return (
      <tr>
        <td>
          <input 
            type="date" 
            onChange={(e) => setDate(e.target.value)} />
          <input 
            type="time"
            onChange={(e) => setTime(e.target.value)} />
        </td>
        <td>
          <TeamList 
            teams={teams}
            selectedValue={team1Option ? team1Option.value : ""}
            onChange={handleTeam1Change} /></td>
        <td>vs</td>
        <td>
          <TeamList 
            teams={teams} 
            selectedValue={team2Option ? team2Option.value : ""}
            onChange={(e) => { setTeam2Option(e.target.options[e.target.selectedIndex]) }} 
            disabledOption={disabledTeam2} />
        </td>
        <td><button disabled={!isSchedulable} onClick={scheduleGame}>Schedule Game</button></td>
      </tr>
    )
  } else {
    return null
  }
}

const TeamList = ({teams, selectedValue, onChange, disabledOption}) => {

  return (
    <select onChange={onChange} value={selectedValue === disabledOption ? "" : selectedValue}>
      <option></option>
      { teams.map( t => <option key={t.id} value={t.id} disabled={disabledOption === ""+t.id}>{t.name}</option> ) }
    </select>
  )
}

export default App;
