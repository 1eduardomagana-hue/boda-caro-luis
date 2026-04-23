import { COLORS } from '../lib/constants.js'
import { PageHeader } from '../components/UI.jsx'

const C = COLORS

const CONTENT = {
  logistica: {
    title: 'Logística del día',
    subtitle: 'Plan de horarios, traslados y responsables',
    plan: [
      ['08:00','Getting ready Caro','Hotel Chablé — Miriam Bernal + equipo'],
      ['10:00','Luis + chambelanes','Fotos previas en quinta'],
      ['12:00','Entrega flores','Monse llega a Quinta Montes Molina'],
      ['14:00','Montaje final salón','Catering + decoración'],
      ['15:30','Padrinos en parroquia','Llegada anticipada'],
      ['16:00','CEREMONIA RELIGIOSA','Parroquia del Carmen'],
      ['17:15','Fotos exteriores','Jardines parroquia'],
      ['17:45','Traslado a quinta','Todos hacia Quinta Montes Molina'],
      ['18:30','Llegada invitados','Coctelera jardín + cuarteto de cuerdas'],
      ['19:30','Entrada novios','Salón principal'],
      ['20:00','CENA','3 tiempos · La Mesa Ideal'],
      ['21:30','Primer baile','Vals · Papás'],
      ['23:00','Hora loca','DJ Ariel toma el control'],
      ['02:00','Fin de evento','Traslados disponibles'],
    ]
  },
  fotos: {
    title: 'Fotos, sesiones y contenido',
    subtitle: 'Plan fotográfico completo de la boda',
    shots: [
      'Caro sola: detalle vestido, anillos, zapatos, bouquet',
      'Caro con mamá — momento getting ready',
      'Caro con damas de honor (grupo + individual)',
      'First look con Luis',
      'Pareja: jardín quinta dorado al atardecer',
      'Pareja: pasillo de la parroquia',
      'Lanzamiento de bouquet',
      'Mesa principal con familia',
      'Detalle decoración: centro de mesas, altar',
      'Primer baile',
      'Brindis y corte de pastel',
    ]
  },
  week: {
    title: 'Week Planner',
    subtitle: 'La semana del 15 al 21 de noviembre de 2026',
    days: [
      {day:'Lun',date:'16 Nov',tasks:['Ensayo de misa 18:00h','Confirmar llegada de coro','Llamar a Quinta para montaje']},
      {day:'Mar',date:'17 Nov',tasks:['Recibir flores en Quinta','Última prueba maquillaje','Confirmar menú final con catering']},
      {day:'Mié',date:'18 Nov',tasks:['Llevar vestido a Quinta','Coordinar traslados vanes','Entregar kit damas de honor']},
      {day:'Jue',date:'19 Nov',tasks:['Prueba de sonido DJ Ariel 17:00h','Recepción familia de Luis','Confirmar room hotel']},
      {day:'Vie',date:'20 Nov',tasks:['☀️ Boda Civil 11:00h','Tiempo libre tarde','Cena íntima familia 20:00h']},
      {day:'Sáb',date:'21 Nov',tasks:['💐 Misa 16:00h','📸 Sesión fotos 17:30h','🥂 Banquete 18:30h','Brindis & baile']},
      {day:'Dom',date:'22 Nov',tasks:['Brunch familia hotel','Apertura de regalos','Traslado a luna de miel ✈️']},
    ]
  },
  eventos: {
    title: 'Eventos especiales',
    subtitle: 'Celebraciones previas y posteriores a la boda'
  },
  categorias: {
    title: 'Categorías personalizadas',
    subtitle: 'Organiza información adicional en categorías propias'
  }
}

export default function PlaceholderPage({ pageId }) {
  const info = CONTENT[pageId] || { title: pageId, subtitle: '' }

  if (pageId === 'logistica') return (
    <div>
      <PageHeader title={info.title} subtitle={info.subtitle} />
      <div style={{background:C.white,borderRadius:12,border:`1px solid rgba(196,175,160,.25)`,padding:'20px 24px'}}>
        <div style={{fontFamily:"'Cormorant Garamond',serif",fontSize:17,fontWeight:500,color:C.darkTaupe,marginBottom:14}}>Plan horario — 21 de noviembre</div>
        {info.plan.map(([t,e,d])=>(
          <div key={t} style={{display:'flex',gap:16,padding:'10px 0',borderBottom:`1px solid ${C.beige}`}}>
            <div style={{minWidth:50,fontSize:12,fontWeight:600,color:C.gold}}>{t}</div>
            <div>
              <div style={{fontSize:13,fontWeight:500,color:C.darkTaupe}}>{e}</div>
              <div style={{fontSize:11,color:C.textLight}}>{d}</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )

  if (pageId === 'fotos') return (
    <div>
      <PageHeader title={info.title} subtitle={info.subtitle} />
      <div style={{background:C.white,borderRadius:12,border:`1px solid rgba(196,175,160,.25)`,padding:'20px 24px'}}>
        <div style={{fontFamily:"'Cormorant Garamond',serif",fontSize:17,fontWeight:500,color:C.darkTaupe,marginBottom:14}}>Lista de shots obligatorios</div>
        {info.shots.map((s,i)=>(
          <div key={i} style={{display:'flex',gap:8,padding:'8px 0',borderBottom:`1px solid ${C.beige}`,fontSize:12.5,color:C.text}}>
            <span style={{color:C.champagne,fontSize:10,marginTop:2}}>◆</span>{s}
          </div>
        ))}
      </div>
    </div>
  )

  if (pageId === 'week') return (
    <div>
      <PageHeader title={info.title} subtitle={info.subtitle} />
      <div style={{display:'grid',gridTemplateColumns:'repeat(7,1fr)',gap:10}}>
        {info.days.map((d,i)=>(
          <div key={i} style={{background:C.white,borderRadius:10,padding:'14px 10px',border:`1px solid ${C.sand}`}}>
            <div style={{fontSize:10,letterSpacing:'1.5px',textTransform:'uppercase',color:C.taupe,marginBottom:4}}>{d.date}</div>
            <div style={{fontFamily:"'Cormorant Garamond',serif",fontSize:15,color:C.darkTaupe,fontWeight:500,marginBottom:8}}>{d.day}</div>
            <div style={{height:1,background:C.sand,marginBottom:8}} />
            {d.tasks.map((t,j)=>(
              <div key={j} style={{fontSize:11,color:C.text,padding:'5px 0',borderBottom:`1px solid ${C.beige}`}}>
                <span style={{display:'inline-block',width:5,height:5,borderRadius:'50%',background:C.champagne,marginRight:6,verticalAlign:'middle'}} />
                {t}
              </div>
            ))}
          </div>
        ))}
      </div>
    </div>
  )

  return (
    <div>
      <PageHeader title={info.title} subtitle={info.subtitle} />
      <div style={{background:C.white,borderRadius:12,border:`2px dashed ${C.sand}`,padding:'48px 32px',textAlign:'center'}}>
        <div style={{fontSize:32,marginBottom:12}}>✨</div>
        <div style={{fontFamily:"'Cormorant Garamond',serif",fontSize:20,color:C.darkTaupe,marginBottom:8}}>Sección disponible</div>
        <div style={{fontSize:13,color:C.textLight,maxWidth:400,margin:'0 auto',lineHeight:1.7}}>
          Usa el módulo <strong>Importar IA</strong> para agregar contenido a esta sección, o las <strong>Notas maestras</strong> para pegar información directamente.
        </div>
      </div>
    </div>
  )
}
