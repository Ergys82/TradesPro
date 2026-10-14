# TradesPro MVP

Gestionale per artigiani e tecnici: clienti, interventi, materiali, preventivi, pagamenti e dashboard.

## Stack
- Java 21
- Spring Boot 3.5.6
- Spring Web + Spring Data JPA + Validation
- H2 file database (persistente in locale)
- React 19 + Vite

## Avvio backend
### Da IntelliJ (consigliato)
1. Apri la cartella `backend` come progetto Maven.
2. Aspetta il download delle dipendenze.
3. Avvia `TradesProApplication`.

### Da terminale
```bash
cd backend
mvn spring-boot:run
```
Backend: http://localhost:8080
H2 console: http://localhost:8080/h2-console

Parametri H2:
- JDBC URL: `jdbc:h2:file:./data/tradespro`
- User: `sa`
- Password: vuota

## Avvio frontend
```bash
cd frontend
npm install
npm run dev
```
Frontend: http://localhost:5173

## Funzioni incluse
- Dashboard: clienti, interventi aperti, preventivi, incassi e valore da incassare
- CRUD clienti
- CRUD interventi con stato e appuntamento
- Materiali per intervento
- Preventivo calcolato da ore x tariffa + materiali + IVA
- Stati preventivo: DRAFT, SENT, APPROVED, REJECTED
- Registrazione pagamenti parziali o completi
- Dati demo iniziali

## Evoluzioni consigliate
1. Login e multi-azienda (tenant per impresa)
2. Upload foto prima/dopo intervento
3. PDF preventivo/fattura con logo aziendale
4. Conferma cliente via link
5. WhatsApp/SMS per appuntamenti e preventivi
6. AI: voce -> rapporto di intervento/preventivo
7. PostgreSQL per produzione
8. Docker + deploy cloud

## API principali
- `GET/POST /api/customers`
- `GET/PUT/DELETE /api/customers/{id}`
- `GET/POST /api/work-orders`
- `GET/PUT/DELETE /api/work-orders/{id}`
- `POST /api/work-orders/{id}/materials`
- `DELETE /api/work-orders/{id}/materials/{materialId}`
- `POST /api/work-orders/{id}/quote`
- `PUT /api/quotes/{id}/status`
- `POST /api/work-orders/{id}/payments`
- `GET /api/dashboard`


## Nota importante
Questa è una versione MVP gestionale. Il modulo “fattura” è rappresentato dal ciclo preventivo + pagamenti; **non genera ancora una fattura elettronica FatturaPA/SDI fiscalmente valida**. Per una versione commerciale italiana va aggiunto un modulo fiscale dedicato o un'integrazione con un provider di fatturazione elettronica.
