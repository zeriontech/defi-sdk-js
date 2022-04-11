import React from "react";
import type { Entry } from "../../src";
import { DataStatus } from "../../src/cache/DataStatus";

export function EntryInfo<T>({
  entry,
  title,
  render,
}: {
  entry: Entry<T, any>;
  title?: string;
  render: (entry: Entry<T, any>) => React.ReactNode;
}): React.ReactElement {
  if (!entry) {
    return <span>no entry</span>;
  }
  return (
    <div style={{ border: "1px solid #aaa" }}>
      <div
        style={{
          backgroundColor: "#444",
          color: "white",
          padding: "4px 8px",
          display: "flex",
          gap: 8,
          alignItems: "baseline",
          opacity: entry.status === DataStatus.requested ? 0.5 : 1,
        }}
      >
        {title ? (
          <h4 style={{ margin: 0, display: "inline-block" }}>{title}</h4>
        ) : null}
        {Object.keys(entry)
          .filter(key => key !== "data")
          .filter(key => key !== "apiSubscription")
          .filter(key => key !== "value")
          .map(key => (
            <code key={key}>
              {key}: {(entry as any)[key]}
            </code>
          ))
          .map((el, index) => (
            <React.Fragment key={index}>{el}</React.Fragment>
          ))}
      </div>
      <div style={{ padding: 10 }}>{render(entry)}</div>
    </div>
  );
}
