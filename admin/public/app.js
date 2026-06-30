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
  const selectedEvent = React.useMemo(() => events.find(event => event.id === selectedEventId) || events[0], [events, selectedEventId]);
  async function loadEvents() {
    setLoading(true);
    const response = await fetch(`${API_URL}/events`);
    if (!response.ok) {
      throw new Error("Backend API returned an error");
    }
    const data = await response.json();
    setEvents(data);
    setSelectedEventId(current => current || data[0]?.id || "");
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
    const {
      name,
      value
    } = event.target;
    setForm(current => ({
      ...current,
      [name]: value
    }));
  }
  async function createEvent(event) {
    event.preventDefault();
    setStatus("Creating event...");
    const response = await fetch(`${API_URL}/events`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
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
    await fetch(`${API_URL}/events/${id}`, {
      method: "DELETE"
    });
    setStatus("Event deleted.");
    setSelectedEventId("");
    await loadEvents();
  }
  return /*#__PURE__*/React.createElement("main", {
    className: "admin-shell"
  }, /*#__PURE__*/React.createElement("aside", {
    className: "sidebar"
  }, /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("p", {
    className: "eyebrow"
  }, "Admin Panel"), /*#__PURE__*/React.createElement("h1", null, "Event Control")), /*#__PURE__*/React.createElement("nav", null, /*#__PURE__*/React.createElement("a", {
    href: "#create"
  }, /*#__PURE__*/React.createElement("span", null, "+"), " Create Event"), /*#__PURE__*/React.createElement("a", {
    href: "#registrations"
  }, /*#__PURE__*/React.createElement("span", null, "#"), " Registrations"))), /*#__PURE__*/React.createElement("section", {
    className: "workspace"
  }, /*#__PURE__*/React.createElement("header", {
    className: "topbar"
  }, /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("p", {
    className: "eyebrow"
  }, "Dashboard"), /*#__PURE__*/React.createElement("h2", null, "Manage events and attendees")), /*#__PURE__*/React.createElement("div", {
    className: "stat"
  }, /*#__PURE__*/React.createElement("span", null, "#"), " ", events.reduce((total, event) => total + event.registeredCount, 0), " registrations")), status && /*#__PURE__*/React.createElement("p", {
    className: "notice"
  }, status), /*#__PURE__*/React.createElement("section", {
    className: "content-grid"
  }, /*#__PURE__*/React.createElement("form", {
    id: "create",
    className: "panel event-form",
    onSubmit: createEvent
  }, /*#__PURE__*/React.createElement("div", {
    className: "section-heading"
  }, /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("p", {
    className: "eyebrow"
  }, "Create"), /*#__PURE__*/React.createElement("h3", null, "New Event")), /*#__PURE__*/React.createElement("button", {
    className: "primary-button",
    type: "submit"
  }, /*#__PURE__*/React.createElement("span", null, "+"), " Publish")), /*#__PURE__*/React.createElement("label", null, "Event title", /*#__PURE__*/React.createElement("input", {
    name: "title",
    value: form.title,
    onChange: updateField,
    placeholder: "Annual business meetup",
    required: true
  })), /*#__PURE__*/React.createElement("div", {
    className: "two-column"
  }, /*#__PURE__*/React.createElement("label", null, "Category", /*#__PURE__*/React.createElement("select", {
    name: "category",
    value: form.category,
    onChange: updateField
  }, /*#__PURE__*/React.createElement("option", null, "Conference"), /*#__PURE__*/React.createElement("option", null, "Workshop"), /*#__PURE__*/React.createElement("option", null, "Expo"), /*#__PURE__*/React.createElement("option", null, "Meetup"), /*#__PURE__*/React.createElement("option", null, "Concert"))), /*#__PURE__*/React.createElement("label", null, "Location", /*#__PURE__*/React.createElement("input", {
    name: "location",
    value: form.location,
    onChange: updateField,
    placeholder: "Venue, city",
    required: true
  }))), /*#__PURE__*/React.createElement("div", {
    className: "two-column"
  }, /*#__PURE__*/React.createElement("label", null, "Date", /*#__PURE__*/React.createElement("input", {
    name: "date",
    type: "date",
    value: form.date,
    onChange: updateField,
    required: true
  })), /*#__PURE__*/React.createElement("label", null, "Time", /*#__PURE__*/React.createElement("input", {
    name: "time",
    type: "time",
    value: form.time,
    onChange: updateField,
    required: true
  }))), /*#__PURE__*/React.createElement("div", {
    className: "two-column"
  }, /*#__PURE__*/React.createElement("label", null, "Capacity", /*#__PURE__*/React.createElement("input", {
    name: "capacity",
    type: "number",
    min: "1",
    value: form.capacity,
    onChange: updateField,
    required: true
  })), /*#__PURE__*/React.createElement("label", null, "Price", /*#__PURE__*/React.createElement("input", {
    name: "price",
    type: "number",
    min: "0",
    value: form.price,
    onChange: updateField,
    required: true
  }))), /*#__PURE__*/React.createElement("label", null, "Image URL", /*#__PURE__*/React.createElement("input", {
    name: "imageUrl",
    value: form.imageUrl,
    onChange: updateField,
    placeholder: "https://..."
  })), /*#__PURE__*/React.createElement("label", null, "Description", /*#__PURE__*/React.createElement("textarea", {
    name: "description",
    value: form.description,
    onChange: updateField,
    rows: "5",
    required: true
  }))), /*#__PURE__*/React.createElement("section", {
    className: "panel",
    id: "registrations"
  }, /*#__PURE__*/React.createElement("div", {
    className: "section-heading"
  }, /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("p", {
    className: "eyebrow"
  }, "Live"), /*#__PURE__*/React.createElement("h3", null, "Registrations")), /*#__PURE__*/React.createElement("select", {
    value: selectedEvent?.id || "",
    onChange: event => setSelectedEventId(event.target.value)
  }, events.map(event => /*#__PURE__*/React.createElement("option", {
    key: event.id,
    value: event.id
  }, event.title)))), loading ? /*#__PURE__*/React.createElement("p", {
    className: "empty"
  }, "Loading events...") : selectedEvent ? /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement("div", {
    className: "event-summary"
  }, /*#__PURE__*/React.createElement("img", {
    src: selectedEvent.imageUrl || "https://images.unsplash.com/photo-1505373877841-8d25f7d46678?auto=format&fit=crop&w=900&q=80",
    alt: ""
  }), /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("h4", null, selectedEvent.title), /*#__PURE__*/React.createElement("p", null, selectedEvent.date, " at ", selectedEvent.time), /*#__PURE__*/React.createElement("p", null, selectedEvent.location), /*#__PURE__*/React.createElement("p", null, "Rs. ", selectedEvent.price)), /*#__PURE__*/React.createElement("button", {
    className: "icon-button",
    type: "button",
    onClick: () => deleteEvent(selectedEvent.id),
    title: "Delete event"
  }, "x")), /*#__PURE__*/React.createElement("div", {
    className: "table-wrap"
  }, /*#__PURE__*/React.createElement("table", null, /*#__PURE__*/React.createElement("thead", null, /*#__PURE__*/React.createElement("tr", null, /*#__PURE__*/React.createElement("th", null, "Name"), /*#__PURE__*/React.createElement("th", null, "Email"), /*#__PURE__*/React.createElement("th", null, "Phone"), /*#__PURE__*/React.createElement("th", null, "Registered"))), /*#__PURE__*/React.createElement("tbody", null, registrations.map(registration => /*#__PURE__*/React.createElement("tr", {
    key: registration.id
  }, /*#__PURE__*/React.createElement("td", null, registration.name), /*#__PURE__*/React.createElement("td", null, registration.email), /*#__PURE__*/React.createElement("td", null, registration.phone), /*#__PURE__*/React.createElement("td", null, new Date(registration.createdAt).toLocaleString()))))), !registrations.length && /*#__PURE__*/React.createElement("p", {
    className: "empty"
  }, "No registrations yet."))) : /*#__PURE__*/React.createElement("p", {
    className: "empty"
  }, "Create your first event to start collecting registrations.")))));
}
ReactDOM.createRoot(document.getElementById("root")).render(/*#__PURE__*/React.createElement(App, null));
