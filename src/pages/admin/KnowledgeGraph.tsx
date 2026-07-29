// Admin-only "Knowledge Graph" viewer for the Graphify graph.
//
// SECURITY: the full graph is fetched ONLY from the `knowledge-graph` edge
// function, which is gated by requireAdmin() server-side. Nothing here is
// reachable by public users (the whole /admin tree is behind AdminLayout, and
// the data endpoint independently rejects non-admins). The bundled metadata
// import below is just a timestamp/commit/counts — no graph content, no secrets.
import { useEffect, useMemo, useRef, useState, useCallback } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { supabase } from "@/lib/supabase";
import {
    Share2, RefreshCw, Search, AlertTriangle, Clock, GitCommit,
    Boxes, Network, Copy, Check, Loader2, Eye,
} from "lucide-react";
import localMeta from "@/data/knowledge-graph-meta.json";
// Public-safe domain graph (trades/scenarios/authorities). Bundled so the admin
// always sees the RAG knowledge connections, even before the gated code-graph
// endpoint is deployed. Contains no code/file nodes and no secrets.
import domainGraph from "@/data/domain-graph.json";

interface GNode {
    id: string; label: string; file_type?: string; source_file?: string;
    kind?: string; community?: number | null; risk_level?: string | null;
    action_plan?: string | null; region?: string | null; url?: string | null; _origin?: string;
}
interface GEdge { source: string; target: string; relation: string; }
interface GMeta {
    generatedAt?: string; commit?: string; graphifyVersion?: string;
    counts?: { codeNodes: number; codeEdges: number; domainNodes: number; domainEdges: number };
}
interface GraphData { nodes: GNode[]; edges: GEdge[]; meta?: GMeta }

const MAX_VISIBLE = 350; // keep the canvas smooth

const colorFor = (n: GNode): string => {
    if (n._origin === "domain" || n.kind) {
        if (n.kind === "trade") return "#D4AF37";
        if (n.kind === "scenario") return "#ef4444";
        if (n.kind === "authority") return "#3b82f6";
        return "#a855f7";
    }
    // code nodes: tint by community for some variety
    const c = (n.community ?? 0) % 6;
    return ["#64748b", "#0ea5e9", "#10b981", "#f59e0b", "#8b5cf6", "#ec4899"][c];
};

function timeAgo(iso?: string): string {
    if (!iso) return "unknown";
    const d = new Date(iso).getTime();
    if (Number.isNaN(d)) return "unknown";
    const s = Math.floor((Date.now() - d) / 1000);
    if (s < 60) return "just now";
    if (s < 3600) return `${Math.floor(s / 60)}m ago`;
    if (s < 86400) return `${Math.floor(s / 3600)}h ago`;
    return `${Math.floor(s / 86400)}d ago`;
}

export default function KnowledgeGraph() {
    const [data, setData] = useState<GraphData | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [query, setQuery] = useState("");
    const [kindFilter, setKindFilter] = useState<"all" | "domain" | "code">("domain");
    const [selected, setSelected] = useState<string | null>(null);
    const [copied, setCopied] = useState(false);

    const canvasRef = useRef<HTMLCanvasElement | null>(null);
    const viewRef = useRef({ scale: 1, ox: 0, oy: 0, dragging: false, lx: 0, ly: 0 });
    const posRef = useRef<Map<string, { x: number; y: number }>>(new Map());

    const meta: GMeta = data?.meta || (localMeta as GMeta);

    // ---- Load full graph from the gated endpoint -------------------------
    useEffect(() => {
        let cancelled = false;
        (async () => {
            setLoading(true); setError(null);
            try {
                const { data: res, error: err } = await supabase.functions.invoke("knowledge-graph");
                if (err) throw err;
                if (!res || !Array.isArray((res as GraphData).nodes)) throw new Error("Malformed graph response");
                if (!cancelled) setData(res as GraphData);
            } catch (e) {
                if (!cancelled) {
                    setError((e as Error).message || "Failed to load graph");
                    // Fallback so the admin never sees an empty graph: render the
                    // bundled domain knowledge graph (the RAG connections) even when
                    // the gated code-graph endpoint isn't deployed/reachable yet.
                    const dg = domainGraph as unknown as GraphData;
                    if (Array.isArray(dg?.nodes) && dg.nodes.length) setData(dg);
                }
            } finally {
                if (!cancelled) setLoading(false);
            }
        })();
        return () => { cancelled = true; };
    }, []);

    // ---- Adjacency + degree ---------------------------------------------
    const { adj, degree, nodeById } = useMemo(() => {
        const adj = new Map<string, Set<string>>();
        const degree = new Map<string, number>();
        const nodeById = new Map<string, GNode>();
        if (data) {
            for (const n of data.nodes) nodeById.set(n.id, n);
            for (const e of data.edges) {
                if (!adj.has(e.source)) adj.set(e.source, new Set());
                if (!adj.has(e.target)) adj.set(e.target, new Set());
                adj.get(e.source)!.add(e.target);
                adj.get(e.target)!.add(e.source);
                degree.set(e.source, (degree.get(e.source) || 0) + 1);
                degree.set(e.target, (degree.get(e.target) || 0) + 1);
            }
        }
        return { adj, degree, nodeById };
    }, [data]);

    // ---- Compute the visible subgraph ------------------------------------
    const visible = useMemo(() => {
        if (!data) return { nodes: [] as GNode[], edges: [] as GEdge[] };
        const q = query.trim().toLowerCase();

        const matchesKind = (n: GNode) =>
            kindFilter === "all" ? true :
            kindFilter === "domain" ? (n._origin === "domain" || !!n.kind) :
            (n._origin !== "domain" && !n.kind);

        let ids = new Set<string>();
        if (q) {
            // search hits + their 1-hop neighbours
            for (const n of data.nodes) {
                if ((n.label?.toLowerCase().includes(q) || n.source_file?.toLowerCase().includes(q)) && matchesKind(n)) {
                    ids.add(n.id);
                    for (const nb of adj.get(n.id) || []) ids.add(nb);
                }
            }
        } else if (selected) {
            ids.add(selected);
            for (const nb of adj.get(selected) || []) ids.add(nb);
        } else {
            for (const n of data.nodes) if (matchesKind(n)) ids.add(n.id);
        }

        let nodes = data.nodes.filter((n) => ids.has(n.id));
        if (nodes.length > MAX_VISIBLE) {
            nodes = [...nodes].sort((a, b) => (degree.get(b.id) || 0) - (degree.get(a.id) || 0)).slice(0, MAX_VISIBLE);
        }
        const visibleIds = new Set(nodes.map((n) => n.id));
        const edges = data.edges.filter((e) => visibleIds.has(e.source) && visibleIds.has(e.target));
        return { nodes, edges };
    }, [data, query, kindFilter, selected, adj, degree]);

    // ---- Deterministic force layout for the visible subgraph -------------
    useEffect(() => {
        const nodes = visible.nodes;
        if (!nodes.length) { posRef.current = new Map(); draw(); return; }
        // seeded circular start
        const pos = new Map<string, { x: number; y: number; vx: number; vy: number }>();
        nodes.forEach((n, i) => {
            const a = (i / nodes.length) * Math.PI * 2;
            pos.set(n.id, { x: Math.cos(a) * 250 + (i % 7) * 3, y: Math.sin(a) * 250 + (i % 5) * 3, vx: 0, vy: 0 });
        });
        const idx = new Map(nodes.map((n, i) => [n.id, i]));
        const iters = nodes.length > 150 ? 120 : 220;
        const k = 90; // ideal edge length
        for (let it = 0; it < iters; it++) {
            // repulsion (O(n^2) on the capped visible set)
            for (let i = 0; i < nodes.length; i++) {
                const a = pos.get(nodes[i].id)!;
                for (let j = i + 1; j < nodes.length; j++) {
                    const b = pos.get(nodes[j].id)!;
                    let dx = a.x - b.x, dy = a.y - b.y;
                    let d2 = dx * dx + dy * dy || 0.01;
                    const f = 2600 / d2;
                    const d = Math.sqrt(d2);
                    const ux = dx / d, uy = dy / d;
                    a.vx += ux * f; a.vy += uy * f; b.vx -= ux * f; b.vy -= uy * f;
                }
            }
            // springs
            for (const e of visible.edges) {
                const a = pos.get(e.source)!, b = pos.get(e.target)!;
                if (!a || !b) continue;
                let dx = b.x - a.x, dy = b.y - a.y;
                const d = Math.sqrt(dx * dx + dy * dy) || 0.01;
                const f = (d - k) * 0.02;
                const ux = dx / d, uy = dy / d;
                a.vx += ux * f; a.vy += uy * f; b.vx -= ux * f; b.vy -= uy * f;
            }
            // integrate + gentle centering + damping
            for (const n of nodes) {
                const p = pos.get(n.id)!;
                p.vx -= p.x * 0.0015; p.vy -= p.y * 0.0015;
                p.x += p.vx * 0.85; p.y += p.vy * 0.85;
                p.vx *= 0.82; p.vy *= 0.82;
            }
        }
        const flat = new Map<string, { x: number; y: number }>();
        for (const n of nodes) { const p = pos.get(n.id)!; flat.set(n.id, { x: p.x, y: p.y }); }
        posRef.current = flat;
        // reset view to fit
        viewRef.current.scale = 1; viewRef.current.ox = 0; viewRef.current.oy = 0;
        draw();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [visible]);

    // ---- Canvas drawing --------------------------------------------------
    const draw = useCallback(() => {
        const cv = canvasRef.current; if (!cv) return;
        const ctx = cv.getContext("2d"); if (!ctx) return;
        const W = cv.width, H = cv.height;
        ctx.clearRect(0, 0, W, H);
        ctx.fillStyle = "#0b0b0f"; ctx.fillRect(0, 0, W, H);
        const { scale, ox, oy } = viewRef.current;
        const tx = (x: number) => x * scale + W / 2 + ox;
        const ty = (y: number) => y * scale + H / 2 + oy;
        const pos = posRef.current;

        // edges
        ctx.lineWidth = 1; ctx.strokeStyle = "rgba(148,163,184,0.18)";
        ctx.beginPath();
        for (const e of visible.edges) {
            const a = pos.get(e.source), b = pos.get(e.target);
            if (!a || !b) continue;
            ctx.moveTo(tx(a.x), ty(a.y)); ctx.lineTo(tx(b.x), ty(b.y));
        }
        ctx.stroke();

        // nodes
        for (const n of visible.nodes) {
            const p = pos.get(n.id); if (!p) continue;
            const x = tx(p.x), y = ty(p.y);
            const deg = degree.get(n.id) || 1;
            const r = Math.max(3, Math.min(11, 3 + Math.sqrt(deg))) * (n.id === selected ? 1.7 : 1);
            ctx.beginPath(); ctx.arc(x, y, r, 0, Math.PI * 2);
            ctx.fillStyle = colorFor(n);
            ctx.globalAlpha = n.id === selected ? 1 : 0.92;
            ctx.fill(); ctx.globalAlpha = 1;
            if (n.id === selected) { ctx.lineWidth = 2; ctx.strokeStyle = "#fff"; ctx.stroke(); }
            // labels for domain nodes, selected, or high-degree
            if (scale > 0.75 && (n.kind || n.id === selected || deg > 6)) {
                ctx.fillStyle = "rgba(226,232,240,0.92)"; ctx.font = "11px ui-sans-serif, system-ui";
                ctx.fillText(String(n.label || "").slice(0, 28), x + r + 3, y + 4);
            }
        }
    }, [visible, degree, selected]);

    useEffect(() => { draw(); }, [draw]);

    // resize canvas to container
    useEffect(() => {
        const cv = canvasRef.current; if (!cv) return;
        const ro = new ResizeObserver(() => {
            const parent = cv.parentElement; if (!parent) return;
            cv.width = parent.clientWidth; cv.height = Math.max(420, parent.clientHeight);
            draw();
        });
        if (cv.parentElement) ro.observe(cv.parentElement);
        return () => ro.disconnect();
    }, [draw]);

    // ---- Canvas interaction ----------------------------------------------
    const hitTest = (mx: number, my: number): GNode | null => {
        const cv = canvasRef.current; if (!cv) return null;
        const { scale, ox, oy } = viewRef.current;
        const W = cv.width, H = cv.height;
        let best: GNode | null = null, bestD = 18 * 18;
        for (const n of visible.nodes) {
            const p = posRef.current.get(n.id); if (!p) continue;
            const x = p.x * scale + W / 2 + ox, y = p.y * scale + H / 2 + oy;
            const d = (x - mx) ** 2 + (y - my) ** 2;
            if (d < bestD) { bestD = d; best = n; }
        }
        return best;
    };

    const onWheel = (e: React.WheelEvent) => {
        e.preventDefault();
        const v = viewRef.current;
        v.scale = Math.min(4, Math.max(0.25, v.scale * (e.deltaY < 0 ? 1.1 : 0.9)));
        draw();
    };
    const onDown = (e: React.MouseEvent) => {
        const v = viewRef.current; v.dragging = true; v.lx = e.clientX; v.ly = e.clientY;
    };
    const onMove = (e: React.MouseEvent) => {
        const v = viewRef.current; if (!v.dragging) return;
        v.ox += e.clientX - v.lx; v.oy += e.clientY - v.ly; v.lx = e.clientX; v.ly = e.clientY; draw();
    };
    const onUp = (e: React.MouseEvent) => {
        const v = viewRef.current;
        const moved = Math.abs(e.clientX - v.lx) + Math.abs(e.clientY - v.ly);
        v.dragging = false;
        if (moved < 4) {
            const rect = (e.target as HTMLCanvasElement).getBoundingClientRect();
            const hit = hitTest(e.clientX - rect.left, e.clientY - rect.top);
            if (hit) { setQuery(""); setSelected(hit.id); }
        }
    };

    const selectedNode = selected ? nodeById.get(selected) : null;
    const selectedNeighbors = selected ? [...(adj.get(selected) || [])].map((id) => nodeById.get(id)).filter(Boolean) as GNode[] : [];

    const copyCmd = () => {
        navigator.clipboard?.writeText("npm run graph:build").then(() => {
            setCopied(true); setTimeout(() => setCopied(false), 1800);
        }).catch(() => { /* clipboard optional */ });
    };

    return (
        <div className="p-6 space-y-6">
            <div className="flex items-center gap-3">
                <Network className="w-7 h-7 text-gold" />
                <div>
                    <h1 className="text-2xl font-display text-foreground">Knowledge Graph</h1>
                    <p className="text-sm text-muted-foreground">
                        Graphify view of how the RAG knowledge, pages, services and code connect. Admin only.
                    </p>
                </div>
            </div>

            {/* Metadata + regenerate */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <Card className="p-4">
                    <div className="flex items-center gap-2 text-muted-foreground text-xs mb-1"><Clock className="w-4 h-4" /> Last generated</div>
                    <div className="text-lg font-semibold text-foreground">{timeAgo(meta.generatedAt)}</div>
                    <div className="text-xs text-muted-foreground">{meta.generatedAt ? new Date(meta.generatedAt).toLocaleString() : "—"}</div>
                </Card>
                <Card className="p-4">
                    <div className="flex items-center gap-2 text-muted-foreground text-xs mb-1"><GitCommit className="w-4 h-4" /> Built from commit</div>
                    <div className="text-lg font-semibold text-foreground font-mono">{meta.commit || "—"}</div>
                    <div className="text-xs text-muted-foreground">Graphify v{meta.graphifyVersion || "?"}</div>
                </Card>
                <Card className="p-4">
                    <div className="flex items-center gap-2 text-muted-foreground text-xs mb-1"><Boxes className="w-4 h-4" /> Nodes</div>
                    <div className="text-lg font-semibold text-foreground">
                        {(meta.counts?.codeNodes ?? 0) + (meta.counts?.domainNodes ?? 0)}
                    </div>
                    <div className="text-xs text-muted-foreground">{meta.counts?.codeNodes ?? 0} code · {meta.counts?.domainNodes ?? 0} domain</div>
                </Card>
                <Card className="p-4 flex flex-col justify-between">
                    <div className="flex items-center gap-2 text-muted-foreground text-xs mb-1"><RefreshCw className="w-4 h-4" /> Regenerate</div>
                    <Button variant="outline" size="sm" onClick={copyCmd} className="justify-start font-mono text-xs">
                        {copied ? <Check className="w-3 h-3 mr-1" /> : <Copy className="w-3 h-3 mr-1" />} npm run graph:build
                    </Button>
                    <div className="text-[11px] text-muted-foreground mt-1">Run locally, then redeploy the edge function. Does not affect the live site.</div>
                </Card>
            </div>

            {/* Controls */}
            <Card className="p-4">
                <div className="flex flex-wrap items-center gap-3">
                    <div className="relative flex-1 min-w-[220px]">
                        <Search className="w-4 h-4 absolute left-3 top-2.5 text-muted-foreground" />
                        <input
                            value={query}
                            onChange={(e) => { setQuery(e.target.value); setSelected(null); }}
                            placeholder="Search nodes (file, function, trade, scenario…)"
                            className="w-full pl-9 pr-3 py-2 rounded-md bg-background border border-border text-sm text-foreground"
                        />
                    </div>
                    <div className="flex gap-1">
                        {(["domain", "code", "all"] as const).map((k) => (
                            <Button key={k} size="sm" variant={kindFilter === k ? "default" : "outline"}
                                onClick={() => { setKindFilter(k); setSelected(null); }} className="capitalize">{k}</Button>
                        ))}
                    </div>
                    {selected && <Button size="sm" variant="ghost" onClick={() => setSelected(null)}>Clear selection</Button>}
                </div>
            </Card>

            {error && (
                <Card className="p-4 border-amber-500/40 bg-amber-500/5">
                    <div className="flex items-start gap-2 text-amber-600 dark:text-amber-400">
                        <AlertTriangle className="w-5 h-5 mt-0.5" />
                        <div className="text-sm">
                            <p className="font-semibold">Showing the domain knowledge graph (trades · scenarios · authorities).</p>
                            <p className="text-muted-foreground mt-1">
                                The full code-architecture graph loads from the secure admin endpoint, which isn't reachable yet.
                                Deploy it once to enable the <b>Code</b> / <b>All</b> views:&nbsp;
                                <code className="bg-background px-1.5 py-0.5 rounded">supabase functions deploy knowledge-graph</code>.
                            </p>
                            <p className="text-muted-foreground/70 mt-1 text-xs">Endpoint detail: {error}</p>
                        </div>
                    </div>
                </Card>
            )}

            {/* Graph + inspector */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                <Card className="lg:col-span-2 p-0 overflow-hidden relative" style={{ height: 540 }}>
                    {loading ? (
                        <div className="absolute inset-0 flex items-center justify-center text-muted-foreground">
                            <Loader2 className="w-6 h-6 animate-spin mr-2" /> Loading graph…
                        </div>
                    ) : (
                        <>
                            <canvas
                                ref={canvasRef}
                                onWheel={onWheel} onMouseDown={onDown} onMouseMove={onMove} onMouseUp={onUp} onMouseLeave={() => (viewRef.current.dragging = false)}
                                className="w-full h-full cursor-grab active:cursor-grabbing"
                            />
                            <div className="absolute bottom-2 left-3 text-[11px] text-muted-foreground bg-background/70 px-2 py-1 rounded">
                                {visible.nodes.length} shown{data && visible.nodes.length >= MAX_VISIBLE ? ` (capped at ${MAX_VISIBLE} — refine search)` : ""} · scroll to zoom · drag to pan · click a node
                            </div>
                        </>
                    )}
                </Card>

                <Card className="p-4 overflow-auto" style={{ height: 540 }}>
                    {selectedNode ? (
                        <div className="space-y-3">
                            <div className="flex items-center gap-2">
                                <span className="inline-block w-3 h-3 rounded-full" style={{ background: colorFor(selectedNode) }} />
                                <h3 className="font-semibold text-foreground break-all">{selectedNode.label}</h3>
                            </div>
                            <div className="text-xs space-y-1 text-muted-foreground">
                                {selectedNode.kind && <div><b>Kind:</b> {selectedNode.kind}</div>}
                                {selectedNode.source_file && <div><b>File:</b> <span className="font-mono">{selectedNode.source_file}</span></div>}
                                {selectedNode.risk_level && <div><b>Risk:</b> {selectedNode.risk_level}</div>}
                                {selectedNode.region && <div><b>Region:</b> {selectedNode.region}</div>}
                                {selectedNode.url && <div><b>Authority:</b> <a className="text-gold underline" href={selectedNode.url} target="_blank" rel="noreferrer">{selectedNode.url}</a></div>}
                                {selectedNode.action_plan && <div className="pt-1"><b>Action plan:</b><p className="mt-1">{selectedNode.action_plan}</p></div>}
                            </div>
                            <div>
                                <div className="text-xs font-semibold text-foreground mb-1">Connections ({selectedNeighbors.length})</div>
                                <div className="space-y-1 max-h-64 overflow-auto">
                                    {selectedNeighbors.slice(0, 60).map((nb) => (
                                        <button key={nb.id} onClick={() => { setQuery(""); setSelected(nb.id); }}
                                            className="block w-full text-left text-xs px-2 py-1 rounded hover:bg-muted text-muted-foreground hover:text-foreground truncate">
                                            <span className="inline-block w-2 h-2 rounded-full mr-2" style={{ background: colorFor(nb) }} />
                                            {nb.label}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        </div>
                    ) : (
                        <div className="text-sm text-muted-foreground space-y-3">
                            <div className="flex items-center gap-2 text-foreground"><Eye className="w-4 h-4" /> Inspector</div>
                            <p>Click a node to inspect its details and connections. Use search to find any file, function, trade or scenario, then explore its neighbourhood.</p>
                            <div className="pt-2 space-y-1.5 text-xs">
                                <div className="flex items-center gap-2"><span className="w-3 h-3 rounded-full inline-block" style={{ background: "#D4AF37" }} /> Trade</div>
                                <div className="flex items-center gap-2"><span className="w-3 h-3 rounded-full inline-block" style={{ background: "#ef4444" }} /> Scenario</div>
                                <div className="flex items-center gap-2"><span className="w-3 h-3 rounded-full inline-block" style={{ background: "#3b82f6" }} /> Authority</div>
                                <div className="flex items-center gap-2"><span className="w-3 h-3 rounded-full inline-block" style={{ background: "#64748b" }} /> Code (file/symbol)</div>
                            </div>
                        </div>
                    )}
                </Card>
            </div>
        </div>
    );
}
