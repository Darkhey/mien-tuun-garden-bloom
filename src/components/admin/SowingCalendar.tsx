
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
import {
  Select,
  SelectTrigger,
  SelectContent,
  SelectItem,
  SelectValue,
} from "@/components/ui/select";
import { Search, Filter } from "lucide-react";

const SOWING_DATA = [
  {
    plant: "Radieschen",
    type: "Gemüse",
    season: ["Frühling", "Sommer", "Herbst"],
    directSow: [3, 4, 5, 6, 7, 8, 9],
    indoor: [],
    plantOut: [],
    harvest: [5, 6, 7, 8, 9, 10],
  },
  {
    plant: "Möhren",
    type: "Gemüse",
    season: ["Frühling", "Sommer", "Herbst"],
    directSow: [3, 4, 5, 6, 7],
    indoor: [],
    plantOut: [],
    harvest: [6, 7, 8, 9, 10],
  },
  {
    plant: "Salat",
    type: "Gemüse",
    season: ["Frühling", "Sommer", "Herbst"],
    directSow: [3, 4, 5, 6, 7, 8],
    indoor: [2, 3, 4],
    plantOut: [4, 5, 6],
    harvest: [5, 6, 7, 8, 9, 10],
  },
  {
    plant: "Tomaten",
    type: "Gemüse",
    season: ["Frühling", "Sommer"],
    directSow: [],
    indoor: [2, 3, 4],
    plantOut: [5, 6],
    harvest: [7, 8, 9, 10],
  },
  {
    plant: "Erdbeeren",
    type: "Obst",
    season: ["Frühling", "Sommer"],
    directSow: [],
    indoor: [],
    plantOut: [3, 4, 8, 9],
    harvest: [6, 7, 8, 9],
  },
  {
    plant: "Apfel",
    type: "Obst",
    season: ["Herbst"],
    directSow: [],
    indoor: [],
    plantOut: [],
    harvest: [9, 10, 11],
  },
  {
    plant: "Gurken",
    type: "Gemüse",
    season: ["Frühling", "Sommer"],
    directSow: [5, 6],
    indoor: [4, 5],
    plantOut: [5, 6],
    harvest: [7, 8, 9],
  },
  {
    plant: "Zucchini",
    type: "Gemüse",
    season: ["Sommer"],
    directSow: [5, 6],
    indoor: [4, 5],
    plantOut: [5, 6],
    harvest: [7, 8, 9],
  },
  {
    plant: "Kirsche",
    type: "Obst",
    season: ["Sommer"],
    directSow: [],
    indoor: [],
    plantOut: [],
    harvest: [6, 7],
  },
  {
    plant: "Birne",
    type: "Obst",
    season: ["Herbst"],
    directSow: [],
    indoor: [],
    plantOut: [],
    harvest: [8, 9, 10],
  },
  {
    plant: "Heidelbeeren",
    type: "Obst",
    season: ["Sommer"],
    directSow: [],
    indoor: [],
    plantOut: [3, 4],
    harvest: [7, 8, 9],
  },
  {
    plant: "Paprika",
    type: "Gemüse",
    season: ["Sommer"],
    directSow: [],
    indoor: [2, 3],
    plantOut: [5, 6],
    harvest: [7, 8, 9, 10],
  },
  {
    plant: "Kürbis",
    type: "Gemüse",
    season: ["Herbst"],
    directSow: [5, 6],
    indoor: [4, 5],
    plantOut: [5, 6],
    harvest: [8, 9, 10],
  },
  {
    plant: "Johannisbeere",
    type: "Obst",
    season: ["Sommer"],
    directSow: [],
    indoor: [],
    plantOut: [3, 4, 10, 11],
    harvest: [7, 8],
  },
  {
    plant: "Bohnen",
    type: "Gemüse",
    season: ["Sommer"],
    directSow: [5, 6, 7],
    indoor: [],
    plantOut: [],
    harvest: [7, 8, 9],
  },
  {
    plant: "Apfelbeere (Aronia)",
    type: "Obst",
    season: ["Sommer", "Herbst"],
    directSow: [],
    indoor: [],
    plantOut: [3, 4],
    harvest: [8, 9],
  },
  {
    plant: "Blumenkohl",
    type: "Gemüse",
    season: ["Frühling", "Sommer", "Herbst"],
    directSow: [4, 5],
    indoor: [2, 3],
    plantOut: [4, 5],
    harvest: [6, 7, 8, 9, 10],
  },
  {
    plant: "Brokkoli",
    type: "Gemüse",
    season: ["Frühling", "Sommer", "Herbst"],
    directSow: [4, 5],
    indoor: [2, 3],
    plantOut: [4, 5],
    harvest: [6, 7, 8, 9],
  },
  {
    plant: "Himbeeren",
    type: "Obst",
    season: ["Sommer"],
    directSow: [],
    indoor: [],
    plantOut: [3, 4, 10, 11],
    harvest: [6, 7, 8, 9],
  },
  {
    plant: "Rote Bete",
    type: "Gemüse",
    season: ["Sommer", "Herbst"],
    directSow: [4, 5, 6],
    indoor: [],
    plantOut: [],
    harvest: [7, 8, 9, 10],
  },
  {
    plant: "Spinat",
    type: "Gemüse",
    season: ["Frühling", "Herbst"],
    directSow: [3, 4, 8, 9],
    indoor: [],
    plantOut: [],
    harvest: [5, 6, 9, 10],
  },
  {
    plant: "Kohlrabi",
    type: "Gemüse",
    season: ["Frühling", "Sommer", "Herbst"],
    directSow: [4, 5, 6, 7],
    indoor: [2, 3],
    plantOut: [4, 5, 6],
    harvest: [6, 7, 8, 9, 10],
  },
  {
    plant: "Pflaume",
    type: "Obst",
    season: ["Sommer", "Herbst"],
    directSow: [],
    indoor: [],
    plantOut: [],
    harvest: [8, 9],
  },
  // Weitere Obst-/Gemüsesorten nach Wunsch einfügen ...
];

const MONTHS = [
  "Jan", "Feb", "Mär", "Apr", "Mai", "Jun", "Jul", "Aug", "Sep", "Okt", "Nov", "Dez"
];
const SEASONS = ["Frühling", "Sommer", "Herbst", "Winter"];
const TYPES = ["Gemüse", "Obst"];

const CATEGORIES = [
  { key: "directSow", color: "bg-green-400", label: "Aussaat draußen" },
  { key: "indoor", color: "bg-blue-400", label: "Vorziehen" },
  { key: "plantOut", color: "bg-yellow-400", label: "Auspflanzen" },
  { key: "harvest", color: "bg-orange-400", label: "Ernte" },
];

function renderMonthDots(row: typeof SOWING_DATA[number], col: number, categoryFilter: Record<string, boolean>) {
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
  const [categoryFilter, setCategoryFilter] = useState({
    directSow: true,
    indoor: true,
    plantOut: true,
    harvest: true,
  });
  // Initialisiere alle Filter-States mit "ALL"!
  const [selectedMonth, setSelectedMonth] = useState<string>("ALL");
  const [selectedSeason, setSelectedSeason] = useState<string>("ALL");
  const [selectedType, setSelectedType] = useState<string>("ALL");

  // Filtere alle rows, die den Kriterien entsprechen
  const filteredRows = useMemo(() => {
    return SOWING_DATA.filter(row => {
      // Type-Filter
      if (selectedType !== "ALL" && row.type !== selectedType) return false;
      // Saison-Filter
      if (selectedSeason !== "ALL" && !row.season.includes(selectedSeason)) return false;
      // Textsuche auf Name
      if (search && !row.plant.toLowerCase().includes(search.toLowerCase())) return false;
      // Monat-Filter: nur zeigen, wenn in diesem Monat eine relevante Kategorie belegt ist
      if (selectedMonth !== "ALL") {
        const monthNum = MONTHS.indexOf(selectedMonth) + 1;
        // Wenn für eine aktivierte Kategorie in diesem Monat kein Eintrag -> Zeile ausblenden
        const anyCategory = CATEGORIES.some(cat =>
          categoryFilter[cat.key] &&
          (row[cat.key as keyof typeof row] as number[]).includes(monthNum)
        );
        if (!anyCategory) return false;
      }
      return true;
    });
  }, [search, selectedType, selectedSeason, categoryFilter, selectedMonth]);

  return (
    <div className="w-full max-w-full md:max-w-5xl mx-auto bg-white shadow rounded-lg p-4 overflow-x-auto animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 mb-3">
        <h2 className="text-xl font-bold">Aussaatkalender für Obst &amp; Gemüse</h2>
        <form
          onSubmit={e => e.preventDefault()}
          className="flex items-center gap-2"
        >
          <Input
            type="search"
            placeholder="Suche Kultur…"
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-40 px-2 py-1 text-sm"
          />
          <Button variant="ghost" size="icon" tabIndex={-1} aria-label="Suchen">
            <Search className="w-4 h-4" />
          </Button>
        </form>
      </div>
      <div className="flex flex-wrap gap-2 mb-2 items-center">
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
        <span className="text-muted-foreground ml-2">
          <Filter className="inline mr-1 -mt-1" size={16} />
          Filter:
        </span>
        <Select
          value={selectedMonth}
          onValueChange={setSelectedMonth}
        >
          <SelectTrigger className="w-28 text-xs mr-1" aria-label="Monat wählen">
            <SelectValue placeholder="Monat" />
          </SelectTrigger>
          <SelectContent>
            {/* Wert ist jetzt "ALL" statt "" */}
            <SelectItem value="ALL">Alle Monate</SelectItem>
            {MONTHS.map((m, i) => (
              <SelectItem key={m} value={m}>{m}</SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select
          value={selectedSeason}
          onValueChange={setSelectedSeason}
        >
          <SelectTrigger className="w-28 text-xs mr-1" aria-label="Saison wählen">
            <SelectValue placeholder="Saison" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="ALL">Alle Saisons</SelectItem>
            {SEASONS.map(s => (
              <SelectItem key={s} value={s}>{s}</SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select
          value={selectedType}
          onValueChange={setSelectedType}
        >
          <SelectTrigger className="w-28 text-xs mr-1" aria-label="Art wählen">
            <SelectValue placeholder="Art" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="ALL">Obst &amp; Gemüse</SelectItem>
            {TYPES.map(t => (
              <SelectItem key={t} value={t}>{t}</SelectItem>
            ))}
          </SelectContent>
        </Select>
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
            <TableHead className="min-w-[110px] sticky left-0 bg-white z-10 shadow">
              Pflanze
            </TableHead>
            <TableHead className="min-w-[56px] text-center">
              Art
            </TableHead>
            {MONTHS.map((m, i) => (
              <TableHead key={i} className="text-center w-7">
                {m}
              </TableHead>
            ))}
          </TableRow>
        </TableHeader>
        <TableBody>
          {filteredRows.length === 0 && (
            <TableRow>
              <TableCell colSpan={14} className="text-center text-muted-foreground italic">
                Keine passenden Einträge gefunden.
              </TableCell>
            </TableRow>
          )}
          {filteredRows.map(row => (
            <TableRow key={row.plant} className="hover:bg-green-50/40">
              <TableCell className="font-semibold sticky left-0 bg-white z-10 shadow">
                {row.plant}
              </TableCell>
              <TableCell className="text-xs text-center">
                {row.type}
              </TableCell>
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
