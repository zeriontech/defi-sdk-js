import React from "react";
import type { Entry } from "../src";
import { DataStatus } from "../src/cache/DataStatus";

export function EntryInfo<T>({
  entry,
  title,
  render,
}: {
  entry: Entry<T>;
  title?: string;
  render: (entry: Entry<T>) => React.ReactNode;
}): React.ReactElement {
  if (!entry) {
    return <span>no entry</span>;
  }
  return (
    <div style={{ border: "1px solid #aaa", padding: 10 }}>
      {title ? <h4>{title}</h4> : null}
      <pre style={{ opacity: entry.status === DataStatus.requested ? 0.5 : 1 }}>
        {Object.keys(entry)
          .filter(key => key !== "data")
          .map(key => (
            <div key={key}>
              {key}: {(entry as any)[key]}
            </div>
          ))}
      </pre>
      {render(entry)}
    </div>
  );
}
