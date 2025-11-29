import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { Server, Key, ChevronDown, ChevronUp, Loader2, CheckCircle2, XCircle, Trash2, Save } from 'lucide-react';
import { useImmich } from '@/lib/immich-context';
import { useLanguage } from '@/lib/language-context';
import { useToast } from '@/hooks/use-toast';
import type { ServerProfile } from '@/lib/types';

interface ConnectionPanelProps {
  onConnect?: (serverUrl: string, apiKey: string) => Promise<boolean>;
}

export default function ConnectionPanel({ onConnect }: ConnectionPanelProps) {
  const { connection, setConnection } = useImmich();
  const { t } = useLanguage();
  const { toast } = useToast();
  const [serverUrl, setServerUrl] = useState(connection.serverUrl);
  const [apiKey, setApiKey] = useState(connection.apiKey);
  const [isConnecting, setIsConnecting] = useState(false);
  const [isOpen, setIsOpen] = useState(!connection.isConnected);
  const [profiles, setProfiles] = useState<ServerProfile[]>([]);
  const [selectedProfileId, setSelectedProfileId] = useState('');
  const [profileName, setProfileName] = useState('');
  const [showSaveProfile, setShowSaveProfile] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem('immich_profiles');
    if (saved) {
      setProfiles(JSON.parse(saved));
    }
  }, []);

  const saveProfiles = (newProfiles: ServerProfile[]) => {
    setProfiles(newProfiles);
    localStorage.setItem('immich_profiles', JSON.stringify(newProfiles));
  };

  const handleSaveProfile = () => {
    if (!profileName.trim()) {
      toast({
        title: 'Profile name required',
        description: 'Please enter a name for this profile',
        variant: 'destructive',
      });
      return;
    }

    const newProfile: ServerProfile = {
      id: Date.now().toString(),
      name: profileName,
      serverUrl,
      apiKey,
      createdAt: new Date().toISOString(),
    };

    saveProfiles([...profiles, newProfile]);
    setProfileName('');
    setShowSaveProfile(false);
    toast({
      title: 'Profile saved',
      description: `Profile "${profileName}" has been saved`,
    });
  };

  const handleLoadProfile = (profileId: string) => {
    const profile = profiles.find(p => p.id === profileId);
    if (profile) {
      setServerUrl(profile.serverUrl);
      setApiKey(profile.apiKey);
      setSelectedProfileId(profileId);
    }
  };

  const handleDeleteProfile = (profileId: string) => {
    const profile = profiles.find(p => p.id === profileId);
    saveProfiles(profiles.filter(p => p.id !== profileId));
    if (selectedProfileId === profileId) {
      setSelectedProfileId('');
    }
    toast({
      title: 'Profile deleted',
      description: `Profile "${profile?.name}" has been removed`,
    });
  };

  const handleConnect = async () => {
    if (!serverUrl || !apiKey) {
      toast({
        title: 'Missing credentials',
        description: 'Please enter server URL and API key',
        variant: 'destructive',
      });
      return;
    }

    setIsConnecting(true);
    
    try {
      // todo: remove mock functionality
      const success = onConnect ? await onConnect(serverUrl, apiKey) : true;
      
      if (success) {
        setConnection({
          serverUrl,
          apiKey,
          isConnected: true,
        });
        setIsOpen(false);
        toast({
          title: 'Connected',
          description: 'Successfully connected to Immich server',
        });
      }
    } catch {
      toast({
        title: 'Connection failed',
        description: 'Could not connect to Immich server',
        variant: 'destructive',
      });
    } finally {
      setIsConnecting(false);
    }
  };

  const handleDisconnect = () => {
    setConnection({
      serverUrl: '',
      apiKey: '',
      isConnected: false,
    });
    setServerUrl('');
    setApiKey('');
    setIsOpen(true);
  };

  return (
    <Card>
      <Collapsible open={isOpen} onOpenChange={setIsOpen}>
        <CardHeader className="p-4">
          <CollapsibleTrigger asChild>
            <div className="flex items-center justify-between cursor-pointer">
              <CardTitle className="text-base font-semibold flex items-center gap-2">
                <Server className="h-4 w-4" />
                {t('connection.title')}
              </CardTitle>
              <div className="flex items-center gap-2">
                {connection.isConnected ? (
                  <span className="flex items-center gap-1 text-xs text-status-online">
                    <CheckCircle2 className="h-3 w-3" />
                    {t('header.connected')}
                  </span>
                ) : (
                  <span className="flex items-center gap-1 text-xs text-muted-foreground">
                    <XCircle className="h-3 w-3" />
                    {t('header.disconnected')}
                  </span>
                )}
                {isOpen ? (
                  <ChevronUp className="h-4 w-4 text-muted-foreground" />
                ) : (
                  <ChevronDown className="h-4 w-4 text-muted-foreground" />
                )}
              </div>
            </div>
          </CollapsibleTrigger>
        </CardHeader>
        <CollapsibleContent>
          <CardContent className="p-4 pt-0 space-y-4">
            {profiles.length > 0 && (
              <div className="space-y-2">
                <Label className="text-sm">{t('connection.savedProfiles')}</Label>
                <Select value={selectedProfileId} onValueChange={handleLoadProfile}>
                  <SelectTrigger data-testid="select-profile" className="w-full">
                    <SelectValue placeholder={t('connection.savedProfiles')} />
                  </SelectTrigger>
                  <SelectContent>
                    {profiles.map((profile) => (
                      <SelectItem key={profile.id} value={profile.id}>
                        {profile.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {selectedProfileId && (
                  <Button
                    variant="outline"
                    size="sm"
                    className="w-full"
                    onClick={() => handleDeleteProfile(selectedProfileId)}
                    data-testid="button-delete-profile"
                  >
                    <Trash2 className="h-3 w-3 mr-1" />
                    {t('connection.saveProfile')}
                  </Button>
                )}
              </div>
            )}
            <div className="space-y-2">
              <Label htmlFor="server-url" className="text-sm">
                {t('connection.serverUrl')}
              </Label>
              <div className="relative">
                <Server className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  id="server-url"
                  data-testid="input-server-url"
                  type="url"
                  placeholder="https://immich.example.com"
                  value={serverUrl}
                  onChange={(e) => setServerUrl(e.target.value)}
                  className="pl-9 font-mono text-sm"
                  disabled={connection.isConnected}
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="api-key" className="text-sm">
                {t('connection.apiKey')}
              </Label>
              <div className="relative">
                <Key className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  id="api-key"
                  data-testid="input-api-key"
                  type="password"
                  placeholder="Your Immich API key"
                  value={apiKey}
                  onChange={(e) => setApiKey(e.target.value)}
                  className="pl-9 font-mono text-sm"
                  disabled={connection.isConnected}
                />
              </div>
            </div>
            {connection.isConnected ? (
              <>
                <Button
                  data-testid="button-disconnect"
                  variant="outline"
                  className="w-full"
                  onClick={handleDisconnect}
                >
                  {t('connection.disconnect')}
                </Button>
                <Button
                  data-testid="button-save-profile"
                  variant="secondary"
                  className="w-full"
                  onClick={() => setShowSaveProfile(!showSaveProfile)}
                >
                  <Save className="h-4 w-4 mr-2" />
                  {t('connection.saveProfile')}
                </Button>
              </>
            ) : (
              <>
                <Button
                  data-testid="button-connect"
                  className="w-full"
                  onClick={handleConnect}
                  disabled={isConnecting}
                >
                  {isConnecting ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      {t('connection.connect')}...
                    </>
                  ) : (
                    t('connection.connect')
                  )}
                </Button>
                {showSaveProfile && (
                  <div className="space-y-2 border-t pt-4">
                    <Label htmlFor="profile-name" className="text-sm">
                      {t('connection.profileName')}
                    </Label>
                    <Input
                      id="profile-name"
                      data-testid="input-profile-name"
                      placeholder="My Server"
                      value={profileName}
                      onChange={(e) => setProfileName(e.target.value)}
                      className="text-sm"
                    />
                    <div className="flex gap-2">
                      <Button
                        data-testid="button-save-new-profile"
                        size="sm"
                        className="flex-1"
                        onClick={handleSaveProfile}
                      >
                        {t('connection.saveProfile')}
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        className="flex-1"
                        onClick={() => setShowSaveProfile(false)}
                      >
                        {t('filter.apply')}
                      </Button>
                    </div>
                  </div>
                )}
              </>
            )}
          </CardContent>
        </CollapsibleContent>
      </Collapsible>
    </Card>
  );
}
