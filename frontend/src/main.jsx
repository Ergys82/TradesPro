import React, { useEffect, useMemo, useState } from "react";
import { createRoot } from "react-dom/client";
import {
  BriefcaseBusiness,
  CalendarDays,
  CheckCircle2,
  CircleDollarSign,
  ClipboardList,
  Euro,
  Hammer,
  LayoutDashboard,
  Plus,
  Search,
  Pencil,
  Trash2,
  UserRound,
  UsersRound,
  X,
} from "lucide-react";
import "./styles.css";

const API = "http://localhost:8080/api";

async function request(path, options = {}) {
  const res = await fetch(API + path, {
    headers: { "Content-Type": "application/json", ...(options.headers || {}) },
    ...options,
  });
  if (!res.ok) {
    let message = "Errore nella richiesta";
    try {
      const data = await res.json();
      message = data.message || data.error || message;
    } catch (_) {}
    throw new Error(message);
  }
  if (res.status === 204) return null;
  return res.json();
}

const money = (n) =>
  new Intl.NumberFormat("it-IT", { style: "currency", currency: "EUR" }).format(
    Number(n || 0),
  );
const dt = (value) =>
  value
    ? new Intl.DateTimeFormat("it-IT", {
        dateStyle: "medium",
        timeStyle: "short",
      }).format(new Date(value))
    : "—";
const toInputDate = (value) => (value ? value.slice(0, 16) : "");

const statusLabel = {
  PLANNED: "Pianificato",
  IN_PROGRESS: "In corso",
  COMPLETED: "Completato",
  CANCELLED: "Annullato",
  DRAFT: "Bozza",
  SENT: "Inviato",
  APPROVED: "Approvato",
  REJECTED: "Rifiutato",
};

const translations = {
  it: {
    dashboard: "Dashboard",
    customers: "Clienti",
    workOrders: "Interventi",
    newCustomer: "Nuovo cliente",
    newWorkOrder: "Nuovo intervento",
    manageWork: "Gestisci il lavoro dalla richiesta all'incasso.",
    customerBook: "Rubrica clienti",
    registeredCustomers: "clienti registrati",
    search: "Cerca...",
    noPhone: "Nessun telefono",
    noEmail: "Nessuna email",
    noAddress: "Nessun indirizzo",
    workOrderTitle: "Titolo intervento",
    description: "Descrizione",
    status: "Stato",
    planned: "Pianificato",
    inProgress: "In corso",
    expectedHours: "Ore previste",
    hourlyRate: "Tariffa €/ora",
    technicianNotes: "Note tecnico",
    cancel: "Annulla",
    createWorkOrder: "Crea intervento",
    selectCustomer: "Seleziona cliente",
    workOrderExample: "es. Riparazione caldaia",
    editWorkOrder: "Modifica intervento",
    saveChanges: "Salva modifiche",
    appointment: "Appuntamento",
    cancelled: "Annullato",
    customer: "Cliente",
    editCustomer: "Modifica cliente",
    name: "Nome",
    phone: "Telefono",
    email: "Email",
    address: "Indirizzo",
    notes: "Note",
    saveCustomer: "Salva cliente",
    allWorkOrders: "Tutti gli interventi",
    edit: "Modifica",
    delete: "Elimina",
    details: "Dettagli",
    noDescription: "Nessuna descrizione.",
    materials: "Materiali",
    material: "Materiale",
    quote: "Preventivo",
    laborAndMaterials: "Manodopera + materiali",
    labor: "Manodopera",
    vat: "IVA",
    total: "Totale",
    recalculate: "Ricalcola",
    markSent: "Segna inviato",
    approve: "Approva",
    downloadPdf: "Scarica PDF",
    payments: "Pagamenti",
    collected: "Incassato",
    remaining: "residuo",
    amount: "Importo",
    method: "Metodo",
    registerPayment: "Registra pagamento",
    completed: "Completato",
    draft: "Bozza",
    sent: "Inviato",
    approved: "Approvato",
    rejected: "Rifiutato",
    recentJobs: "Interventi recenti",
    latestActivities: "Ultime attività registrate",
    workOrder: "Intervento",
    activeJobs: "Interventi attivi",
    approvedQuotes: "Preventivi approvati",
    revenue: "Incassato",
    outstanding: "Da incassare",
    registeredWorkOrders: "interventi registrati",
    date: "Data",
    actions: "Azioni",
    noWorkOrders: "Nessun intervento trovato.",
  },

  en: {
    dashboard: "Dashboard",
    customers: "Customers",
    workOrders: "Work Orders",
    newCustomer: "New customer",
    newWorkOrder: "New work order",
    manageWork: "Manage the job from request to payment.",
    customerBook: "Customer directory",
    registeredCustomers: "customers registered",
    search: "Search...",
    noPhone: "No phone number",
    noEmail: "No email",
    noAddress: "No address",
    workOrderTitle: "Work order title",
    description: "Description",
    status: "Status",
    planned: "Planned",
    inProgress: "In progress",
    expectedHours: "Expected hours",
    hourlyRate: "Hourly rate €/hour",
    technicianNotes: "Technician notes",
    cancel: "Cancel",
    createWorkOrder: "Create work order",
    selectCustomer: "Select customer",
    workOrderExample: "e.g. Boiler repair",
    editWorkOrder: "Edit work order",
    saveChanges: "Save changes",
    appointment: "Appointment",
    cancelled: "Cancelled",
    customer: "Customer",
    editCustomer: "Edit customer",
    name: "Name",
    phone: "Phone",
    email: "Email",
    address: "Address",
    notes: "Notes",
    saveCustomer: "Save customer",
    allWorkOrders: "All work orders",
    edit: "Edit",
    delete: "Delete",
    details: "Details",
    noDescription: "No description.",
    materials: "Materials",
    material: "Material",
    quote: "Quote",
    laborAndMaterials: "Labour + materials",
    labor: "Labour",
    vat: "VAT",
    total: "Total",
    recalculate: "Recalculate",
    markSent: "Mark as sent",
    approve: "Approve",
    downloadPdf: "Download PDF",
    payments: "Payments",
    collected: "Collected",
    remaining: "remaining",
    amount: "Amount",
    method: "Method",
    registerPayment: "Register payment",
    completed: "Completed",
    draft: "Draft",
    sent: "Sent",
    approved: "Approved",
    rejected: "Rejected",
    recentJobs: "Recent work orders",
    latestActivities: "Latest activities",
    workOrder: "Work order",
    activeJobs: "Active work orders",
    approvedQuotes: "Approved quotes",
    revenue: "Collected",
    outstanding: "Outstanding",
    registeredWorkOrders: "work orders registered",
    date: "Date",
    actions: "Actions",
    noWorkOrders: "No work orders found.",
  },

  fr: {
    dashboard: "Tableau de bord",
    customers: "Clients",
    workOrders: "Interventions",
    newCustomer: "Nouveau client",
    newWorkOrder: "Nouvelle intervention",
    manageWork: "Gérez le travail de la demande au paiement.",
    customerBook: "Répertoire clients",
    registeredCustomers: "clients enregistrés",
    search: "Rechercher...",
    noPhone: "Aucun téléphone",
    noEmail: "Aucun e-mail",
    noAddress: "Aucune adresse",
    workOrderTitle: "Titre de l'intervention",
    description: "Description",
    status: "Statut",
    planned: "Planifié",
    inProgress: "En cours",
    expectedHours: "Heures prévues",
    hourlyRate: "Tarif €/heure",
    technicianNotes: "Notes du technicien",
    cancel: "Annuler",
    createWorkOrder: "Créer l'intervention",
    selectCustomer: "Sélectionner un client",
    workOrderExample: "ex. Réparation chaudière",
    editWorkOrder: "Modifier l'intervention",
    saveChanges: "Enregistrer les modifications",
    appointment: "Rendez-vous",
    cancelled: "Annulé",
    customer: "Client",
    editCustomer: "Modifier le client",
    name: "Nom",
    phone: "Téléphone",
    email: "E-mail",
    address: "Adresse",
    notes: "Notes",
    saveCustomer: "Enregistrer le client",
    allWorkOrders: "Toutes les interventions",
    edit: "Modifier",
    delete: "Supprimer",
    details: "Détails",
    noDescription: "Aucune description.",
    materials: "Matériaux",
    material: "Matériau",
    quote: "Devis",
    laborAndMaterials: "Main-d'œuvre + matériaux",
    labor: "Main-d'œuvre",
    vat: "TVA",
    total: "Total",
    recalculate: "Recalculer",
    markSent: "Marquer comme envoyé",
    approve: "Approuver",
    downloadPdf: "Télécharger PDF",
    payments: "Paiements",
    collected: "Encaissé",
    remaining: "reste",
    amount: "Montant",
    method: "Méthode",
    registerPayment: "Enregistrer le paiement",
    completed: "Terminé",
    draft: "Brouillon",
    sent: "Envoyé",
    approved: "Approuvé",
    rejected: "Refusé",
    activeJobs: "Interventions actives",
    approvedQuotes: "Devis approuvés",
    revenue: "Encaissé",
    outstanding: "À encaisser",
    recentJobs: "Interventions récentes",
    latestActivities: "Dernières activités",
    workOrder: "Intervention",
    registeredWorkOrders: "interventions enregistrées",
    date: "Date",
    actions: "Actions",
    noWorkOrders: "Aucune intervention trouvée.",
  },
};


function App() {
  const [tab, setTab] = useState("dashboard");
  const [dashboard, setDashboard] = useState(null);
  const [customers, setCustomers] = useState([]);
  const [orders, setOrders] = useState([]);
  const [selectedOrderId, setSelectedOrderId] = useState(null);
  const [showCustomerForm, setShowCustomerForm] = useState(false);
  const [showOrderForm, setShowOrderForm] = useState(false);
  const [editingCustomer, setEditingCustomer] = useState(null);
  const [editingOrder, setEditingOrder] = useState(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  const [language, setLanguage] = useState(
      () => localStorage.getItem("tradespro-language") || "it"
  );
  const t = translations[language];

  const selectedOrder = useMemo(
    () => orders.find((o) => o.id === selectedOrderId) || null,
    [orders, selectedOrderId],
  );

  async function load() {
    setError("");
    try {
      const [d, c, o] = await Promise.all([
        request("/dashboard"),
        request("/customers"),
        request("/work-orders"),
      ]);
      setDashboard(d);
      setCustomers(c);
      setOrders(o);
      if (selectedOrderId && !o.some((x) => x.id === selectedOrderId))
        setSelectedOrderId(null);
    } catch (e) {
      setError(
        e.message + ". Controlla che il backend sia avviato su localhost:8080.",
      );
    }
  }

  useEffect(() => {
    load();
  }, []);

  useEffect(() => {
    localStorage.setItem("tradespro-language", language);
  }, [language]);

  async function mutate(fn) {
    setBusy(true);
    setError("");
    try {
      await fn();
      await load();
    } catch (e) {
      setError(e.message);
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="shell">
      <aside className="sidebar">
        <div className="brand">
          <div className="brand-mark">
            <Hammer size={22} />
          </div>
          <div>
            <strong>TradesPro</strong>
            <span>gestione interventi</span>
          </div>
        </div>
        <nav>
          <Nav
              icon={<LayoutDashboard />}
              label={t.dashboard}
              active={tab === "dashboard"}
              onClick={() => setTab("dashboard")}
          />

          <Nav
              icon={<UsersRound />}
              label={t.customers}
              active={tab === "customers"}
              onClick={() => setTab("customers")}
          />

          <Nav
              icon={<ClipboardList />}
              label={t.workOrders}
              active={tab === "orders"}
              onClick={() => setTab("orders")}
          />
        </nav>
        <div className="sidebar-footer">
          <span className="dot"></span> MVP locale
        </div>
      </aside>

      <main>
        <header className="topbar">
          <div>
            <h1>
              {tab === "dashboard"
                  ? t.dashboard
                  : tab === "customers"
                      ? t.customers
                      : t.workOrders}
            </h1>
            <p>{t.manageWork}</p>
          </div>
          <div className="header-actions">
            <select
                className="language-select"
                value={language}
                onChange={(e) => setLanguage(e.target.value)}
            >
              <option value="it">🇮🇹 Italiano</option>
              <option value="en">🇬🇧 English</option>
              <option value="fr">🇫🇷 Français</option>
            </select>
            <button
              className="btn secondary"
              onClick={() => {
                setEditingCustomer(null);
                setShowCustomerForm(true);
              }}
            >
              <UserRound size={17} /> {t.newCustomer}
            </button>
            <button
              className="btn primary"
              onClick={() => {
                setEditingOrder(null);
                setShowOrderForm(true);
              }}
            >
              <Plus size={17} /> {t.newWorkOrder}
            </button>
          </div>
        </header>

        {error && <div className="alert">{error}</div>}

        <section className="content">
          {tab === "dashboard" && (
            <Dashboard
              data={dashboard}
              t={t}
              onOpen={(id) => {
                setSelectedOrderId(id);
                setTab("orders");
              }}
            />
          )}
          {tab === "customers" && (
            <Customers
              customers={customers}
              mutate={mutate}
              t={t}
              onEdit={(c) => {
                setEditingCustomer(c);
                setShowCustomerForm(true);
              }}
            />
          )}
          {tab === "orders" && (
            <Orders
              orders={orders}
              selected={selectedOrder}
              setSelected={setSelectedOrderId}
              mutate={mutate}
              t={t}
              language={language}
              onEdit={(o) => {
                setEditingOrder(o);
                setShowOrderForm(true);
              }}
            />
          )}
        </section>
      </main>

      {showCustomerForm && (
        <CustomerModal
          customer={editingCustomer}
          onClose={() => {
            setShowCustomerForm(false);
            setEditingCustomer(null);
          }}
          onSave={(body) =>
            mutate(async () => {
              if (editingCustomer)
                await request(`/customers/${editingCustomer.id}`, {
                  method: "PUT",
                  body: JSON.stringify(body),
                });
              else
                await request("/customers", {
                  method: "POST",
                  body: JSON.stringify(body),
                });
              setShowCustomerForm(false);
              setEditingCustomer(null);
            })
          }
          busy={busy}
          t={t}
        />
      )}
      {showOrderForm && (
        <OrderModal
          order={editingOrder}
          customers={customers}
          onClose={() => {
            setShowOrderForm(false);
            setEditingOrder(null);
          }}
          onSave={(body) =>
            mutate(async () => {
              if (editingOrder)
                await request(`/work-orders/${editingOrder.id}`, {
                  method: "PUT",
                  body: JSON.stringify(body),
                });
              else
                await request("/work-orders", {
                  method: "POST",
                  body: JSON.stringify(body),
                });
              setShowOrderForm(false);
              setEditingOrder(null);
              setTab("orders");
            })
          }
          busy={busy}
          t={t}
        />
      )}
    </div>
  );
}

function Nav({ icon, label, active, onClick }) {
  return (
    <button className={`nav-item ${active ? "active" : ""}`} onClick={onClick}>
      {React.cloneElement(icon, { size: 19 })}
      <span>{label}</span>
    </button>
  );
}

function Dashboard({ data, onOpen, t }) {
  if (!data) return <div className="empty">Caricamento...</div>;
  return (
    <>
      <div className="stats">
        <Stat icon={<UsersRound />} label={t.customers} value={data.customers} />
        <Stat
          icon={<BriefcaseBusiness />}
          label={t.activeJobs}
          value={data.activeJobs}
        />
        <Stat
          icon={<CheckCircle2 />}
          label={t.approvedQuotes}
          value={data.approvedQuotes}
        />
        <Stat icon={<Euro />}
              label={t.revenue}
              value={money(data.revenue)} />
        <Stat
          icon={<CircleDollarSign />}
          label={t.outstanding}
          value={money(data.outstanding)}
        />
      </div>
      <div className="panel">
        <div className="panel-title">
          <div>
            <h2>{t.recentJobs}</h2>
            <p>{t.recentActivities}</p>
          </div>
        </div>
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>{t.customer}</th>
                <th>{t.workOrder}</th>
                <th>{t.appointment}</th>
                <th>{t.status}</th>
                <th>{t.total}</th>
              </tr>
            </thead>
            <tbody>
              {data.recentJobs.map((o) => (
                <tr
                  key={o.id}
                  onClick={() => onOpen(o.id)}
                  className="clickable"
                >
                  <td>{o.customer.name}</td>
                  <td>{o.title}</td>
                  <td>{dt(o.scheduledAt)}</td>
                  <td>
                    <Badge status={o.status} t={t} />
                  </td>
                  <td>{o.quote ? money(o.quote.total) : "—"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
}

function Stat({ icon, label, value }) {
  return (
    <div className="stat">
      <div className="stat-icon">{React.cloneElement(icon, { size: 20 })}</div>
      <div>
        <span>{label}</span>
        <strong>{value}</strong>
      </div>
    </div>
  );
}

function Customers({ customers, mutate, onEdit, t }) {
  const [q, setQ] = useState("");
  const filtered = customers.filter((c) =>
    (c.name + " " + (c.phone || "") + " " + (c.email || ""))
      .toLowerCase()
      .includes(q.toLowerCase()),
  );
  return (
    <div className="panel">
      <div className="panel-title">
        <div>
          <h2>{t.customerBook}</h2>
          <p>{customers.length} {t.registeredCustomers}</p>
        </div>
        <SearchBox value={q} onChange={setQ} placeholder={t.search} />
      </div>
      <div className="cards-grid">
        {filtered.map((c) => (
          <div className="customer-card" key={c.id}>
            <div className="avatar">{c.name.slice(0, 2).toUpperCase()}</div>
            <div className="customer-main">
              <strong>{c.name}</strong>
              <span>{c.phone || "Nessun telefono"}</span>
              <span>{c.email || "Nessuna email"}</span>
              <small>{c.address || "Nessun indirizzo"}</small>
            </div>
            <div className="card-actions">
              <button
                className="icon-btn"
                title="Modifica"
                onClick={() => onEdit(c)}
              >
                <Pencil size={16} />
              </button>
              <button
                className="icon-btn danger"
                title="Elimina"
                onClick={() => {
                  if (confirm(`Eliminare il cliente ${c.name}?`))
                    mutate(() =>
                      request(`/customers/${c.id}`, { method: "DELETE" }),
                    );
                }}
              >
                <Trash2 size={16} />
              </button>
            </div>
          </div>
        ))}
      </div>
      {!filtered.length && <div className="empty">Nessun cliente trovato.</div>}
    </div>
  );
}

function Orders({ orders, selected, setSelected, mutate, onEdit, t,
                  language}) {
  const [q, setQ] = useState("");
  const filtered = orders.filter((o) =>
    (o.title + " " + o.customer.name + " " + o.status)
      .toLowerCase()
      .includes(q.toLowerCase()),
  );
  if (selected)
    return (
      <OrderDetail
        order={selected}
        onBack={() => setSelected(null)}
        mutate={mutate}
        onEdit={() => onEdit(selected)}
        t={t}
        language={language}
      />
    );
  return (
    <div className="panel">
      <div className="panel-title">
        <div>
          <h2>{t.workOrders}</h2>
          <p>{orders.length} {t.registeredWorkOrders}</p>
        </div>
        <SearchBox value={q} onChange={setQ} placeholder={t.search} />
      </div>
      <div className="table-wrap">
        <table>
          <thead>
            <tr>
              <th>{t.customer}</th>
              <th>{t.workOrder}</th>
              <th>{t.date}</th>
              <th>{t.status}</th>
              <th>{t.quote}</th>
              <th>{t.outstanding}</th>
              <th>{t.actions}</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((o) => (
              <tr
                key={o.id}
                className="clickable"
                onClick={() => setSelected(o.id)}
              >
                <td>{o.customer.name}</td>
                <td>
                  <strong>{o.title}</strong>
                </td>
                <td>{dt(o.scheduledAt)}</td>
                <td>
                  <Badge status={o.status} t={t} />
                </td>
                <td>
                  {o.quote ? (
                    <>
                      <Badge status={o.quote.status} t={t} />{" "}
                      <span className="money-inline">
                        {money(o.quote.total)}
                      </span>
                    </>
                  ) : (
                    "—"
                  )}
                </td>
                <td>{money(o.outstanding)}</td>
                <td>
                  <div className="row-actions">
                    <button
                      className="icon-btn"
                      title={t.edit}
                      onClick={(e) => {
                        e.stopPropagation();
                        onEdit(o);
                      }}
                    >
                      <Pencil size={16} />
                    </button>
                    <button
                      className="icon-btn danger"
                      title={t.delete}
                      onClick={(e) => {
                        e.stopPropagation();
                        if (confirm(`Eliminare l'intervento ${o.title}?`))
                          mutate(() =>
                            request(`/work-orders/${o.id}`, {
                              method: "DELETE",
                            }),
                          );
                      }}
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {!filtered.length && (
          <div className="empty">{t.noWorkOrders}</div>
      )}
    </div>
  );
}

function OrderDetail({ order, onBack, mutate, onEdit, t, language }) {
  const [material, setMaterial] = useState({
    description: "",
    quantity: 1,
    unitPrice: "",
  });
  const [payment, setPayment] = useState({
    amount: "",
    method: "Bonifico",
    notes: "",
  });

  const updateStatus = (status) =>
    mutate(() =>
      request(`/work-orders/${order.id}`, {
        method: "PUT",
        body: JSON.stringify({
          customerId: order.customer.id,
          title: order.title,
          description: order.description,
          status,
          scheduledAt: order.scheduledAt,
          laborHours: order.laborHours,
          laborRate: order.laborRate,
          technicianNotes: order.technicianNotes,
        }),
      }),
    );

  return (
    <div className="detail-layout">
      <div className="detail-head">
        <button className="btn ghost" onClick={onBack}>
          ← {t.allWorkOrders}
        </button>
        <div>
          <h2>{order.title}</h2>
          <p>
            {order.customer.name} ·{" "}
            {order.customer.phone || "telefono non disponibile"}
          </p>
        </div>
        <div className="detail-actions">
          <button className="btn secondary" onClick={onEdit}>
            <Pencil size={16} /> {t.edit}
          </button>
          <button
            className="btn danger-btn"
            onClick={() => {
              if (confirm(`Eliminare l'intervento ${order.title}?`))
                mutate(() =>
                  request(`/work-orders/${order.id}`, { method: "DELETE" }),
                );
            }}
          >
            <Trash2 size={16} /> {t.delete}
          </button>
          <select
            className="status-select"
            value={order.status}
            onChange={(e) => updateStatus(e.target.value)}
          >
            <option value="PLANNED">{t.planned}</option>
            <option value="IN_PROGRESS">{t.inProgress}</option>
            <option value="COMPLETED">{t.completed}</option>
            <option value="CANCELLED">{t.cancelled}</option>
          </select>
        </div>
      </div>

      <div className="detail-grid">
        <div className="stack">
          <div className="panel compact">
            <h3>{t.details}</h3>
            <Info
              icon={<CalendarDays />}
              label="Appuntamento"
              value={dt(order.scheduledAt)}
            />
            <Info
              icon={<UserRound />}
              label="Cliente"
              value={order.customer.name}
            />
            <div className="description">
              {order.description || t.noDescription}
            </div>
            {order.technicianNotes && (
              <div className="note">
                <strong>Note tecnico</strong>
                {order.technicianNotes}
              </div>
            )}
          </div>

          <div className="panel compact">
            <div className="panel-title small">
              <div>
                <h3>{t.materials}</h3>
                <p>Totale {money(order.materialsTotal)}</p>
              </div>
            </div>
            <div className="line-items">
              {order.materials.map((m) => (
                <div className="line" key={m.id}>
                  <div>
                    <strong>{m.description}</strong>
                    <span>
                      {m.quantity} × {money(m.unitPrice)}
                    </span>
                  </div>
                  <div>
                    <b>{money(m.total)}</b>
                    <button
                      className="icon-btn danger"
                      onClick={() =>
                        mutate(() =>
                          request(
                            `/work-orders/${order.id}/materials/${m.id}`,
                            { method: "DELETE" },
                          ),
                        )
                      }
                    >
                      <Trash2 size={15} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
            <form
              className="inline-form"
              onSubmit={(e) => {
                e.preventDefault();
                mutate(async () => {
                  await request(`/work-orders/${order.id}/materials`, {
                    method: "POST",
                    body: JSON.stringify({
                      ...material,
                      quantity: Number(material.quantity),
                      unitPrice: Number(material.unitPrice),
                    }),
                  });
                  setMaterial({ description: "", quantity: 1, unitPrice: "" });
                });
              }}
            >
              <input
                required
                placeholder={t.material}
                value={material.description}
                onChange={(e) =>
                  setMaterial({ ...material, description: e.target.value })
                }
              />
              <input
                required
                type="number"
                min="0.01"
                step="0.01"
                placeholder="Q.tà"
                value={material.quantity}
                onChange={(e) =>
                  setMaterial({ ...material, quantity: e.target.value })
                }
              />
              <input
                required
                type="number"
                min="0"
                step="0.01"
                placeholder="€ unit."
                value={material.unitPrice}
                onChange={(e) =>
                  setMaterial({ ...material, unitPrice: e.target.value })
                }
              />
              <button className="btn secondary">
                <Plus size={16} />
              </button>
            </form>
          </div>
        </div>

        <div className="stack">
          <div className="panel compact quote-box">
            <div className="panel-title small">
              <div>
                <h3>{t.quote}</h3>
                <p>{t.laborAndMaterials}</p>
              </div>
              {order.quote && <Badge status={order.quote.status} t={t} />}
            </div>
            <div className="totals">
              <div>
                <span>
                  {t.labor} ({order.laborHours}h × {money(order.laborRate)})
                </span>
                <b>{money(order.laborTotal)}</b>
              </div>
              <div>
                <span>{t.materials}</span>
                <b>{money(order.materialsTotal)}</b>
              </div>
              {order.quote && (
                <>
                  <div>
                    <span>{t.vat} {order.quote.taxRate}%</span>
                    <b>{money(order.quote.taxAmount)}</b>
                  </div>
                  <div className="grand">
                    <span>{t.total}</span>
                    <b>{money(order.quote.total)}</b>
                  </div>
                </>
              )}
            </div>
            {!order.quote ? (
              <button
                className="btn primary full"
                onClick={() =>
                  mutate(() =>
                    request(`/work-orders/${order.id}/quote`, {
                      method: "POST",
                      body: JSON.stringify({ taxRate: 22 }),
                    }),
                  )
                }
              >
                Genera preventivo
              </button>
            ) : (
              <div className="quote-actions">
                <button
                  className="btn secondary"
                  onClick={() =>
                    mutate(() =>
                      request(`/work-orders/${order.id}/quote`, {
                        method: "POST",
                        body: JSON.stringify({ taxRate: order.quote.taxRate }),
                      }),
                    )
                  }
                >
                  {t.recalculate}
                </button>
                <button
                  className="btn secondary"
                  onClick={() =>
                    mutate(() =>
                      request(`/quotes/${order.quote.id}/status`, {
                        method: "PUT",
                        body: JSON.stringify({ status: "SENT" }),
                      }),
                    )
                  }
                >
                  {t.markSent}
                </button>
                <button
                  className="btn success"
                  onClick={() =>
                    mutate(() =>
                      request(`/quotes/${order.quote.id}/status`, {
                        method: "PUT",
                        body: JSON.stringify({ status: "APPROVED" }),
                      }),
                    )
                  }
                >
                  {t.approve}
                </button>
                <button
                    className="btn secondary"
                    onClick={() =>
                        window.location.href =
                            `${API}/work-orders/${order.id}/quote/pdf?lang=${language}`
                    }
                >
                  {t.downloadPdf}
                </button>
              </div>
            )}
          </div>

          <div className="panel compact">
            <div className="panel-title small">
              <div>
                <h3>Pagamenti</h3>
                <p>
                  Incassato {money(order.paidTotal)} · residuo{" "}
                  {money(order.outstanding)}
                </p>
              </div>
            </div>
            <div className="line-items">
              {order.payments.map((p) => (
                <div className="line" key={p.id}>
                  <div>
                    <strong>{money(p.amount)}</strong>
                    <span>
                      {p.method || "Metodo non indicato"} · {dt(p.paidAt)}
                    </span>
                  </div>
                </div>
              ))}
            </div>
            <form
              className="payment-form"
              onSubmit={(e) => {
                e.preventDefault();
                mutate(async () => {
                  await request(`/work-orders/${order.id}/payments`, {
                    method: "POST",
                    body: JSON.stringify({
                      ...payment,
                      amount: Number(payment.amount),
                    }),
                  });
                  setPayment({ amount: "", method: "Bonifico", notes: "" });
                });
              }}
            >
              <div>
                <label>Importo</label>
                <input
                  required
                  type="number"
                  min="0.01"
                  step="0.01"
                  value={payment.amount}
                  onChange={(e) =>
                    setPayment({ ...payment, amount: e.target.value })
                  }
                />
              </div>
              <div>
                <label>Metodo</label>
                <select
                  value={payment.method}
                  onChange={(e) =>
                    setPayment({ ...payment, method: e.target.value })
                  }
                >
                  <option>Bonifico</option>
                  <option>Contanti</option>
                  <option>Carta</option>
                  <option>Altro</option>
                </select>
              </div>
              <button className="btn primary">Registra pagamento</button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}

function Info({ icon, label, value }) {
  return (
    <div className="info-row">
      <div className="mini-icon">{React.cloneElement(icon, { size: 16 })}</div>
      <div>
        <span>{label}</span>
        <strong>{value}</strong>
      </div>
    </div>
  );
}
function Badge({ status, t }) {
  const labels = {
    PLANNED: t.planned,
    IN_PROGRESS: t.inProgress,
    COMPLETED: t.completed,
    CANCELLED: t.cancelled,
    DRAFT: t.draft,
    SENT: t.sent,
    APPROVED: t.approved,
    REJECTED: t.rejected,
  };

  return (
      <span className={`badge ${status.toLowerCase()}`}>
      {labels[status] || status}
    </span>
  );
}
function SearchBox({ value, onChange, placeholder }) {
  return (
    <div className="search">
      <Search size={17} />
      <input
        placeholder={placeholder}
        value={value}
        onChange={(e) => onChange(e.target.value)}
      />
    </div>
  );
}

function Modal({ title, onClose, children }) {
  return (
    <div className="modal-backdrop" onMouseDown={onClose}>
      <div className="modal" onMouseDown={(e) => e.stopPropagation()}>
        <div className="modal-head">
          <h2>{title}</h2>
          <button className="icon-btn" onClick={onClose}>
            <X size={20} />
          </button>
        </div>
        {children}
      </div>
    </div>
  );
}

function CustomerModal({ customer, onClose, onSave, busy, t }) {
  const [f, setF] = useState({
    name: customer?.name || "",
    phone: customer?.phone || "",
    email: customer?.email || "",
    address: customer?.address || "",
    notes: customer?.notes || "",
  });
  return (
    <Modal
      title={customer ? t.editCustomer : t.newCustomer}
      onClose={onClose}
    >
      <form
        className="form"
        onSubmit={(e) => {
          e.preventDefault();
          onSave(f);
        }}
      >
        <Field label={`${t.name} *`}>
          <input
            required
            value={f.name}
            onChange={(e) => setF({ ...f, name: e.target.value })}
          />
        </Field>
        <div className="two">
          <Field label={t.phone}>
            <input
              value={f.phone}
              onChange={(e) => setF({ ...f, phone: e.target.value })}
            />
          </Field>
          <Field label={t.email}>
            <input
              type="email"
              value={f.email}
              onChange={(e) => setF({ ...f, email: e.target.value })}
            />
          </Field>
        </div>
        <Field label={t.address}>
          <input
            value={f.address}
            onChange={(e) => setF({ ...f, address: e.target.value })}
          />
        </Field>
        <Field label={t.notes}>
          <textarea
            rows="3"
            value={f.notes}
            onChange={(e) => setF({ ...f, notes: e.target.value })}
          />
        </Field>
        <div className="form-actions">
          <button type="button" className="btn secondary" onClick={onClose}>
            {t.cancel}
          </button>
          <button className="btn primary" disabled={busy}>
            {customer ? t.saveChanges : t.saveCustomer}
          </button>
        </div>
      </form>
    </Modal>
  );
}

function OrderModal({ order, customers, onClose, onSave, busy, t }) {
  const [f, setF] = useState({
    customerId: order?.customer?.id || customers[0]?.id || "",
    title: order?.title || "",
    description: order?.description || "",
    scheduledAt: order?.scheduledAt || "",
    laborHours: order?.laborHours ?? 1,
    laborRate: order?.laborRate ?? 50,
    technicianNotes: order?.technicianNotes || "",
    status: order?.status || "PLANNED",
  });
  return (
    <Modal
      title={order ? t.editWorkOrder : t.newWorkOrder}
      onClose={onClose}
    >
      <form
        className="form"
        onSubmit={(e) => {
          e.preventDefault();
          onSave({
            ...f,
            customerId: Number(f.customerId),
            laborHours: Number(f.laborHours),
            laborRate: Number(f.laborRate),
            scheduledAt: f.scheduledAt || null,
          });
        }}
      >
        <Field label={`${t.customer} *`}>
          <select
            required
            value={f.customerId}
            onChange={(e) => setF({ ...f, customerId: e.target.value })}
          >
            <option value="">{t.selectCustomer}</option>
            {customers.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
        </Field>
        <Field label={`${t.workOrderTitle} *`}>
          <input
            required
            placeholder={t.workOrderExample}
            value={f.title}
            onChange={(e) => setF({ ...f, title: e.target.value })}
          />
        </Field>
        <Field label={t.description}>
          <textarea
            rows="3"
            value={f.description}
            onChange={(e) => setF({ ...f, description: e.target.value })}
          />
        </Field>
        <div className="two">
          <Field label={t.appointment}>
            <input
              type="datetime-local"
              value={toInputDate(f.scheduledAt)}
              onChange={(e) => setF({ ...f, scheduledAt: e.target.value })}
            />
          </Field>
          <Field label={t.status}>
            <select
              value={f.status}
              onChange={(e) => setF({ ...f, status: e.target.value })}
            >
              <option value="PLANNED">{t.planned}</option>
              <option value="IN_PROGRESS">{t.inProgress}</option>
              <option value="COMPLETED">{t.completed}</option>
              <option value="CANCELLED">{t.cancelled}</option>
            </select>
          </Field>
        </div>
        <div className="two">
          <Field label={t.expectedHours}>
            <input
              type="number"
              min="0"
              step="0.25"
              value={f.laborHours}
              onChange={(e) => setF({ ...f, laborHours: e.target.value })}
            />
          </Field>
          <Field label={t.hourlyRate}>
            <input
              type="number"
              min="0"
              step="0.01"
              value={f.laborRate}
              onChange={(e) => setF({ ...f, laborRate: e.target.value })}
            />
          </Field>
        </div>
        <Field label={t.technicianNotes}>
          <textarea
            rows="2"
            value={f.technicianNotes}
            onChange={(e) => setF({ ...f, technicianNotes: e.target.value })}
          />
        </Field>
        <div className="form-actions">
          <button type="button" className="btn secondary" onClick={onClose}>
            {t.cancel}
          </button>
          <button className="btn primary" disabled={busy || !customers.length}>
            {order ? t.saveChanges : t.createWorkOrder}
          </button>
        </div>
        {!customers.length && (
          <p className="hint">Crea prima almeno un cliente.</p>
        )}
      </form>
    </Modal>
  );
}

function Field({ label, children }) {
  return (
    <label className="field">
      <span>{label}</span>
      {children}
    </label>
  );
}

createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
);
