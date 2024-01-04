import {ApplicationConfig} from '@angular/core';
import {HIGHLIGHT_OPTIONS, HighlightOptions,} from 'ngx-highlightjs';
import {provideRouter} from "@angular/router";
import {routes} from "./app.routes";

export const appConfig: ApplicationConfig = {
  providers: [
    provideRouter(routes),
    {
      provide: HIGHLIGHT_OPTIONS,
      useValue: <HighlightOptions>{
        lineNumbers: true,
        coreLibraryLoader: () => import('highlight.js/lib/core'),
        lineNumbersLoader: () => import('ngx-highlightjs/line-numbers'),
        languages: {
          // We need to import at least one language, even though we add our own ORM language
          typescript: () => import('highlight.js/lib/languages/typescript'),
        },
      },
    },
  ]
};
