import React, { useEffect, useState, useRef } from "react";
import socket from "../../socket";

import Details from "../../components/details";
import Paragraph from "../../components/paragraph";
import Timer from "../../components/timer";
import Leaderboard from "../../components/leaderBoard";

import styles from "./index.module.css";

export default function Global(props) {
  const [index, setIndex] = useState(0);
  const [correct, setCorrect] = useState(-1);
  const [finished, setFinished] = useState(0);
  const [textArr, setTextArr] = useState([]);
  const [incorrect, setIncorrect] = useState(0);
  const [time, setTime] = useState(0); /* in seconds */
  const [roomId, setRoomId] = useState(0);
  const [countdown, setCountdown] = useState(0);
  const [players, setPlayers] = useState([]);
  const intervalRef = useRef(null);
  const [status, setStatus] = useState(0);
  const [list, setList] = useState([]);

  useEffect(() => {
    if (finished) {
      socket.emit("finished", {
        roomId,
        time: new Date().getTime(),
        username: localStorage.getItem("typeracer-username"),
      });
      clearInterval(intervalRef.current);
      setList((prev) => [
        ...prev,
        {
          id: props.socketId,
          time: new Date().getTime(),
          username:
            localStorage.getItem("typeracer-username") || props.socketId,
        },
      ]);
    } else {
      textArr?.length &&
        socket.emit("set-progress", {
          progress: (100 * correct) / textArr.length,
          roomId,
        });
    }
  }, [correct]);
  useEffect(() => {
    socket.emit("add-global", localStorage.getItem("typeracer-username"));
    socket.on("joined", ({ id, players, paragraph }) => {
      setRoomId(id);
      setPlayers(
        players.map((p) => ({ id: p[0], progress: 0, username: p[1] || p[0] }))
      );
      setTextArr(paragraph.split(""));
      setCountdown(60 - Math.floor((new Date().getTime() - id) / 1000));
      intervalRef.current = setInterval(
        () => setCountdown((prev) => prev - 1),
        1000
      );
    });
    socket.on("set-progress", (obj) => {
      setPlayers((prev) =>
        prev.map((p) =>
          obj.player === p.id ? { ...p, progress: obj.progress } : p
        )
      );
    });
    socket.on("finished", ({ id, time, username }) => {
      setPlayers((prev) =>
        prev.map((p) => (id === p.id ? { ...p, progress: 100 } : p))
      );
      setList((prev) =>
        [...prev, { time, id, username: username || id }].sort(
          (a, b) => a.time - b.time
        )
      );
    });
    socket.on("player-joined", (id) => {
      setPlayers((prev) => [
        ...prev,
        { id: id[0], username: id[1] || id[0], progress: 0 },
      ]);
    });
    socket.on("player-removed", (id) => {
      setPlayers((prev) => prev.filter((x) => x.id !== id));
    });

    return () => {
      socket.emit("leave-room");
      socket.removeAllListeners("joined");
      socket.removeAllListeners("player-joined");
      socket.removeAllListeners("player-removed");
      clearInterval(intervalRef.current);
    };
  }, []);
  useEffect(() => {
    if (countdown === 0 && intervalRef.current) {
      clearInterval(intervalRef.current);
      setStatus((_prev) => 1);
      intervalRef.current = setInterval(() => {
        setTime((prev) => prev + 1);
      }, 1000);
    }
  }, [countdown]);

  return (
    <main className={styles.main}>
      <div className={styles.column}>
        <Leaderboard list={list} socketId={props.socketId} />
        <Details
          finished={finished}
          textLength={textArr.length}
          incorrect={incorrect}
          time={time}
        />
      </div>
      <div className={`${styles.column} card`}>
        {textArr.length && status ? (
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
        {countdown ? (
          <span className={styles.countdown}>
            Race starts in : 00:
            {countdown < 10 ? `0${countdown % 60}` : countdown}
          </span>
        ) : (
          <span className={styles.countdown}>Race Started</span>
        )}
      </div>
      <div className={styles.column}>
        <Timer
          time={time}
          correct={correct + 1}
          total={textArr?.length}
          players={players}
          socketId={props.socketId}
          finished={finished}
        />
      </div>
      <label className={styles.vkey} htmlFor="vkey-input">
        <span className="material-icons-outlined">keyboard_alt</span>
      </label>
    </main>
  );
}
