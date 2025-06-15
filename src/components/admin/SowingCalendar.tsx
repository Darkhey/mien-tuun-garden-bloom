
import React from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
  TableCaption,
} from "@/components/ui/table";

// Beispielhafte Daten für Gemüse, Aussaat draußen und im Haus, Pflanzzeit & Erntezeit
const SOWING_DATA = [
  {
    plant: "Radieschen",
    directSow: [3, 4, 5, 6, 7, 8, 9],
    indoor: [],
    plantOut: [],
    harvest: [5, 6, 7, 8, 9, 10],
  },
  {
    plant: "Salat",
    directSow: [3, 4, 5, 6, 7, 8],
    indoor: [2, 3, 4],
    plantOut: [4, 5, 6],
    harvest: [5, 6, 7, 8, 9, 10],
  },
  {
    plant: "Tomate",
    directSow: [],
    indoor: [2, 3, 4],
    plantOut: [5, 6],
    harvest: [7, 8, 9, 10],
  },
  {
    plant: "Karotte",
    directSow: [3, 4, 5, 6, 7],
    indoor: [],
    plantOut: [],
    harvest: [6, 7, 8, 9, 10],
  },
  {
    plant: "Kürbis",
    directSow: [5, 6],
    indoor: [4, 5],
    plantOut: [5, 6],
    harvest: [8, 9, 10],
  },
];

const MONTHS = [
  "Jan", "Feb", "Mär", "Apr", "Mai", "Jun", "Jul", "Aug", "Sep", "Okt", "Nov", "Dez"
];

function renderMonthDots(monthIndexes: number[], type: "direct" | "indoor" | "plantOut" | "harvest", col: number) {
  // Jede Art bekommt eine andere Farbe
  const color = {
    direct: "bg-green-400",
    indoor: "bg-blue-400",
    plantOut: "bg-yellow-400",
    harvest: "bg-orange-400",
  }[type];

  return (
    <span
      className={`
        ${color}
        inline-block w-3 h-3 rounded-full
        mx-auto
        ${monthIndexes.includes(col + 1) ? "" : "opacity-10"}
      `}
      title={
        type === "direct"
          ? "Aussaat draußen"
          : type === "indoor"
          ? "Aussaat im Haus"
          : type === "plantOut"
          ? "Pflanzung ins Freiland"
          : "Erntezeit"
      }
    />
  );
}

const SowingCalendar: React.FC = () => {
  return (
    <div className="w-full max-w-full md:max-w-4xl mx-auto bg-white shadow rounded-lg p-4 overflow-x-auto">
      <h2 className="text-xl font-bold mb-2">Aussaatkalender für Gemüse</h2>
      <p className="text-sage-700 text-sm mb-4">
        Übersicht: Bunte Punkte markieren die besten Monate für Aussaat und Ernte.
        <span className="ml-2 inline-block align-middle">
          <span className="bg-green-400 inline-block w-3 h-3 rounded-full mr-1"></span>Draußen
          <span className="bg-blue-400 inline-block w-3 h-3 rounded-full mx-1"></span>Im Haus
          <span className="bg-yellow-400 inline-block w-3 h-3 rounded-full mx-1"></span>Auspflanzen
          <span className="bg-orange-400 inline-block w-3 h-3 rounded-full mx-1"></span>Ernte
        </span>
      </p>
      <Table>
        <TableCaption>
          Tipp: Regionale Unterschiede möglich. Angaben für Mitteleuropa gedacht.
        </TableCaption>
        <TableHeader>
          <TableRow>
            <TableHead>Pflanze</TableHead>
            {MONTHS.map((m, i) => (
              <TableHead key={i} className="text-center">{m}</TableHead>
            ))}
          </TableRow>
        </TableHeader>
        <TableBody>
          {SOWING_DATA.map(row => (
            <TableRow key={row.plant}>
              <TableCell className="font-semibold">{row.plant}</TableCell>
              {Array.from({ length: 12 }, (_, col) => (
                <TableCell key={col} className="text-center">
                  <div className="flex gap-1 justify-center items-center">
                    {/* Aussaat draußen */}
                    {row.directSow.includes(col + 1) && renderMonthDots(row.directSow, "direct", col)}
                    {/* Aussaat im Haus */}
                    {row.indoor.includes(col + 1) && renderMonthDots(row.indoor, "indoor", col)}
                    {/* Auspflanzen */}
                    {row.plantOut.includes(col + 1) && renderMonthDots(row.plantOut, "plantOut", col)}
                    {/* Ernte */}
                    {row.harvest.includes(col + 1) && renderMonthDots(row.harvest, "harvest", col)}
                  </div>
                </TableCell>
              ))}
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
};

export default SowingCalendar;

