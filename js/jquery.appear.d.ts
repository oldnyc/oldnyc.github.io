// https://github.com/morr/jquery.appear/blob/master/index.js

interface AppearOptions {
  force_process: boolean;
  interval: number;
}

interface JQuery {
  appear(options: Partial<AppearOptions>): void;
}
