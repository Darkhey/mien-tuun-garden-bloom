
import React, { useState, useMemo } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
  TableCaption,
} from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search } from "lucide-react";

// Daten (aus: https://www.garten-und-freizeit.de/magazin/aussaatkalender – teilauszug & logische Gruppen)
const SOWING_DATA = [
  {
    plant: "Radieschen",
    directSow: [3, 4, 5, 6, 7, 8, 9],
    indoor: [],
    plantOut: [],
    harvest: [5, 6, 7, 8, 9, 10],
  },
  {
    plant: "Möhren",
    directSow: [3, 4, 5, 6, 7],
    indoor: [],
    plantOut: [],
    harvest: [6, 7, 8, 9, 10],
  },
  {
    plant: "Salat",
    directSow: [3, 4, 5, 6, 7, 8],
    indoor: [2, 3, 4],
    plantOut: [4, 5, 6],
    harvest: [5, 6, 7, 8, 9, 10],
  },
  {
    plant: "Tomaten",
    directSow: [],
    indoor: [2, 3, 4],
    plantOut: [5, 6],
    harvest: [7, 8, 9, 10],
  },
  {
    plant: "Gurken",
    directSow: [5, 6],
    indoor: [4, 5],
    plantOut: [5, 6],
    harvest: [7, 8, 9],
  },
  {
    plant: "Zucchini",
    directSow: [5, 6],
    indoor: [4, 5],
    plantOut: [5, 6],
    harvest: [7, 8, 9],
  },
  {
    plant: "Paprika",
    directSow: [],
    indoor: [2, 3],
    plantOut: [5, 6],
    harvest: [7, 8, 9, 10],
  },
  {
    plant: "Kürbis",
    directSow: [5, 6],
    indoor: [4, 5],
    plantOut: [5, 6],
    harvest: [8, 9, 10],
  },
  {
    plant: "Zwiebeln",
    directSow: [3, 4],
    indoor: [],
    plantOut: [],
    harvest: [7, 8, 9],
  },
  {
    plant: "Erbsen",
    directSow: [3, 4, 5],
    indoor: [],
    plantOut: [],
    harvest: [6, 7, 8],
  },
  {
    plant: "Bohnen",
    directSow: [5, 6, 7],
    indoor: [],
    plantOut: [],
    harvest: [7, 8, 9],
  },
  {
    plant: "Blumenkohl",
    directSow: [4, 5],
    indoor: [2, 3],
    plantOut: [4, 5],
    harvest: [6, 7, 8, 9, 10],
  },
  {
    plant: "Brokkoli",
    directSow: [4, 5],
    indoor: [2, 3],
    plantOut: [4, 5],
    harvest: [6, 7, 8, 9],
  },
  {
    plant: "Rote Bete",
    directSow: [4, 5, 6],
    indoor: [],
    plantOut: [],
    harvest: [7, 8, 9, 10],
  },
  {
    plant: "Spinat",
    directSow: [3, 4, 8, 9],
    indoor: [],
    plantOut: [],
    harvest: [5, 6, 9, 10],
  },
  {
    plant: "Kohlrabi",
    directSow: [4, 5, 6, 7],
    indoor: [2, 3],
    plantOut: [4, 5, 6],
    harvest: [6, 7, 8, 9, 10],
  },
  // Mehr Gemüse nach Bedarf ergänzbar …
];

const MONTHS = [
  "Jan", "Feb", "Mär", "Apr", "Mai", "Jun", "Jul", "Aug", "Sep", "Okt", "Nov", "Dez"
];

const CATEGORIES = [
  { key: "directSow", color: "bg-green-400", label: "Aussaat draußen" },
  { key: "indoor", color: "bg-blue-400", label: "Vorziehen" },
  { key: "plantOut", color: "bg-yellow-400", label: "Auspflanzen" },
  { key: "harvest", color: "bg-orange-400", label: "Ernte" },
];

function renderMonthDots(row: typeof SOWING_DATA[number], col: number, categoryFilter: Record<string, boolean>) {
  // Zeigt alle farbigen Punkte für gewählte Kategorien in dieser Zelle
  return CATEGORIES.map(({ key, color, label }) =>
    categoryFilter[key] && (row[key as keyof typeof row] as number[]).includes(col + 1) ? (
      <span
        key={key}
        className={`${color} inline-block w-3 h-3 rounded-full mx-[1px] shadow`}
        title={label}
      />
    ) : null
  );
}

const SowingCalendar: React.FC = () => {
  const [search, setSearch] = useState("");
  // Welche Kategorien werden angezeigt?
  const [categoryFilter, setCategoryFilter] = useState({
    directSow: true,
    indoor: true,
    plantOut: true,
    harvest: true,
  });

  // Suche & Filter anwenden
  const filteredRows = useMemo(() => {
    return SOWING_DATA.filter(row =>
      row.plant.toLowerCase().includes(search.toLowerCase())
    );
  }, [search]);

  return (
    <div className="w-full max-w-full md:max-w-4xl mx-auto bg-white shadow rounded-lg p-4 overflow-x-auto animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 mb-3">
        <h2 className="text-xl font-bold">Aussaatkalender für Gemüse</h2>
        <form
          onSubmit={e => e.preventDefault()}
          className="flex items-center gap-2"
        >
          <Input
            type="search"
            placeholder="Suche Gemüse…"
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-40 px-2 py-1 text-sm"
          />
          <Button variant="ghost" size="icon" tabIndex={-1} aria-label="Suchen">
            <Search className="w-4 h-4" />
          </Button>
        </form>
      </div>
      <div className="flex flex-wrap gap-2 mb-2">
        {CATEGORIES.map(cat => (
          <Button
            key={cat.key}
            type="button"
            size="sm"
            variant={categoryFilter[cat.key] ? "default" : "outline"}
            className={`gap-1 px-2 py-1 rounded-full ${cat.color} text-xs font-semibold 
              ${categoryFilter[cat.key] ? " opacity-100 ring-2 ring-green-300" : "opacity-60"}`}
            onClick={() =>
              setCategoryFilter(f => ({
                ...f,
                [cat.key]: !f[cat.key],
              }))
            }
          >
            <span className={`${cat.color} w-2 h-2 rounded-full inline-block`}></span>
            {cat.label}
          </Button>
        ))}
      </div>
      <p className="text-sage-700 text-xs mb-2">
        <span className="inline-block align-middle">
          <span className="bg-green-400 inline-block w-3 h-3 rounded-full mr-1"></span>
          Aussaat draußen
        </span>
        <span className="ml-3 inline-block align-middle">
          <span className="bg-blue-400 inline-block w-3 h-3 rounded-full mr-1"></span>
          Vorziehen im Haus
        </span>
        <span className="ml-3 inline-block align-middle">
          <span className="bg-yellow-400 inline-block w-3 h-3 rounded-full mr-1"></span>
          Auspflanzen
        </span>
        <span className="ml-3 inline-block align-middle">
          <span className="bg-orange-400 inline-block w-3 h-3 rounded-full mr-1"></span>
          Ernte
        </span>
      </p>
      <Table>
        <TableCaption>
          Tipp: Je nach Region kann es Abweichungen geben. Tabelle orientiert sich an Mitteleuropa.
        </TableCaption>
        <TableHeader>
          <TableRow>
            <TableHead className="min-w-[110px]">Pflanze</TableHead>
            {MONTHS.map((m, i) => (
              <TableHead key={i} className="text-center w-7">{m}</TableHead>
            ))}
          </TableRow>
        </TableHeader>
        <TableBody>
          {filteredRows.length === 0 && (
            <TableRow>
              <TableCell colSpan={13} className="text-center text-muted-foreground italic">
                Keine passenden Gemüse gefunden.
              </TableCell>
            </TableRow>
          )}
          {filteredRows.map(row => (
            <TableRow key={row.plant} className="hover:bg-green-50/40">
              <TableCell className="font-semibold">{row.plant}</TableCell>
              {Array.from({ length: 12 }, (_, col) => (
                <TableCell key={col} className="text-center px-1 py-0">
                  <div className="flex flex-wrap gap-0.5 justify-center items-center min-h-[1.3rem]">
                    {renderMonthDots(row, col, categoryFilter)}
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
