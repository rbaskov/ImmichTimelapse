import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { Server, Key, ChevronDown, ChevronUp, Loader2, CheckCircle2, XCircle } from 'lucide-react';
import { useImmich } from '@/lib/immich-context';
import { useToast } from '@/hooks/use-toast';

interface ConnectionPanelProps {
  onConnect?: (serverUrl: string, apiKey: string) => Promise<boolean>;
}

export default function ConnectionPanel({ onConnect }: ConnectionPanelProps) {
  const { connection, setConnection } = useImmich();
  const { toast } = useToast();
  const [serverUrl, setServerUrl] = useState(connection.serverUrl);
  const [apiKey, setApiKey] = useState(connection.apiKey);
  const [isConnecting, setIsConnecting] = useState(false);
  const [isOpen, setIsOpen] = useState(!connection.isConnected);

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
                Connection
              </CardTitle>
              <div className="flex items-center gap-2">
                {connection.isConnected ? (
                  <span className="flex items-center gap-1 text-xs text-status-online">
                    <CheckCircle2 className="h-3 w-3" />
                    Connected
                  </span>
                ) : (
                  <span className="flex items-center gap-1 text-xs text-muted-foreground">
                    <XCircle className="h-3 w-3" />
                    Not connected
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
            <div className="space-y-2">
              <Label htmlFor="server-url" className="text-sm">
                Server URL
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
                API Key
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
              <Button
                data-testid="button-disconnect"
                variant="outline"
                className="w-full"
                onClick={handleDisconnect}
              >
                Disconnect
              </Button>
            ) : (
              <Button
                data-testid="button-connect"
                className="w-full"
                onClick={handleConnect}
                disabled={isConnecting}
              >
                {isConnecting ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Connecting...
                  </>
                ) : (
                  'Connect'
                )}
              </Button>
            )}
          </CardContent>
        </CollapsibleContent>
      </Collapsible>
    </Card>
  );
}
