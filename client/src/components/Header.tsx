import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Moon, Sun, Settings, Film, Circle, Globe } from 'lucide-react';
import { useImmich } from '@/lib/immich-context';
import { useLanguage } from '@/lib/language-context';
import { useState, useEffect } from 'react';

interface HeaderProps {
  onSettingsClick?: () => void;
}

export default function Header({ onSettingsClick }: HeaderProps) {
  const { connection } = useImmich();
  const { language, setLanguage, t } = useLanguage();
  const [isDark, setIsDark] = useState(false);

  useEffect(() => {
    const root = document.documentElement;
    if (isDark) {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
    localStorage.setItem('theme', isDark ? 'dark' : 'light');
  }, [isDark]);

  useEffect(() => {
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme === 'dark') {
      setIsDark(true);
    }
  }, []);

  const toggleTheme = () => {
    setIsDark(!isDark);
  };

  return (
    <header className="sticky top-0 z-50 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="flex items-center justify-between h-14 px-4 max-w-7xl mx-auto gap-4">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <Film className="h-6 w-6 text-primary" />
            <h1 className="text-lg font-bold tracking-tight">
              {t('header.title')}
            </h1>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {connection.isConnected ? (
            <Badge variant="outline" className="gap-1.5 text-xs">
              <Circle className="h-2 w-2 fill-status-online text-status-online" />
              {t('header.connected')}
            </Badge>
          ) : (
            <Badge variant="outline" className="gap-1.5 text-xs text-muted-foreground">
              <Circle className="h-2 w-2 fill-muted-foreground" />
              {t('header.disconnected')}
            </Badge>
          )}

          <div className="flex items-center gap-1 border-l pl-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setLanguage('en')}
              className={language === 'en' ? 'bg-accent text-accent-foreground' : ''}
              data-testid="button-language-en"
              title="English"
            >
              <span className="text-sm font-medium">EN</span>
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setLanguage('ru')}
              className={language === 'ru' ? 'bg-accent text-accent-foreground' : ''}
              data-testid="button-language-ru"
              title="Русский"
            >
              <span className="text-sm font-medium">RU</span>
            </Button>
          </div>

          <Button
            variant="ghost"
            size="icon"
            onClick={toggleTheme}
            data-testid="button-theme-toggle"
          >
            {isDark ? (
              <Sun className="h-5 w-5" />
            ) : (
              <Moon className="h-5 w-5" />
            )}
          </Button>

          <Button
            variant="ghost"
            size="icon"
            onClick={onSettingsClick}
            data-testid="button-settings"
          >
            <Settings className="h-5 w-5" />
          </Button>
        </div>
      </div>
    </header>
  );
}
