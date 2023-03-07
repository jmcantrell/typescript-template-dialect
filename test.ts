import TemplateDialect, { TemplateParams } from "./mod.ts";
import { assertEquals } from "./deps_test.ts";

const styles = {
  javascript: ["${", "}"],
  mustache: ["{{", "}}"],
  windows: ["%", "%"],
};

for (const [style, [prefix, suffix]] of Object.entries(styles)) {
  const templater = new TemplateDialect(prefix, suffix);
  const slot = (name: string) => `${prefix}${name}${suffix}`;

  const testRender = (
    input: string,
    output: string,
    params?: TemplateParams,
  ) => {
    // uncompiled version
    assertEquals(output, templater.render(input, params));

    // compiled version
    const template = templater.compile(input);
    assertEquals(output, template(params));
  };

  Deno.test(`a ${style} style template`, async (t) => {
    await t.step("will render a regular string unchanged", () => {
      const s = "a b c";
      testRender(s, s);
    });

    await t.step("will render unchanged if no params are passed", () => {
      const s = `a ${slot("x")} c`;
      testRender(s, s);
    });

    await t.step(
      "will render unchanged if params don't match placeholders",
      () => {
        const s = `a ${slot("x")} c`;
        testRender(s, s, { bogus: "doesn't matter" });
      },
    );

    await t.step("will treat null and undefined as missing", () => {
      const s = `a ${slot("x")} c`;
      for (const value of [null, undefined]) {
        testRender(s, s, { x: value });
      }
    });

    await t.step("will substitute multiple placeholders", () => {
      testRender(`a ${slot("x")} c ${slot("y")} e`, "a b c d e", {
        x: "b",
        y: "d",
      });
    });

    await t.step(
      "will only substitute placeholders that exist in params",
      () => {
        const s = `a ${slot("x")} b`;
        testRender(s, s, { y: "doesn't matter" });
      },
    );

    await t.step(
      "will substitute multiple occurrences of a placeholder",
      () => {
        testRender(`a ${slot("x")} a ${slot("x")} a`, "a b a b a", { x: "b" });
      },
    );

    await t.step(
      "will use default values",
      () => {
        testRender(
          `a ${slot("x=b")} c ${slot("x=d")} e`,
          "a b c d e",
        );
      },
    );

    await t.step("will prefer params to default values", () => {
      testRender(`a ${slot("x=b")} a`, "a a a", { x: "a" });
    });
  });
}
