import React from "react";
import { useNavigate } from "react-router-dom";
import socket from "../../socket";

import styles from "./index.module.css";

export default function Home() {
  const navigate = useNavigate();
  const [username, setUsername] = React.useState(
    localStorage.getItem("typeracer-username") || ""
  );
  const [_bool, setBool] = React.useState(0); //Only to force rerender on saving username

  return (
    <main className={styles.main}>
      <div className={`${styles.card} ${styles.username}`}>
        <input
          type="text"
          placeholder="Enter Username"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          maxLength={40}
        />
        <button
          className={`${
            username === localStorage.getItem("typeracer-username")
              ? "disabled-btn"
              : ""
          }`}
          onClick={() => {
            if (username !== localStorage.getItem("typeracer-username")) {
              localStorage.setItem("typeracer-username", username);
              setBool((prev) => !prev);
              socket.emit("add-player", username);
            }
          }}
        >
          Save
        </button>
      </div>
      <div className={`${styles.card} ${styles.race}`}>
        <div>
          <h3>Play Globally</h3>
          <p>
            Improve your typing speed by racing against people around the world.
          </p>
        </div>
        <button onClick={() => navigate("/global")}>Start Matchmaking</button>
      </div>
      <div className={`${styles.card} ${styles.race}`}>
        <div>
          <h3>Typing Test</h3>
          <p>Improve your typing skills</p>
        </div>
        <button onClick={() => navigate("/practice")}>Practice Yourself</button>
      </div>
      <div className={`${styles.card} ${styles.race}`}>
        <div>
          <h3>Race your friends</h3>
          <p>Create your own racetrack and play with friends</p>
        </div>
        <button onClick={() => navigate("/friendly")}>Create Racetrack</button>
      </div>
    </main>
  );
}
