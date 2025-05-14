"use client";

import { cn } from "@/lib/utils";
import { Eye, EyeOff, Info, Settings } from "lucide-react";
import { useTheme } from "next-themes";
import dynamic from "next/dynamic";
import {
  createContext,
  ReactNode,
  use,
  useEffect,
  useMemo,
  useState,
} from "react";
import { Button } from "../ui/button";
import { Card, CardContent, CardFooter, CardHeader } from "../ui/card";
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogTrigger,
} from "../ui/dialog";
import { Label } from "../ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";
import { Separator } from "../ui/separator";
import { Switch } from "../ui/switch";

export const ScreenDevTools = dynamic(async () => ScreenDevtoolsWrapper, {
  ssr: false,
});

type Position = "top-left" | "top-right" | "bottom-left" | "bottom-right";
type Unit = "px" | "rem";

type Preferences = {
  // Add new preferences here to enforce typing
  position: Position;
  cssUnit: Unit;
};

type Preference<T extends keyof Preferences> = {
  key: T;
  description: string;
  label: string;
  items: Array<{
    label: string;
    value: Preferences[T];
  }>;
  currentValue: Preferences[T];
};

// Ensure only valid key-value combinations are allowed in the array
type AllowedPreferences = Record<
  keyof Preferences,
  Preference<keyof Preferences>
>;

type Tool = "screen-size" | "theme-preference"; // Add new tools here to enforce typing
type Tools = Record<Tool, boolean>;

const defaultPreferences = {
  position: {
    key: "position",
    description: "Adjust the placement of your dev tools.",
    label: "Position",
    currentValue: "bottom-right",
    items: [
      {
        label: "Bottom Left",
        value: "bottom-left",
      },
      {
        label: "Bottom Right",
        value: "bottom-right",
      },
      {
        label: "Top Left",
        value: "top-left",
      },
      {
        label: "Top Right",
        value: "top-right",
      },
    ],
  } as Preference<"position">,
  cssUnit: {
    key: "cssUnit",
    description: "Choose the unit for measuring screen size.",
    label: "CSS unit",
    currentValue: "px",
    items: [
      {
        label: "px",
        value: "px",
      },
      {
        label: "rem",
        value: "rem",
      },
    ],
  } as Preference<"cssUnit">,
} satisfies AllowedPreferences;

const defaultTools: Tools = {
  "screen-size": true,
  "theme-preference": true,
};

function ScreenDevtoolsWrapper() {
  // Won't ship to your production build
  if (process.env.NODE_ENV === "production") return null;

  return (
    <SettingsProvider>
      <InternalScreenDevTools />
    </SettingsProvider>
  );
}

function InternalScreenDevTools() {
  const [isShown, setIsShown] = useState(false);
  const { preferences, tools } = useSettings();

  const positionClassNames = useMemo(() => {
    if (preferences.position.currentValue === "top-left") return "top-5 left-5";
    else if (preferences.position.currentValue === "top-right")
      return "top-5 right-5";
    else if (preferences.position.currentValue === "bottom-left")
      return "bottom-5 left-5";
    else if (preferences.position.currentValue === "bottom-right")
      return "bottom-5 right-5";
  }, [preferences.position.currentValue]);

  if (!isShown) {
    return (
      <div
        className={cn(
          "pointer-events-auto fixed isolate z-50 flex flex-col border border-transparent text-sm transition-all",
          positionClassNames,
        )}
      >
        <div className="relative overflow-hidden rounded-full">
          <div className="absolute inset-0 size-full animate-spin bg-conic/decreasing from-violet-700 via-lime-300 to-violet-700 blur-lg" />
          <Button
            size={"icon"}
            variant={"ghost"}
            onClick={() => setIsShown(true)}
            className="relative isolate cursor-pointer"
          >
            <div className="bg-background absolute inset-0.5 z-[-1] rounded-full shadow" />
            <Eye />
          </Button>
        </div>
      </div>
    );
  }
  return (
    <Card
      className={cn(
        "bg-background pointer-events-auto fixed isolate z-50 flex flex-col gap-0 overflow-hidden p-0 text-sm shadow-md transition-all",
        positionClassNames,
      )}
    >
      <CardHeader className="flex px-3 py-2">
        <span className="font-semibold">Devtools</span>
      </CardHeader>

      {/* DevTools */}
      <CardContent className="z-10 flex min-w-48 flex-col justify-between border-y p-1">
        {tools["screen-size"] && (
          <div className="flex items-center justify-between gap-2 p-1.5">
            <p>Screen</p>
            <ScreenSize cssUnit={preferences.cssUnit.currentValue} />
          </div>
        )}

        {tools["theme-preference"] && (
          <div className="flex items-center justify-between gap-2 p-1.5">
            <p>Theme</p>
            <ThemeSelector />
          </div>
        )}

        {Array.from(Object.values(tools)).every((i) => i === false) && (
          <div className="text-muted-foreground flex items-center gap-2 p-1.5">
            <Info className="text-muted-foreground size-3" />
            <span>No tools active</span>
          </div>
        )}
      </CardContent>

      <CardFooter className="bg-card isolate flex flex-row justify-between gap-1 p-0">
        <SettingsDialog
          preferences={preferences}
          positionClassNames={positionClassNames}
        />

        <Button
          size={"icon"}
          variant={"ghost"}
          onClick={() => setIsShown(false)}
        >
          <EyeOff />
        </Button>
      </CardFooter>
    </Card>
  );
}

function SettingsDialog({
  preferences,
  positionClassNames,
}: {
  preferences: typeof defaultPreferences;
  positionClassNames?: string;
}) {
  const { setCssUnit, setDevToolsPosition, tools, setAciveTool } =
    useSettings();

  const handleSelectPosition = (value: Position) => {
    setDevToolsPosition(value);
  };

  const handleSelectCssUnt = (value: Unit) => {
    setCssUnit(value);
  };

  return (
    <Dialog modal={false}>
      <DialogTrigger asChild>
        <Button variant={"ghost"}>
          <Settings />
        </Button>
      </DialogTrigger>

      <DialogContent
        className={cn(
          "w-fit min-w-82 gap-0 p-0 text-sm",
          "top-[unset] left-[unset] translate-[unset]",
          positionClassNames,
        )}
      >
        <DialogTitle className="p-2 py-3.5 text-sm font-semibold">
          Settings
        </DialogTitle>

        <Separator />

        <section className="grid p-2">
          <Label className="text-muted-foreground py-1 text-xs">Tools</Label>
          <div className="flex items-center rounded-lg p-1.5">
            <span>Screen width</span>
            <Switch
              className="ml-auto"
              checked={tools["screen-size"]}
              onCheckedChange={(isActive) =>
                setAciveTool("screen-size", isActive)
              }
            />
          </div>
          <div className="flex items-center rounded-lg p-1.5">
            <span>Theme switcher</span>
            <Switch
              className="ml-auto"
              checked={tools["theme-preference"]}
              onCheckedChange={(isActive) =>
                setAciveTool("theme-preference", isActive)
              }
            />
          </div>
        </section>

        <section className="grid p-2">
          <Label className="text-muted-foreground py-1 text-xs">
            Preferences
          </Label>

          <PreferenceSelect
            settingPreference={preferences.position}
            onSelect={handleSelectPosition}
          />
          <PreferenceSelect
            settingPreference={preferences.cssUnit}
            onSelect={handleSelectCssUnt}
          />
        </section>
      </DialogContent>
    </Dialog>
  );
}

function PreferenceSelect<T extends keyof Preferences>({
  settingPreference,
  onSelect,
}: {
  settingPreference: Preference<T>;
  onSelect: (value: Preferences[T]) => void;
}) {
  const { currentValue, label, description, key, items } = settingPreference;

  return (
    <div
      className="flex items-center justify-between gap-4 rounded-lg p-1.5"
      key={key}
    >
      <div className="flex flex-col gap-1">
        <span>{label}</span>
        <span className="text-muted-foreground w-[20ch] text-xs">
          {description}
        </span>
      </div>

      <Select value={currentValue} onValueChange={onSelect}>
        <SelectTrigger className="h-fit min-w-30 px-2 text-xs">
          <SelectValue placeholder={label} className="h-fit p-0" />
        </SelectTrigger>
        <SelectContent className="p-0">
          {items.map((item) => {
            const { label, value } = item;
            return (
              <SelectItem value={value} className="text-xs" key={label}>
                {label}
              </SelectItem>
            );
          })}
        </SelectContent>
      </Select>
    </div>
  );
}

function ScreenSize({ cssUnit }: { cssUnit: Unit }) {
  const [windowWidth, setWindowWidth] = useState(window.innerWidth);

  useEffect(() => {
    const controller = new AbortController();
    const handleResize = () => {
      const styles = getComputedStyle(document.documentElement);

      const _windowWidth = window.innerWidth;
      const remPixels = styles.fontSize;
      const resolvedWindowWidth =
        cssUnit === "rem"
          ? +(_windowWidth / parseInt(remPixels)).toFixed(2)
          : _windowWidth;

      setWindowWidth(resolvedWindowWidth);
    };

    handleResize();

    window.addEventListener("resize", handleResize, {
      signal: controller.signal,
    });

    return () => controller.abort();
  }, [cssUnit]);

  return (
    <div
      className={cn(
        "bg-card inline-flex min-w-26 flex-row items-center justify-between gap-1 rounded-lg border px-1.5 py-1",
      )}
    >
      <div className="w-6 text-center font-semibold">
        <div className="block sm:hidden">xs</div>
        <div className="hidden sm:block md:hidden">sm</div>
        <div className="hidden md:block lg:hidden">md</div>
        <div className="hidden lg:block xl:hidden">lg</div>
        <div className="hidden xl:block 2xl:hidden">xl</div>
        <div className="hidden 2xl:block">2xl</div>
      </div>

      <div>
        <span className="font-semibold">{windowWidth}</span>
        <span className="text-muted-foreground text-xs">{cssUnit}</span>
      </div>
    </div>
  );
}

function ThemeSelector() {
  const { theme, setTheme } = useTheme();

  return (
    <div
      className="bg-card inline-flex h-fit min-w-26 flex-row items-center justify-between gap-1 overflow-hidden rounded-lg border p-1"
      role="radiogroup"
    >
      <Button
        onClick={() => setTheme("system")}
        aria-checked={theme === "system"}
        aria-label="Switch to system theme"
        variant={"ghost"}
        size={"icon"}
        className={cn(
          "size-6",
          theme === "system" && "bg-muted hover:bg-muted!",
        )}
        data-theme-switcher="true"
        role="radio"
        type="button"
      >
        <SystemThemeIcon />
      </Button>

      <Button
        onClick={() => setTheme("light")}
        aria-checked={theme === "light"}
        aria-label="Switch to light theme"
        variant={"ghost"}
        size={"icon"}
        className={cn(
          "size-6",
          theme === "light" && "bg-muted hover:bg-muted!",
        )}
        data-theme-switcher="true"
        role="radio"
        type="button"
      >
        <LightThemeIcon />
      </Button>

      <Button
        onClick={() => setTheme("dark")}
        aria-checked={theme === "dark"}
        aria-label="Switch to dark theme"
        variant={"ghost"}
        size={"icon"}
        className={cn("size-6", theme === "dark" && "bg-muted hover:bg-muted!")}
        data-theme-switcher="true"
        role="radio"
        type="button"
      >
        <DarkThemeIcon />
      </Button>
    </div>
  );
}

const SettingContext = createContext<ReturnType<
  typeof useProviderSettings
> | null>(null);

function SettingsProvider({ children }: { children: ReactNode }) {
  const settings = useProviderSettings();

  return <SettingContext value={settings}>{children}</SettingContext>;
}

const DEVTOOLS_LS_KEYS = {
  PREFERENCES: "themux_devtools_preferences",
  ACTIVE_TOOLS: "themux_devtools_tools",
};

function useProviderSettings() {
  const [preferences, setPreferences] = useState(() => {
    const storedPreferences = localStorage.getItem(
      DEVTOOLS_LS_KEYS.PREFERENCES,
    );
    return storedPreferences
      ? (JSON.parse(storedPreferences) as typeof defaultPreferences)
      : defaultPreferences;
  });

  const [tools, setTools] = useState(() => {
    const storedTools = localStorage.getItem(DEVTOOLS_LS_KEYS.ACTIVE_TOOLS);
    return storedTools ? (JSON.parse(storedTools) as Tools) : defaultTools;
  });

  const setDevToolsPosition = (position: Position) => {
    setPreferences((prev) => {
      const currentPreferences = {
        ...prev,
        position: { ...prev.position, currentValue: position },
      };

      localStorage.setItem(
        DEVTOOLS_LS_KEYS.PREFERENCES,
        JSON.stringify(currentPreferences),
      );

      return currentPreferences;
    });
  };

  const setCssUnit = (cssUnit: Unit) => {
    setPreferences((prev) => {
      const currentPreferences = {
        ...prev,
        cssUnit: { ...prev.cssUnit, currentValue: cssUnit },
      };

      localStorage.setItem(
        DEVTOOLS_LS_KEYS.PREFERENCES,
        JSON.stringify(currentPreferences),
      );

      return currentPreferences;
    });
  };

  const setAciveTool = (tool: Tool, isActive: boolean) => {
    setTools((prev) => {
      const currentTools = { ...prev, [tool]: isActive };

      localStorage.setItem(
        DEVTOOLS_LS_KEYS.ACTIVE_TOOLS,
        JSON.stringify(currentTools),
      );

      return currentTools;
    });
  };

  return {
    preferences,
    setDevToolsPosition,
    setCssUnit,
    tools,
    setAciveTool,
  };
}

function useSettings() {
  const context = use(SettingContext);

  if (context === null) {
    throw Error("useSettings must be used withing a 'SettingContext' provider");
  }

  return context;
}

function LightThemeIcon() {
  return (
    <svg
      fill="none"
      height="24"
      stroke="currentColor"
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth="2"
      viewBox="0 0 24 24"
      width="24"
      style={{ color: "currentcolor", width: "16px", height: "16px" }}
    >
      <circle cx="12" cy="12" r="5"></circle>
      <path d="M12 1v2"></path>
      <path d="M12 21v2"></path>
      <path d="M4.22 4.22l1.42 1.42"></path>
      <path d="M18.36 18.36l1.42 1.42"></path>
      <path d="M1 12h2"></path>
      <path d="M21 12h2"></path>
      <path d="M4.22 19.78l1.42-1.42"></path>
      <path d="M18.36 5.64l1.42-1.42"></path>
    </svg>
  );
}

function SystemThemeIcon() {
  return (
    <svg
      fill="none"
      height="24"
      stroke="currentColor"
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth="2"
      viewBox="0 0 24 24"
      width="24"
      style={{ color: "currentcolor", width: "16px", height: "16px" }}
    >
      <rect x="2" y="3" width="20" height="14" rx="2" ry="2"></rect>
      <path d="M8 21h8"></path>
      <path d="M12 17v4"></path>
    </svg>
  );
}

function DarkThemeIcon() {
  return (
    <svg
      fill="none"
      height="24"
      stroke="currentColor"
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth="2"
      viewBox="0 0 24 24"
      width="24"
      style={{ color: "currentcolor", width: "16px", height: "16px" }}
    >
      <path d="M21 12.79A9 9 0 1111.21 3 7 7 0 0021 12.79z"></path>
    </svg>
  );
}
