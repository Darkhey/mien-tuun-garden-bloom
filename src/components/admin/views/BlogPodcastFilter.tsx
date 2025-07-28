
import React from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select';

interface BlogPodcastFilterProps {
  search: string;
  setSearch: (value: string) => void;
  podcastFilter: 'all' | 'with-podcast' | 'without-podcast';
  setPodcastFilter: (value: 'all' | 'with-podcast' | 'without-podcast') => void;
  category: string;
  setCategory: (value: string) => void;
  onRefresh: () => void;
}

const BlogPodcastFilter: React.FC<BlogPodcastFilterProps> = ({
  search,
  setSearch,
  podcastFilter,
  setPodcastFilter,
  category,
  setCategory,
  onRefresh
}) => {
  return (
    <div className="bg-white rounded-lg border p-4 mb-6">
      <div className="flex flex-wrap gap-4 items-center">
        <div className="min-w-0 flex-1">
          <Input
            className="max-w-xs"
            placeholder="Blog-Artikel durchsuchen..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        
        <Select value={podcastFilter} onValueChange={setPodcastFilter}>
          <SelectTrigger className="w-48">
            <SelectValue placeholder="Podcast-Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Alle Artikel</SelectItem>
            <SelectItem value="with-podcast">Mit Podcast</SelectItem>
            <SelectItem value="without-podcast">Ohne Podcast</SelectItem>
          </SelectContent>
        </Select>

        <Select value={category} onValueChange={setCategory}>
          <SelectTrigger className="w-44">
            <SelectValue placeholder="Alle Kategorien" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Alle Kategorien</SelectItem>
            <SelectItem value="garten-planung">Garten & Planung</SelectItem>
            <SelectItem value="pflanzenpflege">Pflanzenpflege</SelectItem>
            <SelectItem value="ernte-kueche">Ernte & Küche</SelectItem>
            <SelectItem value="selbermachen-ausruestung">Selbermachen & Ausrüstung</SelectItem>
            <SelectItem value="nachhaltigkeit-umwelt">Nachhaltigkeit & Umwelt</SelectItem>
          </SelectContent>
        </Select>

        <Button
          variant="outline"
          onClick={onRefresh}
        >
          Aktualisieren
        </Button>
      </div>
    </div>
  );
};

export default BlogPodcastFilter;
