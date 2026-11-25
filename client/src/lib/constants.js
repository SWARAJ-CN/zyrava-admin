export const CHART_COLORS = [
  "#a78bfa",
  "#22d3ee",
  "#f472b6",
  "#fbbf24",
  "#34d399",
  "#60a5fa",
  "#fb7185",
  "#c084fc",
  "#2dd4bf",
  "#facc15",
];

export const EVENT_KIND_META = {
  play: { label: "Play", color: "primary" },
  complete: { label: "Completed", color: "success" },
  deep: { label: "Deep listen", color: "secondary" },
  skip: { label: "Skip", color: "warning" },
  like: { label: "Like", color: "danger" },
  unlike: { label: "Unlike", color: "default" },
  playlist_add: { label: "Playlist add", color: "secondary" },
  save: { label: "Save", color: "success" },
  search: { label: "Search", color: "default" },
};

export const RANGE_OPTIONS = [
  { value: "7d", label: "7D" },
  { value: "30d", label: "30D" },
  { value: "90d", label: "90D" },
  { value: "all", label: "1Y" },
];

export const NAV_SECTIONS = [
  {
    label: "Analytics",
    items: [
      { to: "/", label: "Overview", icon: "dashboard", end: true },
      { to: "/audience", label: "Audience", icon: "audience" },
      { to: "/visits", label: "Visitor log", icon: "visits" },
    ],
  },
  {
    label: "Management",
    items: [
      { to: "/users", label: "Users", icon: "users" },
      { to: "/content", label: "Content", icon: "content" },
      { to: "/sessions", label: "Sessions", icon: "sessions" },
      { to: "/payments", label: "Payments", icon: "payments" },
    ],
  },
  {
    label: "System",
    items: [{ to: "/system", label: "System health", icon: "system" }],
  },
];
