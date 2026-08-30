import type { Proceso } from "./types";

export const EMPRESA = {
  nombre: "Nordia Logística S.A.",
  descripcion:
    "Operador logístico de distribución urbana con flota propia, tráfico diario programado y liquidación quincenal de choferes.",
  consultora: "Repositorio de Procesos",
};

/* ------------------------------------------------------------------ *
 * PRO-01 · Gestión de Tráfico
 * ------------------------------------------------------------------ */

const gestionTrafico: Proceso = {
  slug: "gestion-de-trafico",
  codigo: "PRO-01",
  nombre: "Gestión de Tráfico",
  area: "Operaciones",
  resumen:
    "Planificación y confirmación diaria de los servicios de distribución: se parte de la semana tipo cargada en el TMS, se cruza con la disponibilidad real de flota y choferes, y se confirma con clientes y choferes el trabajo del día siguiente.",
  objetivo:
    "Garantizar que cada mañana exista una programación confirmada y sin conflictos entre servicios comprometidos, vehículos disponibles y choferes asignados, y que todo cambio quede registrado en el TMS antes del cierre operativo.",
  dueno: "Martín Paz — Coordinación de Tráfico",
  frecuencia: "Diaria · ciclo 08:00 a 16:00",
  disparador: "Inicio de la jornada operativa (08:00) sobre la semana tipo vigente.",
  resultado:
    "Programación del día siguiente confirmada, comunicada a clientes y choferes, y reflejada en el TMS.",
  sistemas: ["TMS Central", "Portal Flota", "Planilla maestra", "Correo electrónico"],
  participantes: [
    { nombre: "Martín Paz", rol: "Coordinador de Tráfico" },
    { nombre: "Nicolás Bravo", rol: "Coordinador de Tráfico" },
    { nombre: "Chofer", rol: "Ejecuta el servicio asignado" },
    { nombre: "Cliente", rol: "Confirma o modifica los servicios del día" },
  ],
  indicadores: [
    { etiqueta: "Clientes activos", valor: "22" },
    { etiqueta: "Clientes de demanda variable", valor: "~7 de 22" },
    { etiqueta: "Comunicaciones diarias", valor: "4 tandas" },
    { etiqueta: "Ventana operativa", valor: "08:00 – 16:00" },
  ],
  lanes: [
    { id: "tms", label: "TMS Central", sublabel: "Sistema de gestión", kind: "sistema" },
    { id: "coord", label: "Coordinación de Tráfico", sublabel: "Martín Paz / Nicolás Bravo", kind: "persona" },
    { id: "portal", label: "Portal Flota", sublabel: "Aplicación interna", kind: "sistema" },
    { id: "chofer", label: "Chofer", kind: "persona" },
    { id: "cliente", label: "Cliente", kind: "externo" },
  ],
  nodes: [
    { id: "t1", label: "Inicio", kind: "inicio", lane: "tms", col: 0 },
    { id: "t2", label: "Semana tipo", kind: "datos", lane: "tms", col: 1 },
    { id: "t3", label: "Exporta semana tipo del TMS", kind: "tarea", lane: "coord", col: 1 },
    { id: "t4", label: "Exporta información de flota y choferes", kind: "tarea", lane: "portal", col: 1 },
    { id: "t5", label: "Cruza información", kind: "tarea", lane: "coord", col: 2 },
    { id: "t6", label: "Envía emails a clientes y choferes", kind: "tarea", lane: "portal", col: 2 },
    { id: "t7", label: "¿Cambios?", kind: "decision", lane: "chofer", col: 3 },
    { id: "t8", label: "Completa formulario", kind: "tarea", lane: "chofer", col: 4 },
    { id: "t9", label: "¿Cambios?", kind: "decision", lane: "cliente", col: 3 },
    { id: "t10", label: "Completa formulario", kind: "tarea", lane: "cliente", col: 4 },
    { id: "t11", label: "Cambio en el panel de la app", kind: "tarea", lane: "portal", col: 5 },
    { id: "t12", label: "Ajusta cambios en el TMS", kind: "tarea", lane: "coord", col: 5 },
    { id: "t13", label: "Fin", kind: "fin", lane: "cliente", col: 6 },
  ],
  edges: [
    { from: "t1", to: "t2", route: "h" },
    { from: "t2", to: "t3", route: "v" },
    { from: "t3", to: "t4", route: "v" },
    { from: "t4", to: "t5", route: "jog", offset: 30 },
    { from: "t5", to: "t6", route: "v" },
    { from: "t6", to: "t7", route: "vh" },
    { from: "t6", to: "t9", route: "vh" },
    { from: "t7", to: "t8", label: "Sí", route: "h" },
    { from: "t9", to: "t10", label: "Sí", route: "h" },
    { from: "t7", to: "t13", label: "No", route: "around", side: "bottom", offset: 46 },
    { from: "t9", to: "t13", label: "No", route: "around", side: "bottom", offset: 46 },
    { from: "t8", to: "t11", route: "hv" },
    { from: "t10", to: "t11", route: "hv" },
    { from: "t11", to: "t12", route: "v" },
    { from: "t12", to: "t13", route: "hv" },
  ],
  pasos: [
    {
      id: "t1",
      titulo: "Inicio del ciclo diario",
      responsable: "Automático",
      sistema: "TMS Central",
      duracion: "—",
      descripcion:
        "El ciclo arranca cada día hábil a las 08:00 sobre la programación vigente. No requiere intervención manual: el punto de partida es siempre la semana tipo ya cargada en el TMS.",
      salidas: ["Ciclo de planificación abierto para el día siguiente"],
      reglas: ["La ventana operativa del proceso es 08:00 a 16:00.", "Fuera de esa ventana rige el esquema de guardia."],
    },
    {
      id: "t2",
      titulo: "Semana tipo",
      responsable: "TMS Central",
      sistema: "TMS Central",
      descripcion:
        "Repositorio de la programación recurrente de cada cliente: qué servicios tiene contratados, en qué días y con qué horarios. Es la base sobre la que se construye la programación diaria.",
      salidas: ["Programación base del día siguiente"],
      reglas: [
        "Los clientes estáticos ejecutan su semana tipo sin variación y no reciben notificaciones.",
        "Los clientes de demanda variable (~7 de 22) requieren confirmación diaria.",
      ],
      dolor: "La semana tipo se mantiene manualmente; cuando un cliente cambia su patrón, la actualización depende de que alguien lo recuerde.",
    },
    {
      id: "t3",
      titulo: "Exporta semana tipo del TMS",
      responsable: "Martín Paz / Nicolás Bravo",
      sistema: "TMS Central",
      duracion: "~10 min",
      descripcion:
        "El coordinador de tráfico exporta desde el TMS la programación prevista para el día siguiente y la baja a la planilla de trabajo.",
      entradas: ["Semana tipo vigente en el TMS"],
      salidas: ["Export de servicios planificados"],
      dolor: "Exportación manual, sin integración: cualquier cambio posterior en el TMS no se refleja en el archivo ya descargado.",
      oportunidad: "Reemplazar la exportación manual por una sincronización automática entre el TMS y el Portal Flota.",
    },
    {
      id: "t4",
      titulo: "Exporta información de flota y choferes",
      responsable: "Portal Flota",
      sistema: "Portal Flota",
      duracion: "~5 min",
      descripcion:
        "Se obtiene del Portal Flota la disponibilidad real del día: vehículos operativos, vehículos en taller, choferes activos, licencias y ausencias previstas.",
      entradas: ["Base de choferes", "Base de vehículos", "Tabla de asignación chofer–vehículo"],
      salidas: ["Listado de recursos disponibles"],
      reglas: ["Un vehículo marcado en taller queda excluido automáticamente de la asignación."],
    },
    {
      id: "t5",
      titulo: "Cruza información",
      responsable: "Martín Paz / Nicolás Bravo",
      sistema: "Planilla maestra",
      duracion: "30 – 45 min",
      descripcion:
        "El coordinador cruza los servicios comprometidos con la disponibilidad real de flota y choferes, resuelve los conflictos (superposiciones, vehículos fuera de servicio, choferes sin asignación) y arma la programación definitiva del día siguiente.",
      entradas: ["Export de servicios planificados", "Listado de recursos disponibles"],
      salidas: ["Programación diaria consolidada", "Asignación chofer–vehículo–cliente"],
      reglas: [
        "Si el día siguiente es feriado, la planilla maestra se tilda con el checkbox de feriado y se dispara la consulta de disponibilidad al chofer.",
        "Los viernes la programación cubre sábado y lunes.",
      ],
      dolor: "Es el cuello de botella del proceso: depende del criterio y la memoria del coordinador, y no queda registro de por qué se resolvió cada conflicto.",
      oportunidad: "Motor de asignación asistido que proponga la combinación chofer–vehículo–servicio y deje al coordinador sólo las excepciones.",
    },
    {
      id: "t6",
      titulo: "Envía emails a clientes y choferes",
      responsable: "Portal Flota",
      sistema: "Portal Flota · Correo electrónico",
      duracion: "Automático",
      descripcion:
        "El Portal Flota dispara cuatro tandas de comunicaciones a lo largo del día. Cada email incluye el detalle del servicio y un link al formulario de cambios, que es el único canal habilitado para modificar la programación dentro de la ventana operativa.",
      entradas: ["Programación diaria consolidada"],
      salidas: ["Emails enviados a clientes y choferes", "Formularios de cambio habilitados"],
      hitos: [
        { hora: "09:00", texto: "Email a clientes con los servicios planificados + link al formulario de cambios." },
        { hora: "12:00", texto: "Email a clientes de demanda variable (~7 de 22) ofreciendo servicios adicionales." },
        { hora: "15:00", texto: "Email de confirmación a clientes: servicios, horarios y choferes asignados + formulario." },
        { hora: "15:00", texto: "Confirmación a choferes: trabajo asignado para el día siguiente (empresas y horarios) + formulario." },
      ],
      reglas: [
        "El cliente estático no recibe ninguna notificación.",
        "Los viernes se envía un doble mensaje que cubre sábado y lunes; el formulario aplica al lunes.",
      ],
      oportunidad: "Consolidar las cuatro tandas en un panel de estado en vivo, para que el cliente vea su programación sin depender del email.",
    },
    {
      id: "t7",
      titulo: "¿El chofer solicita cambios?",
      responsable: "Chofer",
      sistema: "Portal Flota",
      descripcion:
        "Al recibir la confirmación de las 15:00, el chofer revisa el trabajo asignado para el día siguiente y decide si necesita informar alguna modificación.",
      reglas: [
        "El formulario es el canal formal; los pedidos por otros medios no quedan registrados.",
        "Las incidencias del chofer (enfermedad, vehículo en taller) se reportan por el canal abierto y el coordinador replanifica.",
      ],
    },
    {
      id: "t8",
      titulo: "Completa formulario (chofer)",
      responsable: "Chofer",
      sistema: "Portal Flota",
      duracion: "~3 min",
      descripcion:
        "El chofer carga el cambio solicitado en el formulario enlazado en el email: indisponibilidad, cambio de horario, problema con el vehículo asignado o cualquier otra novedad que afecte el servicio.",
      salidas: ["Solicitud de cambio registrada"],
    },
    {
      id: "t9",
      titulo: "¿El cliente solicita cambios?",
      responsable: "Cliente",
      sistema: "Portal Flota",
      descripcion:
        "El cliente revisa los servicios planificados y confirma o solicita modificaciones a través del formulario enlazado en el email.",
      reglas: ["Sólo se aceptan cambios dentro de la ventana 08:00 – 16:00."],
      dolor: "Los clientes que responden por email en lugar de usar el formulario obligan a una carga manual adicional.",
    },
    {
      id: "t10",
      titulo: "Completa formulario (cliente)",
      responsable: "Cliente",
      sistema: "Portal Flota",
      duracion: "~3 min",
      descripcion:
        "El cliente carga el cambio en el formulario: alta de un servicio adicional, cancelación, cambio de horario o de dirección de entrega.",
      salidas: ["Solicitud de cambio registrada"],
    },
    {
      id: "t11",
      titulo: "Cambio en el panel de la app",
      responsable: "Portal Flota",
      sistema: "Portal Flota",
      descripcion:
        "Toda solicitud enviada por formulario impacta en el panel del Portal Flota, donde el coordinador ve en un único lugar los cambios pendientes de aplicar.",
      entradas: ["Solicitudes de cambio de clientes y choferes"],
      salidas: ["Cola de cambios pendientes"],
      oportunidad: "Alertar al coordinador en tiempo real cuando entra un cambio, en lugar de depender de que revise el panel.",
    },
    {
      id: "t12",
      titulo: "Ajusta cambios en el TMS",
      responsable: "Martín Paz / Nicolás Bravo",
      sistema: "TMS Central",
      duracion: "15 – 30 min",
      descripcion:
        "El coordinador toma los cambios del panel y los replica manualmente en el TMS, que es el sistema de registro para facturación y para la liquidación de choferes.",
      entradas: ["Cola de cambios pendientes"],
      salidas: ["Programación actualizada en el TMS"],
      dolor: "Doble carga: el cambio se registra en el Portal Flota y se vuelve a cargar en el TMS. Es el punto donde más se pierden modificaciones.",
      oportunidad: "Integración bidireccional Portal Flota ↔ TMS para eliminar la recarga manual.",
    },
    {
      id: "t13",
      titulo: "Fin del ciclo",
      responsable: "—",
      sistema: "—",
      descripcion:
        "El ciclo cierra cuando la programación del día siguiente queda confirmada y reflejada en el TMS. Si no hubo cambios, cierra directamente tras la confirmación de las 15:00.",
    },
  ],
  excepciones: [
    { titulo: "Cliente estático", detalle: "No recibe ninguna notificación; su semana tipo se ejecuta sin cambios." },
    { titulo: "Viernes", detalle: "Doble mensaje cubriendo sábado y lunes; el formulario aplica al lunes." },
    { titulo: "Feriados", detalle: "La planilla maestra tiene un checkbox de feriado; al tildarlo se dispara un email al chofer preguntando disponibilidad." },
    { titulo: "Incidencia del chofer", detalle: "Enfermedad o vehículo en taller: el chofer reporta por el canal abierto y el coordinador replanifica." },
    { titulo: "Urgencia fuera de 08:00 – 16:00", detalle: "Por ejemplo una rotura a las 06:30. No pasa por la app: la atiende el coordinador de guardia por teléfono (esquema de guardias / contingencia)." },
    { titulo: "Viaje no cerrado en el TMS", detalle: "Se dispara una alerta automática al chofer; tras 3 avisos sin respuesta, el 4° escala a Administración." },
  ],
  oportunidades: [
    { titulo: "Integración Portal Flota ↔ TMS", detalle: "Eliminar la recarga manual de cambios y las exportaciones de semana tipo. Es el punto de mayor pérdida de información del proceso.", impacto: "Alto", esfuerzo: "Alto" },
    { titulo: "Asignación asistida de recursos", detalle: "Proponer automáticamente la combinación chofer–vehículo–servicio y dejar al coordinador sólo las excepciones.", impacto: "Alto", esfuerzo: "Medio" },
    { titulo: "Panel de estado para el cliente", detalle: "Reemplazar las cuatro tandas de email por un panel en vivo con confirmación en línea.", impacto: "Medio", esfuerzo: "Medio" },
    { titulo: "Alertas en tiempo real de cambios", detalle: "Notificar al coordinador cuando entra una solicitud, en vez de depender de la revisión del panel.", impacto: "Medio", esfuerzo: "Bajo" },
  ],
};

/* ------------------------------------------------------------------ *
 * PRO-02 · Control de Patentes y Mantenimiento de Flota
 * ------------------------------------------------------------------ */

const controlPatentes: Proceso = {
  slug: "control-de-patentes",
  codigo: "PRO-02",
  nombre: "Control de Patentes y Mantenimiento",
  area: "Flota",
  resumen:
    "Control del cumplimiento documental y del mantenimiento preventivo de la flota. Combina dos hilos: la gestión de vencimientos de patente con agenda de turnos, y el relevamiento quincenal de kilometraje y cambio de aceite declarado por cada chofer.",
  objetivo:
    "Que ningún vehículo circule con documentación vencida y que el mantenimiento preventivo se dispare por kilometraje real y no por estimación.",
  dueno: "Ana Torres — Administración de Flota",
  frecuencia: "Continuo (vencimientos) · cada 15 días (relevamiento de km)",
  disparador: "Vencimiento de patente próximo registrado en el sistema, o ciclo quincenal de relevamiento.",
  resultado: "Documentación al día, turnos gestionados y kilometraje validado por vehículo.",
  sistemas: ["Portal Flota", "Correo electrónico", "Formulario de relevamiento"],
  participantes: [
    { nombre: "Ana Torres", rol: "Administración de Flota" },
    { nombre: "Chofer", rol: "Declara kilometraje y último cambio de aceite" },
    { nombre: "Portal Flota", rol: "Dispara alertas y consolida la información" },
  ],
  indicadores: [
    { etiqueta: "Ciclo de relevamiento", valor: "15 días" },
    { etiqueta: "Datos por formulario", valor: "3 campos" },
    { etiqueta: "Hilos del proceso", valor: "2" },
    { etiqueta: "Visibilidad del chofer", valor: "Sólo su vehículo" },
  ],
  lanes: [
    { id: "portal", label: "Portal Flota", sublabel: "Aplicación interna", kind: "sistema", rows: 2 },
    { id: "chofer", label: "Chofer", kind: "persona" },
    { id: "admin", label: "Administración de Flota", sublabel: "Ana Torres", kind: "persona", rows: 2 },
  ],
  nodes: [
    { id: "p1", label: "Inicio", kind: "inicio", lane: "portal", col: 0, row: 0 },
    { id: "p2", label: "Vencimiento de patente registrado", kind: "tarea", lane: "portal", col: 1, row: 0 },
    { id: "p3", label: "Envía alerta por vencimiento", kind: "tarea", lane: "portal", col: 2, row: 0 },
    { id: "p4", label: "¿Urgente?", kind: "decision", lane: "admin", col: 2, row: 0 },
    { id: "p5", label: "Agenda turno por anticipación", kind: "tarea", lane: "admin", col: 0, row: 0 },
    { id: "p6", label: "Agenda turno inmediato", kind: "tarea", lane: "admin", col: 3, row: 0 },
    { id: "p7", label: "Recibe resolución", kind: "tarea", lane: "admin", col: 4, row: 0 },
    { id: "p8", label: "Información actualizada", kind: "datos", lane: "portal", col: 4, row: 0 },
    { id: "p9", label: "Envía email al chofer con formulario", kind: "tarea", lane: "portal", col: 1, row: 1 },
    { id: "p10", label: "Completa formulario", kind: "tarea", lane: "chofer", col: 1 },
    { id: "p11", label: "¿Km mayor al anterior?", kind: "decision", lane: "admin", col: 1, row: 1 },
    { id: "p12", label: "Dato registrado", kind: "tarea", lane: "admin", col: 0, row: 1 },
    { id: "p13", label: "Contacta al chofer", kind: "tarea", lane: "admin", col: 2, row: 1 },
    { id: "p14", label: "Marca como inconsistente", kind: "tarea", lane: "portal", col: 3, row: 1 },
    { id: "p15", label: "Información corregida", kind: "tarea", lane: "portal", col: 4, row: 1 },
    { id: "p16", label: "Fin", kind: "fin", lane: "admin", col: 5, row: 1 },
  ],
  edges: [
    { from: "p1", to: "p2", route: "h" },
    { from: "p2", to: "p3", route: "h" },
    { from: "p3", to: "p4", route: "v" },
    { from: "p4", to: "p5", label: "No", route: "h" },
    { from: "p4", to: "p6", label: "Sí", route: "h" },
    { from: "p6", to: "p7", route: "h" },
    { from: "p5", to: "p7", route: "around", side: "bottom", offset: 44 },
    { from: "p7", to: "p8", route: "v" },
    { from: "p8", to: "p16", route: "around", side: "bottom", offset: 40 },
    { from: "p1", to: "p9", label: "Cada 15 días", route: "around", side: "bottom", offset: 40 },
    { from: "p9", to: "p10", route: "v" },
    { from: "p10", to: "p11", route: "v" },
    { from: "p11", to: "p12", label: "No", route: "h", variant: "retorno" },
    { from: "p11", to: "p13", label: "Sí", route: "h" },
    { from: "p13", to: "p14", route: "hv" },
    { from: "p14", to: "p15", route: "h" },
    { from: "p15", to: "p16", route: "hv" },
    { from: "p12", to: "p16", route: "around", side: "bottom", offset: 44 },
  ],
  pasos: [
    {
      id: "p1",
      titulo: "Inicio",
      responsable: "Portal Flota",
      sistema: "Portal Flota",
      descripcion:
        "El proceso tiene dos disparadores independientes que conviven: el vencimiento próximo de una patente y el ciclo quincenal de relevamiento de kilometraje.",
      reglas: ["Todo el proceso debe estar creado dentro del Portal Flota."],
    },
    {
      id: "p2",
      titulo: "Vencimiento de patente registrado",
      responsable: "Portal Flota",
      sistema: "Portal Flota",
      descripcion:
        "El sistema detecta que un vehículo tiene un vencimiento de patente próximo, tomando la fecha cargada en la ficha del vehículo.",
      entradas: ["Ficha del vehículo con fecha de vencimiento"],
      salidas: ["Vencimiento marcado como próximo"],
      reglas: ["Requiere una tabla de vehículos con las fechas de vencimiento cargadas y mantenidas."],
    },
    {
      id: "p3",
      titulo: "Envía alerta por vencimiento",
      responsable: "Portal Flota",
      sistema: "Portal Flota",
      duracion: "Automático",
      descripcion:
        "El Portal Flota emite la alerta a Administración de Flota. Las alertas se generan en función de las asignaciones vigentes: cada vehículo alerta a quien lo tiene asignado.",
      salidas: ["Alerta de vencimiento notificada"],
      reglas: [
        "Las alertas se disparan en base a los vehículos asignados.",
        "El chofer sólo ve los vehículos asignados a él.",
      ],
    },
    {
      id: "p4",
      titulo: "¿Es urgente?",
      responsable: "Ana Torres",
      sistema: "Portal Flota",
      descripcion:
        "Administración evalúa la criticidad del vencimiento: cuántos días faltan, si el vehículo está en servicio y si existe disponibilidad de turno.",
      reglas: ["Si el vencimiento compromete la operación del vehículo en el corto plazo, se trata como urgente."],
    },
    {
      id: "p5",
      titulo: "Agenda turno por anticipación",
      responsable: "Ana Torres",
      sistema: "Externo · agenda del organismo",
      duracion: "~15 min",
      descripcion:
        "Cuando el vencimiento no es urgente, se agenda el turno con anticipación, buscando la fecha que menos interfiera con la programación de tráfico.",
      salidas: ["Turno agendado"],
      oportunidad: "Cruzar la agenda de turnos con la programación de tráfico para evitar bajas de vehículo en días de alta demanda.",
    },
    {
      id: "p6",
      titulo: "Agenda turno inmediato",
      responsable: "Ana Torres",
      sistema: "Externo · agenda del organismo",
      duracion: "~15 min",
      descripcion:
        "Cuando el vencimiento es urgente se busca el primer turno disponible, aun cuando implique dar de baja el vehículo de la programación del día.",
      salidas: ["Turno agendado con prioridad"],
      dolor: "Un turno inmediato saca el vehículo de circulación sin aviso previo a tráfico.",
    },
    {
      id: "p7",
      titulo: "Recibe resolución",
      responsable: "Ana Torres",
      sistema: "Portal Flota",
      descripcion:
        "Ana recibe el resultado del trámite (patente renovada, verificación aprobada o rechazada) y lo carga en el sistema junto con la nueva fecha de vencimiento.",
      entradas: ["Comprobante del trámite"],
      salidas: ["Nueva fecha de vencimiento cargada"],
    },
    {
      id: "p8",
      titulo: "Información actualizada",
      responsable: "Portal Flota",
      sistema: "Portal Flota",
      descripcion:
        "La ficha del vehículo queda actualizada con la documentación vigente y el próximo vencimiento, reiniciando el ciclo de alertas.",
      salidas: ["Ficha del vehículo actualizada"],
    },
    {
      id: "p9",
      titulo: "Envía email al chofer con formulario",
      responsable: "Portal Flota",
      sistema: "Portal Flota · Correo electrónico",
      duracion: "Cada 15 días",
      descripcion:
        "Cada 15 días el Portal Flota envía a cada chofer un email con un formulario para declarar el estado de su vehículo. Es el mecanismo de relevamiento de kilometraje real de la flota.",
      salidas: ["Formulario de relevamiento enviado"],
      reglas: ["El envío se hace por vehículo asignado: cada chofer recibe sólo los vehículos que tiene a cargo."],
    },
    {
      id: "p10",
      titulo: "Completa formulario",
      responsable: "Chofer",
      sistema: "Portal Flota",
      duracion: "~2 min",
      descripcion:
        "El chofer completa tres datos: patente del vehículo, kilometraje actual y fecha del último cambio de aceite.",
      salidas: ["Declaración de km y mantenimiento"],
      reglas: ["El formulario pide patente, kilometraje y fecha del último cambio de aceite."],
      dolor: "El dato depende de la carga manual del chofer, sin verificación contra el odómetro real.",
      oportunidad: "Solicitar foto del odómetro como respaldo, o integrar telemetría del vehículo.",
    },
    {
      id: "p11",
      titulo: "¿El kilometraje es mayor al anterior?",
      responsable: "Ana Torres",
      sistema: "Portal Flota",
      descripcion:
        "Control de consistencia del dato declarado. Se compara el kilometraje informado contra el último registro válido del mismo vehículo para detectar cargas erróneas o saltos imposibles.",
      reglas: [
        "Un valor que no supera al anterior indica un error de carga y se registra sin observaciones sólo cuando la validación es correcta.",
        "Un salto anómalo respecto del kilometraje esperado dispara el contacto con el chofer.",
      ],
    },
    {
      id: "p12",
      titulo: "Dato registrado",
      responsable: "Ana Torres",
      sistema: "Portal Flota",
      descripcion:
        "El kilometraje declarado se registra como válido y pasa a ser la referencia del próximo relevamiento. Si además dispara un umbral de mantenimiento, se agenda el service.",
      salidas: ["Kilometraje validado", "Base de mantenimiento actualizada"],
    },
    {
      id: "p13",
      titulo: "Contacta al chofer",
      responsable: "Ana Torres",
      sistema: "Teléfono / mensajería",
      duracion: "~10 min",
      descripcion:
        "Ante una inconsistencia, Administración contacta al chofer para confirmar el dato correcto y entender el origen del error.",
      salidas: ["Dato confirmado o corregido"],
      dolor: "El contacto es manual y no queda trazado; no hay registro de cuántas veces cada chofer carga datos inconsistentes.",
    },
    {
      id: "p14",
      titulo: "Marca como inconsistente",
      responsable: "Portal Flota",
      sistema: "Portal Flota",
      descripcion:
        "El registro queda marcado como inconsistente en el sistema, para que no se tome como base del próximo control ni dispare un mantenimiento equivocado.",
      salidas: ["Registro observado"],
    },
    {
      id: "p15",
      titulo: "Información corregida",
      responsable: "Ana Torres",
      sistema: "Portal Flota",
      descripcion:
        "Con el dato confirmado por el chofer, se corrige el registro y se restablece la serie de kilometraje del vehículo.",
      salidas: ["Kilometraje corregido y validado"],
    },
    {
      id: "p16",
      titulo: "Fin",
      responsable: "—",
      sistema: "—",
      descripcion:
        "El ciclo cierra con la documentación del vehículo vigente y el kilometraje validado. Ambos hilos convergen en la misma ficha de vehículo.",
    },
  ],
  excepciones: [
    { titulo: "Vencimiento urgente sin turno disponible", detalle: "El vehículo queda fuera de circulación hasta conseguir turno; se informa a tráfico para replanificar." },
    { titulo: "Chofer que no responde el formulario", detalle: "El vehículo queda sin dato de kilometraje en el ciclo y se arrastra la referencia anterior." },
    { titulo: "Kilometraje inconsistente reiterado", detalle: "Se marca el registro como inconsistente y se contacta al chofer antes de tomar el dato como válido." },
  ],
  requisitos: [
    "Todo el proceso debe estar creado dentro del Portal Flota.",
    "Se necesitan tres tablas: choferes, vehículos y asignación chofer–vehículo.",
    "Las alertas se disparan en base a los vehículos asignados.",
    "Los choferes pueden ver únicamente los vehículos asignados a ellos.",
    "El carnet de manipulación y el registro de conducir de cada chofer deben estar en la base de choferes.",
  ],
  oportunidades: [
    { titulo: "Alertas escalonadas de vencimiento", detalle: "Avisos a 60, 30 y 15 días con escalamiento automático si no hay turno agendado.", impacto: "Alto", esfuerzo: "Bajo" },
    { titulo: "Validación automática del kilometraje", detalle: "Rechazar en el propio formulario los valores menores al último registro y los saltos fuera de rango.", impacto: "Alto", esfuerzo: "Bajo" },
    { titulo: "Mantenimiento disparado por km", detalle: "Generar automáticamente la orden de service al alcanzar el umbral de kilometraje o de tiempo desde el último cambio de aceite.", impacto: "Alto", esfuerzo: "Medio" },
    { titulo: "Legajo digital del chofer", detalle: "Centralizar registro de conducir, carnet de manipulación y vencimientos en la base de choferes.", impacto: "Medio", esfuerzo: "Medio" },
  ],
};

/* ------------------------------------------------------------------ *
 * PRO-03 · Liquidación de Choferes
 * ------------------------------------------------------------------ */

const liquidacionChoferes: Proceso = {
  slug: "liquidacion-de-choferes",
  codigo: "PRO-03",
  nombre: "Liquidación de Choferes",
  area: "Administración",
  resumen:
    "Cálculo y pago quincenal de los choferes: se parte de la preliquidación del TMS, se aplican los descuentos del período, se concilia con el chofer y se ejecuta el pago una vez aprobado por Dirección.",
  objetivo:
    "Pagar en tiempo y forma el importe correcto a cada chofer, con los descuentos debidamente respaldados y con la conformidad del chofer antes de ejecutar la transferencia.",
  dueno: "Marta Ríos — Liquidaciones",
  frecuencia: "Quincenal",
  disparador: "Cierre de la quincena y disponibilidad de la preliquidación en el TMS.",
  resultado: "Pago ejecutado (transferencia o efectivo) y quincena bloqueada en el TMS.",
  sistemas: ["TMS Central", "Planilla maestra", "Planilla de descuentos", "Home banking"],
  participantes: [
    { nombre: "Marta Ríos", rol: "Liquidaciones" },
    { nombre: "Diego Sosa", rol: "Dirección de Operaciones" },
    { nombre: "Lucía Vega", rol: "Dirección Administrativa" },
    { nombre: "Ana Torres", rol: "Administración" },
    { nombre: "Chofer", rol: "Concilia pagos y descuentos" },
  ],
  indicadores: [
    { etiqueta: "Frecuencia", valor: "Quincenal" },
    { etiqueta: "Planillas involucradas", valor: "3" },
    { etiqueta: "Instancias de control", valor: "3" },
    { etiqueta: "Aprobación final", valor: "Dirección" },
  ],
  lanes: [
    { id: "tms", label: "TMS Central", sublabel: "Sistema de gestión", kind: "sistema" },
    { id: "liq", label: "Liquidaciones", sublabel: "Marta Ríos", kind: "persona", rows: 2 },
    { id: "dir", label: "Dirección", sublabel: "Diego Sosa / Lucía Vega", kind: "persona" },
    { id: "admin", label: "Administración", sublabel: "Ana Torres", kind: "persona" },
  ],
  nodes: [
    { id: "l1", label: "Inicio", kind: "inicio", lane: "tms", col: 0 },
    { id: "l2", label: "Preliquidación en el TMS", kind: "datos", lane: "tms", col: 1 },
    { id: "l3", label: "Exporta datos del TMS", kind: "tarea", lane: "liq", col: 1, row: 0 },
    { id: "l4", label: "Carga datos en planilla maestra", kind: "documento", lane: "liq", col: 1, row: 1 },
    { id: "l5", label: "Mantiene planilla de descuentos", kind: "documento", lane: "dir", col: 1 },
    { id: "l6", label: "¿Ajuste de descuento?", kind: "decision", lane: "dir", col: 2 },
    { id: "l7", label: "Carga descuentos", kind: "tarea", lane: "liq", col: 2, row: 1 },
    { id: "l8", label: "Aplica valor sugerido", kind: "tarea", lane: "liq", col: 3, row: 0 },
    { id: "l9", label: "Ajusta planilla de pago", kind: "tarea", lane: "liq", col: 4, row: 0 },
    { id: "l10", label: "¿Datos correctos?", kind: "decision", lane: "dir", col: 4 },
    { id: "l11", label: "Genera archivo con detalle de pago", kind: "tarea", lane: "liq", col: 5, row: 0 },
    { id: "l12", label: "Datos de quincena bloqueados", kind: "datos", lane: "tms", col: 5 },
    { id: "l13", label: "Revisión con el chofer", kind: "tarea", lane: "liq", col: 6, row: 0 },
    { id: "l14", label: "Informa monto a Dirección", kind: "tarea", lane: "admin", col: 6 },
    { id: "l15", label: "¿Aprobado?", kind: "decision", lane: "dir", col: 7 },
    { id: "l16", label: "Ejecuta transferencia o prepara efectivo", kind: "tarea", lane: "admin", col: 8 },
    { id: "l17", label: "Fin", kind: "fin", lane: "admin", col: 9 },
  ],
  edges: [
    { from: "l1", to: "l2", route: "h" },
    { from: "l2", to: "l3", route: "v" },
    { from: "l3", to: "l4", route: "v" },
    { from: "l4", to: "l5", route: "v" },
    { from: "l5", to: "l6", route: "h" },
    { from: "l6", to: "l7", label: "Sí", route: "v" },
    { from: "l6", to: "l8", label: "No", route: "hv" },
    { from: "l7", to: "l8", route: "hv" },
    { from: "l8", to: "l9", route: "h" },
    { from: "l9", to: "l10", route: "v" },
    { from: "l10", to: "l9", label: "No", route: "jog", offset: -46, variant: "retorno" },
    { from: "l10", to: "l11", label: "Sí", route: "hv" },
    { from: "l11", to: "l12", route: "v" },
    { from: "l11", to: "l13", route: "h" },
    { from: "l13", to: "l14", route: "v" },
    { from: "l14", to: "l15", route: "hv" },
    { from: "l15", to: "l11", label: "No", route: "around", side: "top", offset: 70, variant: "retorno" },
    { from: "l15", to: "l16", label: "Sí", route: "hv" },
    { from: "l16", to: "l17", route: "h" },
  ],
  pasos: [
    {
      id: "l1",
      titulo: "Inicio de la quincena",
      responsable: "—",
      sistema: "TMS Central",
      descripcion: "El proceso arranca al cerrar la quincena, cuando el TMS ya tiene registrados todos los viajes del período.",
      reglas: ["Los viajes no cerrados en el TMS distorsionan la preliquidación: se reclaman antes de iniciar."],
    },
    {
      id: "l2",
      titulo: "Preliquidación en el TMS",
      responsable: "TMS Central",
      sistema: "TMS Central",
      descripcion:
        "El TMS calcula la preliquidación de cada chofer a partir de los viajes cerrados en la quincena. Es la base de cálculo sobre la que se trabaja después.",
      salidas: ["Preliquidación por chofer"],
      dolor: "Si un viaje quedó sin cerrar, no entra en la preliquidación y el chofer lo reclama recién en la revisión.",
    },
    {
      id: "l3",
      titulo: "Exporta datos del TMS",
      responsable: "Marta Ríos",
      sistema: "TMS Central",
      duracion: "~15 min",
      descripcion: "Liquidaciones exporta la preliquidación del TMS para trabajarla fuera del sistema.",
      entradas: ["Preliquidación por chofer"],
      salidas: ["Archivo de preliquidación"],
      dolor: "El cálculo sale del sistema y pasa a planillas: a partir de acá no hay trazabilidad automática.",
    },
    {
      id: "l4",
      titulo: "Carga datos en planilla maestra",
      responsable: "Marta Ríos",
      sistema: "Planilla maestra",
      duracion: "30 – 45 min",
      descripcion:
        "Los datos exportados se cargan en la planilla maestra, donde se consolidan los conceptos a pagar de cada chofer del período.",
      entradas: ["Archivo de preliquidación"],
      salidas: ["Planilla maestra de la quincena"],
      oportunidad: "Automatizar la carga con una importación estructurada, eliminando la transcripción manual.",
    },
    {
      id: "l5",
      titulo: "Mantiene planilla de descuentos",
      responsable: "Diego Sosa / Lucía Vega",
      sistema: "Planilla de descuentos",
      descripcion:
        "Dirección mantiene la planilla de descuentos del período: seguros, talleres, combustible y adelantos otorgados a cada chofer.",
      salidas: ["Planilla de descuentos actualizada"],
      reglas: ["Los conceptos de seguros y talleres los aporta Administración."],
      dolor: "La planilla de descuentos se mantiene en paralelo a la planilla maestra, con riesgo de desincronización.",
    },
    {
      id: "l6",
      titulo: "¿Corresponde ajustar el descuento?",
      responsable: "Diego Sosa / Lucía Vega",
      sistema: "Planilla de descuentos",
      descripcion:
        "Dirección revisa si el descuento calculado por defecto corresponde tal cual o si hay que ajustarlo por acuerdos particulares con el chofer.",
      reglas: ["Si no hay ajuste, se aplica el valor sugerido por la planilla."],
    },
    {
      id: "l7",
      titulo: "Carga descuentos",
      responsable: "Marta Ríos",
      sistema: "Planilla maestra",
      duracion: "20 – 30 min",
      descripcion:
        "Liquidaciones carga los descuentos del período en la planilla maestra. Incluye combustible y la revisión de adelantos con Dirección, además de los conceptos de seguros y talleres que aporta Administración.",
      entradas: ["Planilla de descuentos actualizada", "Detalle de seguros y talleres", "Adelantos del período"],
      salidas: ["Descuentos aplicados por chofer"],
      reglas: [
        "Los descuentos incluyen combustible.",
        "Los adelantos se revisan con Dirección antes de aplicarlos.",
        "Seguros y talleres los informa Administración.",
      ],
      dolor: "Los descuentos llegan de tres fuentes distintas y se consolidan a mano.",
      oportunidad: "Unificar seguros, talleres, combustible y adelantos en un único registro de descuentos por chofer.",
    },
    {
      id: "l8",
      titulo: "Aplica valor sugerido",
      responsable: "Marta Ríos",
      sistema: "Planilla maestra",
      descripcion: "Cuando Dirección no indica ajustes, se aplica el descuento sugerido por la planilla sin modificaciones.",
      salidas: ["Descuentos confirmados"],
    },
    {
      id: "l9",
      titulo: "Ajusta planilla de pago",
      responsable: "Marta Ríos",
      sistema: "Planilla maestra",
      duracion: "20 min",
      descripcion:
        "Con los conceptos a pagar y los descuentos aplicados, se arma la planilla de pago definitiva de la quincena con el neto por chofer.",
      entradas: ["Planilla maestra", "Descuentos confirmados"],
      salidas: ["Planilla de pago de la quincena"],
    },
    {
      id: "l10",
      titulo: "¿Los datos son correctos?",
      responsable: "Diego Sosa / Lucía Vega",
      sistema: "Planilla maestra",
      descripcion:
        "Dirección controla la planilla de pago antes de generar el archivo definitivo. Si detecta diferencias, la planilla vuelve a Liquidaciones para su corrección.",
      reglas: ["El control es previo a la generación del archivo de pago: después la quincena se bloquea."],
      dolor: "Es un control totalmente manual sobre una planilla; no hay validaciones automáticas de razonabilidad.",
      oportunidad: "Reglas de control automáticas: desvío contra la quincena anterior, netos negativos, descuentos fuera de rango.",
    },
    {
      id: "l11",
      titulo: "Genera archivo con detalle de pago",
      responsable: "Marta Ríos",
      sistema: "Planilla maestra · TMS Central",
      duracion: "~15 min",
      descripcion:
        "Se genera el archivo con el detalle de pago por chofer, que es el documento que se usa tanto para la revisión con el chofer como para ejecutar la transferencia.",
      entradas: ["Planilla de pago validada"],
      salidas: ["Archivo de detalle de pago", "Quincena bloqueada en el TMS"],
    },
    {
      id: "l12",
      titulo: "Datos de quincena bloqueados",
      responsable: "TMS Central",
      sistema: "TMS Central",
      descripcion:
        "Al generarse el archivo de pago, la quincena queda bloqueada en el TMS: no se admiten más modificaciones sobre los viajes del período.",
      salidas: ["Período cerrado"],
      reglas: ["Todo reclamo posterior se resuelve en la quincena siguiente."],
    },
    {
      id: "l13",
      titulo: "Revisión con el chofer",
      responsable: "Marta Ríos",
      sistema: "Archivo de detalle de pago",
      duracion: "10 – 20 min por chofer",
      descripcion:
        "Liquidaciones repasa con cada chofer los pagos y los descuentos del período. Ante un reclamo, se consulta con Dirección qué margen de negociación existe antes de responder.",
      entradas: ["Archivo de detalle de pago"],
      salidas: ["Conformidad del chofer o reclamo registrado"],
      reglas: ["Ante un reclamo, Liquidaciones consulta con Dirección lo que puede ofrecer."],
      dolor: "La revisión es uno a uno y consume gran parte del cierre de la quincena.",
      oportunidad: "Publicar el recibo de la quincena en el Portal Flota para que el chofer lo revise antes de la reunión.",
    },
    {
      id: "l14",
      titulo: "Informa monto a Dirección",
      responsable: "Ana Torres",
      sistema: "Correo electrónico",
      descripcion:
        "Administración informa a Dirección el monto total a pagar en la quincena, para su aprobación y para la previsión financiera.",
      entradas: ["Detalle de pago revisado"],
      salidas: ["Monto total informado"],
    },
    {
      id: "l15",
      titulo: "¿Aprobado?",
      responsable: "Diego Sosa / Lucía Vega",
      sistema: "—",
      descripcion:
        "Dirección aprueba el pago de la quincena. Si no aprueba, el archivo de detalle de pago vuelve a generarse con los ajustes indicados.",
      reglas: ["Sin aprobación de Dirección no se ejecuta ninguna transferencia."],
    },
    {
      id: "l16",
      titulo: "Ejecuta transferencia o prepara efectivo",
      responsable: "Ana Torres",
      sistema: "Home banking",
      duracion: "~30 min",
      descripcion:
        "Administración ejecuta las transferencias a los choferes que cobran por banco y prepara el efectivo para los que cobran en mano.",
      entradas: ["Archivo de detalle de pago aprobado"],
      salidas: ["Pagos ejecutados", "Comprobantes de transferencia"],
      dolor: "La carga de transferencias es manual, sin archivo de pago masivo hacia el banco.",
      oportunidad: "Generar el archivo de pago masivo directamente desde la planilla de pago.",
    },
    {
      id: "l17",
      titulo: "Fin",
      responsable: "—",
      sistema: "—",
      descripcion: "La quincena queda pagada, bloqueada en el TMS y documentada con los comprobantes correspondientes.",
    },
  ],
  excepciones: [
    { titulo: "Viaje no cerrado en el TMS", detalle: "No entra en la preliquidación. Se dispara alerta al chofer y, tras 3 avisos, escala a Administración." },
    { titulo: "Reclamo del chofer en la revisión", detalle: "Liquidaciones consulta con Dirección el margen disponible antes de responder. Si la quincena ya está bloqueada, el ajuste se aplica en la siguiente." },
    { titulo: "Pago no aprobado por Dirección", detalle: "El archivo de detalle de pago se regenera con los ajustes indicados y vuelve al circuito de aprobación." },
    { titulo: "Chofer que cobra en efectivo", detalle: "No se genera transferencia; Administración prepara el efectivo y registra la entrega." },
  ],
  oportunidades: [
    { titulo: "Liquidación dentro del sistema", detalle: "Llevar el cálculo de descuentos y netos al TMS o al Portal Flota, eliminando la cadena de planillas.", impacto: "Alto", esfuerzo: "Alto" },
    { titulo: "Registro único de descuentos", detalle: "Consolidar seguros, talleres, combustible y adelantos en un solo registro por chofer, alimentado por quien origina cada concepto.", impacto: "Alto", esfuerzo: "Medio" },
    { titulo: "Recibo digital para el chofer", detalle: "Publicar el detalle de pago en el Portal Flota antes de la revisión, con acuse de conformidad.", impacto: "Medio", esfuerzo: "Medio" },
    { titulo: "Controles automáticos de razonabilidad", detalle: "Alertar desvíos contra la quincena anterior, netos negativos y descuentos fuera de rango.", impacto: "Medio", esfuerzo: "Bajo" },
    { titulo: "Archivo de pago masivo al banco", detalle: "Generar el archivo de transferencias desde la planilla de pago aprobada.", impacto: "Medio", esfuerzo: "Bajo" },
  ],
};

export const PROCESOS: Proceso[] = [gestionTrafico, controlPatentes, liquidacionChoferes];

export function getProceso(slug: string): Proceso | undefined {
  return PROCESOS.find((p) => p.slug === slug);
}

export const AREAS = Array.from(new Set(PROCESOS.map((p) => p.area)));
