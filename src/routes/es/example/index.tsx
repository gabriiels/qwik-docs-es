import { component$ } from "@builder.io/qwik";
import { routeLoader$ } from "@builder.io/qwik-city";
import fs from "fs-extra";

//  Levantar el servidor de traduccion
async function translate(text: string): Promise<string> {
  const res = await fetch("http://localhost:5000/translate", {
    method: "POST",
    body: JSON.stringify({
      q: text,
      source: "en",
      target: "es",
    }),
    headers: { "Content-Type": "application/json" },
  });

  const json = await res.json();
  return json.translatedText;
}
const useTranslate = routeLoader$(async () => {
  try {
    const fileContent: string = fs.readFileSync(
      "src/traducir/index.mdx",
      "utf8"
    );
    const regex = /(<[^>]*>)|(^import\s.*$)/gm;
    const splitContent = fileContent
      .split(regex)
      .filter((part) => part == "" || part !== undefined);
    let text = "";
    for (const element of splitContent) {
      if (element.includes("<") || element.includes("import")) {
        text += element;
      } else {
        text += await translate(element);
      }
    }
    const filePath = "src/traducido/index.mdx";
    if (!fs.existsSync(filePath)) {
      fs.writeFileSync(filePath, text);
      console.log(`Archivo creado en: ${filePath}`);
    } else {
      console.log(`El archivo ${filePath} ya existe.`);
    }
    return text;
  } catch (error) {
    console.error(error);
  } finally {
    console.warn("Finalizo");
  }
});

export default component$(() => {
  const translate = useTranslate();
  // return <div dangerouslySetInnerHTML={translate.value}></div>;
  return <div></div>;
});
