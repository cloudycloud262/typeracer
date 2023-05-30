import React, { useEffect, useState } from "react";
import socket from "../../socket";

import Details from "../../components/details";
import Paragraph from "../../components/paragraph";
import Timer from "./timer";

import styles from "./index.module.css";

export default function Practice() {
  const [index, setIndex] = useState(0);
  const [correct, setCorrect] = useState(-1);
  const [finished, setFinished] = useState(0);
  const [textArr, setTextArr] = useState([]);
  const [incorrect, setIncorrect] = useState(0);
  const [time, setTime] = useState(0); /* in seconds */

  useEffect(() => {
    !textArr.length && socket.emit("generate-paragraph");
  }, [textArr.length]);
  useEffect(() => {
    socket.on("paragraph-generated", (paragraph) => {
      setTextArr(paragraph.split(""));
    });
    return () => {
      socket.removeAllListeners("paragraph-generated");
    };
  }, []);

  const restartHandler = (e) => {
    setIndex(0);
    setCorrect(-1);
    setIncorrect(0);
    setFinished(0);
    setTextArr([]);
    setTime(0);
    e.target.blur();
  };

  return (
    <main className={styles.main}>
      <div className={styles.column}>
        <Details
          finished={finished}
          textLength={textArr.length}
          incorrect={incorrect}
          time={time}
        />
      </div>
      <div className={`${styles.column} card`}>
        {textArr.length ? (
          <Paragraph
            textArr={textArr}
            index={index}
            setIndex={setIndex}
            correct={correct}
            setCorrect={setCorrect}
            finished={finished}
            setFinished={setFinished}
            incorrect={incorrect}
            setIncorrect={setIncorrect}
          />
        ) : null}
        <div className={styles.textBottom}>
          <div
            className={styles.mobileTimer}
            style={{
              backgroundColor: finished
                ? "rgb(84 255 84)"
                : "rgba(0, 0, 0, 0.11)",
            }}
          >
            {Math.floor(time / 60)}:
            {time % 60 < 10 ? `0${time % 60}` : time % 60}
          </div>
          <button className={styles.restartBtn} onClick={restartHandler}>
            Reset
          </button>
        </div>
      </div>
      <div className={styles.column}>
        {textArr.length ? (
          <Timer
            correct={correct + 1}
            total={textArr?.length}
            finished={finished}
            index={index}
            time={time}
            setTime={setTime}
          />
        ) : null}
      </div>
      <label className={styles.vkey} htmlFor="vkey-input">
        <span className="material-icons-outlined">keyboard_alt</span>
      </label>
    </main>
  );
}
