import React, { Fragment } from "react";

import styles from "./index.module.css";

export default function Leaderboard(props) {
  return (
    <div className={`card ${styles.leaderBoard} `}>
      <header className={styles.lbHeader}>Leaderboard</header>
      {props.list.length ? (
        <div className={styles.table}>
          {props.list.map((d, i) => (
            <Fragment key={i}>
              <div className={styles.sno}>{i + 1}</div>
              {props.socketId === d.id ? (
                <div className={styles.sname}>{d.username}(You)</div>
              ) : (
                <div className={styles.sname}>{d.username}</div>
              )}
            </Fragment>
          ))}
        </div>
      ) : null}
    </div>
  );
}
