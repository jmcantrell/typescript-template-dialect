# typescript-template-dialect

A class for creating simple template dialects.

## Usage

### Browser or Deno

```js
import TemplateDialect from "https://esm.sh/@jmcantrell/template-dialect";
```

### Node

```bash
npm install @jmcantrell/template-dialect
```

```js
import TemplateDialect from "@jmcantrell/template-dialect";
```

### Example

```js
const dialect = new TemplateDialect("${", "}");
const greeting = dialect.compile("Hello, ${name}!");
console.log(greeting({ name: "you" })); // outputs: "Hello, you!"
```

## Behavior

For this section, `dialect` is assumed to have the following
definition:

```js
const dialect = new TemplateDialect("${", "}");
```

The dialect above will render strings containing placeholders that
look like `${name}`:

```js
const size = dialect.compile("${width}x${height}");
console.log(size(800, 600)); // outputs: "800x600"
```

Template strings with no placeholders will compile to a function that
simply returns the string unchanged.

For example:

```js
const greeting = dialect.compile("Hello!");
```

Is equivalent to:

```js
const greeting = () => "Hello!";
```

As you might expect, multiple instances of the same placeholder will
all be replaced:

```js
const thrice = dialect.compile("${value} ${value} ${value}");
console.log(thrice({ value: "yeah!" })); // outputs: "yeah! yeah! yeah!"
```

When passing options to templates, any missing options will render
those placeholders unchanged:

```js
const greeting = dialect.compile("Hello, ${name}!");
console.log(greeting()); // outputs: "Hello, ${name}!"
```

Similarly, if any passed options don't have a corresponding
placeholder, they will be ignored:

```js
const greeting = dialect.compile("Hello, ${name}!");
console.log(greeting({ bogus: "foo" })); // outputs: "Hello, ${name}!"
```

You can give any placeholder a default value that will be used if no
value is provided:

```js
const greeting = dialect.compile("Hello, ${name=you}!");
console.log(greeting()); // outputs: "Hello, you!"
```

## API

### Creating a template dialect

```js
const dialect = new TemplateDialect(prefix, suffix);
```

The constructor takes one argument that's expected to be an object
with two properties, `prefix` and `suffix`.

The `prefix` parameter should be a string that will be the left side
of a placeholder.

The `suffix` parameter should be a string that will be the right side
of a placeholder.

For example, passing parameters like "{" and "}" will mean that
placeholders in the template strings will be expected to look like
`{whatever}`.

### Compiling a template string

```js
const compiled = dialect.compile(string);
```

Once a template dialect is created, the typical usage is compiling one
or more template strings, and using those compiled templates to
quickly render output many times over the life of your program.
Compiling a template string means that all the hard work involved is
only done once so that rendering is as quick as possible.

The returned compiled template is simply a function that accepts an
object expected to contain placeholder values.

### Rendering a template string without compilation

```js
const rendered = dialect.render(string, options);
```

If you're testing a template string or know that it will only be used
once, you can render a string directly, skipping the compile step.

For example, the following two pieces of code produce the same output
string:

```js
const greeting = dialect.compile("Hello, ${name}!");
console.log(greeting({ name: "you" }));
```

```js
console.log(dialect.render("Hello, ${name}!", { name: "you" }));
```
