import React, { useEffect } from "react";

import styles from "./index.module.css";

export default function Paragraph(props) {
  useEffect(() => {
    const el = (e) => {
      if (e.keyCode === 8 && props.index > 0) {
        props.setIndex((prev) => prev - 1);
        props.correct === props.index - 1 &&
          props.setCorrect((prev) => prev - 1);
      }
      if (
        e.key.charCodeAt() <= 126 &&
        e.key.charCodeAt() >= 32 &&
        e.key.length === 1
      ) {
        if (
          props.correct === props.index - 1 &&
          props.textArr[props.index] === e.key
        ) {
          props.setCorrect((prev) => prev + 1);
          if (props.correct === props.textArr.length - 2) props.setFinished(1);
        }
        if (props.textArr[props.index] !== e.key)
          props.setIncorrect((prev) => prev + 1);
        props.setIndex((prev) =>
          prev < props.textArr.length ? prev + 1 : prev
        );
      }
    };
    if (!props.finished) document.body.addEventListener("keydown", el);
    return () => {
      document.body.removeEventListener("keydown", el);
    };
  }, [props.index]);

  return (
    <div className={styles.text}>
      <input type="text" id="vkey-input" className={styles.vkeyInput} />
      {props.textArr.map((t, i) => (
        <span
          key={i}
          className={
            i <= props.correct
              ? styles.true
              : i < props.index
              ? styles.false
              : styles.disabled
          }
        >
          {t}
        </span>
      ))}
    </div>
  );
}
