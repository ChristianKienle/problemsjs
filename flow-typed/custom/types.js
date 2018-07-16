
// Global API

type LevelLogger = (msg: string) => void;
declare type LoggerType = {
  info: LevelLogger;
  error: LevelLogger;
};

// Public API
declare type TaskConfig = {
  name?: string;
  program: string;
  args: string[];
  matcher: string;
  cwd: string;
};

declare type ConfigType = {
  // default: []
  tasks: TaskConfig[];

   // default: .
  workspaceFolder: string;

  // default:
  // {
  //  watchedFolder: '${workspaceFolder}',
  //  includes: ['**/*.js']
  // }
  watcherOptions: WatcherOptions;
  openInEditorCommand?: string;
}; //

declare type ResolvedConfig = ConfigType;
declare type Config = ResolvedConfig;
declare type UnresolvedConfig = ConfigType;

declare interface MatcherRegistryInterface {
  addMatcher(name: string, matcher: Matcher): void;
  matcher(name: string): ?Matcher;
  +matchersByName: Map<string, Matcher>;
  +names: string[];
};


declare interface RunInterface {
  +results: MatcherResult[];
  +workspaceFolder: string;
  +problems: Problem[]; // convenience
};

// Throw if you cannot create a task based on config.
declare interface EmitterDelegate {
  willBeginRun(): void;
  didEndRun(run: RunInterface): void;
  willExecuteTask(task: TaskConfig): void;
  didExecuteTask(): void;
};

declare interface EmitterInterface {
  tasks: TaskConfig[];
  workspaceFolder: string;
  delegate: EmitterDelegate;
  resume(cb: (results: MatcherResult[]) => void): void;
};

// Misc
declare type LocationType = {
  source: string;
  line: number;
};

declare type Problem = {
  category: string;
  location: LocationType;
  message: string;
};

declare type SummaryRenderer = (term: TerminalUIInterface) => void;

// The result of executing a Matcher.
// problems: Problems that were encountered
// summary: An optional, very short summary of the result. Will be displayed in the status bar if provided.
declare type MatcherResult = {
  errorMessage?: string;
  problems: Array<Problem>;
  summary?: string | typeof undefined;
  summaryRenderer?: SummaryRenderer | typeof undefined;
};

// Now allowed to throw.
declare type Matcher = (input: string) => MatcherResult;

declare interface TaskExecutor {
  // Never throws
  run(task: TaskConfig): Promise<string>;
}

declare type WatcherOptions = {
  watchedFolder: string;
  includes: string[]; // globs
};

// UI-Stuff
declare type UI$Size = { width: number; height: number; };
declare type UI$Point = { x: number; y: number; };
declare type UI$Rect = {
  origin: UI$Point;
  size: UI$Size;
};

declare type TerminalUIInterface$RawKeyEventHandler = (name: string) => void;

declare class Rect {};

declare interface TerminalUIInterface {
  text(text: string): void;
  eraseRect(rect: UI$Rect): void;
  clear(): void;
  eraseLine(): void;
  processExit(exitCode: number): void;
  moveTo(point: UI$Point): void;
  moveToNextLine(): void;
  saveCursor(): void;
  restoreCursor(): void;
  styleReset(): void;
  defaultColor(text: string): void;
  setFullScreenEnabled(fullscreen: boolean): void;
  setGrabInputEnabled(grab: boolean): void;
  setCursorVisible(visible: boolean): void;
  setWindowTitle(title: string): void;

  // Events
  onResize(cb: () => void): void;
  // name works like this:
  // If length of name == 1 then it represents a regular character.
  // If length of name > 1 then it represents a 'well known' key code.
  // See termkit for more information.
  onRawKeyEvent(cb: (name: string) => void): void;


  // Styles
  setDimmed(dimmed: boolean): void;
  setInverse(inverse: boolean): void;
  setBold(bold: boolean): void;
  setForegroundColor(hex: string): void;
  setForegroundColorGreen(enabled: boolean): void;
  setForegroundColorRed(enabled: boolean): void;
  setForegroundColorGray(enabled: boolean): void;
  setForegroundColorWhite(enabled: boolean): void;
  setForegroundColorBlue(enabled: boolean): void;
  setBackgroundRed(enabled: boolean): void;
  setBackgroundGray(enabled: boolean): void;
  setBackgroundGreen(enabled: boolean): void;
  setBackgroundBrightWhite(enabled: boolean): void;

  // Misc
  +width: number;
  +height: number;
  +frame: UI$Rect;
};

type RenderFunction = (selected: boolean) => void;
