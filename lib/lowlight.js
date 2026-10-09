import { createLowlight } from "lowlight";
import javascript from "highlight.js/lib/languages/javascript";
import typescript from "highlight.js/lib/languages/typescript";
import xml from "highlight.js/lib/languages/xml";
import css from "highlight.js/lib/languages/css";
import json from "highlight.js/lib/languages/json";
import python from "highlight.js/lib/languages/python";
import cpp from "highlight.js/lib/languages/cpp";
import sql from "highlight.js/lib/languages/sql";
import bash from "highlight.js/lib/languages/bash";

export const lowlight = createLowlight();

lowlight.register("javascript", javascript);
lowlight.register("js", javascript);
lowlight.register("jsx", javascript);
lowlight.register("typescript", typescript);
lowlight.register("ts", typescript);
lowlight.register("tsx", typescript);
lowlight.register("html", xml);
lowlight.register("xml", xml);
lowlight.register("css", css);
lowlight.register("json", json);
lowlight.register("python", python);
lowlight.register("py", python);
lowlight.register("cpp", cpp);
lowlight.register("c++", cpp);
lowlight.register("sql", sql);
lowlight.register("bash", bash);
lowlight.register("sh", bash);

export const SUPPORTED_LANGUAGES = [
  { label: "JavaScript", value: "javascript" },
  { label: "JSX / React", value: "jsx" },
  { label: "TypeScript", value: "typescript" },
  { label: "HTML", value: "html" },
  { label: "CSS", value: "css" },
  { label: "JSON", value: "json" },
  { label: "Python", value: "python" },
  { label: "C++", value: "cpp" },
  { label: "SQL", value: "sql" },
  { label: "Bash / Shell", value: "bash" },
];
