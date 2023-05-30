import React from "react";

import styles from "./index.module.css";

export default function Details(props) {
  return (
    <div
      className={`card ${styles.details} ${
        props.finished ? styles.yesDetails : styles.noDetails
      }`}
    >
      <header>Details</header>
      <div>
        letters/minutes: {((props.textLength / props.time) * 60).toFixed(2)}
        <br /> accuracy:{" "}
        {(
          (props.textLength / (props.incorrect + props.textLength)) *
          100
        ).toFixed(2)}
        %
        <br /> characters: {props.textLength}
        <br /> mistakes: {props.incorrect}
      </div>
    </div>
  );
}
