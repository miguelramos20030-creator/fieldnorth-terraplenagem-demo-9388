import { useEffect, useRef, useState } from "react";
import { ArrowUpRight, ArrowLeft, Check, Copy } from "lucide-react";
import { services, machines } from "./br-content";

export type PlannerEntry = { version: number; service?: number; machine?: string };
const empty = { city: "", locality: "", area: "", unit: "m²", goal: "", access: "" };
export function BrazilPlanner({ entry }: { entry: PlannerEntry }) {
  const [step, setStep] = useState(1);
  const [selected, setSelected] = useState<number[]>([]);
  const [machine, setMachine] = useState("Ainda não sei");
  const [details, setDetails] = useState(empty);
  const [error, setError] = useState("");
  const [copied, setCopied] = useState("");
  const heading = useRef<HTMLHeadingElement>(null);
  useEffect(() => {
    if (!entry.version) return;
    if (entry.service !== undefined)
      setSelected((s) => (s.includes(entry.service!) ? s : [...s, entry.service!]));
    if (entry.machine) setMachine(entry.machine);
    setStep(1);
    setError("");
    setCopied("");
    heading.current?.focus({ preventScroll: true });
  }, [entry]);
  function changeStep(next: number) {
    setStep(next);
    setError("");
    setCopied("");
    requestAnimationFrame(() => heading.current?.focus({ preventScroll: true }));
  }
  function next() {
    if (step === 1 && !selected.length) {
      setError("Selecione pelo menos um serviço.");
      return;
    }
    if (step === 2 && !details.city) {
      setError("Selecione uma cidade.");
      return;
    }
    if (step === 2 && !details.goal.trim()) {
      setError("Descreva o objetivo do trabalho.");
      return;
    }
    if (step === 2 && details.area && !(Number(details.area.replace(",", ".")) > 0)) {
      setError("Informe uma área maior que zero ou deixe em branco.");
      return;
    }
    changeStep(step + 1);
  }
  function sample() {
    setSelected((s) => (s.length ? s : [0, 1]));
    setDetails({
      city: "Cascavel",
      locality: "Localidade de exemplo",
      area: "500",
      unit: "m²",
      goal: "Preparar uma área para construção e avaliar uma vala de drenagem. Projeto fictício de exemplo.",
      access: "Acesso livre para máquinas",
    });
    changeStep(2);
  }
  function reset() {
    setSelected([]);
    setMachine("Ainda não sei");
    setDetails(empty);
    changeStep(1);
  }
  const summary = `FieldNorth — Resumo demonstrativo\nServiços: ${selected.map((i) => services[i].choice).join("; ")}\nMáquina: ${machine}\nCidade: ${details.city}\nBairro/localidade: ${details.locality || "Não informado"}\nÁrea aproximada: ${details.area ? `${details.area} ${details.unit}` : "Não informada"}\nAcesso: ${details.access || "Não informado"}\nObjetivo: ${details.goal}\nSimulação local. Nenhuma solicitação foi enviada ou salva. A execução depende da avaliação do local.`;
  async function copy() {
    try {
      await navigator.clipboard.writeText(summary);
      setCopied("Resumo copiado");
    } catch {
      setCopied("Não foi possível copiar automaticamente. Selecione e copie o resumo abaixo.");
    }
  }
  return (
    <section id="orcamento" className="planner-section section light">
      <div className="container planner-grid">
        <div className="planner-intro reveal">
          <span className="eyebrow">PLANEJE SEU PROJETO</span>
          <h2>Conte o que você precisa executar.</h2>
          <p>
            Demonstração interativa. Nenhuma solicitação será enviada ou salva. Use apenas dados de
            exemplo.
          </p>
          <button className="text-link" onClick={sample}>
            Usar projeto de exemplo <ArrowUpRight size={18} />
          </button>
          <div className="privacy-note">
            <Check size={18} />
            <span>Sem cadastro, dados pessoais ou envio.</span>
          </div>
        </div>
        <div className="planner-panel">
          <ol className="step-list" aria-label="Etapas do planejamento">
            {["Serviço", "Local", "Resumo"].map((label, i) => (
              <li
                key={label}
                aria-current={step === i + 1 ? "step" : undefined}
                className={step >= i + 1 ? "active" : ""}
              >
                <span>{i + 1}</span>
                {label}
              </li>
            ))}
          </ol>
          <h3 ref={heading} tabIndex={-1}>
            {step === 1
              ? "Qual é o serviço?"
              : step === 2
                ? "Como é o local?"
                : "Seu pedido, em resumo."}
          </h3>
          {step === 1 && (
            <>
              <fieldset>
                <legend>Selecione um ou mais serviços</legend>
                <div className="service-choices">
                  {services.map((s, i) => (
                    <label
                      key={s.choice}
                      className={selected.includes(i) ? "choice selected" : "choice"}
                    >
                      <input
                        type="checkbox"
                        aria-label={s.choice}
                        checked={selected.includes(i)}
                        onChange={() => {
                          setSelected((v) =>
                            v.includes(i) ? v.filter((n) => n !== i) : [...v, i],
                          );
                          setError("");
                        }}
                      />
                      <span>{s.choice}</span>
                    </label>
                  ))}
                </div>
              </fieldset>
              <fieldset className="machine-choice">
                <legend>
                  Já tem uma máquina em mente? <small>(opcional)</small>
                </legend>
                {[...machines.map((m) => m.title), "Ainda não sei"].map((m) => (
                  <label key={m}>
                    <input
                      type="radio"
                      name="machine"
                      aria-label={m}
                      checked={machine === m}
                      onChange={() => setMachine(m)}
                    />
                    {m}
                  </label>
                ))}
              </fieldset>
            </>
          )}
          {step === 2 && (
            <div className="form-fields">
              <label>
                Cidade <span aria-hidden="true">*</span>
                <select
                  aria-label="Cidade"
                  value={details.city}
                  onChange={(e) => setDetails({ ...details, city: e.target.value })}
                >
                  <option value="">Selecione a cidade</option>
                  {["Cascavel", "Toledo", "Outra cidade"].map((c) => (
                    <option key={c}>{c}</option>
                  ))}
                </select>
              </label>
              <label>
                Bairro ou localidade <small>(opcional)</small>
                <input
                  aria-label="Bairro ou localidade (opcional)"
                  value={details.locality}
                  maxLength={100}
                  onChange={(e) => setDetails({ ...details, locality: e.target.value })}
                  placeholder="Use uma localidade de exemplo"
                  autoComplete="off"
                />
              </label>
              <div className="area-fields">
                <label>
                  Área aproximada <small>(opcional)</small>
                  <input
                    aria-label="Área aproximada (opcional)"
                    inputMode="decimal"
                    value={details.area}
                    maxLength={12}
                    onChange={(e) => setDetails({ ...details, area: e.target.value })}
                    placeholder="Ex.: 500"
                  />
                </label>
                <label>
                  Unidade
                  <select
                    aria-label="Unidade"
                    value={details.unit}
                    onChange={(e) => setDetails({ ...details, unit: e.target.value })}
                  >
                    <option>m²</option>
                    <option>ha</option>
                  </select>
                </label>
              </div>
              <label>
                Como é o acesso para máquinas? <small>(opcional)</small>
                <select
                  aria-label="Como é o acesso para máquinas? (opcional)"
                  value={details.access}
                  onChange={(e) => setDetails({ ...details, access: e.target.value })}
                >
                  <option value="">Selecione uma opção</option>
                  <option>Acesso livre para máquinas</option>
                  <option>Acesso estreito ou com obstáculos</option>
                  <option>Ainda não sei</option>
                </select>
              </label>
              <label>
                O que você pretende fazer? <span aria-hidden="true">*</span>
                <textarea
                  aria-label="O que você pretende fazer?"
                  rows={3}
                  maxLength={1200}
                  value={details.goal}
                  onChange={(e) => setDetails({ ...details, goal: e.target.value })}
                  placeholder="Descreva o objetivo usando dados de exemplo."
                />
              </label>
              <small>* Campos necessários para montar o resumo.</small>
            </div>
          )}
          {step === 3 && (
            <>
              <dl className="summary-list">
                <div>
                  <dt>Serviços</dt>
                  <dd>{selected.map((i) => services[i].choice).join(" · ")}</dd>
                </div>
                <div>
                  <dt>Máquina</dt>
                  <dd>{machine}</dd>
                </div>
                <div>
                  <dt>Cidade e localidade</dt>
                  <dd>
                    {details.city}
                    {details.locality ? ` · ${details.locality}` : ""}
                  </dd>
                </div>
                <div>
                  <dt>Área aproximada</dt>
                  <dd>{details.area ? `${details.area} ${details.unit}` : "Não informada"}</dd>
                </div>
                <div>
                  <dt>Acesso</dt>
                  <dd>{details.access || "Não informado"}</dd>
                </div>
                <div>
                  <dt>Objetivo</dt>
                  <dd>{details.goal}</dd>
                </div>
              </dl>
              <p className="summary-disclaimer">
                Simulação local, sem envio ou reserva de máquina. A execução depende da avaliação do
                local.
              </p>
              <div className="planner-actions">
                <button className="button button-amber" onClick={copy}>
                  <Copy size={17} />
                  Copiar resumo
                </button>
                <button className="text-link" onClick={() => changeStep(2)}>
                  Editar pedido
                </button>
              </div>
              <output className="copy-status" aria-live="polite">
                {copied}
              </output>
              {copied.startsWith("Não") && (
                <textarea
                  aria-label="Resumo para copiar manualmente"
                  value={summary}
                  readOnly
                  rows={8}
                />
              )}
              <button className="text-link reset-button" onClick={reset}>
                Começar de novo
              </button>
            </>
          )}
          {error && (
            <p role="alert" className="form-error">
              {error}
            </p>
          )}
          {step < 3 && (
            <div className="planner-actions">
              {step === 2 && (
                <button className="text-link" onClick={() => changeStep(1)}>
                  <ArrowLeft size={16} />
                  Voltar
                </button>
              )}
              <button className="button button-forest" onClick={next}>
                {step === 1 ? "Continuar" : "Visualizar resumo"}
                <ArrowUpRight size={18} />
              </button>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
