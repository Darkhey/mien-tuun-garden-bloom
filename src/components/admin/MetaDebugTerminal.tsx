
import React from "react";
import DebugTerminal from "./DebugTerminal";

type MetaDebugTerminalProps = {
  logs: string[];
};

const MetaDebugTerminal: React.FC<MetaDebugTerminalProps> = ({ logs }) => (
  <DebugTerminal logs={logs} />
);

export default MetaDebugTerminal;
