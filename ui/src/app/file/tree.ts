import JSZip, { JSZipObject } from "jszip";
import omitBy from "lodash/omitBy";
import find from 'lodash/find';
import get from "lodash/get";
import { sortBy } from "lodash";

export const OMIT = [
    /.git\//
];

const EXTENSION_MAP: { [key: string]: string } = {
    js: "javascript",
    md: "markdown",
    kt: "kotlin",
    kts: "kotlin",
    gradle: "groovy",
    groovy: "groovy",
    gitignore: "git",
    java: "java",
    xml: "xml",
    properties: "properties",
    html: "html",
    css: "css",
    Dockerfile: "docker",
    config: "properties",
    "java-version": "properties",
    ignore: "git",
    jar: "archive",
    war: "archive",
    gradlew: "groovy",
    dockerignore: "docker",
    gitattributes: "git",
    txt: "bash",
    sh: "bash",
    bat: "bash",
    yaml: "yaml",
    yml: "yaml",
    tpl: "markup",
    png: "image",
    jpg: "image",
    jpeg: "image",
    gif: "image",
};

/*

type Language =
    | "markup"
    | "bash"
    | "clike"
    | "c"
    | "cpp"
    | "css"
    | "javascript"
    | "jsx"
    | "coffeescript"
    | "actionscript"
    | "css-extr"
    | "diff"
    | "git"
    | "go"
    | "graphql"
    | "handlebars"
    | "json"
    | "less"
    | "makefile"
    | "markdown"
    | "objectivec"
    | "ocaml"
    | "python"
    | "reason"
    | "sass"
    | "scss"
    | "sql"
    | "stylus"
    | "tsx"
    | "typescript"
    | "wasm"
    | "yaml";

*/


export const getFileLanguage = (file: string = ""): string => {
    if (!file.includes(`.`)) {
        return "properties";
    }
    const extension: string = file.split(`.`).pop() || "";
    return get(EXTENSION_MAP, extension, "properties");
};


export interface FileTreeItem {
    name: string;
    type: string;
    path: string;
    children?: FileTreeItem[];
    content?: string;
}

export interface FileTree {
    selected: FileTreeItem;
    tree: FileTreeItem[];
}

export enum EntryType {
    FILE = 'file',
    FOLDER = 'folder',
}

function sort(t: FileTreeItem[]) {
    return sortBy(t, [
        (item: FileTreeItem) => item.type !== 'dir',
        (item: FileTreeItem) => item.name.toLowerCase()
    ]).map((i): FileTreeItem => {
        if (i.type === "dir" && i.children) {
            return ({
                ...i,
                children: sort(i.children)
            })
        }
        return i;
    });
}

async function arrangeIntoTree(paths: string[], zip: JSZip): Promise<FileTreeItem[]> {
    const tree: any = [];


    // console.log(paths);

    return new Promise(async (resolve) => {
        for(const path of paths) {
            const pathParts = path.split("/");

            // pathParts.shift();

            let currentLevel = tree;

            for (const part of pathParts) {

                if (!part) {
                    break;
                }

                const existingPath = find(currentLevel, {
                    name: part,
                });

                const file = zip.file(path);

                if (existingPath) {
                    currentLevel = existingPath.children;
                } else {
                    const newPart = file
                        ? {
                              name: part,
                              type: getFileLanguage(part),
                              path,
                              content: await file.async("string"),
                          }
                        : {
                              name: part,
                              type: 'dir',
                              path,
                              children: [],
                          };

                    currentLevel.push(newPart);
                    currentLevel = newPart.children;
                }
            }
        };

        resolve(sort(tree));
    });
}

export const getTree = (
    files: { [key: string]: JSZipObject },
    zip: JSZip
): Promise<FileTree> => {
    return new Promise(async (resolve) => {
        const sanitized = omitBy(files, (obj, path) => {
            return OMIT.some((reg) => reg.test(path));
        });

        const tree = await arrangeIntoTree(Object.keys(sanitized).map(k => `${k}`), zip);

        let selected = tree.find(i => i.name === 'build.gradle');
        if (!selected) {
            selected = tree.filter(i => i.type === 'dir')[0];
        }

        resolve({
            selected,
            tree,
        });
    });
};