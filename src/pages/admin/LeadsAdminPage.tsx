import { useCallback, useEffect, useMemo, useState } from "react";
import { FaPhoneAlt, FaWhatsapp, FaSync, FaSignOutAlt, FaDownload } from "react-icons/fa";
import { GlassCard } from "@/components/ui/GlassCard";
import { MagneticButton } from "@/components/ui/MagneticButton";
import { useSeo } from "@/hooks/useSeo";
import { listLeads, updateLeadStatus } from "@/api/adminLeads";
import { ApiError } from "@/api/client";
import { LEAD_STATUSES, type LeadOut, type LeadStatus } from "@/types/lead";
import {
  BUDGET_OPTIONS,
  SERVICE_OPTIONS,
  TIMELINE_OPTIONS,
  labelFor,
} from "@/data/leadOptions";

// The key doubles as the page password: it is sent as X-Admin-Key and the
// backend decides whether it is right, so there is no password check here to
// bypass in the bundle.
const STORAGE_KEY = "dhiman_admin_key";
const PAGE_SIZE = 50;

const STATUS_STYLES: Record<LeadStatus, string> = {
  new: "border-gold/50 text-gold",
  contacted: "border-sky-400/50 text-sky-300",
  qualified: "border-violet-400/50 text-violet-300",
  won: "border-emerald-400/50 text-emerald-300",
  lost: "border-grey/40 text-grey",
};

/** Backend timestamps are naive UTC — mark them so the browser localises them. */
function formatCreatedAt(value: string) {
  const iso = /[Z+]|-\d{2}:\d{2}$/.test(value) ? value : `${value}Z`;
  return new Date(iso).toLocaleString("en-IN", {
    day: "2-digit",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function toCsv(leads: LeadOut[]) {
  const headers = [
    "id",
    "created_at",
    "name",
    "phone",
    "email",
    "city",
    "service",
    "budget_range",
    "timeline",
    "message",
    "source",
    "utm_source",
    "utm_medium",
    "utm_campaign",
    "status",
  ];
  const escape = (value: unknown) => `"${String(value ?? "").replace(/"/g, '""')}"`;
  const rows = leads.map((lead) =>
    headers.map((header) => escape(lead[header as keyof LeadOut])).join(",")
  );
  return [headers.join(","), ...rows].join("\r\n");
}

function LoginGate({ onSubmit, error }: { onSubmit: (key: string) => void; error: string | null }) {
  const [password, setPassword] = useState("");

  return (
    <div className="flex min-h-screen items-center justify-center bg-ink px-6">
      <GlassCard className="w-full max-w-sm p-8">
        <h1 className="font-display text-2xl text-cream">Leads Dashboard</h1>
        <p className="mt-2 text-sm text-grey">Enter the admin password to continue.</p>
        <form
          className="mt-8 flex flex-col gap-6"
          onSubmit={(e) => {
            e.preventDefault();
            onSubmit(password.trim());
          }}
        >
          <input
            type="password"
            value={password}
            autoFocus
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Password"
            className="w-full border-b border-grey/30 bg-transparent pb-3 pt-2 text-cream outline-none transition-colors placeholder:text-grey/60 focus:border-gold"
          />
          {error && <p className="text-sm text-red-400">{error}</p>}
          <MagneticButton type="submit" variant="solid">
            Sign In
          </MagneticButton>
        </form>
      </GlassCard>
    </div>
  );
}

export function LeadsAdminPage() {
  const [adminKey, setAdminKey] = useState<string | null>(() => {
    try {
      return localStorage.getItem(STORAGE_KEY);
    } catch {
      return null;
    }
  });
  const [leads, setLeads] = useState<LeadOut[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [authError, setAuthError] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState<LeadStatus | "">("");
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(0);

  useSeo({
    title: "Leads Dashboard",
    description: "Internal leads dashboard.",
    path: "/admin/leads",
    noindex: true,
  });

  const signOut = useCallback(() => {
    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch {
      // storage unavailable (private mode) — the in-memory reset below is enough
    }
    setAdminKey(null);
    setLeads([]);
    setTotal(0);
  }, []);

  const load = useCallback(
    async (key: string, signal?: AbortSignal) => {
      setLoading(true);
      setError(null);
      try {
        const data = await listLeads(key, {
          status: statusFilter,
          limit: PAGE_SIZE,
          offset: page * PAGE_SIZE,
          signal,
        });
        setLeads(data.items);
        setTotal(data.total);
      } catch (err) {
        if (err instanceof DOMException && err.name === "AbortError") return;
        if (err instanceof ApiError && err.status === 401) {
          signOut();
          setAuthError("Wrong password.");
          return;
        }
        setError(
          err instanceof ApiError ? err.message : "Couldn't load leads. Is the backend running?"
        );
      } finally {
        setLoading(false);
      }
    },
    [statusFilter, page, signOut]
  );

  useEffect(() => {
    if (!adminKey) return;
    const controller = new AbortController();
    void load(adminKey, controller.signal);
    return () => controller.abort();
  }, [adminKey, load]);

  const handleLogin = (key: string) => {
    if (!key) return;
    setAuthError(null);
    try {
      localStorage.setItem(STORAGE_KEY, key);
    } catch {
      // storage unavailable — the key still lives in state for this session
    }
    setAdminKey(key);
  };

  const handleStatusChange = async (lead: LeadOut, status: LeadStatus) => {
    if (!adminKey) return;
    const previous = lead.status;
    // Optimistic — the dropdown should not lag behind the click.
    setLeads((current) =>
      current.map((row) => (row.id === lead.id ? { ...row, status } : row))
    );
    try {
      await updateLeadStatus(adminKey, lead.id, status);
    } catch (err) {
      setLeads((current) =>
        current.map((row) => (row.id === lead.id ? { ...row, status: previous } : row))
      );
      setError(err instanceof ApiError ? err.message : "Couldn't update the status.");
    }
  };

  // Search runs over the loaded page only — the backend has no text filter.
  const visibleLeads = useMemo(() => {
    const query = search.trim().toLowerCase();
    if (!query) return leads;
    return leads.filter((lead) =>
      [lead.name, lead.phone, lead.email, lead.city, lead.utm_campaign]
        .filter(Boolean)
        .some((field) => String(field).toLowerCase().includes(query))
    );
  }, [leads, search]);

  const downloadCsv = () => {
    const blob = new Blob([toCsv(visibleLeads)], { type: "text/csv;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `leads-${new Date().toISOString().slice(0, 10)}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  };

  if (!adminKey) return <LoginGate onSubmit={handleLogin} error={authError} />;

  const lastPage = Math.max(0, Math.ceil(total / PAGE_SIZE) - 1);

  return (
    <div className="min-h-screen bg-ink px-4 pb-20 pt-28 md:px-8 md:pt-32">
      <div className="mx-auto max-w-[1600px]">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <h1 className="font-display text-3xl text-cream md:text-4xl">Leads</h1>
            <p className="mt-2 text-sm text-grey">
              {total} total{statusFilter && ` · filtered by ${statusFilter}`}
              {search && ` · ${visibleLeads.length} matching on this page`}
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <button
              type="button"
              onClick={() => adminKey && load(adminKey)}
              className="flex items-center gap-2 rounded-full border border-gold/40 px-4 py-2 text-xs text-cream transition-colors hover:bg-gold hover:text-ink"
            >
              <FaSync className={loading ? "animate-spin" : ""} /> Refresh
            </button>
            <button
              type="button"
              onClick={downloadCsv}
              disabled={!visibleLeads.length}
              className="flex items-center gap-2 rounded-full border border-gold/40 px-4 py-2 text-xs text-cream transition-colors hover:bg-gold hover:text-ink disabled:opacity-40"
            >
              <FaDownload /> Export CSV
            </button>
            <button
              type="button"
              onClick={signOut}
              className="flex items-center gap-2 rounded-full border border-grey/30 px-4 py-2 text-xs text-grey transition-colors hover:border-red-400/50 hover:text-red-300"
            >
              <FaSignOutAlt /> Sign out
            </button>
          </div>
        </div>

        {/* Filters */}
        <div className="mt-8 flex flex-wrap items-center gap-3">
          <button
            type="button"
            onClick={() => {
              setStatusFilter("");
              setPage(0);
            }}
            className={`rounded-full border px-4 py-2 text-xs capitalize transition-colors ${
              statusFilter === "" ? "border-gold bg-gold/10 text-gold" : "border-grey/30 text-grey"
            }`}
          >
            All
          </button>
          {LEAD_STATUSES.map((status) => (
            <button
              key={status}
              type="button"
              onClick={() => {
                setStatusFilter(status);
                setPage(0);
              }}
              className={`rounded-full border px-4 py-2 text-xs capitalize transition-colors ${
                statusFilter === status
                  ? "border-gold bg-gold/10 text-gold"
                  : "border-grey/30 text-grey"
              }`}
            >
              {status}
            </button>
          ))}
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search name, phone, city…"
            className="ml-auto w-full max-w-xs rounded-full border border-grey/30 bg-transparent px-4 py-2 text-xs text-cream outline-none transition-colors placeholder:text-grey/60 focus:border-gold"
          />
        </div>

        {error && <p className="mt-6 text-sm text-red-400">{error}</p>}

        {/* Table */}
        <GlassCard className="mt-6 overflow-x-auto">
          <table className="w-full min-w-[1100px] border-collapse text-left text-sm">
            <thead>
              <tr className="border-b border-gold/15 text-xs uppercase tracking-wider text-grey">
                <th className="px-4 py-4 font-normal">Received</th>
                <th className="px-4 py-4 font-normal">Name</th>
                <th className="px-4 py-4 font-normal">Contact</th>
                <th className="px-4 py-4 font-normal">City</th>
                <th className="px-4 py-4 font-normal">Requirement</th>
                <th className="px-4 py-4 font-normal">Budget</th>
                <th className="px-4 py-4 font-normal">Timeline</th>
                <th className="px-4 py-4 font-normal">Source</th>
                <th className="px-4 py-4 font-normal">Status</th>
              </tr>
            </thead>
            <tbody>
              {visibleLeads.map((lead) => (
                <tr key={lead.id} className="border-b border-grey/10 align-top last:border-0">
                  <td className="whitespace-nowrap px-4 py-4 text-xs text-grey">
                    {formatCreatedAt(lead.created_at)}
                  </td>
                  <td className="px-4 py-4">
                    <p className="text-cream">{lead.name}</p>
                    {lead.message && (
                      <p className="mt-1 max-w-xs text-xs leading-relaxed text-grey">
                        {lead.message}
                      </p>
                    )}
                  </td>
                  <td className="whitespace-nowrap px-4 py-4">
                    <div className="flex items-center gap-2">
                      <a
                        href={`tel:${lead.phone}`}
                        className="flex items-center gap-1.5 text-cream transition-colors hover:text-gold"
                      >
                        <FaPhoneAlt className="text-xs" /> {lead.phone}
                      </a>
                      <a
                        href={`https://wa.me/${lead.phone.length === 10 ? `91${lead.phone}` : lead.phone}`}
                        target="_blank"
                        rel="noreferrer"
                        aria-label={`WhatsApp ${lead.name}`}
                        className="text-grey transition-colors hover:text-emerald-400"
                      >
                        <FaWhatsapp />
                      </a>
                    </div>
                    {lead.email && <p className="mt-1 text-xs text-grey">{lead.email}</p>}
                  </td>
                  <td className="px-4 py-4 text-grey">{lead.city ?? "—"}</td>
                  <td className="px-4 py-4 text-cream">
                    {labelFor(SERVICE_OPTIONS, lead.service)}
                  </td>
                  <td className="px-4 py-4 text-grey">
                    {labelFor(BUDGET_OPTIONS, lead.budget_range)}
                  </td>
                  <td className="px-4 py-4 text-grey">
                    {labelFor(TIMELINE_OPTIONS, lead.timeline)}
                  </td>
                  <td className="px-4 py-4 text-xs text-grey">
                    <p className="text-cream">{lead.source}</p>
                    {lead.utm_source && (
                      <p className="mt-1">
                        {lead.utm_source}
                        {lead.utm_medium && ` / ${lead.utm_medium}`}
                      </p>
                    )}
                    {lead.utm_campaign && <p>{lead.utm_campaign}</p>}
                  </td>
                  <td className="px-4 py-4">
                    <select
                      value={lead.status}
                      onChange={(e) => handleStatusChange(lead, e.target.value as LeadStatus)}
                      className={`rounded-full border bg-transparent px-3 py-1.5 text-xs capitalize outline-none ${STATUS_STYLES[lead.status]} [&>option]:bg-charcoal [&>option]:text-cream`}
                    >
                      {LEAD_STATUSES.map((status) => (
                        <option key={status} value={status}>
                          {status}
                        </option>
                      ))}
                    </select>
                  </td>
                </tr>
              ))}
              {!visibleLeads.length && (
                <tr>
                  <td colSpan={9} className="px-4 py-16 text-center text-sm text-grey">
                    {loading ? "Loading leads…" : "No leads to show."}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </GlassCard>

        {/* Pagination */}
        {total > PAGE_SIZE && (
          <div className="mt-6 flex items-center justify-between text-xs text-grey">
            <span>
              Page {page + 1} of {lastPage + 1}
            </span>
            <div className="flex gap-3">
              <button
                type="button"
                disabled={page === 0}
                onClick={() => setPage((p) => Math.max(0, p - 1))}
                className="rounded-full border border-grey/30 px-4 py-2 transition-colors hover:border-gold hover:text-gold disabled:opacity-40"
              >
                Previous
              </button>
              <button
                type="button"
                disabled={page >= lastPage}
                onClick={() => setPage((p) => Math.min(lastPage, p + 1))}
                className="rounded-full border border-grey/30 px-4 py-2 transition-colors hover:border-gold hover:text-gold disabled:opacity-40"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
