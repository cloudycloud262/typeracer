import React from "react";
import { useNavigate } from "react-router-dom";

import styles from "./index.module.css";

export default function Home() {
  const navigate = useNavigate();

  return (
    <main className={styles.main}>
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
