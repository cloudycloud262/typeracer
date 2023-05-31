import React from "react";

import styles from "./index.module.css";

export default function Timer(props) {
  return (
    <div className={`${styles.timer} card`}>
      <div
        className={styles.time}
        style={{
          backgroundColor: props.finished
            ? "rgb(84 255 84)"
            : "rgba(0, 0, 0, 0.11)",
        }}
      >
        {Math.floor(props.time / 60)}:
        {props.time % 60 < 10 ? `0${props.time % 60}` : props.time % 60}
      </div>
      <div className={styles.players}>
        {props.players.map((p, i) => (
          <div className={styles.player} key={i}>
            {props.socketId === p.id ? (
              <>
                <span>{p.username}(You)</span>
                <div
                  className={styles.progressBar}
                  style={{
                    border: `2px solid ${
                      props.finished ? "rgb(84 255 84)" : "black"
                    }`,
                  }}
                >
                  <div
                    className={styles.track}
                    style={{
                      width: `${(100 * props.correct) / props.total}%`,
                      backgroundColor: props.finished
                        ? "rgb(84 255 84)"
                        : "black",
                    }}
                  ></div>
                </div>
              </>
            ) : (
              <>
                <span>{p.username}</span>
                <div
                  className={styles.progressBar}
                  style={{
                    border: `2px solid ${
                      p.progress === 100 ? "rgb(84 255 84)" : "black"
                    }`,
                  }}
                >
                  <div
                    className={styles.track}
                    style={{
                      width: `${p.progress}%`,
                      backgroundColor:
                        p.progress === 100 ? "rgb(84 255 84)" : "black",
                    }}
                  ></div>
                </div>
              </>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
