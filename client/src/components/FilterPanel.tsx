import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Filter, CalendarIcon, FolderOpen, X, Search, Save, Trash2 } from 'lucide-react';
import { useImmich } from '@/lib/immich-context';
import { useLanguage } from '@/lib/language-context';
import { useToast } from '@/hooks/use-toast';
import { format } from 'date-fns';
import { useState } from 'react';

interface FilterPanelProps {
  onApplyFilters?: () => void;
  photoCount?: number;
}

export default function FilterPanel({ onApplyFilters, photoCount = 0 }: FilterPanelProps) {
  const { filter, setFilter, albums, connection, savedFilters, saveFilter, loadFilter, deleteSavedFilter } = useImmich();
  const { t } = useLanguage();
  const { toast } = useToast();
  const [dateFromOpen, setDateFromOpen] = useState(false);
  const [dateToOpen, setDateToOpen] = useState(false);
  const [filterNameInput, setFilterNameInput] = useState('');
  const [selectedFilterId, setSelectedFilterId] = useState<string | null>(null);

  const clearFilters = () => {
    setFilter({});
    setSelectedFilterId(null);
  };

  const handleLoadFilter = (filterId: string) => {
    loadFilter(filterId);
    setSelectedFilterId(filterId);
    toast({
      title: 'Filter loaded',
      description: 'Filter applied to current search',
    });
  };

  const hasActiveFilters = filter.dateFrom || filter.dateTo || filter.albumId || filter.filename;

  return (
    <Card>
      <CardHeader className="p-4">
        <CardTitle className="text-base font-semibold flex items-center gap-2">
          <Filter className="h-4 w-4" />
          {t('filter.title')}
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
            <Search className="h-3 w-3" />
            {t('filter.filename')}
          </Label>
          <Input
            placeholder="e.g., hiwatch_les* or *main*"
            value={filter.filename || ''}
            onChange={(e) => setFilter({ ...filter, filename: e.target.value || undefined })}
            disabled={!connection.isConnected}
            data-testid="input-filename-search"
            className="text-sm"
          />
          <p className="text-xs text-muted-foreground">
            {t('filter.filename')}
          </p>
        </div>

        <div className="space-y-2">
          <Label className="text-sm flex items-center gap-2">
            <CalendarIcon className="h-3 w-3" />
            {t('filter.dateFrom')} - {t('filter.dateTo')}
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
                  {filter.dateFrom ? format(new Date(filter.dateFrom), 'PP') : t('filter.dateFrom')}
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

        <div className="pt-4 border-t space-y-2">
          <div className="flex gap-2">
            <Input
              placeholder="Filter name"
              value={filterNameInput}
              onChange={(e) => setFilterNameInput(e.target.value)}
              onKeyPress={(e) => {
                if (e.key === 'Enter' && filterNameInput.trim()) {
                  saveFilter(filterNameInput.trim());
                  setFilterNameInput('');
                  toast({
                    title: 'Filter saved',
                    description: `Filter "${filterNameInput}" has been saved`,
                  });
                }
              }}
              className="flex-1 text-sm"
              data-testid="input-filter-name"
            />
            <Button
              onClick={() => {
                if (filterNameInput.trim()) {
                  saveFilter(filterNameInput.trim());
                  setFilterNameInput('');
                  toast({
                    title: 'Filter saved',
                    description: `Filter "${filterNameInput}" has been saved`,
                  });
                }
              }}
              size="sm"
              variant="default"
              disabled={!filterNameInput.trim()}
              data-testid="button-save-filter"
            >
              <Save className="h-3 w-3" />
            </Button>
          </div>

          {savedFilters.length > 0 && (
            <div className="space-y-2">
              <Label className="text-xs text-muted-foreground">Saved Filters</Label>
              <Select value={selectedFilterId || ''} onValueChange={handleLoadFilter}>
                <SelectTrigger className="text-sm" data-testid="select-saved-filter">
                  <SelectValue placeholder="Load a saved filter" />
                </SelectTrigger>
                <SelectContent>
                  {savedFilters.map((sf) => (
                    <SelectItem key={sf.id} value={sf.id}>
                      {sf.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              
              {savedFilters.length > 0 && (
                <div className="space-y-1">
                  {savedFilters.map((sf) => (
                    <div key={sf.id} className="flex items-center justify-between bg-muted/50 rounded p-1.5 text-xs">
                      <span className="text-muted-foreground">{sf.name}</span>
                      <Button
                        onClick={() => {
                          deleteSavedFilter(sf.id);
                          toast({
                            title: 'Filter deleted',
                            description: `Filter "${sf.name}" has been removed`,
                          });
                        }}
                        size="sm"
                        variant="ghost"
                        className="h-5 px-1"
                        data-testid={`button-delete-filter-${sf.id}`}
                      >
                        <Trash2 className="h-3 w-3" />
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
