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
import { ScrollArea } from "@/components/ui/scroll-area";

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
  {
    plant: "Basilikum",
    type: "Kräuter",
    season: ["Frühling", "Sommer"],
    directSow: [5, 6],
    indoor: [3, 4, 5],
    plantOut: [5, 6],
    harvest: [6, 7, 8, 9],
  },
  {
    plant: "Petersilie",
    type: "Kräuter",
    season: ["Frühling", "Sommer", "Herbst"],
    directSow: [3, 4, 5, 6, 7],
    indoor: [2, 3, 4],
    plantOut: [4, 5],
    harvest: [5, 6, 7, 8, 9, 10],
  },
  {
    plant: "Schnittlauch",
    type: "Kräuter",
    season: ["Frühling", "Sommer", "Herbst"],
    directSow: [3, 4, 5],
    indoor: [2, 3],
    plantOut: [4, 5],
    harvest: [4, 5, 6, 7, 8, 9, 10],
  },
  {
    plant: "Dill",
    type: "Kräuter",
    season: ["Frühling", "Sommer"],
    directSow: [4, 5, 6, 7],
    indoor: [],
    plantOut: [],
    harvest: [6, 7, 8, 9],
  },
  {
    plant: "Rosmarin",
    type: "Kräuter",
    season: ["Frühling", "Sommer"],
    directSow: [],
    indoor: [2, 3, 4],
    plantOut: [5, 6],
    harvest: [6, 7, 8, 9, 10],
  },
  {
    plant: "Thymian",
    type: "Kräuter",
    season: ["Frühling", "Sommer", "Herbst"],
    directSow: [4, 5],
    indoor: [2, 3],
    plantOut: [5, 6],
    harvest: [6, 7, 8, 9, 10],
  },
  {
    plant: "Oregano",
    type: "Kräuter",
    season: ["Frühling", "Sommer"],
    directSow: [4, 5],
    indoor: [3, 4],
    plantOut: [5, 6],
    harvest: [6, 7, 8, 9, 10],
  },
  {
    plant: "Koriander",
    type: "Kräuter",
    season: ["Frühling", "Sommer", "Herbst"],
    directSow: [3, 4, 5, 6, 7],
    indoor: [],
    plantOut: [],
    harvest: [5, 6, 7, 8, 9, 10],
  },
  {
    plant: "Minze",
    type: "Kräuter",
    season: ["Frühling", "Sommer"],
    directSow: [4, 5],
    indoor: [2, 3, 4],
    plantOut: [5, 6],
    harvest: [6, 7, 8, 9, 10],
  },
  {
    plant: "Bohnenkraut",
    type: "Kräuter",
    season: ["Frühling", "Sommer"],
    directSow: [4, 5],
    indoor: [2, 3],
    plantOut: [5, 6],
    harvest: [6, 7, 8, 9, 10],
  },
  {
    plant: "Rhabarber",
    type: "Gemüse",
    season: ["Frühling"],
    directSow: [3, 4],
    indoor: [],
    plantOut: [4, 5],
    harvest: [5, 6],
  },
  {
    plant: "Weintraube",
    type: "Obst",
    season: ["Frühling"],
    directSow: [],
    indoor: [],
    plantOut: [3, 4],
    harvest: [8, 9, 10],
  },
  {
    plant: "Aprikose",
    type: "Obst",
    season: ["Frühling"],
    directSow: [],
    indoor: [],
    plantOut: [3, 4],
    harvest: [7, 8],
  },
  {
    plant: "Petersilienwurzel",
    type: "Gemüse",
    season: ["Frühling", "Sommer"],
    directSow: [3, 4, 5],
    indoor: [],
    plantOut: [],
    harvest: [9, 10, 11],
  },
  {
    plant: "Pastinake",
    type: "Gemüse",
    season: ["Frühling", "Sommer"],
    directSow: [3, 4, 5],
    indoor: [],
    plantOut: [],
    harvest: [10, 11],
  },
  {
    plant: "Kresse",
    type: "Kräuter",
    season: ["Frühling", "Sommer", "Herbst", "Winter"],
    directSow: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12],
    indoor: [],
    plantOut: [],
    harvest: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12],
  },
];

const MONTHS = [
  "Jan", "Feb", "Mär", "Apr", "Mai", "Jun", "Jul", "Aug", "Sep", "Okt", "Nov", "Dez"
];
const SEASONS = ["Frühling", "Sommer", "Herbst", "Winter"];
const TYPES = ["Gemüse", "Obst", "Kräuter"];

const CATEGORIES = [
  { key: "directSow", color: "bg-green-500", label: "Aussaat draußen" },
  { key: "indoor", color: "bg-blue-500", label: "Vorziehen" },
  { key: "plantOut", color: "bg-yellow-500", label: "Auspflanzen" },
  { key: "harvest", color: "bg-orange-500", label: "Ernte" },
];

function renderMonthDots(row: typeof SOWING_DATA[number], col: number, categoryFilter: Record<string, boolean>) {
  return CATEGORIES.map(({ key, color, label }) =>
    categoryFilter[key] && (row[key as keyof typeof row] as number[]).includes(col + 1) ? (
      <span
        key={key}
        className={`${color} inline-block w-3 h-3 rounded-full mx-0.5 shadow-sm border border-white`}
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
    <div className="w-full max-w-6xl mx-auto bg-white shadow-lg rounded-xl p-6 overflow-hidden animate-fade-in">
      {/* Header Section */}
      <div className="mb-6">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 mb-4">
          <h2 className="text-2xl font-bold font-serif text-earth-800">
            Aussaatkalender für Obst &amp; Gemüse
          </h2>
          <div className="flex items-center gap-2 min-w-0">
            <div className="relative flex-1 lg:w-64">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-sage-400" />
              <Input
                type="search"
                placeholder="Suche Kultur…"
                value={search}
                onChange={e => setSearch(e.target.value)}
                className="pl-10 border-sage-200 focus:border-sage-400 focus:ring-sage-400"
              />
            </div>
          </div>
        </div>
        
        {/* Category Filter Buttons */}
        <div className="flex flex-wrap gap-2 mb-4">
          {CATEGORIES.map(cat => (
            <Button
              key={cat.key}
              type="button"
              size="sm"
              variant={categoryFilter[cat.key] ? "default" : "outline"}
              className={`gap-2 px-3 py-2 rounded-full transition-all duration-200 ${
                categoryFilter[cat.key] 
                  ? `${cat.color} text-white shadow-md hover:shadow-lg` 
                  : "bg-white border-sage-200 text-sage-700 hover:bg-sage-50"
              }`}
              onClick={() =>
                setCategoryFilter(f => ({
                  ...f,
                  [cat.key]: !f[cat.key],
                }))
              }
            >
              <span className={`${cat.color} w-3 h-3 rounded-full border border-white shadow-sm`}></span>
              <span className="text-sm font-medium">{cat.label}</span>
            </Button>
          ))}
        </div>

        {/* Dropdown Filters */}
        <div className="flex flex-wrap gap-3 items-center">
          <span className="text-sage-600 font-medium flex items-center gap-1">
            <Filter size={16} />
            Filter:
          </span>
          <Select value={selectedMonth} onValueChange={setSelectedMonth}>
            <SelectTrigger className="w-32 border-sage-200 focus:border-sage-400">
              <SelectValue placeholder="Monat" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL">Alle Monate</SelectItem>
              {MONTHS.map((m, i) => (
                <SelectItem key={m} value={m}>{m}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select value={selectedSeason} onValueChange={setSelectedSeason}>
            <SelectTrigger className="w-32 border-sage-200 focus:border-sage-400">
              <SelectValue placeholder="Saison" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL">Alle Saisons</SelectItem>
              {SEASONS.map(s => (
                <SelectItem key={s} value={s}>{s}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select value={selectedType} onValueChange={setSelectedType}>
            <SelectTrigger className="w-36 border-sage-200 focus:border-sage-400">
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
      </div>

      {/* Table Container mit ScrollArea von shadcn/ui */}
      <div className="border border-sage-200 rounded-lg overflow-hidden bg-white">
        <ScrollArea className="w-full max-w-full">
          <Table>
            <TableHeader className="bg-sage-50">
              <TableRow className="border-sage-200">
                <TableHead className="min-w-[120px] sticky left-0 bg-sage-50 border-r border-sage-200 font-semibold text-earth-800 z-20">
                  Pflanze
                </TableHead>
                <TableHead className="min-w-[80px] text-center font-semibold text-earth-800">
                  Art
                </TableHead>
                {MONTHS.map((month, i) => (
                  <TableHead key={i} className="text-center w-16 font-semibold text-earth-800">
                    <div className="text-xs">{month}</div>
                  </TableHead>
                ))}
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredRows.length === 0 && (
                <TableRow>
                  <TableCell colSpan={14} className="text-center text-sage-500 py-8 italic">
                    Keine passenden Einträge gefunden.
                  </TableCell>
                </TableRow>
              )}
              {filteredRows.map((row, index) => (
                <TableRow 
                  key={row.plant} 
                  className={`hover:bg-sage-25 transition-colors duration-150 border-sage-100 ${
                    index % 2 === 0 ? 'bg-white' : 'bg-sage-25/30'
                  }`}
                >
                  <TableCell className="font-semibold sticky left-0 bg-inherit border-r border-sage-200 z-10 text-earth-800">
                    {row.plant}
                  </TableCell>
                  <TableCell className="text-center">
                    <span className={`inline-block px-2 py-1 rounded-full text-xs font-medium ${
                      row.type === 'Gemüse' 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-orange-100 text-orange-800'
                    }`}>
                      {row.type}
                    </span>
                  </TableCell>
                  {Array.from({ length: 12 }, (_, col) => (
                    <TableCell key={col} className="text-center px-2 py-3">
                      <div className="flex flex-wrap gap-0.5 justify-center items-center min-h-[1.5rem]">
                        {renderMonthDots(row, col, categoryFilter)}
                      </div>
                    </TableCell>
                  ))}
                </TableRow>
              ))}
            </TableBody>
            <TableCaption className="text-sage-600 bg-sage-25 p-3 border-t border-sage-200">
              💡 Tipp: Je nach Region kann es Abweichungen geben. Tabelle orientiert sich an Mitteleuropa.
            </TableCaption>
          </Table>
        </ScrollArea>
      </div>

      {/* Fixed Legend at Bottom */}
      <div className="mt-4 p-4 bg-sage-25 rounded-lg border border-sage-200">
        <div className="flex flex-wrap gap-x-6 gap-y-2 justify-center text-sm">
          {CATEGORIES.map(cat => (
            <div key={cat.key} className="flex items-center gap-2">
              <span className={`${cat.color} w-3 h-3 rounded-full border border-white shadow-sm`}></span>
              <span className="text-sage-700 font-medium">{cat.label}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default SowingCalendar;
