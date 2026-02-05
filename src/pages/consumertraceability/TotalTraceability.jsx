import React, { useMemo } from 'react';
import QRCode from 'react-qr-code';

const mockTrace = [
	{
		id: 1,
		time: '2026-01-28 08:12',
		actor: 'Fisherman: MV. Aegis',
		location: 'Coastal Zone - Port Alpha',
		event: 'Catch recorded - 120 kg\nSpecies: Yellowfin Tuna',
	},
	{
		id: 2,
		time: '2026-01-28 13:34',
		actor: 'Collector: Harbor Coop',
		location: 'Harbor Cold Store 3',
		event: 'Unload, cold-chain started (2°C)',
	},
	{
		id: 3,
		time: '2026-01-29 06:10',
		actor: 'Transporter: CoolTrans',
		location: 'In transit → Processing Plant',
		event: 'Temperature monitored: stable (2–4°C)',
	},
	{
		id: 4,
		time: '2026-01-29 11:45',
		actor: 'Processor: OceanFoods Ltd.',
		location: 'Processing Unit B',
		event: 'Processed & packed - Batch #OF-20260129-11',
	},
	{
		id: 5,
		time: '2026-01-30 09:05',
		actor: 'Distributor: FreshLink',
		location: 'Retail Hub - City Market',
		event: 'Received, quality check passed',
	},
];

export default function TotalTraceability() {
	const product = useMemo(
		() => ({
			name: 'Yellowfin Tuna (Thunnus albacares)',
			batch: 'OF-20260129-11',
			weight: '120 kg',
			harvestDate: '2026-01-28',
			origin: 'Port Alpha - Coastal Zone',
			qrPayload: 'rootverse://trace/OF-20260129-11',
		}),
		[]
	);

	return (
		<div className="min-h-screen bg-slate-900 text-white p-6 md:p-10">
			<header className="max-w-7xl mx-auto mb-6">
				<h1 className="text-2xl md:text-3xl font-extrabold">Total Traceability</h1>
				<p className="text-slate-300 mt-1">Trace the journey of a product from catch to consumer with full provenance data.</p>
			</header>

			<main className="max-w-7xl mx-auto grid grid-cols-1 gap-6 md:grid-cols-3">
				{/* Left: main timeline & events */}
				<section className="md:col-span-2 bg-slate-800/60 rounded-lg p-6 shadow-lg">
					<div className="flex items-center justify-between mb-4">
						<h2 className="text-lg font-semibold">Trace Timeline</h2>
						<div className="flex gap-2">
							<button className="bg-emerald-500 text-slate-900 px-3 py-1 rounded-full text-sm font-semibold">Export</button>
							<button className="bg-slate-700 hover:bg-slate-600 px-3 py-1 rounded-md text-sm">Refresh</button>
						</div>
					</div>

					<div className="space-y-6">
						{mockTrace.map((step, idx) => (
							<article key={step.id} className="flex gap-4 items-start">
								<div className="flex flex-col items-center">
									<div className="h-3 w-3 bg-emerald-400 rounded-full mt-1" />
									{idx !== mockTrace.length - 1 && <div className="w-px bg-slate-600 h-full mt-2" />}
								</div>

								<div className="flex-1">
									<div className="flex items-center justify-between">
										<div>
											<h3 className="text-base font-semibold">{step.actor}</h3>
											<div className="text-xs text-slate-400">{step.location}</div>
										</div>
										<div className="text-xs text-slate-400">{step.time}</div>
									</div>

									<p className="mt-2 text-slate-200 whitespace-pre-wrap">{step.event}</p>
								</div>
							</article>
						))}
					</div>

					<div className="mt-6">
						<h3 className="text-sm font-semibold text-slate-200 mb-2">Event Log</h3>
						<div className="overflow-auto max-h-48 bg-slate-900/50 rounded">
							<table className="min-w-full text-left text-sm">
								<thead className="sticky top-0 bg-slate-800/70">
									<tr className="text-slate-300">
										<th className="px-4 py-2">Time</th>
										<th className="px-4 py-2">Actor</th>
										<th className="px-4 py-2">Location</th>
										<th className="px-4 py-2">Event</th>
									</tr>
								</thead>
								<tbody>
									{mockTrace.map((r) => (
										<tr key={r.id} className="border-t border-slate-700">
											<td className="px-4 py-2 align-top text-slate-300">{r.time}</td>
											<td className="px-4 py-2 align-top">{r.actor}</td>
											<td className="px-4 py-2 align-top text-slate-300">{r.location}</td>
											<td className="px-4 py-2 align-top text-slate-200">{r.event}</td>
										</tr>
									))}
								</tbody>
							</table>
						</div>
					</div>
				</section>

				{/* Right: product summary + QR + KPIs */}
				<aside className="space-y-6">
					<div className="bg-slate-800/60 rounded-lg p-4 shadow-lg">
						<div className="flex items-start gap-4">
							<div className="flex-shrink-0">
								<div className="h-20 w-20 bg-gradient-to-br from-emerald-400 to-teal-400 rounded-lg shadow-inner flex items-center justify-center">
									<span className="text-slate-900 font-bold text-sm">IMG</span>
								</div>
							</div>

							<div className="flex-1">
								<h3 className="font-semibold text-lg">{product.name}</h3>
								<div className="text-slate-400 text-sm">Batch: <span className="text-slate-200 font-medium">{product.batch}</span></div>
								<div className="text-slate-400 text-sm">Harvest: <span className="text-slate-200">{product.harvestDate}</span></div>
								<div className="text-slate-400 text-sm">Origin: <span className="text-slate-200">{product.origin}</span></div>
							</div>
						</div>

						<div className="mt-4 flex items-center justify-between">
							<div className="text-sm text-slate-300">Weight</div>
							<div className="text-lg font-semibold text-white">{product.weight}</div>
						</div>
					</div>

					<div className="bg-slate-800/60 rounded-lg p-4 shadow-lg flex items-center justify-center">
						<div className="bg-white p-3 rounded">
							<QRCode value={product.qrPayload} size={128} />
						</div>
					</div>

					<div className="grid grid-cols-2 gap-3">
						<div className="bg-slate-800/60 rounded-lg p-3 text-center">
							<div className="text-xs text-slate-400">Handlers</div>
							<div className="text-xl font-bold">5</div>
						</div>
						<div className="bg-slate-800/60 rounded-lg p-3 text-center">
							<div className="text-xs text-slate-400">Chain Integrity</div>
							<div className="text-xl font-bold text-emerald-400">Good</div>
						</div>
					</div>

					<div className="bg-slate-800/60 rounded-lg p-3 text-sm text-slate-300">
						<div className="font-semibold text-slate-200 mb-2">Quick Actions</div>
						<button className="w-full bg-emerald-500 text-slate-900 py-2 rounded-md font-semibold mb-2">Verify Product</button>
						<button className="w-full border border-slate-700 py-2 rounded-md">View Certificate</button>
					</div>
				</aside>
			</main>
		</div>
	);
}
