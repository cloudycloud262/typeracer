import React, { useEffect, useRef } from "react";

import styles from "./index.module.css";

export default function Timer(props) {
  const circleRef = useRef(null);
  const intervalRef = useRef(null);

  useEffect(() => {
    circleRef.current.style.setProperty(
      "--dash-array",
      circleRef.current.getTotalLength()
    );
    circleRef.current.style.setProperty(
      "--dash-offset",
      circleRef.current.getTotalLength()
    );
    return () => {
      clearInterval(intervalRef.current);
    };
  }, []);
  useEffect(() => {
    circleRef.current.getTotalLength() &&
      circleRef.current.style.setProperty(
        "--dash-offset",
        circleRef.current.getTotalLength() -
          circleRef.current.getTotalLength() * (props.correct / props.total)
      );
    if (props.correct === props.total) clearInterval(intervalRef.current);
    if (!intervalRef.current && props.correct)
      intervalRef.current = setInterval(
        () => props.setTime((prev) => prev + 1),
        1000
      );
  }, [props.correct]);

  return (
    <div className={`${styles.timer} card`}>
      <div
        className={styles.time}
        style={{
          color: props.finished
            ? "rgb(84 255 84)"
            : props.correct === props.index
            ? "black"
            : "#ff8b8b",
        }}
      >
        {Math.floor(props.time / 60)}:
        {props.time % 60 < 10 ? `0${props.time % 60}` : props.time % 60}
      </div>
      <svg className={styles.svg} height="90%" width="90%">
        <circle
          cx="50%"
          cy="50%"
          r="45%"
          fill="transparent"
          strokeWidth={9}
          strokeLinecap="round"
          className={styles.traceArea}
        />
        <circle
          cx="50%"
          cy="50%"
          r="45%"
          fill="transparent"
          stroke={
            props.finished
              ? "rgb(84 255 84)"
              : props.correct === props.index
              ? "black"
              : "#ff8b8b"
          }
          strokeWidth={7}
          strokeLinecap="round"
          className={styles.circle}
          ref={circleRef}
        />
      </svg>
    </div>
  );
}
