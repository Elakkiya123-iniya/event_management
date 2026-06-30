const API_URL = "http://localhost:5000/api";
function App() {
  const [events, setEvents] = React.useState([]);
  const [selectedEventId, setSelectedEventId] = React.useState("");
  const [query, setQuery] = React.useState("");
  const [form, setForm] = React.useState({
    name: "",
    email: "",
    phone: ""
  });
  const [status, setStatus] = React.useState("");
  const [loading, setLoading] = React.useState(true);
  const filteredEvents = React.useMemo(() => {
    const term = query.toLowerCase().trim();
    if (!term) return events;
    return events.filter(event => [event.title, event.category, event.location].some(value => value.toLowerCase().includes(term)));
  }, [events, query]);
  const selectedEvent = React.useMemo(() => events.find(event => event.id === selectedEventId) || filteredEvents[0], [events, filteredEvents, selectedEventId]);
  async function loadEvents() {
    const response = await fetch(`${API_URL}/events`);
    if (!response.ok) {
      throw new Error("Backend API returned an error");
    }
    const data = await response.json();
    setEvents(data);
    setSelectedEventId(current => current || data[0]?.id || "");
    setLoading(false);
  }
  React.useEffect(() => {
    loadEvents().catch(() => {
      setStatus("Backend API is not reachable.");
      setLoading(false);
    });
  }, []);
  function updateForm(event) {
    const {
      name,
      value
    } = event.target;
    setForm(current => ({
      ...current,
      [name]: value
    }));
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
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(form)
    });
    const data = await response.json();
    if (!response.ok) {
      setStatus(data.message || "Registration failed.");
      return;
    }
    setForm({
      name: "",
      email: "",
      phone: ""
    });
    setStatus(`Registered successfully for ${data.event.title}.`);
    await loadEvents();
    setSelectedEventId(data.event.id);
  }
  return /*#__PURE__*/React.createElement("main", null, /*#__PURE__*/React.createElement("section", {
    className: "hero"
  }, /*#__PURE__*/React.createElement("div", {
    className: "hero-copy"
  }, /*#__PURE__*/React.createElement("p", {
    className: "eyebrow"
  }, "Event Management"), /*#__PURE__*/React.createElement("h1", null, "Discover and register for upcoming events"), /*#__PURE__*/React.createElement("p", null, "Browse conferences, expos, workshops, and live experiences from one simple place.")), /*#__PURE__*/React.createElement("div", {
    className: "searchbar"
  }, /*#__PURE__*/React.createElement("span", null, "?"), /*#__PURE__*/React.createElement("input", {
    value: query,
    onChange: event => setQuery(event.target.value),
    placeholder: "Search by event, type, or location"
  }))), /*#__PURE__*/React.createElement("section", {
    className: "layout"
  }, /*#__PURE__*/React.createElement("div", {
    className: "event-list"
  }, /*#__PURE__*/React.createElement("div", {
    className: "section-heading"
  }, /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("p", {
    className: "eyebrow"
  }, "Upcoming"), /*#__PURE__*/React.createElement("h2", null, "Events")), /*#__PURE__*/React.createElement("span", null, filteredEvents.length, " available")), loading ? /*#__PURE__*/React.createElement("p", {
    className: "empty"
  }, "Loading events...") : filteredEvents.map(eventItem => /*#__PURE__*/React.createElement("button", {
    className: `event-card ${selectedEvent?.id === eventItem.id ? "active" : ""}`,
    key: eventItem.id,
    type: "button",
    onClick: () => setSelectedEventId(eventItem.id)
  }, /*#__PURE__*/React.createElement("img", {
    src: eventItem.imageUrl || "https://images.unsplash.com/photo-1505373877841-8d25f7d46678?auto=format&fit=crop&w=900&q=80",
    alt: ""
  }), /*#__PURE__*/React.createElement("span", {
    className: "category"
  }, eventItem.category), /*#__PURE__*/React.createElement("h3", null, eventItem.title), /*#__PURE__*/React.createElement("p", null, eventItem.date, " at ", eventItem.time), /*#__PURE__*/React.createElement("p", null, eventItem.location), /*#__PURE__*/React.createElement("div", {
    className: "card-footer"
  }, /*#__PURE__*/React.createElement("span", null, "Rs. ", eventItem.price), /*#__PURE__*/React.createElement("span", null, eventItem.seatsLeft, " seats left")))), !loading && !filteredEvents.length && /*#__PURE__*/React.createElement("p", {
    className: "empty"
  }, "No events match your search.")), /*#__PURE__*/React.createElement("aside", {
    className: "registration-panel"
  }, selectedEvent ? /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement("img", {
    className: "feature-image",
    src: selectedEvent.imageUrl || "https://images.unsplash.com/photo-1505373877841-8d25f7d46678?auto=format&fit=crop&w=900&q=80",
    alt: ""
  }), /*#__PURE__*/React.createElement("p", {
    className: "eyebrow"
  }, selectedEvent.category), /*#__PURE__*/React.createElement("h2", null, selectedEvent.title), /*#__PURE__*/React.createElement("p", {
    className: "description"
  }, selectedEvent.description), /*#__PURE__*/React.createElement("div", {
    className: "details"
  }, /*#__PURE__*/React.createElement("p", null, selectedEvent.date, " at ", selectedEvent.time), /*#__PURE__*/React.createElement("p", null, selectedEvent.location), /*#__PURE__*/React.createElement("p", null, selectedEvent.registeredCount, " registered, ", selectedEvent.seatsLeft, " seats left")), /*#__PURE__*/React.createElement("form", {
    onSubmit: register
  }, /*#__PURE__*/React.createElement("label", null, "Full name", /*#__PURE__*/React.createElement("span", null, /*#__PURE__*/React.createElement("b", null, "@"), /*#__PURE__*/React.createElement("input", {
    name: "name",
    value: form.name,
    onChange: updateForm,
    required: true
  }))), /*#__PURE__*/React.createElement("label", null, "Email", /*#__PURE__*/React.createElement("span", null, /*#__PURE__*/React.createElement("b", null, "#"), /*#__PURE__*/React.createElement("input", {
    name: "email",
    type: "email",
    value: form.email,
    onChange: updateForm,
    required: true
  }))), /*#__PURE__*/React.createElement("label", null, "Phone", /*#__PURE__*/React.createElement("span", null, /*#__PURE__*/React.createElement("b", null, "+"), /*#__PURE__*/React.createElement("input", {
    name: "phone",
    value: form.phone,
    onChange: updateForm,
    required: true
  }))), /*#__PURE__*/React.createElement("button", {
    className: "register-button",
    type: "submit",
    disabled: selectedEvent.seatsLeft <= 0
  }, selectedEvent.seatsLeft <= 0 ? "Sold Out" : "Register")), status && /*#__PURE__*/React.createElement("p", {
    className: "notice"
  }, status)) : /*#__PURE__*/React.createElement("p", {
    className: "empty"
  }, "Select an event to register."))));
}
ReactDOM.createRoot(document.getElementById("root")).render(/*#__PURE__*/React.createElement(App, null));
