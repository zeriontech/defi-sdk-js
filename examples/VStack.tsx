import React from "react";

export const VStack = ({
  gap = 8,
  ...rest
}: {
  gap: number;
} & React.HTMLAttributes<HTMLDivElement>): React.ReactElement => (
  <div style={{ display: "grid", gridGap: gap }} {...rest} />
);
