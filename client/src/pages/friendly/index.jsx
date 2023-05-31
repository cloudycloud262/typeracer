import React, { useEffect, useRef, useState } from "react";
import { Link, useParams } from "react-router-dom";
import socket from "../../socket";

import Details from "../../components/details";
import Paragraph from "../../components/paragraph";
import Leaderboard from "../../components/leaderBoard";
import Timer from "../../components/timer";

import styles from "../global/index.module.css";
import pstyles from "./index.module.css";
import PageNotFound from "../pageNotFound.jsx";

export default function Friendly(props) {
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
  //status: 0 = countdown on, 1 = match started, 2=initial, 3= capacity full
  const [status, setStatus] = useState(2);
  const [list, setList] = useState([]);
  const { id: roomUrl } = useParams();

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
    if (countdown === 0 && intervalRef.current) {
      clearInterval(intervalRef.current);
      setStatus((_prev) => 1);
      intervalRef.current = setInterval(() => {
        setTime((prev) => prev + 1);
      }, 1000);
    }
  }, [countdown]);
  useEffect(() => {
    roomUrl
      ? socket.emit("join-friendly", {
          url: roomUrl,
          username: localStorage.getItem("typeracer-username"),
        })
      : socket.emit(
          "create-friendly",
          localStorage.getItem("typeracer-username")
        );
    socket.on("friendly-created", ({ url, paragraph }) => {
      setRoomId(url);
      setTextArr(paragraph.split(""));
    });
    socket.on("joined", ({ id, players, paragraph }) => {
      setRoomId(id);
      setPlayers(
        players.map((p) => ({ id: p[0], username: p[1] || p[0], progress: 0 }))
      );
      setTextArr(paragraph.split(""));
    });
    socket.on("set-progress", (obj) => {
      setPlayers((prev) =>
        prev.map((p) =>
          obj.player === p.id ? { ...p, progress: obj.progress } : p
        )
      );
    });
    socket.on("friendly-start-countdown", () => {
      setCountdown(10);
      intervalRef.current = setInterval(
        () => setCountdown((prev) => prev - 1),
        1000
      );
      setStatus(0);
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
    socket.on("room-capacity-full", () => {
      setStatus(3);
    });
    return () => {
      socket.emit("leave-room");
      socket.removeAllListeners("friendly-created");
      socket.removeAllListeners("join-friendly");
      socket.removeAllListeners("friendly-created");
      socket.removeAllListeners("joined");
      socket.removeAllListeners("set-progress");
      socket.removeAllListeners("friendly-start-countdown");
      socket.removeAllListeners("finished");
      socket.removeAllListeners("player-joined");
      socket.removeAllListeners("player-removed");
      socket.removeAllListeners("room-capacity-full");
      clearInterval(intervalRef.current);
    };
  }, []);
  useEffect(() => {
    !roomUrl &&
      setPlayers([
        {
          id: props.socketId,
          progress: 0,
          username:
            localStorage.getItem("typeracer-username") || props.socketId,
        },
      ]);
  }, [props.socketId]);

  if (status === 3) {
    return <PageNotFound />;
  }
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
      <div className={`${styles.column}`}>
        <div className="card">
          {textArr.length && status === 1 ? (
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
          ) : null}
          {!countdown && status === 1 ? (
            <span className={styles.countdown}>Race Started</span>
          ) : null}
          {status === 2 && !roomUrl ? (
            <button
              className={styles.restartBtn}
              onClick={() => socket.emit("friendly-start-countdown", roomId)}
            >
              Start Race
            </button>
          ) : null}
        </div>
        {status === 2 ? (
          <div className={pstyles.url}>
            Share this url to invite :{" "}
            <Link>
              {location.href}/{roomId}
            </Link>
          </div>
        ) : null}
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
