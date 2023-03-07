// Regular expression to find characters that are special to regular expressions.
const regexp_special = new RegExp(String.raw`[\[\\\^\$\.\|\?\*\+\(\)]`, "g");

// Function to escape said special characters for use in a regular expression.
function escape_regexp(s: string) {
  return s.replace(regexp_special, (match) => `\\${match}`);
}

export type TemplateParams = Record<string, string | null | undefined>;
export type CompiledTemplate = (params?: TemplateParams) => string;

/** Represents a template style */
export default class TemplateDialect {
  prefix: string;
  suffix: string;
  regexp: RegExp;

  /**
   * Create a template style
   * @constructor
   * @param {string} prefix - Placeholder starting marker
   * @param {string} suffix - Placeholder ending marker
   */
  constructor(prefix: string, suffix: string) {
    this.prefix = prefix;
    this.suffix = suffix;

    // Regular expression to find placeholders in template strings.
    this.regexp = new RegExp(
      `(${escape_regexp(prefix)}.*?${escape_regexp(suffix)})`,
    );
  }

  /**
   * Create a compiled instance of this template style
   * @param {string} text - Template content
   * @returns {CompiledTemplate}
   */
  compile(text: string): CompiledTemplate {
    // Turn the template string into an array of placeholders and everything else.
    // A template string like: "Hello, ${name}! How are you?"
    // Will produce: ["Hello, ", "${name}", "! How are you?"];
    const tokens = text.split(this.regexp);

    // This will map placeholder names to indexes in array above.
    // The above template string will produce a single entry that maps "name" to [1].
    const placeholders = new Map<string, Array<[number, string]>>();

    let count = 0;

    for (let index = 0; index < tokens.length; index++) {
      const token = tokens[index];

      if (token.startsWith(this.prefix) && token.endsWith(this.suffix)) {
        const placeholder = token
          .slice(this.prefix.length, token.length - this.suffix.length)
          .trim();

        const [name, value] = placeholder.split("=");

        if (!name || name.length == 0) {
          throw new Error(`placeholder number ${count} has no name`);
        }

        if (!placeholders.has(name)) placeholders.set(name, []);
        placeholders.get(name)!.push([index, value]);

        count += 1;
      }
    }

    // If the template string had no placeholders, then it's not necessary to do any work.
    if (placeholders.size === 0) return () => text;

    return (params?: TemplateParams) => {
      const parts = tokens.slice();

      for (const [name, index_defaults] of placeholders.entries()) {
        for (const [index, default_value] of index_defaults) {
          parts[index] = params?.[name] || default_value || parts[index];
        }
      }

      return parts.join("");
    };
  }

  /**
   * Quickly render a template
   * @param {string} text - Template content
   * @param {TemplateParams} params - Template parameters
   * @returns {string} The rendered template
   */
  render(text: string, params?: TemplateParams): string {
    return this.compile(text)(params);
  }
}
