const API_URL = "http://localhost:5000/api";

function App() {
  const [events, setEvents] = React.useState([]);
  const [selectedEventId, setSelectedEventId] = React.useState("");
  const [query, setQuery] = React.useState("");
  const [form, setForm] = React.useState({ name: "", email: "", phone: "" });
  const [status, setStatus] = React.useState("");
  const [loading, setLoading] = React.useState(true);

  const filteredEvents = React.useMemo(() => {
    const term = query.toLowerCase().trim();
    if (!term) return events;
    return events.filter((event) => [event.title, event.category, event.location].some((value) => value.toLowerCase().includes(term)));
  }, [events, query]);

  const selectedEvent = React.useMemo(
    () => events.find((event) => event.id === selectedEventId) || filteredEvents[0],
    [events, filteredEvents, selectedEventId]
  );

  async function loadEvents() {
    const response = await fetch(`${API_URL}/events`);
    if (!response.ok) {
      throw new Error("Backend API returned an error");
    }
    const data = await response.json();
    setEvents(data);
    setSelectedEventId((current) => current || data[0]?.id || "");
    setLoading(false);
  }

  React.useEffect(() => {
    loadEvents().catch(() => {
      setStatus("Backend API is not reachable.");
      setLoading(false);
    });
  }, []);

  function updateForm(event) {
    const { name, value } = event.target;
    setForm((current) => ({ ...current, [name]: value }));
  }

  async function register(event) {
    event.preventDefault();
    if (!selectedEvent) {
      setStatus("Select an event first.");
      return;
    }
    setStatus("Submitting registration...");
    const response = await fetch(`${API_URL}/events/${selectedEvent.id}/register`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form)
    });
    const data = await response.json();
    if (!response.ok) {
      setStatus(data.message || "Registration failed.");
      return;
    }
    setForm({ name: "", email: "", phone: "" });
    setStatus(`Registered successfully for ${data.event.title}.`);
    await loadEvents();
    setSelectedEventId(data.event.id);
  }

  return (
    <main>
      <section className="hero">
        <div className="hero-copy">
          <p className="eyebrow">Event Management</p>
          <h1>Discover and register for upcoming events</h1>
          <p>Browse conferences, expos, workshops, and live experiences from one simple place.</p>
        </div>
        <div className="searchbar">
          <span>?</span>
          <input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search by event, type, or location" />
        </div>
      </section>

      <section className="layout">
        <div className="event-list">
          <div className="section-heading">
            <div>
              <p className="eyebrow">Upcoming</p>
              <h2>Events</h2>
            </div>
            <span>{filteredEvents.length} available</span>
          </div>
          {loading ? <p className="empty">Loading events...</p> : filteredEvents.map((eventItem) => (
            <button className={`event-card ${selectedEvent?.id === eventItem.id ? "active" : ""}`} key={eventItem.id} type="button" onClick={() => setSelectedEventId(eventItem.id)}>
              <img src={eventItem.imageUrl || "https://images.unsplash.com/photo-1505373877841-8d25f7d46678?auto=format&fit=crop&w=900&q=80"} alt="" />
              <span className="category">{eventItem.category}</span>
              <h3>{eventItem.title}</h3>
              <p>{eventItem.date} at {eventItem.time}</p>
              <p>{eventItem.location}</p>
              <div className="card-footer"><span>Rs. {eventItem.price}</span><span>{eventItem.seatsLeft} seats left</span></div>
            </button>
          ))}
          {!loading && !filteredEvents.length && <p className="empty">No events match your search.</p>}
        </div>

        <aside className="registration-panel">
          {selectedEvent ? (
            <>
              <img className="feature-image" src={selectedEvent.imageUrl || "https://images.unsplash.com/photo-1505373877841-8d25f7d46678?auto=format&fit=crop&w=900&q=80"} alt="" />
              <p className="eyebrow">{selectedEvent.category}</p>
              <h2>{selectedEvent.title}</h2>
              <p className="description">{selectedEvent.description}</p>
              <div className="details">
                <p>{selectedEvent.date} at {selectedEvent.time}</p>
                <p>{selectedEvent.location}</p>
                <p>{selectedEvent.registeredCount} registered, {selectedEvent.seatsLeft} seats left</p>
              </div>
              <form onSubmit={register}>
                <label>Full name<span><b>@</b><input name="name" value={form.name} onChange={updateForm} required /></span></label>
                <label>Email<span><b>#</b><input name="email" type="email" value={form.email} onChange={updateForm} required /></span></label>
                <label>Phone<span><b>+</b><input name="phone" value={form.phone} onChange={updateForm} required /></span></label>
                <button className="register-button" type="submit" disabled={selectedEvent.seatsLeft <= 0}>{selectedEvent.seatsLeft <= 0 ? "Sold Out" : "Register"}</button>
              </form>
              {status && <p className="notice">{status}</p>}
            </>
          ) : <p className="empty">Select an event to register.</p>}
        </aside>
      </section>
    </main>
  );
}

ReactDOM.createRoot(document.getElementById("root")).render(<App />);
