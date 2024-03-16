# @ocelotjungle/logger
This package provides a Logger class with configurable outputs and levels, and ability to create subloggers.

---

## Usage

### Constructor
It takes either nothing or just logger name or an options object:
- `name` is a name of a logger;
- `options`:
  - `dateFormatter` is a function that stringifies Date, can be one of presets or custom;
  - `levels` can be:
    - max level that is written to logs (for example, `error`, then warnings, info etc won't be printed);
    - object with explicitly defined levels;
  - `unite` - if `true`, then all outputs are accumulated till you use `end()`;
  - `defaultLogOptions` is a log options that are applied to every log by default;

### Methods

#### `withConsole`
Adds console to logger outputs. Can be default (`global.console`) or custom.

#### `withFiles`
Adds files to logger outputs:
- `folder` is an absolute path where logs will be written;
- `name` is a left log files name (`*name*(.suffix)?.extension`);
- `extension` is a log files extension (`name(.suffix)?.*extension*`);
- `levels` is similar to `constructor`'s options `levels`, except `common` level, which is general file for all logs;

#### Logging functions
- `error` - level 1, errors;
- `warn` - level 2, warnings;
- `info` - level 3, info messages;
- `dev` - level 4, info messages for development/debugging;
- `end` - frees accumulated messages if `unite`, else does nothing;

#### Utils
- `sub` - creates sublogger, copying the master logger parameters;
- `bound` - returns a scope of logger functions, bound to the logger;

## Examples
```ts
const logger = new Logger("master logger").withConsole()
logger.info("sample info message") // [iso-datetime] (master logger) ||| sample info message

const sublogger = logger.sub("sublogger", unite = true)
const { dev, env } = sublogger
dev("dev message 1") // prints nothing
dev("dev message 2") // prints nothing
end() // prints both previous messages in one operation, not broken my any other logger intermediate output

const subsublogger = sublogger.sub("subsublogger", unite = false, { depth: null })
subsublogger.error({ foo: { bar: { ... } } }) // prints argument inspected with no depth constraint, as console.dir(..., { depth: null }) would
```
