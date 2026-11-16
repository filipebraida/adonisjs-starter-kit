import type { Preview } from "@storybook/react-vite";
import { http, HttpResponse } from "msw";
import { mswLoader } from "msw-storybook-addon/csf3";
import { TuyauProvider } from "@adonisjs/inertia/react";
import { router } from "@inertiajs/react";
import { ModalStackProvider } from "adonis-inertia-modal/react";
import i18next from "i18next";
import ICU from "i18next-icu";
import { I18nextProvider, initReactI18next } from "react-i18next";

import { TooltipProvider } from "@workspace/ui/components/tooltip";
import { toast } from "@workspace/ui/hooks/use-toast";

import "adonis-inertia-modal/styles.css";
import "./preview.css";

import { client } from "@web/app/core/ui/app/client";
import { buildResources } from "@web/app/core/ui/app/i18n";

// Every locale up front: a story switches language from the toolbar without a fetch.
const resources = buildResources(
  import.meta.glob<Record<string, unknown>>(
    "../../web/app/*/resources/lang/*/*.json",
    {
      import: "default",
      eager: true,
    },
  ),
);
// The app's createI18n finds its locales with a glob rooted at the web's Vite
// root, which is empty from here: the instance is built with the same options.
const i18n = i18next.createInstance().use(ICU).use(initReactI18next);
void i18n.init({
  resources,
  lng: "en",
  fallbackLng: "en",
  supportedLngs: Object.keys(resources),
  interpolation: { escapeValue: false },
  load: "currentOnly",
  returnNull: false,
  returnEmptyString: false,
  react: { useSuspense: false },
});

// A link to a screen no story answers (Roles from the Users story) gets the
// Storybook server's 404, which Inertia would show in an error modal: the
// board says the screen is not on it instead.
// Inertia writes each page's URL (/help/account/profile) into the address
// bar, here the story's iframe: any reload of the iframe (a refresh, a hot
// update) would then ask the Storybook server for a page it does not have.
// The iframe keeps the story's address; Inertia keeps its page in the state.
let storyHref = window.location.href;
const keepStoryHref = () => {
  if (window.location.href !== storyHref) {
    window.history.replaceState(window.history.state, "", storyHref);
  }
};
router.on("navigate", keepStoryHref);
// A story hands the router its page with a client visit (src/inertia_page.tsx).
router.on("clientVisit", keepStoryHref);

// The iframe's <base target="_parent"> sends any link click Inertia does not
// take over to the Storybook window itself, which has no such page: a link
// to the app that is still unhandled once the click has bubbled is visited
// through Inertia, so it ends in the notice below.
window.addEventListener("click", (event) => {
  if (event.defaultPrevented || event.button !== 0) return;
  if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
  const link = (event.target as Element | null)?.closest?.("a[href]");
  if (!(link instanceof HTMLAnchorElement)) return;
  if (link.origin !== window.location.origin || link.target === "_blank")
    return;
  // An anchor on the page itself (#section) resolves to the iframe.
  if (link.pathname.endsWith("iframe.html")) return;
  event.preventDefault();
  router.visit(link.pathname + link.search + link.hash);
});

router.on("httpException", (event) => {
  event.preventDefault();
  toast("Not on the board", {
    description: "No story answers this screen yet.",
  });
});

const preview: Preview = {
  globalTypes: {
    theme: {
      description: "Theme",
      toolbar: {
        title: "Theme",
        icon: "mirror",
        items: ["light", "dark"],
        dynamicTitle: true,
      },
    },
    locale: {
      description: "Language",
      toolbar: {
        title: "Language",
        icon: "globe",
        items: ["en", "pt"],
        dynamicTitle: true,
      },
    },
  },
  initialGlobals: { theme: "light", locale: "en" },
  loaders: [mswLoader()],
  // The bell listens for new notifications over SSE: the board has no server
  // to push them, so the stream ends at once instead of retrying.
  beforeEach({ msw }) {
    msw.use(
      http.get("/__transmit/*", () => new HttpResponse(null, { status: 204 })),
    );
  },
  decorators: [
    (Story, context) => {
      document.documentElement.classList.toggle(
        "dark",
        context.globals.theme === "dark",
      );
      // The story's own address, before its page mounts (see the navigate listener).
      if (window.location.pathname.endsWith("iframe.html"))
        storyHref = window.location.href;
      // The fake help server answers in this language (src/help_server.ts).
      document.documentElement.lang = context.globals.locale;
      if (i18n.language !== context.globals.locale)
        void i18n.changeLanguage(context.globals.locale);
      return (
        <I18nextProvider i18n={i18n}>
          <TooltipProvider>
            <TuyauProvider client={client}>
              <ModalStackProvider>
                <div className="min-h-svh bg-background text-foreground">
                  <Story />
                </div>
              </ModalStackProvider>
            </TuyauProvider>
          </TooltipProvider>
        </I18nextProvider>
      );
    },
  ],
  parameters: {
    // The board reads top-down: the rules, the pieces, then the screens.
    options: {
      storySort: {
        order: ["Foundations", "Forms", ["Rules"], "Content", "Screens"],
      },
    },
    layout: "fullscreen",
    controls: { expanded: true },
  },
};

export default preview;
