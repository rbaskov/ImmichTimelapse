import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Filter, CalendarIcon, FolderOpen, Tag, X } from 'lucide-react';
import { useImmich } from '@/lib/immich-context';
import { format } from 'date-fns';
import { useState } from 'react';

interface FilterPanelProps {
  onApplyFilters?: () => void;
  photoCount?: number;
}

export default function FilterPanel({ onApplyFilters, photoCount = 0 }: FilterPanelProps) {
  const { filter, setFilter, albums, connection } = useImmich();
  const [dateFromOpen, setDateFromOpen] = useState(false);
  const [dateToOpen, setDateToOpen] = useState(false);

  // todo: remove mock functionality
  const availableTags = ['nature', 'family', 'travel', 'landscape', 'portrait', 'architecture'];

  const handleTagToggle = (tag: string) => {
    const currentTags = filter.tags || [];
    if (currentTags.includes(tag)) {
      setFilter({ ...filter, tags: currentTags.filter(t => t !== tag) });
    } else {
      setFilter({ ...filter, tags: [...currentTags, tag] });
    }
  };

  const clearFilters = () => {
    setFilter({});
  };

  const hasActiveFilters = filter.dateFrom || filter.dateTo || filter.albumId || (filter.tags && filter.tags.length > 0);

  return (
    <Card>
      <CardHeader className="p-4">
        <CardTitle className="text-base font-semibold flex items-center gap-2">
          <Filter className="h-4 w-4" />
          Filters
          {hasActiveFilters && (
            <Button
              variant="ghost"
              size="sm"
              className="h-6 px-2 text-xs ml-auto"
              onClick={clearFilters}
              data-testid="button-clear-filters"
            >
              <X className="h-3 w-3 mr-1" />
              Clear
            </Button>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent className="p-4 pt-0 space-y-4">
        <div className="space-y-2">
          <Label className="text-sm flex items-center gap-2">
            <CalendarIcon className="h-3 w-3" />
            Date Range
          </Label>
          <div className="flex gap-2">
            <Popover open={dateFromOpen} onOpenChange={setDateFromOpen}>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  size="sm"
                  className="flex-1 justify-start text-left font-normal"
                  data-testid="button-date-from"
                >
                  {filter.dateFrom ? format(new Date(filter.dateFrom), 'PP') : 'From'}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="single"
                  selected={filter.dateFrom ? new Date(filter.dateFrom) : undefined}
                  onSelect={(date) => {
                    setFilter({ ...filter, dateFrom: date?.toISOString() });
                    setDateFromOpen(false);
                  }}
                  initialFocus
                />
              </PopoverContent>
            </Popover>
            <Popover open={dateToOpen} onOpenChange={setDateToOpen}>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  size="sm"
                  className="flex-1 justify-start text-left font-normal"
                  data-testid="button-date-to"
                >
                  {filter.dateTo ? format(new Date(filter.dateTo), 'PP') : 'To'}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="single"
                  selected={filter.dateTo ? new Date(filter.dateTo) : undefined}
                  onSelect={(date) => {
                    setFilter({ ...filter, dateTo: date?.toISOString() });
                    setDateToOpen(false);
                  }}
                  initialFocus
                />
              </PopoverContent>
            </Popover>
          </div>
        </div>

        <div className="space-y-2">
          <Label className="text-sm flex items-center gap-2">
            <FolderOpen className="h-3 w-3" />
            Album
          </Label>
          <Select
            value={filter.albumId || 'all'}
            onValueChange={(value) => setFilter({ ...filter, albumId: value === 'all' ? undefined : value })}
            disabled={!connection.isConnected}
          >
            <SelectTrigger data-testid="select-album" className="w-full">
              <SelectValue placeholder="All albums" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All albums</SelectItem>
              {albums.map((album) => (
                <SelectItem key={album.id} value={album.id}>
                  {album.albumName} ({album.assetCount})
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label className="text-sm flex items-center gap-2">
            <Tag className="h-3 w-3" />
            Tags
          </Label>
          <div className="flex flex-wrap gap-1">
            {availableTags.map((tag) => {
              const isSelected = filter.tags?.includes(tag);
              return (
                <Badge
                  key={tag}
                  variant={isSelected ? 'default' : 'outline'}
                  className={`cursor-pointer text-xs toggle-elevate ${isSelected ? 'toggle-elevated' : ''}`}
                  onClick={() => handleTagToggle(tag)}
                  data-testid={`badge-tag-${tag}`}
                >
                  {tag}
                </Badge>
              );
            })}
          </div>
        </div>

        <Button
          className="w-full"
          onClick={onApplyFilters}
          disabled={!connection.isConnected}
          data-testid="button-apply-filters"
        >
          Apply Filters
          {photoCount > 0 && (
            <Badge variant="secondary" className="ml-2 bg-primary-foreground/20 text-primary-foreground">
              {photoCount}
            </Badge>
          )}
        </Button>
      </CardContent>
    </Card>
  );
}
