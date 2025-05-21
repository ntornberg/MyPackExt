type ScriptContentOptions = {
    record: string;
    field:  string;
    event:  string;
    script: string;
  };
  
  export function generateScriptContentUrl(opts: ScriptContentOptions): string {
    // match "/psc/<env>/<app>/<page>/"
    const m = window.location.pathname.match(/ps[pc]\/(.+?)(?:_\d)*?\/(.+?)\/(.+?)\//);
    const pathUrl = m ? `/psc/${m[1]}/${m[2]}/${m[3]}` : '';
    const baseUrl = `${window.location.protocol}//${window.location.host}${pathUrl}`;
    return `${baseUrl}/s/${opts.record}.${opts.field}.${opts.event}.${opts.script}`;
  }