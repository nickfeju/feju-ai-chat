const actions=[
 {title:"Vandaag sturen",text:"Risico's, kansen en acties",prompt:"Welke risico's, kansen en managementacties verdienen vandaag de hoogste prioriteit?"},
 {title:"Klanten bellen",text:"Geprioriteerde accountlijst",prompt:"Welke klanten moet ik vandaag als eerste bellen?"},
 {title:"Wat veranderde?",text:"Verschillen sinds vorige analyse",prompt:"Wat is er veranderd sinds de vorige analyse?"},
 {title:"Vooruitblik",text:"Forecast en verwachtingen",prompt:"Geef een forecast voor omzet, marge en ticketdruk voor de komende maand"}
];
export function ExecutiveStart({onSelect}){return <section className="executive-start"><div><span className="eyebrow">Executive Copilot</span><h3>Start je managementdag</h3></div><div className="executive-start__grid">{actions.map(a=><button key={a.title} onClick={()=>onSelect({mode:"auto",prompt:a.prompt})}><strong>{a.title}</strong><small>{a.text}</small></button>)}</div></section>}
