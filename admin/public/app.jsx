const API_URL = "http://localhost:5000/api";

const emptyForm = {
  title: "",
  category: "Conference",
  location: "",
  date: "",
  time: "",
  capacity: 100,
  price: 0,
  imageUrl: "",
  description: ""
};

function App() {
  const [events, setEvents] = React.useState([]);
  const [selectedEventId, setSelectedEventId] = React.useState("");
  const [registrations, setRegistrations] = React.useState([]);
  const [form, setForm] = React.useState(emptyForm);
  const [status, setStatus] = React.useState("");
  const [loading, setLoading] = React.useState(true);

  const selectedEvent = React.useMemo(
    () => events.find((event) => event.id === selectedEventId) || events[0],
    [events, selectedEventId]
  );

  async function loadEvents() {
    setLoading(true);
    const response = await fetch(`${API_URL}/events`);
    if (!response.ok) {
      throw new Error("Backend API returned an error");
    }
    const data = await response.json();
    setEvents(data);
    setSelectedEventId((current) => current || data[0]?.id || "");
    setLoading(false);
  }

  async function loadRegistrations(eventId) {
    if (!eventId) {
      setRegistrations([]);
      return;
    }
    const response = await fetch(`${API_URL}/events/${eventId}/registrations`);
    const data = await response.json();
    setRegistrations(data.registrations || []);
  }

  React.useEffect(() => {
    loadEvents().catch(() => {
      setStatus("Unable to connect to backend API.");
      setLoading(false);
    });
  }, []);

  React.useEffect(() => {
    loadRegistrations(selectedEvent?.id).catch(() => setRegistrations([]));
  }, [selectedEvent?.id]);

  function updateField(event) {
    const { name, value } = event.target;
    setForm((current) => ({ ...current, [name]: value }));
  }

  async function createEvent(event) {
    event.preventDefault();
    setStatus("Creating event...");
    const response = await fetch(`${API_URL}/events`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form)
    });

    if (!response.ok) {
      const error = await response.json();
      setStatus(error.message || "Event could not be created.");
      return;
    }

    const created = await response.json();
    setForm(emptyForm);
    setStatus("Event created successfully.");
    await loadEvents();
    setSelectedEventId(created.id);
  }

  async function deleteEvent(id) {
    if (!window.confirm("Delete this event and its registrations?")) return;
    await fetch(`${API_URL}/events/${id}`, { method: "DELETE" });
    setStatus("Event deleted.");
    setSelectedEventId("");
    await loadEvents();
  }

  return (
    <main className="admin-shell">
      <aside className="sidebar">
        <div>
          <p className="eyebrow">Admin Panel</p>
          <h1>Event Control</h1>
        </div>
        <nav>
          <a href="#create"><span>+</span> Create Event</a>
          <a href="#registrations"><span>#</span> Registrations</a>
        </nav>
      </aside>

      <section className="workspace">
        <header className="topbar">
          <div>
            <p className="eyebrow">Dashboard</p>
            <h2>Manage events and attendees</h2>
          </div>
          <div className="stat"><span>#</span> {events.reduce((total, event) => total + event.registeredCount, 0)} registrations</div>
        </header>

        {status && <p className="notice">{status}</p>}

        <section className="content-grid">
          <form id="create" className="panel event-form" onSubmit={createEvent}>
            <div className="section-heading">
              <div>
                <p className="eyebrow">Create</p>
                <h3>New Event</h3>
              </div>
              <button className="primary-button" type="submit"><span>+</span> Publish</button>
            </div>

            <label>Event title<input name="title" value={form.title} onChange={updateField} placeholder="Annual business meetup" required /></label>
            <div className="two-column">
              <label>Category<select name="category" value={form.category} onChange={updateField}><option>Conference</option><option>Workshop</option><option>Expo</option><option>Meetup</option><option>Concert</option></select></label>
              <label>Location<input name="location" value={form.location} onChange={updateField} placeholder="Venue, city" required /></label>
            </div>
            <div className="two-column">
              <label>Date<input name="date" type="date" value={form.date} onChange={updateField} required /></label>
              <label>Time<input name="time" type="time" value={form.time} onChange={updateField} required /></label>
            </div>
            <div className="two-column">
              <label>Capacity<input name="capacity" type="number" min="1" value={form.capacity} onChange={updateField} required /></label>
              <label>Price<input name="price" type="number" min="0" value={form.price} onChange={updateField} required /></label>
            </div>
            <label>Image URL<input name="imageUrl" value={form.imageUrl} onChange={updateField} placeholder="https://..." /></label>
            <label>Description<textarea name="description" value={form.description} onChange={updateField} rows="5" required /></label>
          </form>

          <section className="panel" id="registrations">
            <div className="section-heading">
              <div>
                <p className="eyebrow">Live</p>
                <h3>Registrations</h3>
              </div>
              <select value={selectedEvent?.id || ""} onChange={(event) => setSelectedEventId(event.target.value)}>
                {events.map((event) => <option key={event.id} value={event.id}>{event.title}</option>)}
              </select>
            </div>

            {loading ? <p className="empty">Loading events...</p> : selectedEvent ? (
              <>
                <div className="event-summary">
                  <img src={selectedEvent.imageUrl || "https://images.unsplash.com/photo-1505373877841-8d25f7d46678?auto=format&fit=crop&w=900&q=80"} alt="" />
                  <div>
                    <h4>{selectedEvent.title}</h4>
                    <p>{selectedEvent.date} at {selectedEvent.time}</p>
                    <p>{selectedEvent.location}</p>
                    <p>Rs. {selectedEvent.price}</p>
                  </div>
                  <button className="icon-button" type="button" onClick={() => deleteEvent(selectedEvent.id)} title="Delete event">x</button>
                </div>
                <div className="table-wrap">
                  <table>
                    <thead><tr><th>Name</th><th>Email</th><th>Phone</th><th>Registered</th></tr></thead>
                    <tbody>
                      {registrations.map((registration) => (
                        <tr key={registration.id}>
                          <td>{registration.name}</td>
                          <td>{registration.email}</td>
                          <td>{registration.phone}</td>
                          <td>{new Date(registration.createdAt).toLocaleString()}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  {!registrations.length && <p className="empty">No registrations yet.</p>}
                </div>
              </>
            ) : <p className="empty">Create your first event to start collecting registrations.</p>}
          </section>
        </section>
      </section>
    </main>
  );
}

ReactDOM.createRoot(document.getElementById("root")).render(<App />);
