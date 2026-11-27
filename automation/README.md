# Pilates Mon registration

The client landing owns the form and brand. Activepieces owns intake and CRM writes.
PerfectFlow uses ordinary configurable `evento` and `inscripcion_evento` CustomModels,
linked to the existing `alumno`; there is no client-specific Rails route or class.

`pilates-mon.mjs` is the canonical workflow source. Run:

```
node --test automation/pilates-mon.test.mjs
node automation/validate-workflow.mjs automation/pilates-mon.template.json
```

The template has an empty API token. Deployment injects the Station token inside the
Lite droplet; it must never appear in this repository or in browser code. Both Host
and X-Forwarded-Host pin internal requests to `pilates-luma-vitae.perfectflow.cloud`.
The public webhook is the single landing integration; input cannot choose the tenant,
event code, model or CRM endpoint.

The current event is `pilates-mon-2026`. Its CRM Event record controls
`registro_abierto` and `booking_url`. Registration stays closed until the studio
confirms date, schedule, capacity, price and the booking journey. The form reads
opening status before enabling submission. Opening registrations does not reserve
or charge for a class. Only an explicitly configured HTTPS booking URL is returned.

Required answers follow the two screenshots supplied on 2026-11-26. Optional notes
remain optional. Source: “¿Cómo supiste del evento?” → Instagram, TikTok,
Recomendación, Otro. Both policy and risk/terms acceptance are required and the
accepted text version is stored with the inscription, together with server time.

The flow reuses an exact-email student without modifying that student's profile.
If no student exists it creates one; a conflicting phone requires studio review.
Every inscription retains the event answers and links to its student and event.
Redis locks and a stable event/email registration reference prevent duplicate
submissions. The flow itself sends no mail, WhatsApp or payment and creates no package credit.
A native Communications rule on Event Registration sends the event receipt. The
founder welcome is limited to student origin `comunidad-fundadora`; event
participants must not enter that campaign. The event registration keeps its
base email so the native rule can address both new and returning students.

Before publishing, validate the artifact against the source, import it as a draft,
verify execution with an owned QA address, verify links and repeated submission,
then re-read the exported published version. Delete only the owned test records,
restore the event opening state and verify the public closed-state/CORS responses.

## Slots and appointments (27/11/2026)

Saturday 05/12/2026, four slots of 1 h 20 min (7:10, 8:40, 10:10, 11:40), five
people each (`SLOTS`, `CAPACITY`). `status` returns each slot's spots left.
Spots are counted on that day's appointments whose note starts with
«Pilates Mom» and that are not cancelled, so cancelling an appointment frees
the spot. A Redis lock per slot stops two people from taking the last spot at
once. Each registration stores `horario` and creates the appointment in its
initial state (reserved), linked to the student through `sesion_alumnos`. The
studio confirms it after payment. The event's `booking_url` points to the
«Pilates Mom · sábado 05/12» package in the store ($30 + 7 % ITBMS). The closed
day the studio set on 05/12 does not block these appointments: only appointments
coming from the students' app are checked against closed days.
