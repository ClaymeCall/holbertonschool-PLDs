import { useEffect, useState } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { api } from "../api";

const DOCS = [
  { id: "PLAN_PROJET.md", label: "Plan du projet" },
  { id: "COMMANDES.md", label: "Commandes" },
  { id: "NOTIONS.md", label: "Notions Java" },
];

export function DocsView() {
  const [doc, setDoc] = useState("PLAN_PROJET.md");
  const [content, setContent] = useState("Chargement…");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    api
      .docs(doc)
      .then(setContent)
      .catch(() => setContent("Document indisponible."))
      .finally(() => setLoading(false));
  }, [doc]);

  return (
    <div className="page-fit-grid grid-cols-1 lg:grid-cols-12">
      <aside className="panel max-h-40 lg:col-span-3 lg:max-h-none">
        <div className="panel-header">
          <h2 className="font-display text-sm font-bold uppercase tracking-wider md:text-base">
            Manuel
          </h2>
        </div>
        <div className="panel-scroll flex flex-col gap-1 p-2">
          {DOCS.map((d) => (
            <button
              key={d.id}
              className={`btn justify-start py-1.5 text-xs md:py-2 md:text-sm ${
                doc === d.id ? "border-ember-500/50" : ""
              }`}
              onClick={() => setDoc(d.id)}
            >
              {d.label}
            </button>
          ))}
          <div className="mt-2 hidden space-y-2 border-t border-white/10 p-2 text-xs text-slate-400 lg:block">
            <p className="font-medium text-slate-200">Rappels</p>
            <ul className="space-y-1">
              <li>• Code dans <span className="mono text-ember-400">work/</span></li>
              <li>• <span className="mono">private/</span> lecture seule</li>
              <li>• Java 21 · javac</li>
            </ul>
          </div>
        </div>
      </aside>
      <article className="panel lg:col-span-9">
        <div className="panel-header">
          <h2 className="font-display text-sm font-bold uppercase tracking-wider md:text-base">
            {DOCS.find((d) => d.id === doc)?.label ?? doc}
          </h2>
          <span className="mono text-[10px] text-slate-500">{doc}</span>
        </div>
        <div className="markdown-body panel-scroll p-4 md:p-6">
          {loading ? (
            <p className="text-slate-500">Chargement du manuel…</p>
          ) : (
            <ReactMarkdown remarkPlugins={[remarkGfm]}>{content}</ReactMarkdown>
          )}
        </div>
      </article>
    </div>
  );
}
