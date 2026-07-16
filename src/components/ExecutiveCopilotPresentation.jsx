function Severity({value}){return <span className={`exec-severity exec-severity--${value||"medium"}`}>{value||"medium"}</span>}
export function ExecutiveCopilotPresentation({data}){
 const copilot=data?.type==="executive-copilot"?data:data?.data?.type==="executive-copilot"?data.data:null;
 if(!copilot)return null; const signals=Array.isArray(copilot.signals)?copilot.signals:[];
 return <section className="executive-result">
  <div className="executive-result__kpis">
   <div><span>Signalen</span><strong>{copilot.metrics?.total??signals.length}</strong></div>
   <div><span>Kritiek</span><strong>{copilot.metrics?.critical??0}</strong></div>
   <div><span>Hoog</span><strong>{copilot.metrics?.high??0}</strong></div>
  </div>
  <div className="executive-signal-grid">{signals.slice(0,10).map((s,i)=><article className="executive-signal" key={s.id||`${s.companyId}-${i}`}>
   <div className="executive-signal__top"><strong>{i+1}. {s.companyName||"Portfolio"}</strong><Severity value={s.severity}/></div>
   <h4>{s.title}</h4><p>{Array.isArray(s.rationale)?s.rationale.join(" · "):s.rationale}</p>
   {s.actions?.[0]&&<div className="executive-action"><span>Actie</span>{s.actions[0]}</div>}
   {s.owner&&<small>Eigenaar: {s.owner}</small>}
  </article>)}</div>
 </section>;
}
